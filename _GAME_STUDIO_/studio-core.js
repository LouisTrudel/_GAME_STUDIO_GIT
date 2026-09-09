// Game Studio - Core Module
// WebSocket, state management, and initialization

const WS_URL = 'ws://127.0.0.1:8000/ws';
const API_URL = 'http://127.0.0.1:8000/api';

// T327: URL-based project routing
// Extract ?project= from URL for project context
function getUrlProjectId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('project') || null;
}

// Build API URL with project context
function apiUrl(endpoint, extraParams = {}) {
    const projectId = getUrlProjectId();
    const params = new URLSearchParams(extraParams);
    if (projectId) {
        params.set('project', projectId);
    }
    const queryString = params.toString();
    return queryString ? `${API_URL}${endpoint}?${queryString}` : `${API_URL}${endpoint}`;
}

// Get current project ID (from URL)
function getCurrentProjectId() {
    return getUrlProjectId();
}

// Global state
let ws = null;
let roles = {};
let agentStats = {};
let tasks = [];
let routines = [];
let suggestions = [];
let configAgent = null;
let autoApprove = localStorage.getItem('autoApprove') === 'true';
let isThinking = false;
let agentStatuses = {};
let activityBarTimeout = null;
let agentShowTimes = {};
let taskFilter = localStorage.getItem('taskFilter') || 'active';
let fileTree = [];
let selectedFilePath = null;
let routineChainCount = 0;
let wsConnectAttempt = 0;

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

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format helpers
function formatTokens(count) {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
}

function formatUptime(seconds) {
    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    return Math.floor(seconds / 3600) + 'h';
}

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

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Highlight @mentions
function highlightMentions(text) {
    return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
}

// WebSocket connection (T327: include project in WS URL)
function connect() {
    wsConnectAttempt++;
    const projectId = getUrlProjectId();
    const wsUrl = projectId ? `${WS_URL}?project=${projectId}` : WS_URL;
    console.log('[WS] Connecting to', wsUrl, '(attempt #' + wsConnectAttempt + ')');
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('[WS] Connection OPEN at', new Date().toISOString());
        console.log('[WS] readyState:', ws.readyState, '(1 = OPEN)');
        wsConnectAttempt = 0;
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
            hideThinking();
            addMessage(data.data);
        } else if (data.type === 'tasks_update') {
            const prevTaskCount = tasks.length;
            const prevStatuses = tasks.map(t => `${t.id}(${t.status})`).join(', ');
            console.log('[WS] tasks_update - received', data.data.length, 'tasks (was', prevTaskCount, ')');
            console.log('[WS]   NEW task list:', data.data.map(t => `${t.id}(${t.status})`).join(', ') || '(empty)');
            if (prevTaskCount > 0) {
                console.log('[WS]   OLD task list:', prevStatuses);
            }
            tasks = data.data;
            renderHubTasks();
            console.log('[WS]   renderHubTasks() complete, DOM updated');
        } else if (data.type === 'schedules_update') {
            console.log('[WS] schedules_update - received', data.data.length, 'routines');
            routines = data.data;
            renderRoutines();
        } else if (data.type === 'thinking') {
            console.log('[WS] thinking -', data.agent, data.active ? 'STARTED' : 'STOPPED');
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
            updateActivityBar(data.data);
        } else if (data.type === 'agent_stats_update') {
            agentStats = data.data;
            renderAgentCards();
        } else if (data.type === 'suggestions_update') {
            console.log('[WS] suggestions_update - received', data.data.length, 'suggestions');
            suggestions = data.data;
            renderSuggestions();
        } else if (data.type === 'projects_update') {
            console.log('[WS] projects_update - received', data.data.projects.length, 'projects');
            handleProjectsUpdate(data.data);
        } else {
            console.log('[WS] Unknown message type:', data.type, data);
        }
    };

    ws.onerror = (err) => {
        console.error('[WS] ERROR at', new Date().toISOString(), ':', err);
        console.error('[WS]   readyState:', ws ? ws.readyState : 'null');
    };
}

// Send message (T327: include project context)
function sendMessage() {
    const content = inputEl.value.trim();
    if (!content || !ws) return;

    addMessage({
        sender: 'user',
        content: content,
        timestamp: new Date().toISOString()
    });

    const projectId = getUrlProjectId();
    ws.send(JSON.stringify({ type: 'user_message', content, project: projectId }));
    inputEl.value = '';
    showThinking('BOSS');
    log('apiLogs', `Sent: ${content.substring(0, 50)}...`, 'info');
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
    setTimeout(checkServer, 1500);
}

// Initialize
function initApp() {
    console.log('[INIT] Game Studio frontend starting...');
    console.log('[INIT] WS_URL:', WS_URL);
    console.log('[INIT] API_URL:', API_URL);
    const projectId = getUrlProjectId();
    console.log('[INIT] Project context:', projectId || 'default (no ?project= param)');

    // Event listeners
    sendBtn.onclick = sendMessage;
    inputEl.onkeydown = (e) => { if (e.key === 'Enter') sendMessage(); };

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
        });
    });

    // Fetch initial data
    fetchRoles();
    fetchHistory();
    fetchSuggestions();
    fetchSchedules();
    fetchProjects();
    fetchFileTree();
    connect();
    updateAutoApproveUI();
    initTaskFilter();

    // Poll agent stats every 5 seconds
    setInterval(fetchAgentStats, 5000);

    // Dev helper: expose state to console
    window.studioDebug = {
        getTasks: () => tasks,
        getWsState: () => ws ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState] : 'null',
        reconnect: () => { if (ws) ws.close(); connect(); }
    };
    console.log('[INIT] Debug helpers available: studioDebug.getTasks(), studioDebug.getWsState(), studioDebug.reconnect()');
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
