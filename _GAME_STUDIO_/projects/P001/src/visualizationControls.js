// === VISUALIZATION CONTROLS MODULE ===
// Phase 6.4: Visualization Controls - Toggle buttons, depth slider, non-blocking placement
// Pattern: Observer — button state triggers visualization updates
// Depends: attackedSquares.js, defendedPieces.js, threatPreview.js

import {
    toggleAttackVisualization,
    setAttackVisualizationVisible,
    isAttackVisualizationVisible,
    updateAttackVisualization
} from './attackedSquares.js';

import {
    toggleDefendedVisualization,
    setDefendedVisualizationVisible,
    isDefendedVisualizationVisible,
    updateDefendedVisualization
} from './defendedPieces.js';

import {
    toggleThreatVisualization,
    setThreatVisualizationVisible,
    isThreatVisualizationVisible,
    setThreatDepth,
    getThreatDepth,
    updateThreatVisualization,
    MAX_DEPTH
} from './threatPreview.js';

// --- CONSTANTS ---
const PANEL_POSITION = { top: '20px', right: '20px' };
const BUTTON_COLORS = {
    attacks: { active: '#4a90d9', inactive: '#2a4a6a' },      // Blue
    defended: { active: '#4aff4a', inactive: '#2a6a2a' },     // Green
    threats: { active: '#ff4a4a', inactive: '#6a2a2a' }       // Red
};

// --- STATE ---
let controlsPanel = null;
let attacksButton = null;
let defendedButton = null;
let threatsButton = null;
let depthSlider = null;
let depthLabel = null;

/**
 * Creates the visualization controls panel UI
 */
function createControlsPanel() {
    // Create main panel container
    controlsPanel = document.createElement('div');
    controlsPanel.id = 'viz-controls';
    controlsPanel.style.cssText = `
        position: fixed;
        top: ${PANEL_POSITION.top};
        right: ${PANEL_POSITION.right};
        background: rgba(30, 30, 50, 0.9);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #ffffff;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        z-index: 1000;
        min-width: 180px;
        user-select: none;
    `;

    // Title
    const title = document.createElement('div');
    title.textContent = 'Visualization';
    title.style.cssText = `
        font-size: 14px;
        font-weight: 600;
        color: #aaaacc;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 4px;
    `;
    controlsPanel.appendChild(title);

    // Toggle buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    // Create toggle buttons
    attacksButton = createToggleButton('Attacks', 'attacks', 'A');
    defendedButton = createToggleButton('Defended', 'defended', 'S');
    threatsButton = createToggleButton('Threats', 'threats', 'T');

    buttonsContainer.appendChild(attacksButton);
    buttonsContainer.appendChild(defendedButton);
    buttonsContainer.appendChild(threatsButton);
    controlsPanel.appendChild(buttonsContainer);

    // Depth slider section
    const depthSection = createDepthSliderSection();
    controlsPanel.appendChild(depthSection);

    // Keyboard hints
    const hints = document.createElement('div');
    hints.style.cssText = `
        font-size: 10px;
        color: #666688;
        text-align: center;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 4px;
    `;
    hints.innerHTML = 'Keys: A/S/T toggle<br>1/2/3 set depth';
    controlsPanel.appendChild(hints);

    // Add to document
    document.body.appendChild(controlsPanel);

    // Initial state sync
    syncButtonStates();
}

/**
 * Creates a toggle button with label and keyboard hint
 * @param {string} label - Button label
 * @param {string} type - 'attacks' | 'defended' | 'threats'
 * @param {string} key - Keyboard shortcut hint
 * @returns {HTMLElement}
 */
