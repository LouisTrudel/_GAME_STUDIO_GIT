// Game Studio - Suggestions Module
// Learning tab suggestions

async function fetchSuggestions() {
    console.log('[Suggestions] Fetching suggestions...');
    try {
        const res = await fetch(`${API_URL}/suggestions`);
        if (!res.ok) {
            console.error('[Suggestions] Fetch failed:', res.status, res.statusText);
            return;
        }
        const data = await res.json();
        suggestions = data.suggestions || [];
        console.log('[Suggestions] Loaded', suggestions.length, 'suggestions');
        renderSuggestions();
    } catch (e) {
        console.error('[Suggestions] Failed to fetch suggestions:', e);
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

    if (statusFilter !== 'all') {
        filtered = filtered.filter(s => s.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
        filtered = filtered.filter(s => s.category === categoryFilter);
    }

    filtered.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        // Within pending: non-deferred first, then deferred at bottom
        if (a.status === 'pending' && b.status === 'pending') {
            if (a.kept_for_later && !b.kept_for_later) return 1;
            if (!a.kept_for_later && b.kept_for_later) return -1;
        }
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

        let actionsHtml = '';
        if (isPending) {
            // Check if suggestion is on shared cooldown (all buttons)
            const onCooldown = isOnCooldown(suggestion.id);
            const cooldownClass = onCooldown ? 'cooldown' : '';
            const disabled = onCooldown ? 'disabled' : '';
            const isDeferred = suggestion.kept_for_later;

            actionsHtml = `
                <div class="suggestion-actions">
                    <button class="approve ${cooldownClass}" onclick="approveSuggestion('${suggestion.id}')" ${disabled}>Approve</button>
                    <button class="reject ${cooldownClass}" onclick="rejectSuggestion('${suggestion.id}')" ${disabled}>Reject</button>
                    <button class="discuss ${cooldownClass}" data-suggestion-id="${suggestion.id}" onclick="discussSuggestion('${suggestion.id}')" ${disabled}>Discuss</button>
                    <button class="later ${cooldownClass}${isDeferred ? ' deferred' : ''}" onclick="deferSuggestion('${suggestion.id}')" ${disabled}>${isDeferred ? 'Deferred' : 'Later'}</button>
                </div>
            `;
        } else if (isApproved) {
            actionsHtml = `
                <div class="suggestion-actions">
                    <button class="implement" onclick="implementSuggestion('${suggestion.id}')">Mark Implemented</button>
                </div>
            `;
        }

        let decisionHtml = '';
        if (suggestion.decided_at) {
            const time = new Date(suggestion.decided_at).toLocaleString();
            const implTasks = suggestion.implementation_tasks || [];
            const tasksHtml = implTasks.length > 0
                ? `<div class="suggestion-impl-tasks">Tasks: ${implTasks.map(t => `<span class="task-link">${t}</span>`).join(', ')}</div>`
                : '';
            decisionHtml = `
                <div class="suggestion-decision">
                    ${suggestion.decision === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    <span class="suggestion-decision-time">${time}</span>
                    ${suggestion.decision_notes ? `<br><em>${escapeHtml(suggestion.decision_notes)}</em>` : ''}
                    ${tasksHtml}
                </div>
            `;
        }

        const deferredClass = suggestion.kept_for_later ? ' deferred' : '';

        return `
            <div class="suggestion-card ${suggestion.status}${deferredClass}">
                <div class="suggestion-header">
                    <span class="suggestion-source">${suggestion.source_agent}</span>
                    <span class="suggestion-category ${suggestion.category}">${suggestion.category}</span>
                    ${suggestion.kept_for_later ? '<span class="suggestion-deferred-badge">deferred</span>' : ''}
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

// Star rating labels
const RATING_LABELS = {
    0: 'Click a star to rate',
    1: 'Poor - Not helpful',
    2: 'Fair - Somewhat helpful',
    3: 'Good - Helpful',
    4: 'Great - Very helpful',
    5: 'Excellent - Extremely helpful'
};

// Initialize star rating interactions
function initStarRating() {
    const stars = document.querySelectorAll('#starRating .star');
    const ratingLabel = document.getElementById('ratingLabel');
    const ratingValue = document.getElementById('ratingValue');
    const submitBtn = document.getElementById('submitRatingBtn');

    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const value = parseInt(star.dataset.value);
            highlightStars(value);
            ratingLabel.textContent = RATING_LABELS[value];
        });

        star.addEventListener('mouseleave', () => {
            const selected = parseInt(ratingValue.value) || 0;
            highlightStars(selected);
            ratingLabel.textContent = RATING_LABELS[selected];
        });

        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            ratingValue.value = value;
            highlightStars(value, true);
            ratingLabel.textContent = RATING_LABELS[value];
            submitBtn.disabled = false;
        });
    });
}

function highlightStars(count, selected = false) {
    const stars = document.querySelectorAll('#starRating .star');
    stars.forEach((star, index) => {
        star.classList.remove('hover', 'selected');
        if (index < count) {
            star.classList.add(selected ? 'selected' : 'hover');
        }
    });
}

function showRatingModal(suggestionId) {
    const modal = document.getElementById('ratingModal');
    const ratingValue = document.getElementById('ratingValue');
    const suggestionIdInput = document.getElementById('ratingSuggestionId');
    const submitBtn = document.getElementById('submitRatingBtn');
    const ratingLabel = document.getElementById('ratingLabel');

    // Reset state
    suggestionIdInput.value = suggestionId;
    ratingValue.value = '0';
    submitBtn.disabled = true;
    ratingLabel.textContent = RATING_LABELS[0];
    highlightStars(0);

    modal.classList.add('show');
}

function hideRatingModal() {
    const modal = document.getElementById('ratingModal');
    modal.classList.remove('show');
}

function cancelRating() {
    hideRatingModal();
}

async function submitRating() {
    const suggestionId = document.getElementById('ratingSuggestionId').value;
    const rating = parseInt(document.getElementById('ratingValue').value);

    hideRatingModal();

    // Now perform the actual approval with rating
    await performApproval(suggestionId, rating);
}

async function approveSuggestion(id) {
    // Check shared cooldown
    if (isOnCooldown(id)) {
        showNotification('Please wait before taking another action', 'warning');
        return;
    }

    // Show rating modal instead of approving directly
    showRatingModal(id);
}

async function performApproval(id, rating) {
    console.log(`[Suggestions] Approving suggestion ${id} with rating ${rating}...`);

    // Start shared cooldown immediately
    startSuggestionCooldown(id);

    // Find and disable button immediately to prevent double-clicks
    const btn = document.querySelector(`button.approve[onclick*="${id}"]`);
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Approving...';
    }

    try {
        const res = await fetch(`${API_URL}/suggestions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decision: 'approved', rating: rating })
        });
        const data = await res.json();
        console.log(`[Suggestions] Approval response:`, data);

        if (res.ok && !data.error) {
            console.log(`[Suggestions] Successfully approved ${id}`);

            // Show success feedback
            if (btn) {
                btn.textContent = '✓ Approved';
                btn.style.backgroundColor = '#27ae60';
            }

            // Update local state immediately for responsive UI
            const suggestion = suggestions.find(s => s.id === id);
            if (suggestion) {
                suggestion.status = 'approved';
                suggestion.decision = 'approved';
                suggestion.rating = rating;
                suggestion.decided_at = new Date().toISOString();
            }

            // Re-render with updated state (broadcast will also trigger but this is faster)
            renderSuggestions();

            // Show notification
            const implTasks = data.implementation_tasks || [];
            const taskMsg = implTasks.length > 0
                ? ` → Tasks created: ${implTasks.join(', ')}`
                : (data.task_created ? ` → Task ${data.task_created} created` : '');
            const starDisplay = '★'.repeat(rating) + '☆'.repeat(5 - rating);
            showNotification(`Suggestion ${id} approved (${starDisplay})${taskMsg}`, 'success');

            // Log to agent logs if available
            if (typeof log === 'function') {
                log('agentLogs', `Suggestion ${id} approved (${rating}/5 stars)${taskMsg}`, 'success');
            }
        } else {
            console.error(`[Suggestions] Approval failed:`, data.error);
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Approve';
            }
            showNotification(`Failed to approve: ${data.error || 'Unknown error'}`, 'error');
        }
    } catch (e) {
        console.error('[Suggestions] Approve request error:', e);

        // Network error might mean request succeeded but response was lost
        if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
            console.log('[Suggestions] Network error - refreshing to check state...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await fetchSuggestions();
            showNotification('Action may have completed - check status', 'warning');
        } else {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Approve';
            }
            showNotification(`Failed to approve: ${e.message}`, 'error');
        }
    }
}

