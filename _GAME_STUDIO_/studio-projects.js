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

    panel.innerHTML = `
        <div class="project-details-header">
            <h3>${escapeHtml(project.name)}</h3>
            ${isActive ? '<span class="project-active-badge">Active</span>' : ''}
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

// Show create project modal
function showCreateProject() {
    document.getElementById('createProjectModal').classList.add('show');
    document.getElementById('projectName').value = '';
    document.getElementById('projectPath').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectName').focus();
}

// Hide create project modal
function hideCreateProject() {
    document.getElementById('createProjectModal').classList.remove('show');
}

// Create new project
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
