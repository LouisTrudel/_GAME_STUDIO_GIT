// Game Studio - Projects Module
// Manages external project references
//
// T327: Supports URL-based project routing via ?project= param

let projects = [];
let activeProjectId = null;
let selectedProjectId = null;
let showArchived = false;
let currentDocTab = 'white_paper';

// T327: Sync URL param with project state
function syncProjectFromUrl() {
    const urlProjectId = getUrlProjectId();
    if (urlProjectId && urlProjectId !== activeProjectId) {
        // URL has different project - switch to it
        setActiveProject(urlProjectId);
    }
}

// T327: Update URL when project changes (without page reload)
function updateUrlProject(projectId) {
    const url = new URL(window.location);
    if (projectId) {
        url.searchParams.set('project', projectId);
    } else {
        url.searchParams.delete('project');
    }
    window.history.replaceState({}, '', url);
}

// Fetch projects from API (T327: syncs with URL param)
async function fetchProjects() {
    try {
        const resp = await fetch(`${API_URL}/projects?include_archived=${showArchived}`);
        const data = await resp.json();
        projects = data.projects || [];
        activeProjectId = data.active_project_id;

        // T327: Check if URL has a different project - sync backend to URL
        const urlProjectId = getUrlProjectId();
        if (urlProjectId && urlProjectId !== activeProjectId) {
            // URL takes precedence - switch backend to match
            console.log(`[Projects] URL project (${urlProjectId}) differs from active (${activeProjectId}), syncing...`);
            await setActiveProject(urlProjectId);
            return;  // setActiveProject will re-render
        }

        renderProjects();
        updateProjectSwitcher();
    } catch (e) {
        console.error('[Projects] Fetch error:', e);
    }
}

// Update the project switcher dropdown in header
function updateProjectSwitcher() {
    const switcher = document.getElementById('projectSwitcher');
    if (!switcher) return;

    // Get active (non-archived) projects
    const activeProjects = projects.filter(p => p.status === 'active');

    // Build options: DEFAULT + all active projects
    let options = '<option value="">DEFAULT</option>';
    for (const p of activeProjects) {
        const selected = p.id === activeProjectId ? 'selected' : '';
        const name = p.name.length > 18 ? p.name.slice(0, 16) + '...' : p.name;
        options += `<option value="${p.id}" ${selected}>${name}</option>`;
    }
    switcher.innerHTML = options;

    // Visual indicator when a project is active
    switcher.classList.toggle('has-project', !!activeProjectId);
}

// Handle project switcher change
async function onProjectSwitcherChange() {
    const switcher = document.getElementById('projectSwitcher');
    const projectId = switcher.value;

    if (projectId) {
        await setActiveProject(projectId);
    } else {
        await clearActiveProject();
    }
}

// Clear active project (switch to default) (T327: also clears URL, T329: reload Hub)
async function clearActiveProject() {
    try {
        const resp = await fetch(`${API_URL}/projects/clear-active`, { method: 'POST' });
        const data = await resp.json();
        if (data.error) {
            alert(data.error);
        } else {
            activeProjectId = null;
            updateUrlProject(null);  // T327: clear URL param
            renderProjects();
            renderProjectDetails();
            updateProjectSwitcher();
            reloadHubForProject();  // T329: clear + reload Hub messages
        }
    } catch (e) {
        alert('Failed to clear active project');
    }
}

// Render project list
function renderProjects() {
    const list = document.getElementById('projectList');
    if (!list) return;

    const filteredProjects = showArchived
        ? projects
        : projects.filter(p => p.status === 'active');

    if (filteredProjects.length === 0) {
        list.innerHTML = `
            <div class="projects-empty">
                <div class="projects-empty-icon">📁</div>
                <div>No projects yet</div>
                <div style="font-size: 0.8rem; color: #666;">Click + New to add one</div>
            </div>
        `;
        return;
    }

    list.innerHTML = filteredProjects.map(p => {
        const isActive = p.id === activeProjectId;
        const isSelected = p.id === selectedProjectId;
        const statusClass = p.status === 'archived' ? 'archived' : '';
        const pathWarning = !p.path_exists ? '<span class="project-path-warning" title="Folder not found">⚠</span>' : '';

        return `
            <div class="project-item ${statusClass} ${isSelected ? 'selected' : ''}"
                 onclick="selectProject('${p.id}')"
                 ondblclick="setActiveProject('${p.id}')">
                <div class="project-item-header">
                    <span class="project-item-indicator ${isActive ? 'active' : ''}"></span>
                    <span class="project-item-id">${p.id}</span>
                    ${pathWarning}
                </div>
                <div class="project-item-name">${escapeHtml(p.name)}</div>
            </div>
        `;
    }).join('');
}

