// Game Studio - Main JavaScript

const WS_URL = 'ws://127.0.0.1:8000/ws';
const API_URL = 'http://127.0.0.1:8000/api';

let ws = null;
let roles = {};
let agentStats = {};
let tasks = [];
let routines = [];
let suggestions = [];
let projects = [];
let currentProject = null;
let showArchivedProjects = false;
let autoApprove = localStorage.getItem('autoApprove') === 'true';
let isThinking = false;
let agentStatuses = {};  // Track agent activity states
let activityBarTimeout = null;  // Grace period timer
let agentShowTimes = {};  // Track when each agent started showing (for min display time)
let liveTokens = {};  // Track live token counts per agent {agent: {input, output}}

// DOM elements
const statusEl = document.getElementById('status');
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Logging
function log(target, message, level = 'info') {
    const el = document.getElementById(target);
    if (!el) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${level}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    el.appendChild(entry);
    el.scrollTop = el.scrollHeight;
}

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
    });
});

// Fetch roles
async function fetchRoles() {
    try {
        const res = await fetch(`${API_URL}/roles`);
        roles = await res.json();
        renderTaskAgentSelect();
        await fetchAgentStats();  // This also calls renderAgentCards
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

// Track expanded agent cards
let expandedAgents = new Set();

// Render agent cards - sorted by tokens (descending), expandable
function renderAgentCards() {
    const panel = document.getElementById('panel-agents');
    panel.innerHTML = '';

    // Build array with stats and sort by tokens descending
    const agentList = Object.entries(roles).map(([name, info]) => {
        const stats = agentStats[name] || {};
        return { name, info, stats, tokens: stats.tokens || 0 };
    }).sort((a, b) => b.tokens - a.tokens);

    for (const { name, info, stats } of agentList) {
        const status = stats.status || 'idle';
        const taskCount = stats.tasks?.assigned || 0;
        const tokens = formatTokens(stats.tokens || 0);
        const rawTokens = stats.tokens || 0;
        const uptime = formatUptime(stats.uptime_seconds || 0);
        const isExpanded = expandedAgents.has(name);

        const card = document.createElement('div');
        card.className = `agent-card ${isExpanded ? 'expanded' : ''}`;
        card.style.setProperty('--agent-color', info.color);
        card.innerHTML = `
            <div class="agent-card-header" onclick="toggleAgentCard('${name}')">
                <span class="status-dot ${status}" title="${status}"></span>
                <span class="name">${name}</span>
                <span class="stats">
                    <span class="stat"><span class="stat-value">${tokens}</span> tokens</span>
                    <span class="stat"><span class="stat-value">${taskCount}</span> tasks</span>
                    <span class="stat"><span class="stat-value">${uptime}</span></span>
                </span>
                <span class="expand-icon">${isExpanded ? '▲' : '▼'}</span>
            </div>
            <div class="agent-card-details" id="agent-details-${name}" style="display: ${isExpanded ? 'block' : 'none'};">
                <div class="agent-token-details">
                    <div class="agent-detail-label">Token Usage</div>
                    <div class="agent-detail-value">${rawTokens.toLocaleString()} total</div>
                </div>
                <div class="agent-role-content" id="agent-role-${name}">
                    <div class="agent-detail-label">Role Definition</div>
                    <pre class="agent-role-text">Loading...</pre>
                </div>
            </div>
        `;

        panel.appendChild(card);

        // Load role content if expanded
        if (isExpanded) {
            loadAgentRole(name);
        }
    }
}

// Toggle agent card expand/collapse
function toggleAgentCard(name) {
    if (expandedAgents.has(name)) {
        expandedAgents.delete(name);
    } else {
        expandedAgents.add(name);
        loadAgentRole(name);
    }
    renderAgentCards();
}

// Load role.md content for an agent
async function loadAgentRole(name) {
    const container = document.getElementById(`agent-role-${name}`);
    if (!container) return;

    const textEl = container.querySelector('.agent-role-text');
    if (!textEl || textEl.dataset.loaded === 'true') return;

    try {
        const res = await fetch(`${API_URL}/agents/${name}/role`);
        const data = await res.json();
        if (data.error) {
            textEl.textContent = `Error: ${data.error}`;
        } else {
            textEl.textContent = data.content || '(empty)';
            textEl.dataset.loaded = 'true';
        }
    } catch (e) {
        textEl.textContent = `Error loading: ${e}`;
    }
}

// Format token count (e.g., 1234 -> "1.2k")
function formatTokens(count) {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
}

// Format uptime (seconds -> "2h", "15m", etc.)
function formatUptime(seconds) {
    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    return Math.floor(seconds / 3600) + 'h';
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

// Render task agent select
function renderTaskAgentSelect() {
    const select = document.getElementById('taskAgent');
    select.innerHTML = '<option value="">Assign to...</option>';
    for (const name of Object.keys(roles)) {
        select.innerHTML += `<option value="${name}">${name}</option>`;
    }
}

// Add message to chat
function addMessage(msg) {
    const div = document.createElement('div');
    const isUser = msg.sender === 'user';
    const color = isUser ? '#3498db' : (roles[msg.sender]?.color || '#888');

    div.className = `message ${isUser ? 'user' : ''}`;
    div.style.borderLeftColor = color;

    const time = new Date(msg.timestamp).toLocaleTimeString();

    // Add "Mr" prefix for agents (except BOSS and user)
    const displayName = isUser ? 'You' : (msg.sender === 'BOSS' ? 'BOSS' : `Mr ${msg.sender}`);

    // Always add collapsible class initially to measure overflow
    div.innerHTML = `
        <div class="message-header">
            <span class="message-sender" style="color: ${color}">
                ${displayName}
            </span>
            <span class="message-time">${time}</span>
        </div>
        <div class="message-content collapsible">${highlightMentions(escapeHtml(msg.content))}</div>
        <div class="message-expand-hint" style="display: none;">Click to expand</div>
    `;

    messagesEl.appendChild(div);

    // Check if content actually overflows after rendering
    const contentEl = div.querySelector('.message-content');
    const hintEl = div.querySelector('.message-expand-hint');
    const isOverflowing = contentEl.scrollHeight > contentEl.clientHeight;

    if (isOverflowing) {
        // Content is actually truncated - enable expand functionality
        hintEl.style.display = '';

        const toggleExpand = () => {
            contentEl.classList.toggle('expanded');
            contentEl.classList.toggle('collapsible');
            hintEl.textContent = contentEl.classList.contains('expanded') ? 'Click to collapse' : 'Click to expand';
        };

        contentEl.addEventListener('click', toggleExpand);
        hintEl.addEventListener('click', toggleExpand);
    } else {
        // Content fits - remove collapsible styling
        contentEl.classList.remove('collapsible');
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Check for task ID in message and add deliverable link
    const taskMatch = msg.content.match(/^(T\d+)\s+(FIXED|ADDED|UPDATED|FOUND|TRACED|BLOCKED|COMPLETE)/i);
    console.log('[Deliverable] Regex test:', msg.content.substring(0, 30), '-> match:', taskMatch ? taskMatch[1] : 'none');
    if (taskMatch && !isUser) {
        addDeliverableLink(div, taskMatch[1]);
    }

    // Log to routines
    log('wsLogs', `${msg.sender}: ${msg.content.substring(0, 50)}...`, 'info');
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Highlight @mentions
function highlightMentions(text) {
    return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
}

// Auto-approve toggle
function toggleAutoApprove() {
    autoApprove = !autoApprove;
    localStorage.setItem('autoApprove', autoApprove);
    updateAutoApproveUI();

    // Notify server
    if (ws) {
        ws.send(JSON.stringify({ type: 'set_auto_approve', enabled: autoApprove }));
    }
}

function updateAutoApproveUI() {
    const toggle = document.getElementById('autoApproveToggle');
    if (autoApprove) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }
}

// Thinking indicator
function showThinking(agentName = 'Agent') {
    isThinking = true;
    document.getElementById('thinkingText').textContent = `${agentName} is thinking...`;
    document.getElementById('thinkingIndicator').classList.add('show');
    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
}

function hideThinking() {
    isThinking = false;
    document.getElementById('thinkingIndicator').classList.remove('show');
}

// Agent error notification - shows error toast
function showAgentError(agent, time, error) {
    // Create error toast
    let container = document.getElementById('errorToasts');
    if (!container) {
        container = document.createElement('div');
        container.id = 'errorToasts';
        container.style.cssText = 'position:fixed;top:60px;right:20px;z-index:1000;display:flex;flex-direction:column;gap:8px;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.style.cssText = 'background:#ff4444;color:white;padding:12px 16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:400px;animation:slideIn 0.3s ease;cursor:pointer;';
    toast.innerHTML = `<strong>${agent}</strong> [${time}]<br><span style="font-size:0.9em;opacity:0.9;">${error}</span>`;
    toast.onclick = () => toast.remove();

    container.appendChild(toast);

    // Auto-remove after 10 seconds
    setTimeout(() => toast.remove(), 10000);
}

// Activity bar - shows all active agents with minimum display time
const MIN_DISPLAY_MS = 500;  // Show working state for at least 500ms

function updateActivityBar(statuses) {
    agentStatuses = statuses;
    const bar = document.getElementById('activityBar');
    const now = Date.now();

    // Track when agents become active
    Object.entries(statuses).forEach(([name, info]) => {
        if (info.status === 'thinking' || info.status === 'working') {
            if (!agentShowTimes[name]) {
                agentShowTimes[name] = now;
            }
        }
    });

    // Include agents that are active OR still within minimum display time
    const visibleAgents = Object.entries(statuses).filter(([name, info]) => {
        const isActive = info.status === 'thinking' || info.status === 'working';
        const showTime = agentShowTimes[name];
        const withinMinDisplay = showTime && (now - showTime) < MIN_DISPLAY_MS;
        return isActive || withinMinDisplay;
    });

    // Clean up agents that are done and past minimum display time
    Object.keys(agentShowTimes).forEach(name => {
        const info = statuses[name];
        const isActive = info && (info.status === 'thinking' || info.status === 'working');
        if (!isActive && (now - agentShowTimes[name]) >= MIN_DISPLAY_MS) {
            delete agentShowTimes[name];
        }
    });

    // Clear any pending hide timeout
    if (activityBarTimeout) {
        clearTimeout(activityBarTimeout);
        activityBarTimeout = null;
    }

    if (visibleAgents.length === 0) {
        // Add grace period before hiding (500ms) to prevent flicker
        activityBarTimeout = setTimeout(() => {
            bar.classList.remove('show');
            bar.innerHTML = '';
        }, 500);
        return;
    }

    bar.classList.add('show');
    bar.innerHTML = visibleAgents.map(([name, info]) => {
        const color = roles[name]?.color || '#888';
        const isActive = info.status === 'thinking' || info.status === 'working';
        const statusClass = isActive ? info.status : 'finishing';
        const activity = isActive
            ? (info.activity || (info.status === 'thinking' ? 'Thinking...' : 'Working...'))
            : 'Done';
        return `
            <div class="activity-item ${statusClass}" style="border-left-color: ${color}">
                <span style="color: ${color}; font-weight: 600;">${name}</span>
                <span style="color: #aaa;">${activity}</span>
                <div class="activity-dots" style="color: ${color}">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
    }).join('');
}

// Send message
function sendMessage() {
    const content = inputEl.value.trim();
    if (!content || !ws) return;

    // Immediately show user message (optimistic UI)
    addMessage({
        sender: 'user',
        content: content,
        timestamp: new Date().toISOString()
    });

    ws.send(JSON.stringify({ type: 'user_message', content }));
    inputEl.value = '';
    showThinking('BOSS');  // Show thinking indicator
    log('apiLogs', `Sent: ${content.substring(0, 50)}...`, 'info');
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

// Task management
async function clearCompletedTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks/clear-completed`, { method: 'POST' });
        const data = await res.json();
        log('wsLogs', `Cleared ${data.cleared} completed tasks`, 'success');
    } catch (e) {
        log('wsLogs', `Failed to clear tasks: ${e}`, 'error');
    }
}

async function clearAllTasks() {
    if (!confirm('Clear ALL tasks? This cannot be undone.')) return;
    try {
        await fetch(`${API_URL}/tasks/clear`, { method: 'POST' });
        log('wsLogs', 'All tasks cleared', 'success');
    } catch (e) {
        log('wsLogs', `Failed to clear tasks: ${e}`, 'error');
    }
}

async function resetTokenMetrics() {
    if (!confirm('Reset token counts? This clears token data from all tasks.')) return;
    try {
        const res = await fetch(`${API_URL}/tokens/reset`, { method: 'POST' });
        const data = await res.json();
        log('wsLogs', data.message, 'success');
        sessionTokens = null;  // Clear cached session tokens
        await fetchSessionTokens();  // Refresh from server
    } catch (e) {
        log('wsLogs', `Failed to reset tokens: ${e}`, 'error');
    }
}

async function cancelTask(taskId) {
    try {
        const res = await fetch(`${API_URL}/tasks/${taskId}/cancel`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            log('wsLogs', `Cancelled task ${taskId}`, 'success');
        } else {
            log('wsLogs', `Failed to cancel: ${data.error}`, 'error');
        }
    } catch (e) {
        log('wsLogs', `Failed to cancel task: ${e}`, 'error');
    }
}

async function retryTask(taskId) {
    try {
        const res = await fetch(`${API_URL}/tasks/${taskId}/retry`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            log('wsLogs', `Queued task ${taskId} for retry`, 'success');
        } else {
            log('wsLogs', `Failed to retry: ${data.error}`, 'error');
        }
    } catch (e) {
        log('wsLogs', `Failed to retry task: ${e}`, 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm(`Delete task ${taskId}? This cannot be undone.`)) return;
    try {
        const res = await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            log('wsLogs', `Deleted task ${taskId}`, 'success');
        } else {
            log('wsLogs', `Failed to delete: ${data.error}`, 'error');
        }
    } catch (e) {
        log('wsLogs', `Failed to delete task: ${e}`, 'error');
    }
}

// ===== HUB TASKS SIDEBAR =====
let taskFilter = localStorage.getItem('taskFilter') || 'active';
// Migrate old filter values
if (taskFilter === 'approved' || taskFilter === 'completed') {
    taskFilter = 'done';
    localStorage.setItem('taskFilter', 'done');
}
let sessionTokens = null;  // Cached session token data from /api/tokens/session

// Fetch session tokens (includes BOSS interactions)
async function fetchSessionTokens() {
    try {
        const res = await fetch(`${API_URL}/tokens/session`);
        sessionTokens = await res.json();
        renderHubMetricsBar();
    } catch (e) {
        console.error('Failed to fetch session tokens:', e);
    }
}

// Compute aggregate quality metrics from tasks + session tokens
function computeAggregateMetrics() {
    let totalCost = 0;
    let totalRetries = 0;
    let totalToolErrors = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCacheCreation = 0;
    let totalCacheRead = 0;
    let totalTurns = 0;
    let totalToolUses = 0;
    let errorCount = 0;

    // Include session tokens (BOSS + all agents tracked via track_tokens)
    if (sessionTokens) {
        totalInputTokens += sessionTokens.total_input_tokens || 0;
        totalOutputTokens += sessionTokens.total_output_tokens || 0;
    }

    // Note: Task costs are already included in session tokens via track_tokens()
    // Only add retries, tool errors, and other task-specific metrics
    tasks.forEach(task => {
        totalCost += task.cost?.usd || 0;
        totalRetries += task.api_retries || 0;
        totalToolErrors += (task.tool_errors?.length || 0);
        totalCacheCreation += task.cost?.cache_creation_tokens || 0;
        totalCacheRead += task.cost?.cache_read_tokens || 0;
        totalTurns += task.num_turns || 0;
        totalToolUses += task.num_tool_uses || 0;
        if (task.is_error) errorCount++;
    });

    return {
        cost: totalCost,
        retries: totalRetries,
        toolErrors: totalToolErrors,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
        cacheCreation: totalCacheCreation,
        cacheRead: totalCacheRead,
        turns: totalTurns,
        toolUses: totalToolUses,
        errors: errorCount
    };
}

function initTaskFilter() {
    const select = document.getElementById('taskFilter');
    if (select) {
        select.value = taskFilter;
    }
}

function renderHubMetricsBar() {
    const bar = document.getElementById('hubMetricsBar');
    if (!bar) return;

    const metrics = computeAggregateMetrics();

    // Only show if we have meaningful data
    if (metrics.totalTokens === 0 && metrics.cost === 0) {
        bar.innerHTML = '';
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'flex';

    const items = [];

    // Total tokens
    if (metrics.totalTokens > 0) {
        items.push(`<span class="metrics-item">
            <span class="metrics-value">${formatTokens(metrics.totalTokens)}</span>
            <span class="metrics-label">tokens</span>
        </span>`);
    }

    // Cost
    if (metrics.cost > 0) {
        items.push(`<span class="metrics-item">
            <span class="metrics-value cost">$${metrics.cost.toFixed(2)}</span>
            <span class="metrics-label">cost</span>
        </span>`);
    }

    // Retries (show warning indicator if any)
    if (metrics.retries > 0) {
        items.push(`<span class="metrics-item warning">
            <span class="metrics-value">${metrics.retries}</span>
            <span class="metrics-label">retries</span>
        </span>`);
    }

    // Tool errors
    if (metrics.toolErrors > 0) {
        items.push(`<span class="metrics-item error">
            <span class="metrics-value">${metrics.toolErrors}</span>
            <span class="metrics-label">errors</span>
        </span>`);
    }

    // Reset button (small, unobtrusive)
    items.push(`<button class="metrics-reset-btn" onclick="resetTokenMetrics()" title="Reset token counts">↺</button>`);

    bar.innerHTML = items.join('');
}

function onTaskFilterChange() {
    const select = document.getElementById('taskFilter');
    taskFilter = select.value;
    localStorage.setItem('taskFilter', taskFilter);
    renderHubTasks();
}

function renderHubTasks() {
    const list = document.getElementById('hubTasksList');
    if (!list) return;

    // Update aggregate metrics bar
    renderHubMetricsBar();

    // Filter tasks based on selection
    let filteredTasks;
    let emptyMessage;

    if (taskFilter === 'active') {
        // Active+Queued = in_progress, ready, pending, blocked
        const activeStatuses = ['in_progress', 'ready', 'pending', 'blocked'];
        filteredTasks = tasks
            .filter(t => activeStatuses.includes(t.status))
            .sort((a, b) => {
                const priority = { in_progress: 0, ready: 1, pending: 2, blocked: 3 };
                return (priority[a.status] ?? 99) - (priority[b.status] ?? 99);
            });
        emptyMessage = 'No active tasks';
    } else if (taskFilter === 'approved') {
        filteredTasks = tasks.filter(t => t.status === 'approved');
        emptyMessage = 'No approved tasks';
    } else if (taskFilter === 'completed') {
        filteredTasks = tasks
            .filter(t => t.status === 'completed')
            .sort((a, b) => {
                // Most recently completed first
                const aTime = a.completed_at || a.updated_at || '';
                const bTime = b.completed_at || b.updated_at || '';
                return bTime.localeCompare(aTime);
            });
        emptyMessage = 'No completed tasks';
    }

    // Limit display
    filteredTasks = filteredTasks.slice(0, 30);

    if (filteredTasks.length === 0) {
        list.innerHTML = `<div style="padding: 1rem; color: #666; font-size: 0.8rem;">${emptyMessage}</div>`;
        return;
    }

    list.innerHTML = filteredTasks.map(task => {
        const agentColor = roles[task.assignee]?.color || '#888';
        const shortDesc = task.description.length > 60
            ? task.description.substring(0, 60) + '...'
            : task.description;

        // Per-task token display (compact format)
        const totalTokens = (task.cost?.input_tokens || 0) + (task.cost?.output_tokens || 0);
        const tokenDisplay = totalTokens > 0
            ? `<span class="hub-task-tokens" title="${(task.cost?.input_tokens || 0).toLocaleString()} in / ${(task.cost?.output_tokens || 0).toLocaleString()} out">${formatTokens(totalTokens)}</span>`
            : '';

        return `
            <div class="hub-task-item ${task.status}" onclick="showTaskDetailModal('${task.id}')">
                <div style="display: flex; align-items: center; gap: 0.3rem;">
                    <span class="hub-task-id">${task.id}</span>
                    <span class="hub-task-agent" style="color: ${agentColor}">${task.assignee}</span>
                    <span class="hub-task-status ${task.status}">${task.status.replace('_', ' ')}</span>
                    ${tokenDisplay}
                </div>
                <div class="hub-task-desc" title="${escapeHtml(task.description)}">${escapeHtml(shortDesc)}</div>
            </div>
        `;
    }).join('');
}

function showTaskDetailModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const agentColor = roles[task.assignee]?.color || '#888';
    const hasTokens = (task.cost?.input_tokens || 0) + (task.cost?.output_tokens || 0) > 0;
    const hasCacheTokens = (task.cost?.cache_creation_tokens || 0) + (task.cost?.cache_read_tokens || 0) > 0;
    const hasQualityMetrics = (task.api_retries || 0) > 0 || (task.tool_errors?.length || 0) > 0 || (task.cost?.usd || 0) > 0;
    const hasExecutionMetrics = (task.num_turns || 0) > 0 || (task.num_tool_uses || 0) > 0;

    // Build token stats
    let tokenStats = '';
    if (hasTokens) {
        // Cache info row (if present)
        let cacheRow = '';
        if (hasCacheTokens) {
            cacheRow = `
                <div style="display: flex; gap: 1.5rem; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #333;">
                    <div>
                        <span style="color: #f39c12;">${(task.cost?.cache_creation_tokens || 0).toLocaleString()}</span>
                        <span style="color: #666; font-size: 0.8rem;"> cache write</span>
                    </div>
                    <div>
                        <span style="color: #27ae60;">${(task.cost?.cache_read_tokens || 0).toLocaleString()}</span>
                        <span style="color: #666; font-size: 0.8rem;"> cache read</span>
                    </div>
                </div>
            `;
        }
        tokenStats = `
            <div style="margin-top: 1rem; padding: 0.8rem; background: #1a1a2e; border-radius: 0.4rem;">
                <div style="font-size: 0.75rem; color: #888; margin-bottom: 0.5rem;">TOKEN USAGE</div>
                <div style="display: flex; gap: 1.5rem;">
                    <div>
                        <span style="color: #5dade2;">${(task.cost?.input_tokens || 0).toLocaleString()}</span>
                        <span style="color: #666; font-size: 0.8rem;"> input</span>
                    </div>
                    <div>
                        <span style="color: #9b59b6;">${(task.cost?.output_tokens || 0).toLocaleString()}</span>
                        <span style="color: #666; font-size: 0.8rem;"> output</span>
                    </div>
                    <div>
                        <span style="color: #2ecc71;">${((task.cost?.input_tokens || 0) + (task.cost?.output_tokens || 0)).toLocaleString()}</span>
                        <span style="color: #666; font-size: 0.8rem;"> total</span>
                    </div>
                </div>
                ${cacheRow}
            </div>
        `;
    }

    // Build quality metrics section
    let qualityMetrics = '';
    if (hasQualityMetrics || hasExecutionMetrics) {
        const retries = task.api_retries || 0;
        const toolErrors = task.tool_errors || [];
        const cost = task.cost?.usd || 0;
        const duration = task.duration_ms || 0;
        const numTurns = task.num_turns || 0;
        const numToolUses = task.num_tool_uses || 0;

        let metricsItems = [];

        // Duration
        if (duration > 0) {
            const durationStr = duration >= 60000
                ? `${(duration / 60000).toFixed(1)}m`
                : `${(duration / 1000).toFixed(1)}s`;
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value">${durationStr}</span>
                <span class="quality-metric-label">duration</span>
            </div>`);
        }

        // Cost
        if (cost > 0) {
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value cost">$${cost.toFixed(4)}</span>
                <span class="quality-metric-label">cost</span>
            </div>`);
        }

        // Turns (agentic round-trips)
        if (numTurns > 0) {
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value">${numTurns}</span>
                <span class="quality-metric-label">turns</span>
            </div>`);
        }

        // Tool uses
        if (numToolUses > 0) {
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value">${numToolUses}</span>
                <span class="quality-metric-label">tool calls</span>
            </div>`);
        }

        // Retries (warning color if > 0)
        if (retries > 0) {
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value warning">${retries}</span>
                <span class="quality-metric-label">API retries</span>
            </div>`);
        }

        // Tool errors
        let toolErrorsHtml = '';
        if (toolErrors.length > 0) {
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value error">${toolErrors.length}</span>
                <span class="quality-metric-label">tool errors</span>
            </div>`);
            toolErrorsHtml = `
                <div class="quality-errors">
                    <div class="quality-errors-header">Tool Errors:</div>
                    ${toolErrors.map(e => `<div class="quality-error-item">${escapeHtml(e)}</div>`).join('')}
                </div>
            `;
        }

        // Error message from is_error flag
        let errorMsgHtml = '';
        if (task.is_error && task.error_message) {
            errorMsgHtml = `
                <div class="quality-errors" style="margin-top: 0.5rem;">
                    <div class="quality-errors-header" style="color: #e74c3c;">Execution Error:</div>
                    <div class="quality-error-item">${escapeHtml(task.error_message)}</div>
                </div>
            `;
        }

        qualityMetrics = `
            <div class="quality-metrics-section">
                <div class="quality-metrics-header">EXECUTION METRICS</div>
                <div class="quality-metrics-row">${metricsItems.join('')}</div>
                ${toolErrorsHtml}
                ${errorMsgHtml}
            </div>
        `;
    }

    // Determine which buttons to show
    const canCancel = ['pending', 'ready', 'in_progress'].includes(task.status);
    const canRetry = ['failed', 'error', 'cancelled'].includes(task.status);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="font-size: 1.2rem; font-weight: 600; color: #e94560;">${task.id}</span>
                <span style="padding: 0.2rem 0.6rem; border-radius: 0.3rem; background: ${agentColor}33; color: ${agentColor}; font-size: 0.8rem;">${task.assignee}</span>
                <span style="padding: 0.2rem 0.6rem; border-radius: 0.3rem; background: #333; color: #888; font-size: 0.75rem; text-transform: uppercase;">${task.status.replace('_', ' ')}</span>
            </div>
            <div style="color: #ccc; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(task.description)}</div>
            ${tokenStats}
            ${qualityMetrics}
            <div class="modal-buttons" style="margin-top: 1.5rem;">
                ${canCancel ? `<button class="secondary" onclick="cancelTask('${task.id}'); this.closest('.modal-overlay').remove();">Cancel</button>` : ''}
                ${canRetry ? `<button onclick="retryTask('${task.id}'); this.closest('.modal-overlay').remove();">Retry</button>` : ''}
                <button class="secondary" onclick="deleteTask('${task.id}'); this.closest('.modal-overlay').remove();">Delete</button>
                <button onclick="this.closest('.modal-overlay').remove();">Close</button>
            </div>
        </div>
    `;
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
}

// ===== DELIVERABLE VIEWER =====
async function showDeliverableModal(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/deliverable`);
        const data = await response.json();

        if (!data.exists) {
            return; // No deliverable
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal deliverable-modal">
                <div class="deliverable-header">
                    <span class="deliverable-title">${taskId} Deliverable</span>
                    <button class="deliverable-close" onclick="this.closest('.modal-overlay').remove();">&times;</button>
                </div>
                <div class="deliverable-content">${escapeHtml(data.content)}</div>
            </div>
        `;
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
    } catch (err) {
        console.error('Failed to load deliverable:', err);
    }
}

// Check deliverable and add link to message element
async function addDeliverableLink(messageEl, taskId) {
    try {
        console.log('[Deliverable] Checking:', taskId);
        const response = await fetch(`${API_URL}/tasks/${taskId}/deliverable/exists`);
        const data = await response.json();
        console.log('[Deliverable] Response:', taskId, data);

        if (data.exists) {
            const link = document.createElement('span');
            link.className = 'deliverable-link';
            link.innerHTML = '&#128196;'; // Document icon
            link.title = `View ${taskId} deliverable`;
            link.onclick = (e) => {
                e.stopPropagation();
                showDeliverableModal(taskId);
            };

            const header = messageEl.querySelector('.message-header');
            console.log('[Deliverable] Header found:', !!header, taskId);
            if (header) {
                header.appendChild(link);
                console.log('[Deliverable] Link added:', taskId);
            }
        }
    } catch (err) {
        console.error('[Deliverable] Error:', taskId, err);
    }
}

// ===== ROUTINES =====
function renderRoutines() {
    const list = document.getElementById('routineList');

    if (routines.length === 0) {
        list.innerHTML = `
            <div class="routine-card" style="text-align: center; color: #666;">
                No routines yet. Create one to schedule recurring tasks.
            </div>
        `;
        return;
    }

    list.innerHTML = routines.map(routine => {
        const statusClass = routine.status;
        const statusLabel = routine.status.toUpperCase();
        const nextRun = routine.next_run ? formatRelativeTime(new Date(routine.next_run)) : '--';
        const lastRun = routine.last_run ? formatRelativeTime(new Date(routine.last_run)) : 'Never';
        const runCount = routine.run_count || 0;
        const lastRunFailed = routine.last_run_status === 'failed';

        // Build agent chain summary (e.g., "Structure → Code")
        const agentChain = routine.tasks.map(t => t.assignee).join(' → ');

        // Build chain progress indicators
        const chainProgress = routine.tasks.map((t, i) => {
            let stepClass = 'pending';
            if (routine.status === 'running' && routine.current_task_index !== undefined) {
                if (i < routine.current_task_index) stepClass = 'completed';
                else if (i === routine.current_task_index) stepClass = 'current';
            } else if (routine.status !== 'running' && runCount > 0) {
                stepClass = 'completed';
            }
            const icon = stepClass === 'completed' ? '✓' : (stepClass === 'current' ? '●' : '○');
            return `<span class="routine-chain-step ${stepClass}" title="Task ${i+1}: ${escapeHtml(t.description)}">${icon}</span>`;
        }).join('');

        // Build tasks list
        const tasksHtml = routine.tasks.map((t, i) => {
            const outputIcon = t.output === 'report' ? '📄' : t.output === 'code' ? '💻' : '💬';
            const parallelIcon = t.parallel ? '⚡' : '';
            const contextHint = t.context ? '📋' : '';
            const skillsHint = t.skills?.length ? `[${t.skills.join(', ')}]` : '';
            return `
                <div class="routine-task" title="${escapeHtml(t.context || '')}">
                    <span class="routine-task-num">${i + 1}.</span>
                    <span>${parallelIcon}</span>
                    <span style="flex:1">${escapeHtml(t.description)}</span>
                    <span style="font-size:0.75rem;color:#666">${skillsHint}</span>
                    <span>${outputIcon}${contextHint}</span>
                    <span class="routine-task-assignee" style="background: ${roles[t.assignee]?.color || '#888'}33">${t.assignee}</span>
                </div>
            `;
        }).join('');

        // Error indicator for header (compact)
        const errorIndicatorHeader = lastRunFailed
            ? `<span class="routine-error-indicator" title="${escapeHtml(routine.last_run_error || 'Last run failed')}"><span class="error-icon">!</span></span>`
            : '';

        // Error details for expanded view
        const errorDetailsExpanded = lastRunFailed && routine.last_run_error
            ? `<div class="routine-error-details">Last run error: ${escapeHtml(routine.last_run_error)}</div>`
            : '';

        // Add 'failed' class to card if last run failed
        const cardClass = lastRunFailed ? `${statusClass} failed` : statusClass;

        return `
            <div class="routine-card ${cardClass}">
                <div class="routine-header" onclick="toggleRoutineDetails('${routine.id}')" style="cursor: pointer;">
                    <span class="routine-id">${routine.id}</span>
                    <span class="routine-title">${escapeHtml(routine.name)}</span>
                    ${errorIndicatorHeader}
                    <span class="routine-interval">⏱ ${routine.interval_human}</span>
                    <span class="routine-status ${statusClass}">${statusLabel}</span>
                    <span class="routine-agent-chain">${agentChain}</span>
                    <span class="routine-timeline-compact">
                        <span class="routine-timeline-label">Last:</span> ${lastRun}
                        <span class="routine-timeline-sep">|</span>
                        <span class="routine-timeline-label">Next:</span> ${nextRun}
                    </span>
                    <span class="routine-expand-icon" id="expand-${routine.id}">▼</span>
                </div>
                <div class="routine-details" id="details-${routine.id}" style="display: none;">
                    ${routine.description ? `<div class="routine-description">${escapeHtml(routine.description)}</div>` : ''}
                    ${errorDetailsExpanded}
                    <div class="routine-chain">
                        <div class="routine-chain-header">
                            <span>Chain Progress</span>
                            <div class="routine-chain-progress">${chainProgress}</div>
                        </div>
                        ${tasksHtml}
                    </div>
                    <div class="routine-buttons">
                        <button onclick="triggerRoutine('${routine.id}')">▶ Run Now</button>
                        ${routine.status === 'active'
                            ? `<button class="secondary" onclick="pauseRoutine('${routine.id}')">⏸ Pause</button>`
                            : routine.status === 'paused'
                                ? `<button class="secondary" onclick="resumeRoutine('${routine.id}')">▶ Resume</button>`
                                : ''
                        }
                        <button class="danger" onclick="deleteRoutine('${routine.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleRoutineDetails(id) {
    const details = document.getElementById(`details-${id}`);
    const expandIcon = document.getElementById(`expand-${id}`);
    if (details.style.display === 'none') {
        details.style.display = 'block';
        expandIcon.textContent = '▲';
    } else {
        details.style.display = 'none';
        expandIcon.textContent = '▼';
    }
}

// Format relative time (e.g., "2 hours ago", "in 30 minutes")
function formatRelativeTime(date) {
    const now = new Date();
    const diff = date - now;
    const absDiff = Math.abs(diff);
    const isPast = diff < 0;

    if (absDiff < 60000) return isPast ? 'just now' : 'soon';
    if (absDiff < 3600000) {
        const mins = Math.round(absDiff / 60000);
        return isPast ? `${mins}m ago` : `in ${mins}m`;
    }
    if (absDiff < 86400000) {
        const hours = Math.round(absDiff / 3600000);
        return isPast ? `${hours}h ago` : `in ${hours}h`;
    }
    const days = Math.round(absDiff / 86400000);
    return isPast ? `${days}d ago` : `in ${days}d`;
}

let routineChainCount = 0;

function showCreateRoutine() {
    document.getElementById('createRoutineModal').classList.add('show');
    // Add initial task if chain is empty
    const builder = document.getElementById('routineChainBuilder');
    if (builder.children.length === 0) {
        addRoutineChainTask();
    }
}

function hideCreateRoutine() {
    document.getElementById('createRoutineModal').classList.remove('show');
}

function addRoutineChainTask() {
    routineChainCount++;
    const builder = document.getElementById('routineChainBuilder');
    const taskNum = builder.children.length + 1;

    // Build agent options, default to appropriate agent based on task number
    const defaultAgent = taskNum === 1 ? 'BOSS' : 'Code';
    const agentOptions = Object.keys(roles).map(name =>
        `<option value="${name}" ${name === defaultAgent ? 'selected' : ''}>${name}</option>`
    ).join('');

    // Show dependency visualization for tasks after the first
    const depVisual = taskNum > 1 ? `
        <div class="routine-dep-visual">
            <span class="dep-label">Depends on:</span>
            <span class="dep-arrow">←</span>
            <span class="dep-prev">Task ${taskNum - 1} (linear chain)</span>
        </div>
    ` : '';

    const taskHtml = `
        <div class="routine-chain-item" id="routineTask${routineChainCount}" data-task-num="${routineChainCount}" draggable="true">
            <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
            <div class="routine-chain-header">
                <div class="routine-chain-step-num">
                    <span class="routine-chain-num">${taskNum}</span>
                    ${taskNum > 1 ? '<span class="routine-chain-arrow">← from previous</span>' : '<span style="color: #2ecc71; font-size: 0.75rem;">Start</span>'}
                </div>
                <button type="button" class="routine-chain-remove" onclick="removeRoutineChainTask(${routineChainCount})" title="Remove task">×</button>
            </div>

            <div class="routine-task-field">
                <div class="routine-task-field-label">
                    <span>WHAT</span>
                    <span class="badge required">required</span>
                </div>
                <input type="text" class="chain-what" placeholder="What should this agent do? (e.g., Research trending Roblox game mechanics)" />
            </div>

            <div class="routine-task-field">
                <div class="routine-task-field-label">
                    <span>CONTEXT</span>
                    <span class="badge optional">optional</span>
                </div>
                <textarea class="chain-context" placeholder="Background info, references, or data the agent needs..."></textarea>
            </div>

            <div class="routine-task-field">
                <div class="routine-task-field-label">
                    <span>CONSTRAINTS</span>
                    <span class="badge optional">optional</span>
                </div>
                <textarea class="chain-constraints" placeholder="Limits, format requirements, or rules to follow..." style="min-height: 40px;"></textarea>
            </div>

            <div class="routine-task-meta">
                <div class="routine-task-meta-item">
                    <label>Assignee:</label>
                    <select class="chain-assignee">${agentOptions}</select>
                </div>
                <div class="routine-task-meta-item">
                    <label>Output:</label>
                    <select class="chain-output">
                        <option value="hub">Hub message</option>
                        <option value="report">Save as report</option>
                        <option value="code">Code file</option>
                    </select>
                </div>
            </div>
            ${depVisual}
        </div>
    `;
    builder.insertAdjacentHTML('beforeend', taskHtml);

    // Add drag-drop event listeners to the new task
    const newTask = document.getElementById(`routineTask${routineChainCount}`);
    initChainTaskDragEvents(newTask);

    renumberChainTasks();
}

// Drag-drop reordering for chain builder tasks
let draggedChainTask = null;

function initChainTaskDragEvents(taskEl) {
    taskEl.addEventListener('dragstart', handleChainDragStart);
    taskEl.addEventListener('dragend', handleChainDragEnd);
    taskEl.addEventListener('dragover', handleChainDragOver);
    taskEl.addEventListener('dragenter', handleChainDragEnter);
    taskEl.addEventListener('dragleave', handleChainDragLeave);
    taskEl.addEventListener('drop', handleChainDrop);
}

function handleChainDragStart(e) {
    draggedChainTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.id);
}

function handleChainDragEnd(e) {
    this.classList.remove('dragging');
    // Remove drag-over class from all items
    document.querySelectorAll('.routine-chain-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    draggedChainTask = null;
}

function handleChainDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleChainDragEnter(e) {
    e.preventDefault();
    if (this !== draggedChainTask) {
        this.classList.add('drag-over');
    }
}

function handleChainDragLeave(e) {
    // Only remove class if leaving the element entirely
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
    }
}

function handleChainDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    if (draggedChainTask && this !== draggedChainTask) {
        const builder = document.getElementById('routineChainBuilder');
        const items = Array.from(builder.querySelectorAll('.routine-chain-item'));
        const draggedIndex = items.indexOf(draggedChainTask);
        const dropIndex = items.indexOf(this);

        // Insert dragged item before or after drop target based on position
        if (draggedIndex < dropIndex) {
            this.parentNode.insertBefore(draggedChainTask, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedChainTask, this);
        }

        // Renumber all tasks after reorder
        renumberChainTasks();
    }
}

