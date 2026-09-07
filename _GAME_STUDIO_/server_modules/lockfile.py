"""
Server lock file for single-instance detection.

Pattern: Lock file with PID — chosen over port-only check because:
1. Port check fails silently if another process binds first
2. Lock file survives crash detection via stale PID check
3. Provides clear error message before uvicorn startup
"""

import os
import sys
import socket
from pathlib import Path

LOCK_FILE = Path(__file__).parent.parent / "data" / ".server.lock"


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Check if port is already bound."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((host, port))
            return False
        except OSError:
            return True


def is_process_running(pid: int) -> bool:
    """Check if a process with given PID is running."""
    if sys.platform == "win32":
        # Windows: use tasklist
        import subprocess
        try:
            result = subprocess.run(
                ["tasklist", "/FI", f"PID eq {pid}"],
                capture_output=True,
                text=True
            )
            return str(pid) in result.stdout
        except Exception:
            return False
    else:
        # Unix: check /proc or use kill(0)
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False


def acquire_lock(port: int = 8000) -> bool:
    """
    Attempt to acquire server lock. Returns True if successful.

    Checks:
    1. Port availability (fast fail)
    2. Lock file existence + PID validity (stale cleanup)
    """
    # Check 1: Port binding
    if is_port_in_use(port):
        print("=" * 50)
        print("  ERROR: Server already running!")
        print("=" * 50)
        print(f"Port {port} is already in use.")
        print("Another server instance may be running.")
        print("Close the existing server or use a different port.")
        print("=" * 50)
        return False

    # Check 2: Lock file
    if LOCK_FILE.exists():
        try:
            old_pid = int(LOCK_FILE.read_text().strip())
            if is_process_running(old_pid):
                print("=" * 50)
                print("  ERROR: Server already running!")
                print("=" * 50)
                print(f"Lock file exists with active PID: {old_pid}")
                print("Another server instance is running.")
                print("=" * 50)
                return False
            else:
                # Stale lock file from crashed process
                print(f"Cleaning up stale lock file (PID {old_pid} not running)")
                LOCK_FILE.unlink()
        except (ValueError, OSError) as e:
            # Corrupted lock file, clean up
            print(f"Cleaning up corrupted lock file: {e}")
            LOCK_FILE.unlink()

    # Create lock file with current PID
    LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
    LOCK_FILE.write_text(str(os.getpid()))
    return True


def release_lock():
    """Remove lock file on clean shutdown."""
    try:
        if LOCK_FILE.exists():
            LOCK_FILE.unlink()
    except OSError:
        pass  # Best effort cleanup