// Select project to view details
function selectProject(projectId) {
    selectedProjectId = projectId;
    renderProjects();
    renderProjectDetails();
}

// Render project details panel
function renderProjectDetails() {
    const panel = document.getElementById('projectDetails');
    if (!panel) return;

    if (!selectedProjectId) {
        panel.innerHTML = `
            <div class="project-details-empty">
                <div style="color: #666; text-align: center; padding: 2rem;">
                    Select a project to view details
                </div>
            </div>
        `;
        return;
    }

    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) {
        panel.innerHTML = '<div class="project-details-empty">Project not found</div>';
        return;
    }

    const isActive = project.id === activeProjectId;
    const pathWarning = !project.path_exists
        ? '<div class="project-path-error">Project folder not found</div>'
        : '';

    const createdDate = new Date(project.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    // T434: Check if project is in draft/clarify state (show chat panel)
    const pipelineState = project.pipeline_state || 'setup';
    const showChatPanel = projectChatVisible && projectChatId === project.id &&
                          (pipelineState === 'draft' || pipelineState === 'clarify');

    // T434: Build metadata display if present
    let metadataHtml = '';
    if (project.metadata && Object.keys(project.metadata).length > 0) {
        const m = project.metadata;
        const parts = [];
        if (m.project_type) parts.push(m.project_type);
        if (m.subtype) parts.push(m.subtype);
        if (m.engine) parts.push(m.engine);
        if (parts.length > 0) {
            metadataHtml = `
                <div class="project-meta-item">
                    <span class="project-meta-label">Type:</span>
                    <span class="project-meta-value">${escapeHtml(parts.join(' / '))}</span>
                </div>
            `;
        }
    }

    // T434: Show pipeline state badge if not setup
    const pipelineBadge = pipelineState !== 'setup' ? `
        <span class="project-pipeline-badge ${pipelineState}">${pipelineState}</span>
    ` : '';

    // T434: Show star rating if rated
    const ratingHtml = project.whitepaper_rating > 0 ? `
        <div class="project-meta-item">
            <span class="project-meta-label">Rating:</span>
            <span class="project-meta-value">${renderStarRating(project.whitepaper_rating)}</span>
        </div>
    ` : '';

    // T434: If showing chat panel, use 40/60 split layout
    if (showChatPanel) {
        panel.innerHTML = `
            <div class="project-chat-layout">
                <div class="project-chat-whitepaper">
                    <div class="project-details-header">
                        <h3>${escapeHtml(project.name)}</h3>
                        ${pipelineBadge}
                        <button onclick="saveWhitepaper('${project.id}')" class="project-btn-save" title="Save whitepaper">
                            💾 Save
                        </button>
                    </div>
                    <textarea id="whitepaperEditor" class="whitepaper-editor"
                              placeholder="Whitepaper content will appear here..."></textarea>
                </div>
                <div class="project-chat-panel">
                    <div class="project-chat-header">
                        <span>Project Chat</span>
                        <button onclick="hideProjectChat()" class="project-chat-close">×</button>
                    </div>
                    <div class="project-chat-messages" id="projectChatMessages">
                        <div class="chat-message assistant">
                            <div class="chat-content">
                                Tell me about your project. What are you building?
                            </div>
                        </div>
                    </div>
                    <div class="project-chat-input-area">
                        <input type="text" id="projectChatInput"
                               placeholder="Describe your project..."
                               onkeydown="if(event.key==='Enter')sendProjectChatMessage()" />
                        <button onclick="sendProjectChatMessage()">Send</button>
                    </div>
                    <div class="project-chat-actions">
                        <button onclick="startProjectDispatch('${project.id}')" class="project-btn-dispatch"
                                ${project.whitepaper_rating >= 4 ? '' : 'disabled title="Refine whitepaper to 4+ stars first"'}>
                            🚀 Start Project
                        </button>
                        <button onclick="cancelProject('${project.id}')" class="project-btn-cancel">
                            Cancel Project
                        </button>
                    </div>
                </div>
            </div>
        `;
        // Whitepaper is loaded by showProjectChat() after render
        return;
    }

    // Standard layout (non-chat mode)
    panel.innerHTML = `
        <div class="project-details-header">
            <h3>${escapeHtml(project.name)}</h3>
            ${isActive ? '<span class="project-active-badge">Active</span>' : ''}
            ${pipelineBadge}
        </div>

        <div class="project-details-meta">
            <div class="project-meta-item">
                <span class="project-meta-label">Path:</span>
                <span class="project-meta-value project-path" title="${escapeHtml(project.path)}">
                    ${truncatePath(project.path, 40)}
                </span>
            </div>
            <div class="project-meta-item">
                <span class="project-meta-label">Status:</span>
                <span class="project-meta-value">${project.status}</span>
            </div>
            <div class="project-meta-item">
                <span class="project-meta-label">Created:</span>
                <span class="project-meta-value">${createdDate}</span>
            </div>
            ${metadataHtml}
            ${ratingHtml}
            ${project.description ? `
                <div class="project-meta-item">
                    <span class="project-meta-label">Description:</span>
                    <span class="project-meta-value">${escapeHtml(project.description)}</span>
                </div>
            ` : ''}
        </div>

        ${pathWarning}

        <div class="project-doc-tabs">
            <div class="project-doc-tab ${currentDocTab === 'white_paper' ? 'active' : ''}"
                 onclick="loadProjectDocument('white_paper')">
                White Paper
            </div>
            <div class="project-doc-tab ${currentDocTab === 'roadmap' ? 'active' : ''}"
                 onclick="loadProjectDocument('roadmap')">
                Roadmap
            </div>
            <button class="project-open-folder" onclick="openProjectFolder('${project.id}')"
                    ${!project.path_exists ? 'disabled' : ''}>
                Open Folder
            </button>
        </div>

        <div class="project-doc-preview" id="projectDocPreview">
            <div class="project-doc-loading">Select a document tab above</div>
        </div>

        <div class="project-details-actions">
            ${(pipelineState === 'draft' || pipelineState === 'clarify') ? `
                <button onclick="showProjectChat('${project.id}')" class="project-btn-chat">
                    Open Chat
                </button>
            ` : ''}
            ${!isActive && project.status === 'active' ? `
                <button onclick="setActiveProject('${project.id}')" class="project-btn-active">
                    Set Active
                </button>
            ` : ''}
            ${project.status === 'active' ? `
                <button onclick="archiveProject('${project.id}')" class="project-btn-archive">
                    Archive
                </button>
            ` : `
                <button onclick="unarchiveProject('${project.id}')" class="project-btn-unarchive">
                    Restore
                </button>
            `}
            <button onclick="deleteProject('${project.id}')" class="project-btn-delete">
                Delete
            </button>
        </div>
    `;

    // Auto-load white paper if path exists
    if (project.path_exists) {
        loadProjectDocument(currentDocTab);
    }
}