function removeRoutineChainTask(id) {
    const task = document.getElementById(`routineTask${id}`);
    if (task) {
        task.remove();
        renumberChainTasks();
    }
}

function renumberChainTasks() {
    const items = document.querySelectorAll('.routine-chain-item');
    items.forEach((item, i) => {
        const num = i + 1;
        item.querySelector('.routine-chain-num').textContent = num;
        const arrow = item.querySelector('.routine-chain-arrow');
        if (arrow) {
            if (num > 1) {
                arrow.textContent = '← from previous';
                arrow.style.display = '';
            } else {
                arrow.style.display = 'none';
            }
        }
        // Update start label visibility
        const startLabel = item.querySelector('.routine-chain-step-num > span:last-child:not(.routine-chain-arrow)');
        if (startLabel && !startLabel.classList.contains('routine-chain-num')) {
            startLabel.style.display = num === 1 ? '' : 'none';
        }
        // Update dependency visual
        const depVisual = item.querySelector('.routine-dep-visual');
        if (depVisual) {
            if (num > 1) {
                depVisual.style.display = '';
                const depPrev = depVisual.querySelector('.dep-prev');
                if (depPrev) depPrev.textContent = `Task ${num - 1} (linear chain)`;
            } else {
                depVisual.style.display = 'none';
            }
        }
    });
}

