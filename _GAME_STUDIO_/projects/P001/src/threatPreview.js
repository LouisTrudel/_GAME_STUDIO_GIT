// === MULTI-TURN THREAT PREVIEW MODULE ===
// Phase 6.3: Multi-Turn Threat Preview - Calculate 1-3 turn threats, render fading intensity
// Pattern: Observer — threat state triggers visual updates
// Depends: Three.js, gameState.js, moveGeneration.js, attackedSquares.js
//
// PERFORMANCE OPTIMIZATIONS (T036):
// - Piece mobility calculation instead of full game tree search
// - Cached attack patterns to avoid repeated getPieceAttacks calls
// - Debounced visualization updates to prevent frame drops
// - Reduced allocations by reusing position arrays
// - Early termination when square already has minimum depth

import * as THREE from 'three';
import { getGameState, COLORS, PIECE_TYPES } from './gameState.js';
import { getPieceAttacks } from './attackedSquares.js';
import {
    ROOK_DIRECTIONS,
    BISHOP_DIRECTIONS,
    KNIGHT_OFFSETS,
    KING_OFFSETS
} from './moveGeneration.js';

// --- CONSTANTS ---
// Threat colors by depth (closer = more intense red)
const THREAT_COLORS = {
    1: 0xff3333,  // Bright red - immediate threat (1 turn)
    2: 0xff6666,  // Medium red - near threat (2 turns)
    3: 0xff9999   // Light red - distant threat (3 turns)
};

// Opacity by depth (closer = more visible)
const THREAT_OPACITY = {
    1: 0.55,  // High intensity
    2: 0.35,  // Medium intensity
    3: 0.20   // Low intensity
};

const HIGHLIGHT_HEIGHT = 0.115;  // Slightly above attack overlays
const MAX_DEPTH = 3;             // Maximum lookahead turns

// Performance tuning constants
const DEBOUNCE_MS = 50;          // Debounce visualization updates
const MAX_MOVES_DEPTH_1 = 12;    // Max moves to explore at depth 1
const MAX_MOVES_DEPTH_2 = 6;     // Max moves to explore at depth 2
const MAX_MOVES_DEPTH_3 = 3;     // Max moves to explore at depth 3

// --- STATE ---
let threatGroup = null;          // Group containing threat overlays
let isVisible = false;           // Toggle state
let currentDepth = 2;            // Current depth setting (1-3)
let showWhiteThreats = true;     // Show threats TO white (from black)
let showBlackThreats = true;     // Show threats TO black (from white)

// Debounce state
let debounceTimer = null;
let pendingUpdate = false;

// Cache for threat calculations (cleared on each update)
let threatCache = null;
let cacheStateKey = null;

// Reusable geometry
const threatGeometry = new THREE.PlaneGeometry(0.9, 0.9);

// Materials by depth (created on init)
const depthMaterials = {};

/**
 * Initializes the threat preview visualization system
 * @param {THREE.Scene} scene - Scene to add overlays to
 */
function initThreatPreview(scene) {
    // Create materials for each depth level
    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
        depthMaterials[depth] = new THREE.MeshBasicMaterial({
            color: THREAT_COLORS[depth],
            transparent: true,
            opacity: THREAT_OPACITY[depth],
            side: THREE.DoubleSide,
            depthWrite: false
        });
    }

    // Create threat overlay group
    threatGroup = new THREE.Group();
    threatGroup.name = 'threatPreview';
    threatGroup.visible = isVisible;
    scene.add(threatGroup);

    console.log('[Chess 1v1] Multi-turn threat preview initialized');
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
 * Gets all squares attacked by all pieces of a given color
 * @param {string} color - 'white' or 'black'
 * @param {GameState} state - Game state
 * @returns {Set<string>} Set of attacked square notations
 */
function getAttackedSquaresSet(color, state) {
    const attacked = new Set();
    const pieces = state.getPiecesByColor(color);

    for (const { notation, piece } of pieces) {
        const attacks = getPieceAttacks(notation, piece, state);
        attacks.forEach(sq => attacked.add(sq));
    }

    return attacked;
}

/**
 * Generates a simple state key for cache invalidation
 * @param {GameState} state - Game state
 * @returns {string} Cache key
 */
