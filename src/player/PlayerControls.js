import { PointerLockControls } from "../../three/examples/jsm/controls/PointerLockControls.js";
import * as CameraConstants from "../constants/CameraConstants.js";

export class PlayerControls extends PointerLockControls {
    constructor(camera, domElement, world, scene) {
        super(camera, domElement);
        this.camera = camera;

        this.wireframeOn = false;

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
    }

    update() {
        const { keys } = this;
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
    }
}
