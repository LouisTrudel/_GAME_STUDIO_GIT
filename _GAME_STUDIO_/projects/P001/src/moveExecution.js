// === MOVE EXECUTION MODULE ===
// Phase 3.3: Move Execution
// Phase 4.3: Pawn Promotion
// Phase 5.1: End Conditions
// Pattern: Command — each move is a complete state transition
// Depends: gameState.js, pieces.js, turnIndicator.js, promotion.js, endConditions.js

import { getGameState, PIECE_TYPES, COLORS } from './gameState.js';
import { placePiece, removePiece, getPieceAt, notationToPosition, piecesBySquare } from './pieces.js';
import { switchTurn } from './turnIndicator.js';
import { isCastlingMove, isInCheck } from './moveGeneration.js';
import { isPromotionMove, showPromotionModal, replaceWithPromotedPiece, initPromotion } from './promotion.js';
import { getGameResult, isGameOver, GAME_RESULT, recordPosition } from './endConditions.js';

// Initialize promotion system on module load
initPromotion();

// --- CONSTANTS ---
const MOVE_ANIMATION_DURATION = 150;  // ms for smooth piece movement

/**
 * Executes a chess move: updates game state, scene, and switches turn
 * Handles pawn promotion by showing modal and waiting for user choice
 * @param {string} from - Source square notation (e.g., 'e2')
 * @param {string} to - Destination square notation (e.g., 'e4')
 * @returns {Promise<{success: boolean, captured?: Object, type: string}>}
 */
