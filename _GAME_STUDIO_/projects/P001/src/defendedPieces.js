// === DEFENDED PIECES VISUALIZATION MODULE ===
// Phase 6.2: Defended Pieces - Calculate defended pieces, render pulse/glow indicator
// Pattern: Observer — defense state triggers visual updates
// Depends: Three.js, gameState.js, attackedSquares.js, pieces.js

import * as THREE from 'three';
import { getGameState, COLORS, PIECE_TYPES } from './gameState.js';
import { getPieceAttacks } from './attackedSquares.js';
import { piecesBySquare } from './pieces.js';

// --- CONSTANTS ---
const WHITE_DEFEND_COLOR = new THREE.Color(0x4aff4a);  // Green glow for white defended
const BLACK_DEFEND_COLOR = new THREE.Color(0xff4a4a);  // Red glow for black defended
const PULSE_SPEED = 2.5;                               // Pulse frequency (Hz)
const PULSE_MIN_INTENSITY = 0.2;                       // Minimum glow intensity
const PULSE_MAX_INTENSITY = 0.8;                       // Maximum glow intensity
const GLOW_RING_HEIGHT = 0.08;                         // Height of glow ring above board
const GLOW_RING_INNER_RADIUS = 0.25;                   // Inner radius of ring
const GLOW_RING_OUTER_RADIUS = 0.42;                   // Outer radius of ring

// --- STATE ---
let defendedGroup = null;                  // Group containing defended piece indicators
let isVisible = false;                     // Toggle state
let showWhiteDefended = true;              // Show white's defended pieces
let showBlackDefended = true;              // Show black's defended pieces
let animationTime = 0;                     // Time for pulse animation
let glowMeshes = new Map();                // Map of square -> glow mesh for animation

// Reusable geometry for glow rings (created lazily, disposed on cleanup)
let glowRingGeometry = null;

// Materials (created with emissive for glow effect)
let whiteMaterial = null;
let blackMaterial = null;

/**
 * Gets or creates the shared glow ring geometry
 * @returns {THREE.RingGeometry}
 */
function getGlowRingGeometry() {
    if (!glowRingGeometry) {
        glowRingGeometry = new THREE.RingGeometry(GLOW_RING_INNER_RADIUS, GLOW_RING_OUTER_RADIUS, 32);
    }
    return glowRingGeometry;
}

/**
 * Initializes the defended pieces visualization system
 * @param {THREE.Scene} scene - Scene to add overlays to
 */
