export default class Segment {
    constructor(cx, cy, cz) {
        this.voxels = new Array(WorldConstants.CHUNK_SIZE * WorldConstants.CHUNK_SIZE * WorldConstants.CHUNK_SIZE);

        this.cx = cx;
        this.cy = cy;
        this.cz = cz;

        this.neighbors = new Array(6);

        this.mesh;
        this.watermesh;
        this.texture;
        this.geometry;

        this.wireframe;
    }

    generateChunkGeometry() {
        const { cx, cy, cz } = this;

        //parallel arrays for BufferGeometry
        const positions = [];
        const normals = [];
        const indices = [];
        const uvs = [];

        const geometry = new THREE.BufferGeometry();

        for (let y = 0; y < WorldConstants.CHUNK_SIZE; ++y) {
            const vy = cy * WorldConstants.CHUNK_SIZE + y;
            for (let z = 0; z < WorldConstants.CHUNK_SIZE; ++z) {
                const vz = cz * WorldConstants.CHUNK_SIZE + z;
                for (let x = 0; x < WorldConstants.CHUNK_SIZE; ++x) {
                    const vx = cx * WorldConstants.CHUNK_SIZE + x;
                    const voxel = this.getVoxel(vx, vy, vz);

                    // get neighbors of current voxel if it exists
                    // if (voxel && voxel != World.types.WATER) {
                    if (voxel) {
                        // iterate through every faces to get neighbors
                        for (const { uvRow, dir, vertices } of World.voxelFaces) {
                            const neighbor = this.doesNeighborVoxelExist(vx + dir[0], vy + dir[1], vz + dir[2]);

                            // add face to geometry if there is no neighbor (i.e. visible to camera)
                            // if (!neighbor || neighbor == World.types.WATER) {
                            if (!neighbor) {
                                // divide index by three to get index of vertex
                                const ndx = positions.length / 3;

                                //add to arrays for BufferGeometry
                                for (const { pos, uv } of vertices) {
                                    positions.push(vx + pos[0], vy + pos[1], vz + pos[2]);

                                    normals.push(...dir);
                                    uvs.push(
                                        ((voxel + uv[0]) * TextureConstants.TILE_SIZE) /
                                            TextureConstants.TILE_TEXTURE_WIDTH,
                                        1 -
                                            ((uvRow + 1 - uv[1]) * TextureConstants.TILE_SIZE) /
                                                TextureConstants.TILE_TEXTURE_HEIGHT
                                    );
                                }
                                /*

                                quad index, triangles created by connecting vertex index in clockwise order

                                triangle (0,1,2) forms first triangle
                                triangle (2,1,3) forms second triangle

                                ( 1 )-------( 3 )
                                  |\          |
                                  |  \        |
                                  |    \      |
                                  |      \    |
                                  |        \  |
                                  |          \|
                                ( 0 )-------( 2 )

                                */

                                indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                            }
                        }
                    }
                }
            }
        }

        //set positions, normals, and indices into BufferGeometry
        const positionNumComponents = 3;
        const normalNumComponents = 3;
        const uvNumComponents = 2;
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents)
        );
        geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
        geometry.setIndex(indices);

        return geometry;
    }

    setVoxel(x, y, z, type) {
        var index = this.calculateVoxelIndex(x, y, z);

        this.voxels[index] = type;
    }
    getVoxel(x, y, z) {
        var index = this.calculateVoxelIndex(x, y, z);

        return this.voxels[index];
    }

    doesNeighborVoxelExist(x, y, z, voxel) {
        const { voxels } = this;
        const { vx, vy, vz } = this.calculateVoxelCoords();

        // return voxel value if voxel lies within chunk border
        if (
            vx >= 0 &&
            vx < WorldConstants.CHUNK_SIZE &&
            vy >= 0 &&
            vy < WorldConstants.CHUNK_SIZE &&
            vz >= 0 &&
            vz < WorldConstants.CHUNK_SIZE
        ) {
            return voxels[this.calculateVoxelIndex(x, y, z)];
        }

        // return bottom voxel negative y
        if (vy < 0) {
            return voxels[this.calculateVoxelIndex(x, 0, z)];
        }

        if (vy > WorldConstants.WORLD_HEIGHT) return null;

        // chunk neighbor checking
        var face = -1;

        if (vx < 0) {
            face = 0;
        } else if (vx >= WorldConstants.CHUNK_SIZE) {
            face = 1;
        } else if (vy < 0) {
            face = 2;
        } else if (vy >= WorldConstants.CHUNK_SIZE) {
            face = 3;
        } else if (vz < 0) {
            face = 4;
        } else if (vz >= WorldConstants.CHUNK_SIZE) {
            face = 5;
        }

        if (face > -1) {
            // check if voxel in chunk neighbor exists
            if (this.neighbors[face]) {
                const neighbor = this.neighbors[face].getVoxel(x, y, z);
                return neighbor;
            }
        }

        return true;
    }

    calculateVoxelIndex(x, y, z) {
        const { cx, cy, cz } = this;
        var vx = x - WorldConstants.CHUNK_SIZE * cx;
        var vy = y - WorldConstants.CHUNK_SIZE * cy;
        var vz = z - WorldConstants.CHUNK_SIZE * cz;

        var index = vx + vz * WorldConstants.CHUNK_SIZE + vy * WorldConstants.CHUNK_SIZE * WorldConstants.CHUNK_SIZE;
        return index;
    }

    calculateVoxelCoords(x, y, z) {
        const { cx, cy, cz } = this;
        var vx = x - WorldConstants.CHUNK_SIZE * cx;
        var vy = y - WorldConstants.CHUNK_SIZE * cy;
        var vz = z - WorldConstants.CHUNK_SIZE * cz;

        return { vx, vy, vz };
    }

    updateNeighbors(chunks, world) {
        const { cx, cy, cz, neighbors } = this;
        for (let i = 0; i < neighbors.length; i++) {
            const cnx = cx + World.chunkFaces[i].dir[0];
            const cny = cy + World.chunkFaces[i].dir[1];
            const cnz = cz + World.chunkFaces[i].dir[2];

            // generate neighbor
            world.createChunkIfDNE(cnx, cny, cnz);

            this.neighbors[i] = chunks[cnx][cnz];
        }
    }

    updateMesh() {
        if (!this.geometry) this.geometry = this.generateChunkGeometry();
        var material = new THREE.MeshPhongMaterial({
            transparent: true,
            map: this.texture,
        });

        this.mesh = new THREE.Mesh(this.geometry, material);
        this.mesh.name = [this.cx, this.cz];
    }

    generateTerrain() {
        const { cx, cz } = this;

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
                        var type = World.types.WATER;
                        this.setVoxel(vx, y, vz, type);
                    }
                }
            }
        }
    }

    getBlockType(height, y) {
        var type = World.types.STONE;

        // check which block type to set the voxel in chunk
        if (y >= height - WorldConstants.SAND_HEIGHT_DIFF && y <= WorldConstants.BEACH_HEIGHT) {
            type = World.types.SAND;
        } else if (y >= height - 1) {
            type = World.types.GRASS;
        } else if (y > height - WorldConstants.DIRT_HEIGHT_DIFF) {
            type = World.types.DIRT;
        }

        return type;
    }

    generateWireframe() {
        var wireframe = new THREE.WireframeGeometry(this.mesh.geometry);

        var line = new THREE.LineSegments(wireframe);
        line.material.depthTest = false;
        line.material.opacity = 0.3;
        line.material.transparent = true;
        line.material.color = new THREE.Color("#FF0000");

        this.wireframe = line;
        this.wireframe.name = [this.cx, this.cz];
    }
}
