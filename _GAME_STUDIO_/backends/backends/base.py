"""
Base backend interface.

T437: Added LLM-agnostic exponential backoff retry wrapper.
"""

import functools
import socket
import time
from abc import ABC, abstractmethod
from typing import Callable, TypeVar
from urllib.error import URLError

# Retryable exceptions - network/transient errors
RETRYABLE_EXCEPTIONS = (
    URLError,
    ConnectionResetError,
    socket.timeout,
    ConnectionRefusedError,
    ConnectionError,
    TimeoutError,
    OSError,  # Includes network-related OS errors
)

# Non-retryable HTTP status codes (auth errors, bad requests)
NON_RETRYABLE_STATUS_CODES = {400, 401, 403, 404}

# Retry configuration
MAX_RETRIES = 3
INITIAL_DELAY = 2  # seconds
BACKOFF_MULTIPLIER = 2  # 2s -> 4s -> 8s


T = TypeVar("T")


def with_retry(func: Callable[..., T]) -> Callable[..., T]:
    """Decorator for exponential backoff retry on transient failures.

    Retries for: URLError, ConnectionResetError, socket.timeout,
                 ConnectionRefusedError, ConnectionError, TimeoutError

    Does NOT retry for: Auth errors (401/403), Bad request (400), Not found (404)

    Backoff: 2s -> 4s -> 8s (3 attempts max)
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs) -> T:
        last_exception = None
        delay = INITIAL_DELAY

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                return func(*args, **kwargs)
            except RETRYABLE_EXCEPTIONS as e:
                last_exception = e
                if attempt < MAX_RETRIES:
                    print(f"[Retry] Attempt {attempt}/{MAX_RETRIES} failed: {type(e).__name__}: {e}")
                    print(f"[Retry] Waiting {delay}s before retry...")
                    time.sleep(delay)
                    delay *= BACKOFF_MULTIPLIER
                else:
                    print(f"[Retry] All {MAX_RETRIES} attempts failed")
            except Exception as e:
                # Check if it's an HTTP error with non-retryable status
                if _is_non_retryable_http_error(e):
                    raise
                # For other exceptions, treat as retryable
                last_exception = e
                if attempt < MAX_RETRIES:
                    print(f"[Retry] Attempt {attempt}/{MAX_RETRIES} failed: {type(e).__name__}: {e}")
                    print(f"[Retry] Waiting {delay}s before retry...")
                    time.sleep(delay)
                    delay *= BACKOFF_MULTIPLIER
                else:
                    print(f"[Retry] All {MAX_RETRIES} attempts failed")

        # All retries exhausted
        raise last_exception

    return wrapper


def _is_non_retryable_http_error(e: Exception) -> bool:
    """Check if exception represents a non-retryable HTTP error."""
    error_str = str(e).lower()

    # Check for common HTTP error patterns
    for status in NON_RETRYABLE_STATUS_CODES:
        if str(status) in error_str:
            return True

    # Check for auth-related keywords
    auth_keywords = ["unauthorized", "forbidden", "invalid api key", "authentication"]
    if any(keyword in error_str for keyword in auth_keywords):
        return True

    return False


class Backend(ABC):
    """Abstract base for LLM backends."""

    def __init__(self):
        # Token tracking - all backends should update these
        self.last_input_tokens = 0
        self.last_output_tokens = 0
        # Substep token log for granular tracking
        # Each entry: {"step": N, "type": str, "input_tokens": int, "output_tokens": int}
        self.token_log: list[dict] = []

    def _reset_token_tracking(self):
        """Reset token tracking for a new chat call."""
        self.last_input_tokens = 0
        self.last_output_tokens = 0
        self.token_log = []

    def _log_step(self, step_type: str, input_tokens: int, output_tokens: int):
        """Log a substep with token usage."""
        step_num = len(self.token_log) + 1
        self.token_log.append({
            "step": step_num,
            "type": step_type,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        })
        self.last_input_tokens += input_tokens
        self.last_output_tokens += output_tokens

    @abstractmethod
    def chat(
        self,
        messages: list[dict],
        system_prompt: str,
        max_tokens: int = 4096,
        tools: list[dict] = None,
        tool_handlers: dict = None,
    ) -> str:
        """Send messages and get a response."""
        pass

    def get_last_token_usage(self) -> dict:
        """Get token usage from the last chat call."""
        return {
            "total_input_tokens": self.last_input_tokens,
            "total_output_tokens": self.last_output_tokens,
            "token_log": self.token_log.copy(),
        }
