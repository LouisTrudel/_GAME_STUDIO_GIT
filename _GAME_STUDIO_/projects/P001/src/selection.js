// === SELECTION MODULE ===
// Phase 3.2: Piece Selection
// Pattern: Observer — selection state dispatches visual updates
// Depends: Three.js, gameState.js, moveGeneration.js

import * as THREE from 'three';
import { getGameState, COLORS } from './gameState.js';
import { getLegalMoves } from './moveGeneration.js';

// --- CONSTANTS ---
const SELECTION_COLOR = 0xffff00;        // Yellow for selected piece
const LEGAL_MOVE_COLOR = 0x00ff00;       // Green for legal move destinations
const CAPTURE_MOVE_COLOR = 0xff0000;     // Red for capture destinations
const HIGHLIGHT_OPACITY = 0.5;
const HIGHLIGHT_HEIGHT = 0.12;           // Slightly above board surface

// --- STATE ---
let selectedSquare = null;               // Currently selected square notation
let highlightGroup = null;               // Group containing highlight meshes
let boardGroup = null;                   // Reference to board for positioning
let piecesGroup = null;                  // Reference to pieces for visual feedback

// Reusable geometry for highlights
const highlightGeometry = new THREE.PlaneGeometry(0.9, 0.9);

// Materials
const selectionMaterial = new THREE.MeshBasicMaterial({
    color: SELECTION_COLOR,
    transparent: true,
    opacity: HIGHLIGHT_OPACITY,
    side: THREE.DoubleSide
});

const legalMoveMaterial = new THREE.MeshBasicMaterial({
    color: LEGAL_MOVE_COLOR,
    transparent: true,
    opacity: HIGHLIGHT_OPACITY,
    side: THREE.DoubleSide
});

const captureMaterial = new THREE.MeshBasicMaterial({
    color: CAPTURE_MOVE_COLOR,
    transparent: true,
    opacity: HIGHLIGHT_OPACITY,
    side: THREE.DoubleSide
});

/**
 * Initializes the selection system
 * @param {THREE.Scene} scene - Scene to add highlights to
 * @param {THREE.Group} board - Board group for positioning reference
 * @param {THREE.Group} pieces - Pieces group for visual feedback
 */
function initSelection(scene, board, pieces) {
    boardGroup = board;
    piecesGroup = pieces;

    // Create highlight group
    highlightGroup = new THREE.Group();
    highlightGroup.name = 'selectionHighlights';
    scene.add(highlightGroup);

    console.log('[Chess 1v1] Selection system initialized');
}

/**
 * Converts square notation to world position
 * @param {string} notation - Square notation (e.g., 'e4')
 * @returns {{x: number, z: number}}
 */
function notationToWorldXZ(notation) {
    const file = notation.charCodeAt(0) - 97;  // a=0, h=7
    const rank = parseInt(notation[1]) - 1;     // 1=0, 8=7
    const boardOffset = 3.5;

    return {
        x: file - boardOffset,
        z: (7 - rank) - boardOffset
    };
}

/**
 * Creates a highlight mesh at the given square
 * @param {string} notation - Square notation
 * @param {THREE.Material} material - Material to use
 * @returns {THREE.Mesh}
 */
function createHighlight(notation, material) {
    const mesh = new THREE.Mesh(highlightGeometry, material);
    const pos = notationToWorldXZ(notation);

    mesh.position.set(pos.x, HIGHLIGHT_HEIGHT, pos.z);
    mesh.rotation.x = -Math.PI / 2;  // Lay flat on board
    mesh.userData = { square: notation, type: 'highlight' };

    return mesh;
}

/**
 * Clears all current highlights
 */
function clearHighlights() {
    if (!highlightGroup) return;

    // Remove all children
    while (highlightGroup.children.length > 0) {
        highlightGroup.remove(highlightGroup.children[0]);
    }
}

/**
 * Selects a piece and shows legal move highlights
 * @param {string} notation - Square notation to select
 * @returns {boolean} True if selection was successful
 */
