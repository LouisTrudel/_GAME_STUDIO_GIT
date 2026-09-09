// === MOVE GENERATION MODULE ===
// Phase 2.2: Move Generation
// Pattern: Data-driven — pure functions operating on game state
// Depends: gameState.js

import { getGameState, PIECE_TYPES, COLORS } from './gameState.js';

// --- DIRECTION VECTORS ---
// Used for sliding pieces (rook, bishop, queen)

const ROOK_DIRECTIONS = [
    { file: 0, rank: 1 },   // up
    { file: 0, rank: -1 },  // down
    { file: 1, rank: 0 },   // right
    { file: -1, rank: 0 }   // left
];

const BISHOP_DIRECTIONS = [
    { file: 1, rank: 1 },   // up-right
    { file: 1, rank: -1 },  // down-right
    { file: -1, rank: 1 },  // up-left
    { file: -1, rank: -1 }  // down-left
];

const QUEEN_DIRECTIONS = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];

const KNIGHT_OFFSETS = [
    { file: 1, rank: 2 },
    { file: 2, rank: 1 },
    { file: 2, rank: -1 },
    { file: 1, rank: -2 },
    { file: -1, rank: -2 },
    { file: -2, rank: -1 },
    { file: -2, rank: 1 },
    { file: -1, rank: 2 }
];

const KING_OFFSETS = [
    { file: 0, rank: 1 },
    { file: 1, rank: 1 },
    { file: 1, rank: 0 },
    { file: 1, rank: -1 },
    { file: 0, rank: -1 },
    { file: -1, rank: -1 },
    { file: -1, rank: 0 },
    { file: -1, rank: 1 }
];

// --- MOVE GENERATION PER PIECE TYPE ---

/**
 * Generates pseudo-legal moves for a pawn
 * Pseudo-legal = ignores check (check filtering done in Phase 2.3)
 * @param {string} fromSquare - Square notation (e.g., 'e2')
 * @param {Object} piece - Piece data
 * @param {GameState} state - Game state
 * @returns {string[]} Array of destination square notations
 */
function getPawnMoves(fromSquare, piece, state) {
    const moves = [];
    const { file, rank } = state.notationToIndices(fromSquare);
    const direction = piece.color === COLORS.WHITE ? 1 : -1;
    const startRank = piece.color === COLORS.WHITE ? 1 : 6;  // 0-indexed: rank 2 or 7

    // Single push forward
    const oneAhead = state.indicesToNotation(file, rank + direction);
    if (oneAhead && state.isEmpty(oneAhead)) {
        moves.push(oneAhead);

        // Double push from starting position
        if (rank === startRank) {
            const twoAhead = state.indicesToNotation(file, rank + 2 * direction);
            if (twoAhead && state.isEmpty(twoAhead)) {
                moves.push(twoAhead);
            }
        }
    }

    // Diagonal captures (including en passant target)
    const captureOffsets = [
        { file: -1, rank: direction },
        { file: 1, rank: direction }
    ];

    for (const offset of captureOffsets) {
        const targetSquare = state.indicesToNotation(file + offset.file, rank + offset.rank);
        if (!targetSquare) continue;

        // Normal capture
        if (state.hasEnemy(targetSquare, piece.color)) {
            moves.push(targetSquare);
        }
        // En passant capture
        else if (targetSquare === state.enPassantTarget) {
            moves.push(targetSquare);
        }
    }

    return moves;
}

/**
 * Generates pseudo-legal moves for a knight
 */
function getKnightMoves(fromSquare, piece, state) {
    const moves = [];
    const { file, rank } = state.notationToIndices(fromSquare);

    for (const offset of KNIGHT_OFFSETS) {
        const targetSquare = state.indicesToNotation(file + offset.file, rank + offset.rank);
        if (!targetSquare) continue;

        // Can move to empty square or capture enemy
        if (!state.hasFriendly(targetSquare, piece.color)) {
            moves.push(targetSquare);
        }
    }

    return moves;
}

