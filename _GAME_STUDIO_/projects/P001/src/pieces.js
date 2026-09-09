// === PIECE RENDERING MODULE ===
// Phase 1.3: Piece Rendering
// Pattern: Component - each piece type has distinct geometry
// Depends: Three.js

import * as THREE from 'three';

// --- CONSTANTS ---
// Piece colors
const WHITE_PIECE_COLOR = 0xf5f5f5;  // Off-white
const BLACK_PIECE_COLOR = 0x2c2c2c;  // Dark gray (not pure black for depth)

// Piece scale factor (relative to square size of 1)
const PIECE_SCALE = 0.4;
const PIECE_HEIGHT_BASE = 0.05;  // Sits slightly above board

// --- PIECE GEOMETRIES ---
// Reusable geometries for performance (created once, shared across pieces)

const geometries = {
    // Pawn: Simple cylinder + sphere head
    pawn: createPawnGeometry(),

    // Rook: Cylinder with crenellated top
    rook: createRookGeometry(),

    // Knight: Angled shape suggesting horse head
    knight: createKnightGeometry(),

    // Bishop: Tall cylinder with pointed top
    bishop: createBishopGeometry(),

    // Queen: Tall with crown-like top
    queen: createQueenGeometry(),

    // King: Tallest with cross on top
    king: createKingGeometry()
};

/**
 * Creates pawn geometry: cylinder base + sphere head
 */
function createPawnGeometry() {
    const group = new THREE.Group();

    // Base cylinder
    const base = new THREE.CylinderGeometry(0.3, 0.35, 0.3, 16);
    const baseMesh = new THREE.Mesh(base);
    baseMesh.position.y = 0.15;
    group.add(baseMesh);

    // Body taper
    const body = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 16);
    const bodyMesh = new THREE.Mesh(body);
    bodyMesh.position.y = 0.5;
    group.add(bodyMesh);

    // Head sphere
    const head = new THREE.SphereGeometry(0.2, 16, 12);
    const headMesh = new THREE.Mesh(head);
    headMesh.position.y = 0.85;
    group.add(headMesh);

    return mergeGroupToGeometry(group);
}

/**
 * Creates rook geometry: castle-like with battlements
 */
function createRookGeometry() {
    const group = new THREE.Group();

    // Base
    const base = new THREE.CylinderGeometry(0.35, 0.38, 0.25, 16);
    const baseMesh = new THREE.Mesh(base);
    baseMesh.position.y = 0.125;
    group.add(baseMesh);

    // Tower body
    const body = new THREE.CylinderGeometry(0.28, 0.32, 0.6, 16);
    const bodyMesh = new THREE.Mesh(body);
    bodyMesh.position.y = 0.55;
    group.add(bodyMesh);

    // Top rim
    const rim = new THREE.CylinderGeometry(0.32, 0.28, 0.15, 16);
    const rimMesh = new THREE.Mesh(rim);
    rimMesh.position.y = 0.925;
    group.add(rimMesh);

    // Battlements (4 small boxes on top)
    const battlementGeo = new THREE.BoxGeometry(0.12, 0.15, 0.12);
    const positions = [
        [0.2, 1.075, 0],
        [-0.2, 1.075, 0],
        [0, 1.075, 0.2],
        [0, 1.075, -0.2]
    ];
    positions.forEach(pos => {
        const battlement = new THREE.Mesh(battlementGeo);
        battlement.position.set(...pos);
        group.add(battlement);
    });

    return mergeGroupToGeometry(group);
}

/**
 * Creates knight geometry: L-shaped horse head abstraction
 */
