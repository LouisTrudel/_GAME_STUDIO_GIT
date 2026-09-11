// Game Studio - Tasks Module
// Task rendering, filters, metrics, and actions

// Task management actions
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

// Compute aggregate quality metrics from all tasks
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
    let useAgentStats = false;

    // Primary: Use agent session data (matches agents tab)
    if (typeof agentStats !== 'undefined' && Object.keys(agentStats).length > 0) {
        useAgentStats = true;
        for (const [name, stats] of Object.entries(agentStats)) {
            totalInputTokens += stats.tokens_input || 0;
            totalOutputTokens += stats.tokens_output || 0;
            totalCacheRead += stats.tokens_cache_read || 0;
            totalCacheCreation += stats.tokens_cache_creation || 0;
        }
        // Calculate cost from tokens using Sonnet 4.5 pricing
        // Input: $3/M, Cache read: $0.30/M, Cache write: $3.75/M, Output: $15/M
        const inputCost = (totalInputTokens - totalCacheRead) * 3.0 / 1_000_000;
        const cacheReadCost = totalCacheRead * 0.30 / 1_000_000;
        const cacheWriteCost = totalCacheCreation * 3.75 / 1_000_000;
        const outputCost = totalOutputTokens * 15.0 / 1_000_000;
        totalCost = inputCost + cacheReadCost + cacheWriteCost + outputCost;
    }

    // Always aggregate task-specific metrics (non-cost)
    tasks.forEach(task => {
        if (!useAgentStats) {
            totalCost += task.cost?.usd || 0;
        }
        totalRetries += task.api_retries || 0;
        totalToolErrors += (task.tool_errors?.length || 0);
        totalTurns += task.num_turns || 0;
        totalToolUses += task.num_tool_uses || 0;
        if (task.is_error) errorCount++;
    });

    // Fallback: Use task.cost tokens if no agent data
    if (!useAgentStats) {
        tasks.forEach(task => {
            totalInputTokens += task.cost?.input_tokens || 0;
            totalOutputTokens += task.cost?.output_tokens || 0;
            totalCacheCreation += task.cost?.cache_creation_tokens || 0;
            totalCacheRead += task.cost?.cache_read_tokens || 0;
        });
    }

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

    if (metrics.totalTokens === 0 && metrics.cost === 0) {
        bar.innerHTML = '';
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'flex';

    const items = [];

    if (metrics.totalTokens > 0) {
        items.push(`<span class="metrics-item">
            <span class="metrics-value">${formatTokens(metrics.totalTokens)}</span>
            <span class="metrics-label">tokens</span>
        </span>`);
    }

    if (metrics.cost > 0) {
        items.push(`<span class="metrics-item">
            <span class="metrics-value cost">$${metrics.cost.toFixed(2)}</span>
            <span class="metrics-label">cost</span>
        </span>`);
    }

    if (metrics.retries > 0) {
        items.push(`<span class="metrics-item warning">
            <span class="metrics-value">${metrics.retries}</span>
            <span class="metrics-label">retries</span>
        </span>`);
    }

    if (metrics.toolErrors > 0) {
        items.push(`<span class="metrics-item error">
            <span class="metrics-value">${metrics.toolErrors}</span>
            <span class="metrics-label">errors</span>
        </span>`);
    }

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

    renderHubMetricsBar();

    let filteredTasks;
    let emptyMessage;

    if (taskFilter === 'active') {
        const activeStatuses = ['in_progress', 'ready', 'pending', 'blocked'];
        filteredTasks = tasks
            .filter(t => activeStatuses.includes(t.status))
            .sort((a, b) => {
                const priority = { in_progress: 0, ready: 1, pending: 2, blocked: 3 };
                return (priority[a.status] ?? 99) - (priority[b.status] ?? 99);
            });
        emptyMessage = 'No active tasks';
    } else if (taskFilter === 'done') {
        // Terminal statuses: approved, failed, error, partial
        const doneStatuses = ['approved', 'failed', 'error', 'partial'];
        filteredTasks = tasks
            .filter(t => doneStatuses.includes(t.status))
            .sort((a, b) => {
                const aTime = a.completed_at || a.created_at || '';
                const bTime = b.completed_at || b.created_at || '';
                return bTime.localeCompare(aTime);
            });
        emptyMessage = 'No completed tasks';
    }

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

        // Show token info - live stream for in_progress, breakdown for completed
        let tokenInfo = '';
        if (task.status === 'in_progress' && liveTokens[task.assignee]) {
            const lt = liveTokens[task.assignee];
            const total = (lt.input || 0) + (lt.output || 0);
            tokenInfo = `<span class="live-token-stream">${formatTokens(total)}</span>`;
        } else if (task.cost) {
            const inp = task.cost.input_tokens || 0;
            const out = task.cost.output_tokens || 0;
            const cached = task.cost.cache_read_tokens || 0;
            const cost = task.cost.usd || 0;
            if (inp + out > 0) {
                const tooltip = `Input: ${inp.toLocaleString()}\nOutput: ${out.toLocaleString()}${cached > 0 ? `\nCached: ${cached.toLocaleString()}` : ''}\nCost: $${cost.toFixed(2)}`;
                tokenInfo = `<span class="task-token-compact" title="${tooltip}">${formatTokens(inp + out)}${cached > 0 ? ` <span style="color:#27ae60">(${formatTokens(cached)})</span>` : ''} <span style="color:#f39c12">$${cost.toFixed(2)}</span></span>`;
            }
        }

        return `
            <div class="hub-task-item ${task.status}" onclick="showTaskDetailModal('${task.id}')">
                <div style="display: flex; align-items: center; gap: 0.3rem;">
                    <span class="hub-task-id">${task.id}</span>
                    <span class="hub-task-agent" style="color: ${agentColor}">${task.assignee}</span>
                    ${tokenInfo}
                    <span class="hub-task-status ${task.status}">${task.status.replace('_', ' ')}</span>
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

        if (duration > 0) {
            const durationStr = duration >= 60000
                ? `${(duration / 60000).toFixed(1)}m`
                : `${(duration / 1000).toFixed(1)}s`;
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value">${durationStr}</span>
                <span class="quality-metric-label">duration</span>
            </div>`);
        }

        if (cost > 0) {
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value cost">$${cost.toFixed(4)}</span>
                <span class="quality-metric-label">cost</span>
            </div>`);
        }

        if (numTurns > 0) {
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value">${numTurns}</span>
                <span class="quality-metric-label">turns</span>
            </div>`);
        }

        if (numToolUses > 0) {
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value">${numToolUses}</span>
                <span class="quality-metric-label">tool calls</span>
            </div>`);
        }

        if (retries > 0) {
            metricsItems.push(`<div class="quality-metric">
                <span class="quality-metric-value warning">${retries}</span>
                <span class="quality-metric-label">API retries</span>
            </div>`);
        }

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