// Initialize star rating when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStarRating);
} else {
    initStarRating();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

async function rejectSuggestion(id) {
    // Check shared cooldown
    if (isOnCooldown(id)) {
        showNotification('Please wait before taking another action', 'warning');
        return;
    }

    console.log(`[Suggestions] Rejecting suggestion ${id}...`);
    const notes = prompt('Rejection reason (optional):');

    // Start shared cooldown immediately
    startSuggestionCooldown(id);

    // Find and disable button
    const btn = document.querySelector(`button.reject[onclick*="${id}"]`);
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Rejecting...';
    }

    try {
        const res = await fetch(`${API_URL}/suggestions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decision: 'rejected', decision_notes: notes || '' })
        });
        const data = await res.json();
        console.log(`[Suggestions] Rejection response:`, data);

        if (res.ok && !data.error) {
            console.log(`[Suggestions] Successfully rejected ${id}`);

            // Update local state
            const suggestion = suggestions.find(s => s.id === id);
            if (suggestion) {
                suggestion.status = 'rejected';
                suggestion.decision = 'rejected';
                suggestion.decided_at = new Date().toISOString();
            }

            renderSuggestions();
            showNotification(`Suggestion ${id} rejected`, 'info');

            if (typeof log === 'function') {
                log('agentLogs', `Suggestion ${id} rejected`, 'info');
            }
        } else {
            console.error(`[Suggestions] Rejection failed:`, data.error);
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Reject';
            }
            showNotification(`Failed to reject: ${data.error || 'Unknown error'}`, 'error');
        }
    } catch (e) {
        console.error('[Suggestions] Reject request error:', e);

        // Network error might mean request succeeded but response was lost
        if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
            console.log('[Suggestions] Network error - refreshing to check state...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await fetchSuggestions();
            showNotification('Action may have completed - check status', 'warning');
        } else {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Reject';
            }
            showNotification(`Failed to reject: ${e.message}`, 'error');
        }
    }
}

async function implementSuggestion(id) {
    console.log(`[Suggestions] Marking suggestion ${id} as implemented...`);
    try {
        const res = await fetch(`${API_URL}/suggestions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'implemented' })
        });
        const data = await res.json();
        console.log(`[Suggestions] Implementation response:`, data);

        if (res.ok && !data.error) {
            console.log(`[Suggestions] Successfully marked ${id} as implemented`);
            await fetchSuggestions();
            if (typeof log === 'function') {
                log('agentLogs', `Suggestion ${id} marked as implemented`, 'success');
            }
        } else {
            console.error(`[Suggestions] Implementation failed:`, data.error);
            alert(`Failed to mark implemented: ${data.error || 'Unknown error'}`);
        }
    } catch (e) {
        console.error('[Suggestions] Failed to mark suggestion implemented:', e);
        alert(`Failed to mark implemented: ${e.message}`);
    }
}