function createKnightGeometry() {
    const group = new THREE.Group();

    // Base
    const base = new THREE.CylinderGeometry(0.32, 0.35, 0.2, 16);
    const baseMesh = new THREE.Mesh(base);
    baseMesh.position.y = 0.1;
    group.add(baseMesh);

    // Neck (angled cylinder)
    const neck = new THREE.CylinderGeometry(0.15, 0.25, 0.6, 16);
    const neckMesh = new THREE.Mesh(neck);
    neckMesh.position.set(0, 0.5, 0.05);
    neckMesh.rotation.x = -0.2;
    group.add(neckMesh);

    // Head (box, angled forward)
    const head = new THREE.BoxGeometry(0.2, 0.35, 0.4);
    const headMesh = new THREE.Mesh(head);
    headMesh.position.set(0, 0.9, 0.15);
    headMesh.rotation.x = -0.3;
    group.add(headMesh);

    // Ears (two small cones)
    const ear = new THREE.ConeGeometry(0.06, 0.15, 8);
    const ear1 = new THREE.Mesh(ear);
    ear1.position.set(-0.08, 1.1, 0.05);
    group.add(ear1);

    const ear2 = new THREE.Mesh(ear);
    ear2.position.set(0.08, 1.1, 0.05);
    group.add(ear2);

    return mergeGroupToGeometry(group);
}

/**
 * Creates bishop geometry: mitre (pointed hat) shape
 */
function createBishopGeometry() {
    const group = new THREE.Group();

    // Base
    const base = new THREE.CylinderGeometry(0.32, 0.36, 0.2, 16);
    const baseMesh = new THREE.Mesh(base);
    baseMesh.position.y = 0.1;
    group.add(baseMesh);

    // Body
    const body = new THREE.CylinderGeometry(0.18, 0.28, 0.7, 16);
    const bodyMesh = new THREE.Mesh(body);
    bodyMesh.position.y = 0.55;
    group.add(bodyMesh);

    // Mitre (pointed top)
    const mitre = new THREE.ConeGeometry(0.18, 0.4, 16);
    const mitreMesh = new THREE.Mesh(mitre);
    mitreMesh.position.y = 1.1;
    group.add(mitreMesh);

    // Small ball on top
    const ball = new THREE.SphereGeometry(0.06, 12, 8);
    const ballMesh = new THREE.Mesh(ball);
    ballMesh.position.y = 1.35;
    group.add(ballMesh);

    return mergeGroupToGeometry(group);
}

/**
 * Creates queen geometry: crown with spikes
 */
function createQueenGeometry() {
    const group = new THREE.Group();

    // Base
    const base = new THREE.CylinderGeometry(0.35, 0.38, 0.2, 16);
    const baseMesh = new THREE.Mesh(base);
    baseMesh.position.y = 0.1;
    group.add(baseMesh);

    // Body (elegant taper)
    const body = new THREE.CylinderGeometry(0.2, 0.32, 0.8, 16);
    const bodyMesh = new THREE.Mesh(body);
    bodyMesh.position.y = 0.6;
    group.add(bodyMesh);

    // Crown base
    const crownBase = new THREE.CylinderGeometry(0.22, 0.2, 0.15, 16);
    const crownBaseMesh = new THREE.Mesh(crownBase);
    crownBaseMesh.position.y = 1.075;
    group.add(crownBaseMesh);

    // Crown spikes (8 small cones around)
    const spikeGeo = new THREE.ConeGeometry(0.04, 0.2, 8);
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const spike = new THREE.Mesh(spikeGeo);
        spike.position.set(
            Math.cos(angle) * 0.18,
            1.25,
            Math.sin(angle) * 0.18
        );
        group.add(spike);
    }

    // Top ball
    const topBall = new THREE.SphereGeometry(0.08, 12, 8);
    const topBallMesh = new THREE.Mesh(topBall);
    topBallMesh.position.y = 1.4;
    group.add(topBallMesh);

    return mergeGroupToGeometry(group);
}

/**
 * Creates king geometry: tallest with cross on top
 */