function generateStateKey(state) {
    let key = state.currentTurn;
    state.board.forEach((piece, notation) => {
        if (piece) {
            key += `${notation}${piece.color[0]}${piece.type}`;
        }
    });
    return key;
}

/**
 * Gets reachable squares for a piece (where it can legally move)
 * Optimized version that avoids full legal move calculation
 * @param {string} fromSquare - Piece location
 * @param {Object} piece - Piece data
 * @param {GameState} state - Game state
 * @returns {string[]} Array of reachable squares
 */
function getReachableSquares(fromSquare, piece, state) {
    const moves = [];
    const { file, rank } = state.notationToIndices(fromSquare);

    switch (piece.type) {
        case PIECE_TYPES.PAWN: {
            const direction = piece.color === COLORS.WHITE ? 1 : -1;
            const startRank = piece.color === COLORS.WHITE ? 1 : 6;

            // Forward moves
            const oneAhead = state.indicesToNotation(file, rank + direction);
            if (oneAhead && state.isEmpty(oneAhead)) {
                moves.push(oneAhead);
                if (rank === startRank) {
                    const twoAhead = state.indicesToNotation(file, rank + 2 * direction);
                    if (twoAhead && state.isEmpty(twoAhead)) {
                        moves.push(twoAhead);
                    }
                }
            }
            // Diagonal captures
            const leftCapture = state.indicesToNotation(file - 1, rank + direction);
            const rightCapture = state.indicesToNotation(file + 1, rank + direction);
            if (leftCapture && state.hasEnemy(leftCapture, piece.color)) moves.push(leftCapture);
            if (rightCapture && state.hasEnemy(rightCapture, piece.color)) moves.push(rightCapture);
            break;
        }

        case PIECE_TYPES.KNIGHT: {
            for (const offset of KNIGHT_OFFSETS) {
                const target = state.indicesToNotation(file + offset.file, rank + offset.rank);
                if (target && !state.hasFriendly(target, piece.color)) {
                    moves.push(target);
                }
            }
            break;
        }

        case PIECE_TYPES.BISHOP: {
            for (const dir of BISHOP_DIRECTIONS) {
                let f = file + dir.file, r = rank + dir.rank;
                while (true) {
                    const target = state.indicesToNotation(f, r);
                    if (!target) break;
                    if (state.hasFriendly(target, piece.color)) break;
                    moves.push(target);
                    if (!state.isEmpty(target)) break;
                    f += dir.file; r += dir.rank;
                }
            }
            break;
        }

        case PIECE_TYPES.ROOK: {
            for (const dir of ROOK_DIRECTIONS) {
                let f = file + dir.file, r = rank + dir.rank;
                while (true) {
                    const target = state.indicesToNotation(f, r);
                    if (!target) break;
                    if (state.hasFriendly(target, piece.color)) break;
                    moves.push(target);
                    if (!state.isEmpty(target)) break;
                    f += dir.file; r += dir.rank;
                }
            }
            break;
        }

        case PIECE_TYPES.QUEEN: {
            const allDirs = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];
            for (const dir of allDirs) {
                let f = file + dir.file, r = rank + dir.rank;
                while (true) {
                    const target = state.indicesToNotation(f, r);
                    if (!target) break;
                    if (state.hasFriendly(target, piece.color)) break;
                    moves.push(target);
                    if (!state.isEmpty(target)) break;
                    f += dir.file; r += dir.rank;
                }
            }
            break;
        }

        case PIECE_TYPES.KING: {
            for (const offset of KING_OFFSETS) {
                const target = state.indicesToNotation(file + offset.file, rank + offset.rank);
                if (target && !state.hasFriendly(target, piece.color)) {
                    moves.push(target);
                }
            }
            break;
        }
    }

    return moves;
}

/**
 * OPTIMIZED: Calculates squares that COULD be attacked if pieces move optimally
 * Uses piece mobility calculation instead of expensive getAllLegalMoves()
 *
 * Key optimizations:
 * - Uses getReachableSquares() instead of getAllLegalMoves() (avoids check validation)
 * - Minimal state cloning - only modifies necessary squares
 * - Early termination when square already has lower depth
 * - Bounded exploration at each depth level
 *
 * @param {string} threatColor - Color making threats
 * @param {number} maxDepth - Maximum turns to look ahead
 * @param {GameState} state - Current game state
 * @returns {Map<string, number>} Square -> minimum depth to threaten
 */