/**
 * Generates pseudo-legal moves for a bishop
 */
function getBishopMoves(fromSquare, piece, state) {
    return getSlidingMoves(fromSquare, piece, state, BISHOP_DIRECTIONS);
}

/**
 * Generates pseudo-legal moves for a rook
 */
function getRookMoves(fromSquare, piece, state) {
    return getSlidingMoves(fromSquare, piece, state, ROOK_DIRECTIONS);
}

/**
 * Generates pseudo-legal moves for a queen
 */
function getQueenMoves(fromSquare, piece, state) {
    return getSlidingMoves(fromSquare, piece, state, QUEEN_DIRECTIONS);
}

/**
 * Generates pseudo-legal moves for a king (including castling)
 * Phase 4.1: Castling implementation
 */
function getKingMoves(fromSquare, piece, state) {
    const moves = [];
    const { file, rank } = state.notationToIndices(fromSquare);

    // Standard king moves (one square in any direction)
    for (const offset of KING_OFFSETS) {
        const targetSquare = state.indicesToNotation(file + offset.file, rank + offset.rank);
        if (!targetSquare) continue;

        // Can move to empty square or capture enemy
        if (!state.hasFriendly(targetSquare, piece.color)) {
            moves.push(targetSquare);
        }
    }

    // Castling moves — king moves 2 squares towards rook
    // Castling notation: king to g1/g8 (kingside) or c1/c8 (queenside)
    const castlingMoves = getCastlingMoves(fromSquare, piece, state);
    moves.push(...castlingMoves);

    return moves;
}

/**
 * Gets available castling moves for the king
 * @param {string} fromSquare - King's current square
 * @param {Object} piece - King piece data
 * @param {GameState} state - Current game state
 * @returns {string[]} Array of castling destination squares (g1/g8 or c1/c8)
 */
function getCastlingMoves(fromSquare, piece, state) {
    const moves = [];

    // King must not have moved
    if (piece.hasMoved) return moves;

    // King must be on starting square (e1 for white, e8 for black)
    const expectedSquare = piece.color === COLORS.WHITE ? 'e1' : 'e8';
    if (fromSquare !== expectedSquare) return moves;

    const rank = piece.color === COLORS.WHITE ? '1' : '8';
    const enemyColor = piece.color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

    // King must not be in check
    if (isSquareAttacked(fromSquare, enemyColor, state)) return moves;

    // Check kingside castling (O-O): king to g, rook from h to f
    if (canCastleKingside(piece.color, rank, state, enemyColor)) {
        moves.push(`g${rank}`);
    }

    // Check queenside castling (O-O-O): king to c, rook from a to d
    if (canCastleQueenside(piece.color, rank, state, enemyColor)) {
        moves.push(`c${rank}`);
    }

    return moves;
}

/**
 * Checks if kingside castling is legal
 * Conditions: rook on h-file hasn't moved, f and g squares empty and not attacked
 */
function canCastleKingside(color, rank, state, enemyColor) {
    const rookSquare = `h${rank}`;
    const rook = state.getSquare(rookSquare);

    // Rook must exist, be same color, and not have moved
    if (!rook || rook.type !== PIECE_TYPES.ROOK || rook.color !== color || rook.hasMoved) {
        return false;
    }

    // f and g squares must be empty
    const fSquare = `f${rank}`;
    const gSquare = `g${rank}`;
    if (!state.isEmpty(fSquare) || !state.isEmpty(gSquare)) {
        return false;
    }

    // King cannot pass through or end on attacked square (f and g)
    if (isSquareAttacked(fSquare, enemyColor, state) || isSquareAttacked(gSquare, enemyColor, state)) {
        return false;
    }

    return true;
}

/**
 * Checks if queenside castling is legal
 * Conditions: rook on a-file hasn't moved, b/c/d squares empty, c/d not attacked
 */