// Load document (white_paper or roadmap)
async function loadProjectDocument(docType) {
    currentDocTab = docType;

    // Update tab UI
    document.querySelectorAll('.project-doc-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.project-doc-tab:nth-child(${docType === 'white_paper' ? 1 : 2})`)?.classList.add('active');

    const preview = document.getElementById('projectDocPreview');
    if (!preview || !selectedProjectId) return;

    preview.innerHTML = '<div class="project-doc-loading">Loading...</div>';

    try {
        const resp = await fetch(`${API_URL}/projects/${selectedProjectId}/document/${docType}`);
        const data = await resp.json();

        if (data.error) {
            preview.innerHTML = `<div class="project-doc-error">${escapeHtml(data.error)}</div>`;
        } else if (data.exists) {
            const truncatedNote = data.truncated
                ? '<div class="project-doc-truncated">File truncated (too large)</div>'
                : '';
            preview.innerHTML = `
                ${truncatedNote}
                <pre class="project-doc-content">${escapeHtml(data.content)}</pre>
            `;
        } else {
            preview.innerHTML = `<div class="project-doc-empty">No ${docType.replace('_', ' ')} found</div>`;
        }
    } catch (e) {
        preview.innerHTML = `<div class="project-doc-error">Failed to load document</div>`;
    }
}

// Set active project (T327: also updates URL, T329: reload Hub)
async function setActiveProject(projectId) {
    try {
        const resp = await fetch(`${API_URL}/projects/${projectId}/set-active`, { method: 'POST' });
        const data = await resp.json();
        if (data.error) {
            alert(data.error);
        } else {
            activeProjectId = projectId;
            updateUrlProject(projectId);  // T327: sync URL
            renderProjects();
            renderProjectDetails();
            updateProjectSwitcher();
            reloadHubForProject();  // T329: clear + reload Hub messages
        }
    } catch (e) {
        alert('Failed to set active project');
    }
}

// Archive project
async function archiveProject(projectId) {
    if (!confirm('Archive this project? It will be hidden from the list.')) return;

    try {
        const resp = await fetch(`${API_URL}/projects/${projectId}/archive`, { method: 'POST' });
        const data = await resp.json();
        if (data.error) {
            alert(data.error);
        } else {
            await fetchProjects();
            if (selectedProjectId === projectId && !showArchived) {
                selectedProjectId = null;
            }
            renderProjectDetails();
        }
    } catch (e) {
        alert('Failed to archive project');
    }
}

// Unarchive project
async function unarchiveProject(projectId) {
    try {
        const resp = await fetch(`${API_URL}/projects/${projectId}/unarchive`, { method: 'POST' });
        const data = await resp.json();
        if (data.error) {
            alert(data.error);
        } else {
            await fetchProjects();
            renderProjectDetails();
        }
    } catch (e) {
        alert('Failed to restore project');
    }
}

// Delete project
async function deleteProject(projectId) {
    if (!confirm('Delete this project reference? This will NOT delete the external folder.')) return;

    try {
        const resp = await fetch(`${API_URL}/projects/${projectId}`, { method: 'DELETE' });
        const data = await resp.json();
        if (data.error) {
            alert(data.error);
        } else {
            await fetchProjects();
            if (selectedProjectId === projectId) {
                selectedProjectId = null;
            }
            renderProjectDetails();
        }
    } catch (e) {
        alert('Failed to delete project');
    }
}

// Open project folder in explorer
async function openProjectFolder(projectId) {
    try {
        const resp = await fetch(`${API_URL}/projects/${projectId}/open-folder`, { method: 'POST' });
        const data = await resp.json();
        if (data.error) {
            alert(data.error);
        }
    } catch (e) {
        alert('Failed to open folder');
    }
}

// Toggle archived visibility
function toggleShowArchived() {
    showArchived = !showArchived;
    const btn = document.getElementById('showArchivedBtn');
    if (btn) {
        btn.textContent = showArchived ? 'Hide Archived' : 'Show Archived';
        btn.classList.toggle('active', showArchived);
    }
    fetchProjects();
}

// T425: Project creation mode - 'create' (external) or 'link' (legacy)
let projectCreateMode = 'create';

// T434: Track selected project type chip
let selectedProjectType = 'game';

// Show create project modal
function showCreateProject() {
    document.getElementById('createProjectModal').classList.add('show');
    setProjectMode('create');  // Default to Create New mode
    // Clear all fields
    document.getElementById('projectNameCreate').value = '';
    document.getElementById('projectParentDir').value = '';
    document.getElementById('projectInitGit').checked = true;
    document.getElementById('projectName').value = '';
    document.getElementById('projectPath').value = '';
    document.getElementById('projectDescription').value = '';
    // T434: Clear metadata fields
    const subtypeField = document.getElementById('projectSubtype');
    const engineField = document.getElementById('projectEngine');
    if (subtypeField) subtypeField.value = '';
    if (engineField) engineField.value = '';
    // T434: Reset type chips to default (game)
    selectedProjectType = 'game';
    initTypeChips();
    document.getElementById('projectNameCreate').focus();
}

// T434: Initialize type chip click handlers
function initTypeChips() {
    const chips = document.querySelectorAll('.type-chip');
    chips.forEach(chip => {
        chip.classList.toggle('selected', chip.dataset.type === selectedProjectType);
        chip.onclick = () => selectProjectType(chip.dataset.type);
    });
}

// T434: Select project type
function selectProjectType(type) {
    selectedProjectType = type;
    const chips = document.querySelectorAll('.type-chip');
    chips.forEach(chip => {
        chip.classList.toggle('selected', chip.dataset.type === type);
    });
}

// Set project creation mode
function setProjectMode(mode) {
    projectCreateMode = mode;

    // Update tab styling
    document.getElementById('modeCreateNew').classList.toggle('active', mode === 'create');
    document.getElementById('modeLinkExisting').classList.toggle('active', mode === 'link');

    // Show/hide forms
    document.getElementById('projectCreateForm').style.display = mode === 'create' ? 'block' : 'none';
    document.getElementById('projectLinkForm').style.display = mode === 'link' ? 'block' : 'none';

    // Focus appropriate input
    if (mode === 'create') {
        document.getElementById('projectNameCreate').focus();
    } else {
        document.getElementById('projectName').focus();
    }
}

// Hide create project modal
function hideCreateProject() {
    document.getElementById('createProjectModal').classList.remove('show');
}

// Submit project form (routes to correct handler based on mode)
async function submitProjectForm() {
    if (projectCreateMode === 'create') {
        await createExternalProject();
    } else {
        await createProject();
    }
}

// T434: Gather project metadata from form
function gatherProjectMetadata() {
    const subtypeField = document.getElementById('projectSubtype');
    const engineField = document.getElementById('projectEngine');
    return {
        project_type: selectedProjectType,
        subtype: subtypeField ? subtypeField.value.trim() : '',
        engine: engineField ? engineField.value.trim() : ''
    };
}

// Create external project (new folder with scaffolding)
async function createExternalProject(withAI = false) {
    const name = document.getElementById('projectNameCreate').value.trim();
    const parentDir = document.getElementById('projectParentDir').value.trim();
    const initGit = document.getElementById('projectInitGit').checked;
    const metadata = gatherProjectMetadata();

    if (!name) {
        alert('Project name is required');
        return;
    }
    if (!parentDir) {
        alert('Parent directory is required');
        return;
    }

    try {
        const resp = await fetch(`${API_URL}/projects/create-external`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                parent_dir: parentDir,
                init_git: initGit,
                with_ai: withAI,
                metadata
            })
        });
        const data = await resp.json();

        if (data.error) {
            alert(data.error);
        } else {
            hideCreateProject();
            // Show git warning if any
            if (data.git_warning) {
                console.warn('[Projects] Git warning:', data.git_warning);
            }
            await fetchProjects();
            selectProject(data.id);

            // T434: If created with AI, open project chat panel
            if (withAI && data.pipeline_state === 'draft') {
                showProjectChat(data.id);
            }
        }
    } catch (e) {
        alert('Failed to create project');
    }
}

