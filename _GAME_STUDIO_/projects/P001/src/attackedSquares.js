// === ATTACKED SQUARES VISUALIZATION MODULE ===
// Phase 6.1: Attacked Squares - Core differentiator feature
// Pattern: Observer — attack state triggers visual updates
// Depends: Three.js, gameState.js, moveGeneration.js

import * as THREE from 'three';
import { getGameState, COLORS, PIECE_TYPES } from './gameState.js';
import {
    ROOK_DIRECTIONS,
    BISHOP_DIRECTIONS,
    KNIGHT_OFFSETS,
    KING_OFFSETS
} from './moveGeneration.js';

// --- CONSTANTS ---
const WHITE_ATTACK_COLOR = 0x4a90d9;      // Blue for white attacks
const BLACK_ATTACK_COLOR = 0xd94a4a;      // Red for black attacks
const OVERLAP_COLOR = 0x9b59b6;           // Purple for contested squares
const BASE_OPACITY = 0.25;                // Base opacity for single attack
const MAX_OPACITY = 0.6;                  // Max opacity for heavily attacked
const HIGHLIGHT_HEIGHT = 0.11;            // Just below selection highlights

// --- STATE ---
let attackGroup = null;                   // Group containing attack overlays
let isVisible = false;                    // Toggle state
let showWhiteAttacks = true;              // Show white's attacks
let showBlackAttacks = true;              // Show black's attacks

// Reusable geometry
const attackGeometry = new THREE.PlaneGeometry(0.95, 0.95);

// Materials pool (created on init)
let whiteMaterial = null;
let blackMaterial = null;
let overlapMaterial = null;

/**
 * Initializes the attacked squares visualization system
 * @param {THREE.Scene} scene - Scene to add overlays to
 */