function createRoutine() {
    const name = document.getElementById('routineName').value.trim();
    const description = document.getElementById('routineDescription').value.trim();
    const intervalValue = parseInt(document.getElementById('routineIntervalValue').value);
    const intervalUnit = parseInt(document.getElementById('routineIntervalUnit').value);

    if (!name) {
        alert('Routine name is required');
        return;
    }

    // Collect tasks from the chain builder
    const taskItems = document.querySelectorAll('.routine-chain-item');
    const tasks = [];

    taskItems.forEach((item, index) => {
        const what = item.querySelector('.chain-what').value.trim();
        const context = item.querySelector('.chain-context').value.trim();
        const constraints = item.querySelector('.chain-constraints').value.trim();
        const assignee = item.querySelector('.chain-assignee').value;
        const output = item.querySelector('.chain-output').value;

        if (what) {
            // Build description in WHAT/CONTEXT/CONSTRAINTS format
            let description = `[WHAT] ${what}`;
            if (context) description += `\n[CONTEXT] ${context}`;
            if (constraints) description += `\n[CONSTRAINTS] ${constraints}`;

            tasks.push({
                description,
                assignee,
                context: context || '',
                output,
                skills: [],
                parallel: false  // Linear chain by default
            });
        }
    });

    if (tasks.length === 0) {
        alert('At least one task with a WHAT field is required');
        return;
    }

    // Send as create_schedule for backend
    ws.send(JSON.stringify({
        type: 'create_schedule',
        name,
        description,
        interval_seconds: intervalValue * intervalUnit,
        tasks,
    }));

    // Reset form
    document.getElementById('routineName').value = '';
    document.getElementById('routineDescription').value = '';
    document.getElementById('routineChainBuilder').innerHTML = '';
    routineChainCount = 0;
    hideCreateRoutine();
}