function createToggleButton(label, type, key) {
    const button = document.createElement('button');
    button.dataset.type = type;
    button.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 10px 14px;
        border: none;
        border-radius: 8px;
        background: ${BUTTON_COLORS[type].inactive};
        color: #ffffff;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
    `;

    // Label text
    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    button.appendChild(labelSpan);

    // Keyboard hint badge
    const keyBadge = document.createElement('span');
    keyBadge.textContent = key;
    keyBadge.style.cssText = `
        background: rgba(255, 255, 255, 0.15);
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
    `;
    button.appendChild(keyBadge);

    // Click handler
    button.addEventListener('click', () => handleToggleClick(type));

    // Hover effects
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.02)';
        button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = 'none';
    });

    return button;
}

/**
 * Creates the depth slider section for threat preview
 * @returns {HTMLElement}
 */
function createDepthSliderSection() {
    const section = document.createElement('div');
    section.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-top: 8px;
    `;

    // Label with current depth value
    const labelRow = document.createElement('div');
    labelRow.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const labelText = document.createElement('span');
    labelText.textContent = 'Threat Depth';
    labelText.style.cssText = `
        font-size: 12px;
        color: #aaaacc;
    `;

    depthLabel = document.createElement('span');
    depthLabel.textContent = `${getThreatDepth()} turn${getThreatDepth() > 1 ? 's' : ''}`;
    depthLabel.style.cssText = `
        font-size: 12px;
        color: #ff6666;
        font-weight: 600;
    `;

    labelRow.appendChild(labelText);
    labelRow.appendChild(depthLabel);
    section.appendChild(labelRow);

    // Slider
    depthSlider = document.createElement('input');
    depthSlider.type = 'range';
    depthSlider.min = '1';
    depthSlider.max = String(MAX_DEPTH);
    depthSlider.value = String(getThreatDepth());
    depthSlider.style.cssText = `
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: linear-gradient(to right, #ff3333, #ff6666, #ff9999);
        outline: none;
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
    `;

    // Slider thumb styling - cross-browser compatible
    const sliderStyle = document.createElement('style');
    sliderStyle.textContent = `
        #viz-controls input[type="range"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        #viz-controls input[type="range"]::-webkit-slider-runnable-track {
            height: 6px;
            border-radius: 3px;
            background: linear-gradient(to right, #ff3333, #ff6666, #ff9999);
        }
        #viz-controls input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            transition: transform 0.1s ease;
            margin-top: -6px;
        }
        #viz-controls input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
        }
        #viz-controls input[type="range"]::-moz-range-track {
            height: 6px;
            border-radius: 3px;
            background: linear-gradient(to right, #ff3333, #ff6666, #ff9999);
            border: none;
        }
        #viz-controls input[type="range"]::-moz-range-thumb {
            -moz-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        #viz-controls input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(sliderStyle);

    // Slider change handler
    depthSlider.addEventListener('input', () => {
        const depth = parseInt(depthSlider.value);
        setThreatDepth(depth);
        updateDepthLabel(depth);
    });

    section.appendChild(depthSlider);

    // Depth markers
    const markers = document.createElement('div');
    markers.style.cssText = `
        display: flex;
        justify-content: space-between;
        padding: 0 2px;
    `;
    for (let i = 1; i <= MAX_DEPTH; i++) {
        const marker = document.createElement('span');
        marker.textContent = String(i);
        marker.style.cssText = `
            font-size: 10px;
            color: #666688;
        `;
        markers.appendChild(marker);
    }
    section.appendChild(markers);

    return section;
}

/**
 * Handles toggle button clicks
 * @param {string} type - 'attacks' | 'defended' | 'threats'
 */
function handleToggleClick(type) {
    switch (type) {
        case 'attacks':
            toggleAttackVisualization();
            break;
        case 'defended':
            toggleDefendedVisualization();
            break;
        case 'threats':
            toggleThreatVisualization();
            break;
    }
    syncButtonStates();
}

/**
 * Syncs button visual states with actual visualization states
 */
function syncButtonStates() {
    if (!attacksButton || !defendedButton || !threatsButton) return;

    // Attacks button
    const attacksActive = isAttackVisualizationVisible();
    updateButtonStyle(attacksButton, 'attacks', attacksActive);

    // Defended button
    const defendedActive = isDefendedVisualizationVisible();
    updateButtonStyle(defendedButton, 'defended', defendedActive);

    // Threats button
    const threatsActive = isThreatVisualizationVisible();
    updateButtonStyle(threatsButton, 'threats', threatsActive);

    // Update slider state
    if (depthSlider) {
        depthSlider.value = String(getThreatDepth());
        updateDepthLabel(getThreatDepth());
    }
}

/**
 * Updates button visual style based on active state
 * @param {HTMLElement} button
 * @param {string} type
 * @param {boolean} active
 */
function updateButtonStyle(button, type, active) {
    const colors = BUTTON_COLORS[type];
    button.style.background = active ? colors.active : colors.inactive;
    button.style.boxShadow = active ? `0 0 12px ${colors.active}40` : 'none';
}

/**
 * Updates depth label text
 * @param {number} depth
 */
function updateDepthLabel(depth) {
    if (depthLabel) {
        depthLabel.textContent = `${depth} turn${depth > 1 ? 's' : ''}`;
    }
}

/**
 * Initializes the visualization controls UI
 * Must be called after all visualization modules are initialized
 */
function initVisualizationControls() {
    createControlsPanel();
    console.log('[Chess 1v1] Visualization controls initialized');
}

/**
 * Updates control states - call after any visualization toggle
 * Useful for syncing after keyboard shortcuts
 */
function updateControlStates() {
    syncButtonStates();
}

/**
 * Shows or hides the controls panel
 * @param {boolean} visible
 */
function setControlsVisible(visible) {
    if (controlsPanel) {
        controlsPanel.style.display = visible ? 'flex' : 'none';
    }
}

/**
 * Gets current visibility of controls panel
 * @returns {boolean}
 */
function isControlsVisible() {
    return controlsPanel ? controlsPanel.style.display !== 'none' : false;
}

/**
 * Cleans up the visualization controls
 */
function disposeVisualizationControls() {
    if (controlsPanel && controlsPanel.parentNode) {
        controlsPanel.parentNode.removeChild(controlsPanel);
    }
    controlsPanel = null;
    attacksButton = null;
    defendedButton = null;
    threatsButton = null;
    depthSlider = null;
    depthLabel = null;
}

// --- EXPORTS ---
export {
    initVisualizationControls,
    updateControlStates,
    setControlsVisible,
    isControlsVisible,
    disposeVisualizationControls
};