function initDefendedPieces(scene) {
    // Create emissive materials for glow effect
    whiteMaterial = new THREE.MeshBasicMaterial({
        color: WHITE_DEFEND_COLOR,
        transparent: true,
        opacity: PULSE_MAX_INTENSITY,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    blackMaterial = new THREE.MeshBasicMaterial({
        color: BLACK_DEFEND_COLOR,
        transparent: true,
        opacity: PULSE_MAX_INTENSITY,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    // Create defended pieces group
    defendedGroup = new THREE.Group();
    defendedGroup.name = 'defendedPieces';
    defendedGroup.visible = isVisible;
    scene.add(defendedGroup);

    console.log('[Chess 1v1] Defended pieces visualization initialized');
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
 * Calculates which pieces are defended (protected by friendly pieces)
 * A piece is defended if a friendly piece attacks the square it occupies
 * @param {string} color - 'white' or 'black'
 * @param {GameState} state - Game state
 * @returns {Map<string, number>} Square notation -> number of defenders
 */
function getDefendedPieces(color, state) {
    const defenderCounts = new Map();
    const pieces = state.getPiecesByColor(color);

    // For each piece of this color
    for (const { notation: defenderSquare, piece: defender } of pieces) {
        // Get all squares this piece attacks
        const attacks = getPieceAttacks(defenderSquare, defender, state);

        // Check if any attacked square contains a friendly piece
        for (const attackedSquare of attacks) {
            const targetPiece = state.getSquare(attackedSquare);
            // If there's a friendly piece on the attacked square, it's defended
            if (targetPiece && targetPiece.color === color) {
                defenderCounts.set(
                    attackedSquare,
                    (defenderCounts.get(attackedSquare) || 0) + 1
                );
            }
        }
    }

    return defenderCounts;
}

/**
 * Clears all defended piece indicators
 */
function clearDefendedIndicators() {
    if (!defendedGroup) return;

    while (defendedGroup.children.length > 0) {
        const child = defendedGroup.children[0];
        defendedGroup.remove(child);
        // Dispose cloned materials
        if (child.material && child.material !== whiteMaterial && child.material !== blackMaterial) {
            child.material.dispose();
        }
    }
    glowMeshes.clear();
}

/**
 * Creates a glow ring indicator for a defended piece
 * @param {string} notation - Square notation
 * @param {string} color - 'white' or 'black'
 * @param {number} defenderCount - Number of pieces defending this piece
 * @returns {THREE.Mesh}
 */
function createGlowRing(notation, color, defenderCount) {
    // Clone material with adjusted base intensity based on defender count
    const baseMaterial = color === COLORS.WHITE ? whiteMaterial : blackMaterial;
    const material = baseMaterial.clone();

    // More defenders = brighter base glow
    const baseIntensity = Math.min(PULSE_MIN_INTENSITY + (defenderCount - 1) * 0.15, PULSE_MAX_INTENSITY);
    material.opacity = baseIntensity;

    const mesh = new THREE.Mesh(getGlowRingGeometry(), material);
    const pos = notationToWorldXZ(notation);

    mesh.position.set(pos.x, GLOW_RING_HEIGHT, pos.z);
    mesh.rotation.x = -Math.PI / 2;

    mesh.userData = {
        square: notation,
        type: 'defendedIndicator',
        pieceColor: color,
        defenderCount,
        baseIntensity
    };

    return mesh;
}

/**
 * Updates the defended pieces visualization based on current game state
 */
function updateDefendedVisualization() {
    if (!defendedGroup || !isVisible) return;

    clearDefendedIndicators();

    const state = getGameState();
    const whiteDefended = showWhiteDefended ? getDefendedPieces(COLORS.WHITE, state) : new Map();
    const blackDefended = showBlackDefended ? getDefendedPieces(COLORS.BLACK, state) : new Map();

    // Create glow rings for white defended pieces
    if (showWhiteDefended) {
        for (const [square, defenderCount] of whiteDefended) {
            const ring = createGlowRing(square, COLORS.WHITE, defenderCount);
            defendedGroup.add(ring);
            glowMeshes.set(square, ring);
        }
    }

    // Create glow rings for black defended pieces
    if (showBlackDefended) {
        for (const [square, defenderCount] of blackDefended) {
            const ring = createGlowRing(square, COLORS.BLACK, defenderCount);
            defendedGroup.add(ring);
            glowMeshes.set(square, ring);
        }
    }
}

/**
 * Updates pulse animation for all glow rings
 * Call this from the main animation loop
 * @param {number} delta - Time delta in seconds
 */
function updatePulseAnimation(delta) {
    if (!isVisible || glowMeshes.size === 0) return;

    animationTime += delta;

    // Calculate pulse factor (sine wave oscillation)
    const pulseFactor = (Math.sin(animationTime * PULSE_SPEED * Math.PI * 2) + 1) / 2;

    glowMeshes.forEach((mesh) => {
        const { baseIntensity } = mesh.userData;
        // Oscillate between base intensity and max intensity
        const intensity = baseIntensity + (PULSE_MAX_INTENSITY - baseIntensity) * pulseFactor;
        mesh.material.opacity = intensity;

        // Also scale slightly for visual effect
        const scale = 1 + pulseFactor * 0.1;
        mesh.scale.setScalar(scale);
    });
}

/**
 * Toggles the defended pieces visualization on/off
 * @returns {boolean} New visibility state
 */
function toggleDefendedVisualization() {
    isVisible = !isVisible;
    if (defendedGroup) {
        defendedGroup.visible = isVisible;
        if (isVisible) {
            updateDefendedVisualization();
        }
    }
    console.log(`[Chess 1v1] Defended pieces visualization: ${isVisible ? 'ON' : 'OFF'}`);
    return isVisible;
}

/**
 * Sets visibility directly
 * @param {boolean} visible
 */
function setDefendedVisualizationVisible(visible) {
    isVisible = visible;
    if (defendedGroup) {
        defendedGroup.visible = visible;
        if (visible) {
            updateDefendedVisualization();
        }
    }
}

/**
 * Toggles which color's defended pieces to show
 * @param {string} color - 'white', 'black', or 'both'
 */
function setDefendedFilter(color) {
    switch (color) {
        case 'white':
            showWhiteDefended = true;
            showBlackDefended = false;
            break;
        case 'black':
            showWhiteDefended = false;
            showBlackDefended = true;
            break;
        case 'both':
        default:
            showWhiteDefended = true;
            showBlackDefended = true;
            break;
    }

    if (isVisible) {
        updateDefendedVisualization();
    }
}

/**
 * Gets current visibility state
 * @returns {boolean}
 */
function isDefendedVisualizationVisible() {
    return isVisible;
}

/**
 * Gets defense data for a specific piece/square
 * @param {string} notation - Square notation
 * @returns {{defenders: number, isDefended: boolean}}
 */
function getSquareDefenseData(notation) {
    const state = getGameState();
    const piece = state.getSquare(notation);

    if (!piece) {
        return { defenders: 0, isDefended: false };
    }

    const defendedPieces = getDefendedPieces(piece.color, state);
    const defenders = defendedPieces.get(notation) || 0;

    return {
        defenders,
        isDefended: defenders > 0
    };
}

/**
 * Cleans up the defended pieces visualization system
 */
function disposeDefendedPieces() {
    clearDefendedIndicators();
    if (defendedGroup && defendedGroup.parent) {
        defendedGroup.parent.remove(defendedGroup);
    }
    defendedGroup = null;

    // Dispose materials
    whiteMaterial?.dispose();
    blackMaterial?.dispose();
    whiteMaterial = null;
    blackMaterial = null;

    // Dispose geometry and allow recreation
    if (glowRingGeometry) {
        glowRingGeometry.dispose();
        glowRingGeometry = null;
    }

    // Reset animation time
    animationTime = 0;
}

// --- EXPORTS ---
export {
    initDefendedPieces,
    updateDefendedVisualization,
    updatePulseAnimation,
    toggleDefendedVisualization,
    setDefendedVisualizationVisible,
    setDefendedFilter,
    isDefendedVisualizationVisible,
    getSquareDefenseData,
    getDefendedPieces,
    clearDefendedIndicators,
    disposeDefendedPieces
};
