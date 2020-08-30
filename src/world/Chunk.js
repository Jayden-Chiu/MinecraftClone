import World from "./World.js";
import * as WorldConstants from "../constants/WorldConstants.js";
import * as TextureConstants from "../constants/TextureConstants.js";
import ChunkMesher from "./ChunkMesher.js";

export default class Chunk {
    constructor(cx, cy, cz, material, t_material) {
        this.voxels = new Array(WorldConstants.CHUNK_SIZE * WorldConstants.CHUNK_SIZE * WorldConstants.WORLD_HEIGHT);
        this.voxels.fill(0);
        this.elevation = new Array(WorldConstants.CHUNK_SIZE * WorldConstants.CHUNK_SIZE);
        this.generated = false;

        this.cx = cx;
        this.cy = cy;
        this.cz = cz;

        this.neighbors = new Array(8);

        this.mesh;
        this.t_mesh;

        this.material = material;
        this.t_material = t_material;

        this.texture;

        this.mesher = new ChunkMesher(this);
    }

    setVoxel(x, y, z, type, withNeighbors) {
        const { neighbors } = this;
        var index = this.calculateVoxelIndex(x, y, z);

        if (index == null) return;

        this.voxels[index] = type;
    }
    getVoxel(x, y, z) {
        var index = this.calculateVoxelIndex(x, y, z);
        return this.voxels[index];
    }

    doesNeighborVoxelExist(x, y, z, voxel) {
        const { voxels, cx, cz, neighbors } = this;
        var vx = x - WorldConstants.CHUNK_SIZE * cx;
        var vy = y % WorldConstants.WORLD_HEIGHT;
        var vz = z - WorldConstants.CHUNK_SIZE * cz;

        // return voxel value if voxel lies within chunk border
        if (vx >= 0 && vx < WorldConstants.CHUNK_SIZE && vy >= 0 && vz >= 0 && vz < WorldConstants.CHUNK_SIZE) {
            const neighbor = this.getVoxel(x, y, z);
            if (voxel !== WorldConstants.BLOCK_TYPES.WATER && neighbor === WorldConstants.BLOCK_TYPES.WATER)
                return null;

            if (voxel !== WorldConstants.BLOCK_TYPES.LEAVES && neighbor === WorldConstants.BLOCK_TYPES.LEAVES)
                return null;
            return neighbor;
        }

        // return bottom voxel negative y
        if (vy < 0) {
            return this.getVoxel(x, 0, z);
        }

        if (vy > WorldConstants.WORLD_HEIGHT) return null;

        // chunk neighbor checking
        var neighbor = this.getVoxelFromNeighborsFaces(x, y, z);

        // check if voxel in chunk neighbor exists

        if (neighbor != null) {
            if (voxel !== WorldConstants.BLOCK_TYPES.WATER && neighbor === WorldConstants.BLOCK_TYPES.WATER)
                return null;

            if (neighbor === WorldConstants.BLOCK_TYPES.LEAVES) return null;

            return neighbor;
        }

        return true;
    }

    getVoxelFromNeighborsFaces(x, y, z) {
        const { neighbors } = this;

        for (let i = 1; i < neighbors.length; i += 2) {
            const voxel = neighbors[i].getVoxel(x, y, z);

            if (voxel != null) return voxel;
        }

        return null;
    }

    getVoxelFromNeighbors(x, y, z) {
        const { neighbors } = this;

        for (let i = 0; i < neighbors.length; ++i) {
            const index = neighbors[i].calculateVoxelIndex(x, y, z);
            if (index != null) return neighbors[i].getVoxel(x, y, z);
        }

        return null;
    }

    calculateElevationIndex(x, z) {
        const { cx, cz } = this;
        var vx = x - WorldConstants.CHUNK_SIZE * cx;
        var vz = z - WorldConstants.CHUNK_SIZE * cz;

        var index = vx + vz * WorldConstants.CHUNK_SIZE;
        return index;
    }

    calculateVoxelIndex(x, y, z) {
        const { cx, cz } = this;
        var vx = x - WorldConstants.CHUNK_SIZE * cx;
        var vy = y;
        var vz = z - WorldConstants.CHUNK_SIZE * cz;

        if (vx < 0 || vy < 0 || vz < 0 || vx >= WorldConstants.CHUNK_SIZE || vz >= WorldConstants.CHUNK_SIZE) {
            return null;
        }

        var index = vx + vz * WorldConstants.CHUNK_SIZE + vy * WorldConstants.CHUNK_SIZE * WorldConstants.CHUNK_SIZE;
        return index;
    }

    updateMesh() {
        const { geometry, t_geometry } = this.mesher.mesh();
        const { material, t_material } = this;

        const { cx, cz } = this;

        // this.mesh = this.mesh ? this.mesh.geometry = geometry : new THREE.Mesh(geometry, material);

        if (!this.mesh) {
            this.mesh = new THREE.Mesh(geometry, material);
        } else {
            this.mesh.geometry = geometry;
        }
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = [cx, cz];

        if (!this.t_mesh) {
            this.t_mesh = new THREE.Mesh(t_geometry, t_material);
        } else {
            this.t_mesh.geometry = t_geometry;
        }
        this.t_mesh.name = [cx, cz];
    }

