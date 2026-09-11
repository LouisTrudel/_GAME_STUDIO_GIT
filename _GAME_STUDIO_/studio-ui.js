// Game Studio - UI Module
// DOM helpers, tabs, modals, activity indicators

// Tabs are handled in studio-core.js initApp()

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

    log('wsLogs', `${msg.sender}: ${msg.content.substring(0, 50)}...`, 'info');
}

// Auto-approve toggle
function toggleAutoApprove() {
    autoApprove = !autoApprove;
    localStorage.setItem('autoApprove', autoApprove);
    updateAutoApproveUI();

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

function updateBossLiveTokens(inputTokens, outputTokens) {
    // Update thinking indicator with live token count during BOSS streaming
    const thinkingText = document.getElementById('thinkingText');
    if (thinkingText && isThinking) {
        const total = (inputTokens || 0) + (outputTokens || 0);
        const formatted = formatTokens(total);
        thinkingText.textContent = `BOSS is thinking... (${formatted} tokens)`;
    }
}

// Activity bar - shows all active agents with minimum display time
const MIN_DISPLAY_MS = 500;

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
