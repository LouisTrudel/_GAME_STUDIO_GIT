"""
Gemini Research Routine - Runs every 30 minutes.

1. Tests Gemini backend health
2. Runs a research query on a rotating game dev topic
3. Saves report to reports/

Self-contained and resilient to failures.
"""

import sys
from pathlib import Path
from datetime import datetime

# Add project root to path
ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT))

from studio.gemini_research import check_health, run as run_research


# Rotating research topics for game development
RESEARCH_TOPICS = [
    "indie game marketing strategies 2026",
    "game monetization trends free-to-play",
    "Roblox platform updates and developer opportunities",
    "Unity vs Unreal Engine comparison 2026",
    "game jam best practices and post-jam development",
    "player retention mechanics in mobile games",
    "procedural generation techniques in games",
    "game accessibility features and implementation",
    "live service game content update strategies",
    "game community building and Discord management",
    "roguelike design patterns and balancing",
    "game localization best practices",
]


def get_next_topic() -> str:
    """Get next topic based on current time (rotates through list)."""
    # Use hour + minute to pick topic (changes every 30 min)
    now = datetime.now()
    index = (now.hour * 2 + (1 if now.minute >= 30 else 0)) % len(RESEARCH_TOPICS)
    return RESEARCH_TOPICS[index]


def run_routine() -> dict:
    """
    Execute the full routine.
    Returns dict with status, details, and any errors.
    """
    result = {
        "timestamp": datetime.now().isoformat(),
        "health_check": None,
        "research": None,
        "report_path": None,
        "error": None,
    }

    # Step 1: Health check
    print("[Routine] Step 1: Checking Gemini health...")
    health = check_health()
    result["health_check"] = health

    if not health["ok"]:
        result["error"] = f"Health check failed: {health['error']}"
        print(f"[Routine] FAILED: {result['error']}")
        return result

    print(f"[Routine] Health OK (model: {health['model']})")

    # Step 2: Get topic and run research
    topic = get_next_topic()
    print(f"[Routine] Step 2: Researching '{topic}'...")

    try:
        report_path = run_research(topic, category="research")
        result["research"] = {"topic": topic, "success": True}
        result["report_path"] = str(report_path)
        print(f"[Routine] SUCCESS: Report saved to {report_path}")
    except Exception as e:
        result["research"] = {"topic": topic, "success": False}
        result["error"] = f"Research failed: {str(e)}"
        print(f"[Routine] FAILED: {result['error']}")
        return result

    return result


if __name__ == "__main__":
    print("=" * 60)
    print("GEMINI RESEARCH ROUTINE")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 60)

    result = run_routine()

    print("\n" + "=" * 60)
    if result["error"]:
        print(f"ROUTINE FAILED: {result['error']}")
        sys.exit(1)
    else:
        print(f"ROUTINE COMPLETED")
        print(f"Report: {result['report_path']}")
        sys.exit(0)
