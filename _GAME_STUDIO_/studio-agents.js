// Game Studio - Agents Module
// Agent cards, stats, and config modal

// Fetch roles
async function fetchRoles() {
    try {
        const res = await fetch(`${API_URL}/roles`);
        roles = await res.json();
        renderTaskAgentSelect();
        await fetchAgentStats();
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

// Track expanded agent cards
const expandedAgents = new Set();

// Render agent cards
function renderAgentCards() {
    const panel = document.getElementById('panel-agents');
    panel.innerHTML = '';

    // Sort agents by tokens (highest first)
    const sortedAgents = Object.entries(roles).sort((a, b) => {
        const tokensA = agentStats[a[0]]?.tokens || 0;
        const tokensB = agentStats[b[0]]?.tokens || 0;
        return tokensB - tokensA;
    });

    for (const [name, info] of sortedAgents) {
        const stats = agentStats[name] || {};
        const status = stats.status || 'idle';
        const taskCount = stats.tasks?.assigned || 0;
        const tokens = formatTokens(stats.tokens || 0);
        const uptime = formatUptime(stats.uptime_seconds || 0);

        // Token breakdown
        const inputTokens = stats.tokens_input || 0;
        const outputTokens = stats.tokens_output || 0;
        const cacheRead = stats.tokens_cache_read || 0;
        const cacheCreation = stats.tokens_cache_creation || 0;

        // Preserve expanded state
        const isExpanded = expandedAgents.has(name);

        const card = document.createElement('div');
        card.className = 'agent-card' + (isExpanded ? ' expanded' : '');
        card.dataset.agent = name;
        card.style.setProperty('--agent-color', info.color);
        card.innerHTML = `
            <div class="agent-card-header">
                <span class="status-dot ${status}" title="${status}"></span>
                <span class="name">${name}</span>
                <span class="stats">
                    <span class="stat"><span class="stat-value token-total">${tokens}</span> tokens</span>
                    <span class="stat"><span class="stat-value">${taskCount}</span> tasks</span>
                    <span class="stat"><span class="stat-value">${uptime}</span></span>
                </span>
                <span class="expand-icon">${isExpanded ? '▲' : '▼'}</span>
            </div>
            <div class="agent-card-details" style="display: ${isExpanded ? 'block' : 'none'};">
                <div class="agent-token-grid">
                    <div class="agent-token-item">
                        <span class="agent-token-label">Input</span>
                        <span class="agent-token-value input">${formatTokens(inputTokens)}</span>
                    </div>
                    <div class="agent-token-item">
                        <span class="agent-token-label">Output</span>
                        <span class="agent-token-value output">${formatTokens(outputTokens)}</span>
                    </div>
                    <div class="agent-token-item">
                        <span class="agent-token-label">Cache Read</span>
                        <span class="agent-token-value cache-read">${formatTokens(cacheRead)}</span>
                    </div>
                    <div class="agent-token-item">
                        <span class="agent-token-label">Cache Write</span>
                        <span class="agent-token-value cache-write">${formatTokens(cacheCreation)}</span>
                    </div>
                </div>
                <div class="agent-actions">
                    <button class="agent-action-btn" onclick="showConfigModal('${name}')">Configure</button>
                    <button class="agent-action-btn" onclick="handlePromptAction('${name}', 'checkin')">Check In</button>
                </div>
            </div>
        `;

        // Toggle expand on header click
        const header = card.querySelector('.agent-card-header');
        header.addEventListener('click', (e) => {
            const details = card.querySelector('.agent-card-details');
            const icon = card.querySelector('.expand-icon');
            const wasExpanded = details.style.display !== 'none';
            details.style.display = wasExpanded ? 'none' : 'block';
            icon.textContent = wasExpanded ? '▼' : '▲';
            card.classList.toggle('expanded', !wasExpanded);
            // Track expanded state
            if (wasExpanded) {
                expandedAgents.delete(name);
            } else {
                expandedAgents.add(name);
            }
        });

        panel.appendChild(card);
    }
}


// Fetch agent stats
async function fetchAgentStats() {
    try {
        const res = await fetch(`${API_URL}/agents/stats`);
        agentStats = await res.json();
        renderAgentCards();
    } catch (e) {
        console.error('Failed to fetch agent stats:', e);
    }
}

// Config modal functions
function showConfigModal(agentName) {
    configAgent = agentName;
    const info = roles[agentName] || {};
    const stats = agentStats[agentName] || {};

    document.getElementById('configAgentName').textContent = agentName;
    document.getElementById('configModel').value = info.model || 'claude-cli';

    const statsEl = document.getElementById('configStats');
    const tokens = formatTokens(stats.tokens || 0);
    const taskCount = stats.tasks?.assigned || 0;
    const uptime = formatUptime(stats.uptime_seconds || 0);
    statsEl.innerHTML = `
        <span class="config-stat"><span class="config-stat-value">${tokens}</span> tokens</span>
        <span class="config-stat"><span class="config-stat-value">${taskCount}</span> tasks</span>
        <span class="config-stat"><span class="config-stat-value">${uptime}</span> uptime</span>
    `;

    const skillsEl = document.getElementById('configSkills');
    const skills = info.skills || [];
    if (skills.length > 0) {
        skillsEl.innerHTML = skills.map(s => `<span class="config-skill">${s}</span>`).join('');
    } else {
        skillsEl.innerHTML = '<span style="color: #666;">No skills configured</span>';
    }

    document.getElementById('configModal').classList.add('active');
}

function hideConfigModal() {
    document.getElementById('configModal').classList.remove('active');
    configAgent = null;
}

async function saveAgentConfig() {
    if (!configAgent) return;
    const model = document.getElementById('configModel').value;

    try {
        const res = await fetch(`${API_URL}/agents/${configAgent}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model })
        });
        if (res.ok) {
            hideConfigModal();
            await fetchRoles();
            log('agentLogs', `Updated ${configAgent} config`, 'success');
        }
    } catch (e) {
        log('agentLogs', `Failed to save config: ${e}`, 'error');
    }
}

// Render task agent select
function renderTaskAgentSelect() {
    const select = document.getElementById('taskAgent');
    select.innerHTML = '<option value="">Assign to...</option>';
    for (const name of Object.keys(roles)) {
        select.innerHTML += `<option value="${name}">${name}</option>`;
    }
}

// Prompt agent with specific action
function handlePromptAction(name, action) {
    if (!ws || !action) return;

    let message = '';
    switch (action) {
        case 'checkin':
            message = `@${name} Please give a brief status update on your current work.`;
            break;
        case 'resume':
            message = `@${name} Please resume working on your assigned tasks.`;
            break;
        case 'custom':
            const customMsg = prompt(`Enter message for ${name}:`);
            if (!customMsg) return;
            message = `@${name} ${customMsg}`;
            break;
        default:
            return;
    }

    ws.send(JSON.stringify({ type: 'chat', content: message }));
    log('agentLogs', `Prompted ${name}: ${action}`, 'info');
}