    generateTerrain(seed) {
        const { cx, cz, elevation } = this;

        const freq = WorldConstants.DEFAULT_FREQUENCY;
        const amp = WorldConstants.AMPLITUDE;
        const exp = WorldConstants.EXPONENT;
        const levels = WorldConstants.LEVELS;
        const base = WorldConstants.BASE_HEIGHT;

        // https://www.redblobgames.com/maps/terrain-from-noise/
        for (let x = 0; x < WorldConstants.CHUNK_SIZE; x++) {
            for (let z = 0; z < WorldConstants.CHUNK_SIZE; z++) {
                const vx = cx * WorldConstants.CHUNK_SIZE + x;
                const vz = cz * WorldConstants.CHUNK_SIZE + z;

                // get height from simplex noise heightmap
                var e = 0;

                for (const octave of WorldConstants.OCTAVES) {
                    e += (1 / octave) * noise.simplex2(octave * vx * freq, octave * vz * freq);
                }

                // TERRACES
                // e = Math.round(e * levels)/levels;

                // REDISTRIBUTION
                e = Math.exp(e, exp);

                var height = Math.floor(e * amp) + base;

                elevation[this.calculateElevationIndex(x, z)] = height;

                if (height > 0) {
                    for (let y = 0; y < height; y++) {
                        // set block types for texture loading
                        var type = this.getBlockType(height, y);
                        this.setVoxel(vx, y, vz, type);
                    }
                }

                // add water on land
                if (height <= WorldConstants.OCEAN_HEIGHT) {
                    for (let y = height; y <= WorldConstants.OCEAN_HEIGHT; y++) {
                        // set block types for texture loading
                        var type = WorldConstants.BLOCK_TYPES.WATER;
                        this.setVoxel(vx, y, vz, type);
                    }
                }
            }
        }

        this.generateTrees();

        this.generated = true;
    }

    generateTrees() {
        const { cx, cz, elevation } = this;

        // generate random trees using poisson disk sampling
        var p = new PoissonDiskSampling({
            shape: [WorldConstants.CHUNK_SIZE, WorldConstants.CHUNK_SIZE],
            minDistance: 13,
            maxDistance: 13,
            tries: 10,
        });
        var points = p.fill();

        for (const point of points) {
            const x = Math.floor(point[0]);
            const z = Math.floor(point[1]);

            const vx = cx * WorldConstants.CHUNK_SIZE + x;
            const vz = cz * WorldConstants.CHUNK_SIZE + z;

            const y = elevation[this.calculateElevationIndex(x, z)];

            this.addTree(vx, y, vz);
        }

        this.generated = true;
    }

    addTree(x, y, z) {
        const { cx, cz } = this;
        if (y > WorldConstants.TREE_Y_CUTOFF) {
            const treeHeight = Math.floor(
                Math.random() * WorldConstants.TREE_HEIGHT_DIFF + WorldConstants.TREE_MIN_HEIGHT
            );

            // generate trunk
            for (let ty = y; ty < y + treeHeight; ty++) {
                this.setVoxel(x, ty, z, WorldConstants.BLOCK_TYPES.LOG);

                // tree leaf width offset (wo)
                var wo;
                if (ty == y + treeHeight - 3 || ty == y + treeHeight - 2) {
                    wo = 2;
                } else if (ty == y + treeHeight - 1) {
                    wo = 1;
                }

                if (wo)
                    for (let tx = wo; tx >= -wo; tx--) {
                        for (let tz = wo; tz >= -wo; tz--) {
                            const vx = x + tx;
                            const vz = z + tz;
                            const vy = ty;
                            if (!this.getVoxel(vx, vy, vz)) {
                                // rng corner leaf placement
                                if (tx === wo || tx === -wo) {
                                    if (tz === wo || tz === -wo) {
                                        const rng = Math.random();
                                        if (rng <= 0.5) {
                                            this.setVoxel(vx, vy, vz, WorldConstants.BLOCK_TYPES.LEAVES);
                                        }
                                        continue;
                                    }
                                }
                                this.setVoxel(vx, vy, vz, WorldConstants.BLOCK_TYPES.LEAVES);
                            }
                        }
                    }
            }

            for (let tx = 1; tx >= -1; tx--) {
                for (let tz = 1; tz >= -1; tz--) {
                    const vx = x + tx;
                    const vz = z + tz;
                    const vy = y + treeHeight;
                    if (!this.getVoxel(vx, vy, vz)) {
                        if (tx === wo || tx === -wo) {
                            if (tz === wo || tz === -wo) {
                                continue;
                            }
                        }
                        this.setVoxel(vx, vy, vz, WorldConstants.BLOCK_TYPES.LEAVES);
                    }
                }
            }
            // make block under tree dirt
            this.setVoxel(x, y - 1, z, WorldConstants.BLOCK_TYPES.DIRT);
        }
    }

    getBlockType(height, y) {
        var type = WorldConstants.BLOCK_TYPES.STONE;

        // check which block type to set the voxel in chunk
        if (y >= height - WorldConstants.SAND_HEIGHT_DIFF && y <= WorldConstants.BEACH_HEIGHT) {
            type = WorldConstants.BLOCK_TYPES.SAND;
        } else if (y >= height - 1) {
            type = WorldConstants.BLOCK_TYPES.GRASS;
        } else if (y > height - WorldConstants.DIRT_HEIGHT_DIFF) {
            type = WorldConstants.BLOCK_TYPES.DIRT;
        }

        return type;
    }
}