// Shared cooldown tracking per suggestion (all buttons share cooldown)
const suggestionCooldowns = new Map();
const SUGGESTION_COOLDOWN_MS = 5 * 1000; // 5 seconds shared cooldown
const activeCooldownTimers = new Map();

// Start shared cooldown for all buttons on a suggestion
function startSuggestionCooldown(suggestionId) {
    suggestionCooldowns.set(suggestionId, Date.now());
    startCooldownTimer(suggestionId);
}

// Check if suggestion is on cooldown
function isOnCooldown(suggestionId) {
    const lastAction = suggestionCooldowns.get(suggestionId);
    if (!lastAction) return false;
    return (Date.now() - lastAction) < SUGGESTION_COOLDOWN_MS;
}

// Get remaining cooldown seconds
function getCooldownRemaining(suggestionId) {
    const lastAction = suggestionCooldowns.get(suggestionId);
    if (!lastAction) return 0;
    return Math.max(0, SUGGESTION_COOLDOWN_MS - (Date.now() - lastAction));
}

function startCooldownTimer(suggestionId) {
    // Clear any existing timer for this suggestion
    if (activeCooldownTimers.has(suggestionId)) {
        clearInterval(activeCooldownTimers.get(suggestionId));
    }

    const updateButtons = () => {
        const card = document.querySelector(`.suggestion-card:has(button[onclick*="'${suggestionId}'"])`);
        if (!card) {
            clearInterval(timerId);
            activeCooldownTimers.delete(suggestionId);
            return;
        }

        const buttons = card.querySelectorAll('.suggestion-actions button');
        const remaining = getCooldownRemaining(suggestionId);

        if (remaining <= 0) {
            // Cooldown expired - restore buttons
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('cooldown');
            });
            suggestionCooldowns.delete(suggestionId);
            clearInterval(timerId);
            activeCooldownTimers.delete(suggestionId);
        } else {
            // Still on cooldown - keep buttons disabled
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.classList.add('cooldown');
            });
        }
    };

    // Initial update
    updateButtons();

    // Update every second
    const timerId = setInterval(updateButtons, 1000);
    activeCooldownTimers.set(suggestionId, timerId);
}

