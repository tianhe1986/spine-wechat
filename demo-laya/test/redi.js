// test/redi.js
const { layaWxInit } = require('../laya/laya.wxmini.js')
const { layaInit } = require('../laya/laya.core.js')
const { layaAniInit } = require('../laya/laya.ani.js')
const { layaUiInit } = require('../laya/laya.ui.js')
const { rediTest } = require('../test-cases/reditest')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHidden: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
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
              rediTest(canvas, canvas2d, canvasChar);
            });
        });
        
      });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

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
  }
})