export function naviTest(canvas, canvas2d, canvasChar) {
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
        Laya.stage.bgColor = "black";
        Laya.stage.screenMode = "vertical";
        Laya.stage.scaleMode = "showall";
        Laya.stage.alignV = "middle";
        Laya.stage.alignH = "center";
        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = true;
      }

      run() {
          var sp = new Laya.Sprite();
          Laya.stage.addChild(sp);
          //画三角形
          sp.graphics.drawPoly(30, 28, [0, 100, 50, 0, 100, 100], "#ffff00");

          sp.width = 100;
          sp.height = 100;
          sp.on(Laya.Event.CLICK, this, this.showAni);

          var image = new Laya.Image("/res/0.png");
          Laya.stage.addChild(image);
          image.pos(400, 10);
          image.width = 350;
          image.height = 400;
          image.on(Laya.Event.CLICK, this, this.showAni);

          var text = new Laya.Text();
          text.fontSize = 60;
          text.text = "我王老五";
          text.color = "white";
          Laya.stage.addChild(text);
          text.pos(300, 600);
          text.on(Laya.Event.CLICK, this, this.showAni);

          var text = new Laya.Text();
          text.fontSize = 60;
          text.text = "我发热了我";
          text.color = "red";
          Laya.stage.addChild(text);
          text.pos(200, 1000);
          text.on(Laya.Event.CLICK, this, this.showAni);
      }

      showAni() {
        var skeleton = new Laya.Skeleton();
        //添加到舞台
        Laya.stage.addChild(skeleton);
        skeleton.pos(300,1000);
        skeleton.scale(0.8, 0.8);
        // 通过加载直接创建动画
        // 注意必须是远程加载才行，因此需要自己搭建web服务器
        skeleton.load("http://test.mine.cn/spine/spineboy.sk", Laya.Handler.create(this, () => {
          skeleton.player.on(Laya.Event.STOPPED, this, () => {
            skeleton.removeSelf();
          });
          skeleton.play("run", false);
        }));
      }
  }

  new Test();
  
}