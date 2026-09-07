"""
Minimal Gemini research agent - raw prompt to report.
Uses Google Search grounding for web research.

Usage:
    python -m studio.gemini_research "Your research topic"
    python -m studio.gemini_research "game monetization trends" --category game-design
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path


# Project root
ROOT = Path(__file__).parent.parent


def gemini_research(topic: str, category: str = "research") -> dict:
    """
    Run Gemini with Google Search grounding on a topic.
    Returns dict with 'content', 'sources', 'queries'.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")

    model = "gemini-3.6-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    system_prompt = """You are a research analyst. Given a topic, produce a comprehensive report.

Format your response as:

# [Topic] Research

## Summary
[2-3 sentences: key findings and insights]

## Key Findings
| Finding | Evidence | Implication |
|---------|----------|-------------|
| [What] | [Source/data] | [So what] |

## Analysis
[Detailed analysis with specific data points and trends]

## Recommendations
| Priority | Action | Rationale |
|----------|--------|-----------|
| 1 | [Do this] | [Why] |

## Sources
[List sources used]

Be specific. Include numbers, dates, and concrete examples from your search."""

    payload = {
        "contents": [{"role": "user", "parts": [{"text": f"Research this topic thoroughly: {topic}"}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {"maxOutputTokens": 8192},
        "tools": [{"google_search": {}}],
    }

    # Make request with retry for rate limits
    max_retries = 3
    for attempt in range(max_retries):
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=120) as response:
                result = json.loads(response.read().decode("utf-8"))
                break
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            if e.code == 429 and attempt < max_retries - 1:
                wait_time = 15 * (attempt + 1)
                print(f"[Gemini Research] Rate limited, waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
            raise RuntimeError(f"Gemini API error {e.code}: {error_body}")

    # Extract response
    candidates = result.get("candidates", [])
    if not candidates:
        raise RuntimeError("No response from Gemini")

    content = candidates[0].get("content", {})
    parts = content.get("parts", [])
    text = "".join(p.get("text", "") for p in parts if "text" in p)

    # Extract grounding metadata
    grounding = candidates[0].get("groundingMetadata", {})
    queries = grounding.get("webSearchQueries", [])
    chunks = grounding.get("groundingChunks", [])
    sources = [{"uri": c.get("web", {}).get("uri"), "title": c.get("web", {}).get("title")} for c in chunks]

    return {"content": text, "sources": sources, "queries": queries}


def check_health() -> dict:
    """
    Test Gemini backend health with a minimal request.
    Returns dict with 'ok', 'model', 'error'.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"ok": False, "model": None, "error": "GEMINI_API_KEY not set"}

    model = "gemini-3.6-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    payload = {
        "contents": [{"role": "user", "parts": [{"text": "Say 'OK' if you can hear me."}]}],
        "generationConfig": {"maxOutputTokens": 10},
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
            return {"ok": True, "model": model, "error": None}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        return {"ok": False, "model": model, "error": f"HTTP {e.code}: {error_body[:200]}"}
    except Exception as e:
        return {"ok": False, "model": model, "error": str(e)}


def save_report(topic: str, result: dict, category: str = "research") -> Path:
    """Save research report to reports/{category}/"""
    reports_dir = ROOT / "reports" / category
    reports_dir.mkdir(parents=True, exist_ok=True)

    # Generate filename from topic
    slug = topic.lower().replace(" ", "_")[:40]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{slug}_{timestamp}.md"

    # Build report content
    content = result["content"]

    # Append source links if grounding found any
    if result["sources"]:
        content += "\n\n---\n*Grounded Sources:*\n"
        for src in result["sources"]:
            if src["uri"] and src["title"]:
                content += f"- [{src['title']}]({src['uri']})\n"

    if result["queries"]:
        content += f"\n*Search queries used:* {', '.join(result['queries'])}\n"

    filepath = reports_dir / filename
    filepath.write_text(content, encoding="utf-8")
    return filepath


def run(topic: str, category: str = "research") -> Path:
    """Run research and save report. Returns filepath."""
    print(f"[Gemini Research] Topic: {topic}")
    print(f"[Gemini Research] Querying with Google Search grounding...")

    result = gemini_research(topic, category)

    print(f"[Gemini Research] Got {len(result['content'])} chars, {len(result['sources'])} sources")

    filepath = save_report(topic, result, category)
    print(f"[Gemini Research] Saved: {filepath}")

    return filepath


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m studio.gemini_research 'topic' [--category game-design]")
        sys.exit(1)

    topic = sys.argv[1]
    category = "research"

    if "--category" in sys.argv:
        idx = sys.argv.index("--category")
        if idx + 1 < len(sys.argv):
            category = sys.argv[idx + 1]

    filepath = run(topic, category)
    print(f"\nReport saved to: {filepath}")