function selectPiece(notation) {
    const state = getGameState();
    const piece = state.getSquare(notation);

    // Can only select own pieces
    if (!piece || piece.color !== state.currentTurn) {
        return false;
    }

    // Clear previous selection
    clearHighlights();

    // Set new selection
    selectedSquare = notation;

    // Add selection highlight
    const selectionHighlight = createHighlight(notation, selectionMaterial);
    highlightGroup.add(selectionHighlight);

    // Get legal moves and add destination highlights
    const legalMoves = getLegalMoves(notation);

    for (const move of legalMoves) {
        const targetPiece = state.getSquare(move);
        // Use capture material if there's an enemy piece, legal move material otherwise
        const material = targetPiece ? captureMaterial : legalMoveMaterial;
        const moveHighlight = createHighlight(move, material);
        highlightGroup.add(moveHighlight);
    }

    console.log(`[Chess 1v1] Selected ${piece.color} ${piece.type} on ${notation}`);
    console.log(`[Chess 1v1] Legal moves: [${legalMoves.join(', ')}]`);

    return true;
}

/**
 * Deselects the current piece
 */
function deselectPiece() {
    if (selectedSquare) {
        console.log(`[Chess 1v1] Deselected ${selectedSquare}`);
    }
    selectedSquare = null;
    clearHighlights();
}

/**
 * Gets the currently selected square
 * @returns {string|null} Selected square notation or null
 */
function getSelectedSquare() {
    return selectedSquare;
}

/**
 * Gets legal moves for the currently selected piece
 * @returns {string[]} Array of legal move destinations
 */
function getSelectedLegalMoves() {
    if (!selectedSquare) return [];
    return getLegalMoves(selectedSquare);
}

/**
 * Checks if a square is a valid destination for the selected piece
 * @param {string} notation - Destination square
 * @returns {boolean}
 */
function isValidDestination(notation) {
    if (!selectedSquare) return false;
    const legalMoves = getLegalMoves(selectedSquare);
    return legalMoves.includes(notation);
}

/**
 * Handles square click for selection logic
 * Returns selection action result for Phase 3.3 to use
 * @param {string} notation - Clicked square notation
 * @param {Object|null} piece - Piece at clicked square (if any)
 * @returns {{action: string, from?: string, to?: string}}
 */
function handleSelectionClick(notation, piece) {
    const state = getGameState();

    // Case 1: No piece selected
    if (!selectedSquare) {
        // Try to select clicked piece (must be own piece)
        if (piece && piece.color === state.currentTurn) {
            selectPiece(notation);
            return { action: 'select', square: notation };
        }
        // Clicked empty or enemy square with nothing selected
        return { action: 'none' };
    }

    // Case 2: Piece already selected
    // Sub-case 2a: Clicked same square - deselect
    if (notation === selectedSquare) {
        deselectPiece();
        return { action: 'deselect' };
    }

    // Sub-case 2b: Clicked valid destination - return move info (execution handled by Phase 3.3)
    if (isValidDestination(notation)) {
        const from = selectedSquare;
        deselectPiece();  // Clear selection after move intent
        return { action: 'move', from, to: notation };
    }

    // Sub-case 2c: Clicked another own piece - switch selection
    if (piece && piece.color === state.currentTurn) {
        selectPiece(notation);
        return { action: 'select', square: notation };
    }

    // Sub-case 2d: Clicked invalid square - deselect
    deselectPiece();
    return { action: 'deselect' };
}

/**
 * Cleans up selection system
 */
function disposeSelection() {
    clearHighlights();
    selectedSquare = null;
    if (highlightGroup && highlightGroup.parent) {
        highlightGroup.parent.remove(highlightGroup);
    }
    highlightGroup = null;
}

// --- EXPORTS ---
export {
    initSelection,
    selectPiece,
    deselectPiece,
    getSelectedSquare,
    getSelectedLegalMoves,
    isValidDestination,
    handleSelectionClick,
    clearHighlights,
    disposeSelection
};