// T434: Submit project form with AI whitepaper generation
async function submitProjectFormWithAI() {
    if (projectCreateMode === 'create') {
        await createExternalProject(true);  // withAI = true
    } else {
        // Link mode doesn't support AI generation
        alert('AI whitepaper generation is only available for new projects');
    }
}

// Create project by linking existing folder (legacy mode)
async function createProject() {
    const name = document.getElementById('projectName').value.trim();
    const path = document.getElementById('projectPath').value.trim();
    const description = document.getElementById('projectDescription').value.trim();

    if (!name) {
        alert('Project name is required');
        return;
    }
    if (!path) {
        alert('Project path is required');
        return;
    }

    try {
        const resp = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path, description })
        });
        const data = await resp.json();

        if (data.error) {
            alert(data.error);
        } else {
            hideCreateProject();
            await fetchProjects();
            selectProject(data.id);
        }
    } catch (e) {
        alert('Failed to create project');
    }
}

// Helper: truncate path for display
function truncatePath(path, maxLen) {
    if (!path || path.length <= maxLen) return path;
    return '...' + path.slice(-(maxLen - 3));
}

// Handle WebSocket projects update
function handleProjectsUpdate(data) {
    projects = data.projects || [];
    activeProjectId = data.active_project_id;
    renderProjects();
    updateProjectSwitcher();
    // Re-render details if selected project was updated
    if (selectedProjectId && projects.find(p => p.id === selectedProjectId)) {
        renderProjectDetails();
    }
}

