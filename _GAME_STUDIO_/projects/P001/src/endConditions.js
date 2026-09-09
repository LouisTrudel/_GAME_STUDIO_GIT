// === END CONDITIONS MODULE ===
// Phase 5.1: End Conditions
// Phase 5.2: Draw Detection
// Pattern: Data-driven — pure functions operating on game state
// Depends: gameState.js, moveGeneration.js

import { getGameState, COLORS, PIECE_TYPES } from './gameState.js';
import { getAllLegalMoves, isInCheck } from './moveGeneration.js';

// --- GAME RESULT TYPES ---
export const GAME_RESULT = {
    ONGOING: 'ongoing',
    CHECKMATE: 'checkmate',
    STALEMATE: 'stalemate',
    DRAW_INSUFFICIENT_MATERIAL: 'draw_insufficient_material',
    DRAW_THREEFOLD: 'draw_threefold',
    DRAW_FIFTY_MOVE: 'draw_fifty_move'
};

// --- POSITION HISTORY FOR THREEFOLD REPETITION ---
// Tracks FEN-like position strings (board + castling + en passant + turn)
const positionHistory = [];

/**
 * Generates a position key for threefold repetition detection
 * Includes: piece positions, active color, castling rights, en passant
 * Does NOT include: move clocks (irrelevant for position identity)
 * @param {GameState} state - Game state
 * @returns {string} Position key
 */
function getPositionKey(state) {
    let key = '';

    // Board position (piece placements)
    for (let rank = 8; rank >= 1; rank--) {
        let emptyCount = 0;
        for (let file = 0; file < 8; file++) {
            const notation = String.fromCharCode(97 + file) + rank;
            const piece = state.getSquare(notation);

            if (piece) {
                if (emptyCount > 0) {
                    key += emptyCount;
                    emptyCount = 0;
                }
                // Uppercase for white, lowercase for black
                const pieceChar = piece.type.toUpperCase();
                key += piece.color === COLORS.WHITE ? pieceChar : pieceChar.toLowerCase();
            } else {
                emptyCount++;
            }
        }
        if (emptyCount > 0) key += emptyCount;
        if (rank > 1) key += '/';
    }

    // Active color
    key += ' ' + (state.currentTurn === COLORS.WHITE ? 'w' : 'b');

    // Castling rights
    let castling = '';
    const whiteKing = state.getSquare('e1');
    const blackKing = state.getSquare('e8');

    if (whiteKing && whiteKing.type === PIECE_TYPES.KING && !whiteKing.hasMoved) {
        const hRook = state.getSquare('h1');
        const aRook = state.getSquare('a1');
        if (hRook && hRook.type === PIECE_TYPES.ROOK && !hRook.hasMoved) castling += 'K';
        if (aRook && aRook.type === PIECE_TYPES.ROOK && !aRook.hasMoved) castling += 'Q';
    }
    if (blackKing && blackKing.type === PIECE_TYPES.KING && !blackKing.hasMoved) {
        const hRook = state.getSquare('h8');
        const aRook = state.getSquare('a8');
        if (hRook && hRook.type === PIECE_TYPES.ROOK && !hRook.hasMoved) castling += 'k';
        if (aRook && aRook.type === PIECE_TYPES.ROOK && !aRook.hasMoved) castling += 'q';
    }
    key += ' ' + (castling || '-');

    // En passant target square
    key += ' ' + (state.enPassantTarget || '-');

    return key;
}

/**
 * Records current position in history
 * Call after each move to track positions for threefold repetition
 * @param {GameState} [state] - Optional game state
 */
function recordPosition(state = null) {
    state = state || getGameState();
    positionHistory.push(getPositionKey(state));
}

/**
 * Clears position history (call on game reset)
 */
function clearPositionHistory() {
    positionHistory.length = 0;
}

/**
 * Gets position history (for debugging)
 * @returns {string[]} Array of position keys
 */
function getPositionHistory() {
    return [...positionHistory];
}

// --- DRAW DETECTION FUNCTIONS (Phase 5.2) ---

/**
 * Checks for insufficient material to deliver checkmate
 * Draw conditions:
 * - K vs K
 * - K+B vs K
 * - K+N vs K
 * - K+B vs K+B (same color bishops)
 * @param {GameState} [state] - Optional game state
 * @returns {boolean} True if insufficient material for checkmate
 */