function triggerRoutine(id) {
    ws.send(JSON.stringify({ type: 'trigger_schedule', id }));
}

function pauseRoutine(id) {
    ws.send(JSON.stringify({ type: 'pause_schedule', id }));
}

function resumeRoutine(id) {
    ws.send(JSON.stringify({ type: 'resume_schedule', id }));
}

function deleteRoutine(id) {
    if (confirm('Delete this routine?')) {
        ws.send(JSON.stringify({ type: 'delete_schedule', id }));
    }
}

// ===== PROJECTS TAB =====
async function fetchProjects() {
    try {
        const res = await fetch(`${API_URL}/projects`);
        projects = await res.json();
        renderProjectList();
        updateProjectSwitcher();
    } catch (e) {
        console.error('Failed to fetch projects:', e);
        projects = [];
    }
}

function renderProjectList() {
    const list = document.getElementById('projectList');
    if (!list) return;
    
    const filtered = showArchivedProjects 
        ? projects 
        : projects.filter(p => !p.archived);
    
    if (filtered.length === 0) {
        list.innerHTML = '<div style="color: #666; padding: 1rem; text-align: center;">No projects</div>';
        return;
    }
    
    list.innerHTML = filtered.map(p => {
        const isActive = currentProject && currentProject.id === p.id;
        const icon = p.type === 'game' ? '🎮' : p.type === 'website' ? '🌐' : p.type === 'research' ? '📊' : '📁';
        return `
            <div class="project-item ${isActive ? 'active' : ''} ${p.archived ? 'archived' : ''}" 
                 onclick="selectProject('${p.id}')">
                <div class="project-item-icon">${icon}</div>
                <div class="project-item-content">
                    <div class="project-item-name">${escapeHtml(p.name)}</div>
                    <div class="project-item-path">${escapeHtml(p.path)}</div>
                </div>
                ${p.archived ? '<span class="project-archived-badge">Archived</span>' : ''}
            </div>
        `;
    }).join('');
}

