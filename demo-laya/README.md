# 使用说明
基于Laya 2.2.0类库修改，目前暂时只做了2D webgl的部分适配，还在逐步完善中。当前测试过的功能有：
* 背景色设置。
* 文本，图片，图形绘制。
* 点击事件触发。
* spine动画播放。
* 跨页面使用。
* 不同适配模式。（暂不支持横竖屏）
* 简单scene加载处理。

跟在小游戏中不同，不能直接创建上屏Canvas，为了能在小程序中使用，作了些调整，具体使用步骤如下：
1. 在app.js中引入修改过的weapp-adapter.js。
2. 在需要使用的页面wxml中创建三个canvas，其中一个type为webgl，就是用来绘制的画布，宽高一定要设置好，之后是没法调整的，同样的，绑定的触发事件也要设置好，并在对应js中进行处理。另外两个type是2d，不用于实际展示，是协助进行2d绘制处理的。
3. 在上述页面对应的js中，引入调整过的Laya库文件，并调用相应方法进行全局初始化处理。例如：
```
const { layaWxInit } = require('../laya/laya.wxmini.js')
const { layaInit } = require('../laya/laya.core.js')
const { layaAniInit } = require('../laya/laya.ani.js')
const { layaUiInit } = require('../laya/laya.ui.js')

layaWxInit();
layaInit();
layaAniInit();
layaUiInit();
```

4. 在js中使用wx.createSelectorQuery获取第2步对应的三个canvas，假设获取到的webgl画布为canvas，另外两个2d画布分别为canvas2d和canvasChar。
5. 设置wx._cacheCanvas = canvas，这一步是很重要的，需要它来处理createImage
6. 初始化Laya，Laya.init方法变更为：
```
Laya.init(canvas, canvas2d, canvasChar, 1334, 750, Laya["WebGL"]);
```
就是需要将上述的画布传进去。其他的保持不变。
7. 接下来，正常的使用吧。

注意一点，从第3步开始的步骤，是每个需要使用Laya的页面都需要调用的，它会清除之前页面的绘制，重新初始化当前页面，建议放到页面onShow方法中。

具体demo见每个页面，有些页面会出错，是由于小程序的限制，atlas文件等是需要通过远程加载的，都放在了res文件夹下，实际处理的时候需要你自己搭建服务器，更改文件URL。

# 调整详情
我比较不喜欢两类人，一类是藏着掖着不肯拿出来分享，另一类是没有说明，直接来一句“自己看代码就知道作了哪些调整了”。而我要努力让自己不成为这两类人。

当然，你也可能想要一目了然的看作了哪些调整，那么，拿Laya 2.2.0的类库，以及发布成微信小游戏项目后生成的weapp-adapter.js文件跟此项目中的diff一下就好。

接下来，我会根据我的调整思路，说明下具体作的修改。

## 引入canvas
首先，渲染是基于canvas的，在小游戏中，可以通过wx.createCanvas来创建画布，但是，小程序不行，要用于绘制的画布，只能在wxml中定义，再通过createSelectorQuery获取。

这里多说一句，Laya中的用于绘制的canvas，是通过
`Browser.mainCanvas = new HTMLCanvas(true);`生成的，而它是调用
`Browser.createElement("canvas")`
, 再调用wxmini.js中的相应方法返回`MiniAdpter.window.canvas`。

而最终window.canvas是在weapp-adapter.js中通过wx.createCanvas创建的。

所以，我做的最基本的调整思路就是：把canvas传进去。也就是把Laya的init方法
```
init(width, height, ...plugins)
```
改成了
```
init(inputCanvas, input2dCanvas, inputCharCanvas, width, height, ...plugins)
```
而因为要一步步传进去，对应的HTMLCanvas等也做了相应的调整。

那么为啥要传3个canvas进来呢？第一个canvas就是用于绘制的主画布，而后面两个，需要用到它们的2d context， 小程序里有wx.createOffscreenCanvas接口，但是创建出来的离屏画布暂时不支持获取2d context，所以，只好用同样的方法，将支持的2d canvas也传进去。

引入之后，一个比较关键的修改是，将window.requestAnimationFrame改成canvas.requestAnimationFrame，也是根据小程序的文档说明来的。

同样的，还有canvas事件的触发，原来的小游戏中可以直接用wx.onTouchStart，这里必须通过canvas绑定来触发，因此我这里将触发事件时调用的方法缓存到了window中，然后在需要的时候调用，也就是为啥demo中需要给canvas绑定bindtouchstart等事件，在js中再调用window.XXX进行处理。

