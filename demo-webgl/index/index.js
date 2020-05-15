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
        const spine = getSpine(canvas);
        renderAnimation(canvas, spine)
      })
  },
})