async function executeMove(from, to) {
    const state = getGameState();
    const piece = state.getSquare(from);

    if (!piece) {
        console.warn(`[Chess 1v1] No piece at ${from}`);
        return { success: false, type: 'invalid' };
    }

    // Determine move type
    const targetPiece = state.getSquare(to);
    const isCapture = targetPiece !== null;
    const isEnPassant = piece.type === PIECE_TYPES.PAWN && to === state.enPassantTarget;
    const isPawnDoubleMove = piece.type === PIECE_TYPES.PAWN &&
        Math.abs(parseInt(to[1]) - parseInt(from[1])) === 2;
    const isCastling = isCastlingMove(from, to, state);
    const isPromotion = isPromotionMove(from, to, piece);

    // --- UPDATE GAME STATE ---

    // Handle en passant capture (remove pawn from adjacent square, not destination)
    let capturedPiece = targetPiece;
    if (isEnPassant) {
        const { file, rank } = state.notationToIndices(to);
        const capturedPawnRank = piece.color === COLORS.WHITE ? rank - 1 : rank + 1;
        const capturedPawnSquare = state.indicesToNotation(file, capturedPawnRank);
        capturedPiece = state.getSquare(capturedPawnSquare);
        state.setSquare(capturedPawnSquare, null);

        // Remove captured pawn from scene
        removePiece(capturedPawnSquare);
        console.log(`[Chess 1v1] En passant capture on ${capturedPawnSquare}`);
    }

    // Handle castling: move the rook as well
    let rookFrom = null;
    let rookTo = null;
    if (isCastling) {
        const rank = from[1];  // '1' for white, '8' for black
        const toFile = to[0];  // 'g' for kingside, 'c' for queenside

        if (toFile === 'g') {
            // Kingside castling: rook h -> f
            rookFrom = `h${rank}`;
            rookTo = `f${rank}`;
        } else {
            // Queenside castling: rook a -> d
            rookFrom = `a${rank}`;
            rookTo = `d${rank}`;
        }

        // Move rook in game state
        const rook = state.getSquare(rookFrom);
        const movedRook = { ...rook, hasMoved: true };
        state.setSquare(rookFrom, null);
        state.setSquare(rookTo, movedRook);

        console.log(`[Chess 1v1] Castling: rook ${rookFrom} -> ${rookTo}`);
    }

    // Update en passant target for next move
    if (isPawnDoubleMove) {
        // En passant target is the square the pawn passed through
        const { file, rank } = state.notationToIndices(from);
        const passedRank = piece.color === COLORS.WHITE ? rank + 1 : rank - 1;
        state.enPassantTarget = state.indicesToNotation(file, passedRank);
    } else {
        state.enPassantTarget = null;
    }

    // Move piece in game state (may be updated if promotion)
    let movedPiece = { ...piece, hasMoved: true };
    state.setSquare(from, null);
    state.setSquare(to, movedPiece);

    // Update half-move clock (reset on pawn move or capture)
    if (piece.type === PIECE_TYPES.PAWN || isCapture || isEnPassant) {
        state.halfMoveClock = 0;
    } else {
        state.halfMoveClock++;
    }

    // Update full move number (after black moves)
    if (piece.color === COLORS.BLACK) {
        state.fullMoveNumber++;
    }

    // --- UPDATE 3D SCENE ---

    // Remove captured piece from scene (if normal capture)
    if (isCapture && !isEnPassant) {
        removePiece(to);
    }

    // Move piece in scene: remove from old position, place at new position
    const pieceMesh = getPieceAt(from);
    if (pieceMesh) {
        // Animate piece movement
        animatePieceMove(pieceMesh, from, to);
    } else {
        // Fallback: recreate piece at new position
        const pieceTypeName = getPieceTypeName(piece.type);
        placePiece(pieceTypeName, piece.color, to);
        console.warn(`[Chess 1v1] Piece mesh not found at ${from}, recreated at ${to}`);
    }

    // Move rook in scene for castling
    if (isCastling && rookFrom && rookTo) {
        const rookMesh = getPieceAt(rookFrom);
        if (rookMesh) {
            animatePieceMove(rookMesh, rookFrom, rookTo);
        } else {
            // Fallback: recreate rook at new position
            placePiece('rook', piece.color, rookTo);
            console.warn(`[Chess 1v1] Rook mesh not found at ${rookFrom}, recreated at ${rookTo}`);
        }
    }

    // --- HANDLE PAWN PROMOTION ---
    let promotedTo = null;
    if (isPromotion) {
        console.log(`[Chess 1v1] Pawn promotion triggered at ${to}`);

        // Show promotion modal and wait for user choice
        const choice = await showPromotionModal(to, piece.color);
        promotedTo = choice;

        // Update game state with promoted piece
        const promotedPiece = { type: choice.type, color: piece.color, hasMoved: true };
        state.setSquare(to, promotedPiece);

        // Replace pawn mesh with promoted piece mesh
        replaceWithPromotedPiece(to, choice.name, piece.color);

        console.log(`[Chess 1v1] Promoted to ${choice.name}`);
    }

    // Record move in history
    state.moveHistory.push({
        from,
        to,
        piece: piece.type,
        color: piece.color,
        captured: capturedPiece?.type || null,
        isEnPassant,
        isCastling,
        rookFrom,
        rookTo,
        isPromotion,
        promotedTo: promotedTo?.type || null
    });

    // --- SWITCH TURN ---
    switchTurn();

    // --- RECORD POSITION FOR THREEFOLD REPETITION (Phase 5.2) ---
    recordPosition(state);

    // --- CHECK FOR END CONDITIONS (Phase 5.1 + 5.2) ---
    const gameResult = getGameResult(state);
    const opponentColor = state.currentTurn;
    const inCheck = isInCheck(opponentColor, state);

    // Build move notation with check/checkmate indicators
    let moveNotation;
    if (isCastling) {
        moveNotation = to[0] === 'g' ? 'O-O' : 'O-O-O';
    } else if (isPromotion) {
        moveNotation = formatMoveNotation(from, to, piece, isCapture) + '=' + getPromotionSymbol(promotedTo.type);
    } else {
        moveNotation = formatMoveNotation(from, to, piece, isCapture || isEnPassant);
    }

    // Add check/checkmate symbol to notation
    if (gameResult.result === GAME_RESULT.CHECKMATE) {
        moveNotation += '#';
    } else if (inCheck) {
        moveNotation += '+';
    }

    console.log(`[Chess 1v1] Move executed: ${moveNotation}`);

    // Log game result if game has ended
    if (gameResult.result !== GAME_RESULT.ONGOING) {
        console.log(`[Chess 1v1] GAME OVER: ${gameResult.message}`);
    } else if (inCheck) {
        const turnName = opponentColor === COLORS.WHITE ? 'White' : 'Black';
        console.log(`[Chess 1v1] ${turnName} is in check!`);
    }

    return {
        success: true,
        type: isPromotion ? 'promotion' : (isCastling ? 'castling' : (isEnPassant ? 'enPassant' : (isCapture ? 'capture' : 'move'))),
        captured: capturedPiece || null,
        notation: moveNotation,
        promotedTo: promotedTo?.type || null,
        // Phase 5.1: Game result info
        gameResult: gameResult.result,
        winner: gameResult.winner,
        message: gameResult.message,
        inCheck
    };
}

