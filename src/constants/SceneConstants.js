import * as WorldConstants from "./WorldConstants.js";
import * as CameraConstants from "./CameraConstants.js";

export const LIGHT_COLOR = 0xffffff;
export const INTENSITY = 0.5;
export const LIGHT_DEFAULT_X = CameraConstants.RENDER_DISTANCE * WorldConstants.CHUNK_SIZE;
export const LIGHT_DEFAULT_Z = CameraConstants.RENDER_DISTANCE * WorldConstants.CHUNK_SIZE;
export const FOG_NEAR = (CameraConstants.RENDER_DISTANCE * WorldConstants.CHUNK_SIZE * 2) / 3;
export const FOG_FAR = CameraConstants.RENDER_DISTANCE * (WorldConstants.CHUNK_SIZE - 0.5);
export const FOG_COLOR = "#adc8ff";

export const WATER_FOG_NEAR = 0;
export const WATER_FOG_FAR = WorldConstants.CHUNK_SIZE *3;
export const WATER_FOG_COLOR = "#30c9bf";

export const WATER_LIGHT_COLOR = "#30c9bf";
export const WATER_INTENSITY = 0.4;

export const FOG = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
export const WATER_FOG = new THREE.Fog(WATER_FOG_COLOR, WATER_FOG_NEAR, WATER_FOG_FAR);

export const AMBIENT = new THREE.AmbientLight(LIGHT_COLOR, INTENSITY);
export const WATER_AMBIENT = AMBIENT;

export const LIGHT = new THREE.DirectionalLight(LIGHT_COLOR, INTENSITY);

LIGHT.position.set(LIGHT_DEFAULT_X, WorldConstants.WORLD_HEIGHT + 200, LIGHT_DEFAULT_Z);
LIGHT.target.position.set(LIGHT_DEFAULT_X+50, 20, LIGHT_DEFAULT_Z+50);
LIGHT.castShadow = true;
LIGHT.target.updateMatrixWorld();

export const PLAYER_CHUNK_BOX = new THREE.Mesh(
    new THREE.BoxGeometry(WorldConstants.CHUNK_SIZE, WorldConstants.WORLD_HEIGHT * 3, WorldConstants.CHUNK_SIZE),
    new THREE.MeshBasicMaterial({
        color: "blue",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        fog: false,
    })
);

PLAYER_CHUNK_BOX.position.set(
    CameraConstants.CAMERA_DEFAULT_CHUNK_X * WorldConstants.CHUNK_SIZE + WorldConstants.CHUNK_SIZE / 2,
    0,
    CameraConstants.CAMERA_DEFAULT_CHUNK_Z * WorldConstants.CHUNK_SIZE + WorldConstants.CHUNK_SIZE / 2
);

export const PLAYER_CHUNK_OUTLINE = new THREE.LineSegments(
    new THREE.EdgesGeometry(PLAYER_CHUNK_BOX.geometry),
    new THREE.LineBasicMaterial({ color: "black", depthTest: false, transparent: true, opacity: 0.5, fog: false })
);

PLAYER_CHUNK_OUTLINE.position.set(
    CameraConstants.CAMERA_DEFAULT_CHUNK_X * WorldConstants.CHUNK_SIZE + WorldConstants.CHUNK_SIZE / 2,
    0,
    CameraConstants.CAMERA_DEFAULT_CHUNK_Z * WorldConstants.CHUNK_SIZE + WorldConstants.CHUNK_SIZE / 2
);