function canCastleQueenside(color, rank, state, enemyColor) {
    const rookSquare = `a${rank}`;
    const rook = state.getSquare(rookSquare);

    // Rook must exist, be same color, and not have moved
    if (!rook || rook.type !== PIECE_TYPES.ROOK || rook.color !== color || rook.hasMoved) {
        return false;
    }

    // b, c, and d squares must be empty
    const bSquare = `b${rank}`;
    const cSquare = `c${rank}`;
    const dSquare = `d${rank}`;
    if (!state.isEmpty(bSquare) || !state.isEmpty(cSquare) || !state.isEmpty(dSquare)) {
        return false;
    }

    // King cannot pass through or end on attacked square (c and d)
    // Note: b-square doesn't need to be unattacked, only unoccupied
    if (isSquareAttacked(cSquare, enemyColor, state) || isSquareAttacked(dSquare, enemyColor, state)) {
        return false;
    }

    return true;
}

/**
 * Checks if a move is a castling move
 * @param {string} from - Source square
 * @param {string} to - Destination square
 * @param {GameState} state - Game state
 * @returns {boolean}
 */
function isCastlingMove(from, to, state) {
    const piece = state.getSquare(from);
    if (!piece || piece.type !== PIECE_TYPES.KING) return false;

    // King must move exactly 2 squares horizontally
    const fromFile = from.charCodeAt(0);
    const toFile = to.charCodeAt(0);
    const fileDiff = Math.abs(toFile - fromFile);

    return fileDiff === 2 && from[1] === to[1];
}

/**
 * Generates moves for sliding pieces (bishop, rook, queen)
 * Slides in each direction until blocked or edge of board
 * @param {string} fromSquare - Starting square
 * @param {Object} piece - Piece data
 * @param {GameState} state - Game state
 * @param {Array} directions - Direction vectors to slide
 * @returns {string[]} Array of destination squares
 */
function getSlidingMoves(fromSquare, piece, state, directions) {
    const moves = [];
    const { file, rank } = state.notationToIndices(fromSquare);

    for (const dir of directions) {
        let currentFile = file + dir.file;
        let currentRank = rank + dir.rank;

        // Slide until blocked or off board
        while (true) {
            const targetSquare = state.indicesToNotation(currentFile, currentRank);

            // Off board
            if (!targetSquare) break;

            // Empty square - can move here and continue
            if (state.isEmpty(targetSquare)) {
                moves.push(targetSquare);
                currentFile += dir.file;
                currentRank += dir.rank;
                continue;
            }

            // Friendly piece - blocked, stop
            if (state.hasFriendly(targetSquare, piece.color)) {
                break;
            }

            // Enemy piece - can capture, but then stop
            if (state.hasEnemy(targetSquare, piece.color)) {
                moves.push(targetSquare);
                break;
            }
        }
    }

    return moves;
}

// --- CHECK DETECTION (Phase 2.3) ---

/**
 * Checks if a square is attacked by any piece of the given color
 * Used for check detection and king move validation
 * @param {string} square - Target square notation
 * @param {string} byColor - Attacking color ('white' or 'black')
 * @param {GameState} state - Game state to check
 * @returns {boolean} True if square is attacked
 */