// ============ T434: PROJECT CHAT PANEL ============

let projectChatVisible = false;
let projectChatId = null;

// Show project chat panel (40/60 split with whitepaper)
function showProjectChat(projectId) {
    projectChatId = projectId;
    projectChatVisible = true;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Re-render details to show chat panel
    renderProjectDetails();

    // Load existing whitepaper content (T439)
    loadProjectWhitepaper(projectId);

    // Load chat history if any (T439)
    loadProjectChatHistory(projectId);
}

// Load chat history for a project (T439)
async function loadProjectChatHistory(projectId) {
    const chatMessages = document.getElementById('projectChatMessages');
    if (!chatMessages) return;

    try {
        const resp = await fetch(`${API_URL}/projects/${projectId}/chat-history`);
        const data = await resp.json();

        if (data.messages && data.messages.length > 0) {
            // Clear default welcome message and add history
            chatMessages.innerHTML = '';
            for (const msg of data.messages) {
                addProjectChatMessage(msg.role, msg.content);
            }
        }
    } catch (e) {
        console.error('Failed to load chat history:', e);
    }
}

// Hide project chat panel
function hideProjectChat() {
    projectChatVisible = false;
    projectChatId = null;
    renderProjectDetails();
}

// Render star rating display
function renderStarRating(rating) {
    const filled = '★'.repeat(rating);
    const empty = '☆'.repeat(5 - rating);
    return `<span class="star-rating">${filled}${empty}</span> (${rating}/5)`;
}

