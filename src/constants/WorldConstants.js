export const WORLD_HEIGHT = 256;
export const CHUNK_WORLD_HEIGHT = 10;
export const CHUNK_SIZE = 16;

// NOISE VALUES
export const AMPLITUDE = 33;
export const DEFAULT_FREQUENCY = 1 / 255;
export const OCTAVES = [4, 2, 8];
export const EXPONENT = 0.25;
export const LEVELS = 12;

// TERRAIN VALUES
export const BASE_HEIGHT = 0;
export const OCEAN_HEIGHT = 50;
export const BEACH_HEIGHT = 52;

export const TREE_Y_CUTOFF = BEACH_HEIGHT + 3;
export const TREE_MIN_HEIGHT = 4;
export const TREE_MAX_HEIGHT = 6;
export const TREE_HEIGHT_DIFF = TREE_MAX_HEIGHT - TREE_MIN_HEIGHT;

export const SAND_HEIGHT_DIFF = BEACH_HEIGHT - OCEAN_HEIGHT;
export const DIRT_HEIGHT_DIFF = 4;
export const DIRT_HEIGHT_VARIATION = 2;

export const VOXEL_FACES = [
    {
        //left
        uvRow: 0,
        dir: [-1, 0, 0],
        vertices: [
            { pos: [0, 1, 0], uv: [0, 1] },
            { pos: [0, 0, 0], uv: [0, 0] },
            { pos: [0, 1, 1], uv: [1, 1] },
            { pos: [0, 0, 1], uv: [1, 0] },
        ],
    },
    {
        //right
        uvRow: 0,
        dir: [1, 0, 0],
        vertices: [
            { pos: [1, 1, 1], uv: [0, 1] },
            { pos: [1, 0, 1], uv: [0, 0] },
            { pos: [1, 1, 0], uv: [1, 1] },
            { pos: [1, 0, 0], uv: [1, 0] },
        ],
    },
    {
        //bottom
        uvRow: 1,
        dir: [0, -1, 0],
        vertices: [
            { pos: [1, 0, 1], uv: [1, 0] },
            { pos: [0, 0, 1], uv: [0, 0] },
            { pos: [1, 0, 0], uv: [1, 1] },
            { pos: [0, 0, 0], uv: [0, 1] },
        ],
    },
    {
        //top
        uvRow: 2,
        dir: [0, 1, 0],
        vertices: [
            { pos: [0, 1, 1], uv: [1, 1] },
            { pos: [1, 1, 1], uv: [0, 1] },
            { pos: [0, 1, 0], uv: [1, 0] },
            { pos: [1, 1, 0], uv: [0, 0] },
        ],
    },
    {
        //back
        uvRow: 0,
        dir: [0, 0, -1],
        vertices: [
            { pos: [1, 0, 0], uv: [0, 0] },
            { pos: [0, 0, 0], uv: [1, 0] },
            { pos: [1, 1, 0], uv: [0, 1] },
            { pos: [0, 1, 0], uv: [1, 1] },
        ],
    },
    {
        //front
        uvRow: 0,
        dir: [0, 0, 1],
        vertices: [
            { pos: [0, 0, 1], uv: [0, 0] },
            { pos: [1, 0, 1], uv: [1, 0] },
            { pos: [0, 1, 1], uv: [0, 1] },
            { pos: [1, 1, 1], uv: [1, 1] },
        ],
    },
];

export const CHUNK_NEIGHBORS = [
    /*

    [0][1][2]
    [7] X [3]
    [6][5][4]


    */

    {
        // front left
        dir: [-1, 1],
    },
    {
        // front
        dir: [0, 1],
    },
    {
        // front right
        dir: [1, 1],
    },
    {
        // right
        dir: [1, 0],
    },
    {
        // back right
        dir: [1, -1],
    },
    {
        // back
        dir: [0, -1],
    },
    {
        // back left
        dir: [-1, -1],
    },
    {
        // left
        dir: [-1, 0],
    },
];

export const BLOCK_TYPES = {
    AIR: 0,
    GRASS: { id: 0, isTransparent: false },
    DIRT: { id: 1, isTransparent: false },
    SAND: { id: 2, isTransparent: false },
    STONE: { id: 3, isTransparent: false },
    LOG: { id: 4, isTransparent: false },
    LEAVES: { id: 5, isTransparent: true },
    BRICK: { id: 6, isTransparent: true },
    PLANKS: { id: 7, isTransparent: true },
    WATER: { id: 12, isTransparent: true },
};