function calculateReachableThreats(threatColor, maxDepth, state) {
    const threatDepths = new Map();

    // Get current attacks (depth 0) — these are already visible, skip them
    const currentAttacks = getAttackedSquaresSet(threatColor, state);

    // For each piece, calculate squares it could threaten
    const pieces = state.getPiecesByColor(threatColor);

    for (const { notation, piece } of pieces) {
        // Depth 1: Get moves this piece can make
        const depth1Moves = getReachableSquares(notation, piece, state);
        const depth1Limit = Math.min(depth1Moves.length, MAX_MOVES_DEPTH_1);

        for (let i = 0; i < depth1Limit; i++) {
            const moveTo = depth1Moves[i];

            // Calculate attacks from new position without full clone
            // Create a lightweight simulation by temporarily moving the piece
            const capturedPiece = state.getSquare(moveTo);
            state.setSquare(notation, null);
            state.setSquare(moveTo, piece);

            const newAttacks = getPieceAttacks(moveTo, piece, state);

            for (const sq of newAttacks) {
                // Skip squares already attacked at depth 0
                if (currentAttacks.has(sq)) continue;
                // Only set if not already found at lower depth
                if (!threatDepths.has(sq)) {
                    threatDepths.set(sq, 1);
                }
            }

            // Depth 2
            if (maxDepth >= 2) {
                const depth2Moves = getReachableSquares(moveTo, piece, state);
                const depth2Limit = Math.min(depth2Moves.length, MAX_MOVES_DEPTH_2);

                for (let j = 0; j < depth2Limit; j++) {
                    const move2To = depth2Moves[j];

                    // Lightweight simulation for depth 2
                    const captured2 = state.getSquare(move2To);
                    state.setSquare(moveTo, null);
                    state.setSquare(move2To, piece);

                    const attacks2 = getPieceAttacks(move2To, piece, state);
                    for (const sq of attacks2) {
                        if (!currentAttacks.has(sq) && !threatDepths.has(sq)) {
                            threatDepths.set(sq, 2);
                        }
                    }

                    // Depth 3
                    if (maxDepth >= 3) {
                        const depth3Moves = getReachableSquares(move2To, piece, state);
                        const depth3Limit = Math.min(depth3Moves.length, MAX_MOVES_DEPTH_3);

                        for (let k = 0; k < depth3Limit; k++) {
                            const move3To = depth3Moves[k];

                            const captured3 = state.getSquare(move3To);
                            state.setSquare(move2To, null);
                            state.setSquare(move3To, piece);

                            const attacks3 = getPieceAttacks(move3To, piece, state);
                            for (const sq of attacks3) {
                                if (!currentAttacks.has(sq) && !threatDepths.has(sq)) {
                                    threatDepths.set(sq, 3);
                                }
                            }

                            // Restore depth 3 state
                            state.setSquare(move3To, captured3);
                            state.setSquare(move2To, piece);
                        }
                    }

                    // Restore depth 2 state
                    state.setSquare(move2To, captured2);
                    state.setSquare(moveTo, piece);
                }
            }

            // Restore original state
            state.setSquare(moveTo, capturedPiece);
            state.setSquare(notation, piece);
        }
    }

    return threatDepths;
}

/**
 * Clears all threat overlays
 */
function clearThreatOverlays() {
    if (!threatGroup) return;

    while (threatGroup.children.length > 0) {
        const child = threatGroup.children[0];
        threatGroup.remove(child);
        // Dispose cloned materials
        if (child.material) {
            let isBaseMaterial = false;
            for (const depth in depthMaterials) {
                if (child.material === depthMaterials[depth]) {
                    isBaseMaterial = true;
                    break;
                }
            }
            if (!isBaseMaterial) {
                child.material.dispose();
            }
        }
    }
}

/**
 * Creates a threat overlay mesh at the given square
 * @param {string} notation - Square notation
 * @param {number} depth - Threat depth (1-3)
 * @returns {THREE.Mesh}
 */
