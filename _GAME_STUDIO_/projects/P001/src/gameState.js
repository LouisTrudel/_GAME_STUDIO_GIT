// === CHESS GAME STATE MODULE ===
// Phase 2.1: Data Model
// Pattern: Data-driven — board state is pure data, separate from rendering
// Depends: None (pure data, no Three.js)

// --- CONSTANTS ---

// Piece types (single char for compact board representation)
export const PIECE_TYPES = {
    KING: 'k',
    QUEEN: 'q',
    ROOK: 'r',
    BISHOP: 'b',
    KNIGHT: 'n',
    PAWN: 'p'
};

// Colors
export const COLORS = {
    WHITE: 'white',
    BLACK: 'black'
};

// --- PIECE DATA FORMAT ---

/**
 * Piece object structure:
 * {
 *   type: 'k'|'q'|'r'|'b'|'n'|'p',
 *   color: 'white'|'black',
 *   hasMoved: boolean  // For castling/pawn double move
 * }
 */

/**
 * Creates a piece data object
 * @param {string} type - One of PIECE_TYPES values
 * @param {string} color - 'white' or 'black'
 * @returns {Object} Piece data object
 */
export function createPieceData(type, color) {
    return {
        type,
        color,
        hasMoved: false
    };
}

// --- BOARD STATE STRUCTURE ---

/**
 * Board state is a Map<string, Piece|null>
 * Keys are square notations: 'a1' through 'h8'
 * Values are piece objects or null for empty squares
 *
 * Additional game state:
 * - currentTurn: 'white'|'black'
 * - moveHistory: Array of moves
 * - enPassantTarget: string|null (square notation where en passant is possible)
 * - halfMoveClock: number (for 50-move rule)
 * - fullMoveNumber: number
 */

class GameState {
    constructor() {
        // Board: Map of square notation -> piece data or null
        this.board = new Map();

        // Initialize all 64 squares
        for (let rank = 1; rank <= 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const notation = String.fromCharCode(97 + file) + rank;
                this.board.set(notation, null);
            }
        }

        // Game state
        this.currentTurn = COLORS.WHITE;
        this.moveHistory = [];
        this.enPassantTarget = null;  // Square where en passant capture is legal
        this.halfMoveClock = 0;       // Moves since last pawn move or capture
        this.fullMoveNumber = 1;      // Increments after Black's move

