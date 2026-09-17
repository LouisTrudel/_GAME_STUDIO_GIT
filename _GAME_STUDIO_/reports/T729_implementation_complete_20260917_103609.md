# T729 Implementation Complete

## Overview
Task T729 has been successfully implemented. The multi-terminal agent monitor has been replaced with a single unified terminal showing all agent chatter from history.

## Implementation Details

### Files Modified

1. **studio.html** (lines 125-130)
   - Single terminal dock with clear labeling: "Agent Chatter (from History)"
   - Maintains existing agent tab layout with session monitor above terminal

2. **studio-agents.js** (lines 191-285)
   - `initTerminalDock()`: Initializes unified xterm.js terminal
   - `loadHistoryChatter()`: Loads chatter from history files
   - `extractChatterFromHistory()`: Extracts terminal output entries from draft.md and chapter.md
   - `handleTerminalOutput()`: Handles real-time updates via WebSocket

3. **studio.css** (lines 1879-1918)
   - Terminal dock styling with proper flex layout
   - 250px height, resizable, dark theme consistent with UI

4. **studio-core.js** (lines 230-234)
   - WebSocket handler forwards terminal_output events to handleTerminalOutput()

### Key Features

✅ **Single Unified Terminal**
- Replaced multiple per-agent terminals with one unified view
- All agent chatter displayed in chronological order

✅ **History Integration**
- Extracts chatter from `data/history/draft.md` and `data/history/chapter.md`
- Regex pattern matches: `[timestamp] AgentName (terminal): content`
- Formatted with color-coded timestamps and agent names

✅ **Real-time Updates**
- WebSocket integration for live chatter as agents work
- Seamless append to existing history

✅ **Existing Layout Preserved**
- Session monitor (BOSS/Fleet) remains at top
- Active agent display below sessions
- Terminal dock at bottom of Agents tab

### Pattern Matching
```javascript
const terminalRegex = /\[([^\]]+)\]\s+(\w+)\s+\(terminal\):\s*\n([\s\S]*?)(?=\n\[|$)/g;
```

Matches entries like:
```
[2026-09-17T01:32:40] Code (terminal):
Running tests...
```

### Display Format
```
[HH:MM:SS] AgentName: content
```

With ANSI colors:
- Cyan timestamp
- Yellow agent name
- White content

## Technical Decisions

1. **Single Terminal**: Simpler UX, easier to follow agent activity chronologically
2. **xterm.js**: Robust terminal emulator with proper scrollback (5000 lines)
3. **History First**: Load historical chatter on init, then append real-time updates
4. **Fit Addon**: Auto-resize terminal on window resize

## Testing Checklist

- [x] Terminal initializes on Agents tab load
- [x] History chatter loads from draft.md and chapter.md
- [x] Real-time updates append correctly
- [x] Scrollback works (5000 lines)
- [x] Resize handler works
- [x] Color formatting displays correctly

## No Friction

Implementation was clean and straightforward. All required components were already in place and functioning correctly.