## 细微兼容调整
这一部分是列举了些细微的兼容调整，主要都是运行起来报错然后进行的修复，我这里列举一些吧：
* 小程序没有GameGlobal，增加var GameGlobal = wx，最终window对象会被加入其中，成为wx.window
* 小程序开发者工具也可以重定义window，使用统一处理即可。
* 之前window中的值都是只读，改为允许设置。
* wx.createCanvas改为wx.createOffscreenCanvas。
* wx.createImage改为调用canvas的createImage，但是这个不太好一步步传进来，因此改为使用wx._cacheCanvas.createImage()，这就是为啥需要使用说明中的第5步先设置一下。
* window不是全局对象，在调用之前先定义下var window = wx.window。
* 小程序的canvas没有style属性，注释掉对应的部分（本来也没用）

## 文本渲染处理
为什么单独拿出来说呢，因为在addCharCanvas方法碰到了这个报错
```
Failed to execute 'texSubImage2D' on 'WebGLRenderingContext': No function was found that matched the signature provided.
```
是由于小程序中的webgl实现的texSubImage2D，不支持直接将另一个canvas作为参数传入（类型不对），因此只好使用上面的addChar类似的方式进行处理。

这里还有另一个方法，就是将TextRender.isWan1Wan强制设置为false，就会直接走addChar内的处理了。但我没有这样做，是因为我尝试texSubImage2D直接将canvas作为参数使用，折腾了很久很久没有成功，很不高兴，脸都苦了，就想改掉它。

## 适配模式兼容
关于这一点，我觉得自己是不是有点矫枉过正了，本来Laya对于小游戏中noscale和showall模式就没有适配成[说明文档](https://ldc2.layabox.com/doc/?language=zh&nav=zh-ts-1-8-0)中的那样。

对于小程序中的canvas，我的感觉是，改变它的width和height，其实并不会改变它的实际宽高，而是它的逻辑宽高。

例如，假设设置它的width和height都是100，在其中绘制一个宽100，高100的正方形，那么这个正方形就是填充满整个canvas，而不管canvas实际宽高是多少。

官方2d示例中，一开始将canvas的宽高都乘上设备像素比pixelRatio，就是通过调整逻辑宽高使得渲染尺寸与物理像素大小一致，避免绘制时模糊。

在Stage的setScreenSize方法中，会根据计算出的canvasWidth和canvasHeight来重新设置canvas的逻辑宽高，问题就在这里了。

对于某些适配模式，它是应该直接设为screenWidth和screenHeight就好（实际效果就是类似官方示例中直接乘上pixelRatio）。

而setScreenSize方法中的canvas实际上是对原生canvas封装了一层的HTMLCanvas，它的宽高还有其他的作用，因此我给它的size方法增加了两个参数，用于额外设置原生canvas的width和height。

而在setScreenSize方法中，也增加了两个变量justCanvasWidth和justCanvasHeight，用来作为原生canvas要设置的参数。

在改了这部分之后，我发现设置画布对齐模式时，出来的效果仍旧跟文档说的有出入，研究后发现是stage的_canvasTransform中的tx和ty会在触发resize事件时被直接清0，也就不会有偏移了。

我抱着试一试的想法，想着“那我就把stage整个移动一下好了”，直接将这两者设置给stage的x和y，这样误打误撞居然真的达到了想要的效果。

## 支持重新初始化
以上的调整，在单个页面里是可以了，但是如果有多个页面呢？

小游戏当然没这问题，它就是一个页面，但小程序不一样，而且绘制必须绘制在每个页面的canvas上才行。

本来我的想法是给Laya增加个reinit方法的，但是感觉要在里面将数据恢复到初始状态，改起来恐怕工作量太大，那就，暴力一点，将整个Laya删掉重来好了。

因此我的做法是，将Laya全局初始化的过程封装成module方法，便于可随时调用，不过这里稍微有点麻烦，其他几个文件，例如wxmini，ani，ui等，也要同样的处理，全局初始化时得调用好几个方法。

然后，在Laya全局初始化时，先把之前已经在运行的整个Laya对象清除掉，这里我没有做太多的事，只是将之前运行的requestAnimationFrame停止，然后暴力的delete(window.Laya)，重新再来。

性能方面的测试我还没有做，如果影响比较大例如内存不会被回收，可能还是得想想其他办法。

# TODO
1. 普通2d渲染模式。
2. 3D适配调整。
3. 音频播放测试。
4. websocket测试。
5. 现有项目直接搬入小程序页面测试。
6. 性能测试。