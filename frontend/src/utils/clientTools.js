import { marked } from 'marked';
import yaml from 'js-yaml';

// ─── HTML sanitizer — strip dangerous tags/attributes ────────────────
function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const dangerous = doc.querySelectorAll('script, iframe, object, embed, form, link[rel="import"]');
  dangerous.forEach((el) => el.remove());
  doc.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith('on') || attr.value.trim().toLowerCase().startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}

// ─── Markdown → HTML ─────────────────────────────────────────────────
export function markdownToHtml(md) {
  const rawHtml = marked.parse(md, { breaks: true, gfm: true });
  const html = sanitizeHtml(rawHtml);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }
  h1, h2, h3 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  pre code { background: none; color: inherit; padding: 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background: #f8f8f8; }
  blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
  ul, ol { padding-left: 1.5rem; }
  img { max-width: 100%; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}

// ─── Token Counter (GPT-style approximation: ~4 chars per token) ────
const MODEL_PRICING = {
  'gpt-4o':            { input: 2.50,  output: 10.00, context: 128000, encoding: 'o200k' },
  'gpt-4o-mini':       { input: 0.15,  output: 0.60,  context: 128000, encoding: 'o200k' },
  'gpt-4-turbo':       { input: 10.00, output: 30.00, context: 128000, encoding: 'cl100k' },
  'gpt-3.5-turbo':     { input: 0.50,  output: 1.50,  context: 16385,  encoding: 'cl100k' },
  'claude-3.5-sonnet': { input: 3.00,  output: 15.00, context: 200000, encoding: 'cl100k' },
  'claude-3-haiku':    { input: 0.25,  output: 1.25,  context: 200000, encoding: 'cl100k' },
  'gemini-1.5-pro':    { input: 1.25,  output: 5.00,  context: 2000000, encoding: 'cl100k' },
  'gemini-1.5-flash':  { input: 0.075, output: 0.30,  context: 1000000, encoding: 'cl100k' },
};

function estimateTokens(text) {
  // Rough approximation: split on whitespace and punctuation boundaries
  // Average English text: ~0.75 tokens per word, ~4 chars per token
  // This method blends both heuristics for better accuracy
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charEstimate = Math.ceil(text.length / 4);
  const wordEstimate = Math.ceil(wordCount * 1.3);
  return Math.round((charEstimate + wordEstimate) / 2);
}

export function analyzeTokens(text) {
  const results = {};
  for (const [model, info] of Object.entries(MODEL_PRICING)) {
    const tokens = estimateTokens(text);
    const inputCost = (tokens / 1_000_000) * info.input;
    const outputCost = (tokens / 1_000_000) * info.output;
    results[model] = {
      tokens,
      input_cost: parseFloat(inputCost.toFixed(6)),
      output_cost: parseFloat(outputCost.toFixed(6)),
      context_window: info.context,
      utilization_pct: parseFloat(((tokens / info.context) * 100).toFixed(2)),
    };
  }
  return { results, char_count: text.length, word_count: text.split(/\s+/).filter(Boolean).length };
}

// ─── Waste Detector ──────────────────────────────────────────────────
export function detectWaste(transcript) {
  const lines = transcript.trim().split('\n');
  const totalTokens = estimateTokens(transcript);
  const issues = [];
  let wasteTokens = 0;

  // Duplicates
  const seen = {};
  lines.forEach((line, i) => {
    const key = line.trim().toLowerCase();
    if (key.length < 5) return;
    if (seen[key] !== undefined) {
      const t = estimateTokens(line);
      wasteTokens += t;
      issues.push({
        type: 'duplicate', line: i + 1, original_line: seen[key] + 1,
        text: line.trim().slice(0, 100), wasted_tokens: t,
        suggestion: `Duplicate of line ${seen[key] + 1}`,
      });
    } else {
      seen[key] = i;
    }
  });

  // Filler patterns
  const fillerPatterns = [
    [/\b(please|kindly)\b.*\b(help|assist|provide)\b/i, 'Unnecessary polite filler'],
    [/\bthank you\b|\bthanks\b/i, 'Gratitude tokens (unnecessary for AI)'],
    [/\bsorry\b.*\b(but|if)\b/i, 'Apologetic filler'],
    [/\bI hope this (helps|makes sense)\b/i, 'Filler phrase'],
    [/\bAs an AI language model\b/i, 'AI self-reference'],
    [/\bsure,?\s*(I can|let me|here)\b/i, 'Verbose agreement prefix'],
    [/\bAbsolutely!?\s*/i, 'Unnecessary affirmation'],
  ];

  lines.forEach((line, i) => {
    for (const [pattern, desc] of fillerPatterns) {
      if (pattern.test(line)) {
        const t = estimateTokens(line);
        wasteTokens += t;
        issues.push({
          type: 'filler', line: i + 1, text: line.trim().slice(0, 100),
          wasted_tokens: t, suggestion: `${desc} — consider removing`,
        });
        break;
      }
    }
  });

  // Verbose lines
  lines.forEach((line, i) => {
    const t = estimateTokens(line);
    if (t > 200) {
      const waste = Math.max(0, t - 100);
      wasteTokens += waste;
      issues.push({
        type: 'verbose', line: i + 1, text: line.trim().slice(0, 100) + '...',
        wasted_tokens: waste, suggestion: 'Consider condensing this long passage',
      });
    }
  });

  // Repeated instructions
  const instructionKw = ['you are', 'your task is', 'you should', 'your role is'];
  const instrLines = [];
  lines.forEach((line, i) => {
    const lower = line.toLowerCase();
    if (instructionKw.some((kw) => lower.includes(kw))) instrLines.push(i);
  });
  if (instrLines.length > 1) {
    instrLines.slice(1).forEach((idx) => {
      const t = estimateTokens(lines[idx]);
      wasteTokens += t;
      issues.push({
        type: 'repeated_instruction', line: idx + 1, text: lines[idx].trim().slice(0, 100),
        wasted_tokens: t, suggestion: 'Instructions restated — consolidate into one block',
      });
    });
  }

  const efficiencyScore = Math.max(0, Math.round((1 - wasteTokens / Math.max(totalTokens, 1)) * 1000) / 10);

  return { total_tokens: totalTokens, waste_tokens: wasteTokens, efficiency_score: efficiencyScore, issue_count: issues.length, issues };
}

// ─── System Prompt Builder (generates 3 production-grade prompts) ────

const ROLE_KNOWLEDGE = {
  'product manager': {
    responsibilities: ['defining product vision and roadmap', 'writing epics and user stories with clear acceptance criteria', 'prioritizing backlogs using data-driven frameworks (RICE, MoSCoW, Kano)', 'stakeholder alignment and cross-functional communication', 'go-to-market strategy and competitive analysis'],
    defaultExpertise: ['product strategy', 'agile methodology', 'user research', 'stakeholder management'],
    behaviors: ['Always ground recommendations in user problems, business impact, and feasibility', 'Think in terms of outcomes (metrics moved) rather than outputs (features shipped)', 'Proactively identify risks, dependencies, and edge cases before they surface'],
  },
  'software engineer': {
    responsibilities: ['designing and implementing scalable, maintainable software systems', 'writing clean, well-tested, production-ready code', 'conducting thorough code reviews and architectural evaluations', 'debugging complex issues across the full stack'],
    defaultExpertise: ['software architecture', 'design patterns', 'testing strategies', 'performance optimization'],
    behaviors: ['Prioritize readability and maintainability over cleverness', 'Always consider edge cases, error handling, and security implications', 'Suggest incremental, backward-compatible changes when refactoring'],
  },
  'data scientist': {
    responsibilities: ['exploratory data analysis and statistical modeling', 'building and validating predictive models', 'translating business questions into analytical frameworks', 'communicating insights to non-technical stakeholders'],
    defaultExpertise: ['statistical analysis', 'machine learning', 'data visualization', 'experimental design'],
    behaviors: ['Always validate assumptions with data before making recommendations', 'Communicate uncertainty ranges alongside point estimates', 'Consider ethical implications and bias in datasets and models'],
  },
  'designer': {
    responsibilities: ['creating user-centered design solutions grounded in research', 'building design systems and reusable component libraries', 'conducting usability testing and iterating based on findings', 'translating business requirements into intuitive user experiences'],
    defaultExpertise: ['UX research', 'interaction design', 'visual design', 'design systems'],
    behaviors: ['Always advocate for the end user while balancing business constraints', 'Back design decisions with research, heuristics, or established patterns', 'Present alternatives with trade-off analysis, not single solutions'],
  },
};

function findRoleTemplate(role) {
  const lower = role.toLowerCase();
  for (const [key, val] of Object.entries(ROLE_KNOWLEDGE)) {
    if (lower.includes(key) || key.includes(lower)) return val;
  }
  return null;
}

const TONE_PROFILES = {
  professional: {
    voiceDirective: 'Communicate with clarity, precision, and executive-level professionalism. Use structured formatting (headers, bullets, numbered lists) to make responses scannable. Avoid filler words, hedging language, and unnecessary preamble.',
    antiPatterns: 'Never use phrases like "I think maybe", "perhaps we could", "it might be worth considering". Replace with decisive language: "The recommended approach is…", "Key considerations include…".',
  },
  casual: {
    voiceDirective: 'Use a warm, conversational tone that feels like advice from a trusted senior colleague. Be approachable but still substantive — friendly does not mean superficial.',
    antiPatterns: 'Avoid being overly formal or robotic, but do not sacrifice accuracy for friendliness.',
  },
  academic: {
    voiceDirective: 'Use precise, evidence-based language typical of peer-reviewed discourse. Cite frameworks, methodologies, and established theories where applicable. Distinguish between established knowledge and emerging perspectives.',
    antiPatterns: 'Avoid unsourced claims. When evidence is uncertain, explicitly state the confidence level and basis for the assertion.',
  },
  concise: {
    voiceDirective: 'Maximize signal-to-noise ratio. Lead with the answer or recommendation, then provide supporting detail only if necessary. Use tables, bullet points, and structured formats over prose. Every sentence must earn its place.',
    antiPatterns: 'Never pad responses with context the user already knows. Eliminate all throat-clearing sentences.',
  },
  teaching: {
    voiceDirective: 'Explain concepts progressively — start with intuition, then build to technical depth. Use concrete analogies and real-world examples. Anticipate follow-up questions and address them proactively.',
    antiPatterns: 'Never assume prior knowledge without checking. Avoid jargon without definition on first use.',
  },
};

export function buildSystemPrompts({ role, expertise, tone, constraints, outputFormat }) {
  const roleTemplate = findRoleTemplate(role);
  const allExpertise = expertise.length > 0 ? expertise : (roleTemplate?.defaultExpertise || []);
  const toneProfile = TONE_PROFILES[tone] || TONE_PROFILES.professional;

  const expertiseBlock = allExpertise.length
    ? `Your deep expertise spans: ${allExpertise.join(', ')}. You draw on this knowledge to provide authoritative, nuanced guidance that goes beyond surface-level answers.`
    : '';

  const responsibilitiesBlock = roleTemplate
    ? `\n\n## Core Responsibilities\n${roleTemplate.responsibilities.map((r) => `- ${r}`).join('\n')}`
    : '';

  const behaviorsBlock = roleTemplate
    ? `\n\n## Behavioral Guardrails\n${roleTemplate.behaviors.map((b) => `- ${b}`).join('\n')}`
    : '';

  const constraintBlock = constraints?.length
    ? `\n\n## Constraints\n${constraints.map((c) => `- ${c}`).join('\n')}`
    : '';

  const formatBlock = outputFormat
    ? `\n\n## Output Format\nAlways structure your responses as: ${outputFormat}`
    : '';

  // ── Variant 1: Comprehensive (best for complex, ongoing work) ──
  const v1 = [
    `# System Prompt — ${role}`,
    '',
    `## Identity & Expertise`,
    `You are a world-class ${role} with 15+ years of progressive experience across high-growth startups and Fortune 500 organizations. ${expertiseBlock}`,
    responsibilitiesBlock,
    '',
    `## Communication Style`,
    toneProfile.voiceDirective,
    '',
    toneProfile.antiPatterns,
    behaviorsBlock,
    '',
    `## Quality Standards`,
    `- Every response must be actionable — the user should be able to execute immediately after reading.`,
    `- When multiple approaches exist, present the recommended option first with clear reasoning, then briefly note alternatives with trade-offs.`,
    `- If the request is ambiguous or missing critical context, ask a maximum of 2-3 targeted clarifying questions before proceeding — do not guess blindly.`,
    `- When you don't know something, say so explicitly rather than fabricating an answer.`,
    constraintBlock,
    formatBlock,
  ].filter(Boolean).join('\n');

  // ── Variant 2: Focused operator (best for direct task execution) ──
  const v2 = [
    `You are an elite ${role} operating at the principal/staff level. ${expertiseBlock}`,
    '',
    toneProfile.voiceDirective,
    '',
    `Operating principles:`,
    `1. Lead with the answer, then explain. Never bury the recommendation.`,
    `2. Separate facts from opinions. Label assumptions explicitly.`,
    `3. When facing ambiguity, state your assumption and proceed — flag it so the user can correct course.`,
    `4. Provide production-ready outputs — no placeholders, no "TODO" markers, no hand-waving.`,
    `5. Anticipate the next question and address it proactively.`,
    roleTemplate ? `\nYour core focus areas:\n${roleTemplate.responsibilities.map((r) => `• ${r}`).join('\n')}` : '',
    constraintBlock ? `\nHard constraints:${constraintBlock}` : '',
    formatBlock || '',
  ].filter(Boolean).join('\n');

  // ── Variant 3: Minimal but potent (best for quick interactions) ──
  const v3Lines = [
    `You are a senior ${role}. ${allExpertise.length ? `Specialist in ${allExpertise.join(', ')}.` : ''}`,
    '',
    `Rules:`,
    `- ${toneProfile.voiceDirective.split('.')[0]}.`,
    `- Be decisive. Recommend one best approach, note alternatives only when trade-offs are material.`,
    `- If requirements are unclear, make a reasonable assumption, state it, and continue.`,
    `- Output must be immediately usable — no filler, no hedging, no boilerplate disclaimers.`,
  ];
  if (roleTemplate) {
    v3Lines.push(`- ${roleTemplate.behaviors[0]}`);
  }
  if (constraints?.length) {
    constraints.forEach((c) => v3Lines.push(`- Constraint: ${c}`));
  }
  if (outputFormat) {
    v3Lines.push(`- Format: ${outputFormat}`);
  }
  const v3 = v3Lines.join('\n');

  return [
    { label: 'Comprehensive', description: 'Full-depth prompt — ideal for complex, ongoing work sessions', prompt: v1 },
    { label: 'Focused Operator', description: 'Direct and task-oriented — ideal for execution-heavy workflows', prompt: v2 },
    { label: 'Minimal & Potent', description: 'Compact but powerful — ideal for quick interactions', prompt: v3 },
  ];
}

// ─── JSON/YAML Formatter ─────────────────────────────────────────────
export function formatData(content, fromFormat, toFormat) {
  let data;
  if (fromFormat === 'json') {
    data = JSON.parse(content);
  } else if (fromFormat === 'yaml') {
    data = yaml.load(content);
  } else {
    throw new Error(`Unsupported input format: ${fromFormat}`);
  }

  if (toFormat === 'json') {
    return JSON.stringify(data, null, 2);
  } else if (toFormat === 'yaml') {
    return yaml.dump(data, { noRefs: true, lineWidth: -1 });
  } else {
    throw new Error(`Unsupported output format: ${toFormat}`);
  }
}
