// === TURN INDICATOR MODULE ===
// Phase 3.1: Turn Display
// Phase 5.1: End Conditions Display
// Pattern: Component — DOM-based UI overlay
// Depends: gameState.js

import { getGameState, COLORS } from './gameState.js';

// DOM element reference
let indicatorElement = null;

// Game over state
let gameOverState = null;

/**
 * Creates and initializes the turn indicator UI
 * Displays "White to move" or "Black to move"
 */
function initTurnIndicator() {
    // Create indicator element
    indicatorElement = document.createElement('div');
    indicatorElement.id = 'turn-indicator';

    // Style the indicator
    indicatorElement.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: rgba(0, 0, 0, 0.75);
        color: #ffffff;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 18px;
        font-weight: 500;
        border-radius: 8px;
        z-index: 1000;
        user-select: none;
        pointer-events: none;
        transition: background-color 0.3s ease;
    `;

    document.body.appendChild(indicatorElement);

    // Initial update
    updateTurnIndicator();

    console.log('[Chess 1v1] Turn indicator initialized');
}

/**
 * Updates the turn indicator to reflect current turn or game result
 * @param {Object} [options] - Optional settings
 * @param {boolean} [options.inCheck] - Whether current player is in check
 */
function updateTurnIndicator(options = {}) {
    if (!indicatorElement) return;

    // If game is over, show the result
    if (gameOverState) {
        showGameOverDisplay();
        return;
    }

    const state = getGameState();
    const turn = state.currentTurn;
    const inCheck = options.inCheck || false;

    // Update text
    const turnText = turn === COLORS.WHITE ? 'White' : 'Black';
    indicatorElement.textContent = inCheck
        ? `${turnText} is in check!`
        : `${turnText} to move`;

    // Update styling based on turn
    if (turn === COLORS.WHITE) {
        indicatorElement.style.backgroundColor = inCheck
            ? 'rgba(220, 53, 69, 0.9)'  // Red for check
            : 'rgba(240, 240, 240, 0.9)';
        indicatorElement.style.color = inCheck ? '#fff' : '#1a1a1a';
        indicatorElement.style.border = inCheck ? '2px solid #dc3545' : '2px solid #333';
    } else {
        indicatorElement.style.backgroundColor = inCheck
            ? 'rgba(220, 53, 69, 0.9)'  // Red for check
            : 'rgba(30, 30, 30, 0.9)';
        indicatorElement.style.color = '#f0f0f0';
        indicatorElement.style.border = inCheck ? '2px solid #dc3545' : '2px solid #888';
    }

    console.log(`[Chess 1v1] Turn: ${turnText} to move${inCheck ? ' (in check!)' : ''}`);
}

/**
 * Shows the game over display in the indicator
 */
function showGameOverDisplay() {
    if (!indicatorElement || !gameOverState) return;

    indicatorElement.textContent = gameOverState.message;

    // Style based on result type
    if (gameOverState.winner) {
        // Checkmate - winner color styling
        if (gameOverState.winner === COLORS.WHITE) {
            indicatorElement.style.backgroundColor = 'rgba(40, 167, 69, 0.95)';  // Green for win
            indicatorElement.style.color = '#fff';
            indicatorElement.style.border = '3px solid #28a745';
        } else {
            indicatorElement.style.backgroundColor = 'rgba(40, 167, 69, 0.95)';
            indicatorElement.style.color = '#fff';
            indicatorElement.style.border = '3px solid #28a745';
        }
    } else {
        // Draw (stalemate, etc.)
        indicatorElement.style.backgroundColor = 'rgba(108, 117, 125, 0.95)';  // Gray for draw
        indicatorElement.style.color = '#fff';
        indicatorElement.style.border = '3px solid #6c757d';
    }

    // Make slightly larger for game over
    indicatorElement.style.fontSize = '22px';
    indicatorElement.style.padding = '16px 32px';
}

/**
 * Sets the game over state and updates display
 * @param {{result: string, winner?: string, message: string}} result - Game result object
 */
function setGameOver(result) {
    gameOverState = result;
    showGameOverDisplay();
}

/**
 * Checks if the game is over
 * @returns {boolean}
 */
function isGameOverDisplayed() {
    return gameOverState !== null;
}

/**
 * Resets game over state (for new game)
 */
function resetGameOverState() {
    gameOverState = null;
    // Reset indicator styling
    if (indicatorElement) {
        indicatorElement.style.fontSize = '18px';
        indicatorElement.style.padding = '12px 24px';
    }
}

/**
 * Gets the current turn color
 * @returns {string} 'white' or 'black'
 */
function getCurrentTurn() {
    return getGameState().currentTurn;
}

/**
 * Switches to the next turn (for Phase 3.3)
 */
function switchTurn() {
    const state = getGameState();
    state.currentTurn = state.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    updateTurnIndicator();
}

/**
 * Removes the turn indicator from DOM
 */
function disposeTurnIndicator() {
    if (indicatorElement && indicatorElement.parentNode) {
        indicatorElement.parentNode.removeChild(indicatorElement);
        indicatorElement = null;
    }
}

// --- EXPORTS ---
export {
    initTurnIndicator,
    updateTurnIndicator,
    getCurrentTurn,
    switchTurn,
    disposeTurnIndicator,
    // Phase 5.1: Game over display
    setGameOver,
    isGameOverDisplayed,
    resetGameOverState
};
