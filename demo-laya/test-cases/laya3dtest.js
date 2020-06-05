export function laya3dTest(canvas, canvas2d, canvasChar) {
  var window = wx.window;
  var Laya = wx.window.Laya;
  var Laya3D = wx.window.Laya3D;
  
  (function () {
    'use strict';

    class CameraMoveScript extends Laya.Script3D {
        constructor() {
            super();
            this._tempVector3 = new Laya.Vector3();
            this.yawPitchRoll = new Laya.Vector3();
            this.resultRotation = new Laya.Quaternion();
            this.tempRotationZ = new Laya.Quaternion();
            this.tempRotationX = new Laya.Quaternion();
            this.tempRotationY = new Laya.Quaternion();
            this.rotaionSpeed = 0.00006;
        }
        onAwake() {
            Laya.stage.on(Laya.Event.RIGHT_MOUSE_DOWN, this, this.mouseDown);
            Laya.stage.on(Laya.Event.RIGHT_MOUSE_UP, this, this.mouseUp);
            this.camera = this.owner;
        }
        _onDestroy() {
            Laya.stage.off(Laya.Event.RIGHT_MOUSE_DOWN, this, this.mouseDown);
            Laya.stage.off(Laya.Event.RIGHT_MOUSE_UP, this, this.mouseUp);
        }
        onUpdate() {
            var elapsedTime = Laya.timer.delta;
            if (!isNaN(this.lastMouseX) && !isNaN(this.lastMouseY) && this.isMouseDown) {
                var scene = this.owner.scene;
                Laya.KeyBoardManager.hasKeyDown(87) && this.moveForward(-0.01 * elapsedTime);
                Laya.KeyBoardManager.hasKeyDown(83) && this.moveForward(0.01 * elapsedTime);
                Laya.KeyBoardManager.hasKeyDown(65) && this.moveRight(-0.01 * elapsedTime);
                Laya.KeyBoardManager.hasKeyDown(68) && this.moveRight(0.01 * elapsedTime);
                Laya.KeyBoardManager.hasKeyDown(81) && this.moveVertical(0.01 * elapsedTime);
                Laya.KeyBoardManager.hasKeyDown(69) && this.moveVertical(-0.01 * elapsedTime);
                var offsetX = Laya.stage.mouseX - this.lastMouseX;
                var offsetY = Laya.stage.mouseY - this.lastMouseY;
                var yprElem = this.yawPitchRoll;
                yprElem.x -= offsetX * this.rotaionSpeed * elapsedTime;
                yprElem.y -= offsetY * this.rotaionSpeed * elapsedTime;
                this.updateRotation();
            }
            this.lastMouseX = Laya.stage.mouseX;
            this.lastMouseY = Laya.stage.mouseY;
        }
        mouseDown(e) {
            this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
            this.lastMouseX = Laya.stage.mouseX;
            this.lastMouseY = Laya.stage.mouseY;
            this.isMouseDown = true;
        }
        mouseUp(e) {
            this.isMouseDown = false;
        }
        moveForward(distance) {
            this._tempVector3.x = 0;
            this._tempVector3.y = 0;
            this._tempVector3.z = distance;
            this.camera.transform.translate(this._tempVector3);
        }
        moveRight(distance) {
            this._tempVector3.y = 0;
            this._tempVector3.z = 0;
            this._tempVector3.x = distance;
            this.camera.transform.translate(this._tempVector3);
        }
        moveVertical(distance) {
            this._tempVector3.x = this._tempVector3.z = 0;
            this._tempVector3.y = distance;
            this.camera.transform.translate(this._tempVector3, false);
        }
        updateRotation() {
            if (Math.abs(this.yawPitchRoll.y) < 1.50) {
                Laya.Quaternion.createFromYawPitchRoll(this.yawPitchRoll.x, this.yawPitchRoll.y, this.yawPitchRoll.z, this.tempRotationZ);
                this.tempRotationZ.cloneTo(this.camera.transform.localRotation);
                this.camera.transform.localRotation = this.camera.transform.localRotation;
            }
        }
    }

    class Main {
        constructor() {
            wx._cacheCanvas = canvas;
            Laya3D.init(canvas, canvas2d, canvasChar, 720, 1280);
            Laya.stage.scaleMode = "showall";
            Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
            this.scene = new Laya.Scene3D();
            Laya.stage.addChild(this.scene);
            Laya.URL.basePath = "https://layaair2.ldc2.layabox.com/demo2/h5/";
            var camera = new Laya.Camera(0, 0.1, 100);
            this.scene.addChild(camera);
            camera.transform.translate(new Laya.Vector3(0, 0.5, 1));
            camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            camera.addComponent(CameraMoveScript);
            var directionLight = new Laya.DirectionLight();
            this.scene.addChild(directionLight);
            directionLight.color = new Laya.Vector3(1, 1, 1);
            directionLight.transform.rotate(new Laya.Vector3(-3.14 / 3, 0, 0));
            var resource = [
                "res/threeDimen/skinModel/LayaMonkey2/LayaMonkey.lh",
                "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"
            ];
            Laya.loader.create(resource, Laya.Handler.create(this, this.onPreLoadFinish));
        }
        onPreLoadFinish() {
            var layaMonkeyParent = this.scene.addChild(Laya.Loader.getRes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"));
            var layaMonkeySon = Laya.Loader.getRes("res/threeDimen/skinModel/LayaMonkey2/LayaMonkey.lh");
            layaMonkeySon.transform.translate(new Laya.Vector3(2.5, 0, 0));
            var scale = new Laya.Vector3(0.5, 0.5, 0.5);
            layaMonkeySon.transform.localScale = scale;
            layaMonkeyParent.addChild(layaMonkeySon);
            this.addButton(100, 120, 200, 45, "移动父级猴子", 20, function (e) {
                layaMonkeyParent.transform.translate(new Laya.Vector3(-0.1, 0, 0));
            });
            this.addButton(100, 170, 200, 45, "放大父级猴子", 20, function (e) {
                var scale = new Laya.Vector3(0.2, 0.2, 0.2);
                layaMonkeyParent.transform.localScale = scale;
            });
            this.addButton(100, 220, 200, 45, "旋转父级猴子", 20, function (e) {
                layaMonkeyParent.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            });
            this.addButton(100, 270, 200, 45, "移动子级猴子", 20, function (e) {
                layaMonkeySon.transform.translate(new Laya.Vector3(-0.1, 0, 0));
            });
            this.addButton(100, 320, 200, 45, "放大子级猴子", 20, function (e) {
                var scale = new Laya.Vector3(1, 1, 1);
                layaMonkeySon.transform.localScale = scale;
            });
            this.addButton(100, 370, 200, 45, "旋转子级猴子", 20, function (e) {
                layaMonkeySon.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            });
        }
        addButton(x, y, width, height, text, size, clickFun) {
            Laya.loader.load(["res/threeDimen/ui/button.png"], Laya.Handler.create(null, function () {
                var changeActionButton = Laya.stage.addChild(new Laya.Button("res/threeDimen/ui/button.png", text));
                changeActionButton.size(width, height);
                changeActionButton.labelBold = true;
                changeActionButton.labelSize = size;
                changeActionButton.sizeGrid = "4,4,4,4";
                changeActionButton.pos(x, y);
                changeActionButton.on(Laya.Event.CLICK, this, clickFun);
            }));
        }
    }
    new Main();

}());
  
}