// Game Studio - Session Monitor Module
// Monitors BOSS and Fleet CLI sessions + terminal output

// Track expanded agent cards (legacy - now just active agent)
let activeAgent = null;

// Terminal dock state (unified single terminal)
let unifiedTerminal = null;
let unifiedFitAddon = null;
let terminalDockInitialized = false;

// Session stats cache
let sessionStats = { boss: {}, fleet: {} };

// Fetch roles
async function fetchRoles() {
    try {
        const res = await fetch(`${API_URL}/roles`);
        roles = await res.json();
        renderTaskAgentSelect();
        renderSessionMonitor();
        log('agentLogs', `Loaded ${Object.keys(roles).length} agents`, 'success');
    } catch (e) {
        log('agentLogs', `Failed to fetch roles: ${e}`, 'error');
    }
}

// Clear Hub messages (T329: for project switch)
function clearHubMessages() {
    if (messagesEl) {
        messagesEl.innerHTML = '';
    }
}

// Fetch history (T327: project-aware)
async function fetchHistory() {
    try {
        const res = await fetch(apiUrl('/history'));
        const history = await res.json();
        history.forEach(msg => addMessage(msg));
        log('wsLogs', `Loaded ${history.length} messages from history`, 'info');
    } catch (e) {
        log('wsLogs', `Failed to fetch history: ${e}`, 'error');
    }
}

// Reload Hub for new project context (T329)
async function reloadHubForProject() {
    clearHubMessages();
    await fetchHistory();
}

