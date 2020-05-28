export function rediTest(canvas, canvas2d, canvasChar) {
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
        Laya.init(canvas, canvas2d, canvasChar, 1334, 750, Laya["WebGL"]);
        Laya.stage.bgColor = "#cccccc";
        Laya.stage.screenMode = "none";
        Laya.stage.scaleMode = "fixedheight";
        Laya.stage.alignV = "middle";
        Laya.stage.alignH = "center";
        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = true;
      }

      run() {
          var sp = new Laya.Sprite();
          Laya.stage.addChild(sp);
          //画正方
          sp.graphics.drawRect(20, 20, 100, 100, "#ffff00");

          sp.width = 100;
          sp.height = 100;
          sp.on(Laya.Event.CLICK, this, this.showAni);

          var image = new Laya.Image("/res/0.png");
          Laya.stage.addChild(image);
          image.pos(500, 200);
          image.width = 350;
          image.height = 200;
          image.on(Laya.Event.CLICK, this, this.showAni);

          var text = new Laya.Text();
          text.fontSize = 60;
          text.text = "张学友张学友";
          text.color = "black";
          Laya.stage.addChild(text);
          text.pos(300, 500);
          text.on(Laya.Event.CLICK, this, this.showAni);

          var text = new Laya.Text();
          text.fontSize = 60;
          text.text = "我爱黎明";
          text.color = "blue";
          Laya.stage.addChild(text);
          text.pos(1000, 600);
          text.on(Laya.Event.CLICK, this, this.showAni);
      }

      showAni() {
        var skeleton = new Laya.Skeleton();
        //添加到舞台
        Laya.stage.addChild(skeleton);
        skeleton.pos(700,500);
        skeleton.scale(0.6, 0.6);
        // 通过加载直接创建动画
        // 注意必须是远程加载才行，因此需要自己搭建web服务器
        skeleton.load("http://test.mine.cn/spine/spineboy.sk", Laya.Handler.create(this, () => {
          skeleton.player.on(Laya.Event.STOPPED, this, () => {
            skeleton.removeSelf();
          });
          skeleton.play("idle", false);
        }));
      }
  }

  new Test();
  
}