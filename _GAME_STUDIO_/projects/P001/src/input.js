// === INPUT HANDLING MODULE ===
// Phase 3.1: Input Handling
// Pattern: Observer — click events dispatch to handlers
// Depends: Three.js, gameState.js

import * as THREE from 'three';
import { getGameState, COLORS } from './gameState.js';

// --- RAYCASTER SETUP ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Store references (set via init)
let camera = null;
let boardGroup = null;
let piecesGroup = null;

// Click callback for external handling (Phase 3.2+)
let onSquareClick = null;

/**
 * Initializes input handling
 * @param {THREE.Camera} cam - Camera for raycasting
 * @param {THREE.Group} board - Board group containing squares
 * @param {THREE.Group} pieces - Pieces group for hit detection
 */
function initInput(cam, board, pieces) {
    camera = cam;
    boardGroup = board;
    piecesGroup = pieces;

    // Add click listener
    window.addEventListener('click', handleClick);

    console.log('[Chess 1v1] Input handling initialized');
}

/**
 * Sets external click handler for game logic
 * @param {Function} callback - Called with (squareNotation, piece|null)
 */
function setSquareClickHandler(callback) {
    onSquareClick = callback;
}

/**
 * Handles click events - raycast to board/pieces
 * @param {MouseEvent} event
 */
function handleClick(event) {
    if (!camera || !boardGroup) return;

    // Convert mouse position to normalized device coords (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Cast ray from camera through mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check board squares first
    const boardIntersects = raycaster.intersectObjects(boardGroup.children, true);

    // Find first square intersection (skip labels/sprites)
    for (const intersect of boardIntersects) {
        const obj = intersect.object;
        if (obj.userData && obj.userData.type === 'square') {
            const notation = obj.userData.notation;

            // Log click coords as required by test
            console.log(`[Chess 1v1] Click: ${notation}`);

            // Get piece at this square (if any)
            const state = getGameState();
            const piece = state.getSquare(notation);

            // Dispatch to external handler
            if (onSquareClick) {
                onSquareClick(notation, piece);
            }

            return; // Only process first valid square
        }
    }

    // Check piece intersections (pieces sit above board)
    if (piecesGroup) {
        const pieceIntersects = raycaster.intersectObjects(piecesGroup.children, true);

        for (const intersect of pieceIntersects) {
            // Walk up to find the piece group (not individual meshes)
            let obj = intersect.object;
            while (obj && (!obj.userData || obj.userData.type !== 'piece')) {
                obj = obj.parent;
            }

            if (obj && obj.userData && obj.userData.square) {
                const notation = obj.userData.square;

                console.log(`[Chess 1v1] Click: ${notation} (piece)`);

                const state = getGameState();
                const piece = state.getSquare(notation);

                if (onSquareClick) {
                    onSquareClick(notation, piece);
                }

                return;
            }
        }
    }
}

/**
 * Gets world position from square notation
 * @param {string} notation - Square notation (e.g., 'e4')
 * @returns {{x: number, z: number}} World XZ coordinates
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
 * Cleans up input listeners
 */
function disposeInput() {
    window.removeEventListener('click', handleClick);
}

// --- EXPORTS ---
export {
    initInput,
    setSquareClickHandler,
    notationToWorldXZ,
    disposeInput
};
