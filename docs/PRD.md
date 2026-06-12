# DevAI Toolkit — Product Requirements Document (PRD)

**Author:** Anshul Nema  
**Version:** 1.0  
**Date:** June 2026 
**Status:** Live — [devai-toolkit.vercel.app](https://devai-toolkit.vercel.app)  
**Repository:** [github.com/anshul2302/DevAI-Toolkit](https://github.com/anshul2302/DevAI-Toolkit)

---

## 1. Executive Summary

**DevAI Toolkit** is a web-based developer productivity suite designed to solve the everyday friction developers face when working with AI coding assistants like ChatGPT, Claude, and Gemini.

The core insight: developers spend **30-40% of their AI interaction time** on formatting, token management, prompt engineering, and data conversion — tasks that are repetitive, mechanical, and solvable. DevAI Toolkit eliminates this overhead with a focused set of tools that run primarily in the browser, requiring no accounts, no API keys, and no data leaving the user's machine.

---

## 2. Problem Statement

### The Pain Points

As AI assistants become central to development workflows, developers face recurring friction:

| Problem | Impact |
|---------|--------|
| **Format mismatch** | Documentation is in Word/TXT but AI expects Markdown. Output is HTML but needs to be shared as a file. Developers waste time manually converting between formats. |
| **Token blindness** | Developers hit context window limits mid-conversation, losing context. They don't know how many tokens a prompt costs before sending it. API costs are unpredictable. |
| **Prompt inefficiency** | Most developers write ad-hoc prompts that are 2-3x longer than necessary. Repeated instructions, filler words, and unstructured inputs waste tokens and degrade AI output quality. |
| **No reusability** | Good prompts are written once, used once, and forgotten. System prompts are copy-pasted from blog posts without understanding structure. |
| **Context preparation** | Sharing project structure or code context with AI requires manual tree generation and file concatenation. |

### Who Feels This Pain?

- **Individual developers** using AI assistants daily
- **Development teams** standardizing AI workflows
- **Technical leads** optimizing AI tool costs across a team
- **AI enthusiasts** learning prompt engineering

---

## 3. Product Vision

> **One toolkit to remove all friction between developers and AI assistants.**

DevAI Toolkit is not an AI — it's the **bridge** between the developer and AI. It doesn't generate code or answer questions. It ensures that every interaction a developer has with an AI tool is as efficient, well-structured, and cost-effective as possible.

### Design Principles

1. **Privacy-first**: All tools run client-side in the browser. No data is sent to external servers. No accounts required.
2. **Zero friction**: No signup, no API keys, no installation. Open the URL and start using it.
3. **Developer-native**: Dark theme, keyboard shortcuts, copy-to-clipboard, and file download — designed for how developers actually work.
4. **Offline-capable**: 7 of 8 tools work entirely without a network connection (client-side JavaScript).

---

## 4. Feature Specification

### 4.1 Doc → Markdown Converter

**Problem it solves:** Documentation lives in Word docs and text files, but AI assistants expect Markdown input.

**What it does:**
- Upload `.docx`, `.txt`, `.csv`, or `.log` files
- Converts to clean, well-structured Markdown
- Download the output as a `.md` file or copy to clipboard

**Technical approach:**
- `.txt/.csv/.log` → parsed client-side using JavaScript `File.text()` API
- `.docx` → processed server-side using Python `python-docx` library via FastAPI endpoint

**Why this matters:** Developers frequently need to feed existing documentation into AI assistants. Manual conversion is error-prone and time-consuming.

---

### 4.2 Markdown → HTML Converter

**Problem it solves:** AI assistants output Markdown, but developers often need styled HTML for documentation, emails, or reports.

**What it does:**
- Paste Markdown or upload a `.md/.txt` file
- Converts to fully styled HTML with a professional stylesheet
- Live preview with split-pane view (Preview / HTML Code)
- Download as `.html` file or copy raw HTML

**Technical approach:**
- Uses the `marked` library for Markdown parsing (client-side)
- Custom HTML sanitizer strips XSS vectors (`<script>`, `<iframe>`, `on*` handlers)
- Preview renders in a sandboxed `<iframe>` with `sandbox=""` attribute

**Security considerations:**
- DOMParser-based sanitization before rendering
- Sandboxed iframe prevents script execution in preview

---

### 4.3 Token Counter & Cost Estimator

**Problem it solves:** Developers don't know how many tokens their prompts consume or how much API calls cost until after they send them.

**What it does:**
- Paste any text and get instant token counts
- Shows estimates for GPT-4o, Claude 3.5, and Gemini Pro
- Calculates cost per request based on current API pricing
- Breaks down character count, word count, and line count

**Technical approach:**
- Client-side heuristic: approximately 4 characters per token (industry-standard approximation)
- Cost calculations based on published per-token pricing from OpenAI, Anthropic, and Google

**Why this matters:** Token awareness prevents mid-conversation context window exhaustion and helps developers budget API costs.

---

### 4.4 Transcript Waste Detector

**Problem it solves:** AI conversations accumulate waste — repeated instructions, filler phrases, verbose outputs — that consume tokens without adding value.

**What it does:**
- Paste an AI conversation transcript
- Analyzes for waste patterns: filler phrases, repeated instructions, excessive politeness, redundant context
- Returns an efficiency score (0-100%), waste token count, and specific issue list with line numbers
- Each issue includes a suggestion for improvement

**Technical approach:**
- Pattern-matching engine scans for known waste indicators
- Regex-based detection of filler phrases (`"I'd be happy to"`, `"Sure, let me"`, `"As I mentioned"`)
- Duplicate instruction detection via line similarity analysis

**Why this matters:** A typical 10-turn conversation wastes 15-30% of tokens on filler. Over hundreds of interactions, this adds up to significant cost and degraded output quality.

---

### 4.5 Prompt Template Library

**Problem it solves:** Developers write effective prompts and then lose them. There's no lightweight way to save, organize, and reuse prompt templates.

**What it does:**
- Create, edit, and delete prompt templates
- Organize by category (coding, writing, analysis, etc.)
- Define template variables for reusability
- Copy templates to clipboard with one click

**Technical approach:**
- Stored in browser `localStorage` — no backend needed, no account required
- CRUD operations are instant with zero latency
- Data persists across sessions on the same browser

**Why this matters:** The best prompt engineers build libraries of proven prompts. This tool makes that effortless.

---

### 4.6 File Tree Generator

**Problem it solves:** When asking AI for help with a project, developers need to share project structure. Manually creating directory trees is tedious.

**What it does:**
- Paste a list of file paths (from `find`, `ls -R`, or file explorer)
- Generates a formatted ASCII directory tree
- Customizable root name
- Copy output for direct use in AI prompts

**Technical approach:**
- Client-side tree builder using nested object construction
- Renders with proper `├──`, `└──`, and `│` characters

---

### 4.7 System Prompt Builder

**Problem it solves:** Most developers write weak system prompts that produce generic AI outputs. Crafting a production-grade system prompt requires expertise in prompt engineering.

**What it does:**
- Input: role, expertise areas, tone, constraints, output format
- Generates **3 production-grade prompt variants:**
  1. **Comprehensive** — full-depth with identity, responsibilities, behavioral guardrails, and quality standards
  2. **Focused Operator** — direct, execution-oriented with 5 operating principles
  3. **Minimal & Potent** — compact but powerful for quick interactions
- Each variant includes Copy and Download (.md) buttons
- Smart defaults: leaving expertise empty auto-fills based on recognized roles

**Technical approach:**
- Role knowledge database with built-in templates for Product Manager, Software Engineer, Data Scientist, Designer
- Tone profiles with voice directives and anti-pattern rules
- Template engine assembles structured prompts from components

**Why this matters:** The difference between a mediocre and an excellent system prompt is the difference between a junior intern and a senior expert. This tool bridges that gap instantly.

---

### 4.8 JSON / YAML Formatter

**Problem it solves:** Developers frequently need to format, validate, or convert between JSON and YAML — especially when configuring AI tools or APIs.

**What it does:**
- Paste JSON or YAML content
- Format/prettify in the same format
- Convert between JSON ↔ YAML
- Syntax validation with clear error messages

**Technical approach:**
- JSON parsing via native `JSON.parse/stringify`
- YAML parsing via `js-yaml` library
- All processing client-side

---

## 5. Architecture & Technical Decisions

### Why Client-Side First?

The single most important architectural decision: **run everything in the browser unless impossible.**

| Decision | Rationale |
|----------|-----------|
| Client-side processing | Privacy — no user data leaves the browser. Zero latency. Works offline. |
| No authentication | Friction kills adoption. For a utility tool, accounts add no value. |
| Backend only for `.docx` | Binary file parsing requires Python libraries not available in browsers. |
| localStorage for templates | Simple, persistent, no database needed for personal-use data. |

### Tech Stack Choices

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + Vite | Fast build times, HMR, modern React patterns |
| **Styling** | TailwindCSS | Utility-first CSS for rapid UI development, consistent design |
| **Icons** | Lucide React | Lightweight, consistent icon set |
| **Routing** | React Router v6 | Standard SPA routing |
| **HTTP Client** | Axios | Interceptors, error handling, cleaner than fetch |
| **Backend** | FastAPI (Python) | Async, auto-generated docs, type safety |
| **ORM** | SQLAlchemy | Industry standard, migration support |
| **Deployment** | Vercel (FE) + Render (BE) | Free tier, GitHub integration, auto-deploys |

### Security Posture

| Layer | Protection |
|-------|-----------|
| HTML sanitization | DOMParser strips `<script>`, `<iframe>`, `<object>`, `on*` handlers |
| Sandboxed preview | `<iframe sandbox="">` blocks all script execution |
| CORS | Strict origin allowlist — only the deployed frontend URL |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` |
| No external calls | All tools process data locally. Zero third-party API calls. |

---

## 6. Deployment Architecture

```
┌─────────────────────────────┐
│      User's Browser         │
│  ┌───────────────────────┐  │
│  │   React Frontend      │  │
│  │   (Vercel CDN)        │  │
│  │                       │  │
│  │  7 tools run HERE     │  │
│  │  (client-side JS)     │  │
│  └───────────┬───────────┘  │
└──────────────┼──────────────┘
               │ Only .docx conversion
               ▼
┌─────────────────────────────┐
│   FastAPI Backend           │
│   (Render Free Tier)        │
│                             │
│   /api/convert/doc-to-md    │
│   /api/health               │
└─────────────────────────────┘
```

---

## 7. Success Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| Tools usable without backend | 7 of 8 | Architecture validation |
| Time to first interaction | < 2 seconds | Page load to tool usage |
| Zero external data transmission | 100% for client-side tools | Network tab verification |
| System prompt quality | 3 production-grade variants per generation | Manual review |

---

## 8. Future Roadmap

| Priority | Feature | Description |
|----------|---------|-------------|
| P1 | **Feedback widget** | In-app feedback collection to gather user insights |
| P1 | **Codebase Context Packer** | Pack multiple code files into a single optimized prompt |
| P2 | **Context Window Optimizer** | Compress text to fit within specific token limits |
| P2 | **Prompt A/B Tester** | Compare two prompt variants side-by-side |
| P3 | **Team sharing** | Share prompt templates across a team via shareable links |
| P3 | **Browser extension** | Quick access to tools from any webpage |

---

## 9. What I Learned Building This

### Technical Growth
- **Client-side architecture thinking**: Designing for privacy-first by running maximum logic in the browser
- **Full-stack deployment**: Vercel + Render split deployment with CORS and environment-based configuration
- **Security hardening**: CSP headers, HTML sanitization, sandboxed iframes, localhost-only middleware

### Product Thinking
- **Problem-first design**: Every tool exists because of a specific, recurring pain point I experienced
- **Progressive enhancement**: The app works without a backend for 7/8 tools — the backend is an enhancement, not a dependency
- **Zero-friction onboarding**: No signup, no API keys, no installation. The fastest path from "I need this" to "I'm using this"

### Why I Built This
As a developer who uses AI assistants daily, I kept hitting the same friction points: format conversion, token management, prompt quality. Instead of accepting these as inevitable, I built the toolkit I wished existed. Every feature in DevAI Toolkit is something I use in my own workflow.

---

*Built with intention by Anshul Nema — because the best tools are the ones that get out of your way.*