async function selectProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    currentProject = project;
    renderProjectList();
    
    const details = document.getElementById('projectDetails');
    if (!details) return;
    
    const icon = project.type === 'game' ? '🎮' : project.type === 'website' ? '🌐' : project.type === 'research' ? '📊' : '📁';
    
    details.innerHTML = `
        <div class="project-details-header">
            <div>
                <div class="project-details-icon">${icon}</div>
                <div>
                    <h2>${escapeHtml(project.name)}</h2>
                    <div class="project-details-meta">
                        ${project.type}${project.subtype ? ` · ${project.subtype}` : ''}
                        ${project.archived ? ' · <span style="color: #e67e22;">Archived</span>' : ''}
                    </div>
                </div>
            </div>
            <div class="project-actions">
                <button onclick="openProjectFolder('${project.id}')">Open Folder</button>
                ${!project.archived 
                    ? `<button onclick="archiveProject('${project.id}')">Archive</button>`
                    : `<button onclick="unarchiveProject('${project.id}')">Restore</button>`
                }
                <button onclick="deleteProject('${project.id}')" style="background: #e74c3c;">Delete</button>
            </div>
        </div>
        
        <div class="project-details-section">
            <h3>Path</h3>
            <div class="project-path-display">${escapeHtml(project.path)}</div>
        </div>
        
        ${project.description ? `
            <div class="project-details-section">
                <h3>Description</h3>
                <p>${escapeHtml(project.description)}</p>
            </div>
        ` : ''}
        
        <div class="project-details-section">
            <h3>Details</h3>
            <div class="project-details-grid">
                <div>
                    <strong>Created:</strong> ${new Date(project.created_at).toLocaleDateString()}
                </div>
                <div>
                    <strong>ID:</strong> ${project.id}
                </div>
            </div>
        </div>
    `;
}