// Format tokens for display
function formatTokensK(tokens) {
    if (tokens >= 1000) {
        return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
}

// Render session monitor (replaces agent cards)
function renderSessionMonitor() {
    const panel = document.getElementById('agents-cards');
    if (!panel) return;

    const boss = sessionStats.boss || {};
    const fleet = sessionStats.fleet || {};

    panel.innerHTML = `
        <div class="session-monitor">
            <div class="session-card boss">
                <div class="session-header">
                    <span class="session-icon">👑</span>
                    <span class="session-name">BOSS Session</span>
                    <span class="session-badge haiku">Haiku</span>
                </div>
                <div class="session-stats">
                    <div class="session-progress-container">
                        <div class="session-progress-bar" style="width: ${boss.usage_pct || 0}%"></div>
                    </div>
                    <div class="session-numbers">
                        <span class="session-tokens">${formatTokensK(boss.cumulative_tokens || 0)}</span>
                        <span class="session-sep">/</span>
                        <span class="session-threshold">${formatTokensK(boss.threshold || 150000)}</span>
                        <span class="session-pct">(${boss.usage_pct || 0}%)</span>
                    </div>
                    <div class="session-cost">
                        <span class="session-cost-label">Cost:</span>
                        <span class="session-cost-value">$${(boss.cost_usd || 0).toFixed(4)}</span>
                    </div>
                </div>
            </div>

            <div class="session-card fleet">
                <div class="session-header">
                    <span class="session-icon">⚙️</span>
                    <span class="session-name">Fleet Session</span>
                    <span class="session-badge sonnet">Sonnet</span>
                </div>
                <div class="session-stats">
                    <div class="session-progress-container">
                        <div class="session-progress-bar" style="width: ${fleet.usage_pct || 0}%"></div>
                    </div>
                    <div class="session-numbers">
                        <span class="session-tokens">${formatTokensK(fleet.cumulative_tokens || 0)}</span>
                        <span class="session-sep">/</span>
                        <span class="session-threshold">${formatTokensK(fleet.threshold || 150000)}</span>
                        <span class="session-pct">(${fleet.usage_pct || 0}%)</span>
                    </div>
                    <div class="session-cost">
                        <span class="session-cost-label">Cost:</span>
                        <span class="session-cost-value">$${(fleet.cost_usd || 0).toFixed(4)}</span>
                    </div>
                </div>
            </div>

            <div class="session-actions">
                <button class="session-action-btn" onclick="clearAllSessions()">Clear Sessions</button>
            </div>
        </div>

        <div class="active-agent-section">
            <h4>Active Agent</h4>
            <div id="active-agent-display" class="active-agent-display">
                <span class="no-agent">No agent running</span>
            </div>
        </div>
    `;

    // Initialize terminal dock if needed
    const agentsPanel = document.getElementById('panel-agents');
    if (!terminalDockInitialized && agentsPanel && agentsPanel.classList.contains('active')) {
        initTerminalDock();
    }
}

// Update session stats in place (called from WebSocket)
function updateSessionStats(stats) {
    sessionStats = stats;

    // Update BOSS progress
    const bossProgress = document.querySelector('.session-card.boss .session-progress-bar');
    const bossTokens = document.querySelector('.session-card.boss .session-tokens');
    const bossPct = document.querySelector('.session-card.boss .session-pct');
    if (bossProgress && stats.boss) {
        bossProgress.style.width = `${stats.boss.usage_pct || 0}%`;
        bossTokens.textContent = formatTokensK(stats.boss.cumulative_tokens || 0);
        bossPct.textContent = `(${stats.boss.usage_pct || 0}%)`;
    }

    // Update Fleet progress
    const fleetProgress = document.querySelector('.session-card.fleet .session-progress-bar');
    const fleetTokens = document.querySelector('.session-card.fleet .session-tokens');
    const fleetPct = document.querySelector('.session-card.fleet .session-pct');
    if (fleetProgress && stats.fleet) {
        fleetProgress.style.width = `${stats.fleet.usage_pct || 0}%`;
        fleetTokens.textContent = formatTokensK(stats.fleet.cumulative_tokens || 0);
        fleetPct.textContent = `(${stats.fleet.usage_pct || 0}%)`;
    }
}

// Update active agent display
function updateActiveAgent(agent, status) {
    const display = document.getElementById('active-agent-display');
    if (!display) return;

    if (agent && status === 'working') {
        const info = roles[agent] || {};
        display.innerHTML = `
            <div class="active-agent" style="--agent-color: ${info.color || '#666'}">
                <span class="status-dot working"></span>
                <span class="agent-name">${agent}</span>
                <span class="agent-title">${info.title || ''}</span>
            </div>
        `;
        activeAgent = agent;
    } else if (activeAgent === agent) {
        display.innerHTML = '<span class="no-agent">No agent running</span>';
        activeAgent = null;
    }
}

// Clear all sessions
async function clearAllSessions() {
    try {
        const res = await fetch(`${API_URL}/sessions/clear`, { method: 'POST' });
        const data = await res.json();
        if (data.status === 'cleared') {
            log('agentLogs', 'Sessions cleared', 'success');
            // Reset local stats
            sessionStats = { boss: { cumulative_tokens: 0, usage_pct: 0 }, fleet: { cumulative_tokens: 0, usage_pct: 0 } };
            renderSessionMonitor();
        }
    } catch (e) {
        log('agentLogs', `Failed to clear sessions: ${e}`, 'error');
    }
}

// Initialize unified terminal dock
function initTerminalDock() {
    const contentContainer = document.getElementById('terminal-content');
    if (!contentContainer || unifiedTerminal) return;

    contentContainer.innerHTML = '';

    const term = new Terminal({
        fontSize: 12,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
        theme: {
            background: '#0d1117',
            foreground: '#c9d1d9',
            cursor: '#58a6ff',
            selection: 'rgba(56, 139, 253, 0.4)'
        },
        scrollback: 5000,
        convertEol: true
    });

    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(contentContainer);
    fitAddon.fit();

    unifiedTerminal = term;
    unifiedFitAddon = fitAddon;

    // Load history chatter
    loadHistoryChatter(term);

    // Handle resize
    window.addEventListener('resize', () => {
        if (unifiedFitAddon) {
            unifiedFitAddon.fit();
        }
    });

    terminalDockInitialized = true;
}

// Load chatter from history logs
async function loadHistoryChatter(term) {
    try {
        term.writeln('\x1b[90m[Loading agent chatter from history...]\x1b[0m');
        
        // Load history files (draft and chapter)
        const [draftRes, chapterRes] = await Promise.all([
            fetch(`${API_URL}/files/read?path=data/history/draft.md`),
            fetch(`${API_URL}/files/read?path=data/history/chapter.md`)
        ]);

        const draftData = draftRes.ok ? await draftRes.json() : {};
        const chapterData = chapterRes.ok ? await chapterRes.json() : {};

        const draftText = draftData.content || '';
        const chapterText = chapterData.content || '';

        // Extract chatter lines (terminal output entries)
        const chatterLines = extractChatterFromHistory(draftText, chapterText);

        if (chatterLines.length > 0) {
            term.writeln(`\x1b[90m[Found ${chatterLines.length} chatter entries]\x1b[0m\r\n`);
            chatterLines.forEach(entry => {
                term.writeln(entry);
            });
        } else {
            term.writeln('\x1b[90m[No chatter found in history]\x1b[0m');
        }
    } catch (e) {
        term.writeln(`\x1b[31m[Error loading history: ${e.message}]\x1b[0m`);
    }
}

// Extract chatter from history markdown
function extractChatterFromHistory(draftText, chapterText) {
    const lines = [];
    const combined = chapterText + '\n' + draftText;
    
    // Match terminal output pattern: [timestamp] AgentName (terminal): content
    const terminalRegex = /\[([^\]]+)\]\s+(\w+)\s+\(terminal\):\s*\n([\s\S]*?)(?=\n\[|$)/g;
    
    let match;
    while ((match = terminalRegex.exec(combined)) !== null) {
        const timestamp = match[1];
        const agent = match[2];
        const content = match[3].trim();
        
        // Format for terminal display
        const timestampFormatted = new Date(timestamp).toLocaleTimeString();
        lines.push(`\x1b[36m[${timestampFormatted}]\x1b[0m \x1b[33m${agent}\x1b[0m: ${content}`);
    }
    
    return lines;
}

// Fetch agent stats (legacy - now just for task counts)
async function fetchAgentStats() {
    // Session stats come via WebSocket now
    // Just trigger initial render
    renderSessionMonitor();
}

// Render task agent select
function renderTaskAgentSelect() {
    const select = document.getElementById('taskAgent');
    select.innerHTML = '<option value="">Assign to...</option>';
    for (const name of Object.keys(roles)) {
        select.innerHTML += `<option value="${name}">${name}</option>`;
    }
}

// Handle terminal output from WebSocket (real-time updates)
function handleTerminalOutput(agent, line) {
    if (unifiedTerminal) {
        const timestamp = new Date().toLocaleTimeString();
        const formatted = `\x1b[36m[${timestamp}]\x1b[0m \x1b[33m${agent}\x1b[0m: ${line}`;
        unifiedTerminal.write(formatted);
    }
}

// Legacy functions (kept for compatibility)
function renderAgentCards() {
    renderSessionMonitor();
}

function updateAgentStatsInPlace() {
    // No-op - session stats come via WebSocket
}

function showConfigModal(agentName) {
    // Simplified - just show info
    alert(`Agent: ${agentName}\nBackend: ${roles[agentName]?.backend || 'unknown'}\nModel: ${roles[agentName]?.model || 'default'}`);
}

function hideConfigModal() {}
function saveAgentConfig() {}
