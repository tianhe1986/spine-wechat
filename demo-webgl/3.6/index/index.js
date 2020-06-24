import { getSpine } from '../loaders/spine-webgl.js'

const { renderAnimation } = require('../test-cases/animation')

const app = getApp()

Page({
  data: {},
  onLoad: function () {
    wx.createSelectorQuery()
      .select('#webgl')
      .node().exec((res) => {

        const canvas = res[0].node;
        const dpr = wx.getSystemInfoSync().pixelRatio
        var width = canvas.width;
        var height = canvas.height;
        canvas.width = width * dpr
        canvas.height = height * dpr
        const spine = getSpine(canvas);
        renderAnimation(canvas, spine)
      })
  },
})