function showCreateProject() {
    document.getElementById('createProjectModal').classList.add('show');
    document.getElementById('projectNameCreate').value = '';
    document.getElementById('projectParentDir').value = '';
    document.getElementById('projectSubtype').value = '';
    document.getElementById('projectName').value = '';
    document.getElementById('projectPath').value = '';
    
    // Reset type chips
    document.querySelectorAll('.type-chip').forEach(chip => {
        chip.classList.remove('selected');
        if (chip.dataset.type === 'game') chip.classList.add('selected');
    });
    
    setProjectMode('create');
}

function hideCreateProject() {
    document.getElementById('createProjectModal').classList.remove('show');
}

function setProjectMode(mode) {
    const createTab = document.getElementById('modeCreateNew');
    const linkTab = document.getElementById('modeLinkExisting');
    const createForm = document.getElementById('projectCreateForm');
    const linkForm = document.getElementById('projectLinkForm');
    
    if (mode === 'create') {
        createTab.classList.add('active');
        linkTab.classList.remove('active');
        createForm.style.display = 'block';
        linkForm.style.display = 'none';
    } else {
        createTab.classList.remove('active');
        linkTab.classList.add('active');
        createForm.style.display = 'none';
        linkForm.style.display = 'block';
    }
}

async function createProject() {
    const mode = document.getElementById('projectCreateForm').style.display !== 'none' ? 'create' : 'link';
    
    let name, path, type, subtype, description;
    
    if (mode === 'create') {
        name = document.getElementById('projectNameCreate').value.trim();
        const parentDir = document.getElementById('projectParentDir').value.trim();
        const selectedType = document.querySelector('.type-chip.selected');
        type = selectedType ? selectedType.dataset.type : 'other';
        subtype = document.getElementById('projectSubtype').value.trim();
        
        if (!name) {
            alert('Please enter a project name');
            return;
        }
        if (!parentDir) {
            alert('Please enter a parent directory');
            return;
        }
        
        path = `${parentDir}/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    } else {
        name = document.getElementById('projectName').value.trim();
        path = document.getElementById('projectPath').value.trim();
        description = document.getElementById('projectDescription').value.trim();
        type = 'other';
        
        if (!name || !path) {
            alert('Please enter both name and path');
            return;
        }
    }
    
    try {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path, type, subtype, description })
        });
        
        if (!res.ok) throw new Error('Failed to create project');
        
        await fetchProjects();
        hideCreateProject();
    } catch (e) {
        alert('Error creating project: ' + e.message);
    }
}

async function openProjectFolder(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    try {
        await fetch(`${API_URL}/projects/${id}/open`, { method: 'POST' });
    } catch (e) {
        console.error('Failed to open project folder:', e);
    }
}

async function archiveProject(id) {
    if (!confirm('Archive this project?')) return;
    
    try {
        await fetch(`${API_URL}/projects/${id}/archive`, { method: 'POST' });
        await fetchProjects();
        if (currentProject && currentProject.id === id) {
            await selectProject(id);
        }
    } catch (e) {
        alert('Error archiving project: ' + e.message);
    }
}

async function unarchiveProject(id) {
    try {
        await fetch(`${API_URL}/projects/${id}/unarchive`, { method: 'POST' });
        await fetchProjects();
        if (currentProject && currentProject.id === id) {
            await selectProject(id);
        }
    } catch (e) {
        alert('Error restoring project: ' + e.message);
    }
}

async function deleteProject(id) {
    if (!confirm('Delete this project? This will NOT delete files, only remove it from the list.')) return;
    
    try {
        await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
        await fetchProjects();
        if (currentProject && currentProject.id === id) {
            currentProject = null;
            document.getElementById('projectDetails').innerHTML = `
                <div class="project-details-empty">
                    <div style="color: #666; text-align: center; padding: 2rem;">
                        Select a project to view details
                    </div>
                </div>
            `;
        }
    } catch (e) {
        alert('Error deleting project: ' + e.message);
    }
}

function toggleShowArchived() {
    showArchivedProjects = !showArchivedProjects;
    const btn = document.getElementById('showArchivedBtn');
    btn.textContent = showArchivedProjects ? 'Hide Archived' : 'Show Archived';
    renderProjectList();
}

function updateProjectSwitcher() {
    const switcher = document.getElementById('projectSwitcher');
    if (!switcher) return;
    
    const activeProjects = projects.filter(p => !p.archived);
    const currentValue = switcher.value;
    
    switcher.innerHTML = '<option value="">DEFAULT</option>' + 
        activeProjects.map(p => 
            `<option value="${p.id}">${escapeHtml(p.name)}</option>`
        ).join('');
    
    // Restore previous selection if it still exists
    if (currentValue && activeProjects.find(p => p.id === currentValue)) {
        switcher.value = currentValue;
    }
}

function onProjectSwitcherChange() {
    const switcher = document.getElementById('projectSwitcher');
    const projectId = switcher.value;
    
    // TODO: Implement project switching logic
    // This would change the working directory context for agents
    console.log('Project switched to:', projectId || 'DEFAULT');
}

// ===== LEARNING TAB =====
async function fetchSuggestions() {
    try {
        const res = await fetch(`${API_URL}/suggestions`);
        const data = await res.json();
        suggestions = data.suggestions || [];
        renderSuggestions();
    } catch (e) {
        console.error('Failed to fetch suggestions:', e);
    }
}

function filterSuggestions() {
    renderSuggestions();
}

function renderSuggestions() {
    const list = document.getElementById('suggestionsList');
    if (!list) return;

    const statusFilter = document.getElementById('suggestionStatusFilter')?.value || 'pending';
    const categoryFilter = document.getElementById('suggestionCategoryFilter')?.value || 'all';

    let filtered = suggestions;

    // Apply status filter
    if (statusFilter !== 'all') {
        filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(s => s.category === categoryFilter);
    }

    // Sort: pending first, then by created_at desc
    filtered.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return (b.created_at || '').localeCompare(a.created_at || '');
    });

    if (filtered.length === 0) {
        const emptyMessage = statusFilter === 'pending'
            ? 'No pending suggestions'
            : `No ${statusFilter} suggestions`;
        list.innerHTML = `
            <div class="suggestions-empty">
                <div class="suggestions-empty-icon">💡</div>
                <div>${emptyMessage}</div>
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(suggestion => {
        const isPending = suggestion.status === 'pending';
        const isApproved = suggestion.status === 'approved';

        // Build context section if present
        let contextHtml = '';
        if (suggestion.context) {
            const ctx = suggestion.context;
            let contextItems = '';
            if (ctx.related_tasks?.length) {
                contextItems += `<div class="suggestion-context-item">
                    <span class="suggestion-context-label">Tasks:</span>
                    <span>${ctx.related_tasks.join(', ')}</span>
                </div>`;
            }
            if (ctx.files_mentioned?.length) {
                contextItems += `<div class="suggestion-context-item">
                    <span class="suggestion-context-label">Files:</span>
                    <span>${ctx.files_mentioned.join(', ')}</span>
                </div>`;
            }
            if (ctx.evidence) {
                contextItems += `<div class="suggestion-context-item">
                    <span class="suggestion-context-label">Evidence:</span>
                    <span>${escapeHtml(ctx.evidence)}</span>
                </div>`;
            }
            if (contextItems) {
                contextHtml = `
                    <div class="suggestion-context">
                        <div class="suggestion-context-header" onclick="toggleSuggestionContext('${suggestion.id}')">
                            ▶ Context
                        </div>
                        <div class="suggestion-context-body" id="context-${suggestion.id}">
                            ${contextItems}
                        </div>
                    </div>
                `;
            }
        }

        // Build actions
        let actionsHtml = '';
        if (isPending) {
            actionsHtml = `
                <div class="suggestion-actions">
                    <button class="approve" onclick="approveSuggestion('${suggestion.id}')">Approve</button>
                    <button class="reject" onclick="rejectSuggestion('${suggestion.id}')">Reject</button>
                </div>
            `;
        } else if (isApproved) {
            actionsHtml = `
                <div class="suggestion-actions">
                    <button class="implement" onclick="implementSuggestion('${suggestion.id}')">Mark Implemented</button>
                </div>
            `;
        }

        // Build decision info
        let decisionHtml = '';
        if (suggestion.decided_at) {
            const time = new Date(suggestion.decided_at).toLocaleString();
            decisionHtml = `
                <div class="suggestion-decision">
                    ${suggestion.decision === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    <span class="suggestion-decision-time">${time}</span>
                    ${suggestion.decision_notes ? `<br><em>${escapeHtml(suggestion.decision_notes)}</em>` : ''}
                </div>
            `;
        }

        return `
            <div class="suggestion-card ${suggestion.status}">
                <div class="suggestion-header">
                    <span class="suggestion-source">${suggestion.source_agent}</span>
                    <span class="suggestion-category ${suggestion.category}">${suggestion.category}</span>
                    <span class="suggestion-status ${suggestion.status}">${suggestion.status}</span>
                </div>
                <div class="suggestion-title">${escapeHtml(suggestion.title || '')}</div>
                <div class="suggestion-content">${escapeHtml(suggestion.content || '')}</div>
                ${contextHtml}
                ${actionsHtml}
                ${decisionHtml}
            </div>
        `;
    }).join('');
}

function toggleSuggestionContext(id) {
    const body = document.getElementById(`context-${id}`);
    if (body) {
        body.classList.toggle('show');
        const header = body.previousElementSibling;
        if (header) {
            header.textContent = body.classList.contains('show') ? '▼ Context' : '▶ Context';
        }
    }
}

async function approveSuggestion(id) {
    try {
        const res = await fetch(`${API_URL}/suggestions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decision: 'approved' })
        });
        if (res.ok) {
            await fetchSuggestions();
        }
    } catch (e) {
        console.error('Failed to approve suggestion:', e);
    }
}

async function rejectSuggestion(id) {
    const notes = prompt('Rejection reason (optional):');
    try {
        const res = await fetch(`${API_URL}/suggestions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decision: 'rejected', decision_notes: notes || '' })
        });
        if (res.ok) {
            await fetchSuggestions();
        }
    } catch (e) {
        console.error('Failed to reject suggestion:', e);
    }
}

