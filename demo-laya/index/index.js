const { layaWxInit } = require('../laya/laya.wxmini.js')
const { layaInit } = require('../laya/laya.core.js')
const { layaAniInit } = require('../laya/laya.ani.js')
const { layaUiInit } = require('../laya/laya.ui.js')
const { layaTest } = require('../test-cases/layatest')

const app = getApp()

Page({
  data: {
    isHidden: false
  },
  onShow: function () {
    this.setData({
      isHidden: false
    });
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
              layaWxInit();
              layaInit();
              layaAniInit();
              layaUiInit();
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
