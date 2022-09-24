import World from "./World.js";
import * as WorldConstants from "../constants/WorldConstants.js";
import * as TextureConstants from "../constants/TextureConstants.js";

export default class ChunkMesher {
    constructor(chunk) {
        this.chunk = chunk;
    }

    // culled mesher
    mesh() {
        const { cx, cy, cz } = this.chunk;
        const { chunk } = this;

        //parallel arrays for BufferGeometry
        const positions = [];
        const normals = [];
        const indices = [];
        const uvs = [];

        const t_positions = [];
        const t_normals = [];
        const t_indices = [];
        const t_uvs = [];

        const geometry = new THREE.BufferGeometry();
        const t_geometry = new THREE.BufferGeometry();

        // console.log("BEGIN: " + cx + "," + cz + " " + performance.now())
        for (let y = 0; y < WorldConstants.WORLD_HEIGHT; ++y) {
            var vy = cy * WorldConstants.CHUNK_SIZE + y;
            for (let z = 0; z < WorldConstants.CHUNK_SIZE; ++z) {
                var vz = cz * WorldConstants.CHUNK_SIZE + z;
                for (let x = 0; x < WorldConstants.CHUNK_SIZE; ++x) {
                    var vx = cx * WorldConstants.CHUNK_SIZE + x;
                    const voxel = chunk.getVoxel(vx, vy, vz);

                    // get neighbors of current voxel if it exists
                    if (voxel) {
                        // iterate through every faces to get neighbors
                        for (const { uvRow, dir, vertices } of WorldConstants.VOXEL_FACES) {
                            const neighbor = chunk.doesNeighborVoxelExist(vx + dir[0], vy + dir[1], vz + dir[2], voxel);

                            // add face to geometry if there is no neighbor (i.e. visible to camera)
                            if (!neighbor) {
                                // divide index by three to get index of vertex
                                const ndx = positions.length / 3;

                                //add to arrays for BufferGeometry
                                for (const { pos, uv } of vertices) {
                                    if (!voxel.isTransparent) {
                                        positions.push(vx + pos[0], vy + pos[1], vz + pos[2]);

                                        normals.push(...dir);
                                        uvs.push(
                                            ((voxel.id + uv[0]) * TextureConstants.TILE_SIZE) /
                                                TextureConstants.TILE_TEXTURE_WIDTH,
                                            1 -
                                                ((uvRow + 1 - uv[1]) * TextureConstants.TILE_SIZE) /
                                                    TextureConstants.TILE_TEXTURE_HEIGHT
                                        );
                                    } else {
                                        if (voxel === WorldConstants.BLOCK_TYPES.WATER) {
                                            t_positions.push(vx + pos[0], vy + pos[1] - 0.1, vz + pos[2]);
                                        } else {
                                            t_positions.push(vx + pos[0], vy + pos[1], vz + pos[2]);
                                        }

                                        t_normals.push(...dir);
                                        t_uvs.push(
                                            ((voxel.id + uv[0]) * TextureConstants.TILE_SIZE) /
                                                TextureConstants.TILE_TEXTURE_WIDTH,
                                            1 -
                                                ((uvRow + 1 - uv[1]) * TextureConstants.TILE_SIZE) /
                                                    TextureConstants.TILE_TEXTURE_HEIGHT
                                        );
                                    }
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

                                if (
                                    voxel !== WorldConstants.BLOCK_TYPES.WATER &&
                                    voxel !== WorldConstants.BLOCK_TYPES.LEAVES
                                ) {
                                    indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                                }
                                t_indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                            }
                        }
                    }
                }
            }
        }

        // console.log("END: " + cx + "," + cz + " " + performance.now())

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

        t_geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(t_positions), positionNumComponents)
        );
        t_geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(t_normals), normalNumComponents));
        t_geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(t_uvs), uvNumComponents));
        const size = t_positions.length / 3;
        t_geometry.setIndex(t_indices.filter(v => v < size));

        return { geometry, t_geometry };
    }
}
