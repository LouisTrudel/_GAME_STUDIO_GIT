// Game Studio - Files Module
// File explorer functionality

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

function toggleFolder(event, path) {
    event.stopPropagation();
    const childrenId = 'children-' + path.replace(/[\/\.]/g, '-');
    const children = document.getElementById(childrenId);
    if (children) {
        children.classList.toggle('collapsed');
        const icon = event.currentTarget.querySelector('.icon');
        if (children.classList.contains('collapsed')) {
            icon.textContent = '📁';
        } else {
            icon.textContent = '📂';
        }
    }
}

async function selectFile(path) {
    document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    selectedFilePath = path;
    document.getElementById('filePath').textContent = path;
    document.getElementById('openFileBtn').style.display = 'inline-block';

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
