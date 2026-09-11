// Game Studio - Routines Module
// Routine CRUD and rendering

// Drag-and-drop state for routine cards
let draggedRoutineCard = null;

async function fetchSchedules() {
    console.log('[Routines] Fetching schedules...');
    try {
        const res = await fetch(`${API_URL}/schedules`);
        if (!res.ok) {
            console.error('[Routines] Fetch failed:', res.status, res.statusText);
            return;
        }
        routines = await res.json();
        console.log('[Routines] Loaded', routines.length, 'schedules');
        renderRoutines();
    } catch (e) {
        console.error('[Routines] Failed to fetch schedules:', e);
    }
}

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
        const isScript = routine.schedule_type === 'script';
        const tasks = routine.tasks || [];

        const agentChain = isScript
            ? `📜 Script`
            : tasks.map(t => t.assignee).join(' → ');

        const chainProgress = tasks.map((t, i) => {
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

        const tasksHtml = isScript
            ? `<div class="routine-task" style="color: #888;">
                <span class="routine-task-num">📜</span>
                <span style="flex:1">Script: <code>${escapeHtml(routine.script_module || 'unknown')}</code></span>
               </div>`
            : tasks.map((t, i) => {
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

        return `
            <div class="routine-card ${statusClass}" data-routine-id="${routine.id}" draggable="true">
                <span class="routine-drag-handle" title="Drag to reorder">⋮⋮</span>
                <div class="routine-header" onclick="toggleRoutineDetails('${routine.id}')" style="cursor: pointer;">
                    <span class="routine-id">${routine.id}</span>
                    <span class="routine-interval">⏱ ${routine.interval_human}</span>
                    <span class="routine-status ${statusClass}">${statusLabel}</span>
                    <span class="routine-title">${escapeHtml(routine.name)}</span>
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

function showCreateRoutine() {
    document.getElementById('createRoutineModal').classList.add('show');
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

    const defaultAgent = taskNum === 1 ? 'BOSS' : 'Code';
    const agentOptions = Object.keys(roles).map(name =>
        `<option value="${name}" ${name === defaultAgent ? 'selected' : ''}>${name}</option>`
    ).join('');

    const depVisual = taskNum > 1 ? `
        <div class="routine-dep-visual">
            <span class="dep-label">Depends on:</span>
            <span class="dep-arrow">←</span>
            <span class="dep-prev">Task ${taskNum - 1} (linear chain)</span>
        </div>
    ` : '';

    const taskHtml = `
        <div class="routine-chain-item" id="routineTask${routineChainCount}" data-task-num="${routineChainCount}">
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
    renumberChainTasks();
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
        const startLabel = item.querySelector('.routine-chain-step-num > span:last-child:not(.routine-chain-arrow)');
        if (startLabel && !startLabel.classList.contains('routine-chain-num')) {
            startLabel.style.display = num === 1 ? '' : 'none';
        }
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

    const taskItems = document.querySelectorAll('.routine-chain-item');
    const tasks = [];

    taskItems.forEach((item, index) => {
        const what = item.querySelector('.chain-what').value.trim();
        const context = item.querySelector('.chain-context').value.trim();
        const constraints = item.querySelector('.chain-constraints').value.trim();
        const assignee = item.querySelector('.chain-assignee').value;
        const output = item.querySelector('.chain-output').value;

        if (what) {
            let description = `[WHAT] ${what}`;
            if (context) description += `\n[CONTEXT] ${context}`;
            if (constraints) description += `\n[CONSTRAINTS] ${constraints}`;

            tasks.push({
                description,
                assignee,
                context: context || '',
                output,
                skills: [],
                parallel: false
            });
        }
    });

    if (tasks.length === 0) {
        alert('At least one task with a WHAT field is required');
        return;
    }

    ws.send(JSON.stringify({
        type: 'create_schedule',
        name,
        description,
        interval_seconds: intervalValue * intervalUnit,
        tasks,
    }));

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

// ========== Drag-and-Drop Reorder ==========

function initRoutineDragEvents() {
    const list = document.getElementById('routineList');
    if (!list) return;

    list.addEventListener('dragstart', handleRoutineDragStart);
    list.addEventListener('dragend', handleRoutineDragEnd);
    list.addEventListener('dragover', handleRoutineDragOver);
    list.addEventListener('drop', handleRoutineDrop);
}

function handleRoutineDragStart(e) {
    const card = e.target.closest('.routine-card');
    if (!card) return;

    draggedRoutineCard = card;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.routineId);
}

function handleRoutineDragEnd(e) {
    if (draggedRoutineCard) {
        draggedRoutineCard.classList.remove('dragging');
    }
    // Remove drag-over from all cards
    document.querySelectorAll('.routine-card.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
    draggedRoutineCard = null;
}

function handleRoutineDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const card = e.target.closest('.routine-card');
    if (!card || card === draggedRoutineCard) return;

    // Remove drag-over from others, add to current
    document.querySelectorAll('.routine-card.drag-over').forEach(el => {
        if (el !== card) el.classList.remove('drag-over');
    });
    card.classList.add('drag-over');
}

function handleRoutineDrop(e) {
    e.preventDefault();
    const targetCard = e.target.closest('.routine-card');
    if (!targetCard || !draggedRoutineCard || targetCard === draggedRoutineCard) return;

    const list = document.getElementById('routineList');
    const cards = Array.from(list.querySelectorAll('.routine-card'));

    const draggedIdx = cards.indexOf(draggedRoutineCard);
    const targetIdx = cards.indexOf(targetCard);

    // Move in DOM
    if (draggedIdx < targetIdx) {
        targetCard.after(draggedRoutineCard);
    } else {
        targetCard.before(draggedRoutineCard);
    }

    // Gather new order and send to server
    const newOrder = Array.from(list.querySelectorAll('.routine-card'))
        .map(card => card.dataset.routineId)
        .filter(id => id);

    ws.send(JSON.stringify({ type: 'reorder_schedules', order: newOrder }));

    // Cleanup
    targetCard.classList.remove('drag-over');
}

// Initialize drag events when DOM is ready (or immediately if already ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoutineDragEvents);
} else {
    initRoutineDragEvents();
}