async function deferSuggestion(id) {
    // Check shared cooldown
    if (isOnCooldown(id)) {
        showNotification('Please wait before taking another action', 'warning');
        return;
    }

    console.log(`[Suggestions] Deferring suggestion ${id}...`);

    // Start shared cooldown immediately
    startSuggestionCooldown(id);

    // Find and disable button
    const btn = document.querySelector(`button.later[onclick*="${id}"]`);
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Deferring...';
    }

    try {
        const res = await fetch(`${API_URL}/suggestions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'defer' })
        });
        const data = await res.json();
        console.log(`[Suggestions] Defer response:`, data);

        if (res.ok && !data.error) {
            console.log(`[Suggestions] Successfully deferred ${id}`);

            // Update local state
            const suggestion = suggestions.find(s => s.id === id);
            if (suggestion) {
                suggestion.kept_for_later = true;
                suggestion.deferred_at = new Date().toISOString();
            }

            renderSuggestions();
            showNotification(`Suggestion ${id} moved to later`, 'info');

            if (typeof log === 'function') {
                log('agentLogs', `Suggestion ${id} deferred`, 'info');
            }
        } else {
            console.error(`[Suggestions] Defer failed:`, data.error);
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Later';
            }
            showNotification(`Failed to defer: ${data.error || 'Unknown error'}`, 'error');
        }
    } catch (e) {
        console.error('[Suggestions] Defer request error:', e);

        // Network error might mean request succeeded but response was lost
        if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
            console.log('[Suggestions] Network error - refreshing to check state...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await fetchSuggestions();
            showNotification('Action may have completed - check status', 'warning');
        } else {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Later';
            }
            showNotification(`Failed to defer: ${e.message}`, 'error');
        }
    }
}

async function discussSuggestion(id) {
    // Check shared cooldown
    if (isOnCooldown(id)) {
        showNotification('Please wait before taking another action', 'warning');
        return;
    }

    console.log(`[Suggestions] Starting discussion for ${id}...`);

    // Start shared cooldown immediately
    startSuggestionCooldown(id);

    const suggestion = suggestions.find(s => s.id === id);
    if (!suggestion) {
        showNotification('Suggestion not found', 'error');
        return;
    }

    // Find and update button to show progress
    const btn = document.querySelector(`button.discuss[data-suggestion-id="${id}"]`);
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Starting...';
    }

    // T300: New async flow - backend creates tasks via normal delegation
    // Returns immediately with task IDs, actual work happens in queue
    try {
        const res = await fetch(`${API_URL}/suggestions/${id}/discuss`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        // Handle 429 rate limit
        if (res.status === 429) {
            const retryAfter = res.headers.get('Retry-After') || 60;
            const secs = parseInt(retryAfter, 10);
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Discuss';
            }
            showNotification(`Rate limited. Try again in ${secs}s`, 'warning');
            return;
        }

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log('[Suggestions] Discussion response:', data);

        // T300: Tasks created - show success with task info
        if (data.status === 'tasks_created') {
            if (btn) {
                btn.textContent = 'Queued';
                // Reset button after a delay
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = 'Discuss';
                }, 5000);
            }
            showNotification(
                `Discussion started: ${data.research_task} → ${data.boss_task}. Check Hub & Tasks.`,
                'success'
            );

            if (typeof log === 'function') {
                log('agentLogs', `Discuss ${id}: Created ${data.research_task} (Research) → ${data.boss_task} (BOSS)`, 'info');
            }
        } else if (data.error) {
            throw new Error(data.error);
        }

    } catch (e) {
        console.error('[Suggestions] Discussion request error:', e);

        // Network error might mean request succeeded but response was lost
        // Wait briefly then check if tasks were created
        if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
            console.log('[Suggestions] Network error - checking if action succeeded...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await fetchSuggestions();  // Refresh to see if tasks appeared

            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Discuss';
            }
            showNotification('Discussion may have started - check Tasks tab', 'warning');
        } else {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Discuss';
            }
            showNotification(`Discussion failed: ${e.message}`, 'error');
        }
    }
}
