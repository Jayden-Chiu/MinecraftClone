import * as CameraConstants from "../constants/CameraConstants.js";
import * as WorldConstants from "../constants/WorldConstants.js";
import * as SceneConstants from "../constants/SceneConstants.js";
import World from "../world/World.js";

export class PlayerCamera extends THREE.PerspectiveCamera {
    constructor(canvas, world, scene) {
        super(CameraConstants.FOV, CameraConstants.ASPECT, CameraConstants.NEAR, CameraConstants.FAR);
        this.position.set(
            CameraConstants.CAMERA_DEFAULT_X,
            CameraConstants.CAMERA_DEFAULT_Y,
            CameraConstants.CAMERA_DEFAULT_Z
        );

        this.cx = CameraConstants.CAMERA_DEFAULT_CHUNK_X;
        this.cz = CameraConstants.CAMERA_DEFAULT_CHUNK_Z;

        const self = this;

        this.canvas = canvas;
        this.world = world;

        // default block to place
        this.currBlock = WorldConstants.BLOCK_TYPES.STONE;

        this.start = new THREE.Vector3();
        this.dir = new THREE.Vector3();
        this.end = new THREE.Vector3();
    }

    getCameraChunkCoords() {
        const x = this.position.x;
        const y = this.position.y;
        const z = this.position.z;

        const cx = Math.floor(x / WorldConstants.CHUNK_SIZE);
        const cy = Math.floor(y / WorldConstants.CHUNK_SIZE);
        const cz = Math.floor(z / WorldConstants.CHUNK_SIZE);

        this.cx = cx;
        this.cy = cy;
        this.cz = cz;

        return [cx, cy, cz];
    }

    setCameraChunkCoords(cx, cy, cz) {
        this.cx = cx;
        this.cy = cy;
        this.cz = cz;
    }

    getCameraRenderingAreaCoords() {
        const { cx, cy, cz } = this;

        // update cameras current chunk
        const pbx = cx - CameraConstants.RENDER_DISTANCE;
        const pfx = cx + CameraConstants.RENDER_DISTANCE;

        const pby = cy - CameraConstants.RENDER_DISTANCE;
        const pfy = cy + CameraConstants.RENDER_DISTANCE;

        const pbz = cz - CameraConstants.RENDER_DISTANCE;
        const pfz = cz + CameraConstants.RENDER_DISTANCE;

        return [pbx, pfx, pby, pfy, pbz, pfz];
    }

    updateFog(scene, world) {
        if (world.debug) return;
        const voxel = world.getVoxel(this.position.x, this.position.y, this.position.z);

        if (voxel === WorldConstants.BLOCK_TYPES.WATER) {
            scene.fog = SceneConstants.WATER_FOG;
            scene.add(SceneConstants.WATER_AMBIENT);
            scene.remove(SceneConstants.AMBIENT);
        } else {
            scene.fog = SceneConstants.FOG;
            scene.remove(SceneConstants.WATER_AMBIENT);
            scene.add(SceneConstants.AMBIENT);
        }
    }

    placeVoxel(voxelId) {
        const intersection = this.calculateIntersection();
        if (intersection) {
            const pos = intersection.position.map((v, ndx) => {
                return v + intersection.normal[ndx] * (voxelId > 0 ? 0.5 : -0.5);
            });

            this.world.setVoxel(...pos, voxelId);
        }
    }

    setCurrentBlockTypeToHighlighted() {
        const intersection = this.calculateIntersection();

        if (intersection) {
            const pos = intersection.position.map((v, ndx) => {
                return Math.ceil(v + intersection.normal[ndx] * -0.5) - 0.5;
            });

            this.currBlock = this.world.getVoxel(...pos);
        }
    }

    calculateIntersection() {
        const { start, dir, end } = this;

        // get vector of camera direction
        this.getWorldDirection(dir);

        // set starting vector to camera position in matrix world
        start.setFromMatrixPosition(this.matrixWorld);

        // get end vector from start with certain distance
        end.addVectors(start, dir.multiplyScalar(CameraConstants.BLOCK_DISTANCE));

        return this.intersectRay(start, end);
    }

    intersectRay(start, end) {
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let dz = end.z - start.z;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

        dx /= len;
        dy /= len;
        dz /= len;

        let t = 0.0;
        let ix = Math.floor(start.x);
        let iy = Math.floor(start.y);
        let iz = Math.floor(start.z);

        const stepX = dx > 0 ? 1 : -1;
        const stepY = dy > 0 ? 1 : -1;
        const stepZ = dz > 0 ? 1 : -1;

        const txDelta = Math.abs(1 / dx);
        const tyDelta = Math.abs(1 / dy);
        const tzDelta = Math.abs(1 / dz);

        const xDist = stepX > 0 ? ix + 1 - start.x : start.x - ix;
        const yDist = stepY > 0 ? iy + 1 - start.y : start.y - iy;
        const zDist = stepZ > 0 ? iz + 1 - start.z : start.z - iz;

        // location of nearest voxel boundary, in units of t
        let txMax = txDelta < Infinity ? txDelta * xDist : Infinity;
        let tyMax = tyDelta < Infinity ? tyDelta * yDist : Infinity;
        let tzMax = tzDelta < Infinity ? tzDelta * zDist : Infinity;

        let steppedIndex = -1;

        // main loop along raycast vector
        while (t <= len) {
            const voxel = this.world.getVoxel(ix, iy, iz);
            if (voxel) {
                return {
                    position: [start.x + t * dx, start.y + t * dy, start.z + t * dz],
                    normal: [
                        steppedIndex === 0 ? -stepX : 0,
                        steppedIndex === 1 ? -stepY : 0,
                        steppedIndex === 2 ? -stepZ : 0,
                    ],
                    voxel,
                };
            }

            // advance t to next nearest voxel boundary
            if (txMax < tyMax) {
                if (txMax < tzMax) {
                    ix += stepX;
                    t = txMax;
                    txMax += txDelta;
                    steppedIndex = 0;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            } else {
                if (tyMax < tzMax) {
                    iy += stepY;
                    t = tyMax;
                    tyMax += tyDelta;
                    steppedIndex = 1;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            }
        }
        return null;
    }
}