function createThreatOverlay(notation, depth) {
    // Clone material for this specific depth
    const baseMaterial = depthMaterials[depth] || depthMaterials[1];
    const material = baseMaterial.clone();

    const mesh = new THREE.Mesh(threatGeometry, material);
    const pos = notationToWorldXZ(notation);

    mesh.position.set(pos.x, HIGHLIGHT_HEIGHT, pos.z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.userData = {
        square: notation,
        type: 'threatOverlay',
        depth
    };

    return mesh;
}

/**
 * Internal function that performs the actual visualization update
 */
function performThreatVisualizationUpdate() {
    if (!threatGroup || !isVisible) return;

    clearThreatOverlays();

    const state = getGameState();

    // Check cache validity
    const stateKey = generateStateKey(state);
    const cacheKey = `${stateKey}_${currentDepth}_${showWhiteThreats}_${showBlackThreats}`;

    let whiteThreats, blackThreats;

    if (threatCache && cacheStateKey === cacheKey) {
        // Use cached results
        whiteThreats = threatCache.white;
        blackThreats = threatCache.black;
    } else {
        // Calculate threats from each color up to currentDepth
        // Threats TO white = attacks BY black
        // Threats TO black = attacks BY white
        // Note: We clone state before calculating to avoid mutation issues
        whiteThreats = new Map();
        blackThreats = new Map();

        if (showWhiteThreats) {
            const stateClone = state.clone();
            whiteThreats = calculateReachableThreats(COLORS.BLACK, currentDepth, stateClone);
        }

        if (showBlackThreats) {
            const stateClone = state.clone();
            blackThreats = calculateReachableThreats(COLORS.WHITE, currentDepth, stateClone);
        }

        // Cache results
        threatCache = { white: whiteThreats, black: blackThreats };
        cacheStateKey = cacheKey;
    }

    // Combine threats, keeping minimum depth for each square
    const allThreats = new Map();

    const addThreat = (square, depth) => {
        if (depth > currentDepth) return;
        if (!allThreats.has(square) || allThreats.get(square) > depth) {
            allThreats.set(square, depth);
        }
    };

    whiteThreats.forEach((depth, square) => addThreat(square, depth));
    blackThreats.forEach((depth, square) => addThreat(square, depth));

    // Create overlays for all threatened squares
    for (const [square, depth] of allThreats) {
        if (depth <= currentDepth) {
            const overlay = createThreatOverlay(square, depth);
            threatGroup.add(overlay);
        }
    }

    pendingUpdate = false;
}

/**
 * Updates the threat visualization based on current game state
 * Debounced to prevent frame drops during rapid state changes
 */
function updateThreatVisualization() {
    if (!threatGroup || !isVisible) return;

    // Invalidate cache on state change
    const state = getGameState();
    const stateKey = generateStateKey(state);
    const fullKey = `${stateKey}_${currentDepth}_${showWhiteThreats}_${showBlackThreats}`;

    if (cacheStateKey !== fullKey) {
        threatCache = null;
        cacheStateKey = null;
    }

    // Debounce rapid updates
    if (debounceTimer) {
        pendingUpdate = true;
        return;
    }

    performThreatVisualizationUpdate();

    // Set up debounce for subsequent updates
    debounceTimer = setTimeout(() => {
        debounceTimer = null;
        if (pendingUpdate) {
            performThreatVisualizationUpdate();
        }
    }, DEBOUNCE_MS);
}

/**
 * Toggles the threat visualization on/off
 * @returns {boolean} New visibility state
 */
function toggleThreatVisualization() {
    isVisible = !isVisible;
    if (threatGroup) {
        threatGroup.visible = isVisible;
        if (isVisible) {
            updateThreatVisualization();
        }
    }
    console.log(`[Chess 1v1] Threat preview: ${isVisible ? 'ON' : 'OFF'} (depth: ${currentDepth})`);
    return isVisible;
}

/**
 * Sets visibility directly
 * @param {boolean} visible
 */
function setThreatVisualizationVisible(visible) {
    isVisible = visible;
    if (threatGroup) {
        threatGroup.visible = visible;
        if (visible) {
            updateThreatVisualization();
        }
    }
}

/**
 * Sets the threat preview depth (1-3 turns)
 * @param {number} depth - 1, 2, or 3
 */
function setThreatDepth(depth) {
    const newDepth = Math.max(1, Math.min(MAX_DEPTH, depth));
    if (newDepth !== currentDepth) {
        currentDepth = newDepth;
        console.log(`[Chess 1v1] Threat depth set to: ${currentDepth} turn(s)`);
        if (isVisible) {
            updateThreatVisualization();
        }
    }
}

/**
 * Gets current threat depth setting
 * @returns {number}
 */
function getThreatDepth() {
    return currentDepth;
}

/**
 * Cycles through depth settings (1 -> 2 -> 3 -> 1)
 * @returns {number} New depth
 */
function cycleThreatDepth() {
    const newDepth = (currentDepth % MAX_DEPTH) + 1;
    setThreatDepth(newDepth);
    return currentDepth;
}

/**
 * Toggles which color's threats to show
 * @param {string} filter - 'white', 'black', or 'both'
 */
function setThreatFilter(filter) {
    switch (filter) {
        case 'white':
            // Show threats TO white (from black)
            showWhiteThreats = true;
            showBlackThreats = false;
            break;
        case 'black':
            // Show threats TO black (from white)
            showWhiteThreats = false;
            showBlackThreats = true;
            break;
        case 'both':
        default:
            showWhiteThreats = true;
            showBlackThreats = true;
            break;
    }

    if (isVisible) {
        updateThreatVisualization();
    }
}

/**
 * Gets current visibility state
 * @returns {boolean}
 */
function isThreatVisualizationVisible() {
    return isVisible;
}

/**
 * Gets threat data for a specific square
 * Uses cached results when available for performance
 * @param {string} notation - Square notation
 * @returns {{depth: number, isThreatened: boolean}} Threat info
 */
function getSquareThreatData(notation) {
    const state = getGameState();

    // Try to use cached data first
    const stateKey = generateStateKey(state);
    const fullKey = `${stateKey}_${currentDepth}_true_true`;

    let whiteThreats, blackThreats;

    if (threatCache && cacheStateKey === fullKey) {
        whiteThreats = threatCache.white;
        blackThreats = threatCache.black;
    } else {
        // Calculate fresh (using clones to avoid mutation)
        const stateClone1 = state.clone();
        const stateClone2 = state.clone();
        whiteThreats = calculateReachableThreats(COLORS.BLACK, currentDepth, stateClone1);
        blackThreats = calculateReachableThreats(COLORS.WHITE, currentDepth, stateClone2);
    }

    const whiteDepth = whiteThreats.get(notation);
    const blackDepth = blackThreats.get(notation);

    let minDepth = null;
    if (whiteDepth !== undefined && blackDepth !== undefined) {
        minDepth = Math.min(whiteDepth, blackDepth);
    } else if (whiteDepth !== undefined) {
        minDepth = whiteDepth;
    } else if (blackDepth !== undefined) {
        minDepth = blackDepth;
    }

    return {
        depth: minDepth,
        isThreatened: minDepth !== null && minDepth <= currentDepth
    };
}

/**
 * Clears the threat calculation cache
 * Call this when game state changes significantly
 */
function clearThreatCache() {
    threatCache = null;
    cacheStateKey = null;
}

/**
 * Cleans up the threat preview system
 */
function disposeThreatPreview() {
    // Clear debounce timer
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
    pendingUpdate = false;

    // Clear cache
    clearThreatCache();

    clearThreatOverlays();
    if (threatGroup && threatGroup.parent) {
        threatGroup.parent.remove(threatGroup);
    }
    threatGroup = null;

    // Dispose materials
    for (const depth in depthMaterials) {
        depthMaterials[depth]?.dispose();
    }
}

// --- EXPORTS ---
export {
    initThreatPreview,
    updateThreatVisualization,
    toggleThreatVisualization,
    setThreatVisualizationVisible,
    setThreatDepth,
    getThreatDepth,
    cycleThreatDepth,
    setThreatFilter,
    isThreatVisualizationVisible,
    getSquareThreatData,
    clearThreatOverlays,
    clearThreatCache,
    disposeThreatPreview,
    // Constants for external use
    MAX_DEPTH,
    THREAT_COLORS,
    THREAT_OPACITY,
    DEBOUNCE_MS
};
