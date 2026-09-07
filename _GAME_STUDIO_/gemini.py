#!/usr/bin/env python3
"""
Standalone Gemini CLI - minimal prompt-to-response.

Usage:
    python gemini.py "your prompt here"
    python gemini.py "what is 2+2" --model gemini-3.5-flash-lite
    python gemini.py --health

No agent overhead, no memory, no roles. Just raw LLM.
Leverages free Gemini tier for quick one-shot queries.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

# Load .env if present
ENV_FILE = Path(__file__).parent / ".env"
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"\''))


def query(prompt: str, model: str = "gemini-3.5-flash-lite", max_tokens: int = 4096, max_retries: int = 3, status_callback=None) -> str:
    """Send prompt to Gemini, return response text. Retries on rate limit with exponential backoff.

    Args:
        prompt: The prompt to send
        model: Gemini model to use
        max_tokens: Maximum output tokens
        max_retries: Number of retries on rate limit
        status_callback: Optional callback(message: str) for status updates during retries
    """
    import time as _time

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set. Add to .env or environment.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": max_tokens},
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    last_error = None
    retry_count = 0
    for attempt in range(max_retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode("utf-8"))

            candidates = result.get("candidates", [])
            if not candidates:
                raise RuntimeError("No response from Gemini")

            parts = candidates[0].get("content", {}).get("parts", [])
            response_text = "".join(p.get("text", "") for p in parts if "text" in p)

            # Prepend retry indicator if there were retries
            if retry_count > 0:
                response_text = f"[⏳ Completed after {retry_count} rate limit retry{'ies' if retry_count > 1 else ''}]\n\n{response_text}"

            return response_text

        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            if e.code == 429:
                last_error = RuntimeError("Rate limited")
                if attempt < max_retries:
                    retry_count += 1
                    wait = 2 ** attempt * 30  # 30s, 60s, 120s
                    status_msg = f"[Gemini] Rate limited. Retry {attempt + 1}/{max_retries} in {wait}s..."
                    print(status_msg)
                    if status_callback:
                        status_callback(status_msg)
                    _time.sleep(wait)
                    continue
                raise RuntimeError(f"Rate limited after {max_retries} retries. Try again later.")
            if e.code == 400:
                raise RuntimeError(f"Bad request: {error_body[:200]}")
            if e.code == 403:
                raise RuntimeError("API key invalid or quota exceeded.")
            raise RuntimeError(f"API error {e.code}: {error_body[:200]}")
        except urllib.error.URLError as e:
            raise RuntimeError(f"Connection failed: {e}")

    raise last_error or RuntimeError("Max retries exceeded")


def health_check(model: str = "gemini-3.5-flash-lite") -> bool:
    """Test API connectivity."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("FAIL: GEMINI_API_KEY not set")
        return False

    try:
        response = query("Say OK", model=model, max_tokens=10)
        print(f"OK: {model} responding")
        return True
    except Exception as e:
        print(f"FAIL: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    # Parse args
    args = sys.argv[1:]
    model = "gemini-3.5-flash-lite"

    # Check for --health flag
    if "--health" in args:
        sys.exit(0 if health_check() else 1)

    # Check for --model flag
    if "--model" in args:
        idx = args.index("--model")
        if idx + 1 < len(args):
            model = args[idx + 1]
            args = args[:idx] + args[idx + 2:]

    if not args:
        print("Error: No prompt provided")
        sys.exit(1)

    prompt = args[0]

    try:
        response = query(prompt, model=model)
        print(response)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