function createKingGeometry() {
    const group = new THREE.Group();

    // Base
    const base = new THREE.CylinderGeometry(0.36, 0.4, 0.22, 16);
    const baseMesh = new THREE.Mesh(base);
    baseMesh.position.y = 0.11;
    group.add(baseMesh);

    // Body
    const body = new THREE.CylinderGeometry(0.22, 0.33, 0.85, 16);
    const bodyMesh = new THREE.Mesh(body);
    bodyMesh.position.y = 0.65;
    group.add(bodyMesh);

    // Neck
    const neck = new THREE.CylinderGeometry(0.18, 0.22, 0.15, 16);
    const neckMesh = new THREE.Mesh(neck);
    neckMesh.position.y = 1.15;
    group.add(neckMesh);

    // Crown rim
    const rim = new THREE.TorusGeometry(0.18, 0.04, 8, 16);
    const rimMesh = new THREE.Mesh(rim);
    rimMesh.position.y = 1.25;
    rimMesh.rotation.x = Math.PI / 2;
    group.add(rimMesh);

    // Cross vertical
    const crossV = new THREE.BoxGeometry(0.06, 0.3, 0.06);
    const crossVMesh = new THREE.Mesh(crossV);
    crossVMesh.position.y = 1.45;
    group.add(crossVMesh);

    // Cross horizontal
    const crossH = new THREE.BoxGeometry(0.2, 0.06, 0.06);
    const crossHMesh = new THREE.Mesh(crossH);
    crossHMesh.position.y = 1.5;
    group.add(crossHMesh);

    return mergeGroupToGeometry(group);
}

/**
 * Merges a group of meshes into a single BufferGeometry
 * This improves performance by reducing draw calls
 */
function mergeGroupToGeometry(group) {
    const geometries = [];

    group.traverse((child) => {
        if (child.isMesh) {
            const cloned = child.geometry.clone();
            cloned.applyMatrix4(child.matrixWorld);
            group.updateMatrixWorld(true);
            cloned.applyMatrix4(child.matrixWorld);
            geometries.push(cloned);
        }
    });

    // Simple fallback: just return the first geometry if merge fails
    if (geometries.length === 0) {
        return new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
    }

    // For simplicity without BufferGeometryUtils, return group approach
    // Each piece will be a Group rather than merged geometry
    return null;
}

// --- MATERIALS ---
const whiteMaterial = new THREE.MeshStandardMaterial({
    color: WHITE_PIECE_COLOR,
    roughness: 0.3,
    metalness: 0.1
});

const blackMaterial = new THREE.MeshStandardMaterial({
    color: BLACK_PIECE_COLOR,
    roughness: 0.3,
    metalness: 0.1
});

// --- PIECE FACTORY ---

/**
 * Creates a chess piece mesh
 * @param {string} type - 'pawn'|'rook'|'knight'|'bishop'|'queen'|'king'
 * @param {string} color - 'white'|'black'
 * @returns {THREE.Group} The piece as a Three.js Group
 */
function createPiece(type, color) {
    const material = color === 'white' ? whiteMaterial : blackMaterial;
    const piece = new THREE.Group();
    piece.name = `${color}_${type}`;

    // Create geometry based on type
    const meshes = createPieceMeshes(type, material);
    meshes.forEach(mesh => piece.add(mesh));

    // Scale to fit square
    piece.scale.setScalar(PIECE_SCALE);

    // Store metadata
    piece.userData = {
        type: 'piece',
        pieceType: type,
        pieceColor: color
    };

    return piece;
}

/**
 * Creates mesh components for a piece type
 */
function createPieceMeshes(type, material) {
    const meshes = [];

    switch (type) {
        case 'pawn':
            meshes.push(...createPawnMeshes(material));
            break;
        case 'rook':
            meshes.push(...createRookMeshes(material));
            break;
        case 'knight':
            meshes.push(...createKnightMeshes(material));
            break;
        case 'bishop':
            meshes.push(...createBishopMeshes(material));
            break;
        case 'queen':
            meshes.push(...createQueenMeshes(material));
            break;
        case 'king':
            meshes.push(...createKingMeshes(material));
            break;
        default:
            console.warn(`Unknown piece type: ${type}`);
            meshes.push(new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16),
                material
            ));
    }

    return meshes;
}

function createPawnMeshes(material) {
    const meshes = [];

    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 0.3, 16),
        material
    );
    base.position.y = 0.15;
    meshes.push(base);

    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 0.4, 16),
        material
    );
    body.position.y = 0.5;
    meshes.push(body);

    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 12),
        material
    );
    head.position.y = 0.85;
    meshes.push(head);

    return meshes;
}