async function implementSuggestion(id) {
    try {
        const res = await fetch(`${API_URL}/suggestions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'implemented' })
        });
        if (res.ok) {
            await fetchSuggestions();
        }
    } catch (e) {
        console.error('Failed to mark suggestion implemented:', e);
    }
}

// ===== FILE EXPLORER =====
let fileTree = [];
let selectedFilePath = null;

async function fetchFileTree() {
    try {
        const res = await fetch(`${API_URL}/files`);
        const data = await res.json();
        fileTree = data.tree;
        renderFileTree();
    } catch (e) {
        console.error('Failed to fetch file tree:', e);
    }
}

function refreshFileTree() {
    fetchFileTree();
}

function renderFileTree() {
    const container = document.getElementById('fileTree');
    container.innerHTML = renderTreeItems(fileTree, 0);
}

function renderTreeItems(items, depth) {
    return items.map(item => {
        if (item.type === 'folder') {
            const childrenHtml = item.children?.length
                ? `<div class="tree-children collapsed" id="children-${item.path.replace(/[\/\.]/g, '-')}">${renderTreeItems(item.children, depth + 1)}</div>`
                : '';
            return `
                <div class="tree-item folder" onclick="toggleFolder(event, '${item.path}')">
                    <span class="icon">📁</span>
                    <span class="name">${item.name}</span>
                </div>
                ${childrenHtml}
            `;
        } else {
            const size = formatFileSize(item.size);
            return `
                <div class="tree-item file" onclick="selectFile('${item.path}')" ondblclick="openInExplorer('${item.path}')">
                    <span class="icon">${getFileIcon(item.name)}</span>
                    <span class="name">${item.name}</span>
                    <span class="size">${size}</span>
                </div>
            `;
        }
    }).join('');
}

function getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const icons = {
        'py': '🐍',
        'js': '📜',
        'html': '🌐',
        'css': '🎨',
        'json': '📋',
        'md': '📝',
        'txt': '📄',
        'env': '🔐',
    };
    return icons[ext] || '📄';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function toggleFolder(event, path) {
    event.stopPropagation();
    const childrenId = 'children-' + path.replace(/[\/\.]/g, '-');
    const children = document.getElementById(childrenId);
    if (children) {
        children.classList.toggle('collapsed');
        // Toggle folder icon
        const icon = event.currentTarget.querySelector('.icon');
        if (children.classList.contains('collapsed')) {
            icon.textContent = '📁';
        } else {
            icon.textContent = '📂';
        }
    }
}

async function selectFile(path) {
    // Update selection
    document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    selectedFilePath = path;
    document.getElementById('filePath').textContent = path;
    document.getElementById('openFileBtn').style.display = 'inline-block';

    // Fetch file content
    try {
        const res = await fetch(`${API_URL}/files/read?path=${encodeURIComponent(path)}`);
        const data = await res.json();

        const contentEl = document.getElementById('fileContent');
        if (data.error) {
            contentEl.textContent = `Error: ${data.error}`;
            contentEl.classList.add('empty');
        } else {
            contentEl.textContent = data.content;
            contentEl.classList.remove('empty');
        }
    } catch (e) {
        document.getElementById('fileContent').textContent = `Error: ${e}`;
    }
}

async function openInExplorer(path) {
    try {
        await fetch(`${API_URL}/files/open-explorer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path }),
        });
    } catch (e) {
        console.error('Failed to open explorer:', e);
    }
}

