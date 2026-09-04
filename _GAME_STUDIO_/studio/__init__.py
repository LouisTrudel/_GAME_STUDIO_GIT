"""
Game Studio - Multi-agent orchestration system.
"""

from .studio import Studio, StudioAgent, load_agent_role, load_agent_config, get_all_agent_names
from .core import hub, task_manager, heartbeat_manager
