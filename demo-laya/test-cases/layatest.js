export function layaTest(canvas) {
  var Laya = wx.window.Laya;
  class Test {
      constructor() {
        this.init();
        this.run();
      }

      init() {
        wx._cacheCanvas = canvas;
        
        Laya.init(canvas, 750, 1334, Laya["WebGL"]);

        Laya.stage.screenMode = "vertical";
        Laya.stage.scaleMode = "noscale";
        Laya.stage.screenMode = "none";
        Laya.stage.alignV = "middle";
        Laya.stage.alignH = "center";
        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = true;
      }

      run() {
          var sp = new Laya.Sprite();
          Laya.stage.addChild(sp);
          //画直线
          sp.graphics.drawLine(10, 58, 375, 58, "#ffff00", 5);

          sp.width = 375;
          sp.height = 200;
          sp.on(Laya.Event.CLICK, this, this.showAni);
      }

      showAni() {
        var skeleton = new Laya.Skeleton();
        //添加到舞台
        Laya.stage.addChild(skeleton);
        skeleton.pos(400,800);
        skeleton.scale(0.7, 0.7);
        //通过加载直接创建动画
        skeleton.load("http://zmtest.rzcdz2.com/xiaoshuo/map-test/spine/laya/aar_hongbaotiaochu.sk", Laya.Handler.create(this, () => {
          skeleton.player.on(Laya.Event.STOPPED, this, () => {
            skeleton.removeSelf();
          });
          skeleton.play("play", false);
        }));
      }
  }

  new Test();
  
}