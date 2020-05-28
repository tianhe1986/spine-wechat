export function layaTest(canvas, canvas2d, canvasChar) {
  var Laya = wx.window.Laya;
  class Test {
      constructor() {
        this.init();
        this.run();
      }

      init() {
        wx._cacheCanvas = canvas;
        Laya.Config.isAlpha = true;
        // 传递的三个参数分别用于主画布，Browser额外画布，以及处理文字用画布
        Laya.init(canvas, canvas2d, canvasChar, 750, 1334, Laya["WebGL"]);
        Laya.stage.bgColor = "rgba(0, 0, 0, 0.3)";
        Laya.stage.screenMode = "none";
        Laya.stage.scaleMode = "showall";
        Laya.stage.alignV = "middle";
        Laya.stage.alignH = "right";
        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = true;
      }

      run() {
          var sp = new Laya.Sprite();
          Laya.stage.addChild(sp);
          //画直线
          sp.graphics.drawLine(10, 58, 750, 58, "#ffff00", 5);

          sp.width = 750;
          sp.height = 70;
          sp.on(Laya.Event.CLICK, this, this.showAni);

          var image = new Laya.Image("/res/0.png");
          Laya.stage.addChild(image);
          image.pos(100, 300);
          image.width = 300;
          image.height = 300;
          image.on(Laya.Event.CLICK, this, this.showAni);

          var text = new Laya.Text();
          text.fontSize = 48;
          text.text = "你这小家伙啊啊啊啊啊";
          text.color = "red";
          Laya.stage.addChild(text);
          text.pos(200, 700);
          text.on(Laya.Event.CLICK, this, this.showAni);

          var text = new Laya.Text();
          text.fontSize = 48;
          text.text = "你这大家伙呀呀呀呀呀";
          text.color = "blue";
          Laya.stage.addChild(text);
          text.pos(200, 1300);
          text.on(Laya.Event.CLICK, this, this.showAni);
      }

      showAni() {
        var skeleton = new Laya.Skeleton();
        //添加到舞台
        Laya.stage.addChild(skeleton);
        skeleton.pos(300,1000);
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

  new Test();
  
}