function isSquareAttacked(square, byColor, state) {
    const { file, rank } = state.notationToIndices(square);

    // Check pawn attacks (diagonal)
    // Pawns attack in opposite direction based on color
    const pawnDirection = byColor === COLORS.WHITE ? 1 : -1;
    const pawnAttacks = [
        state.indicesToNotation(file - 1, rank - pawnDirection),
        state.indicesToNotation(file + 1, rank - pawnDirection)
    ];
    for (const attackSquare of pawnAttacks) {
        if (!attackSquare) continue;
        const piece = state.getSquare(attackSquare);
        if (piece && piece.color === byColor && piece.type === PIECE_TYPES.PAWN) {
            return true;
        }
    }

    // Check knight attacks
    for (const offset of KNIGHT_OFFSETS) {
        const attackSquare = state.indicesToNotation(file + offset.file, rank + offset.rank);
        if (!attackSquare) continue;
        const piece = state.getSquare(attackSquare);
        if (piece && piece.color === byColor && piece.type === PIECE_TYPES.KNIGHT) {
            return true;
        }
    }

    // Check king attacks (for preventing kings from being adjacent)
    for (const offset of KING_OFFSETS) {
        const attackSquare = state.indicesToNotation(file + offset.file, rank + offset.rank);
        if (!attackSquare) continue;
        const piece = state.getSquare(attackSquare);
        if (piece && piece.color === byColor && piece.type === PIECE_TYPES.KING) {
            return true;
        }
    }

    // Check sliding attacks: rook/queen (straight lines)
    for (const dir of ROOK_DIRECTIONS) {
        let currentFile = file + dir.file;
        let currentRank = rank + dir.rank;

        while (true) {
            const attackSquare = state.indicesToNotation(currentFile, currentRank);
            if (!attackSquare) break;

            const piece = state.getSquare(attackSquare);
            if (piece) {
                if (piece.color === byColor &&
                    (piece.type === PIECE_TYPES.ROOK || piece.type === PIECE_TYPES.QUEEN)) {
                    return true;
                }
                break; // Blocked by any piece
            }

            currentFile += dir.file;
            currentRank += dir.rank;
        }
    }

    // Check sliding attacks: bishop/queen (diagonals)
    for (const dir of BISHOP_DIRECTIONS) {
        let currentFile = file + dir.file;
        let currentRank = rank + dir.rank;

        while (true) {
            const attackSquare = state.indicesToNotation(currentFile, currentRank);
            if (!attackSquare) break;

            const piece = state.getSquare(attackSquare);
            if (piece) {
                if (piece.color === byColor &&
                    (piece.type === PIECE_TYPES.BISHOP || piece.type === PIECE_TYPES.QUEEN)) {
                    return true;
                }
                break; // Blocked by any piece
            }

            currentFile += dir.file;
            currentRank += dir.rank;
        }
    }

    return false;
}

/**
 * Checks if the king of the given color is in check
 * @param {string} color - Color to check ('white' or 'black')
 * @param {GameState} state - Game state to check
 * @returns {boolean} True if king is in check
 */
function isInCheck(color, state) {
    const kingSquare = state.getKingPosition(color);
    const enemyColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    return isSquareAttacked(kingSquare, enemyColor, state);
}

/**
 * Simulates a move and checks if it leaves the king in check
 * @param {string} from - Source square
 * @param {string} to - Destination square
 * @param {GameState} state - Current game state
 * @returns {boolean} True if move leaves own king in check (illegal)
 */
function moveLeavesKingInCheck(from, to, state) {
    const piece = state.getSquare(from);
    if (!piece) return true;

    // Clone state to simulate move
    const simState = state.clone();

    // Handle en passant capture (remove captured pawn)
    if (piece.type === PIECE_TYPES.PAWN && to === state.enPassantTarget) {
        const { file, rank } = simState.notationToIndices(to);
        const capturedPawnRank = piece.color === COLORS.WHITE ? rank - 1 : rank + 1;
        const capturedPawnSquare = simState.indicesToNotation(file, capturedPawnRank);
        simState.setSquare(capturedPawnSquare, null);
    }

    // Execute the move
    const movedPiece = { ...piece, hasMoved: true };
    simState.setSquare(from, null);
    simState.setSquare(to, movedPiece);

    // Check if own king is in check after the move
    return isInCheck(piece.color, simState);
}

// --- MAIN API ---

/**
 * Gets all pseudo-legal moves for a piece at the given square
 * Pseudo-legal means the move is valid per piece rules but may leave king in check
 *
 * @param {string} notation - Square notation (e.g., 'e2')
 * @param {GameState} [state] - Optional game state (uses global if not provided)
 * @returns {string[]} Array of destination square notations
 */
