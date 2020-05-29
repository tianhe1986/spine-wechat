
export function sceneTest(canvas, canvas2d, canvasChar) {
  var Laya = wx.window.Laya;
  var REG = Laya.ClassUtils.regClass;
  var Scene=Laya.Scene;

  class testUI extends Scene {
    constructor(){ 
      super();
    }
    createChildren() {
      super.createChildren();
      this.createView(testUI.uiView);
    }
    
  }
  testUI.uiView={"type":"Scene","props":{"width":720,"height":1280},"compId":2,"child":[{"type":"Image","props":{"y":169,"x":104,"skin":"comp/image.png"},"compId":3},{"type":"Button","props":{"y":486,"x":75,"width":177,"var":"testButton","skin":"comp/button.png","labelSize":30,"labelFont":"Microsoft YaHei","label":"好狠啊","height":79},"compId":4},{"type":"Rect","props":{"y":630,"x":43,"width":209,"lineWidth":1,"height":128,"fillColor":"#ff0000"},"compId":5},{"type":"Poly","props":{"y":727,"x":402,"points":"-10,20,106,-37,152,32,2,80","lineWidth":1,"lineColor":"#ff0000","fillColor":"#00ffff"},"compId":6},{"type":"Circle","props":{"y":862,"x":215,"radius":50,"lineWidth":1,"fillColor":"#ff00cb"},"compId":7}],"loadList":["comp/image.png","comp/button.png"],"loadList3D":[]};
  REG("ui.testUI",testUI);

  class Test extends testUI {
    constructor() { 
        super(); 
        this.init();
    }
    
    init() {
        this["testButton"].on(Laya.Event.CLICK, this, this.onClick);
    }

    onClick() {
        var skeleton = new Laya.Skeleton();
        //添加到舞台
        Laya.stage.addChild(skeleton);
        skeleton.pos(300, 900);
        skeleton.scale(0.7, 0.7);
        // 通过加载直接创建动画
        // 注意必须是远程加载才行，因此需要自己搭建web服务器
        skeleton.load("http://test.mine.cn/spine/spineboy.sk", Laya.Handler.create(this, () => {
          skeleton.player.on(Laya.Event.STOPPED, this, () => {
            skeleton.removeSelf();
          });
          skeleton.play("jump", false);
        }));
    }
  }

  class TestScene {
      constructor() {
        this.init();
        this.run();
      }

      init() {
        wx._cacheCanvas = canvas;
        Laya.Config.isAlpha = true;
        // 传递的三个参数分别用于主画布，Browser额外画布，以及处理文字用画布
        Laya.init(canvas, canvas2d, canvasChar, 720, 1280, Laya["WebGL"]);
        Laya.stage.bgColor = "#cccccc";
        Laya.stage.screenMode = "none";
        Laya.stage.scaleMode = "showall";
        Laya.stage.alignV = "middle";
        Laya.stage.alignH = "center";
        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = true;
      }

      run() {
        Laya.loader.load("http://test.mine.cn/atlas/comp.atlas",Laya.Handler.create(this, this.onLoaded));
      }

      onLoaded() {
        let test = new Test();
        Laya.stage.addChild(test);
      }
  }

  new TestScene();
  
}