function isInsufficientMaterial(state = null) {
    state = state || getGameState();

    const whitePieces = state.getPiecesByColor(COLORS.WHITE);
    const blackPieces = state.getPiecesByColor(COLORS.BLACK);

    // Count pieces by type (excluding kings)
    const count = (pieces, type) => pieces.filter(p => p.piece.type === type).length;

    const whiteBishops = count(whitePieces, PIECE_TYPES.BISHOP);
    const whiteKnights = count(whitePieces, PIECE_TYPES.KNIGHT);
    const whiteQueens = count(whitePieces, PIECE_TYPES.QUEEN);
    const whiteRooks = count(whitePieces, PIECE_TYPES.ROOK);
    const whitePawns = count(whitePieces, PIECE_TYPES.PAWN);

    const blackBishops = count(blackPieces, PIECE_TYPES.BISHOP);
    const blackKnights = count(blackPieces, PIECE_TYPES.KNIGHT);
    const blackQueens = count(blackPieces, PIECE_TYPES.QUEEN);
    const blackRooks = count(blackPieces, PIECE_TYPES.ROOK);
    const blackPawns = count(blackPieces, PIECE_TYPES.PAWN);

    // Any pawns, rooks, or queens = sufficient material
    if (whitePawns + blackPawns > 0) return false;
    if (whiteRooks + blackRooks > 0) return false;
    if (whiteQueens + blackQueens > 0) return false;

    const whitePieceCount = whiteBishops + whiteKnights;
    const blackPieceCount = blackBishops + blackKnights;

    // K vs K
    if (whitePieceCount === 0 && blackPieceCount === 0) {
        return true;
    }

    // K+minor vs K (one side has exactly one minor piece)
    if ((whitePieceCount === 1 && blackPieceCount === 0) ||
        (whitePieceCount === 0 && blackPieceCount === 1)) {
        return true;
    }

    // K+B vs K+B (bishops on same color squares)
    if (whiteBishops === 1 && blackBishops === 1 &&
        whiteKnights === 0 && blackKnights === 0) {
        // Check if bishops are on same color squares
        const whiteBishopSquare = whitePieces.find(p => p.piece.type === PIECE_TYPES.BISHOP).notation;
        const blackBishopSquare = blackPieces.find(p => p.piece.type === PIECE_TYPES.BISHOP).notation;

        const isLightSquare = (square) => {
            const file = square.charCodeAt(0) - 97;  // a=0, h=7
            const rank = parseInt(square[1]) - 1;    // 1=0, 8=7
            return (file + rank) % 2 === 1;  // Light squares have odd sum
        };

        if (isLightSquare(whiteBishopSquare) === isLightSquare(blackBishopSquare)) {
            return true;
        }
    }

    return false;
}

/**
 * Checks for threefold repetition
 * Draw if the same position has occurred 3 times
 * (position = piece placement + turn + castling rights + en passant)
 * @param {GameState} [state] - Optional game state
 * @returns {boolean} True if threefold repetition detected
 */
function isThreefoldRepetition(state = null) {
    state = state || getGameState();
    const currentKey = getPositionKey(state);

    // Count occurrences of current position in history
    let count = 0;
    for (const key of positionHistory) {
        if (key === currentKey) {
            count++;
            if (count >= 2) {  // Current position + 2 in history = 3 total
                return true;
            }
        }
    }

    return false;
}

/**
 * Checks for 50-move rule
 * Draw if 50 moves (100 half-moves) have been made without pawn move or capture
 * @param {GameState} [state] - Optional game state
 * @returns {boolean} True if 50-move rule applies
 */
function isFiftyMoveRule(state = null) {
    state = state || getGameState();
    return state.halfMoveClock >= 100;  // 100 half-moves = 50 full moves
}

// --- CORE DETECTION FUNCTIONS ---

/**
 * Checks if a color has no legal moves
 * Used to detect both checkmate and stalemate
 * @param {string} color - 'white' or 'black'
 * @param {GameState} [state] - Optional game state (uses global if not provided)
 * @returns {boolean} True if the color has no legal moves
 */
