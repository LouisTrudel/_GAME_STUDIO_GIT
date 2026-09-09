// === PAWN PROMOTION MODULE ===
// Phase 4.3: Pawn Promotion
// Pattern: StateMachine — modal UI with clear open/close states
// Depends: gameState.js, pieces.js

import { PIECE_TYPES, COLORS } from './gameState.js';
import { placePiece, removePiece } from './pieces.js';

// --- STATE ---
let promotionModal = null;
let isPromotionActive = false;
let pendingPromotion = null;  // { square, color, callback }

// Promotion piece options (no king/pawn)
const PROMOTION_PIECES = [
    { type: PIECE_TYPES.QUEEN, name: 'queen', symbol: '♛' },
    { type: PIECE_TYPES.ROOK, name: 'rook', symbol: '♜' },
    { type: PIECE_TYPES.BISHOP, name: 'bishop', symbol: '♝' },
    { type: PIECE_TYPES.KNIGHT, name: 'knight', symbol: '♞' }
];

/**
 * Creates the promotion modal UI element
 */
function createPromotionModal() {
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'promotion-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    // Create modal content
    const content = document.createElement('div');
    content.id = 'promotion-content';
    content.style.cssText = `
        background: linear-gradient(145deg, #2c2c2c, #3d3d3d);
        border-radius: 12px;
        padding: 24px 32px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        text-align: center;
    `;

    // Title
    const title = document.createElement('h2');
    title.id = 'promotion-title';
    title.textContent = 'Promote Pawn';
    title.style.cssText = `
        color: #f5f5f5;
        font-family: 'Georgia', serif;
        font-size: 24px;
        margin-bottom: 20px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    `;
    content.appendChild(title);

    // Piece buttons container
    const buttonsRow = document.createElement('div');
    buttonsRow.id = 'promotion-buttons';
    buttonsRow.style.cssText = `
        display: flex;
        gap: 16px;
        justify-content: center;
    `;

    // Create buttons for each promotion piece
    PROMOTION_PIECES.forEach(piece => {
        const btn = document.createElement('button');
        btn.dataset.pieceType = piece.type;
        btn.dataset.pieceName = piece.name;
        btn.innerHTML = piece.symbol;
        btn.title = piece.name.charAt(0).toUpperCase() + piece.name.slice(1);
        btn.style.cssText = `
            width: 70px;
            height: 70px;
            font-size: 42px;
            background: linear-gradient(145deg, #f0d9b5, #b58863);
            border: 3px solid #8b7355;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.15s, box-shadow 0.15s;
            color: #2c2c2c;
        `;

        // Hover effects
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
            btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = 'none';
        });

        // Click handler
        btn.addEventListener('click', () => {
            handlePromotionChoice(piece.type, piece.name);
        });

        buttonsRow.appendChild(btn);
    });

    content.appendChild(buttonsRow);
    modal.appendChild(content);

    return modal;
}

/**
 * Initializes the promotion system
 */
function initPromotion() {
    if (promotionModal) return;  // Already initialized

    promotionModal = createPromotionModal();
    document.body.appendChild(promotionModal);

    console.log('[Chess 1v1] Promotion system initialized');
}

/**
 * Checks if a move results in pawn promotion
 * @param {string} from - Source square
 * @param {string} to - Destination square
 * @param {Object} piece - Piece data
 * @returns {boolean}
 */
function isPromotionMove(from, to, piece) {
    if (!piece || piece.type !== PIECE_TYPES.PAWN) return false;

    const destRank = parseInt(to[1]);

    // White pawn reaching rank 8, or black pawn reaching rank 1
    return (piece.color === COLORS.WHITE && destRank === 8) ||
           (piece.color === COLORS.BLACK && destRank === 1);
}

/**
 * Shows the promotion modal and waits for user choice
 * @param {string} square - Square where pawn will promote
 * @param {string} color - Color of the promoting pawn
 * @returns {Promise<{type: string, name: string}>} - Chosen piece type
 */
function showPromotionModal(square, color) {
    return new Promise((resolve) => {
        if (!promotionModal) {
            initPromotion();
        }

        // Store pending promotion data
        pendingPromotion = { square, color, callback: resolve };
        isPromotionActive = true;

        // Update button colors based on piece color
        const buttons = promotionModal.querySelectorAll('#promotion-buttons button');
        buttons.forEach(btn => {
            if (color === COLORS.WHITE) {
                btn.style.color = '#2c2c2c';  // Dark pieces for white
            } else {
                btn.style.color = '#f5f5f5';  // Light pieces for black
                btn.style.background = 'linear-gradient(145deg, #2c2c2c, #1a1a1a)';
                btn.style.borderColor = '#555555';
            }
        });

        // Update title
        const title = promotionModal.querySelector('#promotion-title');
        title.textContent = `${color === COLORS.WHITE ? 'White' : 'Black'} Pawn Promotes`;

        // Show modal
        promotionModal.style.display = 'flex';

        console.log(`[Chess 1v1] Promotion modal shown for ${color} pawn at ${square}`);
    });
}

/**
 * Handles user selecting a promotion piece
 * @param {string} pieceType - PIECE_TYPES value
 * @param {string} pieceName - Piece name string
 */
function handlePromotionChoice(pieceType, pieceName) {
    if (!pendingPromotion || !isPromotionActive) return;

    const { square, color, callback } = pendingPromotion;

    // Hide modal
    hidePromotionModal();

    // Resolve the promise with chosen piece
    callback({ type: pieceType, name: pieceName });

    console.log(`[Chess 1v1] Promotion choice: ${pieceName}`);
}

/**
 * Hides the promotion modal
 */
function hidePromotionModal() {
    if (promotionModal) {
        promotionModal.style.display = 'none';

        // Reset button styles for next use
        const buttons = promotionModal.querySelectorAll('#promotion-buttons button');
        buttons.forEach(btn => {
            btn.style.color = '#2c2c2c';
            btn.style.background = 'linear-gradient(145deg, #f0d9b5, #b58863)';
            btn.style.borderColor = '#8b7355';
        });
    }

    isPromotionActive = false;
    pendingPromotion = null;
}

/**
 * Checks if promotion is currently in progress
 * @returns {boolean}
 */
function isPromotionInProgress() {
    return isPromotionActive;
}

/**
 * Replaces a pawn with the promoted piece in the 3D scene
 * @param {string} square - Square notation
 * @param {string} pieceName - Piece name ('queen', 'rook', etc.)
 * @param {string} color - Piece color
 */
function replaceWithPromotedPiece(square, pieceName, color) {
    // Remove the pawn from the scene
    removePiece(square);

    // Place the new piece
    placePiece(pieceName, color, square);

    console.log(`[Chess 1v1] Replaced pawn with ${color} ${pieceName} at ${square}`);
}

/**
 * Cleans up promotion system
 */
function disposePromotion() {
    hidePromotionModal();
    if (promotionModal && promotionModal.parentNode) {
        promotionModal.parentNode.removeChild(promotionModal);
    }
    promotionModal = null;
}

// --- EXPORTS ---
export {
    initPromotion,
    isPromotionMove,
    showPromotionModal,
    hidePromotionModal,
    isPromotionInProgress,
    replaceWithPromotedPiece,
    disposePromotion
};
