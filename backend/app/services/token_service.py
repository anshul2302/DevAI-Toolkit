import tiktoken

MODEL_PRICING = {
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
    "claude-3.5-sonnet": {"input": 3.00, "output": 15.00},
    "claude-3-haiku": {"input": 0.25, "output": 1.25},
    "gemini-1.5-pro": {"input": 1.25, "output": 5.00},
    "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
}

CONTEXT_WINDOWS = {
    "gpt-4o": 128000,
    "gpt-4o-mini": 128000,
    "gpt-4-turbo": 128000,
    "gpt-3.5-turbo": 16385,
    "claude-3.5-sonnet": 200000,
    "claude-3-haiku": 200000,
    "gemini-1.5-pro": 2000000,
    "gemini-1.5-flash": 1000000,
}

TIKTOKEN_MODEL_MAP = {
    "gpt-4o": "o200k_base",
    "gpt-4o-mini": "o200k_base",
    "gpt-4-turbo": "cl100k_base",
    "gpt-3.5-turbo": "cl100k_base",
    "claude-3.5-sonnet": "cl100k_base",
    "claude-3-haiku": "cl100k_base",
    "gemini-1.5-pro": "cl100k_base",
    "gemini-1.5-flash": "cl100k_base",
}


def count_tokens(text: str, model: str = "gpt-4o") -> int:
    encoding_name = TIKTOKEN_MODEL_MAP.get(model, "cl100k_base")
    enc = tiktoken.get_encoding(encoding_name)
    return len(enc.encode(text))


def estimate_cost(token_count: int, model: str, direction: str = "input") -> float:
    pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4o"])
    rate = pricing.get(direction, pricing["input"])
    return (token_count / 1_000_000) * rate


def analyze_text(text: str) -> dict:
    results = {}
    for model in MODEL_PRICING:
        tokens = count_tokens(text, model)
        context_window = CONTEXT_WINDOWS.get(model, 128000)
        results[model] = {
            "tokens": tokens,
            "input_cost": round(estimate_cost(tokens, model, "input"), 6),
            "output_cost": round(estimate_cost(tokens, model, "output"), 6),
            "context_window": context_window,
            "utilization_pct": round((tokens / context_window) * 100, 2),
        }
    return results


def optimize_context(text: str, target_tokens: int, model: str = "gpt-4o") -> dict:
    current_tokens = count_tokens(text, model)
    if current_tokens <= target_tokens:
        return {
            "original_tokens": current_tokens,
            "optimized_tokens": current_tokens,
            "optimized_text": text,
            "reduction_pct": 0,
            "suggestions": ["Text already fits within target token limit."],
        }

    suggestions = []
    optimized = text

    # Remove excessive whitespace
    import re
    optimized = re.sub(r"\n{3,}", "\n\n", optimized)
    optimized = re.sub(r"[ \t]+", " ", optimized)
    suggestions.append("Removed excessive whitespace")

    # Remove comments (common patterns)
    optimized = re.sub(r"//.*$", "", optimized, flags=re.MULTILINE)
    optimized = re.sub(r"#.*$", "", optimized, flags=re.MULTILINE)
    optimized = re.sub(r"/\*[\s\S]*?\*/", "", optimized)
    suggestions.append("Removed code comments")

    # Remove empty lines
    optimized = re.sub(r"\n\s*\n", "\n", optimized)
    suggestions.append("Collapsed empty lines")

    optimized_tokens = count_tokens(optimized, model)
    return {
        "original_tokens": current_tokens,
        "optimized_tokens": optimized_tokens,
        "optimized_text": optimized,
        "reduction_pct": round(((current_tokens - optimized_tokens) / current_tokens) * 100, 2),
        "suggestions": suggestions,
    }