function openSelectedInExplorer() {
    if (selectedFilePath) {
        openInExplorer(selectedFilePath);
    }
}

// Load file tree on init
fetchFileTree();

// Live token display updater - called when streaming tokens arrive
function updateLiveTokenDisplay(agent) {
    const tokens = liveTokens[agent];
    if (!tokens) return;

    // Find any in_progress task card for this agent and update its token display
    const taskItems = document.querySelectorAll('.hub-task-item.in_progress');
    taskItems.forEach(item => {
        const agentEl = item.querySelector('.hub-task-agent');
        if (agentEl && agentEl.textContent === agent) {
            let tokenEl = item.querySelector('.live-token-count');
            if (!tokenEl) {
                tokenEl = document.createElement('span');
                tokenEl.className = 'live-token-count';
                tokenEl.style.cssText = 'margin-left: auto; font-size: 0.75rem; color: #5dade2; font-family: monospace;';
                item.querySelector('div').appendChild(tokenEl);
            }
            const total = tokens.input + tokens.output;
            tokenEl.textContent = formatTokens(total);
        }
    });
}

// Clear live tokens when task completes
function clearLiveTokens(agent) {
    delete liveTokens[agent];
}

// WebSocket
let wsConnectAttempt = 0;

function connect() {
    wsConnectAttempt++;
    console.log('[WS] Connecting to', WS_URL, '(attempt #' + wsConnectAttempt + ')');
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log('[WS] Connection OPEN at', new Date().toISOString());
        console.log('[WS] readyState:', ws.readyState, '(1 = OPEN)');
        wsConnectAttempt = 0;  // Reset on successful connect
        statusEl.textContent = 'Connected';
        statusEl.classList.add('connected');
        const wsStatusEl = document.getElementById('wsStatus');
        if (wsStatusEl) {
            wsStatusEl.textContent = 'Connected';
            wsStatusEl.className = 'ws-status connected';
        }
        sendBtn.disabled = false;
    };

    ws.onclose = (event) => {
        console.log('[WS] Connection CLOSED at', new Date().toISOString());
        console.log('[WS]   code:', event.code, 'reason:', event.reason || '(none)', 'wasClean:', event.wasClean);
        statusEl.textContent = 'Disconnected';
        statusEl.classList.remove('connected');
        const wsStatusEl = document.getElementById('wsStatus');
        if (wsStatusEl) {
            wsStatusEl.textContent = 'Disconnected';
            wsStatusEl.className = 'ws-status error';
        }
        sendBtn.disabled = true;
        console.log('[WS] Reconnecting in 2s...');
        setTimeout(connect, 2000);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('[WS] Message received:', data.type, 'at', new Date().toISOString());

        if (data.type === 'message') {
            console.log('[WS] message - from:', data.data.sender);
            hideThinking();  // Hide thinking when we get a response
            addMessage(data.data);
        } else if (data.type === 'tasks_update') {
            const prevTaskCount = tasks.length;
            const prevStatuses = tasks.map(t => `${t.id}(${t.status})`).join(', ');
            console.log('[WS] tasks_update - received', data.data.length, 'tasks (was', prevTaskCount, ')');
            console.log('[WS]   NEW task list:', data.data.map(t => `${t.id}(${t.status})`).join(', ') || '(empty)');
            if (prevTaskCount > 0) {
                console.log('[WS]   OLD task list:', prevStatuses);
            }
            // Clear live tokens for agents whose tasks are no longer in_progress
            const inProgressAgents = new Set(data.data.filter(t => t.status === 'in_progress').map(t => t.assignee));
            Object.keys(liveTokens).forEach(agent => {
                if (!inProgressAgents.has(agent)) {
                    delete liveTokens[agent];
                }
            });
            tasks = data.data;
            renderHubTasks();
            console.log('[WS]   renderHubTasks() complete, DOM updated');
        } else if (data.type === 'schedules_update') {
            console.log('[WS] schedules_update - received', data.data.length, 'routines');
            routines = data.data;
            renderRoutines();
        } else if (data.type === 'thinking') {
            console.log('[WS] thinking -', data.agent, data.active ? 'STARTED' : 'STOPPED');
            // Server broadcasts thinking state with agent name
            if (data.active) {
                showThinking(data.agent || 'Agent');
            } else {
                hideThinking();
            }
        } else if (data.type === 'agent_statuses') {
            const activeAgents = Object.entries(data.data).filter(([n, i]) => i.status !== 'idle').map(([n, i]) => `${n}(${i.status})`);
            if (activeAgents.length > 0) {
                console.log('[WS] agent_statuses - active:', activeAgents.join(', '));
            }
            // Update activity bar with all agent statuses
            updateActivityBar(data.data);
        } else if (data.type === 'agent_stats_update') {
            // Real-time agent stats for cards
            agentStats = data.data;
            // Update in-place to preserve terminals
            if (document.querySelector('.agent-card')) {
                updateAgentStatsInPlace();
            } else {
                renderAgentCards();
            }
        } else if (data.type === 'suggestions_update') {
            console.log('[WS] suggestions_update - received', data.data.length, 'suggestions');
            suggestions = data.data;
            renderSuggestions();
        } else if (data.type === 'projects_update') {
            console.log('[WS] projects_update - received', data.data.length, 'projects');
            projects = data.data;
            renderProjectList();
            updateProjectSwitcher();
        } else if (data.type === 'live_tokens') {
            // Live token updates during agent streaming
            liveTokens[data.agent] = {
                input: data.input_tokens,
                output: data.output_tokens
            };
            updateLiveTokenDisplay(data.agent);
        } else if (data.type === 'terminal_output') {
            // Terminal output from agent CLI
            handleTerminalOutput(data.agent, data.line);
        } else if (data.type === 'agent_error') {
            // Agent error notification - show prominently
            console.error('[WS] AGENT ERROR:', data.agent, data.error);
            showAgentError(data.agent, data.time, data.error);
        } else {
            console.log('[WS] Unknown message type:', data.type, data);
        }
    };

    ws.onerror = (err) => {
        console.error('[WS] ERROR at', new Date().toISOString(), ':', err);
        console.error('[WS]   readyState:', ws ? ws.readyState : 'null');
    };
}

// Restart server
async function restartServer() {
    if (!confirm('Restart the server?')) return;
    try {
        await fetch(`${API_URL}/restart`, { method: 'POST' });
    } catch (e) {
        // Expected - server is shutting down
    }
    statusEl.textContent = 'Restarting...';
    statusEl.classList.remove('connected');

    // Poll until server is back up, then reload
    const checkServer = async () => {
        try {
            const resp = await fetch(`${API_URL}/health`, { method: 'GET' });
            if (resp.ok) {
                window.location.reload();
                return;
            }
        } catch (e) {
            // Still down, keep polling
        }
        setTimeout(checkServer, 500);
    };
    setTimeout(checkServer, 1500);  // Wait a bit before starting to poll
}

// Event listeners
sendBtn.onclick = sendMessage;
inputEl.onkeydown = (e) => { if (e.key === 'Enter') sendMessage(); };

// Type chip selection
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('type-chip')) {
        document.querySelectorAll('.type-chip').forEach(chip => chip.classList.remove('selected'));
        e.target.classList.add('selected');
    }
});

// Initialize
console.log('[INIT] Game Studio frontend starting...');
console.log('[INIT] WS_URL:', WS_URL);
console.log('[INIT] API_URL:', API_URL);
fetchRoles();
fetchHistory();
fetchSuggestions();
fetchProjects();
fetchSessionTokens();  // Fetch session token stats (includes BOSS)
connect();
updateAutoApproveUI();  // Set initial toggle state
initTaskFilter();  // Set task filter from localStorage

// Poll agent stats every 5 seconds
setInterval(fetchAgentStats, 5000);
// Poll session tokens every 10 seconds
setInterval(fetchSessionTokens, 10000);

// Dev helper: expose state to console
window.studioDebug = {
    getTasks: () => tasks,
    getWsState: () => ws ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState] : 'null',
    reconnect: () => { if (ws) ws.close(); connect(); }
};
console.log('[INIT] Debug helpers available: studioDebug.getTasks(), studioDebug.getWsState(), studioDebug.reconnect()');
