const { layaTest } = require('../test-cases/layatest')

const app = getApp()

Page({
  data: {
    isHidden: false
  },
  onLoad: function () {
    wx.createSelectorQuery()
      .select('#test2d')
      .node().exec((res2d) => {
        const canvas2d = res2d[0].node;
        wx.createSelectorQuery()
        .select('#testchar')
        .node().exec((reschar) => {
          const canvasChar = reschar[0].node;
          wx.createSelectorQuery()
            .select('#webgl')
            .node().exec((res) => {
              this.setData({
                isHidden: true
              });
              const canvas = res[0].node;
              const dpr = wx.getSystemInfoSync().pixelRatio
              console.log(dpr, canvas.width);
              var width = canvas.width;
              var height = canvas.height;
              canvas.width = width * dpr
              canvas.height = height * dpr
              layaTest(canvas, canvas2d, canvasChar);
            });
        });
        
      });

    
  },

  doTouchStart(event) {
    wx.window.onTouchStart(event);
  },
  doTouchMove(event) {
    wx.window.onTouchMove(event);
  },
  doTouchEnd(event) {
    wx.window.onTouchEnd(event);
  },
  doTouchCancel(event) {
    wx.window.onTouchCancel(event);
  },
})
