"""
Logging configuration for the Studio application.

T373: Provides centralized logging with console and rotating file handlers.
Replaces scattered print() calls with proper logging levels.

Usage:
    from studio.core.logging_config import get_logger
    logger = get_logger("Tasks")
    logger.info("Loaded 5 tasks")
    logger.error("Failed to save: %s", e)
"""

import logging
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional

from studio.core.paths import DATA_DIR


# Log directory
LOG_DIR = DATA_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)


class BracketFormatter(logging.Formatter):
    """Formatter that preserves existing bracket notation style.

    Produces output like: [Tasks] Loaded 5 tasks
    With timestamps for file output: 2024-01-15 10:30:45 [Tasks] INFO: Loaded 5 tasks
    """

    def __init__(self, include_timestamp: bool = False, include_level: bool = False):
        super().__init__()
        self.include_timestamp = include_timestamp
        self.include_level = include_level

    def format(self, record: logging.LogRecord) -> str:
        # Use logger name as bracket prefix (e.g., "Tasks" -> "[Tasks]")
        prefix = f"[{record.name}]"

        # Build message parts
        parts = []
        if self.include_timestamp:
            parts.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        parts.append(prefix)
        if self.include_level:
            parts.append(f"{record.levelname}:")
        parts.append(record.getMessage())

        return " ".join(parts)


# Global configuration state
_configured = False
_loggers: dict[str, logging.Logger] = {}


def configure_logging(
    console_level: int = logging.INFO,
    file_level: int = logging.DEBUG,
    log_file: Optional[str] = None
) -> None:
    """Configure the logging system.

    Args:
        console_level: Minimum level for console output (default INFO)
        file_level: Minimum level for file output (default DEBUG)
        log_file: Custom log file name (default: studio_YYYY-MM-DD.log)
    """
    global _configured
    if _configured:
        return

    # Create root logger for studio
    root_logger = logging.getLogger("studio")
    root_logger.setLevel(logging.DEBUG)  # Capture all, handlers filter

    # Console handler - no timestamp, no level prefix (matches current print style)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(console_level)
    console_handler.setFormatter(BracketFormatter(include_timestamp=False, include_level=False))
    root_logger.addHandler(console_handler)

    # Rotating file handler - with timestamp and level
    if log_file is None:
        log_file = f"studio_{datetime.now().strftime('%Y-%m-%d')}.log"

    file_path = LOG_DIR / log_file
    file_handler = RotatingFileHandler(
        file_path,
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setLevel(file_level)
    file_handler.setFormatter(BracketFormatter(include_timestamp=True, include_level=True))
    root_logger.addHandler(file_handler)

    _configured = True


def get_logger(name: str) -> logging.Logger:
    """Get a logger with the given name.

    Args:
        name: Logger name, used as bracket prefix (e.g., "Tasks" -> "[Tasks]")

    Returns:
        Configured logger instance

    Example:
        logger = get_logger("Tasks")
        logger.info("Loaded %d tasks", count)  # -> [Tasks] Loaded 5 tasks
    """
    # Ensure logging is configured
    if not _configured:
        configure_logging()

    # Return cached logger or create new one
    if name not in _loggers:
        # Create as child of studio logger to inherit handlers
        logger = logging.getLogger(f"studio.{name}")
        # Override name for formatting (strip "studio." prefix)
        logger.name = name
        _loggers[name] = logger

    return _loggers[name]


def set_console_level(level: int) -> None:
    """Change console logging level at runtime.

    Args:
        level: logging.DEBUG, logging.INFO, logging.WARNING, or logging.ERROR
    """
    root_logger = logging.getLogger("studio")
    for handler in root_logger.handlers:
        if isinstance(handler, logging.StreamHandler) and not isinstance(handler, RotatingFileHandler):
            handler.setLevel(level)