function createRookMeshes(material) {
    const meshes = [];

    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.38, 0.25, 16),
        material
    );
    base.position.y = 0.125;
    meshes.push(base);

    // Tower body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.32, 0.6, 16),
        material
    );
    body.position.y = 0.55;
    meshes.push(body);

    // Top rim
    const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.28, 0.15, 16),
        material
    );
    rim.position.y = 0.925;
    meshes.push(rim);

    // Battlements
    const battlementGeo = new THREE.BoxGeometry(0.12, 0.15, 0.12);
    [[0.2, 0], [-0.2, 0], [0, 0.2], [0, -0.2]].forEach(([x, z]) => {
        const battlement = new THREE.Mesh(battlementGeo, material);
        battlement.position.set(x, 1.075, z);
        meshes.push(battlement);
    });

    return meshes;
}

function createKnightMeshes(material) {
    const meshes = [];

    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.35, 0.2, 16),
        material
    );
    base.position.y = 0.1;
    meshes.push(base);

    // Neck
    const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.25, 0.6, 16),
        material
    );
    neck.position.set(0, 0.5, 0.05);
    neck.rotation.x = -0.2;
    meshes.push(neck);

    // Head
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.35, 0.4),
        material
    );
    head.position.set(0, 0.9, 0.15);
    head.rotation.x = -0.3;
    meshes.push(head);

    // Ears
    const earGeo = new THREE.ConeGeometry(0.06, 0.15, 8);
    [[-0.08, 0.05], [0.08, 0.05]].forEach(([x, z]) => {
        const ear = new THREE.Mesh(earGeo, material);
        ear.position.set(x, 1.1, z);
        meshes.push(ear);
    });

    return meshes;
}

function createBishopMeshes(material) {
    const meshes = [];

    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.36, 0.2, 16),
        material
    );
    base.position.y = 0.1;
    meshes.push(base);

    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.28, 0.7, 16),
        material
    );
    body.position.y = 0.55;
    meshes.push(body);

    // Mitre
    const mitre = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.4, 16),
        material
    );
    mitre.position.y = 1.1;
    meshes.push(mitre);

    // Ball on top
    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 12, 8),
        material
    );
    ball.position.y = 1.35;
    meshes.push(ball);

    return meshes;
}

function createQueenMeshes(material) {
    const meshes = [];

    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.38, 0.2, 16),
        material
    );
    base.position.y = 0.1;
    meshes.push(base);

    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.32, 0.8, 16),
        material
    );
    body.position.y = 0.6;
    meshes.push(body);

    // Crown base
    const crownBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.2, 0.15, 16),
        material
    );
    crownBase.position.y = 1.075;
    meshes.push(crownBase);

    // Crown spikes
    const spikeGeo = new THREE.ConeGeometry(0.04, 0.2, 8);
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const spike = new THREE.Mesh(spikeGeo, material);
        spike.position.set(
            Math.cos(angle) * 0.18,
            1.25,
            Math.sin(angle) * 0.18
        );
        meshes.push(spike);
    }

    // Top ball
    const topBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 8),
        material
    );
    topBall.position.y = 1.4;
    meshes.push(topBall);

    return meshes;
}

function createKingMeshes(material) {
    const meshes = [];

    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.4, 0.22, 16),
        material
    );
    base.position.y = 0.11;
    meshes.push(base);

    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.33, 0.85, 16),
        material
    );
    body.position.y = 0.65;
    meshes.push(body);

    // Neck
    const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 0.15, 16),
        material
    );
    neck.position.y = 1.15;
    meshes.push(neck);

    // Crown rim
    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.04, 8, 16),
        material
    );
    rim.position.y = 1.25;
    rim.rotation.x = Math.PI / 2;
    meshes.push(rim);

    // Cross vertical
    const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.3, 0.06),
        material
    );
    crossV.position.y = 1.45;
    meshes.push(crossV);

    // Cross horizontal
    const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.06, 0.06),
        material
    );
    crossH.position.y = 1.5;
    meshes.push(crossH);

    return meshes;
}

// --- PIECE PLACEMENT ---

// Pieces group for scene organization
const piecesGroup = new THREE.Group();
piecesGroup.name = 'chessPieces';

