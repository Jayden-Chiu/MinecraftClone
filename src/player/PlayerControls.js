import { PointerLockControls } from "../../three/examples/jsm/controls/PointerLockControls.js";
import * as CameraConstants from "../constants/CameraConstants.js";
import * as WorldConstants from "../constants/WorldConstants.js";

export class PlayerControls extends PointerLockControls {
    constructor(camera, domElement, world, scene) {
        super(camera, domElement);
        this.camera = camera;

        this.wireframeOn = false;

       

        this.world = world;

        this.addEventListener("lock", function () {});
        this.addEventListener("unlock", function () {});

        var self = this;
        document.body.addEventListener("click", function () {
            self.lock();
        });

        this.keys = [];
        document.addEventListener("keydown", function (e) {
            self.keys.push(e.keyCode);
        });
        document.addEventListener("keyup", function (e) {
            var arr = [];
            for (var i = 0; i < self.keys.length; i++) {
                if (self.keys[i] != e.keyCode) {
                    arr.push(self.keys[i]);
                }
            }
            self.keys = arr;
        });

        // mouse controls
        window.addEventListener(
            "mousedown",
            (event) => {
                event.preventDefault();

                // left click
                if (event.button === 0)
                    window.addEventListener("mouseup", self.camera.placeVoxel(WorldConstants.BLOCK_TYPES.AIR));

                // middle click
                if (event.button === 1) 
                    window.addEventListener("mouseup", self.camera.setCurrentBlockTypeToHighlighted());

                // right click
                if (event.button === 2)
                    window.addEventListener("mouseup", self.camera.placeVoxel(self.camera.currBlock));
            },
            { passive: false }
        );

        // voxel highlight
        const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.005, 1.005, 1.005));
        const material = new THREE.LineBasicMaterial({ color: "black", fog: false, linewidth: 2, depthTest: true })
        this.voxelHighlight = new THREE.LineSegments( geometry, material );
        this.voxelHighlight.visible = false;


        scene.add(this.voxelHighlight);
    }

    update() {
        // movement controls
        const { keys, camera } = this;
        // w
        if (keys.includes(87)) {
            this.moveForward(CameraConstants.MOVEMENT_SPEED);
        }
        // a
        if (keys.includes(65)) {
            this.moveRight(-1 * CameraConstants.MOVEMENT_SPEED);
        }
        // s
        if (keys.includes(83)) {
            this.moveForward(-1 * CameraConstants.MOVEMENT_SPEED);
        }
        // d
        if (keys.includes(68)) {
            this.moveRight(CameraConstants.MOVEMENT_SPEED);
        }

        // space
        if (keys.includes(32)) {
            this.getObject().position.y += CameraConstants.MOVEMENT_SPEED;
        }

        // shift
        if (keys.includes(16)) {
            this.getObject().position.y -= CameraConstants.MOVEMENT_SPEED;
        }

        // block highlighting

        const intersection = camera.calculateIntersection();

        if (intersection) {
            const pos = intersection.position.map((v, ndx) => {
                return Math.ceil(v + intersection.normal[ndx] * -0.5) - 0.5;
            });

            this.voxelHighlight.visible = true;
            this.voxelHighlight.position.set(...pos);
        } else {
            this.voxelHighlight.visible = false;
        }
    }
}
