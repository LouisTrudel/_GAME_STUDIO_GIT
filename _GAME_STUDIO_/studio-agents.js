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

// Fetch history
async function fetchHistory() {
    try {
        const res = await fetch(`${API_URL}/history`);
        const history = await res.json();
        history.forEach(msg => addMessage(msg));
        log('wsLogs', `Loaded ${history.length} messages from history`, 'info');
    } catch (e) {
        log('wsLogs', `Failed to fetch history: ${e}`, 'error');
    }
}

// Render agent cards
function renderAgentCards() {
    const panel = document.getElementById('panel-agents');
    panel.innerHTML = '';

    for (const [name, info] of Object.entries(roles)) {
        const stats = agentStats[name] || {};
        const status = stats.status || 'idle';
        const taskCount = stats.tasks?.assigned || 0;
        const tokens = formatTokens(stats.tokens || 0);
        const uptime = formatUptime(stats.uptime_seconds || 0);

        const card = document.createElement('div');
        card.className = 'agent-card';
        card.style.setProperty('--agent-color', info.color);
        card.innerHTML = `
            <span class="status-dot ${status}" title="${status}"></span>
            <span class="name">${name}</span>
            <span class="stats">
                <span class="stat"><span class="stat-value">${tokens}</span> tokens</span>
                <span class="stat"><span class="stat-value">${taskCount}</span> tasks</span>
                <span class="stat"><span class="stat-value">${uptime}</span></span>
            </span>
        `;

        card.addEventListener('click', () => showConfigModal(name));
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