// Track pieces by square notation for quick lookup
const piecesBySquare = new Map();

/**
 * Converts chess notation to 3D world position
 * @param {string} notation - e.g., 'e4'
 * @param {number} squareSize - Size of each square
 * @param {number} boardOffset - Offset to center board
 * @returns {{x: number, y: number, z: number}}
 */
function notationToPosition(notation, squareSize = 1, boardOffset = 3.5) {
    const file = notation.charCodeAt(0) - 97;  // a=0, h=7
    const rank = parseInt(notation[1]) - 1;     // 1=0, 8=7

    return {
        x: file * squareSize - boardOffset,
        y: PIECE_HEIGHT_BASE,
        z: (7 - rank) * squareSize - boardOffset
    };
}

/**
 * Places a piece on the board
 * @param {string} type - Piece type
 * @param {string} color - 'white' or 'black'
 * @param {string} notation - Square notation (e.g., 'e1')
 * @param {number} squareSize - Size of board squares
 * @param {number} boardOffset - Board centering offset
 * @returns {THREE.Group} The placed piece
 */
function placePiece(type, color, notation, squareSize = 1, boardOffset = 3.5) {
    // Remove existing piece on this square if any
    if (piecesBySquare.has(notation)) {
        const existing = piecesBySquare.get(notation);
        piecesGroup.remove(existing);
        piecesBySquare.delete(notation);
    }

    // Create and position piece
    const piece = createPiece(type, color);
    const pos = notationToPosition(notation, squareSize, boardOffset);
    piece.position.set(pos.x, pos.y, pos.z);

    // Store square reference
    piece.userData.square = notation;
    piecesBySquare.set(notation, piece);

    // Add to group
    piecesGroup.add(piece);

    return piece;
}

/**
 * Removes a piece from a square
 * @param {string} notation - Square notation
 */
function removePiece(notation) {
    if (piecesBySquare.has(notation)) {
        const piece = piecesBySquare.get(notation);
        piecesGroup.remove(piece);
        piecesBySquare.delete(notation);
    }
}

/**
 * Gets the piece at a given square
 * @param {string} notation - Square notation
 * @returns {THREE.Group|null}
 */
function getPieceAt(notation) {
    return piecesBySquare.get(notation) || null;
}

/**
 * Sets up all 32 pieces in starting positions
 */
function setupStartingPosition() {
    // Clear any existing pieces
    piecesBySquare.forEach((piece, notation) => {
        piecesGroup.remove(piece);
    });
    piecesBySquare.clear();

    // White pieces - rank 1
    placePiece('rook', 'white', 'a1');
    placePiece('knight', 'white', 'b1');
    placePiece('bishop', 'white', 'c1');
    placePiece('queen', 'white', 'd1');
    placePiece('king', 'white', 'e1');
    placePiece('bishop', 'white', 'f1');
    placePiece('knight', 'white', 'g1');
    placePiece('rook', 'white', 'h1');

    // White pawns - rank 2
    for (let i = 0; i < 8; i++) {
        const file = String.fromCharCode(97 + i);
        placePiece('pawn', 'white', `${file}2`);
    }

    // Black pieces - rank 8
    placePiece('rook', 'black', 'a8');
    placePiece('knight', 'black', 'b8');
    placePiece('bishop', 'black', 'c8');
    placePiece('queen', 'black', 'd8');
    placePiece('king', 'black', 'e8');
    placePiece('bishop', 'black', 'f8');
    placePiece('knight', 'black', 'g8');
    placePiece('rook', 'black', 'h8');

    // Black pawns - rank 7
    for (let i = 0; i < 8; i++) {
        const file = String.fromCharCode(97 + i);
        placePiece('pawn', 'black', `${file}7`);
    }

    console.log('[Chess 1v1] All 32 pieces placed in starting position');
}

// --- EXPORTS ---
export {
    piecesGroup,
    createPiece,
    placePiece,
    removePiece,
    getPieceAt,
    setupStartingPosition,
    notationToPosition,
    piecesBySquare,
    PIECE_SCALE
};
