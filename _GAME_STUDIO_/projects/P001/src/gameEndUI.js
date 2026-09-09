// === GAME END UI MODULE ===
// Phase 5.3: Game End UI
// Pattern: Component — DOM-based overlay with modal state
// Depends: gameState.js, pieces.js, turnIndicator.js, selection.js, endConditions.js

import { resetGame, COLORS } from './gameState.js';
import { setupStartingPosition } from './pieces.js';
import { resetGameOverState, updateTurnIndicator } from './turnIndicator.js';
import { clearHighlights } from './selection.js';
import { clearPositionHistory } from './endConditions.js';

// --- STATE ---
let overlayElement = null;
let isOverlayVisible = false;
let onNewGameCallback = null;  // Callback for additional reset actions

/**
 * Creates the game end overlay UI element
 */
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'game-end-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.75);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create content container
    const content = document.createElement('div');
    content.id = 'game-end-content';
    content.style.cssText = `
        background: linear-gradient(145deg, #2c2c2c, #3d3d3d);
        border-radius: 16px;
        padding: 40px 60px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
        text-align: center;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;

    // Result title
    const resultTitle = document.createElement('h1');
    resultTitle.id = 'game-end-result';
    resultTitle.textContent = 'Game Over';
    resultTitle.style.cssText = `
        color: #f5f5f5;
        font-family: 'Georgia', serif;
        font-size: 36px;
        margin: 0 0 12px 0;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    `;
    content.appendChild(resultTitle);

    // Result message
    const resultMessage = document.createElement('p');
    resultMessage.id = 'game-end-message';
    resultMessage.textContent = '';
    resultMessage.style.cssText = `
        color: #cccccc;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 20px;
        margin: 0 0 32px 0;
    `;
    content.appendChild(resultMessage);

    // New Game button
    const newGameBtn = document.createElement('button');
    newGameBtn.id = 'new-game-btn';
    newGameBtn.textContent = 'New Game';
    newGameBtn.style.cssText = `
        background: linear-gradient(145deg, #4a90d9, #357abd);
        color: #ffffff;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 20px;
        font-weight: 600;
        padding: 14px 48px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
        box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
    `;

    // Button hover effects
    newGameBtn.addEventListener('mouseenter', () => {
        newGameBtn.style.transform = 'scale(1.05)';
        newGameBtn.style.boxShadow = '0 6px 20px rgba(74, 144, 217, 0.5)';
        newGameBtn.style.background = 'linear-gradient(145deg, #5a9fe9, #4589cd)';
    });
    newGameBtn.addEventListener('mouseleave', () => {
        newGameBtn.style.transform = 'scale(1)';
        newGameBtn.style.boxShadow = '0 4px 12px rgba(74, 144, 217, 0.3)';
        newGameBtn.style.background = 'linear-gradient(145deg, #4a90d9, #357abd)';
    });

    // Button click handler
    newGameBtn.addEventListener('click', handleNewGame);

    content.appendChild(newGameBtn);
    overlay.appendChild(content);

    return overlay;
}

/**
 * Initializes the game end UI system
 * @param {Function} [newGameCallback] - Optional callback for additional reset actions
 */
function initGameEndUI(newGameCallback = null) {
    if (overlayElement) return;  // Already initialized

    onNewGameCallback = newGameCallback;
    overlayElement = createOverlay();
    document.body.appendChild(overlayElement);

    console.log('[Chess 1v1] Game end UI initialized');
}

/**
 * Shows the game end overlay with result
 * @param {{result: string, winner?: string, message: string}} gameResult
 */
function showGameEndOverlay(gameResult) {
    if (!overlayElement) {
        initGameEndUI();
    }

    const resultTitle = overlayElement.querySelector('#game-end-result');
    const resultMessage = overlayElement.querySelector('#game-end-message');
    const content = overlayElement.querySelector('#game-end-content');

    // Set result text based on outcome
    if (gameResult.winner) {
        const winnerName = gameResult.winner === COLORS.WHITE ? 'White' : 'Black';
        resultTitle.textContent = `${winnerName} Wins!`;
        resultTitle.style.color = '#2ecc71';  // Green for victory
    } else {
        resultTitle.textContent = 'Draw';
        resultTitle.style.color = '#f39c12';  // Orange/gold for draw
    }

    resultMessage.textContent = gameResult.message;

    // Show overlay with animation
    overlayElement.style.display = 'flex';
    isOverlayVisible = true;

    // Trigger animation on next frame
    requestAnimationFrame(() => {
        overlayElement.style.opacity = '1';
        content.style.transform = 'scale(1)';
    });

    console.log(`[Chess 1v1] Game end overlay shown: ${gameResult.message}`);
}

/**
 * Hides the game end overlay
 */
function hideGameEndOverlay() {
    if (!overlayElement || !isOverlayVisible) return;

    const content = overlayElement.querySelector('#game-end-content');

    // Animate out
    overlayElement.style.opacity = '0';
    content.style.transform = 'scale(0.9)';

    // Hide after animation completes
    setTimeout(() => {
        overlayElement.style.display = 'none';
        isOverlayVisible = false;
    }, 300);
}

/**
 * Handles New Game button click
 * Resets all game state and UI
 */
function handleNewGame() {
    console.log('[Chess 1v1] Starting new game...');

    // Hide overlay
    hideGameEndOverlay();

    // Reset game state
    resetGame();

    // Reset position history for threefold repetition tracking
    clearPositionHistory();

    // Reset 3D scene - place pieces in starting position
    setupStartingPosition();

    // Reset turn indicator
    resetGameOverState();
    updateTurnIndicator();

    // Clear any selection highlights
    clearHighlights();

    // Call additional reset callback if provided
    if (onNewGameCallback) {
        onNewGameCallback();
    }

    console.log('[Chess 1v1] New game started - White to move');
}

/**
 * Checks if the game end overlay is currently visible
 * @returns {boolean}
 */
function isGameEndOverlayVisible() {
    return isOverlayVisible;
}

/**
 * Cleans up game end UI resources
 */
function disposeGameEndUI() {
    hideGameEndOverlay();
    if (overlayElement && overlayElement.parentNode) {
        overlayElement.parentNode.removeChild(overlayElement);
    }
    overlayElement = null;
    onNewGameCallback = null;
}

// --- EXPORTS ---
export {
    initGameEndUI,
    showGameEndOverlay,
    hideGameEndOverlay,
    handleNewGame,
    isGameEndOverlayVisible,
    disposeGameEndUI
};
