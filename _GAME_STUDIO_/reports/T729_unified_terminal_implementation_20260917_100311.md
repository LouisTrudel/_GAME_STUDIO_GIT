# T729: Unified Terminal Implementation

## Changes Made

### 1. HTML Structure (studio.html)
- Removed multi-tab terminal structure (`terminal-tabs` div)
- Added single terminal header with title "Agent Chatter (from History)"
- Simplified terminal-content to single pane

### 2. CSS Updates (studio.css)
- Removed `.terminal-tabs`, `.terminal-tab` styles (26 lines)
- Added `.terminal-header` and `.terminal-title` for single header
- Simplified `.terminal-content` (no more panes)
- Reduced from ~66 lines to ~40 lines

### 3. JavaScript Refactor (studio-agents.js)
- Replaced per-agent terminal tracking with single unified terminal
  - `agentTerminals` → `unifiedTerminal`
  - `activeTerminalAgent` → removed
- Removed `switchTerminalTab()` function
- Replaced `initTerminalForAgent()` with single `initTerminalDock()`
- New `loadHistoryChatter()` function to extract from history logs
- New `extractChatterFromHistory()` to parse terminal entries from markdown
- Updated `handleTerminalOutput()` to write to unified terminal with timestamps

### 4. Data Flow
**Before:**
- WebSocket → handleTerminalOutput() → route to specific agent terminal
- Each agent had separate xterm instance and buffer

**After:**
- History files → extractChatterFromHistory() → unified terminal (on load)
- WebSocket → handleTerminalOutput() → unified terminal (real-time)
- Single xterm instance showing all agent activity

## Technical Details

### History Parsing
Extracts terminal entries matching pattern:
```
[timestamp] AgentName (terminal):
content
```

Formats as:
```
[HH:MM:SS] AgentName: content
```

### Terminal Configuration
- Scrollback: 5000 lines (increased from 1000)
- Theme: GitHub dark
- Font: Monaco/Menlo monospace 12px
- Color coding: timestamp (cyan), agent name (yellow)

## Files Modified
1. `studio.html` - Terminal structure
2. `studio.css` - Styling (removed tabs)
3. `studio-agents.js` - Core logic (~71 lines reduced)

## Result
Single unified terminal showing all agent chatter from history logs, with real-time updates as they arrive via WebSocket. Agent session cards remain unchanged above terminal.