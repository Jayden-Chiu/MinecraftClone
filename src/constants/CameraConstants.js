import * as WorldConstants from "./WorldConstants.js";
import * as GameConstants from "./GameConstants.js";

export const RENDER_DISTANCE = 8;

export const CAMERA_DEFAULT_X = RENDER_DISTANCE * WorldConstants.CHUNK_SIZE + WorldConstants.CHUNK_SIZE/2 + 0.01;
export const CAMERA_DEFAULT_Y = WorldConstants.WORLD_HEIGHT/3 + 0.01;
export const CAMERA_DEFAULT_Z = RENDER_DISTANCE * WorldConstants.CHUNK_SIZE + WorldConstants.CHUNK_SIZE/2 + 0.01;
export const CAMERA_DEFAULT_CHUNK_X = Math.floor(CAMERA_DEFAULT_X/WorldConstants.CHUNK_SIZE);
export const CAMERA_DEFAULT_CHUNK_Y = Math.floor(CAMERA_DEFAULT_Y/WorldConstants.CHUNK_SIZE);
export const CAMERA_DEFAULT_CHUNK_Z = Math.floor(CAMERA_DEFAULT_Z/WorldConstants.CHUNK_SIZE);
export const FOV = 75;
export const ASPECT = window.innerWidth / window.innerHeight;
export const NEAR = 0.1;
export const FAR = 1000;

// MOVEMENT
export const MOVEMENT_SPEED = 5.6/GameConstants.TICK_RATE;
export const ACCELERATION = 0.05;

// VOXEL PLACEMENT
export const BLOCK_DISTANCE = 5;