"""
Research agent tools - web search and documentation capabilities.
Research is a worker that investigates topics and produces reports.
"""


# Tool bundle (Research uses base employee tools + file tools loaded by Studio)
# No additional research-specific tools needed - web search comes from Claude CLI
TOOLS = []
HANDLERS = {}