function getPseudoLegalMoves(notation, state = null) {
    state = state || getGameState();

    const piece = state.getSquare(notation);
    if (!piece) {
        return [];
    }

    switch (piece.type) {
        case PIECE_TYPES.PAWN:
            return getPawnMoves(notation, piece, state);
        case PIECE_TYPES.KNIGHT:
            return getKnightMoves(notation, piece, state);
        case PIECE_TYPES.BISHOP:
            return getBishopMoves(notation, piece, state);
        case PIECE_TYPES.ROOK:
            return getRookMoves(notation, piece, state);
        case PIECE_TYPES.QUEEN:
            return getQueenMoves(notation, piece, state);
        case PIECE_TYPES.KING:
            return getKingMoves(notation, piece, state);
        default:
            console.warn(`Unknown piece type: ${piece.type}`);
            return [];
    }
}

/**
 * Gets legal moves for a piece at the given square
 * Filters out moves that leave the king in check
 *
 * @param {string} notation - Square notation (e.g., 'e2')
 * @param {GameState} [state] - Optional game state (uses global if not provided)
 * @returns {string[]} Array of legal destination square notations
 */
function getLegalMoves(notation, state = null) {
    state = state || getGameState();

    const piece = state.getSquare(notation);
    if (!piece) {
        return [];
    }

    // Only allow moves for the current turn's pieces
    if (piece.color !== state.currentTurn) {
        return [];
    }

    // Get pseudo-legal moves
    const pseudoLegalMoves = getPseudoLegalMoves(notation, state);

    // Filter out moves that leave king in check
    const legalMoves = pseudoLegalMoves.filter(to => {
        // For king moves, also check destination isn't attacked
        if (piece.type === PIECE_TYPES.KING) {
            const enemyColor = piece.color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
            // Simulate king move first, then check if attacked
            // (can't just check current attacks - need to account for revealed attacks)
            return !moveLeavesKingInCheck(notation, to, state);
        }
        return !moveLeavesKingInCheck(notation, to, state);
    });

    return legalMoves;
}

/**
 * Gets all legal moves for a given color (with check filtering)
 * @param {string} color - 'white' or 'black'
 * @param {GameState} [state] - Optional game state
 * @returns {Array<{from: string, to: string}>} Array of move objects
 */
function getAllLegalMoves(color, state = null) {
    state = state || getGameState();
    const allMoves = [];

    const pieces = state.getPiecesByColor(color);
    for (const { notation } of pieces) {
        // Get pseudo-legal moves for this piece
        const pseudoMoves = getPseudoLegalMoves(notation, state);

        // Filter out moves that leave king in check
        for (const to of pseudoMoves) {
            if (!moveLeavesKingInCheck(notation, to, state)) {
                allMoves.push({ from: notation, to });
            }
        }
    }

    return allMoves;
}

/**
 * Checks if a specific move is legal
 * @param {string} from - Source square notation
 * @param {string} to - Destination square notation
 * @param {GameState} [state] - Optional game state
 * @returns {boolean}
 */
function isLegalMove(from, to, state = null) {
    const moves = getLegalMoves(from, state);
    return moves.includes(to);
}

// --- EXPORTS ---
export {
    getLegalMoves,
    getPseudoLegalMoves,
    getAllLegalMoves,
    isLegalMove,
    // Phase 2.3: Check detection
    isSquareAttacked,
    isInCheck,
    moveLeavesKingInCheck,
    // Phase 4.1: Castling
    isCastlingMove,
    getCastlingMoves,
    // Export for testing/debugging
    getPawnMoves,
    getKnightMoves,
    getBishopMoves,
    getRookMoves,
    getQueenMoves,
    getKingMoves,
    getSlidingMoves,
    // Direction constants for potential reuse
    ROOK_DIRECTIONS,
    BISHOP_DIRECTIONS,
    QUEEN_DIRECTIONS,
    KNIGHT_OFFSETS,
    KING_OFFSETS
};
