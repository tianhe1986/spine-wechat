# spine动画在小程序中展示
由于目前公司项目的小游戏动画采用了spine动画，为了保持兼容性，研究了一下如何在小程序中进行展示。

首先，[原始运行库](https://github.com/EsotericSoftware/spine-runtimes)肯定是没法直接执行的，需要做一些调整。

我在这里将canvas以及webgl调整后的文件放在了spine-modify文件夹中，包括3.6, 3.7和3.8版本。相应展示的demo也分别放在了demo-canvas和demo-webgl文件夹下(动画模型文件放在了assets文件夹下，实际使用需要自己搭建网络)，也是基于两个版本的官方示例修改的。

~~但是奉劝一句，不要用canvas模式了，清晰度惨不忍睹，或许是有些配置参数需要调整优化，但是在默认情况下真的不能看。~~
我自己蠢忘了调设备像素比

~~webgl模式要好很多，但是相比于将spine动画导入layabox并播放，清晰度方面也还是要差一些。~~
跟上面一样蠢

## 运行库调整修改
虽然现在的demo可以直接运行，但是，授之以鱼不如授之以渔，说明怎么改才是正道，下面以spine-webgl为例，其实改动并不太多，可以对比spine-webgl和spine-webgl-ori查看其中的差异。

### 更改导出方式
首先，小程序用的是export/import形的语法，因此，最终需要将spine导出。

但是，在这里，我没有用导出spine的方式，而是将原先的整个js作为一个function导出。为什么呢？

因为里面用到了新建Image的操作，而非常不幸，小程序中，新建Image需要用canvas的createImage方法，也就是，需要有一个canvas实例。

所以，我这里将其封装成了`export function getSpine(canvas)`，支持调用时传入相应的canvas处理，最后return spine。

### Image创建
上面也提到了，原版用到了新建Image的操作`new Image()`以及`document.createElement("img")`，都需要改成`canvas.createImage()`。

### HTMLCanvasElement判断
原版中有一句`canvasOrContext instanceof HTMLCanvasElement`的判断，而小程序中是没有HTMLCanvasElement这个类的。

看后面的代码发现接下来对canvasOrContext调用的是getContext，那么，改成`canvasOrContext.getContext`就好了，虽然我也觉得这样改有些问题，但是，似乎这一句没有跑进去过。

### 增加XMLHttpRequest
对于网络的处理，用了XMLHttpRequest，但是没有，怎么办呢？那就从别处搬来好了。

我是观摩了[Three.js 小程序适配版](https://github.com/wechat-miniprogram/threejs-miniprogram)， 直接从其src文件中将XMLHttpRequest.js和EventTarget.js复制过来引入使用的。

# Laya导入使用
在文件夹中单独做了说明，见[这里](./demo-laya)