/**
 * Gets algebraic notation symbol for promoted piece
 * @param {string} type - PIECE_TYPES value
 * @returns {string} - Single character (Q, R, B, N)
 */
function getPromotionSymbol(type) {
    const symbols = {
        [PIECE_TYPES.QUEEN]: 'Q',
        [PIECE_TYPES.ROOK]: 'R',
        [PIECE_TYPES.BISHOP]: 'B',
        [PIECE_TYPES.KNIGHT]: 'N'
    };
    return symbols[type] || 'Q';
}

/**
 * Animates a piece moving from one square to another
 * @param {THREE.Group} pieceMesh - The piece mesh to move
 * @param {string} from - Source square
 * @param {string} to - Destination square
 */
function animatePieceMove(pieceMesh, from, to) {
    // Update square tracking immediately (using imported piecesBySquare)
    piecesBySquare.delete(from);
    piecesBySquare.set(to, pieceMesh);
    pieceMesh.userData.square = to;

    // Get target position
    const targetPos = notationToPosition(to);

    // Store start position
    const startX = pieceMesh.position.x;
    const startZ = pieceMesh.position.z;
    const startTime = performance.now();

    // Animate using requestAnimationFrame
    function animate() {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / MOVE_ANIMATION_DURATION, 1);

        // Ease-out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - t, 3);

        pieceMesh.position.x = startX + (targetPos.x - startX) * eased;
        pieceMesh.position.z = startZ + (targetPos.z - startZ) * eased;

        // Slight arc (lift piece slightly during move)
        const arcHeight = 0.15;
        const arc = Math.sin(t * Math.PI) * arcHeight;
        pieceMesh.position.y = targetPos.y + arc;

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            // Ensure final position is exact
            pieceMesh.position.set(targetPos.x, targetPos.y, targetPos.z);
        }
    }

    animate();
}

/**
 * Converts piece type constant to piece name string
 * @param {string} type - PIECE_TYPES value
 * @returns {string} - 'pawn', 'rook', etc.
 */
function getPieceTypeName(type) {
    const names = {
        [PIECE_TYPES.KING]: 'king',
        [PIECE_TYPES.QUEEN]: 'queen',
        [PIECE_TYPES.ROOK]: 'rook',
        [PIECE_TYPES.BISHOP]: 'bishop',
        [PIECE_TYPES.KNIGHT]: 'knight',
        [PIECE_TYPES.PAWN]: 'pawn'
    };
    return names[type] || 'pawn';
}

/**
 * Formats a move in algebraic notation (simplified)
 * @param {string} from - Source square
 * @param {string} to - Destination square
 * @param {Object} piece - Piece data
 * @param {boolean} isCapture - Whether move is a capture
 * @returns {string} Move notation (e.g., 'Nf3', 'exd5')
 */
function formatMoveNotation(from, to, piece, isCapture) {
    const pieceSymbols = {
        [PIECE_TYPES.KING]: 'K',
        [PIECE_TYPES.QUEEN]: 'Q',
        [PIECE_TYPES.ROOK]: 'R',
        [PIECE_TYPES.BISHOP]: 'B',
        [PIECE_TYPES.KNIGHT]: 'N',
        [PIECE_TYPES.PAWN]: ''
    };

    const symbol = pieceSymbols[piece.type];
    const captureSymbol = isCapture ? 'x' : '';

    // For pawns, include file on captures
    if (piece.type === PIECE_TYPES.PAWN && isCapture) {
        return `${from[0]}x${to}`;
    }

    return `${symbol}${captureSymbol}${to}`;
}

/**
 * Gets the last move from history
 * @returns {Object|null} Last move or null if no moves
 */
function getLastMove() {
    const state = getGameState();
    if (state.moveHistory.length === 0) return null;
    return state.moveHistory[state.moveHistory.length - 1];
}

/**
 * Gets full move history
 * @returns {Array} Array of move objects
 */
function getMoveHistory() {
    return getGameState().moveHistory;
}

// --- EXPORTS ---
export {
    executeMove,
    getLastMove,
    getMoveHistory,
    formatMoveNotation,
    getPieceTypeName,
    // Phase 5.1: Re-export end conditions for convenience
    getGameResult,
    isGameOver,
    GAME_RESULT
};