function initAttackedSquares(scene) {
    // Create materials with blending for overlap effect
    whiteMaterial = new THREE.MeshBasicMaterial({
        color: WHITE_ATTACK_COLOR,
        transparent: true,
        opacity: BASE_OPACITY,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    blackMaterial = new THREE.MeshBasicMaterial({
        color: BLACK_ATTACK_COLOR,
        transparent: true,
        opacity: BASE_OPACITY,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    overlapMaterial = new THREE.MeshBasicMaterial({
        color: OVERLAP_COLOR,
        transparent: true,
        opacity: BASE_OPACITY,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    // Create attack overlay group
    attackGroup = new THREE.Group();
    attackGroup.name = 'attackedSquares';
    attackGroup.visible = isVisible;
    scene.add(attackGroup);

    console.log('[Chess 1v1] Attacked squares visualization initialized');
}

/**
 * Converts square notation to world position
 * @param {string} notation - Square notation (e.g., 'e4')
 * @returns {{x: number, z: number}}
 */
function notationToWorldXZ(notation) {
    const file = notation.charCodeAt(0) - 97;
    const rank = parseInt(notation[1]) - 1;
    const boardOffset = 3.5;

    return {
        x: file - boardOffset,
        z: (7 - rank) - boardOffset
    };
}

/**
 * Gets all squares attacked by a specific piece
 * Returns squares the piece can attack (not move to - pawns attack diagonally)
 * @param {string} fromSquare - Piece location
 * @param {Object} piece - Piece data
 * @param {GameState} state - Game state
 * @returns {string[]} Array of attacked square notations
 */
function getPieceAttacks(fromSquare, piece, state) {
    const attacks = [];
    const { file, rank } = state.notationToIndices(fromSquare);

    switch (piece.type) {
        case PIECE_TYPES.PAWN: {
            // Pawns attack diagonally (not forward)
            const direction = piece.color === COLORS.WHITE ? 1 : -1;
            const leftAttack = state.indicesToNotation(file - 1, rank + direction);
            const rightAttack = state.indicesToNotation(file + 1, rank + direction);
            if (leftAttack) attacks.push(leftAttack);
            if (rightAttack) attacks.push(rightAttack);
            break;
        }

        case PIECE_TYPES.KNIGHT: {
            for (const offset of KNIGHT_OFFSETS) {
                const target = state.indicesToNotation(file + offset.file, rank + offset.rank);
                if (target) attacks.push(target);
            }
            break;
        }

        case PIECE_TYPES.BISHOP: {
            for (const dir of BISHOP_DIRECTIONS) {
                let f = file + dir.file;
                let r = rank + dir.rank;
                while (true) {
                    const target = state.indicesToNotation(f, r);
                    if (!target) break;
                    attacks.push(target);
                    // Stop at first piece (but still attacks that square)
                    if (!state.isEmpty(target)) break;
                    f += dir.file;
                    r += dir.rank;
                }
            }
            break;
        }

        case PIECE_TYPES.ROOK: {
            for (const dir of ROOK_DIRECTIONS) {
                let f = file + dir.file;
                let r = rank + dir.rank;
                while (true) {
                    const target = state.indicesToNotation(f, r);
                    if (!target) break;
                    attacks.push(target);
                    if (!state.isEmpty(target)) break;
                    f += dir.file;
                    r += dir.rank;
                }
            }
            break;
        }

        case PIECE_TYPES.QUEEN: {
            // Queen = Rook + Bishop
            const queenDirs = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];
            for (const dir of queenDirs) {
                let f = file + dir.file;
                let r = rank + dir.rank;
                while (true) {
                    const target = state.indicesToNotation(f, r);
                    if (!target) break;
                    attacks.push(target);
                    if (!state.isEmpty(target)) break;
                    f += dir.file;
                    r += dir.rank;
                }
            }
            break;
        }

        case PIECE_TYPES.KING: {
            for (const offset of KING_OFFSETS) {
                const target = state.indicesToNotation(file + offset.file, rank + offset.rank);
                if (target) attacks.push(target);
            }
            break;
        }
    }

    return attacks;
}

/**
 * Calculates all attacked squares for a given color
 * Returns a Map of square -> attack count
 * @param {string} color - 'white' or 'black'
 * @param {GameState} state - Game state
 * @returns {Map<string, number>} Square notation -> number of attackers
 */
function getAttackedSquares(color, state) {
    const attackCounts = new Map();
    const pieces = state.getPiecesByColor(color);

    for (const { notation, piece } of pieces) {
        const attacks = getPieceAttacks(notation, piece, state);
        for (const square of attacks) {
            attackCounts.set(square, (attackCounts.get(square) || 0) + 1);
        }
    }

    return attackCounts;
}

/**
 * Clears all attack overlays
 */
function clearAttackOverlays() {
    if (!attackGroup) return;

    while (attackGroup.children.length > 0) {
        const child = attackGroup.children[0];
        attackGroup.remove(child);
        // Dispose cloned materials
        if (child.material && child.material !== whiteMaterial &&
            child.material !== blackMaterial && child.material !== overlapMaterial) {
            child.material.dispose();
        }
    }
}

/**
 * Creates an attack overlay mesh at the given square
 * @param {string} notation - Square notation
 * @param {string} attackType - 'white', 'black', or 'overlap'
 * @param {number} intensity - Attack intensity (1-4+)
 * @returns {THREE.Mesh}
 */
function createAttackOverlay(notation, attackType, intensity) {
    // Calculate opacity based on intensity (more attackers = more visible)
    const opacity = Math.min(BASE_OPACITY + (intensity - 1) * 0.1, MAX_OPACITY);

    // Clone material with adjusted opacity
    let baseMaterial;
    switch (attackType) {
        case 'white':
            baseMaterial = whiteMaterial;
            break;
        case 'black':
            baseMaterial = blackMaterial;
            break;
        case 'overlap':
            baseMaterial = overlapMaterial;
            break;
    }

    const material = baseMaterial.clone();
    material.opacity = opacity;

    const mesh = new THREE.Mesh(attackGeometry, material);
    const pos = notationToWorldXZ(notation);

    mesh.position.set(pos.x, HIGHLIGHT_HEIGHT, pos.z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.userData = {
        square: notation,
        type: 'attackOverlay',
        attackType,
        intensity
    };

    return mesh;
}

/**
 * Updates the attack visualization based on current game state
 */
function updateAttackVisualization() {
    if (!attackGroup || !isVisible) return;

    clearAttackOverlays();

    const state = getGameState();
    const whiteAttacks = showWhiteAttacks ? getAttackedSquares(COLORS.WHITE, state) : new Map();
    const blackAttacks = showBlackAttacks ? getAttackedSquares(COLORS.BLACK, state) : new Map();

    // Collect all attacked squares
    const allSquares = new Set([...whiteAttacks.keys(), ...blackAttacks.keys()]);

    for (const square of allSquares) {
        const whiteCount = whiteAttacks.get(square) || 0;
        const blackCount = blackAttacks.get(square) || 0;

        if (whiteCount > 0 && blackCount > 0) {
            // Contested square - show overlap color
            // Intensity based on total attackers
            const totalIntensity = whiteCount + blackCount;
            const overlay = createAttackOverlay(square, 'overlap', totalIntensity);
            attackGroup.add(overlay);
        } else if (whiteCount > 0) {
            const overlay = createAttackOverlay(square, 'white', whiteCount);
            attackGroup.add(overlay);
        } else if (blackCount > 0) {
            const overlay = createAttackOverlay(square, 'black', blackCount);
            attackGroup.add(overlay);
        }
    }
}

/**
 * Toggles the attack visualization on/off
 * @returns {boolean} New visibility state
 */
function toggleAttackVisualization() {
    isVisible = !isVisible;
    if (attackGroup) {
        attackGroup.visible = isVisible;
        if (isVisible) {
            updateAttackVisualization();
        }
    }
    console.log(`[Chess 1v1] Attack visualization: ${isVisible ? 'ON' : 'OFF'}`);
    return isVisible;
}

/**
 * Sets visibility directly
 * @param {boolean} visible
 */
function setAttackVisualizationVisible(visible) {
    isVisible = visible;
    if (attackGroup) {
        attackGroup.visible = visible;
        if (visible) {
            updateAttackVisualization();
        }
    }
}

/**
 * Toggles which color's attacks to show
 * @param {string} color - 'white', 'black', or 'both'
 */
function setAttackFilter(color) {
    switch (color) {
        case 'white':
            showWhiteAttacks = true;
            showBlackAttacks = false;
            break;
        case 'black':
            showWhiteAttacks = false;
            showBlackAttacks = true;
            break;
        case 'both':
        default:
            showWhiteAttacks = true;
            showBlackAttacks = true;
            break;
    }

    if (isVisible) {
        updateAttackVisualization();
    }
}

/**
 * Gets current visibility state
 * @returns {boolean}
 */
function isAttackVisualizationVisible() {
    return isVisible;
}

/**
 * Gets attack data for a specific square
 * @param {string} notation - Square notation
 * @returns {{white: number, black: number}} Attack counts
 */
function getSquareAttackData(notation) {
    const state = getGameState();
    const whiteAttacks = getAttackedSquares(COLORS.WHITE, state);
    const blackAttacks = getAttackedSquares(COLORS.BLACK, state);

    return {
        white: whiteAttacks.get(notation) || 0,
        black: blackAttacks.get(notation) || 0
    };
}

/**
 * Cleans up the attack visualization system
 */
function disposeAttackedSquares() {
    clearAttackOverlays();
    if (attackGroup && attackGroup.parent) {
        attackGroup.parent.remove(attackGroup);
    }
    attackGroup = null;

    // Dispose materials
    whiteMaterial?.dispose();
    blackMaterial?.dispose();
    overlapMaterial?.dispose();
}

// --- EXPORTS ---
export {
    initAttackedSquares,
    updateAttackVisualization,
    toggleAttackVisualization,
    setAttackVisualizationVisible,
    setAttackFilter,
    isAttackVisualizationVisible,
    getSquareAttackData,
    getAttackedSquares,
    getPieceAttacks,
    clearAttackOverlays,
    disposeAttackedSquares
};