function hasNoLegalMoves(color, state = null) {
    state = state || getGameState();
    const legalMoves = getAllLegalMoves(color, state);
    return legalMoves.length === 0;
}

/**
 * Checks if the given color is in checkmate
 * Checkmate = in check AND has no legal moves
 * @param {string} color - 'white' or 'black'
 * @param {GameState} [state] - Optional game state
 * @returns {boolean} True if the color is in checkmate
 */
function isCheckmate(color, state = null) {
    state = state || getGameState();

    // Must be in check AND have no legal moves
    if (!isInCheck(color, state)) {
        return false;
    }

    return hasNoLegalMoves(color, state);
}

/**
 * Checks if the given color is in stalemate
 * Stalemate = NOT in check AND has no legal moves
 * @param {string} color - 'white' or 'black'
 * @param {GameState} [state] - Optional game state
 * @returns {boolean} True if the color is in stalemate
 */
function isStalemate(color, state = null) {
    state = state || getGameState();

    // Must NOT be in check AND have no legal moves
    if (isInCheck(color, state)) {
        return false;
    }

    return hasNoLegalMoves(color, state);
}

/**
 * Gets the current game result after a move
 * Call this after switchTurn() to check if the game has ended
 * Checks in order: checkmate, stalemate, draws (insufficient material, 50-move, threefold)
 * @param {GameState} [state] - Optional game state
 * @returns {{result: string, winner?: string, loser?: string, message: string}}
 */
function getGameResult(state = null) {
    state = state || getGameState();
    const currentTurn = state.currentTurn;
    const opponent = currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

    // Check for checkmate (highest priority - decisive result)
    if (isCheckmate(currentTurn, state)) {
        const winnerName = opponent === COLORS.WHITE ? 'White' : 'Black';
        return {
            result: GAME_RESULT.CHECKMATE,
            winner: opponent,
            loser: currentTurn,
            message: `Checkmate. ${winnerName} wins!`
        };
    }

    // Check for stalemate
    if (isStalemate(currentTurn, state)) {
        return {
            result: GAME_RESULT.STALEMATE,
            winner: null,
            loser: null,
            message: 'Stalemate. Draw!'
        };
    }

    // Phase 5.2: Check for draw conditions

    // Insufficient material (immediate draw - no legal sequence of moves can lead to checkmate)
    if (isInsufficientMaterial(state)) {
        return {
            result: GAME_RESULT.DRAW_INSUFFICIENT_MATERIAL,
            winner: null,
            loser: null,
            message: 'Draw: Insufficient material'
        };
    }

    // 50-move rule (100 half-moves without pawn move or capture)
    if (isFiftyMoveRule(state)) {
        return {
            result: GAME_RESULT.DRAW_FIFTY_MOVE,
            winner: null,
            loser: null,
            message: 'Draw: 50-move rule'
        };
    }

    // Threefold repetition (same position occurred 3 times)
    if (isThreefoldRepetition(state)) {
        return {
            result: GAME_RESULT.DRAW_THREEFOLD,
            winner: null,
            loser: null,
            message: 'Draw: Threefold repetition'
        };
    }

    // Game continues
    const turnName = currentTurn === COLORS.WHITE ? 'White' : 'Black';
    const inCheck = isInCheck(currentTurn, state);
    return {
        result: GAME_RESULT.ONGOING,
        winner: null,
        loser: null,
        message: inCheck ? `${turnName} is in check!` : `${turnName} to move`
    };
}

/**
 * Checks if the game has ended
 * @param {GameState} [state] - Optional game state
 * @returns {boolean} True if the game has ended (checkmate or stalemate)
 */
function isGameOver(state = null) {
    const result = getGameResult(state);
    return result.result !== GAME_RESULT.ONGOING;
}

// --- EXPORTS ---
export {
    // Core detection (Phase 5.1)
    hasNoLegalMoves,
    isCheckmate,
    isStalemate,
    getGameResult,
    isGameOver,
    // Draw detection (Phase 5.2)
    isInsufficientMaterial,
    isThreefoldRepetition,
    isFiftyMoveRule,
    // Position tracking (Phase 5.2)
    recordPosition,
    clearPositionHistory,
    getPositionHistory,
    getPositionKey
};
