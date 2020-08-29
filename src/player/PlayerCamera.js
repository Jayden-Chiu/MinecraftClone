import * as CameraConstants from "../constants/CameraConstants.js";
import * as WorldConstants from "../constants/WorldConstants.js";
import * as SceneConstants from "../constants/SceneConstants.js";
import World from "../world/World.js";

export class PlayerCamera extends THREE.PerspectiveCamera {
    constructor() {
        super(CameraConstants.FOV, CameraConstants.ASPECT, CameraConstants.NEAR, CameraConstants.FAR);
        this.position.set(CameraConstants.CAMERA_DEFAULT_X, CameraConstants.CAMERA_DEFAULT_Y,CameraConstants.CAMERA_DEFAULT_Z);
        
        this.cx = CameraConstants.CAMERA_DEFAULT_CHUNK_X;
        this.cz = CameraConstants.CAMERA_DEFAULT_CHUNK_Z;
    }

    getCameraChunkCoords(){
        const x = this.position.x;
        const y = this.position.y;
        const z = this.position.z;

        const cx = Math.floor(x/WorldConstants.CHUNK_SIZE);
        const cy = Math.floor(y/WorldConstants.CHUNK_SIZE);
        const cz = Math.floor(z/WorldConstants.CHUNK_SIZE);

        this.cx = cx;
        this.cy = cy;
        this.cz = cz;

        return [cx,cy,cz];
    }

    setCameraChunkCoords(cx,cy,cz){
        this.cx = cx;
        this.cy = cy;
        this.cz = cz;
    }

    getCameraRenderingAreaCoords(){
        const {cx,cy,cz} = this;

        // update cameras current chunk
        const pbx = cx - CameraConstants.RENDER_DISTANCE;
        const pfx = cx + CameraConstants.RENDER_DISTANCE;

        const pby = cy - CameraConstants.RENDER_DISTANCE;
        const pfy = cy + CameraConstants.RENDER_DISTANCE;

        const pbz = cz - CameraConstants.RENDER_DISTANCE;
        const pfz = cz + CameraConstants.RENDER_DISTANCE;

        return [pbx,pfx,pby,pfy,pbz,pfz];
    }

    updateFog(scene,world) {
        if (world.debug) return;
        const voxel = world.getVoxel(this.position.x,this.position.y,this.position.z);

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
}