// Send message in project chat (T439: Connected to whitepaper agent)
async function sendProjectChatMessage() {
    const input = document.getElementById('projectChatInput');
    if (!input || !projectChatId) return;

    const message = input.value.trim();
    if (!message) return;

    const chatMessages = document.getElementById('projectChatMessages');

    // Add user message to chat display
    if (chatMessages) {
        chatMessages.innerHTML += `
            <div class="chat-message user">
                <div class="chat-content">${escapeHtml(message)}</div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    input.value = '';
    input.disabled = true;

    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    if (chatMessages) {
        chatMessages.innerHTML += `
            <div class="chat-message assistant typing" id="${typingId}">
                <div class="chat-content">
                    <span class="typing-dots">●●●</span> Thinking...
                </div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    try {
        const resp = await fetch(`${API_URL}/projects/${projectChatId}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await resp.json();

        // Remove typing indicator
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        if (data.error) {
            addProjectChatMessage('assistant', `Error: ${data.error}`);
        } else {
            // Add response with rating badge
            let responseHtml = escapeHtml(data.response);
            if (data.rating > 0) {
                responseHtml += `
                    <div class="chat-rating-badge">
                        <span class="star-rating">${data.rating_display}</span>
                        (${data.rating}/5)
                        ${data.missing ? `<br><span class="rating-missing">Missing: ${escapeHtml(data.missing)}</span>` : ''}
                    </div>
                `;
            }
            addProjectChatMessage('assistant', responseHtml, true);

            // Refresh whitepaper display (editable)
            await loadProjectWhitepaper(projectChatId);

            // Update project rating in local array (avoid full re-render which resets chat)
            if (data.rating > 0) {
                const proj = projects.find(p => p.id === projectChatId);
                if (proj) {
                    proj.whitepaper_rating = data.rating;
                    // Update dispatch button state
                    const dispatchBtn = document.querySelector('.project-btn-dispatch');
                    if (dispatchBtn) {
                        dispatchBtn.disabled = data.rating < 4;
                    }
                }
            }
        }
    } catch (e) {
        // Remove typing indicator
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        addProjectChatMessage('assistant', `Error: Failed to connect to agent. ${e}`);
    }

    input.disabled = false;
    input.focus();
}

// Add a message to project chat display
function addProjectChatMessage(role, content, isHtml = false) {
    const chatMessages = document.getElementById('projectChatMessages');
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'chat-content';
    if (isHtml) {
        contentDiv.innerHTML = content;
    } else {
        contentDiv.textContent = content;
    }

    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Load whitepaper content into the display pane
async function loadProjectWhitepaper(projectId) {
    const editor = document.getElementById('whitepaperEditor');
    if (!editor) return;

    try {
        const resp = await fetch(`${API_URL}/projects/${projectId}/document/white_paper`);
        const data = await resp.json();

        if (data.error || !data.content) {
            editor.value = '';
            editor.placeholder = 'No whitepaper yet. Start chatting to generate one, or type here directly.';
        } else {
            editor.value = data.content;
        }
    } catch (e) {
        editor.value = '';
        editor.placeholder = 'Failed to load whitepaper';
    }
}

// Save whitepaper content from editor
async function saveWhitepaper(projectId) {
    const editor = document.getElementById('whitepaperEditor');
    if (!editor) return;

    const content = editor.value.trim();
    if (!content) {
        alert('Whitepaper is empty');
        return;
    }

    try {
        const resp = await fetch(`${API_URL}/projects/${projectId}/whitepaper`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        const data = await resp.json();

        if (data.error) {
            alert(`Failed to save: ${data.error}`);
        } else {
            // Visual feedback
            const saveBtn = document.querySelector('.project-btn-save');
            if (saveBtn) {
                const original = saveBtn.textContent;
                saveBtn.textContent = '✓ Saved';
                setTimeout(() => saveBtn.textContent = original, 1500);
            }
        }
    } catch (e) {
        alert('Failed to save whitepaper');
    }
}

// Cancel project (with confirmation)
async function cancelProject(projectId) {
    const deleteFolder = confirm(
        'Cancel this project?\n\n' +
        'Click OK to delete the project folder.\n' +
        'Click Cancel to keep the folder but remove it from Studio.'
    );

    try {
        const resp = await fetch(`${API_URL}/projects/${projectId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delete_folder: deleteFolder })
        });
        const data = await resp.json();

        if (data.error) {
            alert(data.error);
        } else {
            hideProjectChat();
            await fetchProjects();
            selectedProjectId = null;
            renderProjectDetails();
        }
    } catch (e) {
        alert('Failed to cancel project');
    }
}

// Start project dispatch - transitions to DISPATCH state and tells BOSS to decompose
async function startProjectDispatch(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (project.whitepaper_rating < 4) {
        alert('Please refine the whitepaper to 4+ stars before starting the project.');
        return;
    }

    if (!confirm(`Ready to start "${project.name}"?\n\nBOSS will read the whitepaper and create tasks for the team.`)) {
        return;
    }

    try {
        // Set pipeline state to dispatch
        const resp = await fetch(`${API_URL}/projects/${projectId}/pipeline-state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: 'dispatch' })
        });
        const data = await resp.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        // TODO: Trigger BOSS to read whitepaper and create tasks
        // For now, just show confirmation
        alert(`Project dispatched! BOSS will now read the whitepaper and create tasks.\n\nCheck the Tasks tab for progress.`);

        hideProjectChat();
        await fetchProjects();
        renderProjectDetails();

    } catch (e) {
        alert('Failed to start project dispatch');
    }
}
