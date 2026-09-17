// Game Studio - Session Monitor Module
// Monitors BOSS and Fleet CLI sessions + terminal output

// Track expanded agent cards (legacy - now just active agent)
let activeAgent = null;

// Terminal dock state
const agentTerminals = {};  // {name: {term, fitAddon}}
let activeTerminalAgent = null;
let terminalDockInitialized = false;

// Session stats cache
let sessionStats = { boss: {}, fleet: {} };

// Fetch roles (still needed for terminal tabs)
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

// Initialize terminal dock with tabs for each agent
function initTerminalDock() {
    const tabsContainer = document.getElementById('terminal-tabs');
    const contentContainer = document.getElementById('terminal-content');
    if (!tabsContainer || !contentContainer) return;

    tabsContainer.innerHTML = '';
    contentContainer.innerHTML = '';

    const agentNames = Object.keys(roles);
    if (agentNames.length === 0) return;

    // Put BOSS first, then others
    const sortedNames = agentNames.sort((a, b) => {
        if (a === 'BOSS') return -1;
        if (b === 'BOSS') return 1;
        return a.localeCompare(b);
    });

    sortedNames.forEach((name, idx) => {
        // Create tab
        const tab = document.createElement('div');
        tab.className = 'terminal-tab' + (idx === 0 ? ' active' : '');
        tab.dataset.agent = name;
        tab.textContent = name;
        tab.onclick = () => switchTerminalTab(name);
        tabsContainer.appendChild(tab);

        // Create pane
        const pane = document.createElement('div');
        pane.className = 'terminal-pane' + (idx === 0 ? ' active' : '');
        pane.id = `terminal-pane-${name}`;
        contentContainer.appendChild(pane);

        // Set first as active
        if (idx === 0) {
            activeTerminalAgent = name;
        }
    });

    // Initialize ALL terminals (staggered to avoid blocking)
    sortedNames.forEach((name, idx) => {
        setTimeout(() => initTerminalForAgent(name), 100 + idx * 50);
    });

    terminalDockInitialized = true;
}

// Switch terminal tab
function switchTerminalTab(name) {
    if (activeTerminalAgent === name) return;

    // Update tabs
    document.querySelectorAll('.terminal-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.agent === name);
    });

    // Update panes
    document.querySelectorAll('.terminal-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `terminal-pane-${name}`);
    });

    activeTerminalAgent = name;

    // Init terminal if not already
    if (!agentTerminals[name]) {
        initTerminalForAgent(name);
    } else {
        // Refit terminal when switching
        agentTerminals[name].fitAddon?.fit();
    }
}

// Initialize xterm for a specific agent
async function initTerminalForAgent(name) {
    if (agentTerminals[name]) return;

    const pane = document.getElementById(`terminal-pane-${name}`);
    if (!pane) return;

    const term = new Terminal({
        fontSize: 12,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
        theme: {
            background: '#0d1117',
            foreground: '#c9d1d9',
            cursor: '#58a6ff',
            selection: 'rgba(56, 139, 253, 0.4)'
        },
        scrollback: 1000,
        convertEol: true
    });

    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(pane);
    fitAddon.fit();

    agentTerminals[name] = { term, fitAddon };

    // Load history from server
    try {
        const res = await fetch(`${API_URL}/agents/${name}/terminal`);
        const data = await res.json();
        if (data.lines && data.lines.length > 0) {
            data.lines.forEach(line => term.write(line));
        } else {
            term.writeln(`\x1b[90m[${name} terminal ready]\x1b[0m`);
        }
    } catch (e) {
        term.writeln(`\x1b[90m[${name} terminal ready]\x1b[0m`);
    }

    // Flush any buffered messages that arrived before terminal was ready
    if (terminalBuffers[name] && terminalBuffers[name].length > 0) {
        console.log('[Terminal] Flushing', terminalBuffers[name].length, 'buffered messages for', name);
        terminalBuffers[name].forEach(line => term.write(line));
        terminalBuffers[name] = [];
    }

    // Handle resize
    window.addEventListener('resize', () => {
        if (activeTerminalAgent === name) {
            fitAddon.fit();
        }
    });
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

// Buffer for terminal output before terminals are initialized
const terminalBuffers = {};

// Handle terminal output from WebSocket
function handleTerminalOutput(agent, line) {
    console.log('[Terminal]', agent, ':', line.substring(0, 50));
    const termData = agentTerminals[agent];
    if (termData && termData.term) {
        termData.term.write(line);
    } else {
        // Buffer until terminal is ready
        if (!terminalBuffers[agent]) {
            terminalBuffers[agent] = [];
        }
        terminalBuffers[agent].push(line);
        console.log('[Terminal] Buffered for', agent, '(terminal not ready)');
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