        // King positions for quick check detection
        this.kingPositions = {
            [COLORS.WHITE]: 'e1',
            [COLORS.BLACK]: 'e8'
        };
    }

    /**
     * Gets the piece at a given square
     * @param {string} notation - Square notation (e.g., 'e1')
     * @returns {Object|null} Piece data or null if empty
     */
    getSquare(notation) {
        if (!this.isValidSquare(notation)) {
            return null;
        }
        return this.board.get(notation);
    }

    /**
     * Sets a piece on a square
     * @param {string} notation - Square notation
     * @param {Object|null} piece - Piece data or null to clear
     */
    setSquare(notation, piece) {
        if (!this.isValidSquare(notation)) {
            console.warn(`Invalid square notation: ${notation}`);
            return;
        }
        this.board.set(notation, piece);

        // Track king positions
        if (piece && piece.type === PIECE_TYPES.KING) {
            this.kingPositions[piece.color] = notation;
        }
    }

    /**
     * Validates square notation
     * @param {string} notation - e.g., 'e4'
     * @returns {boolean}
     */
    isValidSquare(notation) {
        if (!notation || notation.length !== 2) return false;
        const file = notation.charCodeAt(0);
        const rank = parseInt(notation[1]);
        return file >= 97 && file <= 104 && rank >= 1 && rank <= 8;
    }

    /**
     * Converts notation to file/rank indices
     * @param {string} notation - e.g., 'e4'
     * @returns {{file: number, rank: number}} file 0-7, rank 0-7
     */
    notationToIndices(notation) {
        return {
            file: notation.charCodeAt(0) - 97,  // a=0, h=7
            rank: parseInt(notation[1]) - 1      // 1=0, 8=7
        };
    }

    /**
     * Converts file/rank indices to notation
     * @param {number} file - 0-7
     * @param {number} rank - 0-7
     * @returns {string} Square notation
     */
    indicesToNotation(file, rank) {
        if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
        return String.fromCharCode(97 + file) + (rank + 1);
    }

    /**
     * Gets all pieces of a given color
     * @param {string} color - 'white' or 'black'
     * @returns {Array<{notation: string, piece: Object}>}
     */
    getPiecesByColor(color) {
        const pieces = [];
        this.board.forEach((piece, notation) => {
            if (piece && piece.color === color) {
                pieces.push({ notation, piece });
            }
        });
        return pieces;
    }

    /**
     * Gets the current king position
     * @param {string} color - 'white' or 'black'
     * @returns {string} Square notation of the king
     */
    getKingPosition(color) {
        return this.kingPositions[color];
    }

    /**
     * Checks if a square is empty
     * @param {string} notation - Square notation
     * @returns {boolean}
     */
    isEmpty(notation) {
        return this.getSquare(notation) === null;
    }

    /**
     * Checks if a square has an enemy piece
     * @param {string} notation - Square notation
     * @param {string} friendlyColor - Color of friendly pieces
     * @returns {boolean}
     */
    hasEnemy(notation, friendlyColor) {
        const piece = this.getSquare(notation);
        return piece !== null && piece.color !== friendlyColor;
    }

    /**
     * Checks if a square has a friendly piece
     * @param {string} notation - Square notation
     * @param {string} color - Friendly color
     * @returns {boolean}
     */
    hasFriendly(notation, color) {
        const piece = this.getSquare(notation);
        return piece !== null && piece.color === color;
    }

    /**
     * Clones the current game state (for move simulation)
     * @returns {GameState}
     */
    clone() {
        const copy = new GameState();

        // Copy board
        this.board.forEach((piece, notation) => {
            if (piece) {
                copy.board.set(notation, { ...piece });
            } else {
                copy.board.set(notation, null);
            }
        });

        // Copy game state
        copy.currentTurn = this.currentTurn;
        copy.moveHistory = [...this.moveHistory];
        copy.enPassantTarget = this.enPassantTarget;
        copy.halfMoveClock = this.halfMoveClock;
        copy.fullMoveNumber = this.fullMoveNumber;
        copy.kingPositions = { ...this.kingPositions };

        return copy;
    }

    /**
     * Resets to starting position
     */
    reset() {
        // Clear board
        this.board.forEach((_, notation) => {
            this.board.set(notation, null);
        });

        // Reset game state
        this.currentTurn = COLORS.WHITE;
        this.moveHistory = [];
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;

        // Setup starting position
        this.setupStartingPosition();
    }

    /**
     * Sets up the standard chess starting position
     */
    setupStartingPosition() {
        const { KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN } = PIECE_TYPES;

        // White back rank
        this.setSquare('a1', createPieceData(ROOK, COLORS.WHITE));
        this.setSquare('b1', createPieceData(KNIGHT, COLORS.WHITE));
        this.setSquare('c1', createPieceData(BISHOP, COLORS.WHITE));
        this.setSquare('d1', createPieceData(QUEEN, COLORS.WHITE));
        this.setSquare('e1', createPieceData(KING, COLORS.WHITE));
        this.setSquare('f1', createPieceData(BISHOP, COLORS.WHITE));
        this.setSquare('g1', createPieceData(KNIGHT, COLORS.WHITE));
        this.setSquare('h1', createPieceData(ROOK, COLORS.WHITE));

        // White pawns
        for (let i = 0; i < 8; i++) {
            const file = String.fromCharCode(97 + i);
            this.setSquare(`${file}2`, createPieceData(PAWN, COLORS.WHITE));
        }

        // Black back rank
        this.setSquare('a8', createPieceData(ROOK, COLORS.BLACK));
        this.setSquare('b8', createPieceData(KNIGHT, COLORS.BLACK));
        this.setSquare('c8', createPieceData(BISHOP, COLORS.BLACK));
        this.setSquare('d8', createPieceData(QUEEN, COLORS.BLACK));
        this.setSquare('e8', createPieceData(KING, COLORS.BLACK));
        this.setSquare('f8', createPieceData(BISHOP, COLORS.BLACK));
        this.setSquare('g8', createPieceData(KNIGHT, COLORS.BLACK));
        this.setSquare('h8', createPieceData(ROOK, COLORS.BLACK));

        // Black pawns
        for (let i = 0; i < 8; i++) {
            const file = String.fromCharCode(97 + i);
            this.setSquare(`${file}7`, createPieceData(PAWN, COLORS.BLACK));
        }

        // Set king positions
        this.kingPositions[COLORS.WHITE] = 'e1';
        this.kingPositions[COLORS.BLACK] = 'e8';
    }

    /**
     * Returns a string representation of the board (for debugging)
     * @returns {string}
     */
    toString() {
        const pieceChars = {
            [PIECE_TYPES.KING]: 'K',
            [PIECE_TYPES.QUEEN]: 'Q',
            [PIECE_TYPES.ROOK]: 'R',
            [PIECE_TYPES.BISHOP]: 'B',
            [PIECE_TYPES.KNIGHT]: 'N',
            [PIECE_TYPES.PAWN]: 'P'
        };

        let str = '\n  a b c d e f g h\n';
        for (let rank = 8; rank >= 1; rank--) {
            str += `${rank} `;
            for (let file = 0; file < 8; file++) {
                const notation = String.fromCharCode(97 + file) + rank;
                const piece = this.getSquare(notation);
                if (piece) {
                    let char = pieceChars[piece.type];
                    if (piece.color === COLORS.BLACK) {
                        char = char.toLowerCase();
                    }
                    str += char + ' ';
                } else {
                    str += '. ';
                }
            }
            str += `${rank}\n`;
        }
        str += '  a b c d e f g h\n';
        str += `\nTurn: ${this.currentTurn}, Move: ${this.fullMoveNumber}`;
        return str;
    }
}

// --- SINGLETON INSTANCE ---

// Global game state instance
const gameState = new GameState();

// Initialize with starting position
gameState.setupStartingPosition();

// --- CONVENIENCE EXPORTS ---

/**
 * Gets piece at square (convenience function)
 * @param {string} notation - e.g., 'e1'
 * @returns {Object|null} Piece data with type, color, hasMoved
 */
export function getSquare(notation) {
    return gameState.getSquare(notation);
}

/**
 * Gets the full game state instance
 * @returns {GameState}
 */
export function getGameState() {
    return gameState;
}

/**
 * Resets the game to starting position
 */
export function resetGame() {
    gameState.reset();
}

/**
 * Gets human-readable piece name
 * @param {Object} piece - Piece data
 * @returns {string} e.g., "white king"
 */
export function getPieceName(piece) {
    if (!piece) return 'empty';

    const typeNames = {
        [PIECE_TYPES.KING]: 'king',
        [PIECE_TYPES.QUEEN]: 'queen',
        [PIECE_TYPES.ROOK]: 'rook',
        [PIECE_TYPES.BISHOP]: 'bishop',
        [PIECE_TYPES.KNIGHT]: 'knight',
        [PIECE_TYPES.PAWN]: 'pawn'
    };

    return `${piece.color} ${typeNames[piece.type]}`;
}

// --- EXPORTS ---
export { gameState, GameState };
