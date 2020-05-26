var window = wx.window;
var document = window.document;
window.Laya= (function (exports) {
    'use strict';

    class Config {
    }
    Config.animationInterval = 50;
    Config.isAntialias = false;
    Config.isAlpha = false;
    Config.premultipliedAlpha = true;
    Config.isStencil = true;
    Config.preserveDrawingBuffer = false;
    Config.webGL2D_MeshAllocMaxMem = true;
    Config.is2DPixelArtGame = false;
    Config.useWebGL2 = true;
    Config.useRetinalCanvas = false;
    window.Config = Config;

    class ILaya {
        static regClass(c) {
            ILaya.__classMap[c.name] = c;
        }
    }
    ILaya.Laya = null;
    ILaya.Timer = null;
    ILaya.WorkerLoader = null;
    ILaya.Dragging = null;
    ILaya.GraphicsBounds = null;
    ILaya.Sprite = null;
    ILaya.TextRender = null;
    ILaya.TextAtlas = null;
    ILaya.timer = null;
    ILaya.systemTimer = null;
    ILaya.startTimer = null;
    ILaya.updateTimer = null;
    ILaya.lateTimer = null;
    ILaya.physicsTimer = null;
    ILaya.stage = null;
    ILaya.Loader = null;
    ILaya.loader = null;
    ILaya.TTFLoader = null;
    ILaya.SoundManager = null;
    ILaya.WebAudioSound = null;
    ILaya.AudioSound = null;
    ILaya.ShaderCompile = null;
    ILaya.ClassUtils = null;
    ILaya.SceneUtils = null;
    ILaya.Context = null;
    ILaya.Render = null;
    ILaya.MouseManager = null;
    ILaya.Text = null;
    ILaya.Browser = null;
    ILaya.WebGL = null;
    ILaya.Pool = null;
    ILaya.Utils = null;
    ILaya.Graphics = null;
    ILaya.Submit = null;
    ILaya.Stage = null;
    ILaya.Resource = null;
    ILaya.__classMap = {};

    class Pool {
        static getPoolBySign(sign) {
            return Pool._poolDic[sign] || (Pool._poolDic[sign] = []);
        }
        static clearBySign(sign) {
            if (Pool._poolDic[sign])
                Pool._poolDic[sign].length = 0;
        }
        static recover(sign, item) {
            if (item[Pool.POOLSIGN])
                return;
            item[Pool.POOLSIGN] = true;
            Pool.getPoolBySign(sign).push(item);
        }
        static recoverByClass(instance) {
            if (instance) {
                var className = instance["__className"] || instance.constructor._$gid;
                if (className)
                    Pool.recover(className, instance);
            }
        }
        static _getClassSign(cla) {
            var className = cla["__className"] || cla["_$gid"];
            if (!className) {
                cla["_$gid"] = className = Pool._CLSID + "";
                Pool._CLSID++;
            }
            return className;
        }
        static createByClass(cls) {
            return Pool.getItemByClass(Pool._getClassSign(cls), cls);
        }
        static getItemByClass(sign, cls) {
            if (!Pool._poolDic[sign])
                return new cls();
            var pool = Pool.getPoolBySign(sign);
            if (pool.length) {
                var rst = pool.pop();
                rst[Pool.POOLSIGN] = false;
            }
            else {
                rst = new cls();
            }
            return rst;
        }
        static getItemByCreateFun(sign, createFun, caller = null) {
            var pool = Pool.getPoolBySign(sign);
            var rst = pool.length ? pool.pop() : createFun.call(caller);
            rst[Pool.POOLSIGN] = false;
            return rst;
        }
        static getItem(sign) {
            var pool = Pool.getPoolBySign(sign);
            var rst = pool.length ? pool.pop() : null;
            if (rst) {
                rst[Pool.POOLSIGN] = false;
            }
            return rst;
        }
    }
    Pool._CLSID = 0;
    Pool.POOLSIGN = "__InPool";
    Pool._poolDic = {};

    class AlphaCmd {
        static create(alpha) {
            var cmd = Pool.getItemByClass("AlphaCmd", AlphaCmd);
            cmd.alpha = alpha;
            return cmd;
        }
        recover() {
            Pool.recover("AlphaCmd", this);
        }
        run(context, gx, gy) {
            context.alpha(this.alpha);
        }
        get cmdID() {
            return AlphaCmd.ID;
        }
    }
    AlphaCmd.ID = "Alpha";

    class DrawCircleCmd {
        static create(x, y, radius, fillColor, lineColor, lineWidth, vid) {
            var cmd = Pool.getItemByClass("DrawCircleCmd", DrawCircleCmd);
            cmd.x = x;
            cmd.y = y;
            cmd.radius = radius;
            cmd.fillColor = fillColor;
            cmd.lineColor = lineColor;
            cmd.lineWidth = lineWidth;
            cmd.vid = vid;
            return cmd;
        }
        recover() {
            this.fillColor = null;
            this.lineColor = null;
            Pool.recover("DrawCircleCmd", this);
        }
        run(context, gx, gy) {
            context._drawCircle(this.x + gx, this.y + gy, this.radius, this.fillColor, this.lineColor, this.lineWidth, this.vid);
        }
        get cmdID() {
            return DrawCircleCmd.ID;
        }
    }
    DrawCircleCmd.ID = "DrawCircle";

    class DrawCurvesCmd {
        static create(x, y, points, lineColor, lineWidth) {
            var cmd = Pool.getItemByClass("DrawCurvesCmd", DrawCurvesCmd);
            cmd.x = x;
            cmd.y = y;
            cmd.points = points;
            cmd.lineColor = lineColor;
            cmd.lineWidth = lineWidth;
            return cmd;
        }
        recover() {
            this.points = null;
            this.lineColor = null;
            Pool.recover("DrawCurvesCmd", this);
        }
        run(context, gx, gy) {
            context.drawCurves(this.x + gx, this.y + gy, this.points, this.lineColor, this.lineWidth);
        }
        get cmdID() {
            return DrawCurvesCmd.ID;
        }
    }
    DrawCurvesCmd.ID = "DrawCurves";

    class DrawImageCmd {
        static create(texture, x, y, width, height) {
            var cmd = Pool.getItemByClass("DrawImageCmd", DrawImageCmd);
            cmd.texture = texture;
            texture._addReference();
            cmd.x = x;
            cmd.y = y;
            cmd.width = width;
            cmd.height = height;
            return cmd;
        }
        recover() {
            this.texture._removeReference();
            this.texture = null;
            Pool.recover("DrawImageCmd", this);
        }
        run(context, gx, gy) {
            context.drawTexture(this.texture, this.x + gx, this.y + gy, this.width, this.height);
        }
        get cmdID() {
            return DrawImageCmd.ID;
        }
    }
    DrawImageCmd.ID = "DrawImage";

    class DrawLineCmd {
        static create(fromX, fromY, toX, toY, lineColor, lineWidth, vid) {
            var cmd = Pool.getItemByClass("DrawLineCmd", DrawLineCmd);
            cmd.fromX = fromX;
            cmd.fromY = fromY;
            cmd.toX = toX;
            cmd.toY = toY;
            cmd.lineColor = lineColor;
            cmd.lineWidth = lineWidth;
            cmd.vid = vid;
            return cmd;
        }
        recover() {
            Pool.recover("DrawLineCmd", this);
        }
        run(context, gx, gy) {
            context._drawLine(gx, gy, this.fromX, this.fromY, this.toX, this.toY, this.lineColor, this.lineWidth, this.vid);
        }
        get cmdID() {
            return DrawLineCmd.ID;
        }
    }
    DrawLineCmd.ID = "DrawLine";

    class DrawLinesCmd {
        static create(x, y, points, lineColor, lineWidth, vid) {
            var cmd = Pool.getItemByClass("DrawLinesCmd", DrawLinesCmd);
            cmd.x = x;
            cmd.y = y;
            cmd.points = points;
            cmd.lineColor = lineColor;
            cmd.lineWidth = lineWidth;
            cmd.vid = vid;
            return cmd;
        }
        recover() {
            this.points = null;
            this.lineColor = null;
            Pool.recover("DrawLinesCmd", this);
        }
        run(context, gx, gy) {
            context._drawLines(this.x + gx, this.y + gy, this.points, this.lineColor, this.lineWidth, this.vid);
        }
        get cmdID() {
            return DrawLinesCmd.ID;
        }
    }
    DrawLinesCmd.ID = "DrawLines";

    class DrawPathCmd {
        static create(x, y, paths, brush, pen) {
            var cmd = Pool.getItemByClass("DrawPathCmd", DrawPathCmd);
            cmd.x = x;
            cmd.y = y;
            cmd.paths = paths;
            cmd.brush = brush;
            cmd.pen = pen;
            return cmd;
        }
        recover() {
            this.paths = null;
            this.brush = null;
            this.pen = null;
            Pool.recover("DrawPathCmd", this);
        }
        run(context, gx, gy) {
            context._drawPath(this.x + gx, this.y + gy, this.paths, this.brush, this.pen);
        }
        get cmdID() {
            return DrawPathCmd.ID;
        }
    }
    DrawPathCmd.ID = "DrawPath";

    class DrawPieCmd {
        static create(x, y, radius, startAngle, endAngle, fillColor, lineColor, lineWidth, vid) {
            var cmd = Pool.getItemByClass("DrawPieCmd", DrawPieCmd);
            cmd.x = x;
            cmd.y = y;
            cmd.radius = radius;
            cmd._startAngle = startAngle;
            cmd._endAngle = endAngle;
            cmd.fillColor = fillColor;
            cmd.lineColor = lineColor;
            cmd.lineWidth = lineWidth;
            cmd.vid = vid;
            return cmd;
        }
        recover() {
            this.fillColor = null;
            this.lineColor = null;
            Pool.recover("DrawPieCmd", this);
        }
        run(context, gx, gy) {
            context._drawPie(this.x + gx, this.y + gy, this.radius, this._startAngle, this._endAngle, this.fillColor, this.lineColor, this.lineWidth, this.vid);
        }
        get cmdID() {
            return DrawPieCmd.ID;
        }
        get startAngle() {
            return this._startAngle * 180 / Math.PI;
        }
        set startAngle(value) {
            this._startAngle = value * Math.PI / 180;
        }
        get endAngle() {
            return this._endAngle * 180 / Math.PI;
        }
        set endAngle(value) {
            this._endAngle = value * Math.PI / 180;
        }
    }
    DrawPieCmd.ID = "DrawPie";

    class DrawPolyCmd {
        static create(x, y, points, fillColor, lineColor, lineWidth, isConvexPolygon, vid) {
            var cmd = Pool.getItemByClass("DrawPolyCmd", DrawPolyCmd);
            cmd.x = x;
            cmd.y = y;
            cmd.points = points;
            cmd.fillColor = fillColor;
            cmd.lineColor = lineColor;
            cmd.lineWidth = lineWidth;
            cmd.isConvexPolygon = isConvexPolygon;
            cmd.vid = vid;
            return cmd;
        }
        recover() {
            this.points = null;
            this.fillColor = null;
            this.lineColor = null;
            Pool.recover("DrawPolyCmd", this);
        }
        run(context, gx, gy) {
            context._drawPoly(this.x + gx, this.y + gy, this.points, this.fillColor, this.lineColor, this.lineWidth, this.isConvexPolygon, this.vid);
        }
        get cmdID() {
            return DrawPolyCmd.ID;
        }
    }
    DrawPolyCmd.ID = "DrawPoly";

    class DrawRectCmd {
        static create(x, y, width, height, fillColor, lineColor, lineWidth) {
            var cmd = Pool.getItemByClass("DrawRectCmd", DrawRectCmd);
            cmd.x = x;
            cmd.y = y;
            cmd.width = width;
            cmd.height = height;
            cmd.fillColor = fillColor;
            cmd.lineColor = lineColor;
            cmd.lineWidth = lineWidth;
            return cmd;
        }
        recover() {
            this.fillColor = null;
            this.lineColor = null;
            Pool.recover("DrawRectCmd", this);
        }
        run(context, gx, gy) {
            context.drawRect(this.x + gx, this.y + gy, this.width, this.height, this.fillColor, this.lineColor, this.lineWidth);
        }
        get cmdID() {
            return DrawRectCmd.ID;
        }
    }
    DrawRectCmd.ID = "DrawRect";

    class Matrix {
        constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0, nums = 0) {
            this._bTransform = false;
            if (Matrix._createFun != null) {
                return Matrix._createFun(a, b, c, d, tx, ty, nums);
            }
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
            this._checkTransform();
        }
        identity() {
            this.a = this.d = 1;
            this.b = this.tx = this.ty = this.c = 0;
            this._bTransform = false;
            return this;
        }
        _checkTransform() {
            return this._bTransform = (this.a !== 1 || this.b !== 0 || this.c !== 0 || this.d !== 1);
        }
        setTranslate(x, y) {
            this.tx = x;
            this.ty = y;
            return this;
        }
        translate(x, y) {
            this.tx += x;
            this.ty += y;
            return this;
        }
        scale(x, y) {
            this.a *= x;
            this.d *= y;
            this.c *= x;
            this.b *= y;
            this.tx *= x;
            this.ty *= y;
            this._bTransform = true;
            return this;
        }
        rotate(angle) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            var a1 = this.a;
            var c1 = this.c;
            var tx1 = this.tx;
            this.a = a1 * cos - this.b * sin;
            this.b = a1 * sin + this.b * cos;
            this.c = c1 * cos - this.d * sin;
            this.d = c1 * sin + this.d * cos;
            this.tx = tx1 * cos - this.ty * sin;
            this.ty = tx1 * sin + this.ty * cos;
            this._bTransform = true;
            return this;
        }
        skew(x, y) {
            var tanX = Math.tan(x);
            var tanY = Math.tan(y);
            var a1 = this.a;
            var b1 = this.b;
            this.a += tanY * this.c;
            this.b += tanY * this.d;
            this.c += tanX * a1;
            this.d += tanX * b1;
            return this;
        }
        invertTransformPoint(out) {
            var a1 = this.a;
            var b1 = this.b;
            var c1 = this.c;
            var d1 = this.d;
            var tx1 = this.tx;
            var n = a1 * d1 - b1 * c1;
            var a2 = d1 / n;
            var b2 = -b1 / n;
            var c2 = -c1 / n;
            var d2 = a1 / n;
            var tx2 = (c1 * this.ty - d1 * tx1) / n;
            var ty2 = -(a1 * this.ty - b1 * tx1) / n;
            return out.setTo(a2 * out.x + c2 * out.y + tx2, b2 * out.x + d2 * out.y + ty2);
        }
        transformPoint(out) {
            return out.setTo(this.a * out.x + this.c * out.y + this.tx, this.b * out.x + this.d * out.y + this.ty);
        }
        transformPointN(out) {
            return out.setTo(this.a * out.x + this.c * out.y, this.b * out.x + this.d * out.y);
        }
        getScaleX() {
            return this.b === 0 ? this.a : Math.sqrt(this.a * this.a + this.b * this.b);
        }
        getScaleY() {
            return this.c === 0 ? this.d : Math.sqrt(this.c * this.c + this.d * this.d);
        }
        invert() {
            var a1 = this.a;
            var b1 = this.b;
            var c1 = this.c;
            var d1 = this.d;
            var tx1 = this.tx;
            var n = a1 * d1 - b1 * c1;
            this.a = d1 / n;
            this.b = -b1 / n;
            this.c = -c1 / n;
            this.d = a1 / n;
            this.tx = (c1 * this.ty - d1 * tx1) / n;
            this.ty = -(a1 * this.ty - b1 * tx1) / n;
            return this;
        }
        setTo(a, b, c, d, tx, ty) {
            this.a = a, this.b = b, this.c = c, this.d = d, this.tx = tx, this.ty = ty;
            return this;
        }
        concat(matrix) {
            var a = this.a;
            var c = this.c;
            var tx = this.tx;
            this.a = a * matrix.a + this.b * matrix.c;
            this.b = a * matrix.b + this.b * matrix.d;
            this.c = c * matrix.a + this.d * matrix.c;
            this.d = c * matrix.b + this.d * matrix.d;
            this.tx = tx * matrix.a + this.ty * matrix.c + matrix.tx;
            this.ty = tx * matrix.b + this.ty * matrix.d + matrix.ty;
            return this;
        }
        static mul(m1, m2, out) {
            var aa = m1.a, ab = m1.b, ac = m1.c, ad = m1.d, atx = m1.tx, aty = m1.ty;
            var ba = m2.a, bb = m2.b, bc = m2.c, bd = m2.d, btx = m2.tx, bty = m2.ty;
            if (bb !== 0 || bc !== 0) {
                out.a = aa * ba + ab * bc;
                out.b = aa * bb + ab * bd;
                out.c = ac * ba + ad * bc;
                out.d = ac * bb + ad * bd;
                out.tx = ba * atx + bc * aty + btx;
                out.ty = bb * atx + bd * aty + bty;
            }
            else {
                out.a = aa * ba;
                out.b = ab * bd;
                out.c = ac * ba;
                out.d = ad * bd;
                out.tx = ba * atx + btx;
                out.ty = bd * aty + bty;
            }
            return out;
        }
        static mul16(m1, m2, out) {
            var aa = m1.a, ab = m1.b, ac = m1.c, ad = m1.d, atx = m1.tx, aty = m1.ty;
            var ba = m2.a, bb = m2.b, bc = m2.c, bd = m2.d, btx = m2.tx, bty = m2.ty;
            if (bb !== 0 || bc !== 0) {
                out[0] = aa * ba + ab * bc;
                out[1] = aa * bb + ab * bd;
                out[4] = ac * ba + ad * bc;
                out[5] = ac * bb + ad * bd;
                out[12] = ba * atx + bc * aty + btx;
                out[13] = bb * atx + bd * aty + bty;
            }
            else {
                out[0] = aa * ba;
                out[1] = ab * bd;
                out[4] = ac * ba;
                out[5] = ad * bd;
                out[12] = ba * atx + btx;
                out[13] = bd * aty + bty;
            }
            return out;
        }
        scaleEx(x, y) {
            var ba = this.a, bb = this.b, bc = this.c, bd = this.d;
            if (bb !== 0 || bc !== 0) {
                this.a = x * ba;
                this.b = x * bb;
                this.c = y * bc;
                this.d = y * bd;
            }
            else {
                this.a = x * ba;
                this.b = 0 * bd;
                this.c = 0 * ba;
                this.d = y * bd;
            }
            this._bTransform = true;
        }
        rotateEx(angle) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            var ba = this.a, bb = this.b, bc = this.c, bd = this.d;
            if (bb !== 0 || bc !== 0) {
                this.a = cos * ba + sin * bc;
                this.b = cos * bb + sin * bd;
                this.c = -sin * ba + cos * bc;
                this.d = -sin * bb + cos * bd;
            }
            else {
                this.a = cos * ba;
                this.b = sin * bd;
                this.c = -sin * ba;
                this.d = cos * bd;
            }
            this._bTransform = true;
        }
        clone() {
            var dec = Matrix.create();
            dec.a = this.a;
            dec.b = this.b;
            dec.c = this.c;
            dec.d = this.d;
            dec.tx = this.tx;
            dec.ty = this.ty;
            dec._bTransform = this._bTransform;
            return dec;
        }
        copyTo(dec) {
            dec.a = this.a;
            dec.b = this.b;
            dec.c = this.c;
            dec.d = this.d;
            dec.tx = this.tx;
            dec.ty = this.ty;
            dec._bTransform = this._bTransform;
            return dec;
        }
        toString() {
            return this.a + "," + this.b + "," + this.c + "," + this.d + "," + this.tx + "," + this.ty;
        }
        destroy() {
            this.recover();
        }
        recover() {
            Pool.recover("Matrix", this.identity());
        }
        static create() {
            return Pool.getItemByClass("Matrix", Matrix);
        }
    }
    Matrix.EMPTY = new Matrix();
    Matrix.TEMP = new Matrix();
    Matrix._createFun = null;

    class Point {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        static create() {
            return Pool.getItemByClass("Point", Point);
        }
        setTo(x, y) {
            this.x = x;
            this.y = y;
            return this;
        }
        reset() {
            this.x = this.y = 0;
            return this;
        }
        recover() {
            Pool.recover("Point", this.reset());
        }
        distance(x, y) {
            return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
        }
        toString() {
            return this.x + "," + this.y;
        }
        normalize() {
            var d = Math.sqrt(this.x * this.x + this.y * this.y);
            if (d > 0) {
                var id = 1.0 / d;
                this.x *= id;
                this.y *= id;
            }
        }
        copy(point) {
            return this.setTo(point.x, point.y);
        }
    }
    Point.TEMP = new Point();
    Point.EMPTY = new Point();

    class Rectangle {
        constructor(x = 0, y = 0, width = 0, height = 0) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        get right() {
            return this.x + this.width;
        }
        get bottom() {
            return this.y + this.height;
        }
        setTo(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            return this;
        }
        reset() {
            this.x = this.y = this.width = this.height = 0;
            return this;
        }
        recover() {
            if (this == Rectangle.TEMP || this == Rectangle.EMPTY) {
                console.log("recover Temp or Empty:", this);
                return;
            }
            Pool.recover("Rectangle", this.reset());
        }
        static create() {
            return Pool.getItemByClass("Rectangle", Rectangle);
        }
        copyFrom(source) {
            this.x = source.x;
            this.y = source.y;
            this.width = source.width;
            this.height = source.height;
            return this;
        }
        contains(x, y) {
            if (this.width <= 0 || this.height <= 0)
                return false;
            if (x >= this.x && x < this.right) {
                if (y >= this.y && y < this.bottom) {
                    return true;
                }
            }
            return false;
        }
        intersects(rect) {
            return !(rect.x > (this.x + this.width) || (rect.x + rect.width) < this.x || rect.y > (this.y + this.height) || (rect.y + rect.height) < this.y);
        }
        intersection(rect, out = null) {
            if (!this.intersects(rect))
                return null;
            out || (out = new Rectangle());
            out.x = Math.max(this.x, rect.x);
            out.y = Math.max(this.y, rect.y);
            out.width = Math.min(this.right, rect.right) - out.x;
            out.height = Math.min(this.bottom, rect.bottom) - out.y;
            return out;
        }
        union(source, out = null) {
            out || (out = new Rectangle());
            this.clone(out);
            if (source.width <= 0 || source.height <= 0)
                return out;
            out.addPoint(source.x, source.y);
            out.addPoint(source.right, source.bottom);
            return this;
        }
        clone(out = null) {
            out || (out = new Rectangle());
            out.x = this.x;
            out.y = this.y;
            out.width = this.width;
            out.height = this.height;
            return out;
        }
        toString() {
            return this.x + "," + this.y + "," + this.width + "," + this.height;
        }
        equals(rect) {
            if (!rect || rect.x !== this.x || rect.y !== this.y || rect.width !== this.width || rect.height !== this.height)
                return false;
            return true;
        }
        addPoint(x, y) {
            this.x > x && (this.width += this.x - x, this.x = x);
            this.y > y && (this.height += this.y - y, this.y = y);
            if (this.width < x - this.x)
                this.width = x - this.x;
            if (this.height < y - this.y)
                this.height = y - this.y;
            return this;
        }
        _getBoundPoints() {
            var rst = Rectangle._temB;
            rst.length = 0;
            if (this.width == 0 || this.height == 0)
                return rst;
            rst.push(this.x, this.y, this.x + this.width, this.y, this.x, this.y + this.height, this.x + this.width, this.y + this.height);
            return rst;
        }
        static _getBoundPointS(x, y, width, height) {
            var rst = Rectangle._temA;
            rst.length = 0;
            if (width == 0 || height == 0)
                return rst;
            rst.push(x, y, x + width, y, x, y + height, x + width, y + height);
            return rst;
        }
        static _getWrapRec(pointList, rst = null) {
            if (!pointList || pointList.length < 1)
                return rst ? rst.setTo(0, 0, 0, 0) : Rectangle.TEMP.setTo(0, 0, 0, 0);
            rst = rst ? rst : Rectangle.create();
            var i, len = pointList.length, minX, maxX, minY, maxY, tPoint = Point.TEMP;
            minX = minY = 99999;
            maxX = maxY = -minX;
            for (i = 0; i < len; i += 2) {
                tPoint.x = pointList[i];
                tPoint.y = pointList[i + 1];
                minX = minX < tPoint.x ? minX : tPoint.x;
                minY = minY < tPoint.y ? minY : tPoint.y;
                maxX = maxX > tPoint.x ? maxX : tPoint.x;
                maxY = maxY > tPoint.y ? maxY : tPoint.y;
            }
            return rst.setTo(minX, minY, maxX - minX, maxY - minY);
        }
        isEmpty() {
            if (this.width <= 0 || this.height <= 0)
                return true;
            return false;
        }
    }
    Rectangle.EMPTY = new Rectangle();
    Rectangle.TEMP = new Rectangle();
    Rectangle._temB = [];
    Rectangle._temA = [];

    class LayaGL {
    }
    LayaGL.ARRAY_BUFFER_TYPE_DATA = 0;
    LayaGL.ARRAY_BUFFER_TYPE_CMD = 1;
    LayaGL.ARRAY_BUFFER_REF_REFERENCE = 0;
    LayaGL.ARRAY_BUFFER_REF_COPY = 1;
    LayaGL.UPLOAD_SHADER_UNIFORM_TYPE_ID = 0;
    LayaGL.UPLOAD_SHADER_UNIFORM_TYPE_DATA = 1;

    class Handler {
        constructor(caller = null, method = null, args = null, once = false) {
            this.once = false;
            this._id = 0;
            this.setTo(caller, method, args, once);
        }
        setTo(caller, method, args, once) {
            this._id = Handler._gid++;
            this.caller = caller;
            this.method = method;
            this.args = args;
            this.once = once;
            return this;
        }
        run() {
            if (this.method == null)
                return null;
            var id = this._id;
            var result = this.method.apply(this.caller, this.args);
            this._id === id && this.once && this.recover();
            return result;
        }
        runWith(data) {
            if (this.method == null)
                return null;
            var id = this._id;
            if (data == null)
                var result = this.method.apply(this.caller, this.args);
            else if (!this.args && !data.unshift)
                result = this.method.call(this.caller, data);
            else if (this.args)
                result = this.method.apply(this.caller, this.args.concat(data));
            else
                result = this.method.apply(this.caller, data);
            this._id === id && this.once && this.recover();
            return result;
        }
        clear() {
            this.caller = null;
            this.method = null;
            this.args = null;
            return this;
        }
        recover() {
            if (this._id > 0) {
                this._id = 0;
                Handler._pool.push(this.clear());
            }
        }
        static create(caller, method, args = null, once = true) {
            if (Handler._pool.length)
                return Handler._pool.pop().setTo(caller, method, args, once);
            return new Handler(caller, method, args, once);
        }
    }
    Handler._pool = [];
    Handler._gid = 1;

    class EventDispatcher {
        hasListener(type) {
            var listener = this._events && this._events[type];
            return !!listener;
        }
        event(type, data = null) {
            if (!this._events || !this._events[type])
                return false;
            var listeners = this._events[type];
            if (listeners.run) {
                if (listeners.once)
                    delete this._events[type];
                data != null ? listeners.runWith(data) : listeners.run();
            }
            else {
                for (var i = 0, n = listeners.length; i < n; i++) {
                    var listener = listeners[i];
                    if (listener) {
                        (data != null) ? listener.runWith(data) : listener.run();
                    }
                    if (!listener || listener.once) {
                        listeners.splice(i, 1);
                        i--;
                        n--;
                    }
                }
                if (listeners.length === 0 && this._events)
                    delete this._events[type];
            }
            return true;
        }
        on(type, caller, listener, args = null) {
            return this._createListener(type, caller, listener, args, false);
        }
        once(type, caller, listener, args = null) {
            return this._createListener(type, caller, listener, args, true);
        }
        _createListener(type, caller, listener, args, once, offBefore = true) {
            offBefore && this.off(type, caller, listener, once);
            var handler = EventHandler.create(caller || this, listener, args, once);
            this._events || (this._events = {});
            var events = this._events;
            if (!events[type])
                events[type] = handler;
            else {
                if (!events[type].run)
                    events[type].push(handler);
                else
                    events[type] = [events[type], handler];
            }
            return this;
        }
        off(type, caller, listener, onceOnly = false) {
            if (!this._events || !this._events[type])
                return this;
            var listeners = this._events[type];
            if (listeners != null) {
                if (listeners.run) {
                    if ((!caller || listeners.caller === caller) && (listener == null || listeners.method === listener) && (!onceOnly || listeners.once)) {
                        delete this._events[type];
                        listeners.recover();
                    }
                }
                else {
                    var count = 0;
                    for (var i = 0, n = listeners.length; i < n; i++) {
                        var item = listeners[i];
                        if (!item) {
                            count++;
                            continue;
                        }
                        if (item && (!caller || item.caller === caller) && (listener == null || item.method === listener) && (!onceOnly || item.once)) {
                            count++;
                            listeners[i] = null;
                            item.recover();
                        }
                    }
                    if (count === n)
                        delete this._events[type];
                }
            }
            return this;
        }
        offAll(type = null) {
            var events = this._events;
            if (!events)
                return this;
            if (type) {
                this._recoverHandlers(events[type]);
                delete events[type];
            }
            else {
                for (var name in events) {
                    this._recoverHandlers(events[name]);
                }
                this._events = null;
            }
            return this;
        }
        offAllCaller(caller) {
            if (caller && this._events) {
                for (var name in this._events) {
                    this.off(name, caller, null);
                }
            }
            return this;
        }
        _recoverHandlers(arr) {
            if (!arr)
                return;
            if (arr.run) {
                arr.recover();
            }
            else {
                for (var i = arr.length - 1; i > -1; i--) {
                    if (arr[i]) {
                        arr[i].recover();
                        arr[i] = null;
                    }
                }
            }
        }
        isMouseEvent(type) {
            return EventDispatcher.MOUSE_EVENTS[type] || false;
        }
    }
    EventDispatcher.MOUSE_EVENTS = { "rightmousedown": true, "rightmouseup": true, "rightclick": true, "mousedown": true, "mouseup": true, "mousemove": true, "mouseover": true, "mouseout": true, "click": true, "doubleclick": true };
    class EventHandler extends Handler {
        constructor(caller, method, args, once) {
            super(caller, method, args, once);
        }
        recover() {
            if (this._id > 0) {
                this._id = 0;
                EventHandler._pool.push(this.clear());
            }
        }
        static create(caller, method, args = null, once = true) {
            if (EventHandler._pool.length)
                return EventHandler._pool.pop().setTo(caller, method, args, once);
            return new EventHandler(caller, method, args, once);
        }
    }
    EventHandler._pool = [];

    class URL {
        constructor(url) {
            this._url = URL.formatURL(url);
            this._path = URL.getPath(url);
        }
        get url() {
            return this._url;
        }
        get path() {
            return this._path;
        }
        static set basePath(value) {
            URL._basePath = ILaya.Laya._getUrlPath();
            URL._basePath = URL.formatURL(value);
        }
        static get basePath() {
            return URL._basePath;
        }
        static formatURL(url) {
            if (!url)
                return "null path";
            if (url.indexOf(":") > 0)
                return url;
            if (URL.customFormat != null)
                url = URL.customFormat(url);
            if (url.indexOf(":") > 0)
                return url;
            var char1 = url.charAt(0);
            if (char1 === ".") {
                return URL._formatRelativePath(URL._basePath + url);
            }
            else if (char1 === '~') {
                return URL.rootPath + url.substring(1);
            }
            else if (char1 === "d") {
                if (url.indexOf("data:image") === 0)
                    return url;
            }
            else if (char1 === "/") {
                return url;
            }
            return URL._basePath + url;
        }
        static _formatRelativePath(value) {
            var parts = value.split("/");
            for (var i = 0, len = parts.length; i < len; i++) {
                if (parts[i] == '..') {
                    parts.splice(i - 1, 2);
                    i -= 2;
                }
            }
            return parts.join('/');
        }
        static getPath(url) {
            var ofs = url.lastIndexOf('/');
            return ofs > 0 ? url.substr(0, ofs + 1) : "";
        }
        static getFileName(url) {
            var ofs = url.lastIndexOf('/');
            return ofs > 0 ? url.substr(ofs + 1) : url;
        }
        static getAdptedFilePath(url) {
            if (!URL.exportSceneToJson || !url)
                return url;
            var i, len;
            len = URL._adpteTypeList.length;
            var tArr;
            for (i = 0; i < len; i++) {
                tArr = URL._adpteTypeList[i];
                url = url.replace(tArr[0], tArr[1]);
            }
            return url;
        }
    }
    URL.version = {};
    URL.exportSceneToJson = false;
    URL._basePath = "";
    URL.rootPath = "";
    URL.customFormat = function (url) {
        var newUrl = URL.version[url];
        if (!window.conch && newUrl)
            url += "?v=" + newUrl;
        return url;
    };
    URL._adpteTypeList = [[".scene3d", ".json"], [".scene", ".json"], [".taa", ".json"], [".prefab", ".json"]];

    class Resource extends EventDispatcher {
        constructor() {
            super();
            this._id = 0;
            this._url = null;
            this._cpuMemory = 0;
            this._gpuMemory = 0;
            this._destroyed = false;
            this._referenceCount = 0;
            this.lock = false;
            this.name = null;
            this._id = ++Resource._uniqueIDCounter;
            this._destroyed = false;
            this._referenceCount = 0;
            Resource._idResourcesMap[this.id] = this;
            this.lock = false;
        }
        static get cpuMemory() {
            return Resource._cpuMemory;
        }
        static get gpuMemory() {
            return Resource._gpuMemory;
        }
        static _addCPUMemory(size) {
            Resource._cpuMemory += size;
        }
        static _addGPUMemory(size) {
            Resource._gpuMemory += size;
        }
        static _addMemory(cpuSize, gpuSize) {
            Resource._cpuMemory += cpuSize;
            Resource._gpuMemory += gpuSize;
        }
        static getResourceByID(id) {
            return Resource._idResourcesMap[id];
        }
        static getResourceByURL(url, index = 0) {
            return Resource._urlResourcesMap[url][index];
        }
        static destroyUnusedResources() {
            for (var k in Resource._idResourcesMap) {
                var res = Resource._idResourcesMap[k];
                if (!res.lock && res._referenceCount === 0)
                    res.destroy();
            }
        }
        get id() {
            return this._id;
        }
        get url() {
            return this._url;
        }
        get cpuMemory() {
            return this._cpuMemory;
        }
        get gpuMemory() {
            return this._gpuMemory;
        }
        get destroyed() {
            return this._destroyed;
        }
        get referenceCount() {
            return this._referenceCount;
        }
        _setCPUMemory(value) {
            var offsetValue = value - this._cpuMemory;
            this._cpuMemory = value;
            Resource._addCPUMemory(offsetValue);
        }
        _setGPUMemory(value) {
            var offsetValue = value - this._gpuMemory;
            this._gpuMemory = value;
            Resource._addGPUMemory(offsetValue);
        }
        _setCreateURL(url) {
            url = URL.formatURL(url);
            if (this._url !== url) {
                var resList;
                if (this._url) {
                    resList = Resource._urlResourcesMap[this._url];
                    resList.splice(resList.indexOf(this), 1);
                    (resList.length === 0) && (delete Resource._urlResourcesMap[this._url]);
                }
                if (url) {
                    resList = Resource._urlResourcesMap[url];
                    (resList) || (Resource._urlResourcesMap[url] = resList = []);
                    resList.push(this);
                }
                this._url = url;
            }
        }
        _addReference(count = 1) {
            this._referenceCount += count;
        }
        _removeReference(count = 1) {
            this._referenceCount -= count;
        }
        _clearReference() {
            this._referenceCount = 0;
        }
        _recoverResource() {
        }
        _disposeResource() {
        }
        _activeResource() {
        }
        destroy() {
            if (this._destroyed)
                return;
            this._destroyed = true;
            this.lock = false;
            this._disposeResource();
            delete Resource._idResourcesMap[this.id];
            var resList;
            if (this._url) {
                resList = Resource._urlResourcesMap[this._url];
                if (resList) {
                    resList.splice(resList.indexOf(this), 1);
                    (resList.length === 0) && (delete Resource._urlResourcesMap[this._url]);
                }
                var resou = ILaya.Loader.getRes(this._url);
                (resou == this) && (delete ILaya.Loader.loadedMap[this._url]);
            }
        }
    }
    Resource._uniqueIDCounter = 0;
    Resource._idResourcesMap = {};
    Resource._urlResourcesMap = {};
    Resource._cpuMemory = 0;
    Resource._gpuMemory = 0;

    class Bitmap extends Resource {
        get width() {
            return this._width;
        }
        set width(width) {
            this._width = width;
        }
        get height() {
            return this._height;
        }
        set height(height) {
            this._height = height;
        }
        constructor() {
            super();
            this._width = -1;
            this._height = -1;
        }
        _getSource() {
            throw "Bitmap: must override it.";
        }
    }

    class WebGLContext {
        static __init__() {
            var gl = LayaGL.instance;
            WebGLContext._depthFunc = gl.LESS;
            WebGLContext._sFactor = gl.ONE;
            WebGLContext._dFactor = gl.ZERO;
            WebGLContext._srcAlpha = gl.ONE;
            WebGLContext._dstAlpha = gl.ZERO;
            WebGLContext._activedTextureID = gl.TEXTURE0;
            WebGLContext._glTextureIDs = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5, gl.TEXTURE6, gl.TEXTURE7];
        }
        static useProgram(gl, program) {
            if (WebGLContext._useProgram === program)
                return false;
            gl.useProgram(program);
            WebGLContext._useProgram = program;
            return true;
        }
        static setDepthTest(gl, value) {
            value !== WebGLContext._depthTest && (WebGLContext._depthTest = value, value ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST));
        }
        static setDepthMask(gl, value) {
            value !== WebGLContext._depthMask && (WebGLContext._depthMask = value, gl.depthMask(value));
        }
        static setDepthFunc(gl, value) {
            value !== WebGLContext._depthFunc && (WebGLContext._depthFunc = value, gl.depthFunc(value));
        }
        static setBlend(gl, value) {
            value !== WebGLContext._blend && (WebGLContext._blend = value, value ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND));
        }
        static setBlendFunc(gl, sFactor, dFactor) {
            (sFactor !== WebGLContext._sFactor || dFactor !== WebGLContext._dFactor) && (WebGLContext._sFactor = WebGLContext._srcAlpha = sFactor, WebGLContext._dFactor = WebGLContext._dstAlpha = dFactor, gl.blendFunc(sFactor, dFactor));
        }
        static setBlendFuncSeperate(gl, srcRGB, dstRGB, srcAlpha, dstAlpha) {
            if (srcRGB !== WebGLContext._sFactor || dstRGB !== WebGLContext._dFactor || srcAlpha !== WebGLContext._srcAlpha || dstAlpha !== WebGLContext._dstAlpha) {
                WebGLContext._sFactor = srcRGB;
                WebGLContext._dFactor = dstRGB;
                WebGLContext._srcAlpha = srcAlpha;
                WebGLContext._dstAlpha = dstAlpha;
                gl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
            }
        }
        static setCullFace(gl, value) {
            value !== WebGLContext._cullFace && (WebGLContext._cullFace = value, value ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE));
        }
        static setFrontFace(gl, value) {
            value !== WebGLContext._frontFace && (WebGLContext._frontFace = value, gl.frontFace(value));
        }
        static activeTexture(gl, textureID) {
            if (WebGLContext._activedTextureID !== textureID) {
                gl.activeTexture(textureID);
                WebGLContext._activedTextureID = textureID;
            }
        }
        static bindTexture(gl, target, texture) {
            if (WebGLContext._activeTextures[WebGLContext._activedTextureID - gl.TEXTURE0] !== texture) {
                gl.bindTexture(target, texture);
                WebGLContext._activeTextures[WebGLContext._activedTextureID - gl.TEXTURE0] = texture;
            }
        }
        static __init_native() {
            if (!ILaya.Render.supportWebGLPlusRendering)
                return;
            var webGLContext = WebGLContext;
            webGLContext.activeTexture = webGLContext.activeTextureForNative;
            webGLContext.bindTexture = webGLContext.bindTextureForNative;
        }
        static useProgramForNative(gl, program) {
            gl.useProgram(program);
            return true;
        }
        static setDepthTestForNative(gl, value) {
            if (value)
                gl.enable(gl.DEPTH_TEST);
            else
                gl.disable(gl.DEPTH_TEST);
        }
        static setDepthMaskForNative(gl, value) {
            gl.depthMask(value);
        }
        static setDepthFuncForNative(gl, value) {
            gl.depthFunc(value);
        }
        static setBlendForNative(gl, value) {
            if (value)
                gl.enable(gl.BLEND);
            else
                gl.disable(gl.BLEND);
        }
        static setBlendFuncForNative(gl, sFactor, dFactor) {
            gl.blendFunc(sFactor, dFactor);
        }
        static setCullFaceForNative(gl, value) {
            if (value)
                gl.enable(gl.CULL_FACE);
            else
                gl.disable(gl.CULL_FACE);
        }
        static setFrontFaceForNative(gl, value) {
            gl.frontFace(value);
        }
        static activeTextureForNative(gl, textureID) {
            gl.activeTexture(textureID);
        }
        static bindTextureForNative(gl, target, texture) {
            gl.bindTexture(target, texture);
        }
        static bindVertexArrayForNative(gl, vertexArray) {
            gl.bindVertexArray(vertexArray);
        }
    }
    WebGLContext.mainContext = null;
    WebGLContext._activeTextures = new Array(8);
    WebGLContext._useProgram = null;
    WebGLContext._depthTest = true;
    WebGLContext._depthMask = true;
    WebGLContext._blend = false;
    WebGLContext._cullFace = false;

    class BaseTexture extends Bitmap {
        constructor(format, mipMap) {
            super();
            this._wrapModeU = BaseTexture.WARPMODE_REPEAT;
            this._wrapModeV = BaseTexture.WARPMODE_REPEAT;
            this._filterMode = BaseTexture.FILTERMODE_BILINEAR;
            this._readyed = false;
            this._width = -1;
            this._height = -1;
            this._format = format;
            this._mipmap = mipMap;
            this._anisoLevel = 1;
            this._glTexture = LayaGL.instance.createTexture();
        }
        get mipmap() {
            return this._mipmap;
        }
        get format() {
            return this._format;
        }
        get wrapModeU() {
            return this._wrapModeU;
        }
        set wrapModeU(value) {
            if (this._wrapModeU !== value) {
                this._wrapModeU = value;
                (this._width !== -1) && (this._setWarpMode(LayaGL.instance.TEXTURE_WRAP_S, value));
            }
        }
        get wrapModeV() {
            return this._wrapModeV;
        }
        set wrapModeV(value) {
            if (this._wrapModeV !== value) {
                this._wrapModeV = value;
                (this._height !== -1) && (this._setWarpMode(LayaGL.instance.TEXTURE_WRAP_T, value));
            }
        }
        get filterMode() {
            return this._filterMode;
        }
        set filterMode(value) {
            if (value !== this._filterMode) {
                this._filterMode = value;
                ((this._width !== -1) && (this._height !== -1)) && (this._setFilterMode(value));
            }
        }
        get anisoLevel() {
            return this._anisoLevel;
        }
        set anisoLevel(value) {
            if (value !== this._anisoLevel) {
                this._anisoLevel = Math.max(1, Math.min(16, value));
                ((this._width !== -1) && (this._height !== -1)) && (this._setAnisotropy(value));
            }
        }
        get mipmapCount() {
            return this._mipmapCount;
        }
        get defaulteTexture() {
            throw "BaseTexture:must override it.";
        }
        _getFormatByteCount() {
            switch (this._format) {
                case BaseTexture.FORMAT_R8G8B8:
                    return 3;
                case BaseTexture.FORMAT_R8G8B8A8:
                    return 4;
                case BaseTexture.FORMAT_ALPHA8:
                    return 1;
                default:
                    throw "Texture2D: unknown format.";
            }
        }
        _isPot(size) {
            return (size & (size - 1)) === 0;
        }
        _getGLFormat() {
            var glFormat;
            var gl = LayaGL.instance;
            var gpu = LayaGL.layaGPUInstance;
            switch (this._format) {
                case BaseTexture.FORMAT_R8G8B8:
                    glFormat = gl.RGB;
                    break;
                case BaseTexture.FORMAT_R8G8B8A8:
                    glFormat = gl.RGBA;
                    break;
                case BaseTexture.FORMAT_ALPHA8:
                    glFormat = gl.ALPHA;
                    break;
                case BaseTexture.FORMAT_DXT1:
                    if (gpu._compressedTextureS3tc)
                        glFormat = gpu._compressedTextureS3tc.COMPRESSED_RGB_S3TC_DXT1_EXT;
                    else
                        throw "BaseTexture: not support DXT1 format.";
                    break;
                case BaseTexture.FORMAT_DXT5:
                    if (gpu._compressedTextureS3tc)
                        glFormat = gpu._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                    else
                        throw "BaseTexture: not support DXT5 format.";
                    break;
                case BaseTexture.FORMAT_ETC1RGB:
                    if (gpu._compressedTextureEtc1)
                        glFormat = gpu._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL;
                    else
                        throw "BaseTexture: not support ETC1RGB format.";
                    break;
                case BaseTexture.FORMAT_PVRTCRGB_2BPPV:
                    if (gpu._compressedTexturePvrtc)
                        glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                    else
                        throw "BaseTexture: not support PVRTCRGB_2BPPV format.";
                    break;
                case BaseTexture.FORMAT_PVRTCRGBA_2BPPV:
                    if (gpu._compressedTexturePvrtc)
                        glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
                    else
                        throw "BaseTexture: not support PVRTCRGBA_2BPPV format.";
                    break;
                case BaseTexture.FORMAT_PVRTCRGB_4BPPV:
                    if (gpu._compressedTexturePvrtc)
                        glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                    else
                        throw "BaseTexture: not support PVRTCRGB_4BPPV format.";
                    break;
                case BaseTexture.FORMAT_PVRTCRGBA_4BPPV:
                    if (gpu._compressedTexturePvrtc)
                        glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                    else
                        throw "BaseTexture: not support PVRTCRGBA_4BPPV format.";
                    break;
                default:
                    throw "BaseTexture: unknown texture format.";
            }
            return glFormat;
        }
        _setFilterMode(value) {
            var gl = LayaGL.instance;
            WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
            switch (value) {
                case BaseTexture.FILTERMODE_POINT:
                    if (this._mipmap)
                        gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                    else
                        gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(this._glTextureType, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    break;
                case BaseTexture.FILTERMODE_BILINEAR:
                    if (this._mipmap)
                        gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                    else
                        gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(this._glTextureType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    break;
                case BaseTexture.FILTERMODE_TRILINEAR:
                    if (this._mipmap)
                        gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    else
                        gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(this._glTextureType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    break;
                default:
                    throw new Error("BaseTexture:unknown filterMode value.");
            }
        }
        _setWarpMode(orientation, mode) {
            var gl = LayaGL.instance;
            WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
            if (this._isPot(this._width) && this._isPot(this._height)) {
                switch (mode) {
                    case BaseTexture.WARPMODE_REPEAT:
                        gl.texParameteri(this._glTextureType, orientation, gl.REPEAT);
                        break;
                    case BaseTexture.WARPMODE_CLAMP:
                        gl.texParameteri(this._glTextureType, orientation, gl.CLAMP_TO_EDGE);
                        break;
                }
            }
            else {
                gl.texParameteri(this._glTextureType, orientation, gl.CLAMP_TO_EDGE);
            }
        }
        _setAnisotropy(value) {
            var anisotropic = LayaGL.layaGPUInstance._extTextureFilterAnisotropic;
            if (anisotropic) {
                value = Math.max(value, 1);
                var gl = LayaGL.instance;
                WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
                value = Math.min(gl.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT), value);
                gl.texParameterf(this._glTextureType, anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, value);
            }
        }
        _disposeResource() {
            if (this._glTexture) {
                LayaGL.instance.deleteTexture(this._glTexture);
                this._glTexture = null;
                this._setGPUMemory(0);
            }
        }
        _getSource() {
            if (this._readyed)
                return this._glTexture;
            else
                return null;
        }
        generateMipmap() {
            if (this._isPot(this.width) && this._isPot(this.height))
                LayaGL.instance.generateMipmap(this._glTextureType);
        }
    }
    BaseTexture.WARPMODE_REPEAT = 0;
    BaseTexture.WARPMODE_CLAMP = 1;
    BaseTexture.FILTERMODE_POINT = 0;
    BaseTexture.FILTERMODE_BILINEAR = 1;
    BaseTexture.FILTERMODE_TRILINEAR = 2;
    BaseTexture.FORMAT_R8G8B8 = 0;
    BaseTexture.FORMAT_R8G8B8A8 = 1;
    BaseTexture.FORMAT_ALPHA8 = 2;
    BaseTexture.FORMAT_DXT1 = 3;
    BaseTexture.FORMAT_DXT5 = 4;
    BaseTexture.FORMAT_ETC1RGB = 5;
    BaseTexture.FORMAT_PVRTCRGB_2BPPV = 9;
    BaseTexture.FORMAT_PVRTCRGBA_2BPPV = 10;
    BaseTexture.FORMAT_PVRTCRGB_4BPPV = 11;
    BaseTexture.FORMAT_PVRTCRGBA_4BPPV = 12;
    BaseTexture.RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT = 14;
    BaseTexture.FORMAT_DEPTH_16 = 0;
    BaseTexture.FORMAT_STENCIL_8 = 1;
    BaseTexture.FORMAT_DEPTHSTENCIL_16_8 = 2;
    BaseTexture.FORMAT_DEPTHSTENCIL_NONE = 3;

    class Texture2D extends BaseTexture {
        constructor(width = 0, height = 0, format = BaseTexture.FORMAT_R8G8B8A8, mipmap = true, canRead = false) {
            super(format, mipmap);
            var gl = LayaGL.instance;
            this._glTextureType = gl.TEXTURE_2D;
            this._width = width;
            this._height = height;
            this._canRead = canRead;
            this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
            this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
            this._setFilterMode(this._filterMode);
            this._setAnisotropy(this._anisoLevel);
            if (this._mipmap) {
                this._mipmapCount = Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1);
                for (var i = 0; i < this._mipmapCount; i++)
                    this._setPixels(null, i, Math.max(width >> i, 1), Math.max(height >> i, 1));
                this._setGPUMemory(width * height * 4 * (1 + 1 / 3));
            }
            else {
                this._mipmapCount = 1;
                this._setGPUMemory(width * height * 4);
            }
        }
        static __init__() {
            var pixels = new Uint8Array(3);
            pixels[0] = 128;
            pixels[1] = 128;
            pixels[2] = 128;
            Texture2D.grayTexture = new Texture2D(1, 1, BaseTexture.FORMAT_R8G8B8, false, false);
            Texture2D.grayTexture.setPixels(pixels);
            Texture2D.grayTexture.lock = true;
            pixels[0] = 255;
            pixels[1] = 255;
            pixels[2] = 255;
            Texture2D.whiteTexture = new Texture2D(1, 1, BaseTexture.FORMAT_R8G8B8, false, false);
            Texture2D.whiteTexture.setPixels(pixels);
            Texture2D.whiteTexture.lock = true;
            pixels[0] = 0;
            pixels[1] = 0;
            pixels[2] = 0;
            Texture2D.blackTexture = new Texture2D(1, 1, BaseTexture.FORMAT_R8G8B8, false, false);
            Texture2D.blackTexture.setPixels(pixels);
            Texture2D.blackTexture.lock = true;
        }
        static _parse(data, propertyParams = null, constructParams = null) {
            var texture = constructParams ? new Texture2D(constructParams[0], constructParams[1], constructParams[2], constructParams[3], constructParams[4]) : new Texture2D(0, 0);
            if (propertyParams) {
                texture.wrapModeU = propertyParams.wrapModeU;
                texture.wrapModeV = propertyParams.wrapModeV;
                texture.filterMode = propertyParams.filterMode;
                texture.anisoLevel = propertyParams.anisoLevel;
            }
            switch (texture._format) {
                case BaseTexture.FORMAT_R8G8B8:
                case BaseTexture.FORMAT_R8G8B8A8:
                    texture.loadImageSource(data);
                    break;
                case BaseTexture.FORMAT_DXT1:
                case BaseTexture.FORMAT_DXT5:
                case BaseTexture.FORMAT_ETC1RGB:
                case BaseTexture.FORMAT_PVRTCRGB_2BPPV:
                case BaseTexture.FORMAT_PVRTCRGBA_2BPPV:
                case BaseTexture.FORMAT_PVRTCRGB_4BPPV:
                case BaseTexture.FORMAT_PVRTCRGBA_4BPPV:
                    texture.setCompressData(data);
                    break;
                default:
                    throw "Texture2D:unkonwn format.";
            }
            return texture;
        }
        static load(url, complete) {
            ILaya.loader.create(url, complete, null, ILaya.Loader.TEXTURE2D);
        }
        get defaulteTexture() {
            return Texture2D.grayTexture;
        }
        _setPixels(pixels, miplevel, width, height) {
            var gl = LayaGL.instance;
            var textureType = this._glTextureType;
            var glFormat = this._getGLFormat();
            WebGLContext.bindTexture(gl, textureType, this._glTexture);
            if (this.format === BaseTexture.FORMAT_R8G8B8) {
                gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
                gl.texImage2D(textureType, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels);
                gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
            }
            else {
                gl.texImage2D(textureType, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels);
            }
        }
        _calcualatesCompressedDataSize(format, width, height) {
            switch (format) {
                case BaseTexture.FORMAT_DXT1:
                case BaseTexture.FORMAT_ETC1RGB:
                    return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;
                case BaseTexture.FORMAT_DXT5:
                    return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;
                case BaseTexture.FORMAT_PVRTCRGB_4BPPV:
                case BaseTexture.FORMAT_PVRTCRGBA_4BPPV:
                    return Math.floor((Math.max(width, 8) * Math.max(height, 8) * 4 + 7) / 8);
                case BaseTexture.FORMAT_PVRTCRGB_2BPPV:
                case BaseTexture.FORMAT_PVRTCRGBA_2BPPV:
                    return Math.floor((Math.max(width, 16) * Math.max(height, 8) * 2 + 7) / 8);
                default:
                    return 0;
            }
        }
        _pharseDDS(arrayBuffer) {
            const FOURCC_DXT1 = 827611204;
            const FOURCC_DXT5 = 894720068;
            const DDPF_FOURCC = 0x4;
            const DDSD_MIPMAPCOUNT = 0x20000;
            const DDS_MAGIC = 0x20534444;
            const DDS_HEADER_LENGTH = 31;
            const DDS_HEADER_MAGIC = 0;
            const DDS_HEADER_SIZE = 1;
            const DDS_HEADER_FLAGS = 2;
            const DDS_HEADER_HEIGHT = 3;
            const DDS_HEADER_WIDTH = 4;
            const DDS_HEADER_MIPMAPCOUNT = 7;
            const DDS_HEADER_PF_FLAGS = 20;
            const DDS_HEADER_PF_FOURCC = 21;
            var header = new Int32Array(arrayBuffer, 0, DDS_HEADER_LENGTH);
            if (header[DDS_HEADER_MAGIC] != DDS_MAGIC)
                throw "Invalid magic number in DDS header";
            if (!(header[DDS_HEADER_PF_FLAGS] & DDPF_FOURCC))
                throw "Unsupported format, must contain a FourCC code";
            var compressedFormat = header[DDS_HEADER_PF_FOURCC];
            switch (this._format) {
                case BaseTexture.FORMAT_DXT1:
                    if (compressedFormat !== FOURCC_DXT1)
                        throw "the FourCC code is not same with texture format.";
                    break;
                case BaseTexture.FORMAT_DXT5:
                    if (compressedFormat !== FOURCC_DXT5)
                        throw "the FourCC code is not same with texture format.";
                    break;
                default:
                    throw "unknown texture format.";
            }
            var mipLevels = 1;
            if (header[DDS_HEADER_FLAGS] & DDSD_MIPMAPCOUNT) {
                mipLevels = Math.max(1, header[DDS_HEADER_MIPMAPCOUNT]);
                if (!this._mipmap)
                    throw "the mipmap is not same with Texture2D.";
            }
            else {
                if (this._mipmap)
                    throw "the mipmap is not same with Texture2D.";
            }
            var width = header[DDS_HEADER_WIDTH];
            var height = header[DDS_HEADER_HEIGHT];
            this._width = width;
            this._height = height;
            var dataOffset = header[DDS_HEADER_SIZE] + 4;
            this._upLoadCompressedTexImage2D(arrayBuffer, width, height, mipLevels, dataOffset, 0);
        }
        _pharseKTX(arrayBuffer) {
            const ETC_HEADER_LENGTH = 13;
            const ETC_HEADER_FORMAT = 4;
            const ETC_HEADER_HEIGHT = 7;
            const ETC_HEADER_WIDTH = 6;
            const ETC_HEADER_MIPMAPCOUNT = 11;
            const ETC_HEADER_METADATA = 12;
            var id = new Uint8Array(arrayBuffer, 0, 12);
            if (id[0] != 0xAB || id[1] != 0x4B || id[2] != 0x54 || id[3] != 0x58 || id[4] != 0x20 || id[5] != 0x31 || id[6] != 0x31 || id[7] != 0xBB || id[8] != 0x0D || id[9] != 0x0A || id[10] != 0x1A || id[11] != 0x0A)
                throw ("Invalid fileIdentifier in KTX header");
            var header = new Int32Array(id.buffer, id.length, ETC_HEADER_LENGTH);
            var compressedFormat = header[ETC_HEADER_FORMAT];
            switch (compressedFormat) {
                case LayaGL.layaGPUInstance._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL:
                    this._format = BaseTexture.FORMAT_ETC1RGB;
                    break;
                default:
                    throw "unknown texture format.";
            }
            var mipLevels = header[ETC_HEADER_MIPMAPCOUNT];
            var width = header[ETC_HEADER_WIDTH];
            var height = header[ETC_HEADER_HEIGHT];
            this._width = width;
            this._height = height;
            var dataOffset = 64 + header[ETC_HEADER_METADATA];
            this._upLoadCompressedTexImage2D(arrayBuffer, width, height, mipLevels, dataOffset, 4);
        }
        _pharsePVR(arrayBuffer) {
            const PVR_FORMAT_2BPP_RGB = 0;
            const PVR_FORMAT_2BPP_RGBA = 1;
            const PVR_FORMAT_4BPP_RGB = 2;
            const PVR_FORMAT_4BPP_RGBA = 3;
            const PVR_MAGIC = 0x03525650;
            const PVR_HEADER_LENGTH = 13;
            const PVR_HEADER_MAGIC = 0;
            const PVR_HEADER_FORMAT = 2;
            const PVR_HEADER_HEIGHT = 6;
            const PVR_HEADER_WIDTH = 7;
            const PVR_HEADER_MIPMAPCOUNT = 11;
            const PVR_HEADER_METADATA = 12;
            var header = new Int32Array(arrayBuffer, 0, PVR_HEADER_LENGTH);
            if (header[PVR_HEADER_MAGIC] != PVR_MAGIC)
                throw ("Invalid magic number in PVR header");
            var compressedFormat = header[PVR_HEADER_FORMAT];
            switch (compressedFormat) {
                case PVR_FORMAT_2BPP_RGB:
                    this._format = BaseTexture.FORMAT_PVRTCRGB_2BPPV;
                    break;
                case PVR_FORMAT_4BPP_RGB:
                    this._format = BaseTexture.FORMAT_PVRTCRGB_4BPPV;
                    break;
                case PVR_FORMAT_2BPP_RGBA:
                    this._format = BaseTexture.FORMAT_PVRTCRGBA_2BPPV;
                    break;
                case PVR_FORMAT_4BPP_RGBA:
                    this._format = BaseTexture.FORMAT_PVRTCRGBA_4BPPV;
                    break;
                default:
                    throw "Texture2D:unknown PVR format.";
            }
            var mipLevels = header[PVR_HEADER_MIPMAPCOUNT];
            var width = header[PVR_HEADER_WIDTH];
            var height = header[PVR_HEADER_HEIGHT];
            this._width = width;
            this._height = height;
            var dataOffset = header[PVR_HEADER_METADATA] + 52;
            this._upLoadCompressedTexImage2D(arrayBuffer, width, height, mipLevels, dataOffset, 0);
        }
        _upLoadCompressedTexImage2D(data, width, height, miplevelCount, dataOffset, imageSizeOffset) {
            var gl = LayaGL.instance;
            var textureType = this._glTextureType;
            WebGLContext.bindTexture(gl, textureType, this._glTexture);
            var glFormat = this._getGLFormat();
            var offset = dataOffset;
            for (var i = 0; i < miplevelCount; i++) {
                offset += imageSizeOffset;
                var mipDataSize = this._calcualatesCompressedDataSize(this._format, width, height);
                var mipData = new Uint8Array(data, offset, mipDataSize);
                gl.compressedTexImage2D(textureType, i, glFormat, width, height, 0, mipData);
                width = Math.max(width >> 1, 1.0);
                height = Math.max(height >> 1, 1.0);
                offset += mipDataSize;
            }
            var memory = offset;
            this._setGPUMemory(memory);
            this._readyed = true;
            this._activeResource();
        }
        loadImageSource(source, premultiplyAlpha = false) {
            var gl = LayaGL.instance;
            var width = source.width;
            var height = source.height;
            this._width = width;
            this._height = height;
            if (!(this._isPot(width) && this._isPot(height)))
                this._mipmap = false;
            this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
            this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
            this._setFilterMode(this._filterMode);
            WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
            var glFormat = this._getGLFormat();
            if (ILaya.Render.isConchApp) {
                if (source.setPremultiplyAlpha) {
                    source.setPremultiplyAlpha(premultiplyAlpha);
                }
                gl.texImage2D(this._glTextureType, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            }
            else {
                (premultiplyAlpha) && (gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true));
                gl.texImage2D(this._glTextureType, 0, glFormat, glFormat, gl.UNSIGNED_BYTE, source);
                (premultiplyAlpha) && (gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false));
            }
            if (this._mipmap) {
                gl.generateMipmap(this._glTextureType);
                this._setGPUMemory(width * height * 4 * (1 + 1 / 3));
            }
            else {
                this._setGPUMemory(width * height * 4);
            }
            if (this._canRead) {
                if (ILaya.Render.isConchApp) {
                    this._pixels = new Uint8Array(source._nativeObj.getImageData(0, 0, width, height));
                }
                else {
                    ILaya.Browser.canvas.size(width, height);
                    ILaya.Browser.canvas.clear();
                    ILaya.Browser.context.drawImage(source, 0, 0, width, height);
                    this._pixels = new Uint8Array(ILaya.Browser.context.getImageData(0, 0, width, height).data.buffer);
                }
            }
            this._readyed = true;
            this._activeResource();
        }
        setPixels(pixels, miplevel = 0) {
            if (!pixels)
                throw "Texture2D:pixels can't be null.";
            var width = Math.max(this._width >> miplevel, 1);
            var height = Math.max(this._height >> miplevel, 1);
            var pixelsCount = width * height * this._getFormatByteCount();
            if (pixels.length < pixelsCount)
                throw "Texture2D:pixels length should at least " + pixelsCount + ".";
            this._setPixels(pixels, miplevel, width, height);
            if (this._canRead)
                this._pixels = pixels;
            this._readyed = true;
            this._activeResource();
        }
        setSubPixels(x, y, width, height, pixels, miplevel = 0) {
            if (!pixels)
                throw "Texture2D:pixels can't be null.";
            var gl = LayaGL.instance;
            var textureType = this._glTextureType;
            WebGLContext.bindTexture(gl, textureType, this._glTexture);
            var glFormat = this._getGLFormat();
            if (this._format === BaseTexture.FORMAT_R8G8B8) {
                gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
                gl.texSubImage2D(textureType, miplevel, x, y, width, height, glFormat, gl.UNSIGNED_BYTE, pixels);
                gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
            }
            else {
                gl.texSubImage2D(textureType, miplevel, x, y, width, height, glFormat, gl.UNSIGNED_BYTE, pixels);
            }
            this._readyed = true;
            this._activeResource();
        }
        setCompressData(data) {
            switch (this._format) {
                case BaseTexture.FORMAT_DXT1:
                case BaseTexture.FORMAT_DXT5:
                    this._pharseDDS(data);
                    break;
                case BaseTexture.FORMAT_ETC1RGB:
                    this._pharseKTX(data);
                    break;
                case BaseTexture.FORMAT_PVRTCRGB_2BPPV:
                case BaseTexture.FORMAT_PVRTCRGBA_2BPPV:
                case BaseTexture.FORMAT_PVRTCRGB_4BPPV:
                case BaseTexture.FORMAT_PVRTCRGBA_4BPPV:
                    this._pharsePVR(data);
                    break;
                default:
                    throw "Texture2D:unkonwn format.";
            }
        }
        _recoverResource() {
        }
        getPixels() {
            if (this._canRead)
                return this._pixels;
            else
                throw new Error("Texture2D: must set texture canRead is true.");
        }
    }
    Texture2D.TEXTURE2D = "TEXTURE2D";
    Texture2D.grayTexture = null;
    Texture2D.whiteTexture = null;
    Texture2D.blackTexture = null;

    class BaseShader extends Resource {
        constructor() {
            super();
        }
    }

    class RenderState2D {
        static mat2MatArray(mat, matArray) {
            var m = mat;
            var m4 = matArray;
            m4[0] = m.a;
            m4[1] = m.b;
            m4[2] = RenderState2D.EMPTYMAT4_ARRAY[2];
            m4[3] = RenderState2D.EMPTYMAT4_ARRAY[3];
            m4[4] = m.c;
            m4[5] = m.d;
            m4[6] = RenderState2D.EMPTYMAT4_ARRAY[6];
            m4[7] = RenderState2D.EMPTYMAT4_ARRAY[7];
            m4[8] = RenderState2D.EMPTYMAT4_ARRAY[8];
            m4[9] = RenderState2D.EMPTYMAT4_ARRAY[9];
            m4[10] = RenderState2D.EMPTYMAT4_ARRAY[10];
            m4[11] = RenderState2D.EMPTYMAT4_ARRAY[11];
            m4[12] = m.tx;
            m4[13] = m.ty;
            m4[14] = RenderState2D.EMPTYMAT4_ARRAY[14];
            m4[15] = RenderState2D.EMPTYMAT4_ARRAY[15];
            return matArray;
        }
        static restoreTempArray() {
            RenderState2D.TEMPMAT4_ARRAY[0] = 1;
            RenderState2D.TEMPMAT4_ARRAY[1] = 0;
            RenderState2D.TEMPMAT4_ARRAY[4] = 0;
            RenderState2D.TEMPMAT4_ARRAY[5] = 1;
            RenderState2D.TEMPMAT4_ARRAY[12] = 0;
            RenderState2D.TEMPMAT4_ARRAY[13] = 0;
        }
        static clear() {
            RenderState2D.worldScissorTest = false;
            RenderState2D.worldAlpha = 1;
        }
    }
    RenderState2D._MAXSIZE = 99999999;
    RenderState2D.EMPTYMAT4_ARRAY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    RenderState2D.TEMPMAT4_ARRAY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    RenderState2D.worldMatrix4 = RenderState2D.TEMPMAT4_ARRAY;
    RenderState2D.worldMatrix = new Matrix();
    RenderState2D.matWVP = null;
    RenderState2D.worldAlpha = 1.0;
    RenderState2D.worldScissorTest = false;
    RenderState2D.width = 0;
    RenderState2D.height = 0;

    class RenderTexture2D extends BaseTexture {
        constructor(width, height, format = BaseTexture.FORMAT_R8G8B8, depthStencilFormat = BaseTexture.FORMAT_DEPTH_16) {
            super(format, false);
            this._mgrKey = 0;
            this._glTextureType = LayaGL.instance.TEXTURE_2D;
            this._width = width;
            this._height = height;
            this._depthStencilFormat = depthStencilFormat;
            this._create(width, height);
            this.lock = true;
        }
        static get currentActive() {
            return RenderTexture2D._currentActive;
        }
        get depthStencilFormat() {
            return this._depthStencilFormat;
        }
        get defaulteTexture() {
            return Texture2D.grayTexture;
        }
        getIsReady() {
            return true;
        }
        get sourceWidth() {
            return this._width;
        }
        get sourceHeight() {
            return this._height;
        }
        get offsetX() {
            return 0;
        }
        get offsetY() {
            return 0;
        }
        _create(width, height) {
            var gl = LayaGL.instance;
            this._frameBuffer = gl.createFramebuffer();
            WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
            var glFormat = this._getGLFormat();
            gl.texImage2D(this._glTextureType, 0, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, null);
            this._setGPUMemory(width * height * 4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._glTexture, 0);
            if (this._depthStencilFormat !== BaseTexture.FORMAT_DEPTHSTENCIL_NONE) {
                this._depthStencilBuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthStencilBuffer);
                switch (this._depthStencilFormat) {
                    case BaseTexture.FORMAT_DEPTH_16:
                        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
                        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
                        break;
                    case BaseTexture.FORMAT_STENCIL_8:
                        gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, width, height);
                        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
                        break;
                    case BaseTexture.FORMAT_DEPTHSTENCIL_16_8:
                        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
                        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
                        break;
                    default:
                }
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
            this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
            this._setFilterMode(this._filterMode);
            this._setAnisotropy(this._anisoLevel);
            this._readyed = true;
            this._activeResource();
        }
        generateMipmap() {
            if (this._isPot(this.width) && this._isPot(this.height)) {
                this._mipmap = true;
                LayaGL.instance.generateMipmap(this._glTextureType);
                this._setFilterMode(this._filterMode);
                this._setGPUMemory(this.width * this.height * 4 * (1 + 1 / 3));
            }
            else {
                this._mipmap = false;
                this._setGPUMemory(this.width * this.height * 4);
            }
        }
        static pushRT() {
            RenderTexture2D.rtStack.push({ rt: RenderTexture2D._currentActive, w: RenderState2D.width, h: RenderState2D.height });
        }
        static popRT() {
            var gl = LayaGL.instance;
            var top = RenderTexture2D.rtStack.pop();
            if (top) {
                if (RenderTexture2D._currentActive != top.rt) {
                    LayaGL.instance.bindFramebuffer(gl.FRAMEBUFFER, top.rt ? top.rt._frameBuffer : null);
                    RenderTexture2D._currentActive = top.rt;
                }
                gl.viewport(0, 0, top.w, top.h);
                RenderState2D.width = top.w;
                RenderState2D.height = top.h;
            }
        }
        start() {
            var gl = LayaGL.instance;
            LayaGL.instance.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
            this._lastRT = RenderTexture2D._currentActive;
            RenderTexture2D._currentActive = this;
            this._readyed = true;
            gl.viewport(0, 0, this._width, this._height);
            this._lastWidth = RenderState2D.width;
            this._lastHeight = RenderState2D.height;
            RenderState2D.width = this._width;
            RenderState2D.height = this._height;
            BaseShader.activeShader = null;
        }
        end() {
            var gl = LayaGL.instance;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            RenderTexture2D._currentActive = null;
            this._readyed = true;
        }
        restore() {
            var gl = LayaGL.instance;
            if (this._lastRT != RenderTexture2D._currentActive) {
                LayaGL.instance.bindFramebuffer(gl.FRAMEBUFFER, this._lastRT ? this._lastRT._frameBuffer : null);
                RenderTexture2D._currentActive = this._lastRT;
            }
            this._readyed = true;
            gl.viewport(0, 0, this._lastWidth, this._lastHeight);
            RenderState2D.width = this._lastWidth;
            RenderState2D.height = this._lastHeight;
            BaseShader.activeShader = null;
        }
        clear(r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
            var gl = LayaGL.instance;
            gl.clearColor(r, g, b, a);
            var clearFlag = gl.COLOR_BUFFER_BIT;
            switch (this._depthStencilFormat) {
                case gl.DEPTH_COMPONENT16:
                    clearFlag |= gl.DEPTH_BUFFER_BIT;
                    break;
                case gl.STENCIL_INDEX8:
                    clearFlag |= gl.STENCIL_BUFFER_BIT;
                    break;
                case gl.DEPTH_STENCIL:
                    clearFlag |= gl.DEPTH_BUFFER_BIT;
                    clearFlag |= gl.STENCIL_BUFFER_BIT;
                    break;
            }
            gl.clear(clearFlag);
        }
        getData(x, y, width, height) {
            if (ILaya.Render.isConchApp && window.conchConfig.threadMode == 2) {
                throw "native 2 thread mode use getDataAsync";
            }
            var gl = LayaGL.instance;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
            var canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE);
            if (!canRead) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                return null;
            }
            var pixels = new Uint8Array(this._width * this._height * 4);
            var glFormat = this._getGLFormat();
            gl.readPixels(x, y, width, height, glFormat, gl.UNSIGNED_BYTE, pixels);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return pixels;
        }
        getDataAsync(x, y, width, height, callBack) {
            var gl = LayaGL.instance;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
            gl.readPixelsAsync(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, function (data) {
                callBack(new Uint8Array(data));
            });
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        recycle() {
        }
        _disposeResource() {
            if (this._frameBuffer) {
                var gl = LayaGL.instance;
                gl.deleteTexture(this._glTexture);
                gl.deleteFramebuffer(this._frameBuffer);
                gl.deleteRenderbuffer(this._depthStencilBuffer);
                this._glTexture = null;
                this._frameBuffer = null;
                this._depthStencilBuffer = null;
                this._setGPUMemory(0);
            }
        }
    }
    RenderTexture2D.rtStack = [];
    RenderTexture2D.defuv = [0, 0, 1, 0, 1, 1, 0, 1];
    RenderTexture2D.flipyuv = [0, 1, 1, 1, 1, 0, 0, 0];

    class WebGLRTMgr {
        static getRT(w, h) {
            w = w | 0;
            h = h | 0;
            if (w >= 10000) {
                console.error('getRT error! w too big');
            }
            var ret;
            ret = new RenderTexture2D(w, h, BaseTexture.FORMAT_R8G8B8A8, -1);
            return ret;
        }
        static releaseRT(rt) {
            rt._disposeResource();
            return;
        }
    }
    WebGLRTMgr.dict = {};

    class BlendMode {
        static _init_(gl) {
            BlendMode.fns = [BlendMode.BlendNormal, BlendMode.BlendAdd, BlendMode.BlendMultiply, BlendMode.BlendScreen, BlendMode.BlendOverlay, BlendMode.BlendLight, BlendMode.BlendMask, BlendMode.BlendDestinationOut];
            BlendMode.targetFns = [BlendMode.BlendNormalTarget, BlendMode.BlendAddTarget, BlendMode.BlendMultiplyTarget, BlendMode.BlendScreenTarget, BlendMode.BlendOverlayTarget, BlendMode.BlendLightTarget, BlendMode.BlendMask, BlendMode.BlendDestinationOut];
        }
        static BlendNormal(gl) {
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }
        static BlendAdd(gl) {
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.DST_ALPHA);
        }
        static BlendMultiply(gl) {
            WebGLContext.setBlendFunc(gl, gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
        }
        static BlendScreen(gl) {
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE);
        }
        static BlendOverlay(gl) {
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_COLOR);
        }
        static BlendLight(gl) {
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE);
        }
        static BlendNormalTarget(gl) {
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }
        static BlendAddTarget(gl) {
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.DST_ALPHA);
        }
        static BlendMultiplyTarget(gl) {
            WebGLContext.setBlendFunc(gl, gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
        }
        static BlendScreenTarget(gl) {
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE);
        }
        static BlendOverlayTarget(gl) {
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_COLOR);
        }
        static BlendLightTarget(gl) {
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE);
        }
        static BlendMask(gl) {
            WebGLContext.setBlendFunc(gl, gl.ZERO, gl.SRC_ALPHA);
        }
        static BlendDestinationOut(gl) {
            WebGLContext.setBlendFunc(gl, gl.ZERO, gl.ZERO);
        }
    }
    BlendMode.activeBlendFunction = null;
    BlendMode.NAMES = ["normal", "add", "multiply", "screen", "overlay", "light", "mask", "destination-out"];
    BlendMode.TOINT = { "normal": 0, "add": 1, "multiply": 2, "screen": 3, "overlay": 4, "light": 5, "mask": 6, "destination-out": 7, "lighter": 1 };
    BlendMode.NORMAL = "normal";
    BlendMode.ADD = "add";
    BlendMode.MULTIPLY = "multiply";
    BlendMode.SCREEN = "screen";
    BlendMode.OVERLAY = "overlay";
    BlendMode.LIGHT = "light";
    BlendMode.MASK = "mask";
    BlendMode.DESTINATIONOUT = "destination-out";
    BlendMode.LIGHTER = "lighter";
    BlendMode.fns = [];
    BlendMode.targetFns = [];

    class ShaderDefinesBase {
        constructor(name2int, int2name, int2nameMap) {
            this._value = 0;
            this._name2int = name2int;
            this._int2name = int2name;
            this._int2nameMap = int2nameMap;
        }
        add(value) {
            if (typeof (value) == 'string') {
                this._value |= this._name2int[value];
            }
            else {
                this._value |= value;
            }
            return this._value;
        }
        addInt(value) {
            this._value |= value;
            return this._value;
        }
        remove(value) {
            if (typeof (value) == 'string') {
                this._value &= ~(this._name2int[value]);
            }
            else {
                this._value &= (~value);
            }
            return this._value;
        }
        isDefine(def) {
            return (this._value & def) === def;
        }
        getValue() {
            return this._value;
        }
        setValue(value) {
            this._value = value;
        }
        toNameDic() {
            var r = this._int2nameMap[this._value];
            return r ? r : ShaderDefinesBase._toText(this._value, this._int2name, this._int2nameMap);
        }
        static _reg(name, value, _name2int, _int2name) {
            _name2int[name] = value;
            _int2name[value] = name;
        }
        static _toText(value, _int2name, _int2nameMap) {
            var r = _int2nameMap[value];
            if (r)
                return r;
            var o = {};
            var d = 1;
            for (var i = 0; i < 32; i++) {
                d = 1 << i;
                if (d > value)
                    break;
                if (value & d) {
                    var name = _int2name[d];
                    name && (o[name] = "");
                }
            }
            _int2nameMap[value] = o;
            return o;
        }
        static _toInt(names, _name2int) {
            var words = names.split('.');
            var num = 0;
            for (var i = 0, n = words.length; i < n; i++) {
                var value = _name2int[words[i]];
                if (!value)
                    throw new Error("Defines to int err:" + names + "/" + words[i]);
                num |= value;
            }
            return num;
        }
    }

    class ShaderDefines2D extends ShaderDefinesBase {
        constructor() {
            super(ShaderDefines2D.__name2int, ShaderDefines2D.__int2name, ShaderDefines2D.__int2nameMap);
        }
        static __init__() {
            ShaderDefines2D.reg("TEXTURE2D", ShaderDefines2D.TEXTURE2D);
            ShaderDefines2D.reg("PRIMITIVE", ShaderDefines2D.PRIMITIVE);
            ShaderDefines2D.reg("GLOW_FILTER", ShaderDefines2D.FILTERGLOW);
            ShaderDefines2D.reg("BLUR_FILTER", ShaderDefines2D.FILTERBLUR);
            ShaderDefines2D.reg("COLOR_FILTER", ShaderDefines2D.FILTERCOLOR);
            ShaderDefines2D.reg("COLOR_ADD", ShaderDefines2D.COLORADD);
            ShaderDefines2D.reg("WORLDMAT", ShaderDefines2D.WORLDMAT);
            ShaderDefines2D.reg("FILLTEXTURE", ShaderDefines2D.FILLTEXTURE);
            ShaderDefines2D.reg("FSHIGHPRECISION", ShaderDefines2D.SHADERDEFINE_FSHIGHPRECISION);
            ShaderDefines2D.reg('MVP3D', ShaderDefines2D.MVP3D);
        }
        static reg(name, value) {
            this._reg(name, value, ShaderDefines2D.__name2int, ShaderDefines2D.__int2name);
        }
        static toText(value, int2name, int2nameMap) {
            return this._toText(value, int2name, int2nameMap);
        }
        static toInt(names) {
            return this._toInt(names, ShaderDefines2D.__name2int);
        }
    }
    ShaderDefines2D.TEXTURE2D = 0x01;
    ShaderDefines2D.PRIMITIVE = 0x04;
    ShaderDefines2D.FILTERGLOW = 0x08;
    ShaderDefines2D.FILTERBLUR = 0x10;
    ShaderDefines2D.FILTERCOLOR = 0x20;
    ShaderDefines2D.COLORADD = 0x40;
    ShaderDefines2D.WORLDMAT = 0x80;
    ShaderDefines2D.FILLTEXTURE = 0x100;
    ShaderDefines2D.SKINMESH = 0x200;
    ShaderDefines2D.SHADERDEFINE_FSHIGHPRECISION = 0x400;
    ShaderDefines2D.MVP3D = 0x800;
    ShaderDefines2D.NOOPTMASK = ShaderDefines2D.FILTERGLOW | ShaderDefines2D.FILTERBLUR | ShaderDefines2D.FILTERCOLOR | ShaderDefines2D.FILLTEXTURE;
    ShaderDefines2D.__name2int = {};
    ShaderDefines2D.__int2name = [];
    ShaderDefines2D.__int2nameMap = [];

    class Stat {
        static show(x = 0, y = 0) {
            Stat._StatRender.show(x, y);
        }
        static enable() {
            Stat._StatRender.enable();
        }
        static hide() {
            Stat._StatRender.hide();
        }
        static clear() {
            Stat.trianglesFaces = Stat.renderBatches = Stat.savedRenderBatches = Stat.shaderCall = Stat.spriteRenderUseCacheCount = Stat.frustumCulling = Stat.octreeNodeCulling = Stat.canvasNormal = Stat.canvasBitmap = Stat.canvasReCache = 0;
        }
        static set onclick(fn) {
            Stat._StatRender.set_onclick(fn);
        }
    }
    Stat.FPS = 0;
    Stat.loopCount = 0;
    Stat.shaderCall = 0;
    Stat.renderBatches = 0;
    Stat.savedRenderBatches = 0;
    Stat.trianglesFaces = 0;
    Stat.spriteCount = 0;
    Stat.spriteRenderUseCacheCount = 0;
    Stat.frustumCulling = 0;
    Stat.octreeNodeCulling = 0;
    Stat.canvasNormal = 0;
    Stat.canvasBitmap = 0;
    Stat.canvasReCache = 0;
    Stat.renderSlow = false;
    Stat._fpsData = [];
    Stat._timer = 0;
    Stat._count = 0;
    Stat._StatRender = null;

    class StringKey {
        constructor() {
            this._strsToID = {};
            this._idToStrs = [];
            this._length = 0;
        }
        add(str) {
            var index = this._strsToID[str];
            if (index != null)
                return index;
            this._idToStrs[this._length] = str;
            return this._strsToID[str] = this._length++;
        }
        getID(str) {
            var index = this._strsToID[str];
            return index == null ? -1 : index;
        }
        getName(id) {
            var str = this._idToStrs[id];
            return str == null ? undefined : str;
        }
    }

    class Shader extends BaseShader {
        constructor(vs, ps, saveName = null, nameMap = null, bindAttrib = null) {
            super();
            this._attribInfo = null;
            this.customCompile = false;
            this._curActTexIndex = 0;
            this.tag = {};
            this._program = null;
            this._params = null;
            this._paramsMap = {};
            if ((!vs) || (!ps))
                throw "Shader Error";
            this._attribInfo = bindAttrib;
            this._id = ++Shader._count;
            this._vs = vs;
            this._ps = ps;
            this._nameMap = nameMap ? nameMap : {};
            saveName != null && (Shader.sharders[saveName] = this);
            this.recreateResource();
            this.lock = true;
        }
        static getShader(name) {
            return Shader.sharders[name];
        }
        static create(vs, ps, saveName = null, nameMap = null, bindAttrib = null) {
            return new Shader(vs, ps, saveName, nameMap, bindAttrib);
        }
        static withCompile(nameID, define, shaderName, createShader) {
            if (shaderName && Shader.sharders[shaderName])
                return Shader.sharders[shaderName];
            var pre = Shader._preCompileShader[Shader.SHADERNAME2ID * nameID];
            if (!pre)
                throw new Error("withCompile shader err!" + nameID);
            return pre.createShader(define, shaderName, createShader, null);
        }
        static withCompile2D(nameID, mainID, define, shaderName, createShader, bindAttrib = null) {
            if (shaderName && Shader.sharders[shaderName])
                return Shader.sharders[shaderName];
            var pre = Shader._preCompileShader[Shader.SHADERNAME2ID * nameID + mainID];
            if (!pre)
                throw new Error("withCompile shader err!" + nameID + " " + mainID);
            return pre.createShader(define, shaderName, createShader, bindAttrib);
        }
        static addInclude(fileName, txt) {
            ILaya.ShaderCompile.addInclude(fileName, txt);
        }
        static preCompile(nameID, vs, ps, nameMap) {
            var id = Shader.SHADERNAME2ID * nameID;
            Shader._preCompileShader[id] = new ILaya.ShaderCompile(vs, ps, nameMap);
        }
        static preCompile2D(nameID, mainID, vs, ps, nameMap) {
            var id = Shader.SHADERNAME2ID * nameID + mainID;
            Shader._preCompileShader[id] = new ILaya.ShaderCompile(vs, ps, nameMap);
        }
        recreateResource() {
            this._compile();
            this._setGPUMemory(0);
        }
        _disposeResource() {
            WebGLContext.mainContext.deleteShader(this._vshader);
            WebGLContext.mainContext.deleteShader(this._pshader);
            WebGLContext.mainContext.deleteProgram(this._program);
            this._vshader = this._pshader = this._program = null;
            this._params = null;
            this._paramsMap = {};
            this._setGPUMemory(0);
            this._curActTexIndex = 0;
        }
        _compile() {
            if (!this._vs || !this._ps || this._params)
                return;
            this._reCompile = true;
            this._params = [];
            var result;
            if (this.customCompile)
                result = ILaya.ShaderCompile.preGetParams(this._vs, this._ps);
            var gl = WebGLContext.mainContext;
            this._program = gl.createProgram();
            this._vshader = Shader._createShader(gl, this._vs, gl.VERTEX_SHADER);
            this._pshader = Shader._createShader(gl, this._ps, gl.FRAGMENT_SHADER);
            gl.attachShader(this._program, this._vshader);
            gl.attachShader(this._program, this._pshader);
            var one, i, n, location;
            var attribDescNum = this._attribInfo ? this._attribInfo.length : 0;
            for (i = 0; i < attribDescNum; i += 2) {
                gl.bindAttribLocation(this._program, this._attribInfo[i + 1], this._attribInfo[i]);
            }
            gl.linkProgram(this._program);
            if (!this.customCompile && !gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
                throw gl.getProgramInfoLog(this._program);
            }
            var nUniformNum = this.customCompile ? result.uniforms.length : gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
            for (i = 0; i < nUniformNum; i++) {
                var uniform = this.customCompile ? result.uniforms[i] : gl.getActiveUniform(this._program, i);
                location = gl.getUniformLocation(this._program, uniform.name);
                one = { vartype: "uniform", glfun: null, ivartype: 1, location: location, name: uniform.name, type: uniform.type, isArray: false, isSame: false, preValue: null, indexOfParams: 0 };
                if (one.name.indexOf('[0]') > 0) {
                    one.name = one.name.substr(0, one.name.length - 3);
                    one.isArray = true;
                    one.location = gl.getUniformLocation(this._program, one.name);
                }
                this._params.push(one);
            }
            for (i = 0, n = this._params.length; i < n; i++) {
                one = this._params[i];
                one.indexOfParams = i;
                one.index = 1;
                one.value = [one.location, null];
                one.codename = one.name;
                one.name = this._nameMap[one.codename] ? this._nameMap[one.codename] : one.codename;
                this._paramsMap[one.name] = one;
                one._this = this;
                one.uploadedValue = [];
                switch (one.type) {
                    case gl.INT:
                        one.fun = one.isArray ? this._uniform1iv : this._uniform1i;
                        break;
                    case gl.FLOAT:
                        one.fun = one.isArray ? this._uniform1fv : this._uniform1f;
                        break;
                    case gl.FLOAT_VEC2:
                        one.fun = one.isArray ? this._uniform_vec2v : this._uniform_vec2;
                        break;
                    case gl.FLOAT_VEC3:
                        one.fun = one.isArray ? this._uniform_vec3v : this._uniform_vec3;
                        break;
                    case gl.FLOAT_VEC4:
                        one.fun = one.isArray ? this._uniform_vec4v : this._uniform_vec4;
                        break;
                    case gl.SAMPLER_2D:
                        one.fun = this._uniform_sampler2D;
                        break;
                    case gl.SAMPLER_CUBE:
                        one.fun = this._uniform_samplerCube;
                        break;
                    case gl.FLOAT_MAT4:
                        one.glfun = gl.uniformMatrix4fv;
                        one.fun = this._uniformMatrix4fv;
                        break;
                    case gl.BOOL:
                        one.fun = this._uniform1i;
                        break;
                    case gl.FLOAT_MAT2:
                    case gl.FLOAT_MAT3:
                        throw new Error("compile shader err!");
                    default:
                        throw new Error("compile shader err!");
                }
            }
        }
        static _createShader(gl, str, type) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, str);
            gl.compileShader(shader);
            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                return shader;
            }
            else {
                console.log(gl.getShaderInfoLog(shader));
                return null;
            }
        }
        getUniform(name) {
            return this._paramsMap[name];
        }
        _uniform1f(one, value) {
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] !== value) {
                WebGLContext.mainContext.uniform1f(one.location, uploadedValue[0] = value);
                return 1;
            }
            return 0;
        }
        _uniform1fv(one, value) {
            if (value.length < 4) {
                var uploadedValue = one.uploadedValue;
                if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
                    WebGLContext.mainContext.uniform1fv(one.location, value);
                    uploadedValue[0] = value[0];
                    uploadedValue[1] = value[1];
                    uploadedValue[2] = value[2];
                    uploadedValue[3] = value[3];
                    return 1;
                }
                return 0;
            }
            else {
                WebGLContext.mainContext.uniform1fv(one.location, value);
                return 1;
            }
        }
        _uniform_vec2(one, value) {
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1]) {
                WebGLContext.mainContext.uniform2f(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1]);
                return 1;
            }
            return 0;
        }
        _uniform_vec2v(one, value) {
            if (value.length < 2) {
                var uploadedValue = one.uploadedValue;
                if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
                    WebGLContext.mainContext.uniform2fv(one.location, value);
                    uploadedValue[0] = value[0];
                    uploadedValue[1] = value[1];
                    uploadedValue[2] = value[2];
                    uploadedValue[3] = value[3];
                    return 1;
                }
                return 0;
            }
            else {
                WebGLContext.mainContext.uniform2fv(one.location, value);
                return 1;
            }
        }
        _uniform_vec3(one, value) {
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2]) {
                WebGLContext.mainContext.uniform3f(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2]);
                return 1;
            }
            return 0;
        }
        _uniform_vec3v(one, value) {
            WebGLContext.mainContext.uniform3fv(one.location, value);
            return 1;
        }
        _uniform_vec4(one, value) {
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
                WebGLContext.mainContext.uniform4f(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2], uploadedValue[3] = value[3]);
                return 1;
            }
            return 0;
        }
        _uniform_vec4v(one, value) {
            WebGLContext.mainContext.uniform4fv(one.location, value);
            return 1;
        }
        _uniformMatrix2fv(one, value) {
            WebGLContext.mainContext.uniformMatrix2fv(one.location, false, value);
            return 1;
        }
        _uniformMatrix3fv(one, value) {
            WebGLContext.mainContext.uniformMatrix3fv(one.location, false, value);
            return 1;
        }
        _uniformMatrix4fv(one, value) {
            WebGLContext.mainContext.uniformMatrix4fv(one.location, false, value);
            return 1;
        }
        _uniform1i(one, value) {
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] !== value) {
                WebGLContext.mainContext.uniform1i(one.location, uploadedValue[0] = value);
                return 1;
            }
            return 0;
        }
        _uniform1iv(one, value) {
            WebGLContext.mainContext.uniform1iv(one.location, value);
            return 1;
        }
        _uniform_ivec2(one, value) {
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1]) {
                WebGLContext.mainContext.uniform2i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1]);
                return 1;
            }
            return 0;
        }
        _uniform_ivec2v(one, value) {
            WebGLContext.mainContext.uniform2iv(one.location, value);
            return 1;
        }
        _uniform_vec3i(one, value) {
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2]) {
                WebGLContext.mainContext.uniform3i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2]);
                return 1;
            }
            return 0;
        }
        _uniform_vec3vi(one, value) {
            WebGLContext.mainContext.uniform3iv(one.location, value);
            return 1;
        }
        _uniform_vec4i(one, value) {
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
                WebGLContext.mainContext.uniform4i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2], uploadedValue[3] = value[3]);
                return 1;
            }
            return 0;
        }
        _uniform_vec4vi(one, value) {
            WebGLContext.mainContext.uniform4iv(one.location, value);
            return 1;
        }
        _uniform_sampler2D(one, value) {
            var gl = WebGLContext.mainContext;
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] == null) {
                uploadedValue[0] = this._curActTexIndex;
                gl.uniform1i(one.location, this._curActTexIndex);
                WebGLContext.activeTexture(gl, gl.TEXTURE0 + this._curActTexIndex);
                WebGLContext.bindTexture(gl, gl.TEXTURE_2D, value);
                this._curActTexIndex++;
                return 1;
            }
            else {
                WebGLContext.activeTexture(gl, gl.TEXTURE0 + uploadedValue[0]);
                WebGLContext.bindTexture(gl, gl.TEXTURE_2D, value);
                return 0;
            }
        }
        _uniform_samplerCube(one, value) {
            var gl = WebGLContext.mainContext;
            var uploadedValue = one.uploadedValue;
            if (uploadedValue[0] == null) {
                uploadedValue[0] = this._curActTexIndex;
                gl.uniform1i(one.location, this._curActTexIndex);
                WebGLContext.activeTexture(gl, gl.TEXTURE0 + this._curActTexIndex);
                WebGLContext.bindTexture(gl, gl.TEXTURE_CUBE_MAP, value);
                this._curActTexIndex++;
                return 1;
            }
            else {
                WebGLContext.activeTexture(gl, gl.TEXTURE0 + uploadedValue[0]);
                WebGLContext.bindTexture(gl, gl.TEXTURE_CUBE_MAP, value);
                return 0;
            }
        }
        _noSetValue(one) {
            console.log("no....:" + one.name);
        }
        uploadOne(name, value) {
            WebGLContext.useProgram(WebGLContext.mainContext, this._program);
            var one = this._paramsMap[name];
            one.fun.call(this, one, value);
        }
        uploadTexture2D(value) {
            var CTX = WebGLContext;
            if (CTX._activeTextures[0] !== value) {
                CTX.bindTexture(WebGLContext.mainContext, LayaGL.instance.TEXTURE_2D, value);
                CTX._activeTextures[0] = value;
            }
        }
        upload(shaderValue, params = null) {
            BaseShader.activeShader = BaseShader.bindShader = this;
            var gl = WebGLContext.mainContext;
            WebGLContext.useProgram(gl, this._program);
            if (this._reCompile) {
                params = this._params;
                this._reCompile = false;
            }
            else {
                params = params || this._params;
            }
            var one, value, n = params.length, shaderCall = 0;
            for (var i = 0; i < n; i++) {
                one = params[i];
                if ((value = shaderValue[one.name]) !== null)
                    shaderCall += one.fun.call(this, one, value);
            }
            Stat.shaderCall += shaderCall;
        }
        uploadArray(shaderValue, length, _bufferUsage) {
            BaseShader.activeShader = this;
            BaseShader.bindShader = this;
            WebGLContext.useProgram(WebGLContext.mainContext, this._program);
            var params = this._params, value;
            var one, shaderCall = 0;
            for (var i = length - 2; i >= 0; i -= 2) {
                one = this._paramsMap[shaderValue[i]];
                if (!one)
                    continue;
                value = shaderValue[i + 1];
                if (value != null) {
                    _bufferUsage && _bufferUsage[one.name] && _bufferUsage[one.name].bind();
                    shaderCall += one.fun.call(this, one, value);
                }
            }
            Stat.shaderCall += shaderCall;
        }
        getParams() {
            return this._params;
        }
        setAttributesLocation(attribDesc) {
            this._attribInfo = attribDesc;
        }
    }
    Shader._count = 0;
    Shader._preCompileShader = {};
    Shader.SHADERNAME2ID = 0.0002;
    Shader.nameKey = new StringKey();
    Shader.sharders = new Array(0x20);

    class Shader2X extends Shader {
        constructor(vs, ps, saveName = null, nameMap = null, bindAttrib = null) {
            super(vs, ps, saveName, nameMap, bindAttrib);
            this._params2dQuick2 = null;
            this._shaderValueWidth = 0;
            this._shaderValueHeight = 0;
        }
        _disposeResource() {
            super._disposeResource();
            this._params2dQuick2 = null;
        }
        upload2dQuick2(shaderValue) {
            this.upload(shaderValue, this._params2dQuick2 || this._make2dQuick2());
        }
        _make2dQuick2() {
            if (!this._params2dQuick2) {
                this._params2dQuick2 = [];
                var params = this._params, one;
                for (var i = 0, n = params.length; i < n; i++) {
                    one = params[i];
                    if (one.name !== "size")
                        this._params2dQuick2.push(one);
                }
            }
            return this._params2dQuick2;
        }
        static create(vs, ps, saveName = null, nameMap = null, bindAttrib = null) {
            return new Shader2X(vs, ps, saveName, nameMap, bindAttrib);
        }
    }

    class Value2D {
        constructor(mainID, subID) {
            this.defines = new ShaderDefines2D();
            this.size = [0, 0];
            this.alpha = 1.0;
            this.ALPHA = 1.0;
            this.subID = 0;
            this.ref = 1;
            this._cacheID = 0;
            this.clipMatDir = [ILaya.Context._MAXSIZE, 0, 0, ILaya.Context._MAXSIZE];
            this.clipMatPos = [0, 0];
            this.clipOff = [0, 0];
            this.mainID = mainID;
            this.subID = subID;
            this.textureHost = null;
            this.texture = null;
            this.color = null;
            this.colorAdd = null;
            this.u_mmat2 = null;
            this._cacheID = mainID | subID;
            this._inClassCache = Value2D._cache[this._cacheID];
            if (mainID > 0 && !this._inClassCache) {
                this._inClassCache = Value2D._cache[this._cacheID] = [];
                this._inClassCache._length = 0;
            }
            this.clear();
        }
        static _initone(type, classT) {
            Value2D._typeClass[type] = classT;
            Value2D._cache[type] = [];
            Value2D._cache[type]._length = 0;
        }
        static __init__() {
        }
        setValue(value) { }
        _ShaderWithCompile() {
            var ret = Shader.withCompile2D(0, this.mainID, this.defines.toNameDic(), this.mainID | this.defines._value, Shader2X.create, this._attribLocation);
            return ret;
        }
        upload() {
            var renderstate2d = RenderState2D;
            RenderState2D.worldMatrix4 === RenderState2D.TEMPMAT4_ARRAY || this.defines.addInt(ShaderDefines2D.WORLDMAT);
            this.mmat = renderstate2d.worldMatrix4;
            if (RenderState2D.matWVP) {
                this.defines.addInt(ShaderDefines2D.MVP3D);
                this.u_MvpMatrix = RenderState2D.matWVP.elements;
            }
            var sd = Shader.sharders[this.mainID | this.defines._value] || this._ShaderWithCompile();
            if (sd._shaderValueWidth !== renderstate2d.width || sd._shaderValueHeight !== renderstate2d.height) {
                this.size[0] = renderstate2d.width;
                this.size[1] = renderstate2d.height;
                sd._shaderValueWidth = renderstate2d.width;
                sd._shaderValueHeight = renderstate2d.height;
                sd.upload(this, null);
            }
            else {
                sd.upload(this, sd._params2dQuick2 || sd._make2dQuick2());
            }
        }
        setFilters(value) {
            this.filters = value;
            if (!value)
                return;
            var n = value.length, f;
            for (var i = 0; i < n; i++) {
                f = value[i];
                if (f) {
                    this.defines.add(f.type);
                    f.action.setValue(this);
                }
            }
        }
        clear() {
            this.defines._value = this.subID + (ILaya.WebGL.shaderHighPrecision ? ShaderDefines2D.SHADERDEFINE_FSHIGHPRECISION : 0);
            this.clipOff[0] = 0;
        }
        release() {
            if ((--this.ref) < 1) {
                this._inClassCache && (this._inClassCache[this._inClassCache._length++] = this);
                this.clear();
                this.filters = null;
                this.ref = 1;
                this.clipOff[0] = 0;
            }
        }
        static create(mainType, subType) {
            var types = Value2D._cache[mainType | subType];
            if (types._length)
                return types[--types._length];
            else
                return new Value2D._typeClass[mainType | subType](subType);
        }
    }
    Value2D._cache = [];
    Value2D._typeClass = [];
    Value2D.TEMPMAT4_ARRAY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    class SubmitKey {
        constructor() {
            this.clear();
        }
        clear() {
            this.submitType = -1;
            this.blendShader = this.other = 0;
        }
        copyFrom(src) {
            this.other = src.other;
            this.blendShader = src.blendShader;
            this.submitType = src.submitType;
        }
        copyFrom2(src, submitType, other) {
            this.other = other;
            this.submitType = submitType;
        }
        equal3_2(next, submitType, other) {
            return this.submitType === submitType && this.other === other && this.blendShader === next.blendShader;
        }
        equal4_2(next, submitType, other) {
            return this.submitType === submitType && this.other === other && this.blendShader === next.blendShader;
        }
        equal_3(next) {
            return this.submitType === next.submitType && this.blendShader === next.blendShader;
        }
        equal(next) {
            return this.other === next.other && this.submitType === next.submitType && this.blendShader === next.blendShader;
        }
    }

    class SubmitCMD {
        constructor() {
            this._ref = 1;
            this._key = new SubmitKey();
        }
        renderSubmit() {
            this.fun.apply(this._this, this.args);
            return 1;
        }
        getRenderType() {
            return 0;
        }
        releaseRender() {
            if ((--this._ref) < 1) {
                var pool = SubmitCMD.POOL;
                pool[pool._length++] = this;
            }
        }
        static create(args, fun, thisobj) {
            var o = SubmitCMD.POOL._length ? SubmitCMD.POOL[--SubmitCMD.POOL._length] : new SubmitCMD();
            o.fun = fun;
            o.args = args;
            o._this = thisobj;
            o._ref = 1;
            o._key.clear();
            return o;
        }
    }
    SubmitCMD.POOL = [];
    {
        SubmitCMD.POOL._length = 0;
    }

    class Filter {
        constructor() { }
        get type() { return -1; }
    }
    Filter.BLUR = 0x10;
    Filter.COLOR = 0x20;
    Filter.GLOW = 0x08;
    Filter._filter = function (sprite, context, x, y) {
        var webglctx = context;
        var next = this._next;
        if (next) {
            var filters = sprite.filters, len = filters.length;
            if (len == 1 && (filters[0].type == Filter.COLOR)) {
                context.save();
                context.setColorFilter(filters[0]);
                next._fun.call(next, sprite, context, x, y);
                context.restore();
                return;
            }
            var svCP = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
            var b;
            var p = Point.TEMP;
            var tMatrix = webglctx._curMat;
            var mat = Matrix.create();
            tMatrix.copyTo(mat);
            var tPadding = 0;
            var tHalfPadding = 0;
            var tIsHaveGlowFilter = false;
            var source = null;
            var out = sprite._cacheStyle.filterCache || null;
            if (!out || sprite.getRepaint() != 0) {
                tIsHaveGlowFilter = sprite._isHaveGlowFilter();
                if (tIsHaveGlowFilter) {
                    tPadding = 50;
                    tHalfPadding = 25;
                }
                b = new Rectangle();
                b.copyFrom(sprite.getSelfBounds());
                b.x += sprite.x;
                b.y += sprite.y;
                b.x -= sprite.pivotX + 4;
                b.y -= sprite.pivotY + 4;
                var tSX = b.x;
                var tSY = b.y;
                b.width += (tPadding + 8);
                b.height += (tPadding + 8);
                p.x = b.x * mat.a + b.y * mat.c;
                p.y = b.y * mat.d + b.x * mat.b;
                b.x = p.x;
                b.y = p.y;
                p.x = b.width * mat.a + b.height * mat.c;
                p.y = b.height * mat.d + b.width * mat.b;
                b.width = p.x;
                b.height = p.y;
                if (b.width <= 0 || b.height <= 0) {
                    return;
                }
                out && WebGLRTMgr.releaseRT(out);
                source = WebGLRTMgr.getRT(b.width, b.height);
                var outRT = out = WebGLRTMgr.getRT(b.width, b.height);
                sprite._getCacheStyle().filterCache = out;
                webglctx.pushRT();
                webglctx.useRT(source);
                var tX = sprite.x - tSX + tHalfPadding;
                var tY = sprite.y - tSY + tHalfPadding;
                next._fun.call(next, sprite, context, tX, tY);
                webglctx.useRT(outRT);
                for (var i = 0; i < len; i++) {
                    if (i != 0) {
                        webglctx.useRT(source);
                        webglctx.drawTarget(outRT, 0, 0, b.width, b.height, Matrix.TEMP.identity(), svCP, null, BlendMode.TOINT.overlay);
                        webglctx.useRT(outRT);
                    }
                    var fil = filters[i];
                    switch (fil.type) {
                        case Filter.BLUR:
                            fil._glRender && fil._glRender.render(source, context, b.width, b.height, fil);
                            break;
                        case Filter.GLOW:
                            fil._glRender && fil._glRender.render(source, context, b.width, b.height, fil);
                            break;
                        case Filter.COLOR:
                            webglctx.setColorFilter(fil);
                            webglctx.drawTarget(source, 0, 0, b.width, b.height, Matrix.EMPTY.identity(), Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
                            webglctx.setColorFilter(null);
                            break;
                    }
                }
                webglctx.popRT();
            }
            else {
                tIsHaveGlowFilter = sprite._cacheStyle.hasGlowFilter || false;
                if (tIsHaveGlowFilter) {
                    tPadding = 50;
                    tHalfPadding = 25;
                }
                b = sprite.getBounds();
                if (b.width <= 0 || b.height <= 0) {
                    return;
                }
                b.width += tPadding;
                b.height += tPadding;
                p.x = b.x * mat.a + b.y * mat.c;
                p.y = b.y * mat.d + b.x * mat.b;
                b.x = p.x;
                b.y = p.y;
                p.x = b.width * mat.a + b.height * mat.c;
                p.y = b.height * mat.d + b.width * mat.b;
                b.width = p.x;
                b.height = p.y;
            }
            x = x - tHalfPadding - sprite.x;
            y = y - tHalfPadding - sprite.y;
            p.setTo(x, y);
            mat.transformPoint(p);
            x = p.x + b.x;
            y = p.y + b.y;
            webglctx._drawRenderTexture(out, x, y, b.width, b.height, Matrix.TEMP.identity(), 1.0, RenderTexture2D.defuv);
            if (source) {
                var submit = SubmitCMD.create([source], function (s) {
                    s.destroy();
                }, this);
                source = null;
                context.addRenderObject(submit);
            }
            mat.destroy();
        }
    };

    class Utils {
        static toRadian(angle) {
            return angle * Utils._pi2;
        }
        static toAngle(radian) {
            return radian * Utils._pi;
        }
        static toHexColor(color) {
            if (color < 0 || isNaN(color))
                return null;
            var str = color.toString(16);
            while (str.length < 6)
                str = "0" + str;
            return "#" + str;
        }
        static getGID() {
            return Utils._gid++;
        }
        static concatArray(source, array) {
            if (!array)
                return source;
            if (!source)
                return array;
            var i, len = array.length;
            for (i = 0; i < len; i++) {
                source.push(array[i]);
            }
            return source;
        }
        static clearArray(array) {
            if (!array)
                return array;
            array.length = 0;
            return array;
        }
        static copyArray(source, array) {
            source || (source = []);
            if (!array)
                return source;
            source.length = array.length;
            var i, len = array.length;
            for (i = 0; i < len; i++) {
                source[i] = array[i];
            }
            return source;
        }
        static getGlobalRecByPoints(sprite, x0, y0, x1, y1) {
            var newLTPoint;
            newLTPoint = Point.create().setTo(x0, y0);
            newLTPoint = sprite.localToGlobal(newLTPoint);
            var newRBPoint;
            newRBPoint = Point.create().setTo(x1, y1);
            newRBPoint = sprite.localToGlobal(newRBPoint);
            var rst = Rectangle._getWrapRec([newLTPoint.x, newLTPoint.y, newRBPoint.x, newRBPoint.y]);
            newLTPoint.recover();
            newRBPoint.recover();
            return rst;
        }
        static getGlobalPosAndScale(sprite) {
            return Utils.getGlobalRecByPoints(sprite, 0, 0, 1, 1);
        }
        static bind(fun, scope) {
            var rst = fun;
            rst = fun.bind(scope);
            return rst;
        }
        static updateOrder(array) {
            if (!array || array.length < 2)
                return false;
            var i = 1, j, len = array.length, key, c;
            while (i < len) {
                j = i;
                c = array[j];
                key = array[j]._zOrder;
                while (--j > -1) {
                    if (array[j]._zOrder > key)
                        array[j + 1] = array[j];
                    else
                        break;
                }
                array[j + 1] = c;
                i++;
            }
            return true;
        }
        static transPointList(points, x, y) {
            var i, len = points.length;
            for (i = 0; i < len; i += 2) {
                points[i] += x;
                points[i + 1] += y;
            }
        }
        static parseInt(str, radix = 0) {
            var result = parseInt(str, radix);
            if (isNaN(result))
                return 0;
            return result;
        }
        static getFileExtension(path) {
            Utils._extReg.lastIndex = path.lastIndexOf(".");
            var result = Utils._extReg.exec(path);
            if (result && result.length > 1) {
                return result[1].toLowerCase();
            }
            return null;
        }
        static getTransformRelativeToWindow(coordinateSpace, x, y) {
            var stage = Utils.gStage;
            var globalTransform = Utils.getGlobalPosAndScale(coordinateSpace);
            var canvasMatrix = stage._canvasTransform.clone();
            var canvasLeft = canvasMatrix.tx;
            var canvasTop = canvasMatrix.ty;
            canvasMatrix.rotate(-Math.PI / 180 * stage.canvasDegree);
            canvasMatrix.scale(stage.clientScaleX, stage.clientScaleY);
            var perpendicular = (stage.canvasDegree % 180 != 0);
            var tx, ty;
            if (perpendicular) {
                tx = y + globalTransform.y;
                ty = x + globalTransform.x;
                tx *= canvasMatrix.d;
                ty *= canvasMatrix.a;
                if (stage.canvasDegree == 90) {
                    tx = canvasLeft - tx;
                    ty += canvasTop;
                }
                else {
                    tx += canvasLeft;
                    ty = canvasTop - ty;
                }
            }
            else {
                tx = x + globalTransform.x;
                ty = y + globalTransform.y;
                tx *= canvasMatrix.a;
                ty *= canvasMatrix.d;
                tx += canvasLeft;
                ty += canvasTop;
            }
            ty += stage['_safariOffsetY'];
            var domScaleX, domScaleY;
            if (perpendicular) {
                domScaleX = canvasMatrix.d * globalTransform.height;
                domScaleY = canvasMatrix.a * globalTransform.width;
            }
            else {
                domScaleX = canvasMatrix.a * globalTransform.width;
                domScaleY = canvasMatrix.d * globalTransform.height;
            }
            return { x: tx, y: ty, scaleX: domScaleX, scaleY: domScaleY };
        }
        static fitDOMElementInArea(dom, coordinateSpace, x, y, width, height) {
            if (!dom._fitLayaAirInitialized) {
                dom._fitLayaAirInitialized = true;
                dom.style.transformOrigin = dom.style.webKittransformOrigin = "left top";
                dom.style.position = "absolute";
            }
            var transform = Utils.getTransformRelativeToWindow(coordinateSpace, x, y);
            dom.style.transform = dom.style.webkitTransform = "scale(" + transform.scaleX + "," + transform.scaleY + ") rotate(" + (Utils.gStage.canvasDegree) + "deg)";
            dom.style.width = width + 'px';
            dom.style.height = height + 'px';
            dom.style.left = transform.x + 'px';
            dom.style.top = transform.y + 'px';
        }
        static isOkTextureList(textureList) {
            if (!textureList)
                return false;
            var i, len = textureList.length;
            var tTexture;
            for (i = 0; i < len; i++) {
                tTexture = textureList[i];
                if (!tTexture || !tTexture._getSource())
                    return false;
            }
            return true;
        }
        static isOKCmdList(cmds) {
            if (!cmds)
                return false;
            var i, len = cmds.length;
            var cmd;
            for (i = 0; i < len; i++) {
                cmd = cmds[i];
            }
            return true;
        }
        static getQueryString(name) {
            if (ILaya.Browser.onMiniGame)
                return null;
            if (!window.location || !window.location.search)
                return null;
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                return unescape(r[2]);
            return null;
        }
    }
    Utils.gStage = null;
    Utils._gid = 1;
    Utils._pi = 180 / Math.PI;
    Utils._pi2 = Math.PI / 180;
    Utils._extReg = /\.(\w+)\??/g;
    Utils.parseXMLFromString = function (value) {
        var rst;
        value = value.replace(/>\s+</g, '><');
        rst = (new DOMParser()).parseFromString(value, 'text/xml');
        if (rst.firstChild.textContent.indexOf("This page contains the following errors") > -1) {
            throw new Error(rst.firstChild.firstChild.textContent);
        }
        return rst;
    };

    class ColorUtils {
        constructor(value) {
            this.arrColor = [];
            if (value == null) {
                this.strColor = "#00000000";
                this.numColor = 0;
                this.arrColor = [0, 0, 0, 0];
                return;
            }
            var i, len;
            var color;
            if (typeof (value) == 'string') {
                if (value.indexOf("rgba(") >= 0 || value.indexOf("rgb(") >= 0) {
                    var tStr = value;
                    var beginI, endI;
                    beginI = tStr.indexOf("(");
                    endI = tStr.indexOf(")");
                    tStr = tStr.substring(beginI + 1, endI);
                    this.arrColor = tStr.split(",");
                    len = this.arrColor.length;
                    for (i = 0; i < len; i++) {
                        this.arrColor[i] = parseFloat(this.arrColor[i]);
                        if (i < 3) {
                            this.arrColor[i] = Math.round(this.arrColor[i]);
                        }
                    }
                    if (this.arrColor.length == 4) {
                        color = ((this.arrColor[0] * 256 + this.arrColor[1]) * 256 + this.arrColor[2]) * 256 + Math.round(this.arrColor[3] * 255);
                    }
                    else {
                        color = ((this.arrColor[0] * 256 + this.arrColor[1]) * 256 + this.arrColor[2]);
                    }
                    this.strColor = value;
                }
                else {
                    this.strColor = value;
                    value.charAt(0) === '#' && (value = value.substr(1));
                    len = value.length;
                    if (len === 3 || len === 4) {
                        var temp = "";
                        for (i = 0; i < len; i++) {
                            temp += (value[i] + value[i]);
                        }
                        value = temp;
                    }
                    color = parseInt(value, 16);
                }
            }
            else {
                color = value;
                this.strColor = Utils.toHexColor(color);
            }
            if (this.strColor.indexOf("rgba") >= 0 || this.strColor.length === 9) {
                this.arrColor = [((0xFF000000 & color) >>> 24) / 255, ((0xFF0000 & color) >> 16) / 255, ((0xFF00 & color) >> 8) / 255, (0xFF & color) / 255];
                this.numColor = (0xff000000 & color) >>> 24 | (color & 0xff0000) >> 8 | (color & 0x00ff00) << 8 | ((color & 0xff) << 24);
            }
            else {
                this.arrColor = [((0xFF0000 & color) >> 16) / 255, ((0xFF00 & color) >> 8) / 255, (0xFF & color) / 255, 1];
                this.numColor = 0xff000000 | (color & 0xff0000) >> 16 | (color & 0x00ff00) | (color & 0xff) << 16;
            }
            this.arrColor.__id = ++ColorUtils._COLODID;
        }
        static _initDefault() {
            ColorUtils._DEFAULT = {};
            for (var i in ColorUtils._COLOR_MAP)
                ColorUtils._SAVE[i] = ColorUtils._DEFAULT[i] = new ColorUtils(ColorUtils._COLOR_MAP[i]);
            return ColorUtils._DEFAULT;
        }
        static _initSaveMap() {
            ColorUtils._SAVE_SIZE = 0;
            ColorUtils._SAVE = {};
            for (var i in ColorUtils._DEFAULT)
                ColorUtils._SAVE[i] = ColorUtils._DEFAULT[i];
        }
        static create(value) {
            var key = value + "";
            var color = ColorUtils._SAVE[key];
            if (color != null)
                return color;
            if (ColorUtils._SAVE_SIZE < 1000)
                ColorUtils._initSaveMap();
            return ColorUtils._SAVE[key] = new ColorUtils(value);
        }
    }
    ColorUtils._SAVE = {};
    ColorUtils._SAVE_SIZE = 0;
    ColorUtils._COLOR_MAP = { "purple": "#800080", "orange": "#ffa500", "white": '#FFFFFF', "red": '#FF0000', "green": '#00FF00', "blue": '#0000FF', "black": '#000000', "yellow": '#FFFF00', 'gray': '#808080' };
    ColorUtils._DEFAULT = ColorUtils._initDefault();
    ColorUtils._COLODID = 1;

    class ColorFilter extends Filter {
        constructor(mat = null) {
            super();
            if (!mat)
                mat = this._copyMatrix(ColorFilter.IDENTITY_MATRIX);
            this._mat = new Float32Array(16);
            this._alpha = new Float32Array(4);
            this.setByMatrix(mat);
        }
        gray() {
            return this.setByMatrix(ColorFilter.GRAY_MATRIX);
        }
        color(red = 0, green = 0, blue = 0, alpha = 1) {
            return this.setByMatrix([1, 0, 0, 0, red, 0, 1, 0, 0, green, 0, 0, 1, 0, blue, 0, 0, 0, 1, alpha]);
        }
        setColor(color) {
            var arr = ColorUtils.create(color).arrColor;
            var mt = [0, 0, 0, 0, 256 * arr[0], 0, 0, 0, 0, 256 * arr[1], 0, 0, 0, 0, 256 * arr[2], 0, 0, 0, 1, 0];
            return this.setByMatrix(mt);
        }
        setByMatrix(matrix) {
            if (this._matrix != matrix)
                this._copyMatrix(matrix);
            var j = 0;
            var z = 0;
            for (var i = 0; i < 20; i++) {
                if (i % 5 != 4) {
                    this._mat[j++] = matrix[i];
                }
                else {
                    this._alpha[z++] = matrix[i];
                }
            }
            return this;
        }
        get type() {
            return Filter.COLOR;
        }
        adjustColor(brightness, contrast, saturation, hue) {
            this.adjustHue(hue);
            this.adjustContrast(contrast);
            this.adjustBrightness(brightness);
            this.adjustSaturation(saturation);
            return this;
        }
        adjustBrightness(brightness) {
            brightness = this._clampValue(brightness, 100);
            if (brightness == 0 || isNaN(brightness))
                return this;
            return this._multiplyMatrix([1, 0, 0, 0, brightness, 0, 1, 0, 0, brightness, 0, 0, 1, 0, brightness, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
        }
        adjustContrast(contrast) {
            contrast = this._clampValue(contrast, 100);
            if (contrast == 0 || isNaN(contrast))
                return this;
            var x;
            if (contrast < 0) {
                x = 127 + contrast / 100 * 127;
            }
            else {
                x = contrast % 1;
                if (x == 0) {
                    x = ColorFilter.DELTA_INDEX[contrast];
                }
                else {
                    x = ColorFilter.DELTA_INDEX[(contrast << 0)] * (1 - x) + ColorFilter.DELTA_INDEX[(contrast << 0) + 1] * x;
                }
                x = x * 127 + 127;
            }
            var x1 = x / 127;
            var x2 = (127 - x) * 0.5;
            return this._multiplyMatrix([x1, 0, 0, 0, x2, 0, x1, 0, 0, x2, 0, 0, x1, 0, x2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
        }
        adjustSaturation(saturation) {
            saturation = this._clampValue(saturation, 100);
            if (saturation == 0 || isNaN(saturation))
                return this;
            var x = 1 + ((saturation > 0) ? 3 * saturation / 100 : saturation / 100);
            var dx = 1 - x;
            var r = 0.3086 * dx;
            var g = 0.6094 * dx;
            var b = 0.0820 * dx;
            return this._multiplyMatrix([r + x, g, b, 0, 0, r, g + x, b, 0, 0, r, g, b + x, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
        }
        adjustHue(hue) {
            hue = this._clampValue(hue, 180) / 180 * Math.PI;
            if (hue == 0 || isNaN(hue))
                return this;
            var cos = Math.cos(hue);
            var sin = Math.sin(hue);
            var r = 0.213;
            var g = 0.715;
            var b = 0.072;
            return this._multiplyMatrix([r + cos * (1 - r) + sin * (-r), g + cos * (-g) + sin * (-g), b + cos * (-b) + sin * (1 - b), 0, 0, r + cos * (-r) + sin * (0.143), g + cos * (1 - g) + sin * (0.140), b + cos * (-b) + sin * (-0.283), 0, 0, r + cos * (-r) + sin * (-(1 - r)), g + cos * (-g) + sin * (g), b + cos * (1 - b) + sin * (b), 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
        }
        reset() {
            return this.setByMatrix(this._copyMatrix(ColorFilter.IDENTITY_MATRIX));
        }
        _multiplyMatrix(matrix) {
            var col = [];
            this._matrix = this._fixMatrix(this._matrix);
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 5; j++) {
                    col[j] = this._matrix[j + i * 5];
                }
                for (j = 0; j < 5; j++) {
                    var val = 0;
                    for (var k = 0; k < 5; k++) {
                        val += matrix[j + k * 5] * col[k];
                    }
                    this._matrix[j + i * 5] = val;
                }
            }
            return this.setByMatrix(this._matrix);
        }
        _clampValue(val, limit) {
            return Math.min(limit, Math.max(-limit, val));
        }
        _fixMatrix(matrix = null) {
            if (matrix == null)
                return ColorFilter.IDENTITY_MATRIX;
            if (matrix.length < ColorFilter.LENGTH)
                matrix = matrix.slice(0, matrix.length).concat(ColorFilter.IDENTITY_MATRIX.slice(matrix.length, ColorFilter.LENGTH));
            else if (matrix.length > ColorFilter.LENGTH)
                matrix = matrix.slice(0, ColorFilter.LENGTH);
            return matrix;
        }
        _copyMatrix(matrix) {
            var len = ColorFilter.LENGTH;
            if (!this._matrix)
                this._matrix = [];
            for (var i = 0; i < len; i++) {
                this._matrix[i] = matrix[i];
            }
            return this._matrix;
        }
    }
    ColorFilter.DELTA_INDEX = [0, 0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1, 0.11, 0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24, 0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42, 0.44, 0.46, 0.48, 0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98, 1.0, 1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54, 1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0, 2.12, 2.25, 2.37, 2.50, 2.62, 2.75, 2.87, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0, 4.3, 4.7, 4.9, 5.0, 5.5, 6.0, 6.5, 6.8, 7.0, 7.3, 7.5, 7.8, 8.0, 8.4, 8.7, 9.0, 9.4, 9.6, 9.8, 10.0];
    ColorFilter.GRAY_MATRIX = [0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0];
    ColorFilter.IDENTITY_MATRIX = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];
    ColorFilter.LENGTH = 25;

    class DrawTextureCmd {
        constructor() {
            this.colorFlt = null;
            this.uv = null;
        }
        static create(texture, x, y, width, height, matrix, alpha, color, blendMode, uv) {
            var cmd = Pool.getItemByClass("DrawTextureCmd", DrawTextureCmd);
            cmd.texture = texture;
            texture._addReference();
            cmd.x = x;
            cmd.y = y;
            cmd.width = width;
            cmd.height = height;
            cmd.matrix = matrix;
            cmd.alpha = alpha;
            cmd.color = color;
            cmd.blendMode = blendMode;
            cmd.uv = uv;
            if (color) {
                cmd.colorFlt = new ColorFilter();
                cmd.colorFlt.setColor(color);
            }
            return cmd;
        }
        recover() {
            this.texture._removeReference();
            this.texture = null;
            this.matrix = null;
            Pool.recover("DrawTextureCmd", this);
        }
        run(context, gx, gy) {
            context.drawTextureWithTransform(this.texture, this.x, this.y, this.width, this.height, this.matrix, gx, gy, this.alpha, this.blendMode, this.colorFlt, this.uv);
        }
        get cmdID() {
            return DrawTextureCmd.ID;
        }
    }
    DrawTextureCmd.ID = "DrawTexture";

    class FillTextureCmd {
        static create(texture, x, y, width, height, type, offset, other) {
            var cmd = Pool.getItemByClass("FillTextureCmd", FillTextureCmd);
            cmd.texture = texture;
            cmd.x = x;
            cmd.y = y;
            cmd.width = width;
            cmd.height = height;
            cmd.type = type;
            cmd.offset = offset;
            cmd.other = other;
            return cmd;
        }
        recover() {
            this.texture = null;
            this.offset = null;
            this.other = null;
            Pool.recover("FillTextureCmd", this);
        }
        run(context, gx, gy) {
            context.fillTexture(this.texture, this.x + gx, this.y + gy, this.width, this.height, this.type, this.offset, this.other);
        }
        get cmdID() {
            return FillTextureCmd.ID;
        }
    }
    FillTextureCmd.ID = "FillTexture";

    class RestoreCmd {
        static create() {
            var cmd = Pool.getItemByClass("RestoreCmd", RestoreCmd);
            return cmd;
        }
        recover() {
            Pool.recover("RestoreCmd", this);
        }
        run(context, gx, gy) {
            context.restore();
        }
        get cmdID() {
            return RestoreCmd.ID;
        }
    }
    RestoreCmd.ID = "Restore";

    class RotateCmd {
        static create(angle, pivotX, pivotY) {
            var cmd = Pool.getItemByClass("RotateCmd", RotateCmd);
            cmd.angle = angle;
            cmd.pivotX = pivotX;
            cmd.pivotY = pivotY;
            return cmd;
        }
        recover() {
            Pool.recover("RotateCmd", this);
        }
        run(context, gx, gy) {
            context._rotate(this.angle, this.pivotX + gx, this.pivotY + gy);
        }
        get cmdID() {
            return RotateCmd.ID;
        }
    }
    RotateCmd.ID = "Rotate";

    class ScaleCmd {
        static create(scaleX, scaleY, pivotX, pivotY) {
            var cmd = Pool.getItemByClass("ScaleCmd", ScaleCmd);
            cmd.scaleX = scaleX;
            cmd.scaleY = scaleY;
            cmd.pivotX = pivotX;
            cmd.pivotY = pivotY;
            return cmd;
        }
        recover() {
            Pool.recover("ScaleCmd", this);
        }
        run(context, gx, gy) {
            context._scale(this.scaleX, this.scaleY, this.pivotX + gx, this.pivotY + gy);
        }
        get cmdID() {
            return ScaleCmd.ID;
        }
    }
    ScaleCmd.ID = "Scale";

    class TransformCmd {
        static create(matrix, pivotX, pivotY) {
            var cmd = Pool.getItemByClass("TransformCmd", TransformCmd);
            cmd.matrix = matrix;
            cmd.pivotX = pivotX;
            cmd.pivotY = pivotY;
            return cmd;
        }
        recover() {
            this.matrix = null;
            Pool.recover("TransformCmd", this);
        }
        run(context, gx, gy) {
            context._transform(this.matrix, this.pivotX + gx, this.pivotY + gy);
        }
        get cmdID() {
            return TransformCmd.ID;
        }
    }
    TransformCmd.ID = "Transform";

    class TranslateCmd {
        static create(tx, ty) {
            var cmd = Pool.getItemByClass("TranslateCmd", TranslateCmd);
            cmd.tx = tx;
            cmd.ty = ty;
            return cmd;
        }
        recover() {
            Pool.recover("TranslateCmd", this);
        }
        run(context, gx, gy) {
            context.translate(this.tx, this.ty);
        }
        get cmdID() {
            return TranslateCmd.ID;
        }
    }
    TranslateCmd.ID = "Translate";

    class Bezier {
        constructor() {
            this._controlPoints = [new Point(), new Point(), new Point()];
            this._calFun = this.getPoint2;
        }
        _switchPoint(x, y) {
            var tPoint = this._controlPoints.shift();
            tPoint.setTo(x, y);
            this._controlPoints.push(tPoint);
        }
        getPoint2(t, rst) {
            var p1 = this._controlPoints[0];
            var p2 = this._controlPoints[1];
            var p3 = this._controlPoints[2];
            var lineX = Math.pow((1 - t), 2) * p1.x + 2 * t * (1 - t) * p2.x + Math.pow(t, 2) * p3.x;
            var lineY = Math.pow((1 - t), 2) * p1.y + 2 * t * (1 - t) * p2.y + Math.pow(t, 2) * p3.y;
            rst.push(lineX, lineY);
        }
        getPoint3(t, rst) {
            var p1 = this._controlPoints[0];
            var p2 = this._controlPoints[1];
            var p3 = this._controlPoints[2];
            var p4 = this._controlPoints[3];
            var lineX = Math.pow((1 - t), 3) * p1.x + 3 * p2.x * t * (1 - t) * (1 - t) + 3 * p3.x * t * t * (1 - t) + p4.x * Math.pow(t, 3);
            var lineY = Math.pow((1 - t), 3) * p1.y + 3 * p2.y * t * (1 - t) * (1 - t) + 3 * p3.y * t * t * (1 - t) + p4.y * Math.pow(t, 3);
            rst.push(lineX, lineY);
        }
        insertPoints(count, rst) {
            var i;
            count = count > 0 ? count : 5;
            var dLen;
            dLen = 1 / count;
            for (i = 0; i <= 1; i += dLen) {
                this._calFun(i, rst);
            }
        }
        getBezierPoints(pList, inSertCount = 5, count = 2) {
            var i, len;
            len = pList.length;
            if (len < (count + 1) * 2)
                return [];
            var rst = [];
            switch (count) {
                case 2:
                    this._calFun = this.getPoint2;
                    break;
                case 3:
                    this._calFun = this.getPoint3;
                    break;
                default:
                    return [];
            }
            while (this._controlPoints.length <= count) {
                this._controlPoints.push(Point.create());
            }
            for (i = 0; i < count * 2; i += 2) {
                this._switchPoint(pList[i], pList[i + 1]);
            }
            for (i = count * 2; i < len; i += 2) {
                this._switchPoint(pList[i], pList[i + 1]);
                if ((i / 2) % count == 0)
                    this.insertPoints(inSertCount, rst);
            }
            return rst;
        }
    }
    Bezier.I = new Bezier();

    class GrahamScan {
        static multiply(p1, p2, p0) {
            return ((p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y));
        }
        static dis(p1, p2) {
            return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
        }
        static _getPoints(count, tempUse = false, rst = null) {
            if (!GrahamScan._mPointList)
                GrahamScan._mPointList = [];
            while (GrahamScan._mPointList.length < count)
                GrahamScan._mPointList.push(new Point());
            if (!rst)
                rst = [];
            rst.length = 0;
            if (tempUse) {
                GrahamScan.getFrom(rst, GrahamScan._mPointList, count);
            }
            else {
                GrahamScan.getFromR(rst, GrahamScan._mPointList, count);
            }
            return rst;
        }
        static getFrom(rst, src, count) {
            var i;
            for (i = 0; i < count; i++) {
                rst.push(src[i]);
            }
            return rst;
        }
        static getFromR(rst, src, count) {
            var i;
            for (i = 0; i < count; i++) {
                rst.push(src.pop());
            }
            return rst;
        }
        static pListToPointList(pList, tempUse = false) {
            var i, len = pList.length / 2, rst = GrahamScan._getPoints(len, tempUse, GrahamScan._tempPointList);
            for (i = 0; i < len; i++) {
                rst[i].setTo(pList[i + i], pList[i + i + 1]);
            }
            return rst;
        }
        static pointListToPlist(pointList) {
            var i, len = pointList.length, rst = GrahamScan._temPList, tPoint;
            rst.length = 0;
            for (i = 0; i < len; i++) {
                tPoint = pointList[i];
                rst.push(tPoint.x, tPoint.y);
            }
            return rst;
        }
        static scanPList(pList) {
            return Utils.copyArray(pList, GrahamScan.pointListToPlist(GrahamScan.scan(GrahamScan.pListToPointList(pList, true))));
        }
        static scan(PointSet) {
            var i, j, k = 0, tmp, n = PointSet.length, ch;
            var _tmpDic = {};
            var key;
            ch = GrahamScan._temArr;
            ch.length = 0;
            n = PointSet.length;
            for (i = n - 1; i >= 0; i--) {
                tmp = PointSet[i];
                key = tmp.x + "_" + tmp.y;
                if (!(key in _tmpDic)) {
                    _tmpDic[key] = true;
                    ch.push(tmp);
                }
            }
            n = ch.length;
            Utils.copyArray(PointSet, ch);
            for (i = 1; i < n; i++)
                if ((PointSet[i].y < PointSet[k].y) || ((PointSet[i].y == PointSet[k].y) && (PointSet[i].x < PointSet[k].x)))
                    k = i;
            tmp = PointSet[0];
            PointSet[0] = PointSet[k];
            PointSet[k] = tmp;
            for (i = 1; i < n - 1; i++) {
                k = i;
                for (j = i + 1; j < n; j++)
                    if ((GrahamScan.multiply(PointSet[j], PointSet[k], PointSet[0]) > 0) || ((GrahamScan.multiply(PointSet[j], PointSet[k], PointSet[0]) == 0) && (GrahamScan.dis(PointSet[0], PointSet[j]) < GrahamScan.dis(PointSet[0], PointSet[k]))))
                        k = j;
                tmp = PointSet[i];
                PointSet[i] = PointSet[k];
                PointSet[k] = tmp;
            }
            ch = GrahamScan._temArr;
            ch.length = 0;
            if (PointSet.length < 3) {
                return Utils.copyArray(ch, PointSet);
            }
            ch.push(PointSet[0], PointSet[1], PointSet[2]);
            for (i = 3; i < n; i++) {
                while (ch.length >= 2 && GrahamScan.multiply(PointSet[i], ch[ch.length - 1], ch[ch.length - 2]) >= 0)
                    ch.pop();
                PointSet[i] && ch.push(PointSet[i]);
            }
            return ch;
        }
    }
    GrahamScan._tempPointList = [];
    GrahamScan._temPList = [];
    GrahamScan._temArr = [];

    class DrawStyle {
        constructor(value) {
            this.setValue(value);
        }
        static create(value) {
            if (value) {
                var color = (value instanceof ColorUtils) ? value : ColorUtils.create(value);
                return color._drawStyle || (color._drawStyle = new DrawStyle(value));
            }
            return DrawStyle.DEFAULT;
        }
        setValue(value) {
            if (value) {
                this._color = (value instanceof ColorUtils) ? value : ColorUtils.create(value);
            }
            else
                this._color = ColorUtils.create("#000000");
        }
        reset() {
            this._color = ColorUtils.create("#000000");
        }
        toInt() {
            return this._color.numColor;
        }
        equal(value) {
            if (typeof (value) == 'string')
                return this._color.strColor === value;
            if (value instanceof ColorUtils)
                return this._color.numColor === value.numColor;
            return false;
        }
        toColorStr() {
            return this._color.strColor;
        }
    }
    DrawStyle.DEFAULT = new DrawStyle("#000000");

    class Path {
        constructor() {
            this._lastOriX = 0;
            this._lastOriY = 0;
            this.paths = [];
            this._curPath = null;
        }
        beginPath(convex) {
            this.paths.length = 1;
            this._curPath = this.paths[0] = new renderPath();
            this._curPath.convex = convex;
        }
        closePath() {
            this._curPath.loop = true;
        }
        newPath() {
            this._curPath = new renderPath();
            this.paths.push(this._curPath);
        }
        addPoint(pointX, pointY) {
            this._curPath.path.push(pointX, pointY);
        }
        push(points, convex) {
            if (!this._curPath) {
                this._curPath = new renderPath();
                this.paths.push(this._curPath);
            }
            else if (this._curPath.path.length > 0) {
                this._curPath = new renderPath();
                this.paths.push(this._curPath);
            }
            var rp = this._curPath;
            rp.path = points.slice();
            rp.convex = convex;
        }
        reset() {
            this.paths.length = 0;
        }
    }
    class renderPath {
        constructor() {
            this.path = [];
            this.loop = false;
            this.convex = false;
        }
    }

    class SubmitBase {
        constructor(renderType = SubmitBase.TYPE_2D) {
            this.clipInfoID = -1;
            this._mesh = null;
            this._blendFn = null;
            this._id = 0;
            this._renderType = 0;
            this._parent = null;
            this._key = new SubmitKey();
            this._startIdx = 0;
            this._numEle = 0;
            this._ref = 1;
            this.shaderValue = null;
            this._renderType = renderType;
            this._id = ++SubmitBase.ID;
        }
        static __init__() {
            var s = SubmitBase.RENDERBASE = new SubmitBase(-1);
            s.shaderValue = new Value2D(0, 0);
            s.shaderValue.ALPHA = 1;
            s._ref = 0xFFFFFFFF;
        }
        getID() {
            return this._id;
        }
        getRenderType() {
            return this._renderType;
        }
        toString() {
            return "ibindex:" + this._startIdx + " num:" + this._numEle + " key=" + this._key;
        }
        renderSubmit() { return 1; }
        releaseRender() { }
    }
    SubmitBase.TYPE_2D = 10000;
    SubmitBase.TYPE_CANVAS = 10003;
    SubmitBase.TYPE_CMDSETRT = 10004;
    SubmitBase.TYPE_CUSTOM = 10005;
    SubmitBase.TYPE_BLURRT = 10006;
    SubmitBase.TYPE_CMDDESTORYPRERT = 10007;
    SubmitBase.TYPE_DISABLESTENCIL = 10008;
    SubmitBase.TYPE_OTHERIBVB = 10009;
    SubmitBase.TYPE_PRIMITIVE = 10010;
    SubmitBase.TYPE_RT = 10011;
    SubmitBase.TYPE_BLUR_RT = 10012;
    SubmitBase.TYPE_TARGET = 10013;
    SubmitBase.TYPE_CHANGE_VALUE = 10014;
    SubmitBase.TYPE_SHAPE = 10015;
    SubmitBase.TYPE_TEXTURE = 10016;
    SubmitBase.TYPE_FILLTEXTURE = 10017;
    SubmitBase.KEY_ONCE = -1;
    SubmitBase.KEY_FILLRECT = 1;
    SubmitBase.KEY_DRAWTEXTURE = 2;
    SubmitBase.KEY_VG = 3;
    SubmitBase.KEY_TRIANGLES = 4;
    SubmitBase.ID = 1;
    SubmitBase.preRender = null;

    class SaveBase {
        constructor() {
        }
        static _createArray() {
            var value = [];
            value._length = 0;
            return value;
        }
        static _init() {
            var namemap = SaveBase._namemap = {};
            namemap[SaveBase.TYPE_ALPHA] = "ALPHA";
            namemap[SaveBase.TYPE_FILESTYLE] = "fillStyle";
            namemap[SaveBase.TYPE_FONT] = "font";
            namemap[SaveBase.TYPE_LINEWIDTH] = "lineWidth";
            namemap[SaveBase.TYPE_STROKESTYLE] = "strokeStyle";
            namemap[SaveBase.TYPE_ENABLEMERGE] = "_mergeID";
            namemap[SaveBase.TYPE_MARK] = namemap[SaveBase.TYPE_TRANSFORM] = namemap[SaveBase.TYPE_TRANSLATE] = [];
            namemap[SaveBase.TYPE_TEXTBASELINE] = "textBaseline";
            namemap[SaveBase.TYPE_TEXTALIGN] = "textAlign";
            namemap[SaveBase.TYPE_GLOBALCOMPOSITEOPERATION] = "_nBlendType";
            namemap[SaveBase.TYPE_SHADER] = "shader";
            namemap[SaveBase.TYPE_FILTERS] = "filters";
            namemap[SaveBase.TYPE_COLORFILTER] = '_colorFiler';
            return namemap;
        }
        isSaveMark() { return false; }
        restore(context) {
            this._dataObj[this._valueName] = this._value;
            SaveBase.POOL[SaveBase.POOL._length++] = this;
            this._newSubmit && (context._curSubmit = SubmitBase.RENDERBASE);
        }
        static save(context, type, dataObj, newSubmit) {
            if ((context._saveMark._saveuse & type) !== type) {
                context._saveMark._saveuse |= type;
                var cache = SaveBase.POOL;
                var o = cache._length > 0 ? cache[--cache._length] : (new SaveBase());
                o._value = dataObj[o._valueName = SaveBase._namemap[type]];
                o._dataObj = dataObj;
                o._newSubmit = newSubmit;
                var _save = context._save;
                _save[_save._length++] = o;
            }
        }
    }
    SaveBase.TYPE_ALPHA = 0x1;
    SaveBase.TYPE_FILESTYLE = 0x2;
    SaveBase.TYPE_FONT = 0x8;
    SaveBase.TYPE_LINEWIDTH = 0x100;
    SaveBase.TYPE_STROKESTYLE = 0x200;
    SaveBase.TYPE_MARK = 0x400;
    SaveBase.TYPE_TRANSFORM = 0x800;
    SaveBase.TYPE_TRANSLATE = 0x1000;
    SaveBase.TYPE_ENABLEMERGE = 0x2000;
    SaveBase.TYPE_TEXTBASELINE = 0x4000;
    SaveBase.TYPE_TEXTALIGN = 0x8000;
    SaveBase.TYPE_GLOBALCOMPOSITEOPERATION = 0x10000;
    SaveBase.TYPE_CLIPRECT = 0x20000;
    SaveBase.TYPE_CLIPRECT_STENCIL = 0x40000;
    SaveBase.TYPE_IBVB = 0x80000;
    SaveBase.TYPE_SHADER = 0x100000;
    SaveBase.TYPE_FILTERS = 0x200000;
    SaveBase.TYPE_FILTERS_TYPE = 0x400000;
    SaveBase.TYPE_COLORFILTER = 0x800000;
    SaveBase.POOL = SaveBase._createArray();
    SaveBase._namemap = SaveBase._init();

    class SaveClipRect {
        constructor() {
            this._globalClipMatrix = new Matrix();
            this._clipInfoID = -1;
            this._clipRect = new Rectangle();
            this.incache = false;
        }
        isSaveMark() { return false; }
        restore(context) {
            this._globalClipMatrix.copyTo(context._globalClipMatrix);
            this._clipRect.clone(context._clipRect);
            context._clipInfoID = this._clipInfoID;
            SaveClipRect.POOL[SaveClipRect.POOL._length++] = this;
            context._clipInCache = this.incache;
        }
        static save(context) {
            if ((context._saveMark._saveuse & SaveBase.TYPE_CLIPRECT) == SaveBase.TYPE_CLIPRECT)
                return;
            context._saveMark._saveuse |= SaveBase.TYPE_CLIPRECT;
            var cache = SaveClipRect.POOL;
            var o = cache._length > 0 ? cache[--cache._length] : (new SaveClipRect());
            context._globalClipMatrix.copyTo(o._globalClipMatrix);
            context._clipRect.clone(o._clipRect);
            o._clipInfoID = context._clipInfoID;
            o.incache = context._clipInCache;
            var _save = context._save;
            _save[_save._length++] = o;
        }
    }
    SaveClipRect.POOL = SaveBase._createArray();

    class SaveMark {
        constructor() {
            this._saveuse = 0;
        }
        isSaveMark() {
            return true;
        }
        restore(context) {
            context._saveMark = this._preSaveMark;
            SaveMark.POOL[SaveMark.POOL._length++] = this;
        }
        static Create(context) {
            var no = SaveMark.POOL;
            var o = no._length > 0 ? no[--no._length] : (new SaveMark());
            o._saveuse = 0;
            o._preSaveMark = context._saveMark;
            context._saveMark = o;
            return o;
        }
    }
    SaveMark.POOL = SaveBase._createArray();

    class SaveTransform {
        constructor() {
            this._matrix = new Matrix();
        }
        isSaveMark() { return false; }
        restore(context) {
            context._curMat = this._savematrix;
            SaveTransform.POOL[SaveTransform.POOL._length++] = this;
        }
        static save(context) {
            var _saveMark = context._saveMark;
            if ((_saveMark._saveuse & SaveBase.TYPE_TRANSFORM) === SaveBase.TYPE_TRANSFORM)
                return;
            _saveMark._saveuse |= SaveBase.TYPE_TRANSFORM;
            var no = SaveTransform.POOL;
            var o = no._length > 0 ? no[--no._length] : (new SaveTransform());
            o._savematrix = context._curMat;
            context._curMat = context._curMat.copyTo(o._matrix);
            var _save = context._save;
            _save[_save._length++] = o;
        }
    }
    SaveTransform.POOL = SaveBase._createArray();

    class SaveTranslate {
        constructor() {
            this._mat = new Matrix();
        }
        isSaveMark() { return false; }
        restore(context) {
            this._mat.copyTo(context._curMat);
            SaveTranslate.POOL[SaveTranslate.POOL._length++] = this;
        }
        static save(context) {
            var no = SaveTranslate.POOL;
            var o = no._length > 0 ? no[--no._length] : (new SaveTranslate());
            context._curMat.copyTo(o._mat);
            var _save = context._save;
            _save[_save._length++] = o;
        }
    }
    SaveTranslate.POOL = SaveBase._createArray();

    class RenderInfo {
    }
    RenderInfo.loopStTm = 0;
    RenderInfo.loopCount = 0;

    class Buffer {
        constructor() {
            this._byteLength = 0;
            this._glBuffer = LayaGL.instance.createBuffer();
        }
        get bufferUsage() {
            return this._bufferUsage;
        }
        _bindForVAO() {
        }
        bind() {
            return false;
        }
        destroy() {
            if (this._glBuffer) {
                LayaGL.instance.deleteBuffer(this._glBuffer);
                this._glBuffer = null;
            }
        }
    }

    class Buffer2D extends Buffer {
        constructor() {
            super();
            this._maxsize = 0;
            this._upload = true;
            this._uploadSize = 0;
            this._bufferSize = 0;
            this._u8Array = null;
        }
        static __int__(gl) {
        }
        get bufferLength() {
            return this._buffer.byteLength;
        }
        set byteLength(value) {
            this.setByteLength(value);
        }
        setByteLength(value) {
            if (this._byteLength !== value) {
                value <= this._bufferSize || (this._resizeBuffer(value * 2 + 256, true));
                this._byteLength = value;
            }
        }
        needSize(sz) {
            var old = this._byteLength;
            if (sz) {
                var needsz = this._byteLength + sz;
                needsz <= this._bufferSize || (this._resizeBuffer(needsz << 1, true));
                this._byteLength = needsz;
            }
            return old;
        }
        _bufferData() {
            this._maxsize = Math.max(this._maxsize, this._byteLength);
            if (RenderInfo.loopCount % 30 == 0) {
                if (this._buffer.byteLength > (this._maxsize + 64)) {
                    this._buffer = this._buffer.slice(0, this._maxsize + 64);
                    this._bufferSize = this._buffer.byteLength;
                    this._checkArrayUse();
                }
                this._maxsize = this._byteLength;
            }
            if (this._uploadSize < this._buffer.byteLength) {
                this._uploadSize = this._buffer.byteLength;
                LayaGL.instance.bufferData(this._bufferType, this._uploadSize, this._bufferUsage);
            }
            LayaGL.instance.bufferSubData(this._bufferType, 0, new Uint8Array(this._buffer, 0, this._byteLength));
        }
        _bufferSubData(offset = 0, dataStart = 0, dataLength = 0) {
            this._maxsize = Math.max(this._maxsize, this._byteLength);
            if (RenderInfo.loopCount % 30 == 0) {
                if (this._buffer.byteLength > (this._maxsize + 64)) {
                    this._buffer = this._buffer.slice(0, this._maxsize + 64);
                    this._bufferSize = this._buffer.byteLength;
                    this._checkArrayUse();
                }
                this._maxsize = this._byteLength;
            }
            if (this._uploadSize < this._buffer.byteLength) {
                this._uploadSize = this._buffer.byteLength;
                LayaGL.instance.bufferData(this._bufferType, this._uploadSize, this._bufferUsage);
            }
            if (dataStart || dataLength) {
                var subBuffer = this._buffer.slice(dataStart, dataLength);
                LayaGL.instance.bufferSubData(this._bufferType, offset, subBuffer);
            }
            else {
                LayaGL.instance.bufferSubData(this._bufferType, offset, this._buffer);
            }
        }
        _checkArrayUse() {
        }
        _bind_uploadForVAO() {
            if (!this._upload)
                return false;
            this._upload = false;
            this._bindForVAO();
            this._bufferData();
            return true;
        }
        _bind_upload() {
            if (!this._upload)
                return false;
            this._upload = false;
            this.bind();
            this._bufferData();
            return true;
        }
        _bind_subUpload(offset = 0, dataStart = 0, dataLength = 0) {
            if (!this._upload)
                return false;
            this._upload = false;
            this.bind();
            this._bufferSubData(offset, dataStart, dataLength);
            return true;
        }
        _resizeBuffer(nsz, copy) {
            var buff = this._buffer;
            if (nsz <= buff.byteLength)
                return this;
            var u8buf = this._u8Array;
            if (copy && buff && buff.byteLength > 0) {
                var newbuffer = new ArrayBuffer(nsz);
                var oldU8Arr = (u8buf && u8buf.buffer == buff) ? u8buf : new Uint8Array(buff);
                u8buf = this._u8Array = new Uint8Array(newbuffer);
                u8buf.set(oldU8Arr, 0);
                buff = this._buffer = newbuffer;
            }
            else {
                buff = this._buffer = new ArrayBuffer(nsz);
                this._u8Array = null;
            }
            this._checkArrayUse();
            this._upload = true;
            this._bufferSize = buff.byteLength;
            return this;
        }
        append(data) {
            this._upload = true;
            var byteLen, n;
            byteLen = data.byteLength;
            if (data instanceof Uint8Array) {
                this._resizeBuffer(this._byteLength + byteLen, true);
                n = new Uint8Array(this._buffer, this._byteLength);
            }
            else if (data instanceof Uint16Array) {
                this._resizeBuffer(this._byteLength + byteLen, true);
                n = new Uint16Array(this._buffer, this._byteLength);
            }
            else if (data instanceof Float32Array) {
                this._resizeBuffer(this._byteLength + byteLen, true);
                n = new Float32Array(this._buffer, this._byteLength);
            }
            n.set(data, 0);
            this._byteLength += byteLen;
            this._checkArrayUse();
        }
        appendU16Array(data, len) {
            this._resizeBuffer(this._byteLength + len * 2, true);
            var u = new Uint16Array(this._buffer, this._byteLength, len);
            if (len == 6) {
                u[0] = data[0];
                u[1] = data[1];
                u[2] = data[2];
                u[3] = data[3];
                u[4] = data[4];
                u[5] = data[5];
            }
            else if (len >= 100) {
                u.set(new Uint16Array(data.buffer, 0, len));
            }
            else {
                for (var i = 0; i < len; i++) {
                    u[i] = data[i];
                }
            }
            this._byteLength += len * 2;
            this._checkArrayUse();
        }
        appendEx(data, type) {
            this._upload = true;
            var byteLen, n;
            byteLen = data.byteLength;
            this._resizeBuffer(this._byteLength + byteLen, true);
            n = new type(this._buffer, this._byteLength);
            n.set(data, 0);
            this._byteLength += byteLen;
            this._checkArrayUse();
        }
        appendEx2(data, type, dataLen, perDataLen = 1) {
            this._upload = true;
            var byteLen, n;
            byteLen = dataLen * perDataLen;
            this._resizeBuffer(this._byteLength + byteLen, true);
            n = new type(this._buffer, this._byteLength);
            var i;
            for (i = 0; i < dataLen; i++) {
                n[i] = data[i];
            }
            this._byteLength += byteLen;
            this._checkArrayUse();
        }
        getBuffer() {
            return this._buffer;
        }
        setNeedUpload() {
            this._upload = true;
        }
        getNeedUpload() {
            return this._upload;
        }
        upload() {
            var gl = LayaGL.instance;
            var scuess = this._bind_upload();
            gl.bindBuffer(this._bufferType, null);
            if (this._bufferType == gl.ARRAY_BUFFER)
                Buffer._bindedVertexBuffer = null;
            if (this._bufferType == gl.ELEMENT_ARRAY_BUFFER)
                Buffer._bindedIndexBuffer = null;
            BaseShader.activeShader = null;
            return scuess;
        }
        subUpload(offset = 0, dataStart = 0, dataLength = 0) {
            var gl = LayaGL.instance;
            var scuess = this._bind_subUpload();
            gl.bindBuffer(this._bufferType, null);
            if (this._bufferType == gl.ARRAY_BUFFER)
                Buffer._bindedVertexBuffer = null;
            if (this._bufferType == gl.ELEMENT_ARRAY_BUFFER)
                Buffer._bindedIndexBuffer = null;
            BaseShader.activeShader = null;
            return scuess;
        }
        _disposeResource() {
            this._upload = true;
            this._uploadSize = 0;
        }
        clear() {
            this._byteLength = 0;
            this._upload = true;
        }
    }
    Buffer2D.FLOAT32 = 4;
    Buffer2D.SHORT = 2;

    class VertexBuffer2D extends Buffer2D {
        constructor(vertexStride, bufferUsage) {
            super();
            this._vertexStride = vertexStride;
            this._bufferUsage = bufferUsage;
            this._bufferType = LayaGL.instance.ARRAY_BUFFER;
            this._buffer = new ArrayBuffer(8);
            this._floatArray32 = new Float32Array(this._buffer);
            this._uint32Array = new Uint32Array(this._buffer);
        }
        get vertexStride() {
            return this._vertexStride;
        }
        getFloat32Array() {
            return this._floatArray32;
        }
        appendArray(data) {
            var oldoff = this._byteLength >> 2;
            this.setByteLength(this._byteLength + data.length * 4);
            var vbdata = this.getFloat32Array();
            vbdata.set(data, oldoff);
            this._upload = true;
        }
        _checkArrayUse() {
            this._floatArray32 && (this._floatArray32 = new Float32Array(this._buffer));
            this._uint32Array && (this._uint32Array = new Uint32Array(this._buffer));
        }
        deleteBuffer() {
            super._disposeResource();
        }
        _bindForVAO() {
            var gl = LayaGL.instance;
            gl.bindBuffer(gl.ARRAY_BUFFER, this._glBuffer);
        }
        bind() {
            if (Buffer._bindedVertexBuffer !== this._glBuffer) {
                var gl = LayaGL.instance;
                gl.bindBuffer(gl.ARRAY_BUFFER, this._glBuffer);
                Buffer._bindedVertexBuffer = this._glBuffer;
                return true;
            }
            return false;
        }
        destroy() {
            super.destroy();
            this._byteLength = 0;
            this._upload = true;
            this._buffer = null;
            this._floatArray32 = null;
        }
    }
    VertexBuffer2D.create = function (vertexStride, bufferUsage = 0x88e8) {
        return new VertexBuffer2D(vertexStride, bufferUsage);
    };

    class IndexBuffer2D extends Buffer2D {
        constructor(bufferUsage = 0x88e4) {
            super();
            this._bufferUsage = bufferUsage;
            this._bufferType = LayaGL.instance.ELEMENT_ARRAY_BUFFER;
            this._buffer = new ArrayBuffer(8);
        }
        _checkArrayUse() {
            this._uint16Array && (this._uint16Array = new Uint16Array(this._buffer));
        }
        getUint16Array() {
            return this._uint16Array || (this._uint16Array = new Uint16Array(this._buffer));
        }
        _bindForVAO() {
            var gl = LayaGL.instance;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glBuffer);
        }
        bind() {
            if (Buffer._bindedIndexBuffer !== this._glBuffer) {
                var gl = LayaGL.instance;
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glBuffer);
                Buffer._bindedIndexBuffer = this._glBuffer;
                return true;
            }
            return false;
        }
        destory() {
            this._uint16Array = null;
            this._buffer = null;
        }
        disposeResource() {
            this._disposeResource();
        }
    }
    IndexBuffer2D.create = function (bufferUsage = 0x88e4) {
        return new IndexBuffer2D(bufferUsage);
    };

    class BufferStateBase {
        constructor() {
            this._nativeVertexArrayObject = LayaGL.layaGPUInstance.createVertexArray();
        }
        bind() {
            if (BufferStateBase._curBindedBufferState !== this) {
                LayaGL.layaGPUInstance.bindVertexArray(this._nativeVertexArrayObject);
                BufferStateBase._curBindedBufferState = this;
            }
        }
        unBind() {
            if (BufferStateBase._curBindedBufferState === this) {
                LayaGL.layaGPUInstance.bindVertexArray(null);
                BufferStateBase._curBindedBufferState = null;
            }
            else {
                throw "BufferState: must call bind() function first.";
            }
        }
        destroy() {
            LayaGL.layaGPUInstance.deleteVertexArray(this._nativeVertexArrayObject);
        }
        bindForNative() {
            LayaGL.instance.bindVertexArray(this._nativeVertexArrayObject);
            BufferStateBase._curBindedBufferState = this;
        }
        unBindForNative() {
            LayaGL.instance.bindVertexArray(null);
            BufferStateBase._curBindedBufferState = null;
        }
    }

    class BufferState2D extends BufferStateBase {
        constructor() {
            super();
        }
    }

    class Mesh2D {
        constructor(stride, vballoc, iballoc) {
            this._stride = 0;
            this.vertNum = 0;
            this.indexNum = 0;
            this._applied = false;
            this._quadNum = 0;
            this.canReuse = false;
            this._stride = stride;
            this._vb = new VertexBuffer2D(stride, LayaGL.instance.DYNAMIC_DRAW);
            if (vballoc) {
                this._vb._resizeBuffer(vballoc, false);
            }
            else {
                Config.webGL2D_MeshAllocMaxMem && this._vb._resizeBuffer(64 * 1024 * stride, false);
            }
            this._ib = new IndexBuffer2D();
            if (iballoc) {
                this._ib._resizeBuffer(iballoc, false);
            }
        }
        cloneWithNewVB() {
            var mesh = new Mesh2D(this._stride, 0, 0);
            mesh._ib = this._ib;
            mesh._quadNum = this._quadNum;
            mesh._attribInfo = this._attribInfo;
            return mesh;
        }
        cloneWithNewVBIB() {
            var mesh = new Mesh2D(this._stride, 0, 0);
            mesh._attribInfo = this._attribInfo;
            return mesh;
        }
        getVBW() {
            this._vb.setNeedUpload();
            return this._vb;
        }
        getVBR() {
            return this._vb;
        }
        getIBR() {
            return this._ib;
        }
        getIBW() {
            this._ib.setNeedUpload();
            return this._ib;
        }
        createQuadIB(QuadNum) {
            this._quadNum = QuadNum;
            this._ib._resizeBuffer(QuadNum * 6 * 2, false);
            this._ib.byteLength = this._ib.bufferLength;
            var bd = this._ib.getUint16Array();
            var idx = 0;
            var curvert = 0;
            for (var i = 0; i < QuadNum; i++) {
                bd[idx++] = curvert;
                bd[idx++] = curvert + 2;
                bd[idx++] = curvert + 1;
                bd[idx++] = curvert;
                bd[idx++] = curvert + 3;
                bd[idx++] = curvert + 2;
                curvert += 4;
            }
            this._ib.setNeedUpload();
        }
        setAttributes(attribs) {
            this._attribInfo = attribs;
            if (this._attribInfo.length % 3 != 0) {
                throw 'Mesh2D setAttributes error!';
            }
        }
        configVAO(gl) {
            if (this._applied)
                return;
            this._applied = true;
            if (!this._vao) {
                this._vao = new BufferState2D();
            }
            this._vao.bind();
            this._vb._bindForVAO();
            this._ib.setNeedUpload();
            this._ib._bind_uploadForVAO();
            var attribNum = this._attribInfo.length / 3;
            var idx = 0;
            for (var i = 0; i < attribNum; i++) {
                var _size = this._attribInfo[idx + 1];
                var _type = this._attribInfo[idx];
                var _off = this._attribInfo[idx + 2];
                gl.enableVertexAttribArray(i);
                gl.vertexAttribPointer(i, _size, _type, false, this._stride, _off);
                idx += 3;
            }
            this._vao.unBind();
        }
        useMesh(gl) {
            this._applied || this.configVAO(gl);
            this._vao.bind();
            this._vb.bind();
            this._ib._bind_upload() || this._ib.bind();
            this._vb._bind_upload() || this._vb.bind();
        }
        getEleNum() {
            return this._ib.getBuffer().byteLength / 2;
        }
        releaseMesh() { }
        destroy() {
        }
        clearVB() {
            this._vb.clear();
        }
    }
    Mesh2D._gvaoid = 0;

    class MeshQuadTexture extends Mesh2D {
        constructor() {
            super(MeshQuadTexture.const_stride, 4, 4);
            this.canReuse = true;
            this.setAttributes(MeshQuadTexture._fixattriInfo);
            if (!MeshQuadTexture._fixib) {
                this.createQuadIB(MeshQuadTexture._maxIB);
                MeshQuadTexture._fixib = this._ib;
            }
            else {
                this._ib = MeshQuadTexture._fixib;
                this._quadNum = MeshQuadTexture._maxIB;
            }
        }
        static __int__() {
            MeshQuadTexture._fixattriInfo = [5126, 4, 0,
                5121, 4, 16,
                5121, 4, 20];
        }
        static getAMesh(mainctx) {
            var ret = null;
            if (MeshQuadTexture._POOL.length) {
                ret = MeshQuadTexture._POOL.pop();
            }
            else
                ret = new MeshQuadTexture();
            mainctx && ret._vb._resizeBuffer(64 * 1024 * MeshQuadTexture.const_stride, false);
            return ret;
        }
        releaseMesh() {
            this._vb.setByteLength(0);
            this.vertNum = 0;
            this.indexNum = 0;
            MeshQuadTexture._POOL.push(this);
        }
        destroy() {
            this._vb.destroy();
            this._vb.deleteBuffer();
        }
        addQuad(pos, uv, color, useTex) {
            var vb = this._vb;
            var vpos = (vb._byteLength >> 2);
            vb.setByteLength((vpos + MeshQuadTexture.const_stride) << 2);
            var vbdata = vb._floatArray32 || vb.getFloat32Array();
            var vbu32Arr = vb._uint32Array;
            var cpos = vpos;
            var useTexVal = useTex ? 0xff : 0;
            vbdata[cpos++] = pos[0];
            vbdata[cpos++] = pos[1];
            vbdata[cpos++] = uv[0];
            vbdata[cpos++] = uv[1];
            vbu32Arr[cpos++] = color;
            vbu32Arr[cpos++] = useTexVal;
            vbdata[cpos++] = pos[2];
            vbdata[cpos++] = pos[3];
            vbdata[cpos++] = uv[2];
            vbdata[cpos++] = uv[3];
            vbu32Arr[cpos++] = color;
            vbu32Arr[cpos++] = useTexVal;
            vbdata[cpos++] = pos[4];
            vbdata[cpos++] = pos[5];
            vbdata[cpos++] = uv[4];
            vbdata[cpos++] = uv[5];
            vbu32Arr[cpos++] = color;
            vbu32Arr[cpos++] = useTexVal;
            vbdata[cpos++] = pos[6];
            vbdata[cpos++] = pos[7];
            vbdata[cpos++] = uv[6];
            vbdata[cpos++] = uv[7];
            vbu32Arr[cpos++] = color;
            vbu32Arr[cpos++] = useTexVal;
            vb._upload = true;
        }
    }
    MeshQuadTexture.const_stride = 24;
    MeshQuadTexture._maxIB = 16 * 1024;
    MeshQuadTexture._POOL = [];

    class MeshTexture extends Mesh2D {
        constructor() {
            super(MeshTexture.const_stride, 4, 4);
            this.canReuse = true;
            this.setAttributes(MeshTexture._fixattriInfo);
        }
        static __init__() {
            MeshTexture._fixattriInfo = [5126, 4, 0,
                5121, 4, 16,
                5121, 4, 20];
        }
        static getAMesh(mainctx) {
            var ret;
            if (MeshTexture._POOL.length) {
                ret = MeshTexture._POOL.pop();
            }
            else
                ret = new MeshTexture();
            mainctx && ret._vb._resizeBuffer(64 * 1024 * MeshTexture.const_stride, false);
            return ret;
        }
        addData(vertices, uvs, idx, matrix, rgba) {
            var vb = this._vb;
            var ib = this._ib;
            var vertsz = vertices.length >> 1;
            var startpos = vb.needSize(vertsz * MeshTexture.const_stride);
            var f32pos = startpos >> 2;
            var vbdata = vb._floatArray32 || vb.getFloat32Array();
            var vbu32Arr = vb._uint32Array;
            var ci = 0;
            var m00 = matrix.a;
            var m01 = matrix.b;
            var m10 = matrix.c;
            var m11 = matrix.d;
            var tx = matrix.tx;
            var ty = matrix.ty;
            var i = 0;
            for (i = 0; i < vertsz; i++) {
                var x = vertices[ci], y = vertices[ci + 1];
                vbdata[f32pos] = x * m00 + y * m10 + tx;
                vbdata[f32pos + 1] = x * m01 + y * m11 + ty;
                vbdata[f32pos + 2] = uvs[ci];
                vbdata[f32pos + 3] = uvs[ci + 1];
                vbu32Arr[f32pos + 4] = rgba;
                vbu32Arr[f32pos + 5] = 0xff;
                f32pos += 6;
                ci += 2;
            }
            vb.setNeedUpload();
            var vertN = this.vertNum;
            var sz = idx.length;
            var stib = ib.needSize(idx.byteLength);
            var cidx = ib.getUint16Array();
            var stibid = stib >> 1;
            if (vertN > 0) {
                var end = stibid + sz;
                var si = 0;
                for (i = stibid; i < end; i++, si++) {
                    cidx[i] = idx[si] + vertN;
                }
            }
            else {
                cidx.set(idx, stibid);
            }
            ib.setNeedUpload();
            this.vertNum += vertsz;
            this.indexNum += idx.length;
        }
        releaseMesh() {
            this._vb.setByteLength(0);
            this._ib.setByteLength(0);
            this.vertNum = 0;
            this.indexNum = 0;
            MeshTexture._POOL.push(this);
        }
        destroy() {
            this._ib.destroy();
            this._vb.destroy();
            this._ib.disposeResource();
            this._vb.deleteBuffer();
        }
    }
    MeshTexture.const_stride = 24;
    MeshTexture._POOL = [];

    class MeshVG extends Mesh2D {
        constructor() {
            super(MeshVG.const_stride, 4, 4);
            this.canReuse = true;
            this.setAttributes(MeshVG._fixattriInfo);
        }
        static __init__() {
            MeshVG._fixattriInfo = [5126, 2, 0,
                5121, 4, 8];
        }
        static getAMesh(mainctx) {
            var ret;
            if (MeshVG._POOL.length) {
                ret = MeshVG._POOL.pop();
            }
            else
                ret = new MeshVG();
            mainctx && ret._vb._resizeBuffer(64 * 1024 * MeshVG.const_stride, false);
            return ret;
        }
        addVertAndIBToMesh(ctx, points, rgba, ib) {
            var startpos = this._vb.needSize(points.length / 2 * MeshVG.const_stride);
            var f32pos = startpos >> 2;
            var vbdata = this._vb._floatArray32 || this._vb.getFloat32Array();
            var vbu32Arr = this._vb._uint32Array;
            var ci = 0;
            var sz = points.length / 2;
            for (var i = 0; i < sz; i++) {
                vbdata[f32pos++] = points[ci];
                vbdata[f32pos++] = points[ci + 1];
                ci += 2;
                vbu32Arr[f32pos++] = rgba;
            }
            this._vb.setNeedUpload();
            this._ib.append(new Uint16Array(ib));
            this._ib.setNeedUpload();
            this.vertNum += sz;
            this.indexNum += ib.length;
        }
        releaseMesh() {
            this._vb.setByteLength(0);
            this._ib.setByteLength(0);
            this.vertNum = 0;
            this.indexNum = 0;
            MeshVG._POOL.push(this);
        }
        destroy() {
            this._ib.destroy();
            this._vb.destroy();
            this._ib.disposeResource();
            this._vb.deleteBuffer();
        }
    }
    MeshVG.const_stride = 12;
    MeshVG._POOL = [];

    class WebGLCacheAsNormalCanvas {
        constructor(ctx, sp) {
            this.submitStartPos = 0;
            this.submitEndPos = 0;
            this.context = null;
            this.touches = [];
            this.submits = [];
            this.sprite = null;
            this.meshlist = [];
            this.cachedClipInfo = new Matrix();
            this.oldTx = 0;
            this.oldTy = 0;
            this.invMat = new Matrix();
            this.context = ctx;
            this.sprite = sp;
            ctx._globalClipMatrix.copyTo(this.cachedClipInfo);
        }
        startRec() {
            if (this.context._charSubmitCache._enbale) {
                this.context._charSubmitCache.enable(false, this.context);
                this.context._charSubmitCache.enable(true, this.context);
            }
            this.context._incache = true;
            this.touches.length = 0;
            this.context.touches = this.touches;
            this.context._globalClipMatrix.copyTo(this.cachedClipInfo);
            this.submits.length = 0;
            this.submitStartPos = this.context._submits._length;
            for (var i = 0, sz = this.meshlist.length; i < sz; i++) {
                var curm = this.meshlist[i];
                curm.canReuse ? (curm.releaseMesh()) : (curm.destroy());
            }
            this.meshlist.length = 0;
            this._mesh = MeshQuadTexture.getAMesh(false);
            this._pathMesh = MeshVG.getAMesh(false);
            this._triangleMesh = MeshTexture.getAMesh(false);
            this.meshlist.push(this._mesh);
            this.meshlist.push(this._pathMesh);
            this.meshlist.push(this._triangleMesh);
            this.context._curSubmit = SubmitBase.RENDERBASE;
            this._oldMesh = this.context._mesh;
            this._oldPathMesh = this.context._pathMesh;
            this._oldTriMesh = this.context._triangleMesh;
            this._oldMeshList = this.context.meshlist;
            this.context._mesh = this._mesh;
            this.context._pathMesh = this._pathMesh;
            this.context._triangleMesh = this._triangleMesh;
            this.context.meshlist = this.meshlist;
            this.oldTx = this.context._curMat.tx;
            this.oldTy = this.context._curMat.ty;
            this.context._curMat.tx = 0;
            this.context._curMat.ty = 0;
            this.context._curMat.copyTo(this.invMat);
            this.invMat.invert();
        }
        endRec() {
            if (this.context._charSubmitCache._enbale) {
                this.context._charSubmitCache.enable(false, this.context);
                this.context._charSubmitCache.enable(true, this.context);
            }
            var parsubmits = this.context._submits;
            this.submitEndPos = parsubmits._length;
            var num = this.submitEndPos - this.submitStartPos;
            for (var i = 0; i < num; i++) {
                this.submits.push(parsubmits[this.submitStartPos + i]);
            }
            parsubmits._length -= num;
            this.context._mesh = this._oldMesh;
            this.context._pathMesh = this._oldPathMesh;
            this.context._triangleMesh = this._oldTriMesh;
            this.context.meshlist = this._oldMeshList;
            this.context._curSubmit = SubmitBase.RENDERBASE;
            this.context._curMat.tx = this.oldTx;
            this.context._curMat.ty = this.oldTy;
            this.context.touches = null;
            this.context._incache = false;
        }
        isCacheValid() {
            var curclip = this.context._globalClipMatrix;
            if (curclip.a != this.cachedClipInfo.a || curclip.b != this.cachedClipInfo.b || curclip.c != this.cachedClipInfo.c
                || curclip.d != this.cachedClipInfo.d || curclip.tx != this.cachedClipInfo.tx || curclip.ty != this.cachedClipInfo.ty)
                return false;
            return true;
        }
        flushsubmit() {
            var curSubmit = SubmitBase.RENDERBASE;
            this.submits.forEach(function (subm) {
                if (subm == SubmitBase.RENDERBASE)
                    return;
                SubmitBase.preRender = curSubmit;
                curSubmit = subm;
                subm.renderSubmit();
            });
        }
        releaseMem() {
        }
    }
    WebGLCacheAsNormalCanvas.matI = new Matrix();

    var texture_vs = "/*\r\n\ttexture和fillrect使用的。\r\n*/\r\nattribute vec4 posuv;\r\nattribute vec4 attribColor;\r\nattribute vec4 attribFlags;\r\n//attribute vec4 clipDir;\r\n//attribute vec2 clipRect;\r\nuniform vec4 clipMatDir;\r\nuniform vec2 clipMatPos;\t\t// 这个是全局的，不用再应用矩阵了。\r\nvarying vec2 cliped;\r\nuniform vec2 size;\r\nuniform vec2 clipOff;\t\t\t// 使用要把clip偏移。cacheas normal用. 只用了[0]\r\n#ifdef WORLDMAT\r\n\tuniform mat4 mmat;\r\n#endif\r\n#ifdef MVP3D\r\n\tuniform mat4 u_MvpMatrix;\r\n#endif\r\nvarying vec4 v_texcoordAlpha;\r\nvarying vec4 v_color;\r\nvarying float v_useTex;\r\n\r\nvoid main() {\r\n\r\n\tvec4 pos = vec4(posuv.xy,0.,1.);\r\n#ifdef WORLDMAT\r\n\tpos=mmat*pos;\r\n#endif\r\n\tvec4 pos1  =vec4((pos.x/size.x-0.5)*2.0,(0.5-pos.y/size.y)*2.0,0.,1.0);\r\n#ifdef MVP3D\r\n\tgl_Position=u_MvpMatrix*pos1;\r\n#else\r\n\tgl_Position=pos1;\r\n#endif\r\n\tv_texcoordAlpha.xy = posuv.zw;\r\n\t//v_texcoordAlpha.z = attribColor.a/255.0;\r\n\tv_color = attribColor/255.0;\r\n\tv_color.xyz*=v_color.w;//反正后面也要预乘\r\n\t\r\n\tv_useTex = attribFlags.r/255.0;\r\n\tfloat clipw = length(clipMatDir.xy);\r\n\tfloat cliph = length(clipMatDir.zw);\r\n\t\r\n\tvec2 clpos = clipMatPos.xy;\r\n\t#ifdef WORLDMAT\r\n\t\t// 如果有mmat，需要修改clipMatPos,因为 这是cacheas normal （如果不是就错了）， clipMatPos被去掉了偏移\r\n\t\tif(clipOff[0]>0.0){\r\n\t\t\tclpos.x+=mmat[3].x;\t//tx\t最简单处理\r\n\t\t\tclpos.y+=mmat[3].y;\t//ty\r\n\t\t}\r\n\t#endif\r\n\tvec2 clippos = pos.xy - clpos;\t//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放\r\n\tif(clipw>20000. && cliph>20000.)\r\n\t\tcliped = vec2(0.5,0.5);\r\n\telse {\r\n\t\t//转成0到1之间。/clipw/clipw 表示clippos与normalize之后的clip朝向点积之后，再除以clipw\r\n\t\tcliped=vec2( dot(clippos,clipMatDir.xy)/clipw/clipw, dot(clippos,clipMatDir.zw)/cliph/cliph);\r\n\t}\r\n\r\n}";

    var texture_ps = "/*\r\n\ttexture和fillrect使用的。\r\n*/\r\n#ifdef FSHIGHPRECISION\r\nprecision highp float;\r\n#else\r\nprecision mediump float;\r\n#endif\r\n\r\nvarying vec4 v_texcoordAlpha;\r\nvarying vec4 v_color;\r\nvarying float v_useTex;\r\nuniform sampler2D texture;\r\nvarying vec2 cliped;\r\n\r\n#ifdef BLUR_FILTER\r\nuniform vec4 strength_sig2_2sig2_gauss1;\r\nuniform vec2 blurInfo;\r\n\r\n#define PI 3.141593\r\n\r\nfloat getGaussian(float x, float y){\r\n    return strength_sig2_2sig2_gauss1.w*exp(-(x*x+y*y)/strength_sig2_2sig2_gauss1.z);\r\n}\r\n\r\nvec4 blur(){\r\n    const float blurw = 9.0;\r\n    vec4 vec4Color = vec4(0.0,0.0,0.0,0.0);\r\n    vec2 halfsz=vec2(blurw,blurw)/2.0/blurInfo;    \r\n    vec2 startpos=v_texcoordAlpha.xy-halfsz;\r\n    vec2 ctexcoord = startpos;\r\n    vec2 step = 1.0/blurInfo;  //每个像素      \r\n    \r\n    for(float y = 0.0;y<=blurw; ++y){\r\n        ctexcoord.x=startpos.x;\r\n        for(float x = 0.0;x<=blurw; ++x){\r\n            //TODO 纹理坐标的固定偏移应该在vs中处理\r\n            vec4Color += texture2D(texture, ctexcoord)*getGaussian(x-blurw/2.0,y-blurw/2.0);\r\n            ctexcoord.x+=step.x;\r\n        }\r\n        ctexcoord.y+=step.y;\r\n    }\r\n    return vec4Color;\r\n}\r\n#endif\r\n\r\n#ifdef COLOR_FILTER\r\nuniform vec4 colorAlpha;\r\nuniform mat4 colorMat;\r\n#endif\r\n\r\n#ifdef GLOW_FILTER\r\nuniform vec4 u_color;\r\nuniform vec4 u_blurInfo1;\r\nuniform vec4 u_blurInfo2;\r\n#endif\r\n\r\n#ifdef COLOR_ADD\r\nuniform vec4 colorAdd;\r\n#endif\r\n\r\n#ifdef FILLTEXTURE\t\r\nuniform vec4 u_TexRange;//startu,startv,urange, vrange\r\n#endif\r\nvoid main() {\r\n\tif(cliped.x<0.) discard;\r\n\tif(cliped.x>1.) discard;\r\n\tif(cliped.y<0.) discard;\r\n\tif(cliped.y>1.) discard;\r\n\t\r\n#ifdef FILLTEXTURE\t\r\n   vec4 color= texture2D(texture, fract(v_texcoordAlpha.xy)*u_TexRange.zw + u_TexRange.xy);\r\n#else\r\n   vec4 color= texture2D(texture, v_texcoordAlpha.xy);\r\n#endif\r\n\r\n   if(v_useTex<=0.)color = vec4(1.,1.,1.,1.);\r\n   color.a*=v_color.w;\r\n   //color.rgb*=v_color.w;\r\n   color.rgb*=v_color.rgb;\r\n   gl_FragColor=color;\r\n   \r\n   #ifdef COLOR_ADD\r\n\tgl_FragColor = vec4(colorAdd.rgb,colorAdd.a*gl_FragColor.a);\r\n\tgl_FragColor.xyz *= colorAdd.a;\r\n   #endif\r\n   \r\n   #ifdef BLUR_FILTER\r\n\tgl_FragColor =   blur();\r\n\tgl_FragColor.w*=v_color.w;   \r\n   #endif\r\n   \r\n   #ifdef COLOR_FILTER\r\n\tmat4 alphaMat =colorMat;\r\n\r\n\talphaMat[0][3] *= gl_FragColor.a;\r\n\talphaMat[1][3] *= gl_FragColor.a;\r\n\talphaMat[2][3] *= gl_FragColor.a;\r\n\r\n\tgl_FragColor = gl_FragColor * alphaMat;\r\n\tgl_FragColor += colorAlpha/255.0*gl_FragColor.a;\r\n   #endif\r\n   \r\n   #ifdef GLOW_FILTER\r\n\tconst float c_IterationTime = 10.0;\r\n\tfloat floatIterationTotalTime = c_IterationTime * c_IterationTime;\r\n\tvec4 vec4Color = vec4(0.0,0.0,0.0,0.0);\r\n\tvec2 vec2FilterDir = vec2(-(u_blurInfo1.z)/u_blurInfo2.x,-(u_blurInfo1.w)/u_blurInfo2.y);\r\n\tvec2 vec2FilterOff = vec2(u_blurInfo1.x/u_blurInfo2.x/c_IterationTime * 2.0,u_blurInfo1.y/u_blurInfo2.y/c_IterationTime * 2.0);\r\n\tfloat maxNum = u_blurInfo1.x * u_blurInfo1.y;\r\n\tvec2 vec2Off = vec2(0.0,0.0);\r\n\tfloat floatOff = c_IterationTime/2.0;\r\n\tfor(float i = 0.0;i<=c_IterationTime; ++i){\r\n\t\tfor(float j = 0.0;j<=c_IterationTime; ++j){\r\n\t\t\tvec2Off = vec2(vec2FilterOff.x * (i - floatOff),vec2FilterOff.y * (j - floatOff));\r\n\t\t\tvec4Color += texture2D(texture, v_texcoordAlpha.xy + vec2FilterDir + vec2Off)/floatIterationTotalTime;\r\n\t\t}\r\n\t}\r\n\tgl_FragColor = vec4(u_color.rgb,vec4Color.a * u_blurInfo2.z);\r\n\tgl_FragColor.rgb *= gl_FragColor.a;   \r\n   #endif\r\n   \r\n}";

    var prime_vs = "attribute vec4 position;\r\nattribute vec4 attribColor;\r\n//attribute vec4 clipDir;\r\n//attribute vec2 clipRect;\r\nuniform vec4 clipMatDir;\r\nuniform vec2 clipMatPos;\r\n#ifdef WORLDMAT\r\n\tuniform mat4 mmat;\r\n#endif\r\nuniform mat4 u_mmat2;\r\n//uniform vec2 u_pos;\r\nuniform vec2 size;\r\nvarying vec4 color;\r\n//vec4 dirxy=vec4(0.9,0.1, -0.1,0.9);\r\n//vec4 clip=vec4(100.,30.,300.,600.);\r\nvarying vec2 cliped;\r\nvoid main(){\r\n\t\r\n#ifdef WORLDMAT\r\n\tvec4 pos=mmat*vec4(position.xy,0.,1.);\r\n\tgl_Position =vec4((pos.x/size.x-0.5)*2.0,(0.5-pos.y/size.y)*2.0,pos.z,1.0);\r\n#else\r\n\tgl_Position =vec4((position.x/size.x-0.5)*2.0,(0.5-position.y/size.y)*2.0,position.z,1.0);\r\n#endif\t\r\n\tfloat clipw = length(clipMatDir.xy);\r\n\tfloat cliph = length(clipMatDir.zw);\r\n\tvec2 clippos = position.xy - clipMatPos.xy;\t//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放\r\n\tif(clipw>20000. && cliph>20000.)\r\n\t\tcliped = vec2(0.5,0.5);\r\n\telse {\r\n\t\t//clipdir是带缩放的方向，由于上面clippos是在缩放后的空间计算的，所以需要把方向先normalize一下\r\n\t\tcliped=vec2( dot(clippos,clipMatDir.xy)/clipw/clipw, dot(clippos,clipMatDir.zw)/cliph/cliph);\r\n\t}\r\n  //pos2d.x = dot(clippos,dirx);\r\n  color=attribColor/255.;\r\n}";

    var prime_ps = "precision mediump float;\r\n//precision mediump float;\r\nvarying vec4 color;\r\n//uniform float alpha;\r\nvarying vec2 cliped;\r\nvoid main(){\r\n\t//vec4 a=vec4(color.r, color.g, color.b, 1);\r\n\t//a.a*=alpha;\r\n    gl_FragColor= color;// vec4(color.r, color.g, color.b, alpha);\r\n\tgl_FragColor.rgb*=color.a;\r\n\tif(cliped.x<0.) discard;\r\n\tif(cliped.x>1.) discard;\r\n\tif(cliped.y<0.) discard;\r\n\tif(cliped.y>1.) discard;\r\n}";

    var skin_vs = "attribute vec2 position;\r\nattribute vec2 texcoord;\r\nattribute vec4 color;\r\nuniform vec2 size;\r\nuniform float offsetX;\r\nuniform float offsetY;\r\nuniform mat4 mmat;\r\nuniform mat4 u_mmat2;\r\nvarying vec2 v_texcoord;\r\nvarying vec4 v_color;\r\nvoid main() {\r\n  vec4 pos=mmat*u_mmat2*vec4(offsetX+position.x,offsetY+position.y,0,1 );\r\n  gl_Position = vec4((pos.x/size.x-0.5)*2.0,(0.5-pos.y/size.y)*2.0,pos.z,1.0);\r\n  v_color = color;\r\n  v_color.rgb *= v_color.a;\r\n  v_texcoord = texcoord;  \r\n}";

    var skin_ps = "precision mediump float;\r\nvarying vec2 v_texcoord;\r\nvarying vec4 v_color;\r\nuniform sampler2D texture;\r\nuniform float alpha;\r\nvoid main() {\r\n\tvec4 t_color = texture2D(texture, v_texcoord);\r\n\tgl_FragColor = t_color.rgba * v_color;\r\n\tgl_FragColor *= alpha;\r\n}";

    class Shader2D {
        constructor() {
            this.ALPHA = 1;
            this.defines = new ShaderDefines2D();
            this.shaderType = 0;
            this.fillStyle = DrawStyle.DEFAULT;
            this.strokeStyle = DrawStyle.DEFAULT;
        }
        destroy() {
            this.defines = null;
            this.filters = null;
        }
        static __init__() {
            Shader.preCompile2D(0, ShaderDefines2D.TEXTURE2D, texture_vs, texture_ps, null);
            Shader.preCompile2D(0, ShaderDefines2D.PRIMITIVE, prime_vs, prime_ps, null);
            Shader.preCompile2D(0, ShaderDefines2D.SKINMESH, skin_vs, skin_ps, null);
        }
    }

    class SkinMeshBuffer {
        constructor() {
            var gl = LayaGL.instance;
            this.ib = IndexBuffer2D.create(gl.DYNAMIC_DRAW);
            this.vb = VertexBuffer2D.create(8);
        }
        static getInstance() {
            return SkinMeshBuffer.instance = SkinMeshBuffer.instance || new SkinMeshBuffer();
        }
        addSkinMesh(skinMesh) {
            skinMesh.getData2(this.vb, this.ib, this.vb._byteLength / 32);
        }
        reset() {
            this.vb.clear();
            this.ib.clear();
        }
    }

    class BasePoly {
        static createLine2(p, indices, lineWidth, indexBase, outVertex, loop) {
            if (p.length < 4)
                return null;
            var points = BasePoly.tempData.length > (p.length + 2) ? BasePoly.tempData : new Array(p.length + 2);
            points[0] = p[0];
            points[1] = p[1];
            var newlen = 2;
            var i = 0;
            var length = p.length;
            for (i = 2; i < length; i += 2) {
                if (Math.abs(p[i] - p[i - 2]) + Math.abs(p[i + 1] - p[i - 1]) > 0.01) {
                    points[newlen++] = p[i];
                    points[newlen++] = p[i + 1];
                }
            }
            if (loop && Math.abs(p[0] - points[newlen - 2]) + Math.abs(p[1] - points[newlen - 1]) > 0.01) {
                points[newlen++] = p[0];
                points[newlen++] = p[1];
            }
            var result = outVertex;
            length = newlen / 2;
            var w = lineWidth / 2;
            var px, py, p1x, p1y, p2x, p2y, p3x, p3y;
            var perpx, perpy, perp2x, perp2y;
            var a1, b1, c1, a2, b2, c2;
            var denom, dist;
            p1x = points[0];
            p1y = points[1];
            p2x = points[2];
            p2y = points[3];
            perpx = -(p1y - p2y);
            perpy = p1x - p2x;
            dist = Math.sqrt(perpx * perpx + perpy * perpy);
            perpx = perpx / dist * w;
            perpy = perpy / dist * w;
            result.push(p1x - perpx, p1y - perpy, p1x + perpx, p1y + perpy);
            for (i = 1; i < length - 1; i++) {
                p1x = points[(i - 1) * 2];
                p1y = points[(i - 1) * 2 + 1];
                p2x = points[(i) * 2];
                p2y = points[(i) * 2 + 1];
                p3x = points[(i + 1) * 2];
                p3y = points[(i + 1) * 2 + 1];
                perpx = -(p1y - p2y);
                perpy = p1x - p2x;
                dist = Math.sqrt(perpx * perpx + perpy * perpy);
                perpx = perpx / dist * w;
                perpy = perpy / dist * w;
                perp2x = -(p2y - p3y);
                perp2y = p2x - p3x;
                dist = Math.sqrt(perp2x * perp2x + perp2y * perp2y);
                perp2x = perp2x / dist * w;
                perp2y = perp2y / dist * w;
                a1 = (-perpy + p1y) - (-perpy + p2y);
                b1 = (-perpx + p2x) - (-perpx + p1x);
                c1 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y);
                a2 = (-perp2y + p3y) - (-perp2y + p2y);
                b2 = (-perp2x + p2x) - (-perp2x + p3x);
                c2 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y);
                denom = a1 * b2 - a2 * b1;
                if (Math.abs(denom) < 0.1) {
                    denom += 10.1;
                    result.push(p2x - perpx, p2y - perpy, p2x + perpx, p2y + perpy);
                    continue;
                }
                px = (b1 * c2 - b2 * c1) / denom;
                py = (a2 * c1 - a1 * c2) / denom;
                result.push(px, py, p2x - (px - p2x), p2y - (py - p2y));
            }
            p1x = points[newlen - 4];
            p1y = points[newlen - 3];
            p2x = points[newlen - 2];
            p2y = points[newlen - 1];
            perpx = -(p1y - p2y);
            perpy = p1x - p2x;
            dist = Math.sqrt(perpx * perpx + perpy * perpy);
            perpx = perpx / dist * w;
            perpy = perpy / dist * w;
            result.push(p2x - perpx, p2y - perpy, p2x + perpx, p2y + perpy);
            for (i = 1; i < length; i++) {
                indices.push(indexBase + (i - 1) * 2, indexBase + (i - 1) * 2 + 1, indexBase + i * 2 + 1, indexBase + i * 2 + 1, indexBase + i * 2, indexBase + (i - 1) * 2);
            }
            return result;
        }
        static createLineTriangle(path, color, width, loop, outvb, vbstride, outib) {
            var points = path.slice();
            var ptlen = points.length;
            var p1x = points[0], p1y = points[1];
            var p2x = points[2], p2y = points[2];
            var len = 0;
            var rp = 0;
            var dx = 0, dy = 0;
            var pointnum = ptlen / 2;
            if (pointnum <= 1)
                return;
            if (pointnum == 2) {
                return;
            }
            var tmpData = new Array(pointnum * 4);
            var realPtNum = 0;
            var ci = 0;
            for (var i = 0; i < pointnum - 1; i++) {
                p1x = points[ci++], p1y = points[ci++];
                p2x = points[ci++], p2y = points[ci++];
                dx = p2x - p1x, dy = p2y - p1y;
                if (dx != 0 && dy != 0) {
                    len = Math.sqrt(dx * dx + dy * dy);
                    if (len > 1e-3) {
                        rp = realPtNum * 4;
                        tmpData[rp] = p1x;
                        tmpData[rp + 1] = p1y;
                        tmpData[rp + 2] = dx / len;
                        tmpData[rp + 3] = dy / len;
                        realPtNum++;
                    }
                }
            }
            if (loop) {
                p1x = points[ptlen - 2], p1y = points[ptlen - 1];
                p2x = points[0], p2y = points[1];
                dx = p2x - p1x, dy = p2y - p1y;
                if (dx != 0 && dy != 0) {
                    len = Math.sqrt(dx * dx + dy * dy);
                    if (len > 1e-3) {
                        rp = realPtNum * 4;
                        tmpData[rp] = p1x;
                        tmpData[rp + 1] = p1y;
                        tmpData[rp + 2] = dx / len;
                        tmpData[rp + 3] = dy / len;
                        realPtNum++;
                    }
                }
            }
            else {
                rp = realPtNum * 4;
                tmpData[rp] = p1x;
                tmpData[rp + 1] = p1y;
                tmpData[rp + 2] = dx / len;
                tmpData[rp + 3] = dy / len;
                realPtNum++;
            }
            ci = 0;
            for (i = 0; i < pointnum; i++) {
                p1x = points[ci], p1y = points[ci + 1];
                p2x = points[ci + 2], p2y = points[ci + 3];
                var p3x = points[ci + 4], p3y = points[ci + 5];
            }
        }
    }
    BasePoly.tempData = new Array(256);

    class EarcutNode {
        constructor(i, x, y) {
            this.i = i;
            this.x = x;
            this.y = y;
            this.prev = null;
            this.next = null;
            this.z = null;
            this.prevZ = null;
            this.nextZ = null;
            this.steiner = false;
        }
    }

    class Earcut {
        static earcut(data, holeIndices, dim) {
            dim = dim || 2;
            var hasHoles = holeIndices && holeIndices.length, outerLen = hasHoles ? holeIndices[0] * dim : data.length, outerNode = Earcut.linkedList(data, 0, outerLen, dim, true), triangles = [];
            if (!outerNode)
                return triangles;
            var minX, minY, maxX, maxY, x, y, invSize;
            if (hasHoles)
                outerNode = Earcut.eliminateHoles(data, holeIndices, outerNode, dim);
            if (data.length > 80 * dim) {
                minX = maxX = data[0];
                minY = maxY = data[1];
                for (var i = dim; i < outerLen; i += dim) {
                    x = data[i];
                    y = data[i + 1];
                    if (x < minX)
                        minX = x;
                    if (y < minY)
                        minY = y;
                    if (x > maxX)
                        maxX = x;
                    if (y > maxY)
                        maxY = y;
                }
                invSize = Math.max(maxX - minX, maxY - minY);
                invSize = invSize !== 0 ? 1 / invSize : 0;
            }
            Earcut.earcutLinked(outerNode, triangles, dim, minX, minY, invSize);
            return triangles;
        }
        static linkedList(data, start, end, dim, clockwise) {
            var i, last;
            if (clockwise === (Earcut.signedArea(data, start, end, dim) > 0)) {
                for (i = start; i < end; i += dim)
                    last = Earcut.insertNode(i, data[i], data[i + 1], last);
            }
            else {
                for (i = end - dim; i >= start; i -= dim)
                    last = Earcut.insertNode(i, data[i], data[i + 1], last);
            }
            if (last && Earcut.equals(last, last.next)) {
                Earcut.removeNode(last);
                last = last.next;
            }
            return last;
        }
        static filterPoints(start, end) {
            if (!start)
                return start;
            if (!end)
                end = start;
            var p = start, again;
            do {
                again = false;
                if (!p.steiner && (Earcut.equals(p, p.next) || Earcut.area(p.prev, p, p.next) === 0)) {
                    Earcut.removeNode(p);
                    p = end = p.prev;
                    if (p === p.next)
                        break;
                    again = true;
                }
                else {
                    p = p.next;
                }
            } while (again || p !== end);
            return end;
        }
        static earcutLinked(ear, triangles, dim, minX, minY, invSize, pass = null) {
            if (!ear)
                return;
            if (!pass && invSize)
                Earcut.indexCurve(ear, minX, minY, invSize);
            var stop = ear, prev, next;
            while (ear.prev !== ear.next) {
                prev = ear.prev;
                next = ear.next;
                if (invSize ? Earcut.isEarHashed(ear, minX, minY, invSize) : Earcut.isEar(ear)) {
                    triangles.push(prev.i / dim);
                    triangles.push(ear.i / dim);
                    triangles.push(next.i / dim);
                    Earcut.removeNode(ear);
                    ear = next.next;
                    stop = next.next;
                    continue;
                }
                ear = next;
                if (ear === stop) {
                    if (!pass) {
                        Earcut.earcutLinked(Earcut.filterPoints(ear, null), triangles, dim, minX, minY, invSize, 1);
                    }
                    else if (pass === 1) {
                        ear = Earcut.cureLocalIntersections(ear, triangles, dim);
                        Earcut.earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
                    }
                    else if (pass === 2) {
                        Earcut.splitEarcut(ear, triangles, dim, minX, minY, invSize);
                    }
                    break;
                }
            }
        }
        static isEar(ear) {
            var a = ear.prev, b = ear, c = ear.next;
            if (Earcut.area(a, b, c) >= 0)
                return false;
            var p = ear.next.next;
            while (p !== ear.prev) {
                if (Earcut.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                    Earcut.area(p.prev, p, p.next) >= 0)
                    return false;
                p = p.next;
            }
            return true;
        }
        static isEarHashed(ear, minX, minY, invSize) {
            var a = ear.prev, b = ear, c = ear.next;
            if (Earcut.area(a, b, c) >= 0)
                return false;
            var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x), minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y), maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x), maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);
            var minZ = Earcut.zOrder(minTX, minTY, minX, minY, invSize), maxZ = Earcut.zOrder(maxTX, maxTY, minX, minY, invSize);
            var p = ear.nextZ;
            while (p && p.z <= maxZ) {
                if (p !== ear.prev && p !== ear.next &&
                    Earcut.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                    Earcut.area(p.prev, p, p.next) >= 0)
                    return false;
                p = p.nextZ;
            }
            p = ear.prevZ;
            while (p && p.z >= minZ) {
                if (p !== ear.prev && p !== ear.next &&
                    Earcut.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                    Earcut.area(p.prev, p, p.next) >= 0)
                    return false;
                p = p.prevZ;
            }
            return true;
        }
        static cureLocalIntersections(start, triangles, dim) {
            var p = start;
            do {
                var a = p.prev, b = p.next.next;
                if (!Earcut.equals(a, b) && Earcut.intersects(a, p, p.next, b) && Earcut.locallyInside(a, b) && Earcut.locallyInside(b, a)) {
                    triangles.push(a.i / dim);
                    triangles.push(p.i / dim);
                    triangles.push(b.i / dim);
                    Earcut.removeNode(p);
                    Earcut.removeNode(p.next);
                    p = start = b;
                }
                p = p.next;
            } while (p !== start);
            return p;
        }
        static splitEarcut(start, triangles, dim, minX, minY, invSize) {
            var a = start;
            do {
                var b = a.next.next;
                while (b !== a.prev) {
                    if (a.i !== b.i && Earcut.isValidDiagonal(a, b)) {
                        var c = Earcut.splitPolygon(a, b);
                        a = Earcut.filterPoints(a, a.next);
                        c = Earcut.filterPoints(c, c.next);
                        Earcut.earcutLinked(a, triangles, dim, minX, minY, invSize);
                        Earcut.earcutLinked(c, triangles, dim, minX, minY, invSize);
                        return;
                    }
                    b = b.next;
                }
                a = a.next;
            } while (a !== start);
        }
        static eliminateHoles(data, holeIndices, outerNode, dim) {
            var queue = [], i, len, start, end, list;
            for (i = 0, len = holeIndices.length; i < len; i++) {
                start = holeIndices[i] * dim;
                end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
                list = Earcut.linkedList(data, start, end, dim, false);
                if (list === list.next)
                    list.steiner = true;
                queue.push(Earcut.getLeftmost(list));
            }
            queue.sort(Earcut.compareX);
            for (i = 0; i < queue.length; i++) {
                Earcut.eliminateHole(queue[i], outerNode);
                outerNode = Earcut.filterPoints(outerNode, outerNode.next);
            }
            return outerNode;
        }
        static compareX(a, b) {
            return a.x - b.x;
        }
        static eliminateHole(hole, outerNode) {
            outerNode = Earcut.findHoleBridge(hole, outerNode);
            if (outerNode) {
                var b = Earcut.splitPolygon(outerNode, hole);
                Earcut.filterPoints(b, b.next);
            }
        }
        static findHoleBridge(hole, outerNode) {
            var p = outerNode, hx = hole.x, hy = hole.y, qx = -Infinity, m;
            do {
                if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
                    var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
                    if (x <= hx && x > qx) {
                        qx = x;
                        if (x === hx) {
                            if (hy === p.y)
                                return p;
                            if (hy === p.next.y)
                                return p.next;
                        }
                        m = p.x < p.next.x ? p : p.next;
                    }
                }
                p = p.next;
            } while (p !== outerNode);
            if (!m)
                return null;
            if (hx === qx)
                return m.prev;
            var stop = m, mx = m.x, my = m.y, tanMin = Infinity, tan;
            p = m.next;
            while (p !== stop) {
                if (hx >= p.x && p.x >= mx && hx !== p.x &&
                    Earcut.pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
                    tan = Math.abs(hy - p.y) / (hx - p.x);
                    if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && Earcut.locallyInside(p, hole)) {
                        m = p;
                        tanMin = tan;
                    }
                }
                p = p.next;
            }
            return m;
        }
        static indexCurve(start, minX, minY, invSize) {
            var p = start;
            do {
                if (p.z === null)
                    p.z = Earcut.zOrder(p.x, p.y, minX, minY, invSize);
                p.prevZ = p.prev;
                p.nextZ = p.next;
                p = p.next;
            } while (p !== start);
            p.prevZ.nextZ = null;
            p.prevZ = null;
            Earcut.sortLinked(p);
        }
        static sortLinked(list) {
            var i, p, q, e, tail, numMerges, pSize, qSize, inSize = 1;
            do {
                p = list;
                list = null;
                tail = null;
                numMerges = 0;
                while (p) {
                    numMerges++;
                    q = p;
                    pSize = 0;
                    for (i = 0; i < inSize; i++) {
                        pSize++;
                        q = q.nextZ;
                        if (!q)
                            break;
                    }
                    qSize = inSize;
                    while (pSize > 0 || (qSize > 0 && q)) {
                        if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                            e = p;
                            p = p.nextZ;
                            pSize--;
                        }
                        else {
                            e = q;
                            q = q.nextZ;
                            qSize--;
                        }
                        if (tail)
                            tail.nextZ = e;
                        else
                            list = e;
                        e.prevZ = tail;
                        tail = e;
                    }
                    p = q;
                }
                tail.nextZ = null;
                inSize *= 2;
            } while (numMerges > 1);
            return list;
        }
        static zOrder(x, y, minX, minY, invSize) {
            x = 32767 * (x - minX) * invSize;
            y = 32767 * (y - minY) * invSize;
            x = (x | (x << 8)) & 0x00FF00FF;
            x = (x | (x << 4)) & 0x0F0F0F0F;
            x = (x | (x << 2)) & 0x33333333;
            x = (x | (x << 1)) & 0x55555555;
            y = (y | (y << 8)) & 0x00FF00FF;
            y = (y | (y << 4)) & 0x0F0F0F0F;
            y = (y | (y << 2)) & 0x33333333;
            y = (y | (y << 1)) & 0x55555555;
            return x | (y << 1);
        }
        static getLeftmost(start) {
            var p = start, leftmost = start;
            do {
                if (p.x < leftmost.x)
                    leftmost = p;
                p = p.next;
            } while (p !== start);
            return leftmost;
        }
        static pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
            return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
                (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
                (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
        }
        static isValidDiagonal(a, b) {
            return a.next.i !== b.i && a.prev.i !== b.i && !Earcut.intersectsPolygon(a, b) &&
                Earcut.locallyInside(a, b) && Earcut.locallyInside(b, a) && Earcut.middleInside(a, b);
        }
        static area(p, q, r) {
            return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        }
        static equals(p1, p2) {
            return p1.x === p2.x && p1.y === p2.y;
        }
        static intersects(p1, q1, p2, q2) {
            if ((Earcut.equals(p1, q1) && Earcut.equals(p2, q2)) ||
                (Earcut.equals(p1, q2) && Earcut.equals(p2, q1)))
                return true;
            return Earcut.area(p1, q1, p2) > 0 !== Earcut.area(p1, q1, q2) > 0 &&
                Earcut.area(p2, q2, p1) > 0 !== Earcut.area(p2, q2, q1) > 0;
        }
        static intersectsPolygon(a, b) {
            var p = a;
            do {
                if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                    Earcut.intersects(p, p.next, a, b))
                    return true;
                p = p.next;
            } while (p !== a);
            return false;
        }
        static locallyInside(a, b) {
            return Earcut.area(a.prev, a, a.next) < 0 ?
                Earcut.area(a, b, a.next) >= 0 && Earcut.area(a, a.prev, b) >= 0 :
                Earcut.area(a, b, a.prev) < 0 || Earcut.area(a, a.next, b) < 0;
        }
        static middleInside(a, b) {
            var p = a, inside = false, px = (a.x + b.x) / 2, py = (a.y + b.y) / 2;
            do {
                if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                    (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
                    inside = !inside;
                p = p.next;
            } while (p !== a);
            return inside;
        }
        static splitPolygon(a, b) {
            var a2 = new EarcutNode(a.i, a.x, a.y), b2 = new EarcutNode(b.i, b.x, b.y), an = a.next, bp = b.prev;
            a.next = b;
            b.prev = a;
            a2.next = an;
            an.prev = a2;
            b2.next = a2;
            a2.prev = b2;
            bp.next = b2;
            b2.prev = bp;
            return b2;
        }
        static insertNode(i, x, y, last) {
            var p = new EarcutNode(i, x, y);
            if (!last) {
                p.prev = p;
                p.next = p;
            }
            else {
                p.next = last.next;
                p.prev = last;
                last.next.prev = p;
                last.next = p;
            }
            return p;
        }
        static removeNode(p) {
            p.next.prev = p.prev;
            p.prev.next = p.next;
            if (p.prevZ)
                p.prevZ.nextZ = p.nextZ;
            if (p.nextZ)
                p.nextZ.prevZ = p.prevZ;
        }
        static signedArea(data, start, end, dim) {
            var sum = 0;
            for (var i = start, j = end - dim; i < end; i += dim) {
                sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
                j = i;
            }
            return sum;
        }
    }

    class CONST3D2D {
    }
    CONST3D2D.BYTES_PE = 4;
    CONST3D2D.BYTES_PIDX = 2;
    CONST3D2D.defaultMatrix4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    CONST3D2D.defaultMinusYMatrix4 = [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    CONST3D2D.uniformMatrix3 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
    CONST3D2D._TMPARRAY = [];
    CONST3D2D._OFFSETX = 0;
    CONST3D2D._OFFSETY = 0;

    class Submit extends SubmitBase {
        constructor(renderType = SubmitBase.TYPE_2D) {
            super(renderType);
        }
        renderSubmit() {
            if (this._numEle === 0 || !this._mesh || this._numEle == 0)
                return 1;
            var _tex = this.shaderValue.textureHost;
            if (_tex) {
                var source = _tex._getSource();
                if (!source)
                    return 1;
                this.shaderValue.texture = source;
            }
            var gl = WebGLContext.mainContext;
            this._mesh.useMesh(gl);
            this.shaderValue.upload();
            if (BlendMode.activeBlendFunction !== this._blendFn) {
                WebGLContext.setBlend(gl, true);
                this._blendFn(gl);
                BlendMode.activeBlendFunction = this._blendFn;
            }
            gl.drawElements(gl.TRIANGLES, this._numEle, gl.UNSIGNED_SHORT, this._startIdx);
            Stat.renderBatches++;
            Stat.trianglesFaces += this._numEle / 3;
            return 1;
        }
        releaseRender() {
            if (SubmitBase.RENDERBASE == this)
                return;
            if ((--this._ref) < 1) {
                Submit.POOL[Submit._poolSize++] = this;
                this.shaderValue.release();
                this.shaderValue = null;
                this._mesh = null;
                this._parent && (this._parent.releaseRender(), this._parent = null);
            }
        }
        static create(context, mesh, sv) {
            var o = Submit._poolSize ? Submit.POOL[--Submit._poolSize] : new Submit();
            o._ref = 1;
            o._mesh = mesh;
            o._key.clear();
            o._startIdx = mesh.indexNum * CONST3D2D.BYTES_PIDX;
            o._numEle = 0;
            var blendType = context._nBlendType;
            o._blendFn = context._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
            o.shaderValue = sv;
            o.shaderValue.setValue(context._shader2D);
            var filters = context._shader2D.filters;
            filters && o.shaderValue.setFilters(filters);
            return o;
        }
        static createShape(ctx, mesh, numEle, sv) {
            var o = Submit._poolSize ? Submit.POOL[--Submit._poolSize] : (new Submit());
            o._mesh = mesh;
            o._numEle = numEle;
            o._startIdx = mesh.indexNum * 2;
            o._ref = 1;
            o.shaderValue = sv;
            o.shaderValue.setValue(ctx._shader2D);
            var blendType = ctx._nBlendType;
            o._key.blendShader = blendType;
            o._blendFn = ctx._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
            return o;
        }
    }
    Submit._poolSize = 0;
    Submit.POOL = [];

    class SubmitCanvas extends SubmitBase {
        constructor() {
            super(SubmitBase.TYPE_2D);
            this._matrix = new Matrix();
            this._matrix4 = CONST3D2D.defaultMatrix4.concat();
            this.shaderValue = new Value2D(0, 0);
        }
        static create(canvas, alpha, filters) {
            var o = (!SubmitCanvas.POOL._length) ? (new SubmitCanvas()) : SubmitCanvas.POOL[--SubmitCanvas.POOL._length];
            o.canv = canvas;
            o._ref = 1;
            o._numEle = 0;
            var v = o.shaderValue;
            v.alpha = alpha;
            v.defines.setValue(0);
            filters && filters.length && v.setFilters(filters);
            return o;
        }
        renderSubmit() {
            var preAlpha = RenderState2D.worldAlpha;
            var preMatrix4 = RenderState2D.worldMatrix4;
            var preMatrix = RenderState2D.worldMatrix;
            var preFilters = RenderState2D.worldFilters;
            var preWorldShaderDefines = RenderState2D.worldShaderDefines;
            var v = this.shaderValue;
            var m = this._matrix;
            var m4 = this._matrix4;
            var mout = Matrix.TEMP;
            Matrix.mul(m, preMatrix, mout);
            m4[0] = mout.a;
            m4[1] = mout.b;
            m4[4] = mout.c;
            m4[5] = mout.d;
            m4[12] = mout.tx;
            m4[13] = mout.ty;
            RenderState2D.worldMatrix = mout.clone();
            RenderState2D.worldMatrix4 = m4;
            RenderState2D.worldAlpha = RenderState2D.worldAlpha * v.alpha;
            if (v.filters && v.filters.length) {
                RenderState2D.worldFilters = v.filters;
                RenderState2D.worldShaderDefines = v.defines;
            }
            this.canv['flushsubmit']();
            RenderState2D.worldAlpha = preAlpha;
            RenderState2D.worldMatrix4 = preMatrix4;
            RenderState2D.worldMatrix.destroy();
            RenderState2D.worldMatrix = preMatrix;
            RenderState2D.worldFilters = preFilters;
            RenderState2D.worldShaderDefines = preWorldShaderDefines;
            return 1;
        }
        releaseRender() {
            if ((--this._ref) < 1) {
                var cache = SubmitCanvas.POOL;
                this._mesh = null;
                cache[cache._length++] = this;
            }
        }
        getRenderType() {
            return SubmitBase.TYPE_CANVAS;
        }
        ;
    }
    SubmitCanvas.POOL = [];
    {
        SubmitCanvas.POOL._length = 0;
    }

    class SubmitTarget {
        constructor() {
            this.blendType = 0;
            this._ref = 1;
            this._key = new SubmitKey();
        }
        renderSubmit() {
            var gl = WebGLContext.mainContext;
            this._mesh.useMesh(gl);
            var target = this.srcRT;
            if (target) {
                this.shaderValue.texture = target._getSource();
                this.shaderValue.upload();
                this.blend();
                Stat.renderBatches++;
                Stat.trianglesFaces += this._numEle / 3;
                gl.drawElements(gl.TRIANGLES, this._numEle, gl.UNSIGNED_SHORT, this._startIdx);
            }
            return 1;
        }
        blend() {
            if (BlendMode.activeBlendFunction !== BlendMode.fns[this.blendType]) {
                var gl = WebGLContext.mainContext;
                gl.enable(gl.BLEND);
                BlendMode.fns[this.blendType](gl);
                BlendMode.activeBlendFunction = BlendMode.fns[this.blendType];
            }
        }
        getRenderType() {
            return 0;
        }
        releaseRender() {
            if ((--this._ref) < 1) {
                var pool = SubmitTarget.POOL;
                pool[pool._length++] = this;
            }
        }
        static create(context, mesh, sv, rt) {
            var o = SubmitTarget.POOL._length ? SubmitTarget.POOL[--SubmitTarget.POOL._length] : new SubmitTarget();
            o._mesh = mesh;
            o.srcRT = rt;
            o._startIdx = mesh.indexNum * CONST3D2D.BYTES_PIDX;
            o._ref = 1;
            o._key.clear();
            o._numEle = 0;
            o.blendType = context._nBlendType;
            o._key.blendShader = o.blendType;
            o.shaderValue = sv;
            o.shaderValue.setValue(context._shader2D);
            if (context._colorFiler) {
                var ft = context._colorFiler;
                sv.defines.add(ft.type);
                sv.colorMat = ft._mat;
                sv.colorAlpha = ft._alpha;
            }
            return o;
        }
    }
    SubmitTarget.POOL = [];
    {
        SubmitTarget.POOL._length = 0;
    }

    class SubmitTexture extends SubmitBase {
        constructor(renderType = SubmitBase.TYPE_2D) {
            super(renderType);
        }
        releaseRender() {
            if ((--this._ref) < 1) {
                SubmitTexture.POOL[SubmitTexture._poolSize++] = this;
                this.shaderValue.release();
                this._mesh = null;
                this._parent && (this._parent.releaseRender(), this._parent = null);
            }
        }
        renderSubmit() {
            if (this._numEle === 0)
                return 1;
            var tex = this.shaderValue.textureHost;
            if (tex) {
                var source = tex ? tex._getSource() : null;
                if (!source)
                    return 1;
            }
            var gl = WebGLContext.mainContext;
            this._mesh.useMesh(gl);
            var lastSubmit = SubmitBase.preRender;
            var prekey = SubmitBase.preRender._key;
            if (this._key.blendShader === 0 && (this._key.submitType === prekey.submitType && this._key.blendShader === prekey.blendShader) && BaseShader.activeShader &&
                SubmitBase.preRender.clipInfoID == this.clipInfoID &&
                lastSubmit.shaderValue.defines._value === this.shaderValue.defines._value &&
                (this.shaderValue.defines._value & ShaderDefines2D.NOOPTMASK) == 0) {
                BaseShader.activeShader.uploadTexture2D(source);
            }
            else {
                if (BlendMode.activeBlendFunction !== this._blendFn) {
                    WebGLContext.setBlend(gl, true);
                    this._blendFn(gl);
                    BlendMode.activeBlendFunction = this._blendFn;
                }
                this.shaderValue.texture = source;
                this.shaderValue.upload();
            }
            gl.drawElements(gl.TRIANGLES, this._numEle, gl.UNSIGNED_SHORT, this._startIdx);
            Stat.renderBatches++;
            Stat.trianglesFaces += this._numEle / 3;
            return 1;
        }
        static create(context, mesh, sv) {
            var o = SubmitTexture._poolSize ? SubmitTexture.POOL[--SubmitTexture._poolSize] : new SubmitTexture(SubmitBase.TYPE_TEXTURE);
            o._mesh = mesh;
            o._key.clear();
            o._key.submitType = SubmitBase.KEY_DRAWTEXTURE;
            o._ref = 1;
            o._startIdx = mesh.indexNum * CONST3D2D.BYTES_PIDX;
            o._numEle = 0;
            var blendType = context._nBlendType;
            o._key.blendShader = blendType;
            o._blendFn = context._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
            o.shaderValue = sv;
            if (context._colorFiler) {
                var ft = context._colorFiler;
                sv.defines.add(ft.type);
                sv.colorMat = ft._mat;
                sv.colorAlpha = ft._alpha;
            }
            return o;
        }
    }
    SubmitTexture._poolSize = 0;
    SubmitTexture.POOL = [];

    class CharSubmitCache {
        constructor() {
            this._data = [];
            this._ndata = 0;
            this._clipid = -1;
            this._clipMatrix = new Matrix();
            this._enbale = false;
        }
        clear() {
            this._tex = null;
            this._imgId = -1;
            this._ndata = 0;
            this._enbale = false;
            this._colorFiler = null;
        }
        destroy() {
            this.clear();
            this._data.length = 0;
            this._data = null;
        }
        add(ctx, tex, imgid, pos, uv, color) {
            if (this._ndata > 0 && (this._tex != tex || this._imgId != imgid ||
                (this._clipid >= 0 && this._clipid != ctx._clipInfoID))) {
                this.submit(ctx);
            }
            this._clipid = ctx._clipInfoID;
            ctx._globalClipMatrix.copyTo(this._clipMatrix);
            this._tex = tex;
            this._imgId = imgid;
            this._colorFiler = ctx._colorFiler;
            this._data[this._ndata] = pos;
            this._data[this._ndata + 1] = uv;
            this._data[this._ndata + 2] = color;
            this._ndata += 3;
        }
        getPos() {
            if (CharSubmitCache.__nPosPool == 0)
                return new Array(8);
            return CharSubmitCache.__posPool[--CharSubmitCache.__nPosPool];
        }
        enable(value, ctx) {
            if (value === this._enbale)
                return;
            this._enbale = value;
            this._enbale || this.submit(ctx);
        }
        submit(ctx) {
            var n = this._ndata;
            if (!n)
                return;
            var _mesh = ctx._mesh;
            var colorFiler = ctx._colorFiler;
            ctx._colorFiler = this._colorFiler;
            var submit = SubmitTexture.create(ctx, _mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
            ctx._submits[ctx._submits._length++] = ctx._curSubmit = submit;
            submit.shaderValue.textureHost = this._tex;
            submit._key.other = this._imgId;
            ctx._colorFiler = colorFiler;
            ctx._copyClipInfo(submit, this._clipMatrix);
            submit.clipInfoID = this._clipid;
            for (var i = 0; i < n; i += 3) {
                _mesh.addQuad(this._data[i], this._data[i + 1], this._data[i + 2], true);
                CharSubmitCache.__posPool[CharSubmitCache.__nPosPool++] = this._data[i];
            }
            n /= 3;
            submit._numEle += n * 6;
            _mesh.indexNum += n * 6;
            _mesh.vertNum += n * 4;
            ctx._drawCount += n;
            this._ndata = 0;
            if (RenderInfo.loopCount % 100 == 0)
                this._data.length = 0;
        }
    }
    CharSubmitCache.__posPool = [];
    CharSubmitCache.__nPosPool = 0;

    class AtlasGrid {
        constructor(width = 0, height = 0, id = 0) {
            this.atlasID = 0;
            this._width = 0;
            this._height = 0;
            this._texCount = 0;
            this._rowInfo = null;
            this._cells = null;
            this._used = 0;
            this._cells = null;
            this._rowInfo = null;
            this.atlasID = id;
            this._init(width, height);
        }
        addRect(type, width, height, pt) {
            if (!this._get(width, height, pt))
                return false;
            this._fill(pt.x, pt.y, width, height, type);
            this._texCount++;
            return true;
        }
        _release() {
            this._cells = null;
            this._rowInfo = null;
        }
        _init(width, height) {
            this._width = width;
            this._height = height;
            this._release();
            if (this._width == 0)
                return false;
            this._cells = new Uint8Array(this._width * this._height * 3);
            this._rowInfo = new Uint8Array(this._height);
            this._used = 0;
            this._clear();
            return true;
        }
        _get(width, height, pt) {
            if (width > this._width || height > this._height) {
                return false;
            }
            var rx = -1;
            var ry = -1;
            var nWidth = this._width;
            var nHeight = this._height;
            var pCellBox = this._cells;
            for (var y = 0; y < nHeight; y++) {
                if (this._rowInfo[y] < width)
                    continue;
                for (var x = 0; x < nWidth;) {
                    var tm = (y * nWidth + x) * 3;
                    if (pCellBox[tm] != 0 || pCellBox[tm + 1] < width || pCellBox[tm + 2] < height) {
                        x += pCellBox[tm + 1];
                        continue;
                    }
                    rx = x;
                    ry = y;
                    for (var xx = 0; xx < width; xx++) {
                        if (pCellBox[3 * xx + tm + 2] < height) {
                            rx = -1;
                            break;
                        }
                    }
                    if (rx < 0) {
                        x += pCellBox[tm + 1];
                        continue;
                    }
                    pt.x = rx;
                    pt.y = ry;
                    return true;
                }
            }
            return false;
        }
        _fill(x, y, w, h, type) {
            var nWidth = this._width;
            var nHeghit = this._height;
            this._check((x + w) <= nWidth && (y + h) <= nHeghit);
            for (var yy = y; yy < (h + y); ++yy) {
                this._check(this._rowInfo[yy] >= w);
                this._rowInfo[yy] -= w;
                for (var xx = 0; xx < w; xx++) {
                    var tm = (x + yy * nWidth + xx) * 3;
                    this._check(this._cells[tm] == 0);
                    this._cells[tm] = type;
                    this._cells[tm + 1] = w;
                    this._cells[tm + 2] = h;
                }
            }
            if (x > 0) {
                for (yy = 0; yy < h; ++yy) {
                    var s = 0;
                    for (xx = x - 1; xx >= 0; --xx, ++s) {
                        if (this._cells[((y + yy) * nWidth + xx) * 3] != 0)
                            break;
                    }
                    for (xx = s; xx > 0; --xx) {
                        this._cells[((y + yy) * nWidth + x - xx) * 3 + 1] = xx;
                        this._check(xx > 0);
                    }
                }
            }
            if (y > 0) {
                for (xx = x; xx < (x + w); ++xx) {
                    s = 0;
                    for (yy = y - 1; yy >= 0; --yy, s++) {
                        if (this._cells[(xx + yy * nWidth) * 3] != 0)
                            break;
                    }
                    for (yy = s; yy > 0; --yy) {
                        this._cells[(xx + (y - yy) * nWidth) * 3 + 2] = yy;
                        this._check(yy > 0);
                    }
                }
            }
            this._used += (w * h) / (this._width * this._height);
        }
        _check(ret) {
            if (ret == false) {
                console.log("xtexMerger 错误啦");
            }
        }
        _clear() {
            this._texCount = 0;
            for (var y = 0; y < this._height; y++) {
                this._rowInfo[y] = this._width;
            }
            for (var i = 0; i < this._height; i++) {
                for (var j = 0; j < this._width; j++) {
                    var tm = (i * this._width + j) * 3;
                    this._cells[tm] = 0;
                    this._cells[tm + 1] = this._width - j;
                    this._cells[tm + 2] = this._width - i;
                }
            }
        }
    }

    class TextTexture extends Resource {
        constructor(textureW, textureH) {
            super();
            this._texW = 0;
            this._texH = 0;
            this.__destroyed = false;
            this._discardTm = 0;
            this.genID = 0;
            this.bitmap = { id: 0, _glTexture: null };
            this.curUsedCovRate = 0;
            this.curUsedCovRateAtlas = 0;
            this.lastTouchTm = 0;
            this.ri = null;
            this._texW = textureW || TextTexture.gTextRender.atlasWidth;
            this._texH = textureH || TextTexture.gTextRender.atlasWidth;
            this.bitmap.id = this.id;
            this.lock = true;
        }
        recreateResource() {
            if (this._source)
                return;
            var gl = LayaGL.instance;
            var glTex = this._source = gl.createTexture();
            this.bitmap._glTexture = glTex;
            WebGLContext.bindTexture(gl, gl.TEXTURE_2D, glTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._texW, this._texH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            if (TextTexture.gTextRender.debugUV) {
                this.fillWhite();
            }
        }
        addChar(data, x, y, uv = null) {
            if (TextTexture.gTextRender.isWan1Wan) {
                return this.addCharCanvas(data, x, y, uv);
            }
            !this._source && this.recreateResource();
            var gl = LayaGL.instance;
            WebGLContext.bindTexture(gl, gl.TEXTURE_2D, this._source);
            !ILaya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            var dt = data.data;
            if (data.data instanceof Uint8ClampedArray)
                dt = new Uint8Array(dt.buffer);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, data.width, data.height, gl.RGBA, gl.UNSIGNED_BYTE, dt);
            !ILaya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            var u0;
            var v0;
            var u1;
            var v1;
            if (ILaya.Render.isConchApp) {
                u0 = x / this._texW;
                v0 = y / this._texH;
                u1 = (x + data.width) / this._texW;
                v1 = (y + data.height) / this._texH;
            }
            else {
                u0 = (x + 1) / this._texW;
                v0 = (y) / this._texH;
                u1 = (x + data.width - 1) / this._texW;
                v1 = (y + data.height - 1) / this._texH;
            }
            uv = uv || new Array(8);
            uv[0] = u0, uv[1] = v0;
            uv[2] = u1, uv[3] = v0;
            uv[4] = u1, uv[5] = v1;
            uv[6] = u0, uv[7] = v1;
            return uv;
        }
        addCharCanvas(canv, x, y, uv = null) {
            !this._source && this.recreateResource();
            var gl = LayaGL.instance;
            WebGLContext.bindTexture(gl, gl.TEXTURE_2D, this._source);
            !ILaya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            // 说明一下， 有更简单的改法， 将TextRender.isWan1Wan 强制设为false即可， 就不会走到这里， 会用上面的addChar进行渲染
            // 之所以改这里，是因为个人觉得，应该是有其他办法， 直接将canvas作为texSubImage2D的最后一个参数执行的，想要继续探索更好的兼容性调整方案。
            var tempImgData = canv.getContext('2d').getImageData(0, 0, canv.width, canv.height);
            var dt = tempImgData.data;
            if (tempImgData.data instanceof Uint8ClampedArray)
                dt = new Uint8Array(dt.buffer);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, tempImgData.width, tempImgData.height, gl.RGBA, gl.UNSIGNED_BYTE, dt);
            //gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, canv);
            !ILaya.Render.isConchApp && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            var u0;
            var v0;
            var u1;
            var v1;
            if (ILaya.Render.isConchApp) {
                u0 = x / this._texW;
                v0 = y / this._texH;
                u1 = (x + canv.width) / this._texW;
                v1 = (y + canv.height) / this._texH;
            }
            else {
                u0 = (x + 1) / this._texW;
                v0 = (y + 1) / this._texH;
                u1 = (x + canv.width - 1) / this._texW;
                v1 = (y + canv.height - 1) / this._texH;
            }
            uv = uv || new Array(8);
            uv[0] = u0, uv[1] = v0;
            uv[2] = u1, uv[3] = v0;
            uv[4] = u1, uv[5] = v1;
            uv[6] = u0, uv[7] = v1;
            return uv;
        }
        fillWhite() {
            !this._source && this.recreateResource();
            var gl = LayaGL.instance;
            var dt = new Uint8Array(this._texW * this._texH * 4);
            dt.fill(0xff);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._texW, this._texH, gl.RGBA, gl.UNSIGNED_BYTE, dt);
        }
        discard() {
            if (this._texW != TextTexture.gTextRender.atlasWidth || this._texH != TextTexture.gTextRender.atlasWidth) {
                this.destroy();
                return;
            }
            this.genID++;
            if (TextTexture.poolLen >= TextTexture.pool.length) {
                TextTexture.pool = TextTexture.pool.concat(new Array(10));
            }
            this._discardTm = RenderInfo.loopStTm;
            TextTexture.pool[TextTexture.poolLen++] = this;
        }
        static getTextTexture(w, h) {
            if (w != TextTexture.gTextRender.atlasWidth || w != TextTexture.gTextRender.atlasWidth)
                return new TextTexture(w, h);
            if (TextTexture.poolLen > 0) {
                var ret = TextTexture.pool[--TextTexture.poolLen];
                if (TextTexture.poolLen > 0)
                    TextTexture.clean();
                return ret;
            }
            return new TextTexture(w, h);
        }
        destroy() {
            this.__destroyed = true;
            var gl = LayaGL.instance;
            this._source && gl.deleteTexture(this._source);
            this._source = null;
        }
        static clean() {
            var curtm = RenderInfo.loopStTm;
            if (TextTexture.cleanTm === 0)
                TextTexture.cleanTm = curtm;
            if (curtm - TextTexture.cleanTm >= TextTexture.gTextRender.checkCleanTextureDt) {
                for (var i = 0; i < TextTexture.poolLen; i++) {
                    var p = TextTexture.pool[i];
                    if (curtm - p._discardTm >= TextTexture.gTextRender.destroyUnusedTextureDt) {
                        p.destroy();
                        TextTexture.pool[i] = TextTexture.pool[TextTexture.poolLen - 1];
                        TextTexture.poolLen--;
                        i--;
                    }
                }
                TextTexture.cleanTm = curtm;
            }
        }
        touchRect(ri, curloop) {
            if (this.lastTouchTm != curloop) {
                this.curUsedCovRate = 0;
                this.curUsedCovRateAtlas = 0;
                this.lastTouchTm = curloop;
            }
            var texw2 = TextTexture.gTextRender.atlasWidth * TextTexture.gTextRender.atlasWidth;
            var gridw2 = ILaya.TextAtlas.atlasGridW * ILaya.TextAtlas.atlasGridW;
            this.curUsedCovRate += (ri.bmpWidth * ri.bmpHeight) / texw2;
            this.curUsedCovRateAtlas += (Math.ceil(ri.bmpWidth / ILaya.TextAtlas.atlasGridW) * Math.ceil(ri.bmpHeight / ILaya.TextAtlas.atlasGridW)) / (texw2 / gridw2);
        }
        get texture() {
            return this;
        }
        _getSource() {
            return this._source;
        }
        drawOnScreen(x, y) {
        }
    }
    TextTexture.gTextRender = null;
    TextTexture.pool = new Array(10);
    TextTexture.poolLen = 0;
    TextTexture.cleanTm = 0;

    class TextAtlas {
        constructor() {
            this.texWidth = 1024;
            this.texHeight = 1024;
            this.protectDist = 1;
            this.texture = null;
            this.charMaps = {};
            this.texHeight = this.texWidth = ILaya.TextRender.atlasWidth;
            this.texture = TextTexture.getTextTexture(this.texWidth, this.texHeight);
            if (this.texWidth / TextAtlas.atlasGridW > 256) {
                TextAtlas.atlasGridW = Math.ceil(this.texWidth / 256);
            }
            this.atlasgrid = new AtlasGrid(this.texWidth / TextAtlas.atlasGridW, this.texHeight / TextAtlas.atlasGridW, this.texture.id);
        }
        setProtecteDist(d) {
            this.protectDist = d;
        }
        getAEmpty(w, h, pt) {
            var find = this.atlasgrid.addRect(1, Math.ceil(w / TextAtlas.atlasGridW), Math.ceil(h / TextAtlas.atlasGridW), pt);
            if (find) {
                pt.x *= TextAtlas.atlasGridW;
                pt.y *= TextAtlas.atlasGridW;
            }
            return find;
        }
        get usedRate() {
            return this.atlasgrid._used;
        }
        destroy() {
            for (var k in this.charMaps) {
                var ri = this.charMaps[k];
                ri.deleted = true;
            }
            this.texture.discard();
        }
        printDebugInfo() {
        }
    }
    TextAtlas.atlasGridW = 16;

    class Event {
        setTo(type, currentTarget, target) {
            this.type = type;
            this.currentTarget = currentTarget;
            this.target = target;
            return this;
        }
        stopPropagation() {
            this._stoped = true;
        }
        get touches() {
            if (!this.nativeEvent)
                return null;
            var arr = this.nativeEvent.touches;
            if (arr) {
                var stage = ILaya.stage;
                for (var i = 0, n = arr.length; i < n; i++) {
                    var e = arr[i];
                    var point = Point.TEMP;
                    point.setTo(e.clientX, e.clientY);
                    stage._canvasTransform.invertTransformPoint(point);
                    stage.transform.invertTransformPoint(point);
                    e.stageX = point.x;
                    e.stageY = point.y;
                }
            }
            return arr;
        }
        get altKey() {
            return this.nativeEvent.altKey;
        }
        get ctrlKey() {
            return this.nativeEvent.ctrlKey;
        }
        get shiftKey() {
            return this.nativeEvent.shiftKey;
        }
        get charCode() {
            return this.nativeEvent.charCode;
        }
        get keyLocation() {
            return this.nativeEvent.location || this.nativeEvent.keyLocation;
        }
        get stageX() {
            return ILaya.stage.mouseX;
        }
        get stageY() {
            return ILaya.stage.mouseY;
        }
    }
    Event.EMPTY = new Event();
    Event.MOUSE_DOWN = "mousedown";
    Event.MOUSE_UP = "mouseup";
    Event.CLICK = "click";
    Event.RIGHT_MOUSE_DOWN = "rightmousedown";
    Event.RIGHT_MOUSE_UP = "rightmouseup";
    Event.RIGHT_CLICK = "rightclick";
    Event.MOUSE_MOVE = "mousemove";
    Event.MOUSE_OVER = "mouseover";
    Event.MOUSE_OUT = "mouseout";
    Event.MOUSE_WHEEL = "mousewheel";
    Event.ROLL_OVER = "mouseover";
    Event.ROLL_OUT = "mouseout";
    Event.DOUBLE_CLICK = "doubleclick";
    Event.CHANGE = "change";
    Event.CHANGED = "changed";
    Event.RESIZE = "resize";
    Event.ADDED = "added";
    Event.REMOVED = "removed";
    Event.DISPLAY = "display";
    Event.UNDISPLAY = "undisplay";
    Event.ERROR = "error";
    Event.COMPLETE = "complete";
    Event.LOADED = "loaded";
    Event.READY = "ready";
    Event.PROGRESS = "progress";
    Event.INPUT = "input";
    Event.RENDER = "render";
    Event.OPEN = "open";
    Event.MESSAGE = "message";
    Event.CLOSE = "close";
    Event.KEY_DOWN = "keydown";
    Event.KEY_PRESS = "keypress";
    Event.KEY_UP = "keyup";
    Event.FRAME = "enterframe";
    Event.DRAG_START = "dragstart";
    Event.DRAG_MOVE = "dragmove";
    Event.DRAG_END = "dragend";
    Event.ENTER = "enter";
    Event.SELECT = "select";
    Event.BLUR = "blur";
    Event.FOCUS = "focus";
    Event.VISIBILITY_CHANGE = "visibilitychange";
    Event.FOCUS_CHANGE = "focuschange";
    Event.PLAYED = "played";
    Event.PAUSED = "paused";
    Event.STOPPED = "stopped";
    Event.START = "start";
    Event.END = "end";
    Event.COMPONENT_ADDED = "componentadded";
    Event.COMPONENT_REMOVED = "componentremoved";
    Event.RELEASED = "released";
    Event.LINK = "link";
    Event.LABEL = "label";
    Event.FULL_SCREEN_CHANGE = "fullscreenchange";
    Event.DEVICE_LOST = "devicelost";
    Event.TRANSFORM_CHANGED = "transformchanged";
    Event.ANIMATION_CHANGED = "animationchanged";
    Event.TRAIL_FILTER_CHANGE = "trailfilterchange";
    Event.TRIGGER_ENTER = "triggerenter";
    Event.TRIGGER_STAY = "triggerstay";
    Event.TRIGGER_EXIT = "triggerexit";

    class Texture extends EventDispatcher {
        constructor(bitmap = null, uv = null, sourceWidth = 0, sourceHeight = 0) {
            super();
            this.uvrect = [0, 0, 1, 1];
            this._destroyed = false;
            this._referenceCount = 0;
            this.$_GID = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this._w = 0;
            this._h = 0;
            this.sourceWidth = 0;
            this.sourceHeight = 0;
            this.url = null;
            this.scaleRate = 1;
            this.setTo(bitmap, uv, sourceWidth, sourceHeight);
        }
        static moveUV(offsetX, offsetY, uv) {
            for (var i = 0; i < 8; i += 2) {
                uv[i] += offsetX;
                uv[i + 1] += offsetY;
            }
            return uv;
        }
        static create(source, x, y, width, height, offsetX = 0, offsetY = 0, sourceWidth = 0, sourceHeight = 0) {
            return Texture._create(source, x, y, width, height, offsetX, offsetY, sourceWidth, sourceHeight);
        }
        static _create(source, x, y, width, height, offsetX = 0, offsetY = 0, sourceWidth = 0, sourceHeight = 0, outTexture = null) {
            var btex = source instanceof Texture;
            var uv = btex ? source.uv : Texture.DEF_UV;
            var bitmap = btex ? source.bitmap : source;
            if (bitmap.width && (x + width) > bitmap.width)
                width = bitmap.width - x;
            if (bitmap.height && (y + height) > bitmap.height)
                height = bitmap.height - y;
            var tex;
            if (outTexture) {
                tex = outTexture;
                tex.setTo(bitmap, null, sourceWidth || width, sourceHeight || height);
            }
            else {
                tex = new Texture(bitmap, null, sourceWidth || width, sourceHeight || height);
            }
            tex.width = width;
            tex.height = height;
            tex.offsetX = offsetX;
            tex.offsetY = offsetY;
            var dwidth = 1 / bitmap.width;
            var dheight = 1 / bitmap.height;
            x *= dwidth;
            y *= dheight;
            width *= dwidth;
            height *= dheight;
            var u1 = tex.uv[0], v1 = tex.uv[1], u2 = tex.uv[4], v2 = tex.uv[5];
            var inAltasUVWidth = (u2 - u1), inAltasUVHeight = (v2 - v1);
            var oriUV = Texture.moveUV(uv[0], uv[1], [x, y, x + width, y, x + width, y + height, x, y + height]);
            tex.uv = new Float32Array([u1 + oriUV[0] * inAltasUVWidth, v1 + oriUV[1] * inAltasUVHeight,
                u2 - (1 - oriUV[2]) * inAltasUVWidth, v1 + oriUV[3] * inAltasUVHeight,
                u2 - (1 - oriUV[4]) * inAltasUVWidth, v2 - (1 - oriUV[5]) * inAltasUVHeight,
                u1 + oriUV[6] * inAltasUVWidth, v2 - (1 - oriUV[7]) * inAltasUVHeight]);
            var bitmapScale = bitmap.scaleRate;
            if (bitmapScale && bitmapScale != 1) {
                tex.sourceWidth /= bitmapScale;
                tex.sourceHeight /= bitmapScale;
                tex.width /= bitmapScale;
                tex.height /= bitmapScale;
                tex.scaleRate = bitmapScale;
            }
            else {
                tex.scaleRate = 1;
            }
            return tex;
        }
        static createFromTexture(texture, x, y, width, height) {
            var texScaleRate = texture.scaleRate;
            if (texScaleRate != 1) {
                x *= texScaleRate;
                y *= texScaleRate;
                width *= texScaleRate;
                height *= texScaleRate;
            }
            var rect = Rectangle.TEMP.setTo(x - texture.offsetX, y - texture.offsetY, width, height);
            var result = rect.intersection(Texture._rect1.setTo(0, 0, texture.width, texture.height), Texture._rect2);
            if (result)
                var tex = Texture.create(texture, result.x, result.y, result.width, result.height, result.x - rect.x, result.y - rect.y, width, height);
            else
                return null;
            return tex;
        }
        get uv() {
            return this._uv;
        }
        set uv(value) {
            this.uvrect[0] = Math.min(value[0], value[2], value[4], value[6]);
            this.uvrect[1] = Math.min(value[1], value[3], value[5], value[7]);
            this.uvrect[2] = Math.max(value[0], value[2], value[4], value[6]) - this.uvrect[0];
            this.uvrect[3] = Math.max(value[1], value[3], value[5], value[7]) - this.uvrect[1];
            this._uv = value;
        }
        get width() {
            if (this._w)
                return this._w;
            if (!this.bitmap)
                return 0;
            return (this.uv && this.uv !== Texture.DEF_UV) ? (this.uv[2] - this.uv[0]) * this.bitmap.width : this.bitmap.width;
        }
        set width(value) {
            this._w = value;
            this.sourceWidth || (this.sourceWidth = value);
        }
        get height() {
            if (this._h)
                return this._h;
            if (!this.bitmap)
                return 0;
            return (this.uv && this.uv !== Texture.DEF_UV) ? (this.uv[5] - this.uv[1]) * this.bitmap.height : this.bitmap.height;
        }
        set height(value) {
            this._h = value;
            this.sourceHeight || (this.sourceHeight = value);
        }
        get bitmap() {
            return this._bitmap;
        }
        set bitmap(value) {
            this._bitmap && this._bitmap._removeReference(this._referenceCount);
            this._bitmap = value;
            value && (value._addReference(this._referenceCount));
        }
        get destroyed() {
            return this._destroyed;
        }
        _addReference() {
            this._bitmap && this._bitmap._addReference();
            this._referenceCount++;
        }
        _removeReference() {
            this._bitmap && this._bitmap._removeReference();
            this._referenceCount--;
        }
        _getSource(cb = null) {
            if (this._destroyed || !this._bitmap)
                return null;
            this.recoverBitmap(cb);
            return this._bitmap.destroyed ? null : this.bitmap._getSource();
        }
        _onLoaded(complete, context) {
            if (!context) ;
            else if (context == this) ;
            else if (context instanceof Texture) {
                var tex = context;
                Texture._create(context, 0, 0, tex.width, tex.height, 0, 0, tex.sourceWidth, tex.sourceHeight, this);
            }
            else {
                this.bitmap = context;
                this.sourceWidth = this._w = context.width;
                this.sourceHeight = this._h = context.height;
            }
            complete && complete.run();
            this.event(Event.READY, this);
        }
        getIsReady() {
            return this._destroyed ? false : (this._bitmap ? true : false);
        }
        setTo(bitmap = null, uv = null, sourceWidth = 0, sourceHeight = 0) {
            this.bitmap = bitmap;
            this.sourceWidth = sourceWidth;
            this.sourceHeight = sourceHeight;
            if (bitmap) {
                this._w = bitmap.width;
                this._h = bitmap.height;
                this.sourceWidth = this.sourceWidth || bitmap.width;
                this.sourceHeight = this.sourceHeight || bitmap.height;
            }
            this.uv = uv || Texture.DEF_UV;
        }
        load(url, complete = null) {
            if (!this._destroyed)
                ILaya.loader.load(url, Handler.create(this, this._onLoaded, [complete]), null, "htmlimage", 1, false, null, true);
        }
        getTexturePixels(x, y, width, height) {
            var st, dst, i;
            var tex2d = this.bitmap;
            var texw = tex2d.width;
            var texh = tex2d.height;
            if (x + width > texw)
                width -= (x + width) - texw;
            if (y + height > texh)
                height -= (y + height) - texh;
            if (width <= 0 || height <= 0)
                return null;
            var wstride = width * 4;
            var pix = null;
            try {
                pix = tex2d.getPixels();
            }
            catch (e) {
            }
            if (pix) {
                if (x == 0 && y == 0 && width == texw && height == texh)
                    return pix;
                var ret = new Uint8Array(width * height * 4);
                wstride = texw * 4;
                st = x * 4;
                dst = (y + height - 1) * wstride + x * 4;
                for (i = height - 1; i >= 0; i--) {
                    ret.set(dt.slice(dst, dst + width * 4), st);
                    st += wstride;
                    dst -= wstride;
                }
                return ret;
            }
            var ctx = new ILaya.Context();
            ctx.size(width, height);
            ctx.asBitmap = true;
            var uv = null;
            if (x != 0 || y != 0 || width != texw || height != texh) {
                uv = this._uv.slice();
                var stu = uv[0];
                var stv = uv[1];
                var uvw = uv[2] - stu;
                var uvh = uv[7] - stv;
                var uk = uvw / texw;
                var vk = uvh / texh;
                uv = [stu + x * uk, stv + y * vk,
                    stu + (x + width) * uk, stv + y * vk,
                    stu + (x + width) * uk, stv + (y + height) * vk,
                    stu + x * uk, stv + (y + height) * vk];
            }
            ctx._drawTextureM(this, 0, 0, width, height, null, 1.0, uv);
            ctx._targets.start();
            ctx.flush();
            ctx._targets.end();
            ctx._targets.restore();
            var dt = ctx._targets.getData(0, 0, width, height);
            ctx.destroy();
            ret = new Uint8Array(width * height * 4);
            st = 0;
            dst = (height - 1) * wstride;
            for (i = height - 1; i >= 0; i--) {
                ret.set(dt.slice(dst, dst + wstride), st);
                st += wstride;
                dst -= wstride;
            }
            return ret;
        }
        getPixels(x, y, width, height) {
            if (window.conch) {
                return this._nativeObj.getImageData(x, y, width, height);
            }
            else {
                return this.getTexturePixels(x, y, width, height);
            }
        }
        recoverBitmap(onok = null) {
            var url = this._bitmap.url;
            if (!this._destroyed && (!this._bitmap || this._bitmap.destroyed) && url) {
                ILaya.loader.load(url, Handler.create(this, function (bit) {
                    this.bitmap = bit;
                    onok && onok();
                }), null, "htmlimage", 1, false, null, true);
            }
        }
        disposeBitmap() {
            if (!this._destroyed && this._bitmap) {
                this._bitmap.destroy();
            }
        }
        destroy(force = false) {
            if (!this._destroyed) {
                this._destroyed = true;
                var bit = this._bitmap;
                if (bit) {
                    bit._removeReference(this._referenceCount);
                    if (bit.referenceCount === 0 || force)
                        bit.destroy();
                    bit = null;
                }
                if (this.url && this === ILaya.loader.getRes(this.url))
                    ILaya.loader.clearRes(this.url);
            }
        }
    }
    Texture.DEF_UV = new Float32Array([0, 0, 1.0, 0, 1.0, 1.0, 0, 1.0]);
    Texture.NO_UV = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);
    Texture.INV_UV = new Float32Array([0, 1, 1.0, 1, 1.0, 0.0, 0, 0.0]);
    Texture._rect1 = new Rectangle();
    Texture._rect2 = new Rectangle();

    class FontInfo {
        constructor(font) {
            this._font = "14px Arial";
            this._family = "Arial";
            this._size = 14;
            this._italic = false;
            this._bold = false;
            this._id = FontInfo._gfontID++;
            this.setFont(font || this._font);
        }
        static Parse(font) {
            if (font === FontInfo._lastFont) {
                return FontInfo._lastFontInfo;
            }
            var r = FontInfo._cache[font];
            if (!r) {
                r = FontInfo._cache[font] = new FontInfo(font);
            }
            FontInfo._lastFont = font;
            FontInfo._lastFontInfo = r;
            return r;
        }
        setFont(value) {
            this._font = value;
            var _words = value.split(' ');
            var l = _words.length;
            if (l < 2) {
                if (l == 1) {
                    if (_words[0].indexOf('px') > 0) {
                        this._size = parseInt(_words[0]);
                    }
                }
                return;
            }
            var szpos = -1;
            for (var i = 0; i < l; i++) {
                if (_words[i].indexOf('px') > 0 || _words[i].indexOf('pt') > 0) {
                    szpos = i;
                    this._size = parseInt(_words[i]);
                    if (this._size <= 0) {
                        console.error('font parse error:' + value);
                        this._size = 14;
                    }
                    break;
                }
            }
            var fpos = szpos + 1;
            var familys = _words[fpos];
            fpos++;
            for (; fpos < l; fpos++) {
                familys += ' ' + _words[fpos];
            }
            this._family = (familys.split(','))[0];
            this._italic = _words.indexOf('italic') >= 0;
            this._bold = _words.indexOf('bold') >= 0;
        }
    }
    FontInfo.EMPTY = new FontInfo(null);
    FontInfo._cache = {};
    FontInfo._gfontID = 0;
    FontInfo._lastFont = '';

    class WordText {
        constructor() {
            this.save = [];
            this.toUpperCase = null;
            this.width = -1;
            this.pageChars = [];
            this.startID = 0;
            this.startIDStroke = 0;
            this.lastGCCnt = 0;
            this.splitRender = false;
        }
        setText(txt) {
            this.changed = true;
            this._text = txt;
            this.width = -1;
            this.cleanCache();
        }
        toString() {
            return this._text;
        }
        get length() {
            return this._text ? this._text.length : 0;
        }
        charCodeAt(i) {
            return this._text ? this._text.charCodeAt(i) : NaN;
        }
        charAt(i) {
            return this._text ? this._text.charAt(i) : null;
        }
        cleanCache() {
            this.pageChars.forEach(function (p) {
                var tex = p.tex;
                var words = p.words;
                if (p.words.length == 1 && tex && tex.ri) {
                    tex.destroy();
                }
            });
            this.pageChars = [];
            this.startID = 0;
        }
    }

    class CharRenderInfo {
        constructor() {
            this.char = '';
            this.deleted = false;
            this.uv = new Array(8);
            this.pos = 0;
            this.orix = 0;
            this.oriy = 0;
            this.touchTick = 0;
            this.isSpace = false;
        }
        touch() {
            var curLoop = RenderInfo.loopCount;
            if (this.touchTick != curLoop) {
                this.tex.touchRect(this, curLoop);
            }
            this.touchTick = curLoop;
        }
    }

    class ICharRender {
        constructor() {
            this.fontsz = 16;
        }
        getWidth(font, str) { return 0; }
        scale(sx, sy) {
        }
        get canvasWidth() {
            return 0;
        }
        set canvasWidth(w) {
        }
        getCharBmp(char, font, lineWidth, colStr, strokeColStr, size, margin_left, margin_top, margin_right, margin_bottom, rect = null) {
            return null;
        }
    }

    class Browser {
        static __init__() {
            var Laya = window.Laya || ILaya.Laya;
            if (Browser._window)
                return Browser._window;
            var win = Browser._window = window;
            var doc = Browser._document = win.document;
            var u = Browser.userAgent = win.navigator.userAgent;
            if (u.indexOf('AlipayMiniGame') > -1 && "my" in Browser.window) {
                window.aliMiniGame(Laya, Laya);
                window.aliPayMiniGame(Laya, Laya);
                if (!Laya["ALIMiniAdapter"]) {
                    console.error("请先添加阿里小游戏适配库");
                }
                else {
                    Laya["ALIMiniAdapter"].enable();
                }
            }
            if (u.indexOf('OPPO') == -1 && u.indexOf("MiniGame") > -1 && typeof(wx) != "undefined") {
                if ("qq" in Browser.window) {
                    window.qqMiniGame(Laya, Laya);
                    if (!Laya["QQMiniAdapter"]) {
                        console.error("请引入手机QQ小游戏的适配库：https://ldc2.layabox.com/doc/?nav=zh-ts-5-0-0");
                    }
                    else {
                        Laya["QQMiniAdapter"].enable();
                    }
                }
                else {
                    window.wxMiniGame(Laya, Laya);
                    if (!Laya["MiniAdpter"]) {
                        console.error("请先添加小游戏适配库,详细教程：https://ldc2.layabox.com/doc/?nav=zh-ts-5-0-0");
                    }
                    else {
                        Laya["MiniAdpter"].enable();
                    }
                }
            }
            if (u.indexOf("SwanGame") > -1) {
                window.bdMiniGame(Laya, Laya);
                if (!Laya["BMiniAdapter"]) {
                    console.error("请先添加百度小游戏适配库,详细教程：https://ldc2.layabox.com/doc/?nav=zh-ts-5-0-0");
                }
                else {
                    Laya["BMiniAdapter"].enable();
                }
            }
            if (u.indexOf('QuickGame') > -1) {
                window.miMiniGame(Laya, Laya);
                if (!Laya["KGMiniAdapter"]) {
                    console.error("请先添加小米小游戏适配库,详细教程：https://ldc2.layabox.com/doc/?nav=zh-ts-5-0-0");
                }
                else {
                    Laya["KGMiniAdapter"].enable();
                }
            }
            if (u.indexOf('OPPO') > -1 && u.indexOf('MiniGame') > -1) {
                window.qgMiniGame(Laya, Laya);
                if (!Laya["QGMiniAdapter"]) {
                    console.error("请先添加OPPO小游戏适配库");
                }
                else {
                    Laya["QGMiniAdapter"].enable();
                }
            }
            if (u.indexOf('VVGame') > -1) {
                window.vvMiniGame(Laya, Laya);
                if (!Laya["VVMiniAdapter"]) {
                    console.error("请先添加VIVO小游戏适配库");
                }
                else {
                    Laya["VVMiniAdapter"].enable();
                }
            }
            win.trace = console.log;
            win.requestAnimationFrame = win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || win.oRequestAnimationFrame || win.msRequestAnimationFrame || function (fun) {
                return win.setTimeout(fun, 1000 / 60);
            };
            var bodyStyle = doc.body.style;
            bodyStyle.margin = 0;
            bodyStyle.overflow = 'hidden';
            bodyStyle['-webkit-user-select'] = 'none';
            bodyStyle['-webkit-tap-highlight-color'] = 'rgba(200,200,200,0)';
            var metas = doc.getElementsByTagName('meta');
            var i = 0, flag = false, content = 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no';
            while (i < metas.length) {
                var meta = metas[i];
                if (meta.name == 'viewport') {
                    meta.content = content;
                    flag = true;
                    break;
                }
                i++;
            }
            if (!flag) {
                meta = doc.createElement('meta');
                meta.name = 'viewport', meta.content = content;
                doc.getElementsByTagName('head')[0].appendChild(meta);
            }
            Browser.onMobile = window.isConchApp ? true : u.indexOf("Mobile") > -1;
            Browser.onIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            Browser.onIPhone = u.indexOf("iPhone") > -1;
            Browser.onMac = u.indexOf("Mac OS X") > -1;
            Browser.onIPad = u.indexOf("iPad") > -1;
            Browser.onAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
            Browser.onWP = u.indexOf("Windows Phone") > -1;
            Browser.onQQBrowser = u.indexOf("QQBrowser") > -1;
            Browser.onMQQBrowser = u.indexOf("MQQBrowser") > -1 || (u.indexOf("Mobile") > -1 && u.indexOf("QQ") > -1);
            Browser.onIE = !!win.ActiveXObject || "ActiveXObject" in win;
            Browser.onWeiXin = u.indexOf('MicroMessenger') > -1;
            Browser.onSafari = u.indexOf("Safari") > -1;
            Browser.onPC = !Browser.onMobile;
            Browser.onMiniGame = u.indexOf('MiniGame') > -1;
            Browser.onBDMiniGame = u.indexOf('SwanGame') > -1;
            Browser.onLayaRuntime = !!Browser.window.conch;
            if (u.indexOf('OPPO') > -1 && u.indexOf('MiniGame') > -1) {
                Browser.onQGMiniGame = true;
                Browser.onMiniGame = false;
            }
            else if ("qq" in Browser.window && u.indexOf('MiniGame') > -1) {
                Browser.onQQMiniGame = true;
                Browser.onMiniGame = false;
            }
            Browser.onVVMiniGame = u.indexOf('VVGame') > -1;
            Browser.onKGMiniGame = u.indexOf('QuickGame') > -1;
            if (u.indexOf('AlipayMiniGame') > -1) {
                Browser.onAlipayMiniGame = true;
                Browser.onMiniGame = false;
            }
            return win;
        }
        static createElement(type, inputIns = null) {
            Browser.__init__();
            return Browser._document.createElement(type, inputIns);
        }
        static getElementById(type) {
            Browser.__init__();
            return Browser._document.getElementById(type);
        }
        static removeElement(ele) {
            if (ele && ele.parentNode)
                ele.parentNode.removeChild(ele);
        }
        static now() {
            return Date.now();
        }
        static get clientWidth() {
            Browser.__init__();
            return Browser._window.innerWidth || Browser._document.body.clientWidth;
        }
        static get clientHeight() {
            Browser.__init__();
            return Browser._window.innerHeight || Browser._document.body.clientHeight || Browser._document.documentElement.clientHeight;
        }
        static get width() {
            Browser.__init__();
            return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientHeight : Browser.clientWidth) * Browser.pixelRatio;
        }
        static get height() {
            Browser.__init__();
            return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientWidth : Browser.clientHeight) * Browser.pixelRatio;
        }
        static get pixelRatio() {
            if (Browser._pixelRatio < 0) {
                Browser.__init__();
                if (Browser.userAgent.indexOf("Mozilla/6.0(Linux; Android 6.0; HUAWEI NXT-AL10 Build/HUAWEINXT-AL10)") > -1)
                    Browser._pixelRatio = 2;
                else {
                    Browser._pixelRatio = (Browser._window.devicePixelRatio || 1);
                    if (Browser._pixelRatio < 1)
                        Browser._pixelRatio = 1;
                }
            }
            return Browser._pixelRatio;
        }
        static get container() {
            if (!Browser._container) {
                Browser.__init__();
                Browser._container = Browser.createElement("div");
                Browser._container.id = "layaContainer";
                Browser._document.body.appendChild(Browser._container);
            }
            return Browser._container;
        }
        static set container(value) {
            Browser._container = value;
        }
        static get window() {
            return Browser._window || Browser.__init__();
        }
        static get document() {
            Browser.__init__();
            return Browser._document;
        }
    }
    Browser._pixelRatio = -1;
    Browser.mainCanvas = null;
    Browser.hanzi = new RegExp("^[\u4E00-\u9FA5]$");
    Browser.fontMap = [];
    Browser.measureText = function (txt, font) {
        var isChinese = Browser.hanzi.test(txt);
        if (isChinese && Browser.fontMap[font]) {
            return Browser.fontMap[font];
        }
        var ctx = Browser.context;
        ctx.font = font;
        var r = ctx.measureText(txt);
        if (isChinese)
            Browser.fontMap[font] = r;
        return r;
    };

    class CharRender_Canvas extends ICharRender {
        constructor(maxw, maxh, scalefont = true, useImageData = true, showdbg = false) {
            super();
            this.ctx = null;
            this.lastScaleX = 1.0;
            this.lastScaleY = 1.0;
            this.needResetScale = false;
            this.maxTexW = 0;
            this.maxTexH = 0;
            this.scaleFontSize = true;
            this.showDbgInfo = false;
            this.supportImageData = true;
            this.maxTexW = maxw;
            this.maxTexH = maxh;
            this.scaleFontSize = scalefont;
            this.supportImageData = useImageData;
            this.showDbgInfo = showdbg;
            if (!CharRender_Canvas.canvas) {
                CharRender_Canvas.canvas = Browser.createElement('canvas', Laya.inputCharCanvas);
                CharRender_Canvas.canvas.width = 1024;
                CharRender_Canvas.canvas.height = 512;
                //CharRender_Canvas.canvas.style.left = "-10000px";
                //CharRender_Canvas.canvas.style.position = "absolute";
                document.body.appendChild(CharRender_Canvas.canvas);
                this.ctx = CharRender_Canvas.canvas.getContext('2d');
            }
        }
        get canvasWidth() {
            return CharRender_Canvas.canvas.width;
        }
        set canvasWidth(w) {
            if (CharRender_Canvas.canvas.width == w)
                return;
            CharRender_Canvas.canvas.width = w;
            if (w > 2048) {
                console.warn("画文字设置的宽度太大，超过2048了");
            }
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.scale(this.lastScaleX, this.lastScaleY);
        }
        getWidth(font, str) {
            if (!this.ctx)
                return 0;
            if (this.ctx._lastFont != font) {
                this.ctx.font = font;
                this.ctx._lastFont = font;
            }
            return this.ctx.measureText(str).width;
        }
        scale(sx, sy) {
            if (!this.supportImageData) {
                this.lastScaleX = sx;
                this.lastScaleY = sy;
                return;
            }
            if (this.lastScaleX != sx || this.lastScaleY != sy) {
                this.ctx.setTransform(sx, 0, 0, sy, 0, 0);
                this.lastScaleX = sx;
                this.lastScaleY = sy;
            }
        }
        getCharBmp(char, font, lineWidth, colStr, strokeColStr, cri, margin_left, margin_top, margin_right, margin_bottom, rect = null) {
            if (!this.supportImageData)
                return this.getCharCanvas(char, font, lineWidth, colStr, strokeColStr, cri, margin_left, margin_top, margin_right, margin_bottom);
            var ctx = this.ctx;
            var sz = this.fontsz;
            if (ctx.font != font) {
                ctx.font = font;
                ctx._lastFont = font;
            }
            cri.width = ctx.measureText(char).width;
            var w = cri.width * this.lastScaleX;
            var h = cri.height * this.lastScaleY;
            w += (margin_left + margin_right) * this.lastScaleX;
            h += (margin_top + margin_bottom) * this.lastScaleY;
            w = Math.ceil(w);
            h = Math.ceil(h);
            w = Math.min(w, CharRender_Canvas.canvas.width);
            h = Math.min(h, CharRender_Canvas.canvas.height);
            var clearW = w + lineWidth * 2 + 1;
            var clearH = h + lineWidth * 2 + 1;
            if (rect) {
                clearW = Math.max(clearW, rect[0] + rect[2] + 1);
                clearH = Math.max(clearH, rect[1] + rect[3] + 1);
            }
            ctx.clearRect(0, 0, clearW, clearH);
            ctx.save();
            ctx.textBaseline = "middle";
            if (lineWidth > 0) {
                ctx.strokeStyle = strokeColStr;
                ctx.lineWidth = lineWidth;
                ctx.strokeText(char, margin_left, margin_top + sz / 2);
            }
            if (colStr) {
                ctx.fillStyle = colStr;
                ctx.fillText(char, margin_left, margin_top + sz / 2);
            }
            if (this.showDbgInfo) {
                ctx.strokeStyle = '#ff0000';
                ctx.strokeRect(1, 1, w - 2, h - 2);
                ctx.strokeStyle = '#00ff00';
                ctx.strokeRect(margin_left, margin_top, cri.width, cri.height);
            }
            if (rect) {
                if (rect[2] == -1)
                    rect[2] = Math.ceil((cri.width + lineWidth * 2) * this.lastScaleX);
            }
            var imgdt = rect ? (ctx.getImageData(rect[0], rect[1], rect[2], rect[3])) : (ctx.getImageData(0, 0, w, h));
            ctx.restore();
            cri.bmpWidth = imgdt.width;
            cri.bmpHeight = imgdt.height;
            return imgdt;
        }
        getCharCanvas(char, font, lineWidth, colStr, strokeColStr, cri, margin_left, margin_top, margin_right, margin_bottom) {
            var ctx = this.ctx;
            if (ctx.font != font) {
                ctx.font = font;
                ctx._lastFont = font;
            }
            cri.width = ctx.measureText(char).width;
            var w = cri.width * this.lastScaleX;
            var h = cri.height * this.lastScaleY;
            w += (margin_left + margin_right) * this.lastScaleX;
            h += ((margin_top + margin_bottom) * this.lastScaleY + 1);
            w = Math.min(w, this.maxTexW);
            h = Math.min(h, this.maxTexH);
            CharRender_Canvas.canvas.width = Math.min(w + 1, this.maxTexW);
            CharRender_Canvas.canvas.height = Math.min(h + 1, this.maxTexH);
            ctx.font = font;
            ctx.clearRect(0, 0, w + 1 + lineWidth, h + 1 + lineWidth);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.save();
            if (this.scaleFontSize) {
                ctx.scale(this.lastScaleX, this.lastScaleY);
            }
            ctx.translate(margin_left, margin_top);
            ctx.textAlign = "left";
            var sz = this.fontsz;
            ctx.textBaseline = "middle";
            if (lineWidth > 0) {
                ctx.strokeStyle = strokeColStr;
                ctx.fillStyle = colStr;
                ctx.lineWidth = lineWidth;
                if (ctx.fillAndStrokeText) {
                    ctx.fillAndStrokeText(char, 0, sz / 2);
                }
                else {
                    ctx.strokeText(char, 0, sz / 2);
                    ctx.fillText(char, 0, sz / 2);
                }
            }
            else if (colStr) {
                ctx.fillStyle = colStr;
                ctx.fillText(char, 0, sz / 2);
            }
            if (this.showDbgInfo) {
                ctx.strokeStyle = '#ff0000';
                ctx.strokeRect(0, 0, w, h);
                ctx.strokeStyle = '#00ff00';
                ctx.strokeRect(0, 0, cri.width, cri.height);
            }
            ctx.restore();
            cri.bmpWidth = CharRender_Canvas.canvas.width;
            cri.bmpHeight = CharRender_Canvas.canvas.height;
            return CharRender_Canvas.canvas;
        }
    }
    CharRender_Canvas.canvas = null;

    class CharRender_Native extends ICharRender {
        constructor() {
            super();
            this.lastFont = '';
        }
        getWidth(font, str) {
            if (!window.conchTextCanvas)
                return 0;
            window.conchTextCanvas.font = font;
            this.lastFont = font;
            return window.conchTextCanvas.measureText(str).width;
        }
        scale(sx, sy) {
        }
        getCharBmp(char, font, lineWidth, colStr, strokeColStr, size, margin_left, margin_top, margin_right, margin_bottom, rect = null) {
            if (!window.conchTextCanvas)
                return null;
            window.conchTextCanvas.font = font;
            this.lastFont = font;
            var w = size.width = window.conchTextCanvas.measureText(char).width;
            var h = size.height;
            w += (margin_left + margin_right);
            h += (margin_top + margin_bottom);
            var c1 = ColorUtils.create(strokeColStr);
            var nStrokeColor = c1.numColor;
            var c2 = ColorUtils.create(colStr);
            var nTextColor = c2.numColor;
            var textInfo = window.conchTextCanvas.getTextBitmapData(char, nTextColor, lineWidth > 2 ? 2 : lineWidth, nStrokeColor);
            size.bmpWidth = textInfo.width;
            size.bmpHeight = textInfo.height;
            return textInfo;
        }
    }

    class TextRender {
        constructor() {
            this.fontSizeInfo = {};
            this.charRender = null;
            this.mapFont = {};
            this.fontID = 0;
            this.mapColor = [];
            this.colorID = 0;
            this.fontScaleX = 1.0;
            this.fontScaleY = 1.0;
            this._curStrPos = 0;
            this.textAtlases = [];
            this.isoTextures = [];
            this.lastFont = null;
            this.fontSizeW = 0;
            this.fontSizeH = 0;
            this.fontSizeOffX = 0;
            this.fontSizeOffY = 0;
            this.renderPerChar = true;
            this.tmpAtlasPos = new Point();
            this.textureMem = 0;
            ILaya.TextAtlas = TextAtlas;
            var bugIOS = false;
            var miniadp = ILaya.Laya['MiniAdpter'];
            if (miniadp && miniadp.systemInfo && miniadp.systemInfo.system) {
                bugIOS = miniadp.systemInfo.system.toLowerCase() === 'ios 10.1.1';
            }
            if (ILaya.Browser.onMiniGame && !bugIOS)
                TextRender.isWan1Wan = true;
            this.charRender = ILaya.Render.isConchApp ? (new CharRender_Native()) : (new CharRender_Canvas(TextRender.atlasWidth, TextRender.atlasWidth, TextRender.scaleFontWithCtx, !TextRender.isWan1Wan, false));
            TextRender.textRenderInst = this;
            ILaya.Laya['textRender'] = this;
            TextRender.atlasWidth2 = TextRender.atlasWidth * TextRender.atlasWidth;
        }
        setFont(font) {
            if (this.lastFont == font)
                return;
            this.lastFont = font;
            var fontsz = this.getFontSizeInfo(font._family);
            var offx = fontsz >> 24;
            var offy = (fontsz >> 16) & 0xff;
            var fw = (fontsz >> 8) & 0xff;
            var fh = fontsz & 0xff;
            var k = font._size / TextRender.standardFontSize;
            this.fontSizeOffX = Math.ceil(offx * k);
            this.fontSizeOffY = Math.ceil(offy * k);
            this.fontSizeW = Math.ceil(fw * k);
            this.fontSizeH = Math.ceil(fh * k);
            if (font._font.indexOf('italic') >= 0) {
                this.fontStr = font._font.replace('italic', '');
            }
            else {
                this.fontStr = font._font;
            }
        }
        getNextChar(str) {
            var len = str.length;
            var start = this._curStrPos;
            if (start >= len)
                return null;
            var i = start;
            var state = 0;
            for (; i < len; i++) {
                var c = str.charCodeAt(i);
                if ((c >>> 11) == 0x1b) {
                    if (state == 1)
                        break;
                    state = 1;
                    i++;
                }
                else if (c === 0xfe0e || c === 0xfe0f) ;
                else if (c == 0x200d) {
                    state = 2;
                }
                else {
                    if (state == 0)
                        state = 1;
                    else if (state == 1)
                        break;
                }
            }
            this._curStrPos = i;
            return str.substring(start, i);
        }
        filltext(ctx, data, x, y, fontStr, color, strokeColor, lineWidth, textAlign, underLine = 0) {
            if (data.length <= 0)
                return;
            var font = FontInfo.Parse(fontStr);
            var nTextAlign = 0;
            switch (textAlign) {
                case 'center':
                    nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                    break;
                case 'right':
                    nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                    break;
            }
            this._fast_filltext(ctx, data, null, x, y, font, color, strokeColor, lineWidth, nTextAlign, underLine);
        }
        fillWords(ctx, data, x, y, fontStr, color, strokeColor, lineWidth) {
            if (!data)
                return;
            if (data.length <= 0)
                return;
            var font = FontInfo.Parse(fontStr);
            this._fast_filltext(ctx, null, data, x, y, font, color, strokeColor, lineWidth, 0, 0);
        }
        _fast_filltext(ctx, data, htmlchars, x, y, font, color, strokeColor, lineWidth, textAlign, underLine = 0) {
            if (data && data.length < 1)
                return;
            if (htmlchars && htmlchars.length < 1)
                return;
            if (lineWidth < 0)
                lineWidth = 0;
            this.setFont(font);
            this.fontScaleX = this.fontScaleY = 1.0;
            if (!ILaya.Render.isConchApp && TextRender.scaleFontWithCtx) {
                var sx = 1;
                var sy = 1;
                if (ILaya.Render.isConchApp) {
                    sx = ctx._curMat.getScaleX();
                    sy = ctx._curMat.getScaleY();
                }
                else {
                    sx = ctx.getMatScaleX();
                    sy = ctx.getMatScaleY();
                }
                if (sx < 1e-4 || sy < 1e-1)
                    return;
                if (sx > 1)
                    this.fontScaleX = sx;
                if (sy > 1)
                    this.fontScaleY = sy;
            }
            font._italic && (ctx._italicDeg = 13);
            var wt = data;
            var isWT = !htmlchars && (data instanceof WordText);
            var str = data;
            var isHtmlChar = !!htmlchars;
            var sameTexData = isWT ? wt.pageChars : [];
            var strWidth = 0;
            if (isWT) {
                str = wt._text;
                strWidth = wt.width;
                if (strWidth < 0) {
                    strWidth = wt.width = this.charRender.getWidth(this.fontStr, str);
                }
            }
            else {
                strWidth = str ? this.charRender.getWidth(this.fontStr, str) : 0;
            }
            switch (textAlign) {
                case ILaya.Context.ENUM_TEXTALIGN_CENTER:
                    x -= strWidth / 2;
                    break;
                case ILaya.Context.ENUM_TEXTALIGN_RIGHT:
                    x -= strWidth;
                    break;
            }
            if (wt && sameTexData) {
                if (this.hasFreedText(sameTexData)) {
                    sameTexData = wt.pageChars = [];
                }
            }
            var ri = null;
            var splitTex = this.renderPerChar = (!isWT) || TextRender.forceSplitRender || isHtmlChar || (isWT && wt.splitRender);
            if (!sameTexData || sameTexData.length < 1) {
                if (splitTex) {
                    var stx = 0;
                    var sty = 0;
                    this._curStrPos = 0;
                    var curstr;
                    while (true) {
                        if (isHtmlChar) {
                            var chc = htmlchars[this._curStrPos++];
                            if (chc) {
                                curstr = chc.char;
                                stx = chc.x;
                                sty = chc.y;
                            }
                            else {
                                curstr = null;
                            }
                        }
                        else {
                            curstr = this.getNextChar(str);
                        }
                        if (!curstr)
                            break;
                        ri = this.getCharRenderInfo(curstr, font, color, strokeColor, lineWidth, false);
                        if (!ri) {
                            break;
                        }
                        if (ri.isSpace) ;
                        else {
                            var add = sameTexData[ri.tex.id];
                            if (!add) {
                                var o1 = { texgen: ri.tex.genID, tex: ri.tex, words: [] };
                                sameTexData[ri.tex.id] = o1;
                                add = o1.words;
                            }
                            else {
                                add = add.words;
                            }
                            if (ILaya.Render.isConchApp) {
                                add.push({ ri: ri, x: stx, y: sty, w: ri.bmpWidth / this.fontScaleX, h: ri.bmpHeight / this.fontScaleY });
                            }
                            else {
                                add.push({ ri: ri, x: stx + 1 / this.fontScaleX, y: sty, w: (ri.bmpWidth - 2) / this.fontScaleX, h: (ri.bmpHeight - 1) / this.fontScaleY });
                            }
                            stx += ri.width;
                        }
                    }
                }
                else {
                    var isotex = TextRender.noAtlas || strWidth * this.fontScaleX > TextRender.atlasWidth;
                    ri = this.getCharRenderInfo(str, font, color, strokeColor, lineWidth, isotex);
                    if (ILaya.Render.isConchApp) {
                        sameTexData[0] = { texgen: ri.tex.genID, tex: ri.tex, words: [{ ri: ri, x: 0, y: 0, w: ri.bmpWidth / this.fontScaleX, h: ri.bmpHeight / this.fontScaleY }] };
                    }
                    else {
                        sameTexData[0] = { texgen: ri.tex.genID, tex: ri.tex, words: [{ ri: ri, x: 1 / this.fontScaleX, y: 0 / this.fontScaleY, w: (ri.bmpWidth - 2) / this.fontScaleX, h: (ri.bmpHeight - 1) / this.fontScaleY }] };
                    }
                }
            }
            this._drawResortedWords(ctx, x, y, sameTexData);
            ctx._italicDeg = 0;
        }
        _drawResortedWords(ctx, startx, starty, samePagesData) {
            var isLastRender = ctx._charSubmitCache && ctx._charSubmitCache._enbale;
            var mat = ctx._curMat;
            var slen = samePagesData.length;
            for (var id = 0; id < slen; id++) {
                var dt = samePagesData[id];
                if (!dt)
                    continue;
                var pri = dt.words;
                var pisz = pri.length;
                if (pisz <= 0)
                    continue;
                var tex = samePagesData[id].tex;
                for (var j = 0; j < pisz; j++) {
                    var riSaved = pri[j];
                    var ri = riSaved.ri;
                    if (ri.isSpace)
                        continue;
                    ri.touch();
                    ctx.drawTexAlign = true;
                    if (ILaya.Render.isConchApp) {
                        ctx._drawTextureM(tex.texture, startx + riSaved.x - ri.orix, starty + riSaved.y - ri.oriy, riSaved.w, riSaved.h, null, 1.0, ri.uv);
                    }
                    else {
                        let t = tex;
                        ctx._inner_drawTexture(t.texture, t.id, startx + riSaved.x - ri.orix, starty + riSaved.y - ri.oriy, riSaved.w, riSaved.h, mat, ri.uv, 1.0, isLastRender);
                    }
                    if (ctx.touches) {
                        ctx.touches.push(ri);
                    }
                }
            }
        }
        hasFreedText(txts) {
            var sz = txts.length;
            for (var i = 0; i < sz; i++) {
                var pri = txts[i];
                if (!pri)
                    continue;
                var tex = pri.tex;
                if (tex.__destroyed || tex.genID != pri.texgen) {
                    return true;
                }
            }
            return false;
        }
        getCharRenderInfo(str, font, color, strokeColor, lineWidth, isoTexture = false) {
            var fid = this.mapFont[font._family];
            if (fid == undefined) {
                this.mapFont[font._family] = fid = this.fontID++;
            }
            var key = str + '_' + fid + '_' + font._size + '_' + color;
            if (lineWidth > 0)
                key += '_' + strokeColor + lineWidth;
            if (font._bold)
                key += 'P';
            if (this.fontScaleX != 1 || this.fontScaleY != 1) {
                key += (this.fontScaleX * 20 | 0) + '_' + (this.fontScaleY * 20 | 0);
            }
            var i = 0;
            var sz = this.textAtlases.length;
            var ri = null;
            var atlas = null;
            if (!isoTexture) {
                for (i = 0; i < sz; i++) {
                    atlas = this.textAtlases[i];
                    ri = atlas.charMaps[key];
                    if (ri) {
                        ri.touch();
                        return ri;
                    }
                }
            }
            ri = new CharRenderInfo();
            this.charRender.scale(this.fontScaleX, this.fontScaleY);
            ri.char = str;
            ri.height = font._size;
            var margin = ILaya.Render.isConchApp ? 0 : (font._size / 3 | 0);
            var imgdt = null;
            var w1 = Math.ceil(this.charRender.getWidth(this.fontStr, str) * this.fontScaleX);
            if (w1 > this.charRender.canvasWidth) {
                this.charRender.canvasWidth = Math.min(2048, w1 + margin * 2);
            }
            if (isoTexture) {
                this.charRender.fontsz = font._size;
                imgdt = this.charRender.getCharBmp(str, this.fontStr, lineWidth, color, strokeColor, ri, margin, margin, margin, margin, null);
                var tex = TextTexture.getTextTexture(imgdt.width, imgdt.height);
                tex.addChar(imgdt, 0, 0, ri.uv);
                ri.tex = tex;
                ri.orix = margin;
                ri.oriy = margin;
                tex.ri = ri;
                this.isoTextures.push(tex);
            }
            else {
                var len = str.length;
                var lineExt = lineWidth * 1;
                var fw = Math.ceil((this.fontSizeW + lineExt * 2) * this.fontScaleX);
                var fh = Math.ceil((this.fontSizeH + lineExt * 2) * this.fontScaleY);
                TextRender.imgdtRect[0] = ((margin - this.fontSizeOffX - lineExt) * this.fontScaleX) | 0;
                TextRender.imgdtRect[1] = ((margin - this.fontSizeOffY - lineExt) * this.fontScaleY) | 0;
                if (this.renderPerChar || len == 1) {
                    TextRender.imgdtRect[2] = Math.max(w1, fw);
                    TextRender.imgdtRect[3] = Math.max(w1, fh);
                }
                else {
                    TextRender.imgdtRect[2] = -1;
                    TextRender.imgdtRect[3] = fh;
                }
                this.charRender.fontsz = font._size;
                imgdt = this.charRender.getCharBmp(str, this.fontStr, lineWidth, color, strokeColor, ri, margin, margin, margin, margin, TextRender.imgdtRect);
                atlas = this.addBmpData(imgdt, ri);
                if (TextRender.isWan1Wan) {
                    ri.orix = margin;
                    ri.oriy = margin;
                }
                else {
                    ri.orix = (this.fontSizeOffX + lineExt);
                    ri.oriy = (this.fontSizeOffY + lineExt);
                }
                atlas.charMaps[key] = ri;
            }
            return ri;
        }
        addBmpData(data, ri) {
            var w = data.width;
            var h = data.height;
            var sz = this.textAtlases.length;
            var atlas = null;
            var find = false;
            for (var i = 0; i < sz; i++) {
                atlas = this.textAtlases[i];
                find = atlas.getAEmpty(w, h, this.tmpAtlasPos);
                if (find) {
                    break;
                }
            }
            if (!find) {
                atlas = new TextAtlas();
                this.textAtlases.push(atlas);
                find = atlas.getAEmpty(w, h, this.tmpAtlasPos);
                if (!find) {
                    throw 'err1';
                }
                this.cleanAtlases();
            }
            if (find) {
                atlas.texture.addChar(data, this.tmpAtlasPos.x, this.tmpAtlasPos.y, ri.uv);
                ri.tex = atlas.texture;
            }
            return atlas;
        }
        GC() {
            var i = 0;
            var sz = this.textAtlases.length;
            var dt = 0;
            var destroyDt = TextRender.destroyAtlasDt;
            var totalUsedRate = 0;
            var totalUsedRateAtlas = 0;
            var curloop = RenderInfo.loopCount;
            var maxWasteRateID = -1;
            var maxWasteRate = 0;
            var tex = null;
            var curatlas = null;
            for (; i < sz; i++) {
                curatlas = this.textAtlases[i];
                tex = curatlas.texture;
                if (tex) {
                    totalUsedRate += tex.curUsedCovRate;
                    totalUsedRateAtlas += tex.curUsedCovRateAtlas;
                    var waste = curatlas.usedRate - tex.curUsedCovRateAtlas;
                    if (maxWasteRate < waste) {
                        maxWasteRate = waste;
                        maxWasteRateID = i;
                    }
                }
                dt = curloop - curatlas.texture.lastTouchTm;
                if (dt > destroyDt) {
                    TextRender.showLog && console.log('TextRender GC delete atlas ' + tex ? curatlas.texture.id : 'unk');
                    curatlas.destroy();
                    this.textAtlases[i] = this.textAtlases[sz - 1];
                    sz--;
                    i--;
                    maxWasteRateID = -1;
                }
            }
            this.textAtlases.length = sz;
            sz = this.isoTextures.length;
            for (i = 0; i < sz; i++) {
                tex = this.isoTextures[i];
                dt = curloop - tex.lastTouchTm;
                if (dt > TextRender.destroyUnusedTextureDt) {
                    tex.ri.deleted = true;
                    tex.ri.tex = null;
                    tex.destroy();
                    this.isoTextures[i] = this.isoTextures[sz - 1];
                    sz--;
                    i--;
                }
            }
            this.isoTextures.length = sz;
            var needGC = this.textAtlases.length > 1 && this.textAtlases.length - totalUsedRateAtlas >= 2;
            if (TextRender.atlasWidth * TextRender.atlasWidth * 4 * this.textAtlases.length > TextRender.cleanMem || needGC || TextRender.simClean) {
                TextRender.simClean = false;
                TextRender.showLog && console.log('清理使用率低的贴图。总使用率:', totalUsedRateAtlas, ':', this.textAtlases.length, '最差贴图:' + maxWasteRateID);
                if (maxWasteRateID >= 0) {
                    curatlas = this.textAtlases[maxWasteRateID];
                    curatlas.destroy();
                    this.textAtlases[maxWasteRateID] = this.textAtlases[this.textAtlases.length - 1];
                    this.textAtlases.length = this.textAtlases.length - 1;
                }
            }
            TextTexture.clean();
        }
        cleanAtlases() {
        }
        getCharBmp(c) {
        }
        checkBmpLine(data, l, sx, ex) {
            if (this.bmpData32.buffer != data.data.buffer) {
                this.bmpData32 = new Uint32Array(data.data.buffer);
            }
            var stpos = data.width * l + sx;
            for (var x = sx; x < ex; x++) {
                if (this.bmpData32[stpos++] != 0)
                    return true;
            }
            return false;
        }
        updateBbx(data, curbbx, onlyH = false) {
            var w = data.width;
            var h = data.height;
            var x = 0;
            var sy = curbbx[1];
            var ey = 0;
            var y = sy;
            if (this.checkBmpLine(data, sy, 0, w)) {
                while (true) {
                    y = (sy + ey) / 2 | 0;
                    if (y + 1 >= sy) {
                        curbbx[1] = y;
                        break;
                    }
                    if (this.checkBmpLine(data, y, 0, w)) {
                        sy = y;
                    }
                    else {
                        ey = y;
                    }
                }
            }
            if (curbbx[3] > h)
                curbbx[3] = h;
            else {
                y = sy = curbbx[3];
                ey = h;
                if (this.checkBmpLine(data, sy, 0, w)) {
                    while (true) {
                        y = (sy + ey) / 2 | 0;
                        if (y - 1 <= sy) {
                            curbbx[3] = y;
                            break;
                        }
                        if (this.checkBmpLine(data, y, 0, w)) {
                            sy = y;
                        }
                        else {
                            ey = y;
                        }
                    }
                }
            }
            if (onlyH)
                return;
            var minx = curbbx[0];
            var stpos = w * curbbx[1];
            for (y = curbbx[1]; y < curbbx[3]; y++) {
                for (x = 0; x < minx; x++) {
                    if (this.bmpData32[stpos + x] != 0) {
                        minx = x;
                        break;
                    }
                }
                stpos += w;
            }
            curbbx[0] = minx;
            var maxx = curbbx[2];
            stpos = w * curbbx[1];
            for (y = curbbx[1]; y < curbbx[3]; y++) {
                for (x = maxx; x < w; x++) {
                    if (this.bmpData32[stpos + x] != 0) {
                        maxx = x;
                        break;
                    }
                }
                stpos += w;
            }
            curbbx[2] = maxx;
        }
        getFontSizeInfo(font) {
            var finfo = this.fontSizeInfo[font];
            if (finfo != undefined)
                return finfo;
            var fontstr = 'bold ' + TextRender.standardFontSize + 'px ' + font;
            if (TextRender.isWan1Wan) {
                this.fontSizeW = this.charRender.getWidth(fontstr, '有') * 1.5;
                this.fontSizeH = TextRender.standardFontSize * 1.5;
                var szinfo = this.fontSizeW << 8 | this.fontSizeH;
                this.fontSizeInfo[font] = szinfo;
                return szinfo;
            }
            TextRender.pixelBBX[0] = TextRender.standardFontSize / 2;
            TextRender.pixelBBX[1] = TextRender.standardFontSize / 2;
            TextRender.pixelBBX[2] = TextRender.standardFontSize;
            TextRender.pixelBBX[3] = TextRender.standardFontSize;
            var orix = 16;
            var oriy = 16;
            var marginr = 16;
            var marginb = 16;
            this.charRender.scale(1, 1);
            TextRender.tmpRI.height = TextRender.standardFontSize;
            this.charRender.fontsz = TextRender.standardFontSize;
            var bmpdt = this.charRender.getCharBmp('g', fontstr, 0, 'red', null, TextRender.tmpRI, orix, oriy, marginr, marginb);
            if (ILaya.Render.isConchApp) {
                bmpdt.data = new Uint8ClampedArray(bmpdt.data);
            }
            this.bmpData32 = new Uint32Array(bmpdt.data.buffer);
            this.updateBbx(bmpdt, TextRender.pixelBBX, false);
            bmpdt = this.charRender.getCharBmp('有', fontstr, 0, 'red', null, TextRender.tmpRI, oriy, oriy, marginr, marginb);
            if (ILaya.Render.isConchApp) {
                bmpdt.data = new Uint8ClampedArray(bmpdt.data);
            }
            this.bmpData32 = new Uint32Array(bmpdt.data.buffer);
            if (TextRender.pixelBBX[2] < orix + TextRender.tmpRI.width)
                TextRender.pixelBBX[2] = orix + TextRender.tmpRI.width;
            this.updateBbx(bmpdt, TextRender.pixelBBX, false);
            if (ILaya.Render.isConchApp) {
                orix = 0;
                oriy = 0;
            }
            var xoff = Math.max(orix - TextRender.pixelBBX[0], 0);
            var yoff = Math.max(oriy - TextRender.pixelBBX[1], 0);
            var bbxw = TextRender.pixelBBX[2] - TextRender.pixelBBX[0];
            var bbxh = TextRender.pixelBBX[3] - TextRender.pixelBBX[1];
            var sizeinfo = xoff << 24 | yoff << 16 | bbxw << 8 | bbxh;
            this.fontSizeInfo[font] = sizeinfo;
            return sizeinfo;
        }
        printDbgInfo() {
            console.log('图集个数:' + this.textAtlases.length + ',每个图集大小:' + TextRender.atlasWidth + 'x' + TextRender.atlasWidth, ' 用canvas:', TextRender.isWan1Wan);
            console.log('图集占用空间:' + (TextRender.atlasWidth * TextRender.atlasWidth * 4 / 1024 / 1024 * this.textAtlases.length) + 'M');
            console.log('缓存用到的字体:');
            for (var f in this.mapFont) {
                var fontsz = this.getFontSizeInfo(f);
                var offx = fontsz >> 24;
                var offy = (fontsz >> 16) & 0xff;
                var fw = (fontsz >> 8) & 0xff;
                var fh = fontsz & 0xff;
                console.log('    ' + f, ' off:', offx, offy, ' size:', fw, fh);
            }
            var num = 0;
            console.log('缓存数据:');
            var totalUsedRate = 0;
            var totalUsedRateAtlas = 0;
            this.textAtlases.forEach(function (a) {
                var id = a.texture.id;
                var dt = RenderInfo.loopCount - a.texture.lastTouchTm;
                var dtstr = dt > 0 ? ('' + dt + '帧以前') : '当前帧';
                totalUsedRate += a.texture.curUsedCovRate;
                totalUsedRateAtlas += a.texture.curUsedCovRateAtlas;
                console.log('--图集(id:' + id + ',当前使用率:' + (a.texture.curUsedCovRate * 1000 | 0) + '‰', '当前图集使用率:', (a.texture.curUsedCovRateAtlas * 100 | 0) + '%', '图集使用率:', (a.usedRate * 100 | 0), '%, 使用于:' + dtstr + ')--:');
                for (var k in a.charMaps) {
                    var ri = a.charMaps[k];
                    console.log('     off:', ri.orix, ri.oriy, ' bmp宽高:', ri.bmpWidth, ri.bmpHeight, '无效:', ri.deleted, 'touchdt:', (RenderInfo.loopCount - ri.touchTick), '位置:', ri.uv[0] * TextRender.atlasWidth | 0, ri.uv[1] * TextRender.atlasWidth | 0, '字符:', ri.char, 'key:', k);
                    num++;
                }
            });
            console.log('独立贴图文字(' + this.isoTextures.length + '个):');
            this.isoTextures.forEach(function (tex) {
                console.log('    size:', tex._texW, tex._texH, 'touch间隔:', (RenderInfo.loopCount - tex.lastTouchTm), 'char:', tex.ri.char);
            });
            console.log('总缓存:', num, '总使用率:', totalUsedRate, '总当前图集使用率:', totalUsedRateAtlas);
        }
        showAtlas(n, bgcolor, x, y, w, h) {
            if (!this.textAtlases[n]) {
                console.log('没有这个图集');
                return null;
            }
            var sp = new ILaya.Sprite();
            var texttex = this.textAtlases[n].texture;
            var texture = {
                width: TextRender.atlasWidth,
                height: TextRender.atlasWidth,
                sourceWidth: TextRender.atlasWidth,
                sourceHeight: TextRender.atlasWidth,
                offsetX: 0,
                offsetY: 0,
                getIsReady: function () { return true; },
                _addReference: function () { },
                _removeReference: function () { },
                _getSource: function () { return texttex._getSource(); },
                bitmap: { id: texttex.id },
                _uv: Texture.DEF_UV
            };
            sp.size = function (w, h) {
                this.width = w;
                this.height = h;
                sp.graphics.clear();
                sp.graphics.drawRect(0, 0, sp.width, sp.height, bgcolor);
                sp.graphics.drawTexture(texture, 0, 0, sp.width, sp.height);
                return this;
            };
            sp.graphics.drawRect(0, 0, w, h, bgcolor);
            sp.graphics.drawTexture(texture, 0, 0, w, h);
            sp.pos(x, y);
            ILaya.stage.addChild(sp);
            return sp;
        }
        filltext_native(ctx, data, htmlchars, x, y, fontStr, color, strokeColor, lineWidth, textAlign, underLine = 0) {
            if (data && data.length <= 0)
                return;
            if (htmlchars && htmlchars.length < 1)
                return;
            var font = FontInfo.Parse(fontStr);
            var nTextAlign = 0;
            switch (textAlign) {
                case 'center':
                    nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                    break;
                case 'right':
                    nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                    break;
            }
            return this._fast_filltext(ctx, data, htmlchars, x, y, font, color, strokeColor, lineWidth, nTextAlign, underLine);
        }
    }
    TextRender.useOldCharBook = false;
    TextRender.atlasWidth = 2048;
    TextRender.noAtlas = false;
    TextRender.forceSplitRender = false;
    TextRender.forceWholeRender = false;
    TextRender.scaleFontWithCtx = true;
    TextRender.standardFontSize = 32;
    TextRender.destroyAtlasDt = 10;
    TextRender.checkCleanTextureDt = 2000;
    TextRender.destroyUnusedTextureDt = 3000;
    TextRender.cleanMem = 100 * 1024 * 1024;
    TextRender.isWan1Wan = false;
    TextRender.showLog = false;
    TextRender.debugUV = false;
    TextRender.atlasWidth2 = 2048 * 2048;
    TextRender.tmpRI = new CharRenderInfo();
    TextRender.pixelBBX = [0, 0, 0, 0];
    TextRender.textRenderInst = null;
    TextRender.imgdtRect = [0, 0, 0, 0];
    TextRender.simClean = false;
    TextTexture.gTextRender = TextRender;

    class Context {
        constructor() {
            this._tmpMatrix = new Matrix();
            this._drawTexToDrawTri_Vert = new Float32Array(8);
            this._drawTexToDrawTri_Index = new Uint16Array([0, 1, 2, 0, 2, 3]);
            this._tempUV = new Float32Array(8);
            this._drawTriUseAbsMatrix = false;
            this._id = ++Context._COUNT;
            this._other = null;
            this._renderNextSubmitIndex = 0;
            this._path = null;
            this._drawCount = 1;
            this._width = Context._MAXSIZE;
            this._height = Context._MAXSIZE;
            this._renderCount = 0;
            this._isConvexCmd = true;
            this._submits = null;
            this._curSubmit = null;
            this._submitKey = new SubmitKey();
            this._mesh = null;
            this._pathMesh = null;
            this._triangleMesh = null;
            this.meshlist = [];
            this._transedPoints = new Array(8);
            this._temp4Points = new Array(8);
            this._clipRect = Context.MAXCLIPRECT;
            this._globalClipMatrix = new Matrix(Context._MAXSIZE, 0, 0, Context._MAXSIZE, 0, 0);
            this._clipInCache = false;
            this._clipInfoID = 0;
            this._clipID_Gen = 0;
            this._curMat = null;
            this._lastMatScaleX = 1.0;
            this._lastMatScaleY = 1.0;
            this._lastMat_a = 1.0;
            this._lastMat_b = 0.0;
            this._lastMat_c = 0.0;
            this._lastMat_d = 1.0;
            this._nBlendType = 0;
            this._save = null;
            this._targets = null;
            this._charSubmitCache = null;
            this._saveMark = null;
            this._shader2D = new Shader2D();
            this.sprite = null;
            this._italicDeg = 0;
            this._lastTex = null;
            this._fillColor = 0;
            this._flushCnt = 0;
            this.defTexture = null;
            this._colorFiler = null;
            this.drawTexAlign = false;
            this._incache = false;
            this.isMain = false;
            Context._contextcount++;
            Context._textRender = Context._textRender || new TextRender();
            if (!this.defTexture) {
                var defTex2d = new Texture2D(2, 2);
                defTex2d.setPixels(new Uint8Array(16));
                defTex2d.lock = true;
                this.defTexture = new Texture(defTex2d);
            }
            this._lastTex = this.defTexture;
            this.clear();
        }
        static __init__() {
            Context.MAXCLIPRECT = new Rectangle(0, 0, Context._MAXSIZE, Context._MAXSIZE);
            ContextParams.DEFAULT = new ContextParams();
        }
        drawImage(...args) {
        }
        getImageData(...args) {
        }
        measureText(text) {
            return null;
        }
        setTransform(...args) {
        }
        $transform(a, b, c, d, tx, ty) {
        }
        get lineJoin() {
            return null;
        }
        set lineJoin(value) {
        }
        get lineCap() {
            return null;
        }
        set lineCap(value) {
        }
        get miterLimit() {
            return null;
        }
        set miterLimit(value) {
        }
        clearRect(x, y, width, height) {
        }
        _drawRect(x, y, width, height, style) {
            Stat.renderBatches++;
            style && (this.fillStyle = style);
            this.fillRect(x, y, width, height, null);
        }
        drawTexture2(x, y, pivotX, pivotY, m, args2) {
        }
        transformByMatrix(matrix, tx, ty) {
            this.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + tx, matrix.ty + ty);
        }
        saveTransform(matrix) {
            this.save();
        }
        restoreTransform(matrix) {
            this.restore();
        }
        drawRect(x, y, width, height, fillColor, lineColor, lineWidth) {
            var ctx = this;
            if (fillColor != null) {
                ctx.fillStyle = fillColor;
                ctx.fillRect(x, y, width, height);
            }
            if (lineColor != null) {
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = lineWidth;
                ctx.strokeRect(x, y, width, height);
            }
        }
        alpha(value) {
            this.globalAlpha *= value;
        }
        _transform(mat, pivotX, pivotY) {
            this.translate(pivotX, pivotY);
            this.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
            this.translate(-pivotX, -pivotY);
        }
        _rotate(angle, pivotX, pivotY) {
            this.translate(pivotX, pivotY);
            this.rotate(angle);
            this.translate(-pivotX, -pivotY);
        }
        _scale(scaleX, scaleY, pivotX, pivotY) {
            this.translate(pivotX, pivotY);
            this.scale(scaleX, scaleY);
            this.translate(-pivotX, -pivotY);
        }
        _drawLine(x, y, fromX, fromY, toX, toY, lineColor, lineWidth, vid) {
            this.beginPath();
            this.strokeStyle = lineColor;
            this.lineWidth = lineWidth;
            this.moveTo(x + fromX, y + fromY);
            this.lineTo(x + toX, y + toY);
            this.stroke();
        }
        _drawLines(x, y, points, lineColor, lineWidth, vid) {
            this.beginPath();
            this.strokeStyle = lineColor;
            this.lineWidth = lineWidth;
            var n = points.length;
            this.addPath(points.slice(), false, false, x, y);
            this.stroke();
        }
        drawCurves(x, y, points, lineColor, lineWidth) {
            this.beginPath();
            this.strokeStyle = lineColor;
            this.lineWidth = lineWidth;
            this.moveTo(x + points[0], y + points[1]);
            var i = 2, n = points.length;
            while (i < n) {
                this.quadraticCurveTo(x + points[i++], y + points[i++], x + points[i++], y + points[i++]);
            }
            this.stroke();
        }
        _fillAndStroke(fillColor, strokeColor, lineWidth, isConvexPolygon = false) {
            if (fillColor != null) {
                this.fillStyle = fillColor;
                this.fill();
            }
            if (strokeColor != null && lineWidth > 0) {
                this.strokeStyle = strokeColor;
                this.lineWidth = lineWidth;
                this.stroke();
            }
        }
        _drawCircle(x, y, radius, fillColor, lineColor, lineWidth, vid) {
            Stat.renderBatches++;
            this.beginPath(true);
            this.arc(x, y, radius, 0, Context.PI2);
            this.closePath();
            this._fillAndStroke(fillColor, lineColor, lineWidth);
        }
        _drawPie(x, y, radius, startAngle, endAngle, fillColor, lineColor, lineWidth, vid) {
            this.beginPath();
            this.moveTo(x, y);
            this.arc(x, y, radius, startAngle, endAngle);
            this.closePath();
            this._fillAndStroke(fillColor, lineColor, lineWidth);
        }
        _drawPoly(x, y, points, fillColor, lineColor, lineWidth, isConvexPolygon, vid) {
            var n = points.length;
            this.beginPath();
            this.addPath(points.slice(), true, isConvexPolygon, x, y);
            this.closePath();
            this._fillAndStroke(fillColor, lineColor, lineWidth, isConvexPolygon);
        }
        _drawPath(x, y, paths, brush, pen) {
            this.beginPath();
            for (var i = 0, n = paths.length; i < n; i++) {
                var path = paths[i];
                switch (path[0]) {
                    case "moveTo":
                        this.moveTo(x + path[1], y + path[2]);
                        break;
                    case "lineTo":
                        this.lineTo(x + path[1], y + path[2]);
                        break;
                    case "arcTo":
                        this.arcTo(x + path[1], y + path[2], x + path[3], y + path[4], path[5]);
                        break;
                    case "closePath":
                        this.closePath();
                        break;
                }
            }
            if (brush != null) {
                this.fillStyle = brush.fillStyle;
                this.fill();
            }
            if (pen != null) {
                this.strokeStyle = pen.strokeStyle;
                this.lineWidth = pen.lineWidth || 1;
                this.lineJoin = pen.lineJoin;
                this.lineCap = pen.lineCap;
                this.miterLimit = pen.miterLimit;
                this.stroke();
            }
        }
        static set2DRenderConfig() {
            var gl = LayaGL.instance;
            WebGLContext.setBlend(gl, true);
            WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            WebGLContext.setDepthTest(gl, false);
            WebGLContext.setCullFace(gl, false);
            WebGLContext.setDepthMask(gl, true);
            WebGLContext.setFrontFace(gl, gl.CCW);
            gl.viewport(0, 0, RenderState2D.width, RenderState2D.height);
        }
        clearBG(r, g, b, a) {
            var gl = WebGLContext.mainContext;
            gl.clearColor(r, g, b, a);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        _getSubmits() {
            return this._submits;
        }
        _releaseMem(keepRT = false) {
            if (!this._submits)
                return;
            this._curMat.destroy();
            this._curMat = null;
            this._shader2D.destroy();
            this._shader2D = null;
            this._charSubmitCache.clear();
            for (var i = 0, n = this._submits._length; i < n; i++) {
                this._submits[i].releaseRender();
            }
            this._submits.length = 0;
            this._submits._length = 0;
            this._submits = null;
            this._curSubmit = null;
            this._path = null;
            this._save = null;
            var sz;
            for (i = 0, sz = this.meshlist.length; i < sz; i++) {
                var curm = this.meshlist[i];
                curm.destroy();
            }
            this.meshlist.length = 0;
            this.sprite = null;
            if (!keepRT) {
                this._targets && (this._targets.destroy());
                this._targets = null;
            }
        }
        destroy(keepRT = false) {
            --Context._contextcount;
            this.sprite = null;
            this._releaseMem(keepRT);
            this._charSubmitCache.destroy();
            this._mesh.destroy();
            if (!keepRT) {
                this._targets && this._targets.destroy();
                this._targets = null;
            }
        }
        clear() {
            if (!this._submits) {
                this._other = ContextParams.DEFAULT;
                this._curMat = Matrix.create();
                this._charSubmitCache = new CharSubmitCache();
                this._mesh = MeshQuadTexture.getAMesh(this.isMain);
                this.meshlist.push(this._mesh);
                this._pathMesh = MeshVG.getAMesh(this.isMain);
                this.meshlist.push(this._pathMesh);
                this._triangleMesh = MeshTexture.getAMesh(this.isMain);
                this.meshlist.push(this._triangleMesh);
                this._submits = [];
                this._save = [SaveMark.Create(this)];
                this._save.length = 10;
                this._shader2D = new Shader2D();
            }
            this._submitKey.clear();
            this._mesh.clearVB();
            this._renderCount++;
            this._drawCount = 1;
            this._other = ContextParams.DEFAULT;
            this._other.lineWidth = this._shader2D.ALPHA = 1.0;
            this._nBlendType = 0;
            this._clipRect = Context.MAXCLIPRECT;
            this._curSubmit = SubmitBase.RENDERBASE;
            SubmitBase.RENDERBASE._ref = 0xFFFFFF;
            SubmitBase.RENDERBASE._numEle = 0;
            this._shader2D.fillStyle = this._shader2D.strokeStyle = DrawStyle.DEFAULT;
            for (var i = 0, n = this._submits._length; i < n; i++)
                this._submits[i].releaseRender();
            this._submits._length = 0;
            this._curMat.identity();
            this._other.clear();
            this._saveMark = this._save[0];
            this._save._length = 1;
        }
        size(w, h) {
            if (this._width != w || this._height != h) {
                this._width = w;
                this._height = h;
                if (this._targets) {
                    this._targets.destroy();
                    this._targets = new RenderTexture2D(w, h, BaseTexture.FORMAT_R8G8B8A8, -1);
                }
                if (this.isMain) {
                    WebGLContext.mainContext.viewport(0, 0, w, h);
                    RenderState2D.width = w;
                    RenderState2D.height = h;
                }
            }
            if (w === 0 && h === 0)
                this._releaseMem();
        }
        set asBitmap(value) {
            if (value) {
                this._targets || (this._targets = new RenderTexture2D(this._width, this._height, BaseTexture.FORMAT_R8G8B8A8, -1));
                if (!this._width || !this._height)
                    throw Error("asBitmap no size!");
            }
            else {
                this._targets && this._targets.destroy();
                this._targets = null;
            }
        }
        getMatScaleX() {
            if (this._lastMat_a == this._curMat.a && this._lastMat_b == this._curMat.b)
                return this._lastMatScaleX;
            this._lastMatScaleX = this._curMat.getScaleX();
            this._lastMat_a = this._curMat.a;
            this._lastMat_b = this._curMat.b;
            return this._lastMatScaleX;
        }
        getMatScaleY() {
            if (this._lastMat_c == this._curMat.c && this._lastMat_d == this._curMat.d)
                return this._lastMatScaleY;
            this._lastMatScaleY = this._curMat.getScaleY();
            this._lastMat_c = this._curMat.c;
            this._lastMat_d = this._curMat.d;
            return this._lastMatScaleY;
        }
        setFillColor(color) {
            this._fillColor = color;
        }
        getFillColor() {
            return this._fillColor;
        }
        set fillStyle(value) {
            if (!this._shader2D.fillStyle.equal(value)) {
                SaveBase.save(this, SaveBase.TYPE_FILESTYLE, this._shader2D, false);
                this._shader2D.fillStyle = DrawStyle.create(value);
                this._submitKey.other = -this._shader2D.fillStyle.toInt();
            }
        }
        get fillStyle() {
            return this._shader2D.fillStyle;
        }
        set globalAlpha(value) {
            value = Math.floor(value * 1000) / 1000;
            if (value != this._shader2D.ALPHA) {
                SaveBase.save(this, SaveBase.TYPE_ALPHA, this._shader2D, false);
                this._shader2D.ALPHA = value;
            }
        }
        get globalAlpha() {
            return this._shader2D.ALPHA;
        }
        set textAlign(value) {
            (this._other.textAlign === value) || (this._other = this._other.make(), SaveBase.save(this, SaveBase.TYPE_TEXTALIGN, this._other, false), this._other.textAlign = value);
        }
        get textAlign() {
            return this._other.textAlign;
        }
        set textBaseline(value) {
            (this._other.textBaseline === value) || (this._other = this._other.make(), SaveBase.save(this, SaveBase.TYPE_TEXTBASELINE, this._other, false), this._other.textBaseline = value);
        }
        get textBaseline() {
            return this._other.textBaseline;
        }
        set globalCompositeOperation(value) {
            var n = BlendMode.TOINT[value];
            n == null || (this._nBlendType === n) || (SaveBase.save(this, SaveBase.TYPE_GLOBALCOMPOSITEOPERATION, this, true), this._curSubmit = SubmitBase.RENDERBASE, this._nBlendType = n);
        }
        get globalCompositeOperation() {
            return BlendMode.NAMES[this._nBlendType];
        }
        set strokeStyle(value) {
            this._shader2D.strokeStyle.equal(value) || (SaveBase.save(this, SaveBase.TYPE_STROKESTYLE, this._shader2D, false), this._shader2D.strokeStyle = DrawStyle.create(value), this._submitKey.other = -this._shader2D.strokeStyle.toInt());
        }
        get strokeStyle() {
            return this._shader2D.strokeStyle;
        }
        translate(x, y) {
            if (x !== 0 || y !== 0) {
                SaveTranslate.save(this);
                if (this._curMat._bTransform) {
                    SaveTransform.save(this);
                    this._curMat.tx += (x * this._curMat.a + y * this._curMat.c);
                    this._curMat.ty += (x * this._curMat.b + y * this._curMat.d);
                }
                else {
                    this._curMat.tx = x;
                    this._curMat.ty = y;
                }
            }
        }
        set lineWidth(value) {
            (this._other.lineWidth === value) || (this._other = this._other.make(), SaveBase.save(this, SaveBase.TYPE_LINEWIDTH, this._other, false), this._other.lineWidth = value);
        }
        get lineWidth() {
            return this._other.lineWidth;
        }
        save() {
            this._save[this._save._length++] = SaveMark.Create(this);
        }
        restore() {
            var sz = this._save._length;
            var lastBlend = this._nBlendType;
            if (sz < 1)
                return;
            for (var i = sz - 1; i >= 0; i--) {
                var o = this._save[i];
                o.restore(this);
                if (o.isSaveMark()) {
                    this._save._length = i;
                    return;
                }
            }
            if (lastBlend != this._nBlendType) {
                this._curSubmit = SubmitBase.RENDERBASE;
            }
        }
        set font(str) {
            this._other = this._other.make();
            SaveBase.save(this, SaveBase.TYPE_FONT, this._other, false);
        }
        fillText(txt, x, y, fontStr, color, align) {
            this._fillText(txt, null, x, y, fontStr, color, null, 0, null);
        }
        _fillText(txt, words, x, y, fontStr, color, strokeColor, lineWidth, textAlign, underLine = 0) {
            if (txt)
                Context._textRender.filltext(this, txt, x, y, fontStr, color, strokeColor, lineWidth, textAlign, underLine);
            else if (words)
                Context._textRender.fillWords(this, words, x, y, fontStr, color, strokeColor, lineWidth);
        }
        _fast_filltext(data, x, y, fontObj, color, strokeColor, lineWidth, textAlign, underLine = 0) {
            Context._textRender._fast_filltext(this, data, null, x, y, fontObj, color, strokeColor, lineWidth, textAlign, underLine);
        }
        fillWords(words, x, y, fontStr, color) {
            this._fillText(null, words, x, y, fontStr, color, null, -1, null, 0);
        }
        fillBorderWords(words, x, y, font, color, borderColor, lineWidth) {
            this._fillBorderText(null, words, x, y, font, color, borderColor, lineWidth, null);
        }
        drawText(text, x, y, font, color, textAlign) {
            this._fillText(text, null, x, y, font, ColorUtils.create(color).strColor, null, -1, textAlign);
        }
        strokeWord(text, x, y, font, color, lineWidth, textAlign) {
            this._fillText(text, null, x, y, font, null, ColorUtils.create(color).strColor, lineWidth || 1, textAlign);
        }
        fillBorderText(txt, x, y, fontStr, fillColor, borderColor, lineWidth, textAlign) {
            this._fillBorderText(txt, null, x, y, fontStr, ColorUtils.create(fillColor).strColor, ColorUtils.create(borderColor).strColor, lineWidth, textAlign);
        }
        _fillBorderText(txt, words, x, y, fontStr, fillColor, borderColor, lineWidth, textAlign) {
            this._fillText(txt, words, x, y, fontStr, fillColor, borderColor, lineWidth || 1, textAlign);
        }
        _fillRect(x, y, width, height, rgba) {
            var submit = this._curSubmit;
            var sameKey = submit && (submit._key.submitType === SubmitBase.KEY_DRAWTEXTURE && submit._key.blendShader === this._nBlendType);
            if (this._mesh.vertNum + 4 > Context._MAXVERTNUM) {
                this._mesh = MeshQuadTexture.getAMesh(this.isMain);
                this.meshlist.push(this._mesh);
                sameKey = false;
            }
            sameKey && (sameKey = sameKey && this.isSameClipInfo(submit));
            this.transformQuad(x, y, width, height, 0, this._curMat, this._transedPoints);
            if (!this.clipedOff(this._transedPoints)) {
                this._mesh.addQuad(this._transedPoints, Texture.NO_UV, rgba, false);
                if (!sameKey) {
                    submit = this._curSubmit = SubmitTexture.create(this, this._mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
                    this._submits[this._submits._length++] = submit;
                    this._copyClipInfo(submit, this._globalClipMatrix);
                    submit.shaderValue.textureHost = this._lastTex;
                    submit._key.other = (this._lastTex && this._lastTex.bitmap) ? this._lastTex.bitmap.id : -1;
                    submit._renderType = SubmitBase.TYPE_TEXTURE;
                }
                this._curSubmit._numEle += 6;
                this._mesh.indexNum += 6;
                this._mesh.vertNum += 4;
            }
        }
        fillRect(x, y, width, height, fillStyle) {
            var drawstyle = fillStyle ? DrawStyle.create(fillStyle) : this._shader2D.fillStyle;
            var rgba = this.mixRGBandAlpha(drawstyle.toInt());
            this._fillRect(x, y, width, height, rgba);
        }
        fillTexture(texture, x, y, width, height, type, offset, other) {
            if (!texture._getSource()) {
                this.sprite && ILaya.systemTimer.callLater(this, this._repaintSprite);
                return;
            }
            this._fillTexture(texture, texture.width, texture.height, texture.uvrect, x, y, width, height, type, offset.x, offset.y);
        }
        _fillTexture(texture, texw, texh, texuvRect, x, y, width, height, type, offsetx, offsety) {
            var submit = this._curSubmit;
            if (this._mesh.vertNum + 4 > Context._MAXVERTNUM) {
                this._mesh = MeshQuadTexture.getAMesh(this.isMain);
                this.meshlist.push(this._mesh);
            }
            var repeatx = true;
            var repeaty = true;
            switch (type) {
                case "repeat": break;
                case "repeat-x":
                    repeaty = false;
                    break;
                case "repeat-y":
                    repeatx = false;
                    break;
                case "no-repeat":
                    repeatx = repeaty = false;
                    break;
                default: break;
            }
            var uv = this._temp4Points;
            var stu = 0;
            var stv = 0;
            var stx = 0, sty = 0, edx = 0, edy = 0;
            if (offsetx < 0) {
                stx = x;
                stu = (-offsetx % texw) / texw;
            }
            else {
                stx = x + offsetx;
            }
            if (offsety < 0) {
                sty = y;
                stv = (-offsety % texh) / texh;
            }
            else {
                sty = y + offsety;
            }
            edx = x + width;
            edy = y + height;
            (!repeatx) && (edx = Math.min(edx, x + offsetx + texw));
            (!repeaty) && (edy = Math.min(edy, y + offsety + texh));
            if (edx < x || edy < y)
                return;
            if (stx > edx || sty > edy)
                return;
            var edu = (edx - x - offsetx) / texw;
            var edv = (edy - y - offsety) / texh;
            this.transformQuad(stx, sty, edx - stx, edy - sty, 0, this._curMat, this._transedPoints);
            uv[0] = stu;
            uv[1] = stv;
            uv[2] = edu;
            uv[3] = stv;
            uv[4] = edu;
            uv[5] = edv;
            uv[6] = stu;
            uv[7] = edv;
            if (!this.clipedOff(this._transedPoints)) {
                var rgba = this._mixRGBandAlpha(0xffffffff, this._shader2D.ALPHA);
                this._mesh.addQuad(this._transedPoints, uv, rgba, true);
                var sv = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
                sv.defines.add(ShaderDefines2D.FILLTEXTURE);
                sv.u_TexRange = texuvRect;
                submit = this._curSubmit = SubmitTexture.create(this, this._mesh, sv);
                this._submits[this._submits._length++] = submit;
                this._copyClipInfo(submit, this._globalClipMatrix);
                submit.shaderValue.textureHost = texture;
                submit._renderType = SubmitBase.TYPE_TEXTURE;
                this._curSubmit._numEle += 6;
                this._mesh.indexNum += 6;
                this._mesh.vertNum += 4;
            }
            this.breakNextMerge();
        }
        setColorFilter(filter) {
            SaveBase.save(this, SaveBase.TYPE_COLORFILTER, this, true);
            this._colorFiler = filter;
            this._curSubmit = SubmitBase.RENDERBASE;
        }
        drawTexture(tex, x, y, width, height) {
            this._drawTextureM(tex, x, y, width, height, null, 1, null);
        }
        drawTextures(tex, pos, tx, ty) {
            if (!tex._getSource()) {
                this.sprite && ILaya.systemTimer.callLater(this, this._repaintSprite);
                return;
            }
            var n = pos.length / 2;
            var ipos = 0;
            var bmpid = tex.bitmap.id;
            for (var i = 0; i < n; i++) {
                this._inner_drawTexture(tex, bmpid, pos[ipos++] + tx, pos[ipos++] + ty, 0, 0, null, null, 1.0, false);
            }
        }
        _drawTextureAddSubmit(imgid, tex) {
            var submit = null;
            submit = SubmitTexture.create(this, this._mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
            this._submits[this._submits._length++] = submit;
            submit.shaderValue.textureHost = tex;
            submit._key.other = imgid;
            submit._renderType = SubmitBase.TYPE_TEXTURE;
            this._curSubmit = submit;
        }
        _drawTextureM(tex, x, y, width, height, m, alpha, uv) {
            var cs = this.sprite;
            if (!tex._getSource(function () {
                if (cs) {
                    cs.repaint();
                }
            })) {
                return false;
            }
            return this._inner_drawTexture(tex, tex.bitmap.id, x, y, width, height, m, uv, alpha, false);
        }
        _drawRenderTexture(tex, x, y, width, height, m, alpha, uv) {
            return this._inner_drawTexture(tex, -1, x, y, width, height, m, uv, 1.0, false);
        }
        submitDebugger() {
            this._submits[this._submits._length++] = SubmitCMD.create([], function () { debugger; }, this);
        }
        _copyClipInfo(submit, clipInfo) {
            var cm = submit.shaderValue.clipMatDir;
            cm[0] = clipInfo.a;
            cm[1] = clipInfo.b;
            cm[2] = clipInfo.c;
            cm[3] = clipInfo.d;
            var cmp = submit.shaderValue.clipMatPos;
            cmp[0] = clipInfo.tx;
            cmp[1] = clipInfo.ty;
            submit.clipInfoID = this._clipInfoID;
            if (this._clipInCache) {
                submit.shaderValue.clipOff[0] = 1;
            }
        }
        isSameClipInfo(submit) {
            return (submit.clipInfoID === this._clipInfoID);
        }
        _useNewTex2DSubmit(tex, minVertNum) {
            if (this._mesh.vertNum + minVertNum > Context._MAXVERTNUM) {
                this._mesh = MeshQuadTexture.getAMesh(this.isMain);
                this.meshlist.push(this._mesh);
            }
            var submit = SubmitTexture.create(this, this._mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
            this._submits[this._submits._length++] = this._curSubmit = submit;
            submit.shaderValue.textureHost = tex;
            this._copyClipInfo(submit, this._globalClipMatrix);
        }
        _drawTexRect(x, y, w, h, uv) {
            this.transformQuad(x, y, w, h, this._italicDeg, this._curMat, this._transedPoints);
            var ops = this._transedPoints;
            ops[0] = (ops[0] + 0.5) | 0;
            ops[1] = (ops[1] + 0.5) | 0;
            ops[2] = (ops[2] + 0.5) | 0;
            ops[3] = (ops[3] + 0.5) | 0;
            ops[4] = (ops[4] + 0.5) | 0;
            ops[5] = (ops[5] + 0.5) | 0;
            ops[6] = (ops[6] + 0.5) | 0;
            ops[7] = (ops[7] + 0.5) | 0;
            if (!this.clipedOff(this._transedPoints)) {
                this._mesh.addQuad(this._transedPoints, uv, this._fillColor, true);
                this._curSubmit._numEle += 6;
                this._mesh.indexNum += 6;
                this._mesh.vertNum += 4;
            }
        }
        drawCallOptimize(enbale) {
            this._charSubmitCache.enable(enbale, this);
            return enbale;
        }
        _inner_drawTexture(tex, imgid, x, y, width, height, m, uv, alpha, lastRender) {
            var preKey = this._curSubmit._key;
            uv = uv || tex._uv;
            if (preKey.submitType === SubmitBase.KEY_TRIANGLES && preKey.other === imgid) {
                var tv = this._drawTexToDrawTri_Vert;
                tv[0] = x;
                tv[1] = y;
                tv[2] = x + width, tv[3] = y, tv[4] = x + width, tv[5] = y + height, tv[6] = x, tv[7] = y + height;
                this._drawTriUseAbsMatrix = true;
                var tuv = this._tempUV;
                tuv[0] = uv[0];
                tuv[1] = uv[1];
                tuv[2] = uv[2];
                tuv[3] = uv[3];
                tuv[4] = uv[4];
                tuv[5] = uv[5];
                tuv[6] = uv[6];
                tuv[7] = uv[7];
                this.drawTriangles(tex, 0, 0, tv, tuv, this._drawTexToDrawTri_Index, m, alpha, null, null);
                this._drawTriUseAbsMatrix = false;
                return true;
            }
            var mesh = this._mesh;
            var submit = this._curSubmit;
            var ops = lastRender ? this._charSubmitCache.getPos() : this._transedPoints;
            this.transformQuad(x, y, width || tex.width, height || tex.height, this._italicDeg, m || this._curMat, ops);
            if (this.drawTexAlign) {
                var round = Math.round;
                ops[0] = round(ops[0]);
                ops[1] = round(ops[1]);
                ops[2] = round(ops[2]);
                ops[3] = round(ops[3]);
                ops[4] = round(ops[4]);
                ops[5] = round(ops[5]);
                ops[6] = round(ops[6]);
                ops[7] = round(ops[7]);
                this.drawTexAlign = false;
            }
            var rgba = this._mixRGBandAlpha(0xffffffff, this._shader2D.ALPHA * alpha);
            if (lastRender) {
                this._charSubmitCache.add(this, tex, imgid, ops, uv, rgba);
                return true;
            }
            this._drawCount++;
            var sameKey = imgid >= 0 && preKey.submitType === SubmitBase.KEY_DRAWTEXTURE && preKey.other === imgid;
            sameKey && (sameKey = sameKey && this.isSameClipInfo(submit));
            this._lastTex = tex;
            if (mesh.vertNum + 4 > Context._MAXVERTNUM) {
                mesh = this._mesh = MeshQuadTexture.getAMesh(this.isMain);
                this.meshlist.push(mesh);
                sameKey = false;
            }
            {
                mesh.addQuad(ops, uv, rgba, true);
                if (!sameKey) {
                    this._submits[this._submits._length++] = this._curSubmit = submit = SubmitTexture.create(this, mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
                    submit.shaderValue.textureHost = tex;
                    submit._key.other = imgid;
                    this._copyClipInfo(submit, this._globalClipMatrix);
                }
                submit._numEle += 6;
                mesh.indexNum += 6;
                mesh.vertNum += 4;
                return true;
            }
            return false;
        }
        transform4Points(a, m, out) {
            var tx = m.tx;
            var ty = m.ty;
            var ma = m.a;
            var mb = m.b;
            var mc = m.c;
            var md = m.d;
            var a0 = a[0];
            var a1 = a[1];
            var a2 = a[2];
            var a3 = a[3];
            var a4 = a[4];
            var a5 = a[5];
            var a6 = a[6];
            var a7 = a[7];
            if (m._bTransform) {
                out[0] = a0 * ma + a1 * mc + tx;
                out[1] = a0 * mb + a1 * md + ty;
                out[2] = a2 * ma + a3 * mc + tx;
                out[3] = a2 * mb + a3 * md + ty;
                out[4] = a4 * ma + a5 * mc + tx;
                out[5] = a4 * mb + a5 * md + ty;
                out[6] = a6 * ma + a7 * mc + tx;
                out[7] = a6 * mb + a7 * md + ty;
            }
            else {
                out[0] = a0 + tx;
                out[1] = a1 + ty;
                out[2] = a2 + tx;
                out[3] = a3 + ty;
                out[4] = a4 + tx;
                out[5] = a5 + ty;
                out[6] = a6 + tx;
                out[7] = a7 + ty;
            }
        }
        clipedOff(pt) {
            if (this._clipRect.width <= 0 || this._clipRect.height <= 0)
                return true;
            return false;
        }
        transformQuad(x, y, w, h, italicDeg, m, out) {
            var xoff = 0;
            if (italicDeg != 0) {
                xoff = Math.tan(italicDeg * Math.PI / 180) * h;
            }
            var maxx = x + w;
            var maxy = y + h;
            var tx = m.tx;
            var ty = m.ty;
            var ma = m.a;
            var mb = m.b;
            var mc = m.c;
            var md = m.d;
            var a0 = x + xoff;
            var a1 = y;
            var a2 = maxx + xoff;
            var a3 = y;
            var a4 = maxx;
            var a5 = maxy;
            var a6 = x;
            var a7 = maxy;
            if (m._bTransform) {
                out[0] = a0 * ma + a1 * mc + tx;
                out[1] = a0 * mb + a1 * md + ty;
                out[2] = a2 * ma + a3 * mc + tx;
                out[3] = a2 * mb + a3 * md + ty;
                out[4] = a4 * ma + a5 * mc + tx;
                out[5] = a4 * mb + a5 * md + ty;
                out[6] = a6 * ma + a7 * mc + tx;
                out[7] = a6 * mb + a7 * md + ty;
            }
            else {
                out[0] = a0 + tx;
                out[1] = a1 + ty;
                out[2] = a2 + tx;
                out[3] = a3 + ty;
                out[4] = a4 + tx;
                out[5] = a5 + ty;
                out[6] = a6 + tx;
                out[7] = a7 + ty;
            }
        }
        pushRT() {
            this.addRenderObject(SubmitCMD.create(null, RenderTexture2D.pushRT, this));
        }
        popRT() {
            this.addRenderObject(SubmitCMD.create(null, RenderTexture2D.popRT, this));
            this.breakNextMerge();
        }
        useRT(rt) {
            function _use(rt) {
                if (!rt) {
                    throw 'error useRT';
                }
                else {
                    rt.start();
                    rt.clear(0, 0, 0, 0);
                }
            }
            this.addRenderObject(SubmitCMD.create([rt], _use, this));
            this.breakNextMerge();
        }
        RTRestore(rt) {
            function _restore(rt) {
                rt.restore();
            }
            this.addRenderObject(SubmitCMD.create([rt], _restore, this));
            this.breakNextMerge();
        }
        breakNextMerge() {
            this._curSubmit = SubmitBase.RENDERBASE;
        }
        _repaintSprite() {
            this.sprite && this.sprite.repaint();
        }
        drawTextureWithTransform(tex, x, y, width, height, transform, tx, ty, alpha, blendMode, colorfilter = null, uv) {
            var oldcomp = null;
            var curMat = this._curMat;
            if (blendMode) {
                oldcomp = this.globalCompositeOperation;
                this.globalCompositeOperation = blendMode;
            }
            var oldColorFilter = this._colorFiler;
            if (colorfilter) {
                this.setColorFilter(colorfilter);
            }
            if (!transform) {
                this._drawTextureM(tex, x + tx, y + ty, width, height, curMat, alpha, uv);
                if (blendMode) {
                    this.globalCompositeOperation = oldcomp;
                }
                if (colorfilter) {
                    this.setColorFilter(oldColorFilter);
                }
                return;
            }
            var tmpMat = this._tmpMatrix;
            tmpMat.a = transform.a;
            tmpMat.b = transform.b;
            tmpMat.c = transform.c;
            tmpMat.d = transform.d;
            tmpMat.tx = transform.tx + tx;
            tmpMat.ty = transform.ty + ty;
            tmpMat._bTransform = transform._bTransform;
            if (transform && curMat._bTransform) {
                Matrix.mul(tmpMat, curMat, tmpMat);
                transform = tmpMat;
                transform._bTransform = true;
            }
            else {
                tmpMat.tx += curMat.tx;
                tmpMat.ty += curMat.ty;
                transform = tmpMat;
            }
            this._drawTextureM(tex, x, y, width, height, transform, alpha, uv);
            if (blendMode) {
                this.globalCompositeOperation = oldcomp;
            }
            if (colorfilter) {
                this.setColorFilter(oldColorFilter);
            }
        }
        _flushToTarget(context, target) {
            RenderState2D.worldScissorTest = false;
            var gl = LayaGL.instance;
            gl.disable(gl.SCISSOR_TEST);
            var preAlpha = RenderState2D.worldAlpha;
            var preMatrix4 = RenderState2D.worldMatrix4;
            var preMatrix = RenderState2D.worldMatrix;
            RenderState2D.worldMatrix = Matrix.EMPTY;
            RenderState2D.restoreTempArray();
            RenderState2D.worldMatrix4 = RenderState2D.TEMPMAT4_ARRAY;
            RenderState2D.worldAlpha = 1;
            BaseShader.activeShader = null;
            target.start();
            if (context._submits._length > 0)
                target.clear(0, 0, 0, 0);
            context._curSubmit = SubmitBase.RENDERBASE;
            context.flush();
            context.clear();
            target.restore();
            context._curSubmit = SubmitBase.RENDERBASE;
            BaseShader.activeShader = null;
            RenderState2D.worldAlpha = preAlpha;
            RenderState2D.worldMatrix4 = preMatrix4;
            RenderState2D.worldMatrix = preMatrix;
        }
        drawCanvas(canvas, x, y, width, height) {
            if (!canvas)
                return;
            var src = canvas.context;
            var submit;
            if (src._targets) {
                if (src._submits._length > 0) {
                    submit = SubmitCMD.create([src, src._targets], this._flushToTarget, this);
                    this._submits[this._submits._length++] = submit;
                }
                this._drawRenderTexture(src._targets, x, y, width, height, null, 1.0, RenderTexture2D.flipyuv);
                this._curSubmit = SubmitBase.RENDERBASE;
            }
            else {
                var canv = canvas;
                if (canv.touches) {
                    canv.touches.forEach(function (v) { v.touch(); });
                }
                submit = SubmitCanvas.create(canvas, this._shader2D.ALPHA, this._shader2D.filters);
                this._submits[this._submits._length++] = submit;
                submit._key.clear();
                var mat = submit._matrix;
                this._curMat.copyTo(mat);
                var tx = mat.tx, ty = mat.ty;
                mat.tx = mat.ty = 0;
                mat.transformPoint(Point.TEMP.setTo(x, y));
                mat.translate(Point.TEMP.x + tx, Point.TEMP.y + ty);
                Matrix.mul(canv.invMat, mat, mat);
                this._curSubmit = SubmitBase.RENDERBASE;
            }
        }
        drawTarget(rt, x, y, width, height, m, shaderValue, uv = null, blend = -1) {
            this._drawCount++;
            if (this._mesh.vertNum + 4 > Context._MAXVERTNUM) {
                this._mesh = MeshQuadTexture.getAMesh(this.isMain);
                this.meshlist.push(this._mesh);
            }
            this.transformQuad(x, y, width, height, 0, m || this._curMat, this._transedPoints);
            if (!this.clipedOff(this._transedPoints)) {
                this._mesh.addQuad(this._transedPoints, uv || Texture.DEF_UV, 0xffffffff, true);
                var submit = this._curSubmit = SubmitTarget.create(this, this._mesh, shaderValue, rt);
                submit.blendType = (blend == -1) ? this._nBlendType : blend;
                this._copyClipInfo(submit, this._globalClipMatrix);
                submit._numEle = 6;
                this._mesh.indexNum += 6;
                this._mesh.vertNum += 4;
                this._submits[this._submits._length++] = submit;
                this._curSubmit = SubmitBase.RENDERBASE;
                return true;
            }
            this._curSubmit = SubmitBase.RENDERBASE;
            return false;
        }
        drawTriangles(tex, x, y, vertices, uvs, indices, matrix, alpha, color, blendMode) {
            if (!tex._getSource()) {
                if (this.sprite) {
                    ILaya.systemTimer.callLater(this, this._repaintSprite);
                }
                return;
            }
            this._drawCount++;
            var tmpMat = this._tmpMatrix;
            var triMesh = this._triangleMesh;
            var oldColorFilter = null;
            var needRestorFilter = false;
            if (color) {
                oldColorFilter = this._colorFiler;
                this._colorFiler = color;
                this._curSubmit = SubmitBase.RENDERBASE;
                needRestorFilter = oldColorFilter != color;
            }
            var webGLImg = tex.bitmap;
            var preKey = this._curSubmit._key;
            var sameKey = preKey.submitType === SubmitBase.KEY_TRIANGLES && preKey.other === webGLImg.id && preKey.blendShader == this._nBlendType;
            if (triMesh.vertNum + vertices.length / 2 > Context._MAXVERTNUM) {
                triMesh = this._triangleMesh = MeshTexture.getAMesh(this.isMain);
                this.meshlist.push(triMesh);
                sameKey = false;
            }
            if (!sameKey) {
                var submit = this._curSubmit = SubmitTexture.create(this, triMesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
                submit.shaderValue.textureHost = tex;
                submit._renderType = SubmitBase.TYPE_TEXTURE;
                submit._key.submitType = SubmitBase.KEY_TRIANGLES;
                submit._key.other = webGLImg.id;
                this._copyClipInfo(submit, this._globalClipMatrix);
                this._submits[this._submits._length++] = submit;
            }
            var rgba = this._mixRGBandAlpha(0xffffffff, this._shader2D.ALPHA * alpha);
            if (!this._drawTriUseAbsMatrix) {
                if (!matrix) {
                    tmpMat.a = 1;
                    tmpMat.b = 0;
                    tmpMat.c = 0;
                    tmpMat.d = 1;
                    tmpMat.tx = x;
                    tmpMat.ty = y;
                }
                else {
                    tmpMat.a = matrix.a;
                    tmpMat.b = matrix.b;
                    tmpMat.c = matrix.c;
                    tmpMat.d = matrix.d;
                    tmpMat.tx = matrix.tx + x;
                    tmpMat.ty = matrix.ty + y;
                }
                Matrix.mul(tmpMat, this._curMat, tmpMat);
                triMesh.addData(vertices, uvs, indices, tmpMat, rgba);
            }
            else {
                triMesh.addData(vertices, uvs, indices, matrix, rgba);
            }
            this._curSubmit._numEle += indices.length;
            if (needRestorFilter) {
                this._colorFiler = oldColorFilter;
                this._curSubmit = SubmitBase.RENDERBASE;
            }
        }
        transform(a, b, c, d, tx, ty) {
            SaveTransform.save(this);
            Matrix.mul(Matrix.TEMP.setTo(a, b, c, d, tx, ty), this._curMat, this._curMat);
            this._curMat._checkTransform();
        }
        _transformByMatrix(matrix, tx, ty) {
            matrix.setTranslate(tx, ty);
            Matrix.mul(matrix, this._curMat, this._curMat);
            matrix.setTranslate(0, 0);
            this._curMat._bTransform = true;
        }
        setTransformByMatrix(value) {
            value.copyTo(this._curMat);
        }
        rotate(angle) {
            SaveTransform.save(this);
            this._curMat.rotateEx(angle);
        }
        scale(scaleX, scaleY) {
            SaveTransform.save(this);
            this._curMat.scaleEx(scaleX, scaleY);
        }
        clipRect(x, y, width, height) {
            SaveClipRect.save(this);
            if (this._clipRect == Context.MAXCLIPRECT) {
                this._clipRect = new Rectangle(x, y, width, height);
            }
            else {
                this._clipRect.width = width;
                this._clipRect.height = height;
                this._clipRect.x = x;
                this._clipRect.y = y;
            }
            this._clipID_Gen++;
            this._clipID_Gen %= 10000;
            this._clipInfoID = this._clipID_Gen;
            var cm = this._globalClipMatrix;
            var minx = cm.tx;
            var miny = cm.ty;
            var maxx = minx + cm.a;
            var maxy = miny + cm.d;
            if (this._clipRect.width >= Context._MAXSIZE) {
                cm.a = cm.d = Context._MAXSIZE;
                cm.b = cm.c = cm.tx = cm.ty = 0;
            }
            else {
                if (this._curMat._bTransform) {
                    cm.tx = this._clipRect.x * this._curMat.a + this._clipRect.y * this._curMat.c + this._curMat.tx;
                    cm.ty = this._clipRect.x * this._curMat.b + this._clipRect.y * this._curMat.d + this._curMat.ty;
                    cm.a = this._clipRect.width * this._curMat.a;
                    cm.b = this._clipRect.width * this._curMat.b;
                    cm.c = this._clipRect.height * this._curMat.c;
                    cm.d = this._clipRect.height * this._curMat.d;
                }
                else {
                    cm.tx = this._clipRect.x + this._curMat.tx;
                    cm.ty = this._clipRect.y + this._curMat.ty;
                    cm.a = this._clipRect.width;
                    cm.b = cm.c = 0;
                    cm.d = this._clipRect.height;
                }
                if (this._incache) {
                    this._clipInCache = true;
                }
            }
            if (cm.a > 0 && cm.d > 0) {
                var cmaxx = cm.tx + cm.a;
                var cmaxy = cm.ty + cm.d;
                if (cmaxx <= minx || cmaxy <= miny || cm.tx >= maxx || cm.ty >= maxy) {
                    cm.a = -0.1;
                    cm.d = -0.1;
                }
                else {
                    if (cm.tx < minx) {
                        cm.a -= (minx - cm.tx);
                        cm.tx = minx;
                    }
                    if (cmaxx > maxx) {
                        cm.a -= (cmaxx - maxx);
                    }
                    if (cm.ty < miny) {
                        cm.d -= (miny - cm.ty);
                        cm.ty = miny;
                    }
                    if (cmaxy > maxy) {
                        cm.d -= (cmaxy - maxy);
                    }
                    if (cm.a <= 0)
                        cm.a = -0.1;
                    if (cm.d <= 0)
                        cm.d = -0.1;
                }
            }
        }
        drawMesh(x, y, ib, vb, numElement, mat, shader, shaderValues, startIndex = 0) {
        }
        addRenderObject(o) {
            this._submits[this._submits._length++] = o;
        }
        submitElement(start, end) {
            var mainCtx = this.isMain;
            var renderList = this._submits;
            var ret = renderList._length;
            end < 0 && (end = renderList._length);
            var submit = SubmitBase.RENDERBASE;
            while (start < end) {
                this._renderNextSubmitIndex = start + 1;
                if (renderList[start] === SubmitBase.RENDERBASE) {
                    start++;
                    continue;
                }
                SubmitBase.preRender = submit;
                submit = renderList[start];
                start += submit.renderSubmit();
            }
            return ret;
        }
        flush() {
            this._clipID_Gen = 0;
            var ret = this.submitElement(0, this._submits._length);
            this._path && this._path.reset();
            SkinMeshBuffer.instance && SkinMeshBuffer.getInstance().reset();
            this._curSubmit = SubmitBase.RENDERBASE;
            for (var i = 0, sz = this.meshlist.length; i < sz; i++) {
                var curm = this.meshlist[i];
                curm.canReuse ? (curm.releaseMesh()) : (curm.destroy());
            }
            this.meshlist.length = 0;
            this._mesh = MeshQuadTexture.getAMesh(this.isMain);
            this._pathMesh = MeshVG.getAMesh(this.isMain);
            this._triangleMesh = MeshTexture.getAMesh(this.isMain);
            this.meshlist.push(this._mesh, this._pathMesh, this._triangleMesh);
            this._flushCnt++;
            if (this._flushCnt % 60 == 0 && this.isMain) {
                if (TextRender.textRenderInst) {
                    TextRender.textRenderInst.GC();
                }
            }
            return ret;
        }
        beginPath(convex = false) {
            var tPath = this._getPath();
            tPath.beginPath(convex);
        }
        closePath() {
            this._path.closePath();
        }
        addPath(points, close, convex, dx, dy) {
            var ci = 0;
            for (var i = 0, sz = points.length / 2; i < sz; i++) {
                var x1 = points[ci] + dx, y1 = points[ci + 1] + dy;
                points[ci] = x1;
                points[ci + 1] = y1;
                ci += 2;
            }
            this._getPath().push(points, convex);
        }
        fill() {
            var m = this._curMat;
            var tPath = this._getPath();
            var submit = this._curSubmit;
            var sameKey = (submit._key.submitType === SubmitBase.KEY_VG && submit._key.blendShader === this._nBlendType);
            sameKey && (sameKey = sameKey && this.isSameClipInfo(submit));
            if (!sameKey) {
                this._curSubmit = this.addVGSubmit(this._pathMesh);
            }
            var rgba = this.mixRGBandAlpha(this.fillStyle.toInt());
            var curEleNum = 0;
            var idx;
            for (var i = 0, sz = tPath.paths.length; i < sz; i++) {
                var p = tPath.paths[i];
                var vertNum = p.path.length / 2;
                if (vertNum < 3 || (vertNum == 3 && !p.convex))
                    continue;
                var cpath = p.path.concat();
                var pi = 0;
                var xp, yp;
                var _x, _y;
                if (m._bTransform) {
                    for (pi = 0; pi < vertNum; pi++) {
                        xp = pi << 1;
                        yp = xp + 1;
                        _x = cpath[xp];
                        _y = cpath[yp];
                        cpath[xp] = m.a * _x + m.c * _y + m.tx;
                        cpath[yp] = m.b * _x + m.d * _y + m.ty;
                    }
                }
                else {
                    for (pi = 0; pi < vertNum; pi++) {
                        xp = pi << 1;
                        yp = xp + 1;
                        _x = cpath[xp];
                        _y = cpath[yp];
                        cpath[xp] = _x + m.tx;
                        cpath[yp] = _y + m.ty;
                    }
                }
                if (this._pathMesh.vertNum + vertNum > Context._MAXVERTNUM) {
                    this._curSubmit._numEle += curEleNum;
                    curEleNum = 0;
                    this._pathMesh = MeshVG.getAMesh(this.isMain);
                    this._curSubmit = this.addVGSubmit(this._pathMesh);
                }
                var curvert = this._pathMesh.vertNum;
                if (p.convex) {
                    var faceNum = vertNum - 2;
                    idx = new Array(faceNum * 3);
                    var idxpos = 0;
                    for (var fi = 0; fi < faceNum; fi++) {
                        idx[idxpos++] = curvert;
                        idx[idxpos++] = fi + 1 + curvert;
                        idx[idxpos++] = fi + 2 + curvert;
                    }
                }
                else {
                    idx = Earcut.earcut(cpath, null, 2);
                    if (curvert > 0) {
                        for (var ii = 0; ii < idx.length; ii++) {
                            idx[ii] += curvert;
                        }
                    }
                }
                this._pathMesh.addVertAndIBToMesh(this, cpath, rgba, idx);
                curEleNum += idx.length;
            }
            this._curSubmit._numEle += curEleNum;
        }
        addVGSubmit(mesh) {
            var submit = Submit.createShape(this, mesh, 0, Value2D.create(ShaderDefines2D.PRIMITIVE, 0));
            submit._key.submitType = SubmitBase.KEY_VG;
            this._submits[this._submits._length++] = submit;
            this._copyClipInfo(submit, this._globalClipMatrix);
            return submit;
        }
        stroke() {
            if (this.lineWidth > 0) {
                var rgba = this.mixRGBandAlpha(this.strokeStyle._color.numColor);
                var tPath = this._getPath();
                var submit = this._curSubmit;
                var sameKey = (submit._key.submitType === SubmitBase.KEY_VG && submit._key.blendShader === this._nBlendType);
                sameKey && (sameKey = sameKey && this.isSameClipInfo(submit));
                if (!sameKey) {
                    this._curSubmit = this.addVGSubmit(this._pathMesh);
                }
                var curEleNum = 0;
                for (var i = 0, sz = tPath.paths.length; i < sz; i++) {
                    var p = tPath.paths[i];
                    if (p.path.length <= 0)
                        continue;
                    var idx = [];
                    var vertex = [];
                    var maxVertexNum = p.path.length * 2;
                    if (maxVertexNum < 2)
                        continue;
                    if (this._pathMesh.vertNum + maxVertexNum > Context._MAXVERTNUM) {
                        this._curSubmit._numEle += curEleNum;
                        curEleNum = 0;
                        this._pathMesh = MeshVG.getAMesh(this.isMain);
                        this.meshlist.push(this._pathMesh);
                        this._curSubmit = this.addVGSubmit(this._pathMesh);
                    }
                    BasePoly.createLine2(p.path, idx, this.lineWidth, this._pathMesh.vertNum, vertex, p.loop);
                    var ptnum = vertex.length / 2;
                    var m = this._curMat;
                    var pi = 0;
                    var xp, yp;
                    var _x, _y;
                    if (m._bTransform) {
                        for (pi = 0; pi < ptnum; pi++) {
                            xp = pi << 1;
                            yp = xp + 1;
                            _x = vertex[xp];
                            _y = vertex[yp];
                            vertex[xp] = m.a * _x + m.c * _y + m.tx;
                            vertex[yp] = m.b * _x + m.d * _y + m.ty;
                        }
                    }
                    else {
                        for (pi = 0; pi < ptnum; pi++) {
                            xp = pi << 1;
                            yp = xp + 1;
                            _x = vertex[xp];
                            _y = vertex[yp];
                            vertex[xp] = _x + m.tx;
                            vertex[yp] = _y + m.ty;
                        }
                    }
                    this._pathMesh.addVertAndIBToMesh(this, vertex, rgba, idx);
                    curEleNum += idx.length;
                }
                this._curSubmit._numEle += curEleNum;
            }
        }
        moveTo(x, y) {
            var tPath = this._getPath();
            tPath.newPath();
            tPath._lastOriX = x;
            tPath._lastOriY = y;
            tPath.addPoint(x, y);
        }
        lineTo(x, y) {
            var tPath = this._getPath();
            if (Math.abs(x - tPath._lastOriX) < 1e-3 && Math.abs(y - tPath._lastOriY) < 1e-3)
                return;
            tPath._lastOriX = x;
            tPath._lastOriY = y;
            tPath.addPoint(x, y);
        }
        arcTo(x1, y1, x2, y2, r) {
            var i = 0;
            var x = 0, y = 0;
            var dx = this._path._lastOriX - x1;
            var dy = this._path._lastOriY - y1;
            var len1 = Math.sqrt(dx * dx + dy * dy);
            if (len1 <= 0.000001) {
                return;
            }
            var ndx = dx / len1;
            var ndy = dy / len1;
            var dx2 = x2 - x1;
            var dy2 = y2 - y1;
            var len22 = dx2 * dx2 + dy2 * dy2;
            var len2 = Math.sqrt(len22);
            if (len2 <= 0.000001) {
                return;
            }
            var ndx2 = dx2 / len2;
            var ndy2 = dy2 / len2;
            var odx = ndx + ndx2;
            var ody = ndy + ndy2;
            var olen = Math.sqrt(odx * odx + ody * ody);
            if (olen <= 0.000001) {
                return;
            }
            var nOdx = odx / olen;
            var nOdy = ody / olen;
            var alpha = Math.acos(nOdx * ndx + nOdy * ndy);
            var halfAng = Math.PI / 2 - alpha;
            len1 = r / Math.tan(halfAng);
            var ptx1 = len1 * ndx + x1;
            var pty1 = len1 * ndy + y1;
            var orilen = Math.sqrt(len1 * len1 + r * r);
            var orix = x1 + nOdx * orilen;
            var oriy = y1 + nOdy * orilen;
            var dir = ndx * ndy2 - ndy * ndx2;
            var fChgAng = 0;
            var sinx = 0.0;
            var cosx = 0.0;
            if (dir >= 0) {
                fChgAng = halfAng * 2;
                var fda = fChgAng / Context.SEGNUM;
                sinx = Math.sin(fda);
                cosx = Math.cos(fda);
            }
            else {
                fChgAng = -halfAng * 2;
                fda = fChgAng / Context.SEGNUM;
                sinx = Math.sin(fda);
                cosx = Math.cos(fda);
            }
            var lastx = this._path._lastOriX, lasty = this._path._lastOriY;
            var _x1 = ptx1, _y1 = pty1;
            if (Math.abs(_x1 - this._path._lastOriX) > 0.1 || Math.abs(_y1 - this._path._lastOriY) > 0.1) {
                x = _x1;
                y = _y1;
                lastx = _x1;
                lasty = _y1;
                this._path.addPoint(x, y);
            }
            var cvx = ptx1 - orix;
            var cvy = pty1 - oriy;
            for (i = 0; i < Context.SEGNUM; i++) {
                var cx = cvx * cosx + cvy * sinx;
                var cy = -cvx * sinx + cvy * cosx;
                x = cx + orix;
                y = cy + oriy;
                if (Math.abs(lastx - x) > 0.1 || Math.abs(lasty - y) > 0.1) {
                    this._path.addPoint(x, y);
                    lastx = x;
                    lasty = y;
                }
                cvx = cx;
                cvy = cy;
            }
        }
        arc(cx, cy, r, startAngle, endAngle, counterclockwise = false, b = true) {
            var a = 0, da = 0;
            var dx = 0, dy = 0, x = 0, y = 0;
            var i, ndivs;
            da = endAngle - startAngle;
            if (!counterclockwise) {
                if (Math.abs(da) >= Math.PI * 2) {
                    da = Math.PI * 2;
                }
                else {
                    while (da < 0.0) {
                        da += Math.PI * 2;
                    }
                }
            }
            else {
                if (Math.abs(da) >= Math.PI * 2) {
                    da = -Math.PI * 2;
                }
                else {
                    while (da > 0.0) {
                        da -= Math.PI * 2;
                    }
                }
            }
            var sx = this.getMatScaleX();
            var sy = this.getMatScaleY();
            var sr = r * (sx > sy ? sx : sy);
            var cl = 2 * Math.PI * sr;
            ndivs = (Math.max(cl / 10, 10)) | 0;
            var tPath = this._getPath();
            for (i = 0; i <= ndivs; i++) {
                a = startAngle + da * (i / ndivs);
                dx = Math.cos(a);
                dy = Math.sin(a);
                x = cx + dx * r;
                y = cy + dy * r;
                if (x != this._path._lastOriX || y != this._path._lastOriY) {
                    tPath.addPoint(x, y);
                }
            }
            dx = Math.cos(endAngle);
            dy = Math.sin(endAngle);
            x = cx + dx * r;
            y = cy + dy * r;
            if (x != this._path._lastOriX || y != this._path._lastOriY) {
                tPath.addPoint(x, y);
            }
        }
        quadraticCurveTo(cpx, cpy, x, y) {
            var tBezier = Bezier.I;
            var tArray = tBezier.getBezierPoints([this._path._lastOriX, this._path._lastOriY, cpx, cpy, x, y], 30, 2);
            for (var i = 0, n = tArray.length / 2; i < n; i++) {
                this.lineTo(tArray[i * 2], tArray[i * 2 + 1]);
            }
            this.lineTo(x, y);
        }
        mixRGBandAlpha(color) {
            return this._mixRGBandAlpha(color, this._shader2D.ALPHA);
        }
        _mixRGBandAlpha(color, alpha) {
            if (alpha >= 1) {
                return color;
            }
            var a = ((color & 0xff000000) >>> 24);
            if (a != 0) {
                a *= alpha;
            }
            else {
                a = alpha * 255;
            }
            return (color & 0x00ffffff) | (a << 24);
        }
        strokeRect(x, y, width, height, parameterLineWidth) {
            if (this.lineWidth > 0) {
                var rgba = this.mixRGBandAlpha(this.strokeStyle._color.numColor);
                var hw = this.lineWidth / 2;
                this._fillRect(x - hw, y - hw, width + this.lineWidth, this.lineWidth, rgba);
                this._fillRect(x - hw, y - hw + height, width + this.lineWidth, this.lineWidth, rgba);
                this._fillRect(x - hw, y + hw, this.lineWidth, height - this.lineWidth, rgba);
                this._fillRect(x - hw + width, y + hw, this.lineWidth, height - this.lineWidth, rgba);
            }
        }
        clip() {
        }
        drawParticle(x, y, pt) {
            pt.x = x;
            pt.y = y;
            this._submits[this._submits._length++] = pt;
        }
        _getPath() {
            return this._path || (this._path = new Path());
        }
        get canvas() {
            return this._canvas;
        }
        _fillTexture_h(tex, imgid, uv, oriw, orih, x, y, w) {
            var stx = x;
            var num = Math.floor(w / oriw);
            var left = w % oriw;
            for (var i = 0; i < num; i++) {
                this._inner_drawTexture(tex, imgid, stx, y, oriw, orih, this._curMat, uv, 1, false);
                stx += oriw;
            }
            if (left > 0) {
                var du = uv[2] - uv[0];
                var uvr = uv[0] + du * (left / oriw);
                var tuv = Context.tmpuv1;
                tuv[0] = uv[0];
                tuv[1] = uv[1];
                tuv[2] = uvr;
                tuv[3] = uv[3];
                tuv[4] = uvr;
                tuv[5] = uv[5];
                tuv[6] = uv[6];
                tuv[7] = uv[7];
                this._inner_drawTexture(tex, imgid, stx, y, left, orih, this._curMat, tuv, 1, false);
            }
        }
        _fillTexture_v(tex, imgid, uv, oriw, orih, x, y, h) {
            var sty = y;
            var num = Math.floor(h / orih);
            var left = h % orih;
            for (var i = 0; i < num; i++) {
                this._inner_drawTexture(tex, imgid, x, sty, oriw, orih, this._curMat, uv, 1, false);
                sty += orih;
            }
            if (left > 0) {
                var dv = uv[7] - uv[1];
                var uvb = uv[1] + dv * (left / orih);
                var tuv = Context.tmpuv1;
                tuv[0] = uv[0];
                tuv[1] = uv[1];
                tuv[2] = uv[2];
                tuv[3] = uv[3];
                tuv[4] = uv[4];
                tuv[5] = uvb;
                tuv[6] = uv[6];
                tuv[7] = uvb;
                this._inner_drawTexture(tex, imgid, x, sty, oriw, left, this._curMat, tuv, 1, false);
            }
        }
        drawTextureWithSizeGrid(tex, tx, ty, width, height, sizeGrid, gx, gy) {
            if (!tex._getSource())
                return;
            tx += gx;
            ty += gy;
            var uv = tex.uv, w = tex.bitmap.width, h = tex.bitmap.height;
            var top = sizeGrid[0];
            var left = sizeGrid[3];
            var d_top = top / h;
            var d_left = left / w;
            var right = sizeGrid[1];
            var bottom = sizeGrid[2];
            var d_right = right / w;
            var d_bottom = bottom / h;
            var repeat = sizeGrid[4];
            var needClip = false;
            if (width == w) {
                left = right = 0;
            }
            if (height == h) {
                top = bottom = 0;
            }
            if (left + right > width) {
                var clipWidth = width;
                needClip = true;
                width = left + right;
                this.save();
                this.clipRect(0 + tx, 0 + ty, clipWidth, height);
            }
            var imgid = tex.bitmap.id;
            var mat = this._curMat;
            var tuv = this._tempUV;
            var uvl = uv[0];
            var uvt = uv[1];
            var uvr = uv[4];
            var uvb = uv[5];
            var uvl_ = uvl;
            var uvt_ = uvt;
            var uvr_ = uvr;
            var uvb_ = uvb;
            if (left && top) {
                uvr_ = uvl + d_left;
                uvb_ = uvt + d_top;
                tuv[0] = uvl, tuv[1] = uvt, tuv[2] = uvr_, tuv[3] = uvt,
                    tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl, tuv[7] = uvb_;
                this._inner_drawTexture(tex, imgid, tx, ty, left, top, mat, tuv, 1, false);
            }
            if (right && top) {
                uvl_ = uvr - d_right;
                uvt_ = uvt;
                uvr_ = uvr;
                uvb_ = uvt + d_top;
                tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                    tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
                this._inner_drawTexture(tex, imgid, width - right + tx, 0 + ty, right, top, mat, tuv, 1, false);
            }
            if (left && bottom) {
                uvl_ = uvl;
                uvt_ = uvb - d_bottom;
                uvr_ = uvl + d_left;
                uvb_ = uvb;
                tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                    tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
                this._inner_drawTexture(tex, imgid, 0 + tx, height - bottom + ty, left, bottom, mat, tuv, 1, false);
            }
            if (right && bottom) {
                uvl_ = uvr - d_right;
                uvt_ = uvb - d_bottom;
                uvr_ = uvr;
                uvb_ = uvb;
                tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                    tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
                this._inner_drawTexture(tex, imgid, width - right + tx, height - bottom + ty, right, bottom, mat, tuv, 1, false);
            }
            if (top) {
                uvl_ = uvl + d_left;
                uvt_ = uvt;
                uvr_ = uvr - d_right;
                uvb_ = uvt + d_top;
                tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                    tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
                if (repeat) {
                    this._fillTexture_h(tex, imgid, tuv, tex.width - left - right, top, left + tx, ty, width - left - right);
                }
                else {
                    this._inner_drawTexture(tex, imgid, left + tx, ty, width - left - right, top, mat, tuv, 1, false);
                }
            }
            if (bottom) {
                uvl_ = uvl + d_left;
                uvt_ = uvb - d_bottom;
                uvr_ = uvr - d_right;
                uvb_ = uvb;
                tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                    tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
                if (repeat) {
                    this._fillTexture_h(tex, imgid, tuv, tex.width - left - right, bottom, left + tx, height - bottom + ty, width - left - right);
                }
                else {
                    this._inner_drawTexture(tex, imgid, left + tx, height - bottom + ty, width - left - right, bottom, mat, tuv, 1, false);
                }
            }
            if (left) {
                uvl_ = uvl;
                uvt_ = uvt + d_top;
                uvr_ = uvl + d_left;
                uvb_ = uvb - d_bottom;
                tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                    tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
                if (repeat) {
                    this._fillTexture_v(tex, imgid, tuv, left, tex.height - top - bottom, tx, top + ty, height - top - bottom);
                }
                else {
                    this._inner_drawTexture(tex, imgid, tx, top + ty, left, height - top - bottom, mat, tuv, 1, false);
                }
            }
            if (right) {
                uvl_ = uvr - d_right;
                uvt_ = uvt + d_top;
                uvr_ = uvr;
                uvb_ = uvb - d_bottom;
                tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                    tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
                if (repeat) {
                    this._fillTexture_v(tex, imgid, tuv, right, tex.height - top - bottom, width - right + tx, top + ty, height - top - bottom);
                }
                else {
                    this._inner_drawTexture(tex, imgid, width - right + tx, top + ty, right, height - top - bottom, mat, tuv, 1, false);
                }
            }
            uvl_ = uvl + d_left;
            uvt_ = uvt + d_top;
            uvr_ = uvr - d_right;
            uvb_ = uvb - d_bottom;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            if (repeat) {
                var tuvr = Context.tmpUVRect;
                tuvr[0] = uvl_;
                tuvr[1] = uvt_;
                tuvr[2] = uvr_ - uvl_;
                tuvr[3] = uvb_ - uvt_;
                this._fillTexture(tex, tex.width - left - right, tex.height - top - bottom, tuvr, left + tx, top + ty, width - left - right, height - top - bottom, 'repeat', 0, 0);
            }
            else {
                this._inner_drawTexture(tex, imgid, left + tx, top + ty, width - left - right, height - top - bottom, mat, tuv, 1, false);
            }
            if (needClip)
                this.restore();
        }
    }
    Context.ENUM_TEXTALIGN_DEFAULT = 0;
    Context.ENUM_TEXTALIGN_CENTER = 1;
    Context.ENUM_TEXTALIGN_RIGHT = 2;
    Context._SUBMITVBSIZE = 32000;
    Context._MAXSIZE = 99999999;
    Context._MAXVERTNUM = 65535;
    Context.MAXCLIPRECT = null;
    Context._COUNT = 0;
    Context.SEGNUM = 32;
    Context._contextcount = 0;
    Context.PI2 = 2 * Math.PI;
    Context._textRender = null;
    Context.tmpuv1 = [0, 0, 0, 0, 0, 0, 0, 0];
    Context.tmpUV = [0, 0, 0, 0, 0, 0, 0, 0];
    Context.tmpUVRect = [0, 0, 0, 0];
    class ContextParams {
        constructor() {
            this.lineWidth = 1;
        }
        clear() {
            this.lineWidth = 1;
            this.textAlign = this.textBaseline = null;
        }
        make() {
            return this === ContextParams.DEFAULT ? new ContextParams() : this;
        }
    }

    class WebGL {
        static _uint8ArraySlice() {
            var _this = this;
            var sz = _this.length;
            var dec = new Uint8Array(_this.length);
            for (var i = 0; i < sz; i++)
                dec[i] = _this[i];
            return dec;
        }
        static _float32ArraySlice() {
            var _this = this;
            var sz = _this.length;
            var dec = new Float32Array(_this.length);
            for (var i = 0; i < sz; i++)
                dec[i] = _this[i];
            return dec;
        }
        static _uint16ArraySlice(...arg) {
            var _this = this;
            var sz;
            var dec;
            var i;
            if (arg.length === 0) {
                sz = _this.length;
                dec = new Uint16Array(sz);
                for (i = 0; i < sz; i++)
                    dec[i] = _this[i];
            }
            else if (arg.length === 2) {
                var start = arg[0];
                var end = arg[1];
                if (end > start) {
                    sz = end - start;
                    dec = new Uint16Array(sz);
                    for (i = start; i < end; i++)
                        dec[i - start] = _this[i];
                }
                else {
                    dec = new Uint16Array(0);
                }
            }
            return dec;
        }
        static _nativeRender_enable() {
        }
        static enable() {
            return true;
        }
        static inner_enable() {
            Float32Array.prototype.slice || (Float32Array.prototype.slice = WebGL._float32ArraySlice);
            Uint16Array.prototype.slice || (Uint16Array.prototype.slice = WebGL._uint16ArraySlice);
            Uint8Array.prototype.slice || (Uint8Array.prototype.slice = WebGL._uint8ArraySlice);
            return true;
        }
        static onStageResize(width, height) {
            if (WebGLContext.mainContext == null)
                return;
            WebGLContext.mainContext.viewport(0, 0, width, height);
            RenderState2D.width = width;
            RenderState2D.height = height;
        }
    }
    WebGL._isWebGL2 = false;
    WebGL.isNativeRender_enable = false;

    class VertexArrayObject {
        constructor() {
        }
    }
    (function () {
        var glErrorShadow = {};
        function error(msg) {
            if (window.console && window.console.error) {
                window.console.error(msg);
            }
        }
        function log(msg) {
            if (window.console && window.console.log) {
                window.console.log(msg);
            }
        }
        function synthesizeGLError(err, opt_msg) {
            glErrorShadow[err] = true;
            if (opt_msg !== undefined) {
                error(opt_msg);
            }
        }
        function wrapGLError(gl) {
            var f = gl.getError;
            gl.getError = function () {
                var err;
                do {
                    err = f.apply(gl);
                    if (err != gl.NO_ERROR) {
                        glErrorShadow[err] = true;
                    }
                } while (err != gl.NO_ERROR);
                for (var err1 in glErrorShadow) {
                    if (glErrorShadow[err1]) {
                        delete glErrorShadow[err1];
                        return parseInt(err1);
                    }
                }
                return gl.NO_ERROR;
            };
        }
        var WebGLVertexArrayObjectOES = function WebGLVertexArrayObjectOES(ext) {
            var gl = ext.gl;
            this.ext = ext;
            this.isAlive = true;
            this.hasBeenBound = false;
            this.elementArrayBuffer = null;
            this.attribs = new Array(ext.maxVertexAttribs);
            for (var n = 0; n < this.attribs.length; n++) {
                var attrib = new WebGLVertexArrayObjectOES.VertexAttrib(gl);
                this.attribs[n] = attrib;
            }
            this.maxAttrib = 0;
        };
        WebGLVertexArrayObjectOES.VertexAttrib = function VertexAttrib(gl) {
            this.enabled = false;
            this.buffer = null;
            this.size = 4;
            this.type = gl.FLOAT;
            this.normalized = false;
            this.stride = 16;
            this.offset = 0;
            this.cached = "";
            this.recache();
        };
        WebGLVertexArrayObjectOES.VertexAttrib.prototype.recache = function recache() {
            this.cached = [this.size, this.type, this.normalized, this.stride, this.offset].join(":");
        };
        var OESVertexArrayObject = function OESVertexArrayObject(gl) {
            var self = this;
            this.gl = gl;
            wrapGLError(gl);
            var original = this.original = {
                getParameter: gl.getParameter,
                enableVertexAttribArray: gl.enableVertexAttribArray,
                disableVertexAttribArray: gl.disableVertexAttribArray,
                bindBuffer: gl.bindBuffer,
                getVertexAttrib: gl.getVertexAttrib,
                vertexAttribPointer: gl.vertexAttribPointer
            };
            gl.getParameter = function getParameter(pname) {
                if (pname == self.VERTEX_ARRAY_BINDING_OES) {
                    if (self.currentVertexArrayObject == self.defaultVertexArrayObject) {
                        return null;
                    }
                    else {
                        return self.currentVertexArrayObject;
                    }
                }
                return original.getParameter.apply(this, arguments);
            };
            gl.enableVertexAttribArray = function enableVertexAttribArray(index) {
                var vao = self.currentVertexArrayObject;
                vao.maxAttrib = Math.max(vao.maxAttrib, index);
                var attrib = vao.attribs[index];
                attrib.enabled = true;
                return original.enableVertexAttribArray.apply(this, arguments);
            };
            gl.disableVertexAttribArray = function disableVertexAttribArray(index) {
                var vao = self.currentVertexArrayObject;
                vao.maxAttrib = Math.max(vao.maxAttrib, index);
                var attrib = vao.attribs[index];
                attrib.enabled = false;
                return original.disableVertexAttribArray.apply(this, arguments);
            };
            gl.bindBuffer = function bindBuffer(target, buffer) {
                switch (target) {
                    case gl.ARRAY_BUFFER:
                        self.currentArrayBuffer = buffer;
                        break;
                    case gl.ELEMENT_ARRAY_BUFFER:
                        self.currentVertexArrayObject.elementArrayBuffer = buffer;
                        break;
                }
                return original.bindBuffer.apply(this, arguments);
            };
            gl.getVertexAttrib = function getVertexAttrib(index, pname) {
                var vao = self.currentVertexArrayObject;
                var attrib = vao.attribs[index];
                switch (pname) {
                    case gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING:
                        return attrib.buffer;
                    case gl.VERTEX_ATTRIB_ARRAY_ENABLED:
                        return attrib.enabled;
                    case gl.VERTEX_ATTRIB_ARRAY_SIZE:
                        return attrib.size;
                    case gl.VERTEX_ATTRIB_ARRAY_STRIDE:
                        return attrib.stride;
                    case gl.VERTEX_ATTRIB_ARRAY_TYPE:
                        return attrib.type;
                    case gl.VERTEX_ATTRIB_ARRAY_NORMALIZED:
                        return attrib.normalized;
                    default:
                        return original.getVertexAttrib.apply(this, arguments);
                }
            };
            gl.vertexAttribPointer = function vertexAttribPointer(indx, size, type, normalized, stride, offset) {
                var vao = self.currentVertexArrayObject;
                vao.maxAttrib = Math.max(vao.maxAttrib, indx);
                var attrib = vao.attribs[indx];
                attrib.buffer = self.currentArrayBuffer;
                attrib.size = size;
                attrib.type = type;
                attrib.normalized = normalized;
                attrib.stride = stride;
                attrib.offset = offset;
                attrib.recache();
                return original.vertexAttribPointer.apply(this, arguments);
            };
            if (gl.instrumentExtension) {
                gl.instrumentExtension(this, "OES_vertex_array_object");
            }

            gl.selfCacheCanvas.addEventListener('webglcontextrestored', function () {
                log("OESVertexArrayObject emulation library context restored");
                self.reset_();
            }, true);
            this.reset_();
        };
        OESVertexArrayObject.prototype.VERTEX_ARRAY_BINDING_OES = 0x85B5;
        OESVertexArrayObject.prototype.reset_ = function reset_() {
            var contextWasLost = this.vertexArrayObjects !== undefined;
            if (contextWasLost) {
                for (var ii = 0; ii < this.vertexArrayObjects.length; ++ii) {
                    this.vertexArrayObjects.isAlive = false;
                }
            }
            var gl = this.gl;
            this.maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
            this.defaultVertexArrayObject = new WebGLVertexArrayObjectOES(this);
            this.currentVertexArrayObject = null;
            this.currentArrayBuffer = null;
            this.vertexArrayObjects = [this.defaultVertexArrayObject];
            this.bindVertexArrayOES(null);
        };
        OESVertexArrayObject.prototype.createVertexArrayOES = function createVertexArrayOES() {
            var arrayObject = new WebGLVertexArrayObjectOES(this);
            this.vertexArrayObjects.push(arrayObject);
            return arrayObject;
        };
        OESVertexArrayObject.prototype.deleteVertexArrayOES = function deleteVertexArrayOES(arrayObject) {
            arrayObject.isAlive = false;
            this.vertexArrayObjects.splice(this.vertexArrayObjects.indexOf(arrayObject), 1);
            if (this.currentVertexArrayObject == arrayObject) {
                this.bindVertexArrayOES(null);
            }
        };
        OESVertexArrayObject.prototype.isVertexArrayOES = function isVertexArrayOES(arrayObject) {
            if (arrayObject && arrayObject instanceof WebGLVertexArrayObjectOES) {
                if (arrayObject.hasBeenBound && arrayObject.ext == this) {
                    return true;
                }
            }
            return false;
        };
        OESVertexArrayObject.prototype.bindVertexArrayOES = function bindVertexArrayOES(arrayObject) {
            var gl = this.gl;
            if (arrayObject && !arrayObject.isAlive) {
                synthesizeGLError(gl.INVALID_OPERATION, "bindVertexArrayOES: attempt to bind deleted arrayObject");
                return;
            }
            var original = this.original;
            var oldVAO = this.currentVertexArrayObject;
            this.currentVertexArrayObject = arrayObject || this.defaultVertexArrayObject;
            this.currentVertexArrayObject.hasBeenBound = true;
            var newVAO = this.currentVertexArrayObject;
            if (oldVAO == newVAO) {
                return;
            }
            if (!oldVAO || newVAO.elementArrayBuffer != oldVAO.elementArrayBuffer) {
                original.bindBuffer.call(gl, gl.ELEMENT_ARRAY_BUFFER, newVAO.elementArrayBuffer);
            }
            var currentBinding = this.currentArrayBuffer;
            var maxAttrib = Math.max(oldVAO ? oldVAO.maxAttrib : 0, newVAO.maxAttrib);
            for (var n = 0; n <= maxAttrib; n++) {
                var attrib = newVAO.attribs[n];
                var oldAttrib = oldVAO ? oldVAO.attribs[n] : null;
                if (!oldVAO || attrib.enabled != oldAttrib.enabled) {
                    if (attrib.enabled) {
                        original.enableVertexAttribArray.call(gl, n);
                    }
                    else {
                        original.disableVertexAttribArray.call(gl, n);
                    }
                }
                if (attrib.enabled) {
                    var bufferChanged = false;
                    if (!oldVAO || attrib.buffer != oldAttrib.buffer) {
                        if (currentBinding != attrib.buffer) {
                            original.bindBuffer.call(gl, gl.ARRAY_BUFFER, attrib.buffer);
                            currentBinding = attrib.buffer;
                        }
                        bufferChanged = true;
                    }
                    if (bufferChanged || attrib.cached != oldAttrib.cached) {
                        original.vertexAttribPointer.call(gl, n, attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
                    }
                }
            }
            if (this.currentArrayBuffer != currentBinding) {
                original.bindBuffer.call(gl, gl.ARRAY_BUFFER, this.currentArrayBuffer);
            }
        };
        window._setupVertexArrayObject = function (gl) {
            var original_getSupportedExtensions = gl.getSupportedExtensions;
            gl.getSupportedExtensions = function getSupportedExtensions() {
                var list = original_getSupportedExtensions.call(this) || [];
                if (list.indexOf("OES_vertex_array_object") < 0) {
                    list.push("OES_vertex_array_object");
                }
                return list;
            };
            var original_getExtension = gl.getExtension;
            gl.getExtension = function getExtension(name) {
                var ext = original_getExtension.call(this, name);
                if (ext) {
                    return ext;
                }
                if (name !== "OES_vertex_array_object") {
                    return null;
                }
                if (!this.__OESVertexArrayObject) {
                    console.log("Setup OES_vertex_array_object polyfill");
                    this.__OESVertexArrayObject = new OESVertexArrayObject(this);
                }
                return this.__OESVertexArrayObject;
            };
        };
        window._forceSetupVertexArrayObject = function (gl) {
            var original_getSupportedExtensions = gl.getSupportedExtensions;
            gl.getSupportedExtensions = function getSupportedExtensions() {
                var list = original_getSupportedExtensions.call(this) || [];
                if (list.indexOf("OES_vertex_array_object") < 0) {
                    list.push("OES_vertex_array_object");
                }
                return list;
            };
            var original_getExtension = gl.getExtension;
            gl.getExtension = function getExtension(name) {
                if (name === "OES_vertex_array_object") {
                    if (!this.__OESVertexArrayObject) {
                        console.log("Setup OES_vertex_array_object polyfill");
                        this.__OESVertexArrayObject = new OESVertexArrayObject(this);
                    }
                    return this.__OESVertexArrayObject;
                }
                else {
                    var ext = original_getExtension.call(this, name);
                    if (ext) {
                        return ext;
                    }
                    else {
                        return null;
                    }
                }
            };
        };
    }());

    class LayaGPU {
        constructor(gl, isWebGL2) {
            this._gl = null;
            this._vaoExt = null;
            this._angleInstancedArrays = null;
            this._isWebGL2 = false;
            this._oesTextureHalfFloat = null;
            this._extTextureFilterAnisotropic = null;
            this._compressedTextureS3tc = null;
            this._compressedTexturePvrtc = null;
            this._compressedTextureEtc1 = null;
            this._gl = gl;
            this._isWebGL2 = isWebGL2;
            try {
                var precisionFormat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
                precisionFormat.precision ? (WebGL.shaderHighPrecision = true) : WebGL.shaderHighPrecision = false;
            }
            catch (e) {
            }
            if (!isWebGL2) {
                var forceVAO = LayaGPU._forceSupportVAOPlatform();
                if (!ILaya.Render.isConchApp) {
                    if (window._setupVertexArrayObject) {
                        if (forceVAO)
                            window._forceSetupVertexArrayObject(gl);
                        else
                            window._setupVertexArrayObject(gl);
                    }
                }
                this._vaoExt = this._getExtension("OES_vertex_array_object");
                if (!forceVAO)
                    this._angleInstancedArrays = this._getExtension("ANGLE_instanced_arrays");
                this._oesTextureHalfFloat = this._getExtension("OES_texture_half_float");
                this._getExtension("OES_texture_half_float_linear");
            }
            else {
                this._getExtension("EXT_color_buffer_float");
            }
            this._extTextureFilterAnisotropic = this._getExtension("EXT_texture_filter_anisotropic");
            this._compressedTextureS3tc = this._getExtension("WEBGL_compressed_texture_s3tc");
            this._compressedTexturePvrtc = this._getExtension("WEBGL_compressed_texture_pvrtc");
            this._compressedTextureEtc1 = this._getExtension("WEBGL_compressed_texture_etc1");
        }
        static _forceSupportVAOPlatform() {
            let Browser = ILaya.Browser;
            return (Browser.onMiniGame && Browser.onIOS) || Browser.onBDMiniGame || Browser.onQGMiniGame;
        }
        _getExtension(name) {
            var prefixes = LayaGPU._extentionVendorPrefixes;
            for (var k in prefixes) {
                var ext = this._gl.getExtension(prefixes[k] + name);
                if (ext)
                    return ext;
            }
            return null;
        }
        createVertexArray() {
            if (this._isWebGL2)
                return this._gl.createVertexArray();
            else
                return this._vaoExt.createVertexArrayOES();
        }
        bindVertexArray(vertexArray) {
            if (this._isWebGL2)
                this._gl.bindVertexArray(vertexArray);
            else
                this._vaoExt.bindVertexArrayOES(vertexArray);
        }
        deleteVertexArray(vertexArray) {
            if (this._isWebGL2)
                this._gl.deleteVertexArray(vertexArray);
            else
                this._vaoExt.deleteVertexArrayOES(vertexArray);
        }
        isVertexArray(vertexArray) {
            if (this._isWebGL2)
                this._gl.isVertexArray(vertexArray);
            else
                this._vaoExt.isVertexArrayOES(vertexArray);
        }
        drawElementsInstanced(mode, count, type, offset, instanceCount) {
            if (this._isWebGL2)
                this._gl.drawElementsInstanced(mode, count, type, offset, instanceCount);
            else
                this._angleInstancedArrays.drawElementsInstancedANGLE(mode, count, type, offset, instanceCount);
        }
        drawArraysInstanced(mode, first, count, instanceCount) {
            if (this._isWebGL2)
                this._gl.drawArraysInstanced(mode, first, count, instanceCount);
            else
                this._angleInstancedArrays.drawArraysInstancedANGLE(mode, first, count, instanceCount);
        }
        vertexAttribDivisor(index, divisor) {
            if (this._isWebGL2)
                this._gl.vertexAttribDivisor(index, divisor);
            else
                this._angleInstancedArrays.vertexAttribDivisorANGLE(index, divisor);
        }
        supportInstance() {
            if (this._isWebGL2 || this._angleInstancedArrays)
                return true;
            else
                return false;
        }
    }
    LayaGPU._extentionVendorPrefixes = ["", "WEBKIT_", "MOZ_"];

    class Render {
        constructor(width, height, mainCanv) {
            this._timeId = 0;
            Render._mainCanvas = mainCanv;
            Render._mainCanvas.source.id = "layaCanvas";
            Render._mainCanvas.source.width = width;
            Render._mainCanvas.source.height = height;
            if (Render.isConchApp) {
                document.body.appendChild(Render._mainCanvas.source);
            }
            this.initRender(Render._mainCanvas, width, height);
            mainCanv._source.requestAnimationFrame(loop);
            function loop(stamp) {
                ILaya.stage._loop();
                mainCanv._source.requestAnimationFrame(loop);
            }
            ILaya.stage.on("visibilitychange", this, this._onVisibilitychange);
        }
        _onVisibilitychange() {
            if (!ILaya.stage.isVisibility) {
                this._timeId = window.setInterval(this._enterFrame, 1000);
            }
            else if (this._timeId != 0) {
                window.clearInterval(this._timeId);
            }
        }
        initRender(canvas, w, h) {
            function getWebGLContext(canvas) {
                var gl;
                var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
                if (!Config.useWebGL2 || Browser.onBDMiniGame) {
                    names.shift();
                }
                for (var i = 0; i < names.length; i++) {
                    try {
                        gl = canvas.getContext(names[i], { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer });
                    }
                    catch (e) {
                    }
                    if (gl) {
                        (names[i] === 'webgl2') && (WebGL._isWebGL2 = true);
                        return gl;
                    }
                }
                return null;
            }
            var gl = LayaGL.instance = WebGLContext.mainContext = getWebGLContext(Render._mainCanvas.source);
            if (!gl)
                return false;
            LayaGL.instance = gl;
            gl.selfCacheCanvas = Render._mainCanvas.source;
            LayaGL.layaGPUInstance = new LayaGPU(gl, WebGL._isWebGL2);
            canvas.size(w, h);
            Context.__init__();
            SubmitBase.__init__();
            var ctx = new Context();
            ctx.isMain = true;
            Render._context = ctx;
            canvas._setContext(ctx);
            ShaderDefines2D.__init__();
            Value2D.__init__();
            Shader2D.__init__();
            Buffer2D.__int__(gl);
            BlendMode._init_(gl);
            return true;
        }
        _enterFrame(e = null) {
            ILaya.stage._loop();
        }
        static get context() {
            return Render._context;
        }
        static get canvas() {
            return Render._mainCanvas.source;
        }
    }
    Render.supportWebGLPlusCulling = false;
    Render.supportWebGLPlusAnimation = false;
    Render.supportWebGLPlusRendering = false;
    Render.isConchApp = false;
    {
        Render.isConchApp = (window.conch != null);
        if (Render.isConchApp) {
            Render.supportWebGLPlusCulling = false;
            Render.supportWebGLPlusAnimation = true;
            Render.supportWebGLPlusRendering = true;
        }
        else if (window.qq != null && window.qq.webglPlus != null) {
            Render.supportWebGLPlusCulling = false;
            Render.supportWebGLPlusAnimation = true;
            Render.supportWebGLPlusRendering = true;
        }
    }

    class DrawTrianglesCmd {
        static create(texture, x, y, vertices, uvs, indices, matrix, alpha, color, blendMode) {
            var cmd = Pool.getItemByClass("DrawTrianglesCmd", DrawTrianglesCmd);
            cmd.texture = texture;
            cmd.x = x;
            cmd.y = y;
            cmd.vertices = vertices;
            cmd.uvs = uvs;
            cmd.indices = indices;
            cmd.matrix = matrix;
            cmd.alpha = alpha;
            if (color) {
                cmd.color = new ColorFilter();
                var c = ColorUtils.create(color).arrColor;
                cmd.color.color(c[0] * 255, c[1] * 255, c[2] * 255, c[3] * 255);
            }
            cmd.blendMode = blendMode;
            return cmd;
        }
        recover() {
            this.texture = null;
            this.vertices = null;
            this.uvs = null;
            this.indices = null;
            this.matrix = null;
            Pool.recover("DrawTrianglesCmd", this);
        }
        run(context, gx, gy) {
            context.drawTriangles(this.texture, this.x + gx, this.y + gy, this.vertices, this.uvs, this.indices, this.matrix, this.alpha, this.color, this.blendMode);
        }
        get cmdID() {
            return DrawTrianglesCmd.ID;
        }
    }
    DrawTrianglesCmd.ID = "DrawTriangles";

    class Draw9GridTexture {
        constructor() {
        }
        static create(texture, x, y, width, height, sizeGrid) {
            var cmd = Pool.getItemByClass("Draw9GridTexture", Draw9GridTexture);
            cmd.texture = texture;
            texture._addReference();
            cmd.x = x;
            cmd.y = y;
            cmd.width = width;
            cmd.height = height;
            cmd.sizeGrid = sizeGrid;
            return cmd;
        }
        recover() {
            this.texture._removeReference();
            Pool.recover("Draw9GridTexture", this);
        }
        run(context, gx, gy) {
            context.drawTextureWithSizeGrid(this.texture, this.x, this.y, this.width, this.height, this.sizeGrid, gx, gy);
        }
        get cmdID() {
            return Draw9GridTexture.ID;
        }
    }
    Draw9GridTexture.ID = "Draw9GridTexture";

    class GraphicsBounds {
        constructor() {
            this._cacheBoundsType = false;
        }
        destroy() {
            this._graphics = null;
            this._cacheBoundsType = false;
            if (this._temp)
                this._temp.length = 0;
            if (this._rstBoundPoints)
                this._rstBoundPoints.length = 0;
            if (this._bounds)
                this._bounds.recover();
            this._bounds = null;
            Pool.recover("GraphicsBounds", this);
        }
        static create() {
            return Pool.getItemByClass("GraphicsBounds", GraphicsBounds);
        }
        reset() {
            this._temp && (this._temp.length = 0);
        }
        getBounds(realSize = false) {
            if (!this._bounds || !this._temp || this._temp.length < 1 || realSize != this._cacheBoundsType) {
                this._bounds = Rectangle._getWrapRec(this.getBoundPoints(realSize), this._bounds);
            }
            this._cacheBoundsType = realSize;
            return this._bounds;
        }
        getBoundPoints(realSize = false) {
            if (!this._temp || this._temp.length < 1 || realSize != this._cacheBoundsType)
                this._temp = this._getCmdPoints(realSize);
            this._cacheBoundsType = realSize;
            return this._rstBoundPoints = Utils.copyArray(this._rstBoundPoints, this._temp);
        }
        _getCmdPoints(realSize = false) {
            var cmds = this._graphics.cmds;
            var rst;
            rst = this._temp || (this._temp = []);
            rst.length = 0;
            if (!cmds && this._graphics._one != null) {
                GraphicsBounds._tempCmds.length = 0;
                GraphicsBounds._tempCmds.push(this._graphics._one);
                cmds = GraphicsBounds._tempCmds;
            }
            if (!cmds)
                return rst;
            var matrixs = GraphicsBounds._tempMatrixArrays;
            matrixs.length = 0;
            var tMatrix = GraphicsBounds._initMatrix;
            tMatrix.identity();
            var tempMatrix = GraphicsBounds._tempMatrix;
            var cmd;
            var tex;
            for (var i = 0, n = cmds.length; i < n; i++) {
                cmd = cmds[i];
                switch (cmd.cmdID) {
                    case AlphaCmd.ID:
                        matrixs.push(tMatrix);
                        tMatrix = tMatrix.clone();
                        break;
                    case RestoreCmd.ID:
                        tMatrix = matrixs.pop();
                        break;
                    case ScaleCmd.ID:
                        tempMatrix.identity();
                        tempMatrix.translate(-cmd.pivotX, -cmd.pivotY);
                        tempMatrix.scale(cmd.scaleX, cmd.scaleY);
                        tempMatrix.translate(cmd.pivotX, cmd.pivotY);
                        this._switchMatrix(tMatrix, tempMatrix);
                        break;
                    case RotateCmd.ID:
                        tempMatrix.identity();
                        tempMatrix.translate(-cmd.pivotX, -cmd.pivotY);
                        tempMatrix.rotate(cmd.angle);
                        tempMatrix.translate(cmd.pivotX, cmd.pivotY);
                        this._switchMatrix(tMatrix, tempMatrix);
                        break;
                    case TranslateCmd.ID:
                        tempMatrix.identity();
                        tempMatrix.translate(cmd.tx, cmd.ty);
                        this._switchMatrix(tMatrix, tempMatrix);
                        break;
                    case TransformCmd.ID:
                        tempMatrix.identity();
                        tempMatrix.translate(-cmd.pivotX, -cmd.pivotY);
                        tempMatrix.concat(cmd.matrix);
                        tempMatrix.translate(cmd.pivotX, cmd.pivotY);
                        this._switchMatrix(tMatrix, tempMatrix);
                        break;
                    case DrawImageCmd.ID:
                    case FillTextureCmd.ID:
                        GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), tMatrix);
                        break;
                    case DrawTextureCmd.ID:
                        tMatrix.copyTo(tempMatrix);
                        if (cmd.matrix)
                            tempMatrix.concat(cmd.matrix);
                        GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), tempMatrix);
                        break;
                    case DrawImageCmd.ID:
                        tex = cmd.texture;
                        if (realSize) {
                            if (cmd.width && cmd.height) {
                                GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), tMatrix);
                            }
                            else {
                                GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, tex.width, tex.height), tMatrix);
                            }
                        }
                        else {
                            var wRate = (cmd.width || tex.sourceWidth) / tex.width;
                            var hRate = (cmd.height || tex.sourceHeight) / tex.height;
                            var oWidth = wRate * tex.sourceWidth;
                            var oHeight = hRate * tex.sourceHeight;
                            var offX = tex.offsetX > 0 ? tex.offsetX : 0;
                            var offY = tex.offsetY > 0 ? tex.offsetY : 0;
                            offX *= wRate;
                            offY *= hRate;
                            GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x - offX, cmd.y - offY, oWidth, oHeight), tMatrix);
                        }
                        break;
                    case FillTextureCmd.ID:
                        if (cmd.width && cmd.height) {
                            GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), tMatrix);
                        }
                        else {
                            tex = cmd.texture;
                            GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, tex.width, tex.height), tMatrix);
                        }
                        break;
                    case DrawTextureCmd.ID:
                        var drawMatrix;
                        if (cmd.matrix) {
                            tMatrix.copyTo(tempMatrix);
                            tempMatrix.concat(cmd.matrix);
                            drawMatrix = tempMatrix;
                        }
                        else {
                            drawMatrix = tMatrix;
                        }
                        if (realSize) {
                            if (cmd.width && cmd.height) {
                                GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), drawMatrix);
                            }
                            else {
                                tex = cmd.texture;
                                GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, tex.width, tex.height), drawMatrix);
                            }
                        }
                        else {
                            tex = cmd.texture;
                            wRate = (cmd.width || tex.sourceWidth) / tex.width;
                            hRate = (cmd.height || tex.sourceHeight) / tex.height;
                            oWidth = wRate * tex.sourceWidth;
                            oHeight = hRate * tex.sourceHeight;
                            offX = tex.offsetX > 0 ? tex.offsetX : 0;
                            offY = tex.offsetY > 0 ? tex.offsetY : 0;
                            offX *= wRate;
                            offY *= hRate;
                            GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x - offX, cmd.y - offY, oWidth, oHeight), drawMatrix);
                        }
                        break;
                    case DrawRectCmd.ID:
                        GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), tMatrix);
                        break;
                    case DrawCircleCmd.ID:
                        GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x - cmd.radius, cmd.y - cmd.radius, cmd.radius + cmd.radius, cmd.radius + cmd.radius), tMatrix);
                        break;
                    case DrawLineCmd.ID:
                        GraphicsBounds._tempPoints.length = 0;
                        var lineWidth;
                        lineWidth = cmd.lineWidth * 0.5;
                        if (cmd.fromX == cmd.toX) {
                            GraphicsBounds._tempPoints.push(cmd.fromX + lineWidth, cmd.fromY, cmd.toX + lineWidth, cmd.toY, cmd.fromX - lineWidth, cmd.fromY, cmd.toX - lineWidth, cmd.toY);
                        }
                        else if (cmd.fromY == cmd.toY) {
                            GraphicsBounds._tempPoints.push(cmd.fromX, cmd.fromY + lineWidth, cmd.toX, cmd.toY + lineWidth, cmd.fromX, cmd.fromY - lineWidth, cmd.toX, cmd.toY - lineWidth);
                        }
                        else {
                            GraphicsBounds._tempPoints.push(cmd.fromX, cmd.fromY, cmd.toX, cmd.toY);
                        }
                        GraphicsBounds._addPointArrToRst(rst, GraphicsBounds._tempPoints, tMatrix);
                        break;
                    case DrawCurvesCmd.ID:
                        GraphicsBounds._addPointArrToRst(rst, Bezier.I.getBezierPoints(cmd.points), tMatrix, cmd.x, cmd.y);
                        break;
                    case DrawLinesCmd.ID:
                    case DrawPolyCmd.ID:
                        GraphicsBounds._addPointArrToRst(rst, cmd.points, tMatrix, cmd.x, cmd.y);
                        break;
                    case DrawPathCmd.ID:
                        GraphicsBounds._addPointArrToRst(rst, this._getPathPoints(cmd.paths), tMatrix, cmd.x, cmd.y);
                        break;
                    case DrawPieCmd.ID:
                        GraphicsBounds._addPointArrToRst(rst, this._getPiePoints(cmd.x, cmd.y, cmd.radius, cmd.startAngle, cmd.endAngle), tMatrix);
                        break;
                    case DrawTrianglesCmd.ID:
                        GraphicsBounds._addPointArrToRst(rst, this._getTriAngBBXPoints(cmd.vertices), tMatrix);
                        break;
                    case Draw9GridTexture.ID:
                        GraphicsBounds._addPointArrToRst(rst, this._getDraw9GridBBXPoints(cmd), tMatrix);
                        break;
                }
            }
            if (rst.length > 200) {
                rst = Utils.copyArray(rst, Rectangle._getWrapRec(rst)._getBoundPoints());
            }
            else if (rst.length > 8)
                rst = GrahamScan.scanPList(rst);
            return rst;
        }
        _switchMatrix(tMatix, tempMatrix) {
            tempMatrix.concat(tMatix);
            tempMatrix.copyTo(tMatix);
        }
        static _addPointArrToRst(rst, points, matrix, dx = 0, dy = 0) {
            var i, len;
            len = points.length;
            for (i = 0; i < len; i += 2) {
                GraphicsBounds._addPointToRst(rst, points[i] + dx, points[i + 1] + dy, matrix);
            }
        }
        static _addPointToRst(rst, x, y, matrix) {
            var _tempPoint = Point.TEMP;
            _tempPoint.setTo(x ? x : 0, y ? y : 0);
            matrix.transformPoint(_tempPoint);
            rst.push(_tempPoint.x, _tempPoint.y);
        }
        _getPiePoints(x, y, radius, startAngle, endAngle) {
            var rst = GraphicsBounds._tempPoints;
            GraphicsBounds._tempPoints.length = 0;
            var k = Math.PI / 180;
            var d1 = endAngle - startAngle;
            if (d1 >= 360 || d1 <= -360) {
                rst.push(x - radius, y - radius);
                rst.push(x + radius, y - radius);
                rst.push(x + radius, y + radius);
                rst.push(x - radius, y + radius);
                return rst;
            }
            rst.push(x, y);
            var delta = d1 % 360;
            if (delta < 0)
                delta += 360;
            var end1 = startAngle + delta;
            var st = startAngle * k;
            var ed = end1 * k;
            rst.push(x + radius * Math.cos(st), y + radius * Math.sin(st));
            rst.push(x + radius * Math.cos(ed), y + radius * Math.sin(ed));
            var s1 = Math.ceil(startAngle / 90) * 90;
            var s2 = Math.floor(end1 / 90) * 90;
            for (var cs = s1; cs <= s2; cs += 90) {
                var csr = cs * k;
                rst.push(x + radius * Math.cos(csr), y + radius * Math.sin(csr));
            }
            return rst;
        }
        _getTriAngBBXPoints(vert) {
            var vnum = vert.length;
            if (vnum < 2)
                return [];
            var minx = vert[0];
            var miny = vert[1];
            var maxx = minx;
            var maxy = miny;
            for (var i = 2; i < vnum;) {
                var cx = vert[i++];
                var cy = vert[i++];
                if (minx > cx)
                    minx = cx;
                if (miny > cy)
                    miny = cy;
                if (maxx < cx)
                    maxx = cx;
                if (maxy < cy)
                    maxy = cy;
            }
            return [minx, miny, maxx, miny, maxx, maxy, minx, maxy];
        }
        _getDraw9GridBBXPoints(cmd) {
            var minx = 0;
            var miny = 0;
            var maxx = cmd.width;
            var maxy = cmd.height;
            return [minx, miny, maxx, miny, maxx, maxy, minx, maxy];
        }
        _getPathPoints(paths) {
            var i, len;
            var rst = GraphicsBounds._tempPoints;
            rst.length = 0;
            len = paths.length;
            var tCMD;
            for (i = 0; i < len; i++) {
                tCMD = paths[i];
                if (tCMD.length > 1) {
                    rst.push(tCMD[1], tCMD[2]);
                    if (tCMD.length > 3) {
                        rst.push(tCMD[3], tCMD[4]);
                    }
                }
            }
            return rst;
        }
    }
    GraphicsBounds._tempMatrix = new Matrix();
    GraphicsBounds._initMatrix = new Matrix();
    GraphicsBounds._tempPoints = [];
    GraphicsBounds._tempMatrixArrays = [];
    GraphicsBounds._tempCmds = [];

    class SpriteConst {
    }
    SpriteConst.ALPHA = 0x01;
    SpriteConst.TRANSFORM = 0x02;
    SpriteConst.BLEND = 0x04;
    SpriteConst.CANVAS = 0x08;
    SpriteConst.FILTERS = 0x10;
    SpriteConst.MASK = 0x20;
    SpriteConst.CLIP = 0x40;
    SpriteConst.STYLE = 0x80;
    SpriteConst.TEXTURE = 0x100;
    SpriteConst.GRAPHICS = 0x200;
    SpriteConst.LAYAGL3D = 0x400;
    SpriteConst.CUSTOM = 0x800;
    SpriteConst.ONECHILD = 0x1000;
    SpriteConst.CHILDS = 0x2000;
    SpriteConst.REPAINT_NONE = 0;
    SpriteConst.REPAINT_NODE = 0x01;
    SpriteConst.REPAINT_CACHE = 0x02;
    SpriteConst.REPAINT_ALL = 0x03;

    class ClipRectCmd {
        static create(x, y, width, height) {
            var cmd = Pool.getItemByClass("ClipRectCmd", ClipRectCmd);
            cmd.x = x;
            cmd.y = y;
            cmd.width = width;
            cmd.height = height;
            return cmd;
        }
        recover() {
            Pool.recover("ClipRectCmd", this);
        }
        run(context, gx, gy) {
            context.clipRect(this.x + gx, this.y + gy, this.width, this.height);
        }
        get cmdID() {
            return ClipRectCmd.ID;
        }
    }
    ClipRectCmd.ID = "ClipRect";

    class DrawTexturesCmd {
        static create(texture, pos) {
            var cmd = Pool.getItemByClass("DrawTexturesCmd", DrawTexturesCmd);
            cmd.texture = texture;
            texture._addReference();
            cmd.pos = pos;
            return cmd;
        }
        recover() {
            this.texture._removeReference();
            this.texture = null;
            this.pos = null;
            Pool.recover("DrawTexturesCmd", this);
        }
        run(context, gx, gy) {
            context.drawTextures(this.texture, this.pos, gx, gy);
        }
        get cmdID() {
            return DrawTexturesCmd.ID;
        }
    }
    DrawTexturesCmd.ID = "DrawTextures";

    class FillBorderTextCmd {
        static create(text, x, y, font, fillColor, borderColor, lineWidth, textAlign) {
            var cmd = Pool.getItemByClass("FillBorderTextCmd", FillBorderTextCmd);
            cmd.text = text;
            cmd.x = x;
            cmd.y = y;
            cmd.font = font;
            cmd.fillColor = fillColor;
            cmd.borderColor = borderColor;
            cmd.lineWidth = lineWidth;
            cmd.textAlign = textAlign;
            return cmd;
        }
        recover() {
            Pool.recover("FillBorderTextCmd", this);
        }
        run(context, gx, gy) {
            context.fillBorderText(this.text, this.x + gx, this.y + gy, this.font, this.fillColor, this.borderColor, this.lineWidth, this.textAlign);
        }
        get cmdID() {
            return FillBorderTextCmd.ID;
        }
    }
    FillBorderTextCmd.ID = "FillBorderText";

    class FillBorderWordsCmd {
        static create(words, x, y, font, fillColor, borderColor, lineWidth) {
            var cmd = Pool.getItemByClass("FillBorderWordsCmd", FillBorderWordsCmd);
            cmd.words = words;
            cmd.x = x;
            cmd.y = y;
            cmd.font = font;
            cmd.fillColor = fillColor;
            cmd.borderColor = borderColor;
            cmd.lineWidth = lineWidth;
            return cmd;
        }
        recover() {
            this.words = null;
            Pool.recover("FillBorderWordsCmd", this);
        }
        run(context, gx, gy) {
            context.fillBorderWords(this.words, this.x + gx, this.y + gy, this.font, this.fillColor, this.borderColor, this.lineWidth);
        }
        get cmdID() {
            return FillBorderWordsCmd.ID;
        }
    }
    FillBorderWordsCmd.ID = "FillBorderWords";

    class FillTextCmd {
        constructor() {
            this._textIsWorldText = false;
            this._fontColor = 0xffffffff;
            this._strokeColor = 0;
            this._fontObj = FillTextCmd._defFontObj;
            this._nTexAlign = 0;
        }
        static create(text, x, y, font, color, textAlign) {
            var cmd = Pool.getItemByClass("FillTextCmd", FillTextCmd);
            cmd.text = text;
            cmd._textIsWorldText = text instanceof WordText;
            cmd.x = x;
            cmd.y = y;
            cmd.font = font;
            cmd.color = color;
            cmd.textAlign = textAlign;
            return cmd;
        }
        recover() {
            Pool.recover("FillTextCmd", this);
        }
        run(context, gx, gy) {
            if (ILaya.stage.isGlobalRepaint()) {
                this._textIsWorldText && this._text.cleanCache();
            }
            if (this._textIsWorldText) {
                context._fast_filltext(this._text, this.x + gx, this.y + gy, this._fontObj, this._color, null, 0, this._nTexAlign, 0);
            }
            else {
                context.drawText(this._text, this.x + gx, this.y + gy, this._font, this._color, this._textAlign);
            }
        }
        get cmdID() {
            return FillTextCmd.ID;
        }
        get text() {
            return this._text;
        }
        set text(value) {
            this._text = value;
            this._textIsWorldText = value instanceof WordText;
            this._textIsWorldText && this._text.cleanCache();
        }
        get font() {
            return this._font;
        }
        set font(value) {
            this._font = value;
            this._fontObj = FontInfo.Parse(value);
            this._textIsWorldText && this._text.cleanCache();
        }
        get color() {
            return this._color;
        }
        set color(value) {
            this._color = value;
            this._fontColor = ColorUtils.create(value).numColor;
            this._textIsWorldText && this._text.cleanCache();
        }
        get textAlign() {
            return this._textAlign;
        }
        set textAlign(value) {
            this._textAlign = value;
            switch (value) {
                case 'center':
                    this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                    break;
                case 'right':
                    this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                    break;
                default:
                    this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_DEFAULT;
            }
            this._textIsWorldText && this._text.cleanCache();
        }
    }
    FillTextCmd.ID = "FillText";
    FillTextCmd._defFontObj = new FontInfo(null);

    class FillWordsCmd {
        static create(words, x, y, font, color) {
            var cmd = Pool.getItemByClass("FillWordsCmd", FillWordsCmd);
            cmd.words = words;
            cmd.x = x;
            cmd.y = y;
            cmd.font = font;
            cmd.color = color;
            return cmd;
        }
        recover() {
            this.words = null;
            Pool.recover("FillWordsCmd", this);
        }
        run(context, gx, gy) {
            context.fillWords(this.words, this.x + gx, this.y + gy, this.font, this.color);
        }
        get cmdID() {
            return FillWordsCmd.ID;
        }
    }
    FillWordsCmd.ID = "FillWords";

    class SaveCmd {
        static create() {
            var cmd = Pool.getItemByClass("SaveCmd", SaveCmd);
            return cmd;
        }
        recover() {
            Pool.recover("SaveCmd", this);
        }
        run(context, gx, gy) {
            context.save();
        }
        get cmdID() {
            return SaveCmd.ID;
        }
    }
    SaveCmd.ID = "Save";

    class StrokeTextCmd {
        static create(text, x, y, font, color, lineWidth, textAlign) {
            var cmd = Pool.getItemByClass("StrokeTextCmd", StrokeTextCmd);
            cmd.text = text;
            cmd.x = x;
            cmd.y = y;
            cmd.font = font;
            cmd.color = color;
            cmd.lineWidth = lineWidth;
            cmd.textAlign = textAlign;
            return cmd;
        }
        recover() {
            Pool.recover("StrokeTextCmd", this);
        }
        run(context, gx, gy) {
            context.strokeWord(this.text, this.x + gx, this.y + gy, this.font, this.color, this.lineWidth, this.textAlign);
        }
        get cmdID() {
            return StrokeTextCmd.ID;
        }
    }
    StrokeTextCmd.ID = "StrokeText";

    class CacheManger {
        constructor() {
        }
        static regCacheByFunction(disposeFunction, getCacheListFunction) {
            CacheManger.unRegCacheByFunction(disposeFunction, getCacheListFunction);
            var cache;
            cache = { tryDispose: disposeFunction, getCacheList: getCacheListFunction };
            CacheManger._cacheList.push(cache);
        }
        static unRegCacheByFunction(disposeFunction, getCacheListFunction) {
            var i, len;
            len = CacheManger._cacheList.length;
            for (i = 0; i < len; i++) {
                if (CacheManger._cacheList[i].tryDispose == disposeFunction && CacheManger._cacheList[i].getCacheList == getCacheListFunction) {
                    CacheManger._cacheList.splice(i, 1);
                    return;
                }
            }
        }
        static forceDispose() {
            var i, len = CacheManger._cacheList.length;
            for (i = 0; i < len; i++) {
                CacheManger._cacheList[i].tryDispose(true);
            }
        }
        static beginCheck(waitTime = 15000) {
            ILaya.systemTimer.loop(waitTime, null, CacheManger._checkLoop);
        }
        static stopCheck() {
            ILaya.systemTimer.clear(null, CacheManger._checkLoop);
        }
        static _checkLoop() {
            var cacheList = CacheManger._cacheList;
            if (cacheList.length < 1)
                return;
            var tTime = ILaya.Browser.now();
            var count;
            var len;
            len = count = cacheList.length;
            while (count > 0) {
                CacheManger._index++;
                CacheManger._index = CacheManger._index % len;
                cacheList[CacheManger._index].tryDispose(false);
                if (ILaya.Browser.now() - tTime > CacheManger.loopTimeLimit)
                    break;
                count--;
            }
        }
    }
    CacheManger.loopTimeLimit = 2;
    CacheManger._cacheList = [];
    CacheManger._index = 0;

    class VectorGraphManager {
        constructor() {
            this.useDic = {};
            this.shapeDic = {};
            this.shapeLineDic = {};
            this._id = 0;
            this._checkKey = false;
            this._freeIdArray = [];
            CacheManger.regCacheByFunction(this.startDispose.bind(this), this.getCacheList.bind(this));
        }
        static getInstance() {
            return VectorGraphManager.instance = VectorGraphManager.instance || new VectorGraphManager();
        }
        getId() {
            return this._id++;
        }
        addShape(id, shape) {
            this.shapeDic[id] = shape;
            if (!this.useDic[id]) {
                this.useDic[id] = true;
            }
        }
        addLine(id, Line) {
            this.shapeLineDic[id] = Line;
            if (!this.shapeLineDic[id]) {
                this.shapeLineDic[id] = true;
            }
        }
        getShape(id) {
            if (this._checkKey) {
                if (this.useDic[id] != null) {
                    this.useDic[id] = true;
                }
            }
        }
        deleteShape(id) {
            if (this.shapeDic[id]) {
                this.shapeDic[id] = null;
                delete this.shapeDic[id];
            }
            if (this.shapeLineDic[id]) {
                this.shapeLineDic[id] = null;
                delete this.shapeLineDic[id];
            }
            if (this.useDic[id] != null) {
                delete this.useDic[id];
            }
        }
        getCacheList() {
            var str;
            var list = [];
            for (str in this.shapeDic) {
                list.push(this.shapeDic[str]);
            }
            for (str in this.shapeLineDic) {
                list.push(this.shapeLineDic[str]);
            }
            return list;
        }
        startDispose(key) {
            var str;
            for (str in this.useDic) {
                this.useDic[str] = false;
            }
            this._checkKey = true;
        }
        endDispose() {
            if (this._checkKey) {
                var str;
                for (str in this.useDic) {
                    if (!this.useDic[str]) {
                        this.deleteShape(str);
                    }
                }
                this._checkKey = false;
            }
        }
    }

    class Graphics {
        constructor() {
            this._sp = null;
            this._one = null;
            this._render = this._renderEmpty;
            this._cmds = null;
            this._vectorgraphArray = null;
            this._graphicBounds = null;
            this.autoDestroy = false;
            this._createData();
        }
        _createData() {
        }
        _clearData() {
        }
        _destroyData() {
        }
        destroy() {
            this.clear(true);
            if (this._graphicBounds)
                this._graphicBounds.destroy();
            this._graphicBounds = null;
            this._vectorgraphArray = null;
            if (this._sp) {
                this._sp._renderType = 0;
                this._sp._setRenderType(0);
                this._sp = null;
            }
            this._destroyData();
        }
        clear(recoverCmds = true) {
            if (recoverCmds) {
                var tCmd = this._one;
                if (this._cmds) {
                    var i, len = this._cmds.length;
                    for (i = 0; i < len; i++) {
                        tCmd = this._cmds[i];
                        tCmd.recover();
                    }
                    this._cmds.length = 0;
                }
                else if (tCmd) {
                    tCmd.recover();
                }
            }
            else {
                this._cmds = null;
            }
            this._one = null;
            this._render = this._renderEmpty;
            this._clearData();
            if (this._sp) {
                this._sp._renderType &= ~SpriteConst.GRAPHICS;
                this._sp._setRenderType(this._sp._renderType);
            }
            this._repaint();
            if (this._vectorgraphArray) {
                for (i = 0, len = this._vectorgraphArray.length; i < len; i++) {
                    VectorGraphManager.getInstance().deleteShape(this._vectorgraphArray[i]);
                }
                this._vectorgraphArray.length = 0;
            }
        }
        _clearBoundsCache() {
            if (this._graphicBounds)
                this._graphicBounds.reset();
        }
        _initGraphicBounds() {
            if (!this._graphicBounds) {
                this._graphicBounds = GraphicsBounds.create();
                this._graphicBounds._graphics = this;
            }
        }
        _repaint() {
            this._clearBoundsCache();
            this._sp && this._sp.repaint();
        }
        _isOnlyOne() {
            return !this._cmds || this._cmds.length === 0;
        }
        get cmds() {
            return this._cmds;
        }
        set cmds(value) {
            if (this._sp) {
                this._sp._renderType |= SpriteConst.GRAPHICS;
                this._sp._setRenderType(this._sp._renderType);
            }
            this._cmds = value;
            this._render = this._renderAll;
            this._repaint();
        }
        getBounds(realSize = false) {
            this._initGraphicBounds();
            return this._graphicBounds.getBounds(realSize);
        }
        getBoundPoints(realSize = false) {
            this._initGraphicBounds();
            return this._graphicBounds.getBoundPoints(realSize);
        }
        drawImage(texture, x = 0, y = 0, width = 0, height = 0) {
            if (!texture)
                return null;
            if (!width)
                width = texture.sourceWidth;
            if (!height)
                height = texture.sourceHeight;
            if (texture.getIsReady()) {
                var wRate = width / texture.sourceWidth;
                var hRate = height / texture.sourceHeight;
                width = texture.width * wRate;
                height = texture.height * hRate;
                if (width <= 0 || height <= 0)
                    return null;
                x += texture.offsetX * wRate;
                y += texture.offsetY * hRate;
            }
            if (this._sp) {
                this._sp._renderType |= SpriteConst.GRAPHICS;
                this._sp._setRenderType(this._sp._renderType);
            }
            var args = DrawImageCmd.create.call(this, texture, x, y, width, height);
            if (this._one == null) {
                this._one = args;
                this._render = this._renderOneImg;
            }
            else {
                this._saveToCmd(null, args);
            }
            this._repaint();
            return args;
        }
        drawTexture(texture, x = 0, y = 0, width = 0, height = 0, matrix = null, alpha = 1, color = null, blendMode = null, uv) {
            if (!texture || alpha < 0.01)
                return null;
            if (!texture.getIsReady())
                return null;
            if (!width)
                width = texture.sourceWidth;
            if (!height)
                height = texture.sourceHeight;
            if (texture.getIsReady()) {
                var wRate = width / texture.sourceWidth;
                var hRate = height / texture.sourceHeight;
                width = texture.width * wRate;
                height = texture.height * hRate;
                if (width <= 0 || height <= 0)
                    return null;
                x += texture.offsetX * wRate;
                y += texture.offsetY * hRate;
            }
            if (this._sp) {
                this._sp._renderType |= SpriteConst.GRAPHICS;
                this._sp._setRenderType(this._sp._renderType);
            }
            var args = DrawTextureCmd.create.call(this, texture, x, y, width, height, matrix, alpha, color, blendMode, uv);
            this._repaint();
            return this._saveToCmd(null, args);
        }
        drawTextures(texture, pos) {
            if (!texture)
                return null;
            return this._saveToCmd(Render._context.drawTextures, DrawTexturesCmd.create.call(this, texture, pos));
        }
        drawTriangles(texture, x, y, vertices, uvs, indices, matrix = null, alpha = 1, color = null, blendMode = null) {
            return this._saveToCmd(Render._context.drawTriangles, DrawTrianglesCmd.create.call(this, texture, x, y, vertices, uvs, indices, matrix, alpha, color, blendMode));
        }
        fillTexture(texture, x, y, width = 0, height = 0, type = "repeat", offset = null) {
            if (texture && texture.getIsReady())
                return this._saveToCmd(Render._context._fillTexture, FillTextureCmd.create.call(this, texture, x, y, width, height, type, offset || Point.EMPTY, {}));
            else
                return null;
        }
        _saveToCmd(fun, args) {
            if (this._sp) {
                this._sp._renderType |= SpriteConst.GRAPHICS;
                this._sp._setRenderType(this._sp._renderType);
            }
            if (this._one == null) {
                this._one = args;
                this._render = this._renderOne;
            }
            else {
                this._render = this._renderAll;
                (this._cmds || (this._cmds = [])).length === 0 && this._cmds.push(this._one);
                this._cmds.push(args);
            }
            this._repaint();
            return args;
        }
        clipRect(x, y, width, height) {
            return this._saveToCmd(Render._context.clipRect, ClipRectCmd.create.call(this, x, y, width, height));
        }
        fillText(text, x, y, font, color, textAlign) {
            return this._saveToCmd(Render._context.fillText, FillTextCmd.create.call(this, text, x, y, font || ILaya.Text.defaultFontStr(), color, textAlign));
        }
        fillBorderText(text, x, y, font, fillColor, borderColor, lineWidth, textAlign) {
            return this._saveToCmd(Render._context.fillBorderText, FillBorderTextCmd.create.call(this, text, x, y, font || ILaya.Text.defaultFontStr(), fillColor, borderColor, lineWidth, textAlign));
        }
        fillWords(words, x, y, font, color) {
            return this._saveToCmd(Render._context.fillWords, FillWordsCmd.create.call(this, words, x, y, font || ILaya.Text.defaultFontStr(), color));
        }
        fillBorderWords(words, x, y, font, fillColor, borderColor, lineWidth) {
            return this._saveToCmd(Render._context.fillBorderWords, FillBorderWordsCmd.create.call(this, words, x, y, font || ILaya.Text.defaultFontStr(), fillColor, borderColor, lineWidth));
        }
        strokeText(text, x, y, font, color, lineWidth, textAlign) {
            return this._saveToCmd(Render._context.fillBorderText, StrokeTextCmd.create.call(this, text, x, y, font || ILaya.Text.defaultFontStr(), color, lineWidth, textAlign));
        }
        alpha(alpha) {
            return this._saveToCmd(Render._context.alpha, AlphaCmd.create.call(this, alpha));
        }
        transform(matrix, pivotX = 0, pivotY = 0) {
            return this._saveToCmd(Render._context._transform, TransformCmd.create.call(this, matrix, pivotX, pivotY));
        }
        rotate(angle, pivotX = 0, pivotY = 0) {
            return this._saveToCmd(Render._context._rotate, RotateCmd.create.call(this, angle, pivotX, pivotY));
        }
        scale(scaleX, scaleY, pivotX = 0, pivotY = 0) {
            return this._saveToCmd(Render._context._scale, ScaleCmd.create.call(this, scaleX, scaleY, pivotX, pivotY));
        }
        translate(tx, ty) {
            return this._saveToCmd(Render._context.translate, TranslateCmd.create.call(this, tx, ty));
        }
        save() {
            return this._saveToCmd(Render._context._save, SaveCmd.create.call(this));
        }
        restore() {
            return this._saveToCmd(Render._context.restore, RestoreCmd.create.call(this));
        }
        replaceText(text) {
            this._repaint();
            var cmds = this._cmds;
            if (!cmds) {
                if (this._one && this._isTextCmd(this._one)) {
                    this._one.text = text;
                    return true;
                }
            }
            else {
                for (var i = cmds.length - 1; i > -1; i--) {
                    if (this._isTextCmd(cmds[i])) {
                        cmds[i].text = text;
                        return true;
                    }
                }
            }
            return false;
        }
        _isTextCmd(cmd) {
            var cmdID = cmd.cmdID;
            return cmdID == FillTextCmd.ID || cmdID == StrokeTextCmd.ID || cmdID == FillBorderTextCmd.ID;
        }
        replaceTextColor(color) {
            this._repaint();
            var cmds = this._cmds;
            if (!cmds) {
                if (this._one && this._isTextCmd(this._one)) {
                    this._setTextCmdColor(this._one, color);
                }
            }
            else {
                for (var i = cmds.length - 1; i > -1; i--) {
                    if (this._isTextCmd(cmds[i])) {
                        this._setTextCmdColor(cmds[i], color);
                    }
                }
            }
        }
        _setTextCmdColor(cmdO, color) {
            var cmdID = cmdO.cmdID;
            switch (cmdID) {
                case FillTextCmd.ID:
                case StrokeTextCmd.ID:
                    cmdO.color = color;
                    break;
                case FillBorderTextCmd.ID:
                case FillBorderWordsCmd.ID:
                case FillBorderTextCmd.ID:
                    cmdO.fillColor = color;
                    break;
            }
        }
        loadImage(url, x = 0, y = 0, width = 0, height = 0, complete = null) {
            var tex = ILaya.Loader.getRes(url);
            if (!tex) {
                tex = new Texture();
                tex.load(url);
                ILaya.Loader.cacheRes(url, tex);
                tex.once(Event.READY, this, this.drawImage, [tex, x, y, width, height]);
            }
            else {
                if (!tex.getIsReady()) {
                    tex.once(Event.READY, this, this.drawImage, [tex, x, y, width, height]);
                }
                else
                    this.drawImage(tex, x, y, width, height);
            }
            if (complete != null) {
                tex.getIsReady() ? complete.call(this._sp) : tex.on(Event.READY, this._sp, complete);
            }
        }
        _renderEmpty(sprite, context, x, y) {
        }
        _renderAll(sprite, context, x, y) {
            var cmds = this._cmds;
            for (var i = 0, n = cmds.length; i < n; i++) {
                cmds[i].run(context, x, y);
            }
        }
        _renderOne(sprite, context, x, y) {
            context.sprite = sprite;
            this._one.run(context, x, y);
        }
        _renderOneImg(sprite, context, x, y) {
            context.sprite = sprite;
            this._one.run(context, x, y);
        }
        drawLine(fromX, fromY, toX, toY, lineColor, lineWidth = 1) {
            var offset = (lineWidth < 1 || lineWidth % 2 === 0) ? 0 : 0.5;
            return this._saveToCmd(Render._context._drawLine, DrawLineCmd.create.call(this, fromX + offset, fromY + offset, toX + offset, toY + offset, lineColor, lineWidth, 0));
        }
        drawLines(x, y, points, lineColor, lineWidth = 1) {
            if (!points || points.length < 4)
                return null;
            var offset = (lineWidth < 1 || lineWidth % 2 === 0) ? 0 : 0.5;
            return this._saveToCmd(Render._context._drawLines, DrawLinesCmd.create.call(this, x + offset, y + offset, points, lineColor, lineWidth, 0));
        }
        drawCurves(x, y, points, lineColor, lineWidth = 1) {
            return this._saveToCmd(Render._context.drawCurves, DrawCurvesCmd.create.call(this, x, y, points, lineColor, lineWidth));
        }
        drawRect(x, y, width, height, fillColor, lineColor = null, lineWidth = 1) {
            var offset = (lineWidth >= 1 && lineColor) ? lineWidth / 2 : 0;
            var lineOffset = lineColor ? lineWidth : 0;
            return this._saveToCmd(Render._context.drawRect, DrawRectCmd.create.call(this, x + offset, y + offset, width - lineOffset, height - lineOffset, fillColor, lineColor, lineWidth));
        }
        drawCircle(x, y, radius, fillColor, lineColor = null, lineWidth = 1) {
            var offset = (lineWidth >= 1 && lineColor) ? lineWidth / 2 : 0;
            return this._saveToCmd(Render._context._drawCircle, DrawCircleCmd.create.call(this, x, y, radius - offset, fillColor, lineColor, lineWidth, 0));
        }
        drawPie(x, y, radius, startAngle, endAngle, fillColor, lineColor = null, lineWidth = 1) {
            var offset = (lineWidth >= 1 && lineColor) ? lineWidth / 2 : 0;
            var lineOffset = lineColor ? lineWidth : 0;
            return this._saveToCmd(Render._context._drawPie, DrawPieCmd.create.call(this, x + offset, y + offset, radius - lineOffset, Utils.toRadian(startAngle), Utils.toRadian(endAngle), fillColor, lineColor, lineWidth, 0));
        }
        drawPoly(x, y, points, fillColor, lineColor = null, lineWidth = 1) {
            var tIsConvexPolygon = false;
            if (points.length > 6) {
                tIsConvexPolygon = false;
            }
            else {
                tIsConvexPolygon = true;
            }
            var offset = (lineWidth >= 1 && lineColor) ? (lineWidth % 2 === 0 ? 0 : 0.5) : 0;
            return this._saveToCmd(Render._context._drawPoly, DrawPolyCmd.create.call(this, x + offset, y + offset, points, fillColor, lineColor, lineWidth, tIsConvexPolygon, 0));
        }
        drawPath(x, y, paths, brush = null, pen = null) {
            return this._saveToCmd(Render._context._drawPath, DrawPathCmd.create.call(this, x, y, paths, brush, pen));
        }
        draw9Grid(texture, x = 0, y = 0, width = 0, height = 0, sizeGrid = null) {
            this._saveToCmd(null, Draw9GridTexture.create(texture, x, y, width, height, sizeGrid));
        }
    }

    class Const {
    }
    Const.NOT_ACTIVE = 0x01;
    Const.ACTIVE_INHIERARCHY = 0x02;
    Const.AWAKED = 0x04;
    Const.NOT_READY = 0x08;
    Const.DISPLAY = 0x10;
    Const.HAS_ZORDER = 0x20;
    Const.HAS_MOUSE = 0x40;
    Const.DISPLAYED_INSTAGE = 0x80;
    Const.DRAWCALL_OPTIMIZE = 0x100;

    class HitArea {
        contains(x, y) {
            if (!HitArea._isHitGraphic(x, y, this.hit))
                return false;
            return !HitArea._isHitGraphic(x, y, this.unHit);
        }
        static _isHitGraphic(x, y, graphic) {
            if (!graphic)
                return false;
            var cmds = graphic.cmds;
            if (!cmds && graphic._one) {
                cmds = HitArea._cmds;
                cmds.length = 1;
                cmds[0] = graphic._one;
            }
            if (!cmds)
                return false;
            var i, len;
            len = cmds.length;
            var cmd;
            for (i = 0; i < len; i++) {
                cmd = cmds[i];
                if (!cmd)
                    continue;
                switch (cmd.cmdID) {
                    case "Translate":
                        x -= cmd.tx;
                        y -= cmd.ty;
                }
                if (HitArea._isHitCmd(x, y, cmd))
                    return true;
            }
            return false;
        }
        static _isHitCmd(x, y, cmd) {
            if (!cmd)
                return false;
            var rst = false;
            switch (cmd.cmdID) {
                case "DrawRect":
                    HitArea._rect.setTo(cmd.x, cmd.y, cmd.width, cmd.height);
                    rst = HitArea._rect.contains(x, y);
                    break;
                case "DrawCircle":
                    var d;
                    x -= cmd.x;
                    y -= cmd.y;
                    d = x * x + y * y;
                    rst = d < cmd.radius * cmd.radius;
                    break;
                case "DrawPoly":
                    x -= cmd.x;
                    y -= cmd.y;
                    rst = HitArea._ptInPolygon(x, y, cmd.points);
                    break;
            }
            return rst;
        }
        static _ptInPolygon(x, y, areaPoints) {
            var p = HitArea._ptPoint;
            p.setTo(x, y);
            var nCross = 0;
            var p1x, p1y, p2x, p2y;
            var len;
            len = areaPoints.length;
            for (var i = 0; i < len; i += 2) {
                p1x = areaPoints[i];
                p1y = areaPoints[i + 1];
                p2x = areaPoints[(i + 2) % len];
                p2y = areaPoints[(i + 3) % len];
                if (p1y == p2y)
                    continue;
                if (p.y < Math.min(p1y, p2y))
                    continue;
                if (p.y >= Math.max(p1y, p2y))
                    continue;
                var tx = (p.y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x;
                if (tx > p.x)
                    nCross++;
            }
            return (nCross % 2 == 1);
        }
        get hit() {
            if (!this._hit)
                this._hit = new ILaya.Graphics();
            return this._hit;
        }
        set hit(value) {
            this._hit = value;
        }
        get unHit() {
            if (!this._unHit)
                this._unHit = new ILaya.Graphics();
            return this._unHit;
        }
        set unHit(value) {
            this._unHit = value;
        }
    }
    HitArea._cmds = [];
    HitArea._rect = new Rectangle();
    HitArea._ptPoint = new Point();

    class ClassUtils {
        static regClass(className, classDef) {
            ClassUtils._classMap[className] = classDef;
        }
        static regShortClassName(classes) {
            for (var i = 0; i < classes.length; i++) {
                var classDef = classes[i];
                var className = classDef.name;
                ClassUtils._classMap[className] = classDef;
            }
        }
        static getRegClass(className) {
            return ClassUtils._classMap[className];
        }
        static getClass(className) {
            var classObject = ClassUtils._classMap[className] || ClassUtils._classMap['Laya.' + className] || className;
            var glaya = ILaya.Laya;
            if (typeof (classObject) == 'string')
                return (ILaya.__classMap[classObject] || glaya[className]);
            return classObject;
        }
        static getInstance(className) {
            var compClass = ClassUtils.getClass(className);
            if (compClass)
                return new compClass();
            else
                console.warn("[error] Undefined class:", className);
            return null;
        }
        static createByJson(json, node = null, root = null, customHandler = null, instanceHandler = null) {
            if (typeof (json) == 'string')
                json = JSON.parse(json);
            var props = json.props;
            if (!node) {
                node = instanceHandler ? instanceHandler.runWith(json) : ClassUtils.getInstance(props.runtime || json.type);
                if (!node)
                    return null;
            }
            var child = json.child;
            if (child) {
                for (var i = 0, n = child.length; i < n; i++) {
                    var data = child[i];
                    if ((data.props.name === "render" || data.props.renderType === "render") && node["_$set_itemRender"])
                        node.itemRender = data;
                    else {
                        if (data.type == "Graphic") {
                            ClassUtils._addGraphicsToSprite(data, node);
                        }
                        else if (ClassUtils._isDrawType(data.type)) {
                            ClassUtils._addGraphicToSprite(data, node, true);
                        }
                        else {
                            var tChild = ClassUtils.createByJson(data, null, root, customHandler, instanceHandler);
                            if (data.type === "Script") {
                                if ("owner" in tChild) {
                                    tChild["owner"] = node;
                                }
                                else if ("target" in tChild) {
                                    tChild["target"] = node;
                                }
                            }
                            else if (data.props.renderType == "mask") {
                                node.mask = tChild;
                            }
                            else {
                                node.addChild(tChild);
                            }
                        }
                    }
                }
            }
            if (props) {
                for (var prop in props) {
                    var value = props[prop];
                    if (prop === "var" && root) {
                        root[value] = node;
                    }
                    else if (value instanceof Array && node[prop] instanceof Function) {
                        node[prop].apply(node, value);
                    }
                    else {
                        node[prop] = value;
                    }
                }
            }
            if (customHandler && json.customProps) {
                customHandler.runWith([node, json]);
            }
            if (node["created"])
                node.created();
            return node;
        }
        static _addGraphicsToSprite(graphicO, sprite) {
            var graphics = graphicO.child;
            if (!graphics || graphics.length < 1)
                return;
            var g = ClassUtils._getGraphicsFromSprite(graphicO, sprite);
            var ox = 0;
            var oy = 0;
            if (graphicO.props) {
                ox = ClassUtils._getObjVar(graphicO.props, "x", 0);
                oy = ClassUtils._getObjVar(graphicO.props, "y", 0);
            }
            if (ox != 0 && oy != 0) {
                g.translate(ox, oy);
            }
            var i, len;
            len = graphics.length;
            for (i = 0; i < len; i++) {
                ClassUtils._addGraphicToGraphics(graphics[i], g);
            }
            if (ox != 0 && oy != 0) {
                g.translate(-ox, -oy);
            }
        }
        static _addGraphicToSprite(graphicO, sprite, isChild = false) {
            var g = isChild ? ClassUtils._getGraphicsFromSprite(graphicO, sprite) : sprite.graphics;
            ClassUtils._addGraphicToGraphics(graphicO, g);
        }
        static _getGraphicsFromSprite(dataO, sprite) {
            if (!dataO || !dataO.props)
                return sprite.graphics;
            var propsName = dataO.props.renderType;
            if (propsName === "hit" || propsName === "unHit") {
                var hitArea = sprite._style.hitArea || (sprite.hitArea = new HitArea());
                if (!hitArea[propsName]) {
                    hitArea[propsName] = new Graphics();
                }
                var g = hitArea[propsName];
            }
            if (!g)
                g = sprite.graphics;
            return g;
        }
        static _getTransformData(propsO) {
            var m;
            if ("pivotX" in propsO || "pivotY" in propsO) {
                m = m || new Matrix();
                m.translate(-ClassUtils._getObjVar(propsO, "pivotX", 0), -ClassUtils._getObjVar(propsO, "pivotY", 0));
            }
            var sx = ClassUtils._getObjVar(propsO, "scaleX", 1), sy = ClassUtils._getObjVar(propsO, "scaleY", 1);
            var rotate = ClassUtils._getObjVar(propsO, "rotation", 0);
            var skewX = ClassUtils._getObjVar(propsO, "skewX", 0);
            var skewY = ClassUtils._getObjVar(propsO, "skewY", 0);
            if (sx != 1 || sy != 1 || rotate != 0) {
                m = m || new Matrix();
                m.scale(sx, sy);
                m.rotate(rotate * 0.0174532922222222);
            }
            return m;
        }
        static _addGraphicToGraphics(graphicO, graphic) {
            var propsO;
            propsO = graphicO.props;
            if (!propsO)
                return;
            var drawConfig;
            drawConfig = ClassUtils.DrawTypeDic[graphicO.type];
            if (!drawConfig)
                return;
            var g = graphic;
            var params = ClassUtils._getParams(propsO, drawConfig[1], drawConfig[2], drawConfig[3]);
            var m = ClassUtils._tM;
            if (m || ClassUtils._alpha != 1) {
                g.save();
                if (m)
                    g.transform(m);
                if (ClassUtils._alpha != 1)
                    g.alpha(ClassUtils._alpha);
            }
            g[drawConfig[0]].apply(g, params);
            if (m || ClassUtils._alpha != 1) {
                g.restore();
            }
        }
        static _adptLineData(params) {
            params[2] = parseFloat(params[0]) + parseFloat(params[2]);
            params[3] = parseFloat(params[1]) + parseFloat(params[3]);
            return params;
        }
        static _adptTextureData(params) {
            params[0] = ILaya.Loader.getRes(params[0]);
            return params;
        }
        static _adptLinesData(params) {
            params[2] = ClassUtils._getPointListByStr(params[2]);
            return params;
        }
        static _isDrawType(type) {
            if (type === "Image")
                return false;
            return type in ClassUtils.DrawTypeDic;
        }
        static _getParams(obj, params, xPos = 0, adptFun = null) {
            var rst = ClassUtils._temParam;
            rst.length = params.length;
            var i, len;
            len = params.length;
            for (i = 0; i < len; i++) {
                rst[i] = ClassUtils._getObjVar(obj, params[i][0], params[i][1]);
            }
            ClassUtils._alpha = ClassUtils._getObjVar(obj, "alpha", 1);
            var m;
            m = ClassUtils._getTransformData(obj);
            if (m) {
                if (!xPos)
                    xPos = 0;
                m.translate(rst[xPos], rst[xPos + 1]);
                rst[xPos] = rst[xPos + 1] = 0;
                ClassUtils._tM = m;
            }
            else {
                ClassUtils._tM = null;
            }
            if (adptFun && ClassUtils[adptFun]) {
                rst = ClassUtils[adptFun](rst);
            }
            return rst;
        }
        static _getPointListByStr(str) {
            var pointArr = str.split(",");
            var i, len;
            len = pointArr.length;
            for (i = 0; i < len; i++) {
                pointArr[i] = parseFloat(pointArr[i]);
            }
            return pointArr;
        }
        static _getObjVar(obj, key, noValue) {
            if (key in obj) {
                return obj[key];
            }
            return noValue;
        }
    }
    ClassUtils.DrawTypeDic = { "Rect": ["drawRect", [["x", 0], ["y", 0], ["width", 0], ["height", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Circle": ["drawCircle", [["x", 0], ["y", 0], ["radius", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Pie": ["drawPie", [["x", 0], ["y", 0], ["radius", 0], ["startAngle", 0], ["endAngle", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Image": ["drawTexture", [["x", 0], ["y", 0], ["width", 0], ["height", 0]]], "Texture": ["drawTexture", [["skin", null], ["x", 0], ["y", 0], ["width", 0], ["height", 0]], 1, "_adptTextureData"], "FillTexture": ["fillTexture", [["skin", null], ["x", 0], ["y", 0], ["width", 0], ["height", 0], ["repeat", null]], 1, "_adptTextureData"], "FillText": ["fillText", [["text", ""], ["x", 0], ["y", 0], ["font", null], ["color", null], ["textAlign", null]], 1], "Line": ["drawLine", [["x", 0], ["y", 0], ["toX", 0], ["toY", 0], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLineData"], "Lines": ["drawLines", [["x", 0], ["y", 0], ["points", ""], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLinesData"], "Curves": ["drawCurves", [["x", 0], ["y", 0], ["points", ""], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLinesData"], "Poly": ["drawPoly", [["x", 0], ["y", 0], ["points", ""], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]], 0, "_adptLinesData"] };
    ClassUtils._temParam = [];
    ClassUtils._classMap = {};

    class Node extends EventDispatcher {
        constructor() {
            super();
            this._bits = 0;
            this._children = Node.ARRAY_EMPTY;
            this._extUIChild = Node.ARRAY_EMPTY;
            this._parent = null;
            this.name = "";
            this.destroyed = false;
            this.createGLBuffer();
        }
        createGLBuffer() {
        }
        _setBit(type, value) {
            if (type === Const.DISPLAY) {
                var preValue = this._getBit(type);
                if (preValue != value)
                    this._updateDisplayedInstage();
            }
            if (value)
                this._bits |= type;
            else
                this._bits &= ~type;
        }
        _getBit(type) {
            return (this._bits & type) != 0;
        }
        _setUpNoticeChain() {
            if (this._getBit(Const.DISPLAY))
                this._setBitUp(Const.DISPLAY);
        }
        _setBitUp(type) {
            var ele = this;
            ele._setBit(type, true);
            ele = ele._parent;
            while (ele) {
                if (ele._getBit(type))
                    return;
                ele._setBit(type, true);
                ele = ele._parent;
            }
        }
        on(type, caller, listener, args = null) {
            if (type === Event.DISPLAY || type === Event.UNDISPLAY) {
                if (!this._getBit(Const.DISPLAY))
                    this._setBitUp(Const.DISPLAY);
            }
            return this._createListener(type, caller, listener, args, false);
        }
        once(type, caller, listener, args = null) {
            if (type === Event.DISPLAY || type === Event.UNDISPLAY) {
                if (!this._getBit(Const.DISPLAY))
                    this._setBitUp(Const.DISPLAY);
            }
            return this._createListener(type, caller, listener, args, true);
        }
        destroy(destroyChild = true) {
            this.destroyed = true;
            this._destroyAllComponent();
            this._parent && this._parent.removeChild(this);
            if (this._children) {
                if (destroyChild)
                    this.destroyChildren();
                else
                    this.removeChildren();
            }
            this.onDestroy();
            this._children = null;
            this.offAll();
        }
        onDestroy() {
        }
        destroyChildren() {
            if (this._children) {
                for (var i = 0, n = this._children.length; i < n; i++) {
                    this._children[0].destroy(true);
                }
            }
        }
        addChild(node) {
            if (!node || this.destroyed || node === this)
                return node;
            if (node._zOrder)
                this._setBit(Const.HAS_ZORDER, true);
            if (node._parent === this) {
                var index = this.getChildIndex(node);
                if (index !== this._children.length - 1) {
                    this._children.splice(index, 1);
                    this._children.push(node);
                    this._childChanged();
                }
            }
            else {
                node._parent && node._parent.removeChild(node);
                this._children === Node.ARRAY_EMPTY && (this._children = []);
                this._children.push(node);
                node._setParent(this);
                this._childChanged();
            }
            return node;
        }
        addInputChild(node) {
            if (this._extUIChild == Node.ARRAY_EMPTY) {
                this._extUIChild = [node];
            }
            else {
                if (this._extUIChild.indexOf(node) >= 0) {
                    return null;
                }
                this._extUIChild.push(node);
            }
            return null;
        }
        removeInputChild(node) {
            var idx = this._extUIChild.indexOf(node);
            if (idx >= 0) {
                this._extUIChild.splice(idx, 1);
            }
        }
        addChildren(...args) {
            var i = 0, n = args.length;
            while (i < n) {
                this.addChild(args[i++]);
            }
        }
        addChildAt(node, index) {
            if (!node || this.destroyed || node === this)
                return node;
            if (node._zOrder)
                this._setBit(Const.HAS_ZORDER, true);
            if (index >= 0 && index <= this._children.length) {
                if (node._parent === this) {
                    var oldIndex = this.getChildIndex(node);
                    this._children.splice(oldIndex, 1);
                    this._children.splice(index, 0, node);
                    this._childChanged();
                }
                else {
                    node._parent && node._parent.removeChild(node);
                    this._children === Node.ARRAY_EMPTY && (this._children = []);
                    this._children.splice(index, 0, node);
                    node._setParent(this);
                }
                return node;
            }
            else {
                throw new Error("appendChildAt:The index is out of bounds");
            }
        }
        getChildIndex(node) {
            return this._children.indexOf(node);
        }
        getChildByName(name) {
            var nodes = this._children;
            if (nodes) {
                for (var i = 0, n = nodes.length; i < n; i++) {
                    var node = nodes[i];
                    if (node.name === name)
                        return node;
                }
            }
            return null;
        }
        getChildAt(index) {
            return this._children[index] || null;
        }
        setChildIndex(node, index) {
            var childs = this._children;
            if (index < 0 || index >= childs.length) {
                throw new Error("setChildIndex:The index is out of bounds.");
            }
            var oldIndex = this.getChildIndex(node);
            if (oldIndex < 0)
                throw new Error("setChildIndex:node is must child of this object.");
            childs.splice(oldIndex, 1);
            childs.splice(index, 0, node);
            this._childChanged();
            return node;
        }
        _childChanged(child = null) {
        }
        removeChild(node) {
            if (!this._children)
                return node;
            var index = this._children.indexOf(node);
            return this.removeChildAt(index);
        }
        removeSelf() {
            this._parent && this._parent.removeChild(this);
            return this;
        }
        removeChildByName(name) {
            var node = this.getChildByName(name);
            node && this.removeChild(node);
            return node;
        }
        removeChildAt(index) {
            var node = this.getChildAt(index);
            if (node) {
                this._children.splice(index, 1);
                node._setParent(null);
            }
            return node;
        }
        removeChildren(beginIndex = 0, endIndex = 0x7fffffff) {
            if (this._children && this._children.length > 0) {
                var childs = this._children;
                if (beginIndex === 0 && endIndex >= childs.length - 1) {
                    var arr = childs;
                    this._children = Node.ARRAY_EMPTY;
                }
                else {
                    arr = childs.splice(beginIndex, endIndex - beginIndex);
                }
                for (var i = 0, n = arr.length; i < n; i++) {
                    arr[i]._setParent(null);
                }
            }
            return this;
        }
        replaceChild(newNode, oldNode) {
            var index = this._children.indexOf(oldNode);
            if (index > -1) {
                this._children.splice(index, 1, newNode);
                oldNode._setParent(null);
                newNode._setParent(this);
                return newNode;
            }
            return null;
        }
        get numChildren() {
            return this._children.length;
        }
        get parent() {
            return this._parent;
        }
        _setParent(value) {
            if (this._parent !== value) {
                if (value) {
                    this._parent = value;
                    this._onAdded();
                    this.event(Event.ADDED);
                    if (this._getBit(Const.DISPLAY)) {
                        this._setUpNoticeChain();
                        value.displayedInStage && this._displayChild(this, true);
                    }
                    value._childChanged(this);
                }
                else {
                    this._onRemoved();
                    this.event(Event.REMOVED);
                    this._parent._childChanged();
                    if (this._getBit(Const.DISPLAY))
                        this._displayChild(this, false);
                    this._parent = value;
                }
            }
        }
        get displayedInStage() {
            if (this._getBit(Const.DISPLAY))
                return this._getBit(Const.DISPLAYED_INSTAGE);
            this._setBitUp(Const.DISPLAY);
            return this._getBit(Const.DISPLAYED_INSTAGE);
        }
        _updateDisplayedInstage() {
            var ele;
            ele = this;
            var stage = ILaya.stage;
            var displayedInStage = false;
            while (ele) {
                if (ele._getBit(Const.DISPLAY)) {
                    displayedInStage = ele._getBit(Const.DISPLAYED_INSTAGE);
                    break;
                }
                if (ele === stage || ele._getBit(Const.DISPLAYED_INSTAGE)) {
                    displayedInStage = true;
                    break;
                }
                ele = ele._parent;
            }
            this._setBit(Const.DISPLAYED_INSTAGE, displayedInStage);
        }
        _setDisplay(value) {
            if (this._getBit(Const.DISPLAYED_INSTAGE) !== value) {
                this._setBit(Const.DISPLAYED_INSTAGE, value);
                if (value)
                    this.event(Event.DISPLAY);
                else
                    this.event(Event.UNDISPLAY);
            }
        }
        _displayChild(node, display) {
            var childs = node._children;
            if (childs) {
                for (var i = 0, n = childs.length; i < n; i++) {
                    var child = childs[i];
                    if (!child._getBit(Const.DISPLAY))
                        continue;
                    if (child._children.length > 0) {
                        this._displayChild(child, display);
                    }
                    else {
                        child._setDisplay(display);
                    }
                }
            }
            node._setDisplay(display);
        }
        contains(node) {
            if (node === this)
                return true;
            while (node) {
                if (node._parent === this)
                    return true;
                node = node._parent;
            }
            return false;
        }
        timerLoop(delay, caller, method, args = null, coverBefore = true, jumpFrame = false) {
            var timer = this.scene ? this.scene.timer : ILaya.timer;
            timer.loop(delay, caller, method, args, coverBefore, jumpFrame);
        }
        timerOnce(delay, caller, method, args = null, coverBefore = true) {
            var timer = this.scene ? this.scene.timer : ILaya.timer;
            timer._create(false, false, delay, caller, method, args, coverBefore);
        }
        frameLoop(delay, caller, method, args = null, coverBefore = true) {
            var timer = this.scene ? this.scene.timer : ILaya.timer;
            timer._create(true, true, delay, caller, method, args, coverBefore);
        }
        frameOnce(delay, caller, method, args = null, coverBefore = true) {
            var timer = this.scene ? this.scene.timer : ILaya.timer;
            timer._create(true, false, delay, caller, method, args, coverBefore);
        }
        clearTimer(caller, method) {
            var timer = this.scene ? this.scene.timer : ILaya.timer;
            timer.clear(caller, method);
        }
        callLater(method, args = null) {
            var timer = this.scene ? this.scene.timer : ILaya.timer;
            timer.callLater(this, method, args);
        }
        runCallLater(method) {
            var timer = this.scene ? this.scene.timer : ILaya.timer;
            timer.runCallLater(this, method);
        }
        get scene() {
            return this._scene;
        }
        get active() {
            return !this._getBit(Const.NOT_READY) && !this._getBit(Const.NOT_ACTIVE);
        }
        set active(value) {
            value = !!value;
            if (!this._getBit(Const.NOT_ACTIVE) !== value) {
                if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
                    if (value)
                        throw "Node: can't set the main inActive node active in hierarchy,if the operate is in main inActive node or it's children script's onDisable Event.";
                    else
                        throw "Node: can't set the main active node inActive in hierarchy,if the operate is in main active node or it's children script's onEnable Event.";
                }
                else {
                    this._setBit(Const.NOT_ACTIVE, !value);
                    if (this._parent) {
                        if (this._parent.activeInHierarchy) {
                            if (value)
                                this._processActive();
                            else
                                this._processInActive();
                        }
                    }
                }
            }
        }
        get activeInHierarchy() {
            return this._getBit(Const.ACTIVE_INHIERARCHY);
        }
        _onActive() {
            Stat.spriteCount++;
        }
        _onInActive() {
            Stat.spriteCount--;
        }
        _onActiveInScene() {
        }
        _onInActiveInScene() {
        }
        _parse(data, spriteMap) {
        }
        _setBelongScene(scene) {
            if (!this._scene) {
                this._scene = scene;
                this._onActiveInScene();
                for (var i = 0, n = this._children.length; i < n; i++)
                    this._children[i]._setBelongScene(scene);
            }
        }
        _setUnBelongScene() {
            if (this._scene !== this) {
                this._onInActiveInScene();
                this._scene = null;
                for (var i = 0, n = this._children.length; i < n; i++)
                    this._children[i]._setUnBelongScene();
            }
        }
        onAwake() {
        }
        onEnable() {
        }
        _processActive() {
            (this._activeChangeScripts) || (this._activeChangeScripts = []);
            this._activeHierarchy(this._activeChangeScripts);
            this._activeScripts();
        }
        _activeHierarchy(activeChangeScripts) {
            this._setBit(Const.ACTIVE_INHIERARCHY, true);
            if (this._components) {
                for (var i = 0, n = this._components.length; i < n; i++) {
                    var comp = this._components[i];
                    comp._setActive(true);
                    (comp._isScript() && comp._enabled) && (activeChangeScripts.push(comp));
                }
            }
            this._onActive();
            for (i = 0, n = this._children.length; i < n; i++) {
                var child = this._children[i];
                (!child._getBit(Const.NOT_ACTIVE)) && (child._activeHierarchy(activeChangeScripts));
            }
            if (!this._getBit(Const.AWAKED)) {
                this._setBit(Const.AWAKED, true);
                this.onAwake();
            }
            this.onEnable();
        }
        _activeScripts() {
            for (var i = 0, n = this._activeChangeScripts.length; i < n; i++)
                this._activeChangeScripts[i].onEnable();
            this._activeChangeScripts.length = 0;
        }
        _processInActive() {
            (this._activeChangeScripts) || (this._activeChangeScripts = []);
            this._inActiveHierarchy(this._activeChangeScripts);
            this._inActiveScripts();
        }
        _inActiveHierarchy(activeChangeScripts) {
            this._onInActive();
            if (this._components) {
                for (var i = 0, n = this._components.length; i < n; i++) {
                    var comp = this._components[i];
                    comp._setActive(false);
                    (comp._isScript() && comp._enabled) && (activeChangeScripts.push(comp));
                }
            }
            this._setBit(Const.ACTIVE_INHIERARCHY, false);
            for (i = 0, n = this._children.length; i < n; i++) {
                var child = this._children[i];
                (child && !child._getBit(Const.NOT_ACTIVE)) && (child._inActiveHierarchy(activeChangeScripts));
            }
            this.onDisable();
        }
        _inActiveScripts() {
            for (var i = 0, n = this._activeChangeScripts.length; i < n; i++)
                this._activeChangeScripts[i].onDisable();
            this._activeChangeScripts.length = 0;
        }
        onDisable() {
        }
        _onAdded() {
            if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
                throw "Node: can't set the main inActive node active in hierarchy,if the operate is in main inActive node or it's children script's onDisable Event.";
            }
            else {
                var parentScene = this._parent.scene;
                parentScene && this._setBelongScene(parentScene);
                (this._parent.activeInHierarchy && this.active) && this._processActive();
            }
        }
        _onRemoved() {
            if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
                throw "Node: can't set the main active node inActive in hierarchy,if the operate is in main active node or it's children script's onEnable Event.";
            }
            else {
                (this._parent.activeInHierarchy && this.active) && this._processInActive();
                this._parent.scene && this._setUnBelongScene();
            }
        }
        _addComponentInstance(comp) {
            this._components = this._components || [];
            this._components.push(comp);
            comp.owner = this;
            comp._onAdded();
            if (this.activeInHierarchy) {
                comp._setActive(true);
                (comp._isScript() && comp._enabled) && (comp.onEnable());
            }
        }
        _destroyComponent(comp) {
            if (this._components) {
                for (var i = 0, n = this._components.length; i < n; i++) {
                    var item = this._components[i];
                    if (item === comp) {
                        item._destroy();
                        this._components.splice(i, 1);
                        break;
                    }
                }
            }
        }
        _destroyAllComponent() {
            if (this._components) {
                for (var i = 0, n = this._components.length; i < n; i++) {
                    var item = this._components[i];
                    item._destroy();
                }
                this._components.length = 0;
            }
        }
        _cloneTo(destObject, srcRoot, dstRoot) {
            var destNode = destObject;
            if (this._components) {
                for (var i = 0, n = this._components.length; i < n; i++) {
                    var destComponent = destNode.addComponent(this._components[i].constructor);
                    this._components[i]._cloneTo(destComponent);
                }
            }
        }
        addComponentIntance(comp) {
            if (comp.owner)
                throw "Node:the component has belong to other node.";
            if (comp.isSingleton && this.getComponent(comp.constructor))
                throw "Node:the component is singleton,can't add the second one.";
            this._addComponentInstance(comp);
            return comp;
        }
        addComponent(type) {
            var comp = Pool.createByClass(type);
            comp._destroyed = false;
            if (comp.isSingleton && this.getComponent(type))
                throw "无法实例" + type + "组件" + "，" + type + "组件已存在！";
            this._addComponentInstance(comp);
            return comp;
        }
        getComponent(clas) {
            if (this._components) {
                for (var i = 0, n = this._components.length; i < n; i++) {
                    var comp = this._components[i];
                    if (comp instanceof clas)
                        return comp;
                }
            }
            return null;
        }
        getComponents(clas) {
            var arr;
            if (this._components) {
                for (var i = 0, n = this._components.length; i < n; i++) {
                    var comp = this._components[i];
                    if (comp instanceof clas) {
                        arr = arr || [];
                        arr.push(comp);
                    }
                }
            }
            return arr;
        }
        get timer() {
            return this.scene ? this.scene.timer : ILaya.timer;
        }
    }
    Node.ARRAY_EMPTY = [];
    ClassUtils.regClass("laya.display.Node", Node);
    ClassUtils.regClass("Laya.Node", Node);

    class BoundsStyle {
        reset() {
            if (this.bounds)
                this.bounds.recover();
            if (this.userBounds)
                this.userBounds.recover();
            this.bounds = null;
            this.userBounds = null;
            this.temBM = null;
            return this;
        }
        recover() {
            Pool.recover("BoundsStyle", this.reset());
        }
        static create() {
            return Pool.getItemByClass("BoundsStyle", BoundsStyle);
        }
    }

    class HTMLCanvas extends Bitmap {
        get source() {
            return this._source;
        }
        _getSource() {
            return this._source;
        }
        constructor(createCanvas = false, inputCanvas = null) {
            super();
            if (createCanvas)
                this._source = Browser.createElement("canvas", inputCanvas);
            else {
                this._source = this;
            }
            this.lock = true;
        }
        clear() {
            this._ctx && this._ctx.clear && this._ctx.clear();
            if (this._texture) {
                this._texture.destroy();
                this._texture = null;
            }
        }
        destroy() {
            super.destroy();
            this._setCPUMemory(0);
            this._ctx && this._ctx.destroy && this._ctx.destroy();
            this._ctx = null;
        }
        release() {
        }
        get context() {
            if (this._ctx)
                return this._ctx;
            if (this._source == this) {
                this._ctx = new ILaya.Context();
            }
            else {
                this._ctx = this._source.getContext(ILaya.Render.isConchApp ? 'layagl' : '2d');
            }
            this._ctx._canvas = this;
            return this._ctx;
        }
        _setContext(context) {
            this._ctx = context;
        }
        getContext(contextID, other = null) {
            return this.context;
        }
        getMemSize() {
            return 0;
        }
        size(w, h) {
            if (this._width != w || this._height != h || (this._source && (this._source.width != w || this._source.height != h))) {
                this._width = w;
                this._height = h;
                this._setCPUMemory(w * h * 4);
                this._ctx && this._ctx.size && this._ctx.size(w, h);
                if (this._source) {
                    this._source.height = h;
                    this._source.width = w;
                }
                if (this._texture) {
                    this._texture.destroy();
                    this._texture = null;
                }
            }
        }
        getTexture() {
            if (!this._texture) {
                var bitmap = new Texture2D();
                bitmap.loadImageSource(this.source);
                this._texture = new Texture(bitmap);
            }
            return this._texture;
        }
        toBase64(type, encoderOptions) {
            if (this._source) {
                if (ILaya.Render.isConchApp) {
                    var win = window;
                    if (win.conchConfig.threadMode == 2) {
                        throw "native 2 thread mode use toBase64Async";
                    }
                    var width = this._ctx._targets.sourceWidth;
                    var height = this._ctx._targets.sourceHeight;
                    var data = this._ctx._targets.getData(0, 0, width, height);
                    return win.conchToBase64FlipY ? win.conchToBase64FlipY(type, encoderOptions, data.buffer, width, height) : win.conchToBase64(type, encoderOptions, data.buffer, width, height);
                }
                else {
                    return this._source.toDataURL(type, encoderOptions);
                }
            }
            return null;
        }
        toBase64Async(type, encoderOptions, callBack) {
            var width = this._ctx._targets.sourceWidth;
            var height = this._ctx._targets.sourceHeight;
            this._ctx._targets.getDataAsync(0, 0, width, height, function (data) {
                let win = window;
                var base64 = win.conchToBase64FlipY ? win.conchToBase64FlipY(type, encoderOptions, data.buffer, width, height) : win.conchToBase64(type, encoderOptions, data.buffer, width, height);
                callBack(base64);
            });
        }
    }

    class CacheStyle {
        constructor() {
            this.reset();
        }
        needBitmapCache() {
            return this.cacheForFilters || !!this.mask;
        }
        needEnableCanvasRender() {
            return this.userSetCache != "none" || this.cacheForFilters || !!this.mask;
        }
        releaseContext() {
            if (this.canvas && this.canvas.size) {
                Pool.recover("CacheCanvas", this.canvas);
                this.canvas.size(0, 0);
                try {
                    this.canvas.width = 0;
                    this.canvas.height = 0;
                }
                catch (e) {
                }
            }
            this.canvas = null;
        }
        createContext() {
            if (!this.canvas) {
                this.canvas = Pool.getItem("CacheCanvas") || new HTMLCanvas(false);
                var tx = this.canvas.context;
                if (!tx) {
                    tx = this.canvas.getContext('2d');
                }
            }
        }
        releaseFilterCache() {
            var fc = this.filterCache;
            if (fc) {
                fc.destroy();
                fc.recycle();
                this.filterCache = null;
            }
        }
        recover() {
            if (this === CacheStyle.EMPTY)
                return;
            Pool.recover("SpriteCache", this.reset());
        }
        reset() {
            this.releaseContext();
            this.releaseFilterCache();
            this.cacheAs = "none";
            this.enableCanvasRender = false;
            this.userSetCache = "none";
            this.cacheForFilters = false;
            this.staticCache = false;
            this.reCache = true;
            this.mask = null;
            this.maskParent = null;
            this.filterCache = null;
            this.filters = null;
            this.hasGlowFilter = false;
            if (this.cacheRect)
                this.cacheRect.recover();
            this.cacheRect = null;
            return this;
        }
        static create() {
            return Pool.getItemByClass("SpriteCache", CacheStyle);
        }
        _calculateCacheRect(sprite, tCacheType, x, y) {
            var _cacheStyle = sprite._cacheStyle;
            if (!_cacheStyle.cacheRect)
                _cacheStyle.cacheRect = Rectangle.create();
            var tRec;
            if (tCacheType === "bitmap") {
                tRec = sprite.getSelfBounds();
                tRec.width = tRec.width + CacheStyle.CANVAS_EXTEND_EDGE * 2;
                tRec.height = tRec.height + CacheStyle.CANVAS_EXTEND_EDGE * 2;
                tRec.x = tRec.x - sprite.pivotX;
                tRec.y = tRec.y - sprite.pivotY;
                tRec.x = tRec.x - CacheStyle.CANVAS_EXTEND_EDGE;
                tRec.y = tRec.y - CacheStyle.CANVAS_EXTEND_EDGE;
                tRec.x = Math.floor(tRec.x + x) - x;
                tRec.y = Math.floor(tRec.y + y) - y;
                tRec.width = Math.floor(tRec.width);
                tRec.height = Math.floor(tRec.height);
                _cacheStyle.cacheRect.copyFrom(tRec);
            }
            else {
                _cacheStyle.cacheRect.setTo(-sprite._style.pivotX, -sprite._style.pivotY, 1, 1);
            }
            tRec = _cacheStyle.cacheRect;
            if (sprite._style.scrollRect) {
                var scrollRect = sprite._style.scrollRect;
                tRec.x -= scrollRect.x;
                tRec.y -= scrollRect.y;
            }
            CacheStyle._scaleInfo.setTo(1, 1);
            return CacheStyle._scaleInfo;
        }
    }
    CacheStyle.EMPTY = new CacheStyle();
    CacheStyle._scaleInfo = new Point();
    CacheStyle.CANVAS_EXTEND_EDGE = 16;

    class SpriteStyle {
        constructor() {
            this.reset();
        }
        reset() {
            this.scaleX = this.scaleY = 1;
            this.skewX = this.skewY = 0;
            this.pivotX = this.pivotY = this.rotation = 0;
            this.alpha = 1;
            if (this.scrollRect)
                this.scrollRect.recover();
            this.scrollRect = null;
            if (this.viewport)
                this.viewport.recover();
            this.viewport = null;
            this.hitArea = null;
            this.dragging = null;
            this.blendMode = null;
            return this;
        }
        recover() {
            if (this === SpriteStyle.EMPTY)
                return;
            Pool.recover("SpriteStyle", this.reset());
        }
        static create() {
            return Pool.getItemByClass("SpriteStyle", SpriteStyle);
        }
    }
    SpriteStyle.EMPTY = new SpriteStyle();

    class LayaGLQuickRunner {
        static __init__() {
            LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TRANSFORM | SpriteConst.GRAPHICS] = LayaGLQuickRunner.alpha_transform_drawLayaGL;
            LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.GRAPHICS] = LayaGLQuickRunner.alpha_drawLayaGL;
            LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.GRAPHICS] = LayaGLQuickRunner.transform_drawLayaGL;
            LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.CHILDS] = LayaGLQuickRunner.transform_drawNodes;
            LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TRANSFORM | SpriteConst.TEXTURE] = LayaGLQuickRunner.alpha_transform_drawTexture;
            LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TEXTURE] = LayaGLQuickRunner.alpha_drawTexture;
            LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.TEXTURE] = LayaGLQuickRunner.transform_drawTexture;
            LayaGLQuickRunner.map[SpriteConst.GRAPHICS | SpriteConst.CHILDS] = LayaGLQuickRunner.drawLayaGL_drawNodes;
        }
        static transform_drawTexture(sprite, context, x, y) {
            var style = sprite._style;
            var tex = sprite.texture;
            context.saveTransform(LayaGLQuickRunner.curMat);
            context.transformByMatrix(sprite.transform, x, y);
            context.drawTexture(tex, -sprite.pivotX, -sprite.pivotY, sprite._width || tex.width, sprite._height || tex.height);
            context.restoreTransform(LayaGLQuickRunner.curMat);
        }
        static alpha_drawTexture(sprite, context, x, y) {
            var style = sprite._style;
            var alpha;
            var tex = sprite.texture;
            if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
                var temp = context.globalAlpha;
                context.globalAlpha *= alpha;
                context.drawTexture(tex, x - style.pivotX + tex.offsetX, y - style.pivotY + tex.offsetY, sprite._width || tex.width, sprite._height || tex.height);
                context.globalAlpha = temp;
            }
        }
        static alpha_transform_drawTexture(sprite, context, x, y) {
            var style = sprite._style;
            var alpha;
            var tex = sprite.texture;
            if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
                var temp = context.globalAlpha;
                context.globalAlpha *= alpha;
                context.saveTransform(LayaGLQuickRunner.curMat);
                context.transformByMatrix(sprite.transform, x, y);
                context.drawTexture(tex, -style.pivotX + tex.offsetX, -style.pivotY + tex.offsetY, sprite._width || tex.width, sprite._height || tex.height);
                context.restoreTransform(LayaGLQuickRunner.curMat);
                context.globalAlpha = temp;
            }
        }
        static alpha_transform_drawLayaGL(sprite, context, x, y) {
            var style = sprite._style;
            var alpha;
            if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
                var temp = context.globalAlpha;
                context.globalAlpha *= alpha;
                context.saveTransform(LayaGLQuickRunner.curMat);
                context.transformByMatrix(sprite.transform, x, y);
                sprite._graphics && sprite._graphics._render(sprite, context, -style.pivotX, -style.pivotY);
                context.restoreTransform(LayaGLQuickRunner.curMat);
                context.globalAlpha = temp;
            }
        }
        static alpha_drawLayaGL(sprite, context, x, y) {
            var style = sprite._style;
            var alpha;
            if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
                var temp = context.globalAlpha;
                context.globalAlpha *= alpha;
                sprite._graphics && sprite._graphics._render(sprite, context, x - style.pivotX, y - style.pivotY);
                context.globalAlpha = temp;
            }
        }
        static transform_drawLayaGL(sprite, context, x, y) {
            var style = sprite._style;
            context.saveTransform(LayaGLQuickRunner.curMat);
            context.transformByMatrix(sprite.transform, x, y);
            sprite._graphics && sprite._graphics._render(sprite, context, -style.pivotX, -style.pivotY);
            context.restoreTransform(LayaGLQuickRunner.curMat);
        }
        static transform_drawNodes(sprite, context, x, y) {
            var textLastRender = sprite._getBit(Const.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);
            var style = sprite._style;
            context.saveTransform(LayaGLQuickRunner.curMat);
            context.transformByMatrix(sprite.transform, x, y);
            x = -style.pivotX;
            y = -style.pivotY;
            var childs = sprite._children, n = childs.length, ele;
            if (style.viewport) {
                var rect = style.viewport;
                var left = rect.x;
                var top = rect.y;
                var right = rect.right;
                var bottom = rect.bottom;
                var _x, _y;
                for (i = 0; i < n; ++i) {
                    if ((ele = childs[i])._visible && ((_x = ele._x) < right && (_x + ele.width) > left && (_y = ele._y) < bottom && (_y + ele.height) > top)) {
                        ele.render(context, x, y);
                    }
                }
            }
            else {
                for (var i = 0; i < n; ++i)
                    (ele = childs[i])._visible && ele.render(context, x, y);
            }
            context.restoreTransform(LayaGLQuickRunner.curMat);
            textLastRender && context.drawCallOptimize(false);
        }
        static drawLayaGL_drawNodes(sprite, context, x, y) {
            var textLastRender = sprite._getBit(Const.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);
            var style = sprite._style;
            x = x - style.pivotX;
            y = y - style.pivotY;
            sprite._graphics && sprite._graphics._render(sprite, context, x, y);
            var childs = sprite._children, n = childs.length, ele;
            if (style.viewport) {
                var rect = style.viewport;
                var left = rect.x;
                var top = rect.y;
                var right = rect.right;
                var bottom = rect.bottom;
                var _x, _y;
                for (i = 0; i < n; ++i) {
                    if ((ele = childs[i])._visible && ((_x = ele._x) < right && (_x + ele.width) > left && (_y = ele._y) < bottom && (_y + ele.height) > top)) {
                        ele.render(context, x, y);
                    }
                }
            }
            else {
                for (var i = 0; i < n; ++i)
                    (ele = childs[i])._visible && ele.render(context, x, y);
            }
            textLastRender && context.drawCallOptimize(false);
        }
    }
    LayaGLQuickRunner.map = {};
    LayaGLQuickRunner.curMat = new Matrix();

    class RenderSprite {
        constructor(type, next) {
            if (LayaGLQuickRunner.map[type]) {
                this._fun = LayaGLQuickRunner.map[type];
                this._next = RenderSprite.NORENDER;
                return;
            }
            this._next = next || RenderSprite.NORENDER;
            switch (type) {
                case 0:
                    this._fun = this._no;
                    return;
                case SpriteConst.ALPHA:
                    this._fun = this._alpha;
                    return;
                case SpriteConst.TRANSFORM:
                    this._fun = this._transform;
                    return;
                case SpriteConst.BLEND:
                    this._fun = this._blend;
                    return;
                case SpriteConst.CANVAS:
                    this._fun = this._canvas;
                    return;
                case SpriteConst.MASK:
                    this._fun = this._mask;
                    return;
                case SpriteConst.CLIP:
                    this._fun = this._clip;
                    return;
                case SpriteConst.STYLE:
                    this._fun = this._style;
                    return;
                case SpriteConst.GRAPHICS:
                    this._fun = this._graphics;
                    return;
                case SpriteConst.CHILDS:
                    this._fun = this._children;
                    return;
                case SpriteConst.CUSTOM:
                    this._fun = this._custom;
                    return;
                case SpriteConst.TEXTURE:
                    this._fun = this._texture;
                    return;
                case SpriteConst.FILTERS:
                    this._fun = Filter._filter;
                    return;
                case RenderSprite.INIT:
                    this._fun = RenderSprite._initRenderFun;
                    return;
            }
            this.onCreate(type);
        }
        static __init__() {
            LayaGLQuickRunner.__init__();
            var i, len;
            var initRender;
            initRender = new RenderSprite(RenderSprite.INIT, null);
            len = RenderSprite.renders.length = SpriteConst.CHILDS * 2;
            for (i = 0; i < len; i++)
                RenderSprite.renders[i] = initRender;
            RenderSprite.renders[0] = new RenderSprite(0, null);
        }
        static _initRenderFun(sprite, context, x, y) {
            var type = sprite._renderType;
            var r = RenderSprite.renders[type] = RenderSprite._getTypeRender(type);
            r._fun(sprite, context, x, y);
        }
        static _getTypeRender(type) {
            if (LayaGLQuickRunner.map[type])
                return new RenderSprite(type, null);
            var rst = null;
            var tType = SpriteConst.CHILDS;
            while (tType > 0) {
                if (tType & type)
                    rst = new RenderSprite(tType, rst);
                tType = tType >> 1;
            }
            return rst;
        }
        onCreate(type) {
        }
        _style(sprite, context, x, y) {
            var style = sprite._style;
            if (style.render != null)
                style.render(sprite, context, x, y);
            var next = this._next;
            next._fun.call(next, sprite, context, x, y);
        }
        _no(sprite, context, x, y) {
        }
        _custom(sprite, context, x, y) {
            sprite.customRender(context, x, y);
            this._next._fun.call(this._next, sprite, context, x - sprite.pivotX, y - sprite.pivotY);
        }
        _clip(sprite, context, x, y) {
            var next = this._next;
            if (next == RenderSprite.NORENDER)
                return;
            var r = sprite._style.scrollRect;
            context.save();
            context.clipRect(x, y, r.width, r.height);
            next._fun.call(next, sprite, context, x - r.x, y - r.y);
            context.restore();
        }
        _texture(sprite, context, x, y) {
            var tex = sprite.texture;
            if (tex._getSource())
                context.drawTexture(tex, x - sprite.pivotX + tex.offsetX, y - sprite.pivotY + tex.offsetY, sprite._width || tex.width, sprite._height || tex.height);
            var next = this._next;
            if (next != RenderSprite.NORENDER)
                next._fun.call(next, sprite, context, x, y);
        }
        _graphics(sprite, context, x, y) {
            var style = sprite._style;
            var g = sprite._graphics;
            g && g._render(sprite, context, x - style.pivotX, y - style.pivotY);
            var next = this._next;
            if (next != RenderSprite.NORENDER)
                next._fun.call(next, sprite, context, x, y);
        }
        _image(sprite, context, x, y) {
            var style = sprite._style;
            context.drawTexture2(x, y, style.pivotX, style.pivotY, sprite.transform, sprite._graphics._one);
        }
        _image2(sprite, context, x, y) {
            var style = sprite._style;
            context.drawTexture2(x, y, style.pivotX, style.pivotY, sprite.transform, sprite._graphics._one);
        }
        _alpha(sprite, context, x, y) {
            var style = sprite._style;
            var alpha;
            if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
                var temp = context.globalAlpha;
                context.globalAlpha *= alpha;
                var next = this._next;
                next._fun.call(next, sprite, context, x, y);
                context.globalAlpha = temp;
            }
        }
        _transform(sprite, context, x, y) {
            var transform = sprite.transform, _next = this._next;
            var style = sprite._style;
            if (transform && _next != RenderSprite.NORENDER) {
                context.save();
                context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx + x, transform.ty + y);
                _next._fun.call(_next, sprite, context, 0, 0);
                context.restore();
            }
            else {
                if (_next != RenderSprite.NORENDER)
                    _next._fun.call(_next, sprite, context, x, y);
            }
        }
        _children(sprite, context, x, y) {
            var style = sprite._style;
            var childs = sprite._children, n = childs.length, ele;
            x = x - sprite.pivotX;
            y = y - sprite.pivotY;
            var textLastRender = sprite._getBit(Const.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);
            if (style.viewport) {
                var rect = style.viewport;
                var left = rect.x;
                var top = rect.y;
                var right = rect.right;
                var bottom = rect.bottom;
                var _x, _y;
                for (i = 0; i < n; ++i) {
                    if ((ele = childs[i])._visible && ((_x = ele._x) < right && (_x + ele.width) > left && (_y = ele._y) < bottom && (_y + ele.height) > top)) {
                        ele.render(context, x, y);
                    }
                }
            }
            else {
                for (var i = 0; i < n; ++i)
                    (ele = childs[i])._visible && ele.render(context, x, y);
            }
            textLastRender && context.drawCallOptimize(false);
        }
        _canvas(sprite, context, x, y) {
            var _cacheStyle = sprite._cacheStyle;
            var _next = this._next;
            if (!_cacheStyle.enableCanvasRender) {
                _next._fun.call(_next, sprite, context, x, y);
                return;
            }
            _cacheStyle.cacheAs === 'bitmap' ? (Stat.canvasBitmap++) : (Stat.canvasNormal++);
            var cacheNeedRebuild = false;
            var textNeedRestore = false;
            if (_cacheStyle.canvas) {
                var canv = _cacheStyle.canvas;
                var ctx = canv.context;
                var charRIs = canv.touches;
                if (charRIs) {
                    for (var ci = 0; ci < charRIs.length; ci++) {
                        if (charRIs[ci].deleted) {
                            textNeedRestore = true;
                            break;
                        }
                    }
                }
                cacheNeedRebuild = canv.isCacheValid && !canv.isCacheValid();
            }
            if (sprite._needRepaint() || (!_cacheStyle.canvas) || textNeedRestore || cacheNeedRebuild || ILaya.stage.isGlobalRepaint()) {
                if (_cacheStyle.cacheAs === 'normal') {
                    if (context._targets) {
                        _next._fun.call(_next, sprite, context, x, y);
                        return;
                    }
                    else {
                        this._canvas_webgl_normal_repaint(sprite, context);
                    }
                }
                else {
                    this._canvas_repaint(sprite, context, x, y);
                }
            }
            var tRec = _cacheStyle.cacheRect;
            context.drawCanvas(_cacheStyle.canvas, x + tRec.x, y + tRec.y, tRec.width, tRec.height);
        }
        _canvas_repaint(sprite, context, x, y) {
            var _cacheStyle = sprite._cacheStyle;
            var _next = this._next;
            var tx;
            var canvas = _cacheStyle.canvas;
            var left;
            var top;
            var tRec;
            var tCacheType = _cacheStyle.cacheAs;
            var w, h;
            var scaleX, scaleY;
            var scaleInfo;
            scaleInfo = _cacheStyle._calculateCacheRect(sprite, tCacheType, x, y);
            scaleX = scaleInfo.x;
            scaleY = scaleInfo.y;
            tRec = _cacheStyle.cacheRect;
            w = tRec.width * scaleX;
            h = tRec.height * scaleY;
            left = tRec.x;
            top = tRec.y;
            if (tCacheType === 'bitmap' && (w > 2048 || h > 2048)) {
                console.warn("cache bitmap size larger than 2048,cache ignored");
                _cacheStyle.releaseContext();
                _next._fun.call(_next, sprite, context, x, y);
                return;
            }
            if (!canvas) {
                _cacheStyle.createContext();
                canvas = _cacheStyle.canvas;
            }
            tx = canvas.context;
            tx.sprite = sprite;
            (canvas.width != w || canvas.height != h) && canvas.size(w, h);
            if (tCacheType === 'bitmap')
                tx.asBitmap = true;
            else if (tCacheType === 'normal')
                tx.asBitmap = false;
            tx.clear();
            if (scaleX != 1 || scaleY != 1) {
                var ctx = tx;
                ctx.save();
                ctx.scale(scaleX, scaleY);
                _next._fun.call(_next, sprite, tx, -left, -top);
                ctx.restore();
                sprite._applyFilters();
            }
            else {
                ctx = tx;
                _next._fun.call(_next, sprite, tx, -left, -top);
                sprite._applyFilters();
            }
            if (_cacheStyle.staticCache)
                _cacheStyle.reCache = false;
            Stat.canvasReCache++;
        }
        _canvas_webgl_normal_repaint(sprite, context) {
            var _cacheStyle = sprite._cacheStyle;
            var _next = this._next;
            var canvas = _cacheStyle.canvas;
            var tCacheType = _cacheStyle.cacheAs;
            var scaleInfo = _cacheStyle._calculateCacheRect(sprite, tCacheType, 0, 0);
            if (!canvas) {
                canvas = _cacheStyle.canvas = new WebGLCacheAsNormalCanvas(context, sprite);
            }
            var tx = canvas.context;
            canvas['startRec']();
            _next._fun.call(_next, sprite, tx, sprite.pivotX, sprite.pivotY);
            sprite._applyFilters();
            Stat.canvasReCache++;
            canvas['endRec']();
        }
        _blend(sprite, context, x, y) {
            var style = sprite._style;
            var next = this._next;
            if (style.blendMode) {
                context.save();
                context.globalCompositeOperation = style.blendMode;
                next._fun.call(next, sprite, context, x, y);
                context.restore();
            }
            else {
                next._fun.call(next, sprite, context, x, y);
            }
        }
        _mask(sprite, context, x, y) {
            var next = this._next;
            var mask = sprite.mask;
            var ctx = context;
            if (mask) {
                ctx.save();
                var preBlendMode = ctx.globalCompositeOperation;
                var tRect = new Rectangle();
                tRect.copyFrom(mask.getBounds());
                tRect.width = Math.round(tRect.width);
                tRect.height = Math.round(tRect.height);
                tRect.x = Math.round(tRect.x);
                tRect.y = Math.round(tRect.y);
                if (tRect.width > 0 && tRect.height > 0) {
                    var w = tRect.width;
                    var h = tRect.height;
                    var tmpRT = WebGLRTMgr.getRT(w, h);
                    ctx.breakNextMerge();
                    ctx.pushRT();
                    ctx.addRenderObject(SubmitCMD.create([ctx, tmpRT, w, h], RenderSprite.tmpTarget, this));
                    mask.render(ctx, -tRect.x, -tRect.y);
                    ctx.breakNextMerge();
                    ctx.popRT();
                    ctx.save();
                    ctx.clipRect(x + tRect.x - sprite.getStyle().pivotX, y + tRect.y - sprite.getStyle().pivotY, w, h);
                    next._fun.call(next, sprite, ctx, x, y);
                    ctx.restore();
                    preBlendMode = ctx.globalCompositeOperation;
                    ctx.addRenderObject(SubmitCMD.create(["mask"], RenderSprite.setBlendMode, this));
                    var shaderValue = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
                    var uv = Texture.INV_UV;
                    ctx.drawTarget(tmpRT, x + tRect.x - sprite.getStyle().pivotX, y + tRect.y - sprite.getStyle().pivotY, w, h, Matrix.TEMP.identity(), shaderValue, uv, 6);
                    ctx.addRenderObject(SubmitCMD.create([tmpRT], RenderSprite.recycleTarget, this));
                    ctx.addRenderObject(SubmitCMD.create([preBlendMode], RenderSprite.setBlendMode, this));
                }
                ctx.restore();
            }
            else {
                next._fun.call(next, sprite, context, x, y);
            }
        }
        static tmpTarget(ctx, rt, w, h) {
            rt.start();
            rt.clear(0, 0, 0, 0);
        }
        static recycleTarget(rt) {
            WebGLRTMgr.releaseRT(rt);
        }
        static setBlendMode(blendMode) {
            var gl = WebGLContext.mainContext;
            BlendMode.targetFns[BlendMode.TOINT[blendMode]](gl);
        }
    }
    RenderSprite.INIT = 0x11111;
    RenderSprite.renders = [];
    RenderSprite.NORENDER = new RenderSprite(0, null);
    RenderSprite.tempUV = new Array(8);

    class Sprite extends Node {
        constructor() {
            super();
            this._x = 0;
            this._y = 0;
            this._width = 0;
            this._height = 0;
            this._visible = true;
            this._mouseState = 0;
            this._zOrder = 0;
            this._renderType = 0;
            this._transform = null;
            this._tfChanged = false;
            this._repaint = SpriteConst.REPAINT_NONE;
            this._texture = null;
            this._style = SpriteStyle.EMPTY;
            this._cacheStyle = CacheStyle.EMPTY;
            this._boundStyle = null;
            this._graphics = null;
            this.mouseThrough = false;
            this.autoSize = false;
            this.hitTestPrior = false;
        }
        destroy(destroyChild = true) {
            super.destroy(destroyChild);
            this._style && this._style.recover();
            this._cacheStyle && this._cacheStyle.recover();
            this._boundStyle && this._boundStyle.recover();
            this._style = null;
            this._cacheStyle = null;
            this._boundStyle = null;
            this._transform = null;
            if (this._graphics && this._graphics.autoDestroy) {
                this._graphics.destroy();
            }
            this._graphics = null;
            this.texture = null;
        }
        updateZOrder() {
            Utils.updateOrder(this._children) && this.repaint();
        }
        _getBoundsStyle() {
            if (!this._boundStyle)
                this._boundStyle = BoundsStyle.create();
            return this._boundStyle;
        }
        _setCustomRender() {
        }
        set customRenderEnable(b) {
            if (b) {
                this._renderType |= SpriteConst.CUSTOM;
                this._setRenderType(this._renderType);
                this._setCustomRender();
            }
        }
        get cacheAs() {
            return this._cacheStyle.cacheAs;
        }
        _setCacheAs(value) {
        }
        set cacheAs(value) {
            if (value === this._cacheStyle.userSetCache)
                return;
            if (this.mask && value === 'normal')
                return;
            this._setCacheAs(value);
            this._getCacheStyle().userSetCache = value;
            this._checkCanvasEnable();
            this.repaint();
        }
        _checkCanvasEnable() {
            var tEnable = this._cacheStyle.needEnableCanvasRender();
            this._getCacheStyle().enableCanvasRender = tEnable;
            if (tEnable) {
                if (this._cacheStyle.needBitmapCache()) {
                    this._cacheStyle.cacheAs = "bitmap";
                }
                else {
                    this._cacheStyle.cacheAs = this._cacheStyle.userSetCache;
                }
                this._cacheStyle.reCache = true;
                this._renderType |= SpriteConst.CANVAS;
            }
            else {
                this._cacheStyle.cacheAs = "none";
                this._cacheStyle.releaseContext();
                this._renderType &= ~SpriteConst.CANVAS;
            }
            this._setCacheAs(this._cacheStyle.cacheAs);
            this._setRenderType(this._renderType);
        }
        get staticCache() {
            return this._cacheStyle.staticCache;
        }
        set staticCache(value) {
            this._getCacheStyle().staticCache = value;
            if (!value)
                this.reCache();
        }
        reCache() {
            this._cacheStyle.reCache = true;
            this._repaint |= SpriteConst.REPAINT_CACHE;
        }
        getRepaint() {
            return this._repaint;
        }
        _setX(value) {
            this._x = value;
        }
        _setY(value) {
            this._y = value;
        }
        _setWidth(texture, value) {
        }
        _setHeight(texture, value) {
        }
        get x() {
            return this._x;
        }
        set x(value) {
            if (this.destroyed)
                return;
            if (this._x !== value) {
                this._setX(value);
                this.parentRepaint(SpriteConst.REPAINT_CACHE);
                var p = this._cacheStyle.maskParent;
                if (p) {
                    p.repaint(SpriteConst.REPAINT_CACHE);
                }
            }
        }
        get y() {
            return this._y;
        }
        set y(value) {
            if (this.destroyed)
                return;
            if (this._y !== value) {
                this._setY(value);
                this.parentRepaint(SpriteConst.REPAINT_CACHE);
                var p = this._cacheStyle.maskParent;
                if (p) {
                    p.repaint(SpriteConst.REPAINT_CACHE);
                }
            }
        }
        get width() {
            return this.get_width();
        }
        set width(value) {
            this.set_width(value);
        }
        set_width(value) {
            if (this._width !== value) {
                this._width = value;
                this._setWidth(this.texture, value);
                this._setTranformChange();
            }
        }
        get_width() {
            if (!this.autoSize)
                return this._width || (this.texture ? this.texture.width : 0);
            if (this.texture)
                return this.texture.width;
            if (!this._graphics && this._children.length === 0)
                return 0;
            return this.getSelfBounds().width;
        }
        get height() {
            return this.get_height();
        }
        set height(value) {
            this.set_height(value);
        }
        set_height(value) {
            if (this._height !== value) {
                this._height = value;
                this._setHeight(this.texture, value);
                this._setTranformChange();
            }
        }
        get_height() {
            if (!this.autoSize)
                return this._height || (this.texture ? this.texture.height : 0);
            if (this.texture)
                return this.texture.height;
            if (!this._graphics && this._children.length === 0)
                return 0;
            return this.getSelfBounds().height;
        }
        get displayWidth() {
            return this.width * this.scaleX;
        }
        get displayHeight() {
            return this.height * this.scaleY;
        }
        setSelfBounds(bound) {
            this._getBoundsStyle().userBounds = bound;
        }
        getBounds() {
            return this._getBoundsStyle().bounds = Rectangle._getWrapRec(this._boundPointsToParent());
        }
        getSelfBounds() {
            if (this._boundStyle && this._boundStyle.userBounds)
                return this._boundStyle.userBounds;
            if (!this._graphics && this._children.length === 0 && !this._texture)
                return Rectangle.TEMP.setTo(0, 0, this.width, this.height);
            return this._getBoundsStyle().bounds = Rectangle._getWrapRec(this._getBoundPointsM(false));
        }
        _boundPointsToParent(ifRotate = false) {
            var pX = 0, pY = 0;
            if (this._style) {
                pX = this.pivotX;
                pY = this.pivotY;
                ifRotate = ifRotate || (this._style.rotation !== 0);
                if (this._style.scrollRect) {
                    pX += this._style.scrollRect.x;
                    pY += this._style.scrollRect.y;
                }
            }
            var pList = this._getBoundPointsM(ifRotate);
            if (!pList || pList.length < 1)
                return pList;
            if (pList.length != 8) {
                pList = ifRotate ? GrahamScan.scanPList(pList) : Rectangle._getWrapRec(pList, Rectangle.TEMP)._getBoundPoints();
            }
            if (!this.transform) {
                Utils.transPointList(pList, this._x - pX, this._y - pY);
                return pList;
            }
            var tPoint = Point.TEMP;
            var i, len = pList.length;
            for (i = 0; i < len; i += 2) {
                tPoint.x = pList[i];
                tPoint.y = pList[i + 1];
                this.toParentPoint(tPoint);
                pList[i] = tPoint.x;
                pList[i + 1] = tPoint.y;
            }
            return pList;
        }
        getGraphicBounds(realSize = false) {
            if (!this._graphics)
                return Rectangle.TEMP.setTo(0, 0, 0, 0);
            return this._graphics.getBounds(realSize);
        }
        _getBoundPointsM(ifRotate = false) {
            if (this._boundStyle && this._boundStyle.userBounds)
                return this._boundStyle.userBounds._getBoundPoints();
            if (!this._boundStyle)
                this._getBoundsStyle();
            if (!this._boundStyle.temBM)
                this._boundStyle.temBM = [];
            if (this._style.scrollRect) {
                var rst = Utils.clearArray(this._boundStyle.temBM);
                var rec = Rectangle.TEMP;
                rec.copyFrom(this._style.scrollRect);
                Utils.concatArray(rst, rec._getBoundPoints());
                return rst;
            }
            var pList;
            if (this._graphics) {
                pList = this._graphics.getBoundPoints();
            }
            else {
                pList = Utils.clearArray(this._boundStyle.temBM);
                if (this._texture) {
                    rec = Rectangle.TEMP;
                    rec.setTo(0, 0, this.width || this._texture.width, this.height || this._texture.height);
                    Utils.concatArray(pList, rec._getBoundPoints());
                }
            }
            var child;
            var cList;
            var __childs;
            __childs = this._children;
            for (var i = 0, n = __childs.length; i < n; i++) {
                child = __childs[i];
                if (child instanceof Sprite && child._visible === true) {
                    cList = child._boundPointsToParent(ifRotate);
                    if (cList)
                        pList = pList ? Utils.concatArray(pList, cList) : cList;
                }
            }
            return pList;
        }
        _getCacheStyle() {
            this._cacheStyle === CacheStyle.EMPTY && (this._cacheStyle = CacheStyle.create());
            return this._cacheStyle;
        }
        getStyle() {
            this._style === SpriteStyle.EMPTY && (this._style = SpriteStyle.create());
            return this._style;
        }
        setStyle(value) {
            this._style = value;
        }
        get scaleX() {
            return this._style.scaleX;
        }
        set scaleX(value) {
            this.set_scaleX(value);
        }
        _setScaleX(value) {
            this._style.scaleX = value;
        }
        get scaleY() {
            return this._style.scaleY;
        }
        set scaleY(value) {
            this.set_scaleY(value);
        }
        _setScaleY(value) {
            this._style.scaleY = value;
        }
        set_scaleX(value) {
            var style = this.getStyle();
            if (style.scaleX !== value) {
                this._setScaleX(value);
                this._setTranformChange();
            }
        }
        get_scaleX() {
            return this._style.scaleX;
        }
        set_scaleY(value) {
            var style = this.getStyle();
            if (style.scaleY !== value) {
                this._setScaleY(value);
                this._setTranformChange();
            }
        }
        get_scaleY() {
            return this._style.scaleY;
        }
        get rotation() {
            return this._style.rotation;
        }
        set rotation(value) {
            var style = this.getStyle();
            if (style.rotation !== value) {
                this._setRotation(value);
                this._setTranformChange();
            }
        }
        _setRotation(value) {
            this._style.rotation = value;
        }
        get skewX() {
            return this._style.skewX;
        }
        set skewX(value) {
            var style = this.getStyle();
            if (style.skewX !== value) {
                this._setSkewX(value);
                this._setTranformChange();
            }
        }
        _setSkewX(value) {
            this._style.skewX = value;
        }
        get skewY() {
            return this._style.skewY;
        }
        set skewY(value) {
            var style = this.getStyle();
            if (style.skewY !== value) {
                this._setSkewY(value);
                this._setTranformChange();
            }
        }
        _setSkewY(value) {
            this._style.skewY = value;
        }
        _createTransform() {
            return Matrix.create();
        }
        _adjustTransform() {
            this._tfChanged = false;
            var style = this._style;
            var sx = style.scaleX, sy = style.scaleY;
            var sskx = style.skewX;
            var ssky = style.skewY;
            var rot = style.rotation;
            var m = this._transform || (this._transform = this._createTransform());
            if (rot || sx !== 1 || sy !== 1 || sskx !== 0 || ssky !== 0) {
                m._bTransform = true;
                var skx = (rot - sskx) * 0.0174532922222222;
                var sky = (rot + ssky) * 0.0174532922222222;
                var cx = Math.cos(sky);
                var ssx = Math.sin(sky);
                var cy = Math.sin(skx);
                var ssy = Math.cos(skx);
                m.a = sx * cx;
                m.b = sx * ssx;
                m.c = -sy * cy;
                m.d = sy * ssy;
                m.tx = m.ty = 0;
            }
            else {
                m.identity();
                this._renderType &= ~SpriteConst.TRANSFORM;
                this._setRenderType(this._renderType);
            }
            return m;
        }
        _setTransform(value) {
        }
        get transform() {
            return this._tfChanged ? this._adjustTransform() : this._transform;
        }
        set transform(value) {
            this.set_transform(value);
        }
        get_transform() {
            return this._tfChanged ? this._adjustTransform() : this._transform;
        }
        set_transform(value) {
            this._tfChanged = false;
            var m = this._transform || (this._transform = this._createTransform());
            value.copyTo(m);
            this._setTransform(m);
            if (value) {
                this._x = m.tx;
                this._y = m.ty;
                m.tx = m.ty = 0;
            }
            if (value)
                this._renderType |= SpriteConst.TRANSFORM;
            else {
                this._renderType &= ~SpriteConst.TRANSFORM;
            }
            this._setRenderType(this._renderType);
            this.parentRepaint();
        }
        _setPivotX(value) {
            var style = this.getStyle();
            style.pivotX = value;
        }
        _getPivotX() {
            return this._style.pivotX;
        }
        _setPivotY(value) {
            var style = this.getStyle();
            style.pivotY = value;
        }
        _getPivotY() {
            return this._style.pivotY;
        }
        get pivotX() {
            return this._getPivotX();
        }
        set pivotX(value) {
            this._setPivotX(value);
            this.repaint();
        }
        get pivotY() {
            return this._getPivotY();
        }
        set pivotY(value) {
            this._setPivotY(value);
            this.repaint();
        }
        _setAlpha(value) {
            if (this._style.alpha !== value) {
                var style = this.getStyle();
                style.alpha = value;
                if (value !== 1)
                    this._renderType |= SpriteConst.ALPHA;
                else
                    this._renderType &= ~SpriteConst.ALPHA;
                this._setRenderType(this._renderType);
                this.parentRepaint();
            }
        }
        _getAlpha() {
            return this._style.alpha;
        }
        get alpha() {
            return this._getAlpha();
        }
        set alpha(value) {
            value = value < 0 ? 0 : (value > 1 ? 1 : value);
            this._setAlpha(value);
        }
        get visible() {
            return this.get_visible();
        }
        set visible(value) {
            this.set_visible(value);
        }
        get_visible() {
            return this._visible;
        }
        set_visible(value) {
            if (this._visible !== value) {
                this._visible = value;
                this.parentRepaint(SpriteConst.REPAINT_ALL);
            }
        }
        _setBlendMode(value) {
        }
        get blendMode() {
            return this._style.blendMode;
        }
        set blendMode(value) {
            this._setBlendMode(value);
            this.getStyle().blendMode = value;
            if (value && value != "source-over")
                this._renderType |= SpriteConst.BLEND;
            else
                this._renderType &= ~SpriteConst.BLEND;
            this._setRenderType(this._renderType);
            this.parentRepaint();
        }
        get graphics() {
            if (!this._graphics) {
                this.graphics = new Graphics();
                this._graphics.autoDestroy = true;
            }
            return this._graphics;
        }
        _setGraphics(value) {
        }
        _setGraphicsCallBack() {
        }
        set graphics(value) {
            if (this._graphics)
                this._graphics._sp = null;
            this._graphics = value;
            if (value) {
                this._setGraphics(value);
                this._renderType |= SpriteConst.GRAPHICS;
                value._sp = this;
            }
            else {
                this._renderType &= ~SpriteConst.GRAPHICS;
            }
            this._setRenderType(this._renderType);
            this.repaint();
        }
        get scrollRect() {
            return this._style.scrollRect;
        }
        _setScrollRect(value) {
        }
        set scrollRect(value) {
            this.getStyle().scrollRect = value;
            this._setScrollRect(value);
            this.repaint();
            if (value) {
                this._renderType |= SpriteConst.CLIP;
            }
            else {
                this._renderType &= ~SpriteConst.CLIP;
            }
            this._setRenderType(this._renderType);
        }
        pos(x, y, speedMode = false) {
            if (this._x !== x || this._y !== y) {
                if (this.destroyed)
                    return this;
                if (speedMode) {
                    this._setX(x);
                    this._setY(y);
                    this.parentRepaint(SpriteConst.REPAINT_CACHE);
                    var p = this._cacheStyle.maskParent;
                    if (p) {
                        p.repaint(SpriteConst.REPAINT_CACHE);
                    }
                }
                else {
                    this.x = x;
                    this.y = y;
                }
            }
            return this;
        }
        pivot(x, y) {
            this.pivotX = x;
            this.pivotY = y;
            return this;
        }
        size(width, height) {
            this.width = width;
            this.height = height;
            return this;
        }
        scale(scaleX, scaleY, speedMode = false) {
            var style = this.getStyle();
            if (style.scaleX != scaleX || style.scaleY != scaleY) {
                if (this.destroyed)
                    return this;
                if (speedMode) {
                    this._setScaleX(scaleX);
                    this._setScaleY(scaleY);
                    this._setTranformChange();
                }
                else {
                    this.scaleX = scaleX;
                    this.scaleY = scaleY;
                }
            }
            return this;
        }
        skew(skewX, skewY) {
            this.skewX = skewX;
            this.skewY = skewY;
            return this;
        }
        render(ctx, x, y) {
            RenderSprite.renders[this._renderType]._fun(this, ctx, x + this._x, y + this._y);
            this._repaint = 0;
        }
        drawToCanvas(canvasWidth, canvasHeight, offsetX, offsetY) {
            return Sprite.drawToCanvas(this, this._renderType, canvasWidth, canvasHeight, offsetX, offsetY);
        }
        drawToTexture(canvasWidth, canvasHeight, offsetX, offsetY) {
            return Sprite.drawToTexture(this, this._renderType, canvasWidth, canvasHeight, offsetX, offsetY);
        }
        drawToTexture3D(offx, offy, tex) {
            throw 'not implement';
        }
        customRender(context, x, y) {
            this._repaint = SpriteConst.REPAINT_ALL;
        }
        _applyFilters() {
        }
        get filters() {
            return this._cacheStyle.filters;
        }
        _setColorFilter(value) { }
        set filters(value) {
            value && value.length === 0 && (value = null);
            if (this._cacheStyle.filters == value)
                return;
            this._getCacheStyle().filters = value ? value.slice() : null;
            if (value && value.length) {
                this._setColorFilter(value[0]);
                this._renderType |= SpriteConst.FILTERS;
            }
            else {
                this._setColorFilter(null);
                this._renderType &= ~SpriteConst.FILTERS;
            }
            this._setRenderType(this._renderType);
            if (value && value.length > 0) {
                if (!this._getBit(Const.DISPLAY))
                    this._setBitUp(Const.DISPLAY);
                if (!(value.length == 1 && (value[0] instanceof ColorFilter))) {
                    this._getCacheStyle().cacheForFilters = true;
                    this._checkCanvasEnable();
                }
            }
            else {
                if (this._cacheStyle.cacheForFilters) {
                    this._cacheStyle.cacheForFilters = false;
                    this._checkCanvasEnable();
                }
            }
            this._getCacheStyle().hasGlowFilter = this._isHaveGlowFilter();
            this.repaint();
        }
        _isHaveGlowFilter() {
            var i, len;
            if (this.filters) {
                for (i = 0; i < this.filters.length; i++) {
                    if (this.filters[i].type == Filter.GLOW) {
                        return true;
                    }
                }
            }
            for (i = 0, len = this._children.length; i < len; i++) {
                if (this._children[i]._isHaveGlowFilter()) {
                    return true;
                }
            }
            return false;
        }
        localToGlobal(point, createNewPoint = false, globalNode = null) {
            if (createNewPoint === true) {
                point = new Point(point.x, point.y);
            }
            var ele = this;
            globalNode = globalNode || ILaya.stage;
            while (ele && !ele.destroyed) {
                if (ele == globalNode)
                    break;
                point = ele.toParentPoint(point);
                ele = ele.parent;
            }
            return point;
        }
        globalToLocal(point, createNewPoint = false, globalNode = null) {
            if (createNewPoint) {
                point = new Point(point.x, point.y);
            }
            var ele = this;
            var list = [];
            globalNode = globalNode || ILaya.stage;
            while (ele && !ele.destroyed) {
                if (ele == globalNode)
                    break;
                list.push(ele);
                ele = ele.parent;
            }
            var i = list.length - 1;
            while (i >= 0) {
                ele = list[i];
                point = ele.fromParentPoint(point);
                i--;
            }
            return point;
        }
        toParentPoint(point) {
            if (!point)
                return point;
            point.x -= this.pivotX;
            point.y -= this.pivotY;
            if (this.transform) {
                this._transform.transformPoint(point);
            }
            point.x += this._x;
            point.y += this._y;
            var scroll = this._style.scrollRect;
            if (scroll) {
                point.x -= scroll.x;
                point.y -= scroll.y;
            }
            return point;
        }
        fromParentPoint(point) {
            if (!point)
                return point;
            point.x -= this._x;
            point.y -= this._y;
            var scroll = this._style.scrollRect;
            if (scroll) {
                point.x += scroll.x;
                point.y += scroll.y;
            }
            if (this.transform) {
                this._transform.invertTransformPoint(point);
            }
            point.x += this.pivotX;
            point.y += this.pivotY;
            return point;
        }
        fromStagePoint(point) {
            return point;
        }
        on(type, caller, listener, args = null) {
            if (this._mouseState !== 1 && this.isMouseEvent(type)) {
                this.mouseEnabled = true;
                this._setBit(Const.HAS_MOUSE, true);
                if (this._parent) {
                    this._onDisplay();
                }
                return this._createListener(type, caller, listener, args, false);
            }
            return super.on(type, caller, listener, args);
        }
        once(type, caller, listener, args = null) {
            if (this._mouseState !== 1 && this.isMouseEvent(type)) {
                this.mouseEnabled = true;
                this._setBit(Const.HAS_MOUSE, true);
                if (this._parent) {
                    this._onDisplay();
                }
                return this._createListener(type, caller, listener, args, true);
            }
            return super.once(type, caller, listener, args);
        }
        _onDisplay(v) {
            if (this._mouseState !== 1) {
                var ele = this;
                ele = ele.parent;
                while (ele && ele._mouseState !== 1) {
                    if (ele._getBit(Const.HAS_MOUSE))
                        break;
                    ele.mouseEnabled = true;
                    ele._setBit(Const.HAS_MOUSE, true);
                    ele = ele.parent;
                }
            }
        }
        _setParent(value) {
            super._setParent(value);
            if (value && this._getBit(Const.HAS_MOUSE)) {
                this._onDisplay();
            }
        }
        loadImage(url, complete = null) {
            if (!url) {
                this.texture = null;
                loaded.call(this);
            }
            else {
                var tex = ILaya.Loader.getRes(url);
                if (!tex) {
                    tex = new Texture();
                    tex.load(url);
                    ILaya.Loader.cacheRes(url, tex);
                }
                this.texture = tex;
                if (!tex.getIsReady())
                    tex.once(Event.READY, this, loaded);
                else
                    loaded.call(this);
            }
            function loaded() {
                this.repaint(SpriteConst.REPAINT_ALL);
                complete && complete.run();
            }
            return this;
        }
        static fromImage(url) {
            return new Sprite().loadImage(url);
        }
        repaint(type = SpriteConst.REPAINT_CACHE) {
            if (!(this._repaint & type)) {
                this._repaint |= type;
                this.parentRepaint(type);
            }
            if (this._cacheStyle && this._cacheStyle.maskParent) {
                this._cacheStyle.maskParent.repaint(type);
            }
        }
        _needRepaint() {
            return (this._repaint & SpriteConst.REPAINT_CACHE) && this._cacheStyle.enableCanvasRender && this._cacheStyle.reCache;
        }
        _childChanged(child = null) {
            if (this._children.length)
                this._renderType |= SpriteConst.CHILDS;
            else
                this._renderType &= ~SpriteConst.CHILDS;
            this._setRenderType(this._renderType);
            if (child && this._getBit(Const.HAS_ZORDER))
                ILaya.systemTimer.callLater(this, this.updateZOrder);
            this.repaint(SpriteConst.REPAINT_ALL);
        }
        parentRepaint(type = SpriteConst.REPAINT_CACHE) {
            var p = this._parent;
            if (p && !(p._repaint & type)) {
                p._repaint |= type;
                p.parentRepaint(type);
            }
        }
        get stage() {
            return ILaya.stage;
        }
        get hitArea() {
            return this._style.hitArea;
        }
        set hitArea(value) {
            this.getStyle().hitArea = value;
        }
        _setMask(value) {
        }
        get mask() {
            return this._cacheStyle.mask;
        }
        set mask(value) {
            if (value && this.mask && this.mask._cacheStyle.maskParent)
                return;
            this._getCacheStyle().mask = value;
            this._setMask(value);
            this._checkCanvasEnable();
            if (value) {
                value._getCacheStyle().maskParent = this;
            }
            else {
                if (this.mask) {
                    this.mask._getCacheStyle().maskParent = null;
                }
            }
            this._renderType |= SpriteConst.MASK;
            this._setRenderType(this._renderType);
            this.parentRepaint(SpriteConst.REPAINT_ALL);
        }
        get mouseEnabled() {
            return this._mouseState > 1;
        }
        set mouseEnabled(value) {
            this._mouseState = value ? 2 : 1;
        }
        startDrag(area = null, hasInertia = false, elasticDistance = 0, elasticBackTime = 300, data = null, disableMouseEvent = false, ratio = 0.92) {
            this._style.dragging || (this.getStyle().dragging = new ILaya.Dragging());
            this._style.dragging.start(this, area, hasInertia, elasticDistance, elasticBackTime, data, disableMouseEvent, ratio);
        }
        stopDrag() {
            this._style.dragging && this._style.dragging.stop();
        }
        _setDisplay(value) {
            if (!value) {
                if (this._cacheStyle) {
                    this._cacheStyle.releaseContext();
                    this._cacheStyle.releaseFilterCache();
                    if (this._cacheStyle.hasGlowFilter) {
                        this._cacheStyle.hasGlowFilter = false;
                    }
                }
            }
            super._setDisplay(value);
        }
        hitTestPoint(x, y) {
            var point = this.globalToLocal(Point.TEMP.setTo(x, y));
            x = point.x;
            y = point.y;
            var rect = this._style.hitArea ? this._style.hitArea : (this._width > 0 && this._height > 0) ? Rectangle.TEMP.setTo(0, 0, this._width, this._height) : this.getSelfBounds();
            return rect.contains(x, y);
        }
        getMousePoint() {
            return this.globalToLocal(Point.TEMP.setTo(ILaya.stage.mouseX, ILaya.stage.mouseY));
        }
        get globalScaleX() {
            var scale = 1;
            var ele = this;
            while (ele) {
                if (ele === ILaya.stage)
                    break;
                scale *= ele.scaleX;
                ele = ele.parent;
            }
            return scale;
        }
        get globalRotation() {
            var angle = 0;
            var ele = this;
            while (ele) {
                if (ele === ILaya.stage)
                    break;
                angle += ele.rotation;
                ele = ele.parent;
            }
            return angle;
        }
        get globalScaleY() {
            var scale = 1;
            var ele = this;
            while (ele) {
                if (ele === ILaya.stage)
                    break;
                scale *= ele.scaleY;
                ele = ele.parent;
            }
            return scale;
        }
        get mouseX() {
            return this.getMousePoint().x;
        }
        get mouseY() {
            return this.getMousePoint().y;
        }
        get zOrder() {
            return this._zOrder;
        }
        set zOrder(value) {
            if (this._zOrder != value) {
                this._zOrder = value;
                if (this._parent) {
                    value && this._parent._setBit(Const.HAS_ZORDER, true);
                    ILaya.systemTimer.callLater(this._parent, this.updateZOrder);
                }
            }
        }
        get texture() {
            return this._texture;
        }
        _setTexture(value) {
        }
        set texture(value) {
            if (typeof (value) == 'string') {
                this.loadImage(value);
            }
            else if (this._texture != value) {
                this._texture && this._texture._removeReference();
                this._texture = value;
                value && value._addReference();
                this._setTexture(value);
                this._setWidth(this._texture, this.width);
                this._setHeight(this._texture, this.height);
                if (value)
                    this._renderType |= SpriteConst.TEXTURE;
                else
                    this._renderType &= ~SpriteConst.TEXTURE;
                this._setRenderType(this._renderType);
                this.repaint();
            }
        }
        get viewport() {
            return this._style.viewport;
        }
        set viewport(value) {
            if (typeof (value) == 'string') {
                var recArr;
                recArr = value.split(",");
                if (recArr.length > 3) {
                    value = new Rectangle(parseFloat(recArr[0]), parseFloat(recArr[1]), parseFloat(recArr[2]), parseFloat(recArr[3]));
                }
            }
            this.getStyle().viewport = value;
        }
        _setRenderType(type) {
        }
        _setTranformChange() {
            this._tfChanged = true;
            this._renderType |= SpriteConst.TRANSFORM;
            this.parentRepaint(SpriteConst.REPAINT_CACHE);
        }
        _setBgStyleColor(x, y, width, height, fillColor) {
        }
        _setBorderStyleColor(x, y, width, height, fillColor, borderWidth) {
        }
        captureMouseEvent(exclusive) {
            ILaya.MouseManager.instance.setCapture(this, exclusive);
        }
        releaseMouseEvent() {
            ILaya.MouseManager.instance.releaseCapture();
        }
        set drawCallOptimize(value) {
            this._setBit(Const.DRAWCALL_OPTIMIZE, value);
        }
        get drawCallOptimize() {
            return this._getBit(Const.DRAWCALL_OPTIMIZE);
        }
    }
    Sprite.drawToCanvas = function (sprite, _renderType, canvasWidth, canvasHeight, offsetX, offsetY) {
        offsetX -= sprite.x;
        offsetY -= sprite.y;
        offsetX |= 0;
        offsetY |= 0;
        canvasWidth |= 0;
        canvasHeight |= 0;
        var ctx = new Context();
        ctx.size(canvasWidth, canvasHeight);
        ctx.asBitmap = true;
        ctx._targets.start();
        RenderSprite.renders[_renderType]._fun(sprite, ctx, offsetX, offsetY);
        ctx.flush();
        ctx._targets.end();
        ctx._targets.restore();
        var dt = ctx._targets.getData(0, 0, canvasWidth, canvasHeight);
        ctx.destroy();
        var imgdata = new ImageData(canvasWidth, canvasHeight);
        var lineLen = canvasWidth * 4;
        var dst = imgdata.data;
        var y = canvasHeight - 1;
        var off = y * lineLen;
        var srcoff = 0;
        for (; y >= 0; y--) {
            dst.set(dt.subarray(srcoff, srcoff + lineLen), off);
            off -= lineLen;
            srcoff += lineLen;
        }
        var canv = new HTMLCanvas(true);
        canv.size(canvasWidth, canvasHeight);
        var ctx2d = canv.getContext('2d');
        ctx2d.putImageData(imgdata, 0, 0);
        return canv;
    };
    Sprite.drawToTexture = function (sprite, _renderType, canvasWidth, canvasHeight, offsetX, offsetY) {
        offsetX -= sprite.x;
        offsetY -= sprite.y;
        offsetX |= 0;
        offsetY |= 0;
        canvasWidth |= 0;
        canvasHeight |= 0;
        var ctx = new Context();
        ctx.size(canvasWidth, canvasHeight);
        ctx.asBitmap = true;
        ctx._targets.start();
        RenderSprite.renders[_renderType]._fun(sprite, ctx, offsetX, offsetY);
        ctx.flush();
        ctx._targets.end();
        ctx._targets.restore();
        var rtex = new Texture(ctx._targets, Texture.INV_UV);
        ctx.destroy(true);
        return rtex;
    };
    ClassUtils.regClass("laya.display.Sprite", Sprite);
    ClassUtils.regClass("Laya.Sprite", Sprite);

    class TextStyle extends SpriteStyle {
        constructor() {
            super(...arguments);
            this.italic = false;
        }
        reset() {
            super.reset();
            this.italic = false;
            this.align = "left";
            this.wordWrap = false;
            this.leading = 0;
            this.padding = [0, 0, 0, 0];
            this.bgColor = null;
            this.borderColor = null;
            this.asPassword = false;
            this.stroke = 0;
            this.strokeColor = "#000000";
            this.bold = false;
            this.underline = false;
            this.underlineColor = null;
            this.currBitmapFont = null;
            return this;
        }
        recover() {
            if (this === TextStyle.EMPTY)
                return;
            Pool.recover("TextStyle", this.reset());
        }
        static create() {
            return Pool.getItemByClass("TextStyle", TextStyle);
        }
        render(sprite, context, x, y) {
            (this.bgColor || this.borderColor) && context.drawRect(x, y, sprite.width, sprite.height, this.bgColor, this.borderColor, 1);
        }
    }
    TextStyle.EMPTY = new TextStyle();

    class Text extends Sprite {
        constructor() {
            super();
            this._textWidth = 0;
            this._textHeight = 0;
            this._lines = [];
            this._lineWidths = [];
            this._startX = 0;
            this._startY = 0;
            this._charSize = {};
            this._valign = "top";
            this._fontSize = Text.defaultFontSize;
            this._font = Text.defaultFont;
            this._color = "#000000";
            this._singleCharRender = false;
            this.overflow = Text.VISIBLE;
            this._style = TextStyle.EMPTY;
        }
        static defaultFontStr() {
            return Text.defaultFontSize + "px " + Text.defaultFont;
        }
        getStyle() {
            this._style === TextStyle.EMPTY && (this._style = TextStyle.create());
            return this._style;
        }
        _getTextStyle() {
            if (this._style === TextStyle.EMPTY) {
                this._style = TextStyle.create();
            }
            return this._style;
        }
        static registerBitmapFont(name, bitmapFont) {
            Text._bitmapFonts || (Text._bitmapFonts = {});
            Text._bitmapFonts[name] = bitmapFont;
        }
        static unregisterBitmapFont(name, destroy = true) {
            if (Text._bitmapFonts && Text._bitmapFonts[name]) {
                var tBitmapFont = Text._bitmapFonts[name];
                if (destroy)
                    tBitmapFont.destroy();
                delete Text._bitmapFonts[name];
            }
        }
        destroy(destroyChild = true) {
            super.destroy(destroyChild);
            this._clipPoint = null;
            this._lines = null;
            this._lineWidths = null;
            this._words && this._words.forEach(function (w) {
                w.cleanCache();
            });
            this._words = null;
            this._charSize = null;
        }
        _getBoundPointsM(ifRotate = false) {
            var rec = Rectangle.TEMP;
            rec.setTo(0, 0, this.width, this.height);
            return rec._getBoundPoints();
        }
        getGraphicBounds(realSize = false) {
            var rec = Rectangle.TEMP;
            rec.setTo(0, 0, this.width, this.height);
            return rec;
        }
        get width() {
            if (this._width)
                return this._width;
            return this.textWidth + this.padding[1] + this.padding[3];
        }
        set width(value) {
            if (value != this._width) {
                super.set_width(value);
                this.isChanged = true;
                if (this.borderColor) {
                    this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
                }
            }
        }
        _getCSSStyle() {
            return this._style;
        }
        get height() {
            if (this._height)
                return this._height;
            return this.textHeight;
        }
        set height(value) {
            if (value != this._height) {
                super.set_height(value);
                this.isChanged = true;
                if (this.borderColor) {
                    this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
                }
            }
        }
        get textWidth() {
            this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
            return this._textWidth;
        }
        get textHeight() {
            this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
            return this._textHeight;
        }
        get text() {
            return this._text || "";
        }
        get_text() {
            return this._text || "";
        }
        set_text(value) {
            if (this._text !== value) {
                this.lang(value + "");
                this.isChanged = true;
                this.event(Event.CHANGE);
                if (this.borderColor) {
                    this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
                }
            }
        }
        set text(value) {
            this.set_text(value);
        }
        lang(text, arg1 = null, arg2 = null, arg3 = null, arg4 = null, arg5 = null, arg6 = null, arg7 = null, arg8 = null, arg9 = null, arg10 = null) {
            text = Text.langPacks && Text.langPacks[text] ? Text.langPacks[text] : text;
            if (arguments.length < 2) {
                this._text = text;
            }
            else {
                for (var i = 0, n = arguments.length; i < n; i++) {
                    text = text.replace("{" + i + "}", arguments[i + 1]);
                }
                this._text = text;
            }
        }
        get font() {
            return this._font;
        }
        set font(value) {
            if (this._style.currBitmapFont) {
                this._getTextStyle().currBitmapFont = null;
                this.scale(1, 1);
            }
            if (Text._bitmapFonts && Text._bitmapFonts[value]) {
                this._getTextStyle().currBitmapFont = Text._bitmapFonts[value];
            }
            this._font = value;
            this.isChanged = true;
        }
        get fontSize() {
            return this._fontSize;
        }
        set fontSize(value) {
            if (this._fontSize != value) {
                this._fontSize = value;
                this.isChanged = true;
            }
        }
        get bold() {
            return this._style.bold;
        }
        set bold(value) {
            this._getTextStyle().bold = value;
            this.isChanged = true;
        }
        get color() {
            return this._color;
        }
        set color(value) {
            this.set_color(value);
        }
        get_color() {
            return this._color;
        }
        set_color(value) {
            if (this._color != value) {
                this._color = value;
                if (!this._isChanged && this._graphics) {
                    this._graphics.replaceTextColor(this.color);
                }
                else {
                    this.isChanged = true;
                }
            }
        }
        get italic() {
            return this._style.italic;
        }
        set italic(value) {
            this._getTextStyle().italic = value;
            this.isChanged = true;
        }
        get align() {
            return this._style.align;
        }
        set align(value) {
            this._getTextStyle().align = value;
            this.isChanged = true;
        }
        get valign() {
            return this._valign;
        }
        set valign(value) {
            this._valign = value;
            this.isChanged = true;
        }
        get wordWrap() {
            return this._style.wordWrap;
        }
        set wordWrap(value) {
            this._getTextStyle().wordWrap = value;
            this.isChanged = true;
        }
        get leading() {
            return this._style.leading;
        }
        set leading(value) {
            this._getTextStyle().leading = value;
            this.isChanged = true;
        }
        get padding() {
            return this._style.padding;
        }
        set padding(value) {
            if (typeof (value) == 'string') {
                var arr;
                arr = value.split(",");
                var i, len;
                len = arr.length;
                while (arr.length < 4) {
                    arr.push(0);
                }
                for (i = 0; i < len; i++) {
                    arr[i] = parseFloat(arr[i]) || 0;
                }
                value = arr;
            }
            this._getTextStyle().padding = value;
            this.isChanged = true;
        }
        get bgColor() {
            return this._style.bgColor;
        }
        set bgColor(value) {
            this.set_bgColor(value);
        }
        set_bgColor(value) {
            this._getTextStyle().bgColor = value;
            this._renderType |= SpriteConst.STYLE;
            this._setBgStyleColor(0, 0, this.width, this.height, value);
            this._setRenderType(this._renderType);
            this.isChanged = true;
        }
        get_bgColor() {
            return this._style.bgColor;
        }
        get borderColor() {
            return this._style.borderColor;
        }
        set borderColor(value) {
            this._getTextStyle().borderColor = value;
            this._renderType |= SpriteConst.STYLE;
            this._setBorderStyleColor(0, 0, this.width, this.height, value, 1);
            this._setRenderType(this._renderType);
            this.isChanged = true;
        }
        get stroke() {
            return this._style.stroke;
        }
        set stroke(value) {
            this._getTextStyle().stroke = value;
            this.isChanged = true;
        }
        get strokeColor() {
            return this._style.strokeColor;
        }
        set strokeColor(value) {
            this._getTextStyle().strokeColor = value;
            this.isChanged = true;
        }
        set isChanged(value) {
            if (this._isChanged !== value) {
                this._isChanged = value;
                value && ILaya.systemTimer.callLater(this, this.typeset);
            }
        }
        _getContextFont() {
            return (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + (ILaya.Browser.onIPhone ? (Text.fontFamilyMap[this.font] || this.font) : this.font);
        }
        _isPassWordMode() {
            var style = this._style;
            var password = style.asPassword;
            if (("prompt" in this) && this['prompt'] == this._text)
                password = false;
            return password;
        }
        _getPassWordTxt(txt) {
            var len = txt.length;
            var word;
            word = "";
            for (var j = len; j > 0; j--) {
                word += "●";
            }
            return word;
        }
        _renderText() {
            var padding = this.padding;
            var visibleLineCount = this._lines.length;
            if (this.overflow != Text.VISIBLE) {
                visibleLineCount = Math.min(visibleLineCount, Math.floor((this.height - padding[0] - padding[2]) / (this.leading + this._charSize.height)) + 1);
            }
            var beginLine = this.scrollY / (this._charSize.height + this.leading) | 0;
            var graphics = this.graphics;
            graphics.clear(true);
            var ctxFont = this._getContextFont();
            ILaya.Browser.context.font = ctxFont;
            var startX = padding[3];
            var textAlgin = "left";
            var lines = this._lines;
            var lineHeight = this.leading + this._charSize.height;
            var tCurrBitmapFont = this._style.currBitmapFont;
            if (tCurrBitmapFont) {
                lineHeight = this.leading + tCurrBitmapFont.getMaxHeight();
            }
            var startY = padding[0];
            if ((!tCurrBitmapFont) && this._width > 0 && this._textWidth <= this._width) {
                if (this.align == "right") {
                    textAlgin = "right";
                    startX = this._width - padding[1];
                }
                else if (this.align == "center") {
                    textAlgin = "center";
                    startX = this._width * 0.5 + padding[3] - padding[1];
                }
            }
            if (this._height > 0) {
                var tempVAlign = (this._textHeight > this._height) ? "top" : this.valign;
                if (tempVAlign === "middle")
                    startY = (this._height - visibleLineCount * lineHeight) * 0.5 + padding[0] - padding[2];
                else if (tempVAlign === "bottom")
                    startY = this._height - visibleLineCount * lineHeight - padding[2];
            }
            var style = this._style;
            if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
                var bitmapScale = tCurrBitmapFont.fontSize / this.fontSize;
            }
            if (this._clipPoint) {
                graphics.save();
                if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
                    var tClipWidth;
                    var tClipHeight;
                    this._width ? tClipWidth = (this._width - padding[3] - padding[1]) : tClipWidth = this._textWidth;
                    this._height ? tClipHeight = (this._height - padding[0] - padding[2]) : tClipHeight = this._textHeight;
                    tClipWidth *= bitmapScale;
                    tClipHeight *= bitmapScale;
                    graphics.clipRect(padding[3], padding[0], tClipWidth, tClipHeight);
                }
                else {
                    graphics.clipRect(padding[3], padding[0], this._width ? (this._width - padding[3] - padding[1]) : this._textWidth, this._height ? (this._height - padding[0] - padding[2]) : this._textHeight);
                }
                this.repaint();
            }
            var password = style.asPassword;
            if (("prompt" in this) && this['prompt'] == this._text)
                password = false;
            var x = 0, y = 0;
            var end = Math.min(this._lines.length, visibleLineCount + beginLine) || 1;
            for (var i = beginLine; i < end; i++) {
                var word = lines[i];
                var _word;
                if (password) {
                    var len = word.length;
                    word = "";
                    for (var j = len; j > 0; j--) {
                        word += "●";
                    }
                }
                if (word == null)
                    word = "";
                x = startX - (this._clipPoint ? this._clipPoint.x : 0);
                y = startY + lineHeight * i - (this._clipPoint ? this._clipPoint.y : 0);
                this.underline && this._drawUnderline(textAlgin, x, y, i);
                if (tCurrBitmapFont) {
                    var tWidth = this.width;
                    if (tCurrBitmapFont.autoScaleSize) {
                        tWidth = this.width * bitmapScale;
                    }
                    tCurrBitmapFont._drawText(word, this, x, y, this.align, tWidth);
                }
                else {
                    this._words || (this._words = []);
                    if (this._words.length > (i - beginLine)) {
                        _word = this._words[i - beginLine];
                    }
                    else {
                        _word = new WordText();
                        this._words.push(_word);
                    }
                    _word.setText(word);
                    _word.splitRender = this._singleCharRender;
                    style.stroke ? graphics.fillBorderText(_word, x, y, ctxFont, this.color, style.strokeColor, style.stroke, textAlgin) : graphics.fillText(_word, x, y, ctxFont, this.color, textAlgin);
                }
            }
            if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
                var tScale = 1 / bitmapScale;
                this.scale(tScale, tScale);
            }
            if (this._clipPoint)
                graphics.restore();
            this._startX = startX;
            this._startY = startY;
        }
        _drawUnderline(align, x, y, lineIndex) {
            var lineWidth = this._lineWidths[lineIndex];
            switch (align) {
                case 'center':
                    x -= lineWidth / 2;
                    break;
                case 'right':
                    x -= lineWidth;
                    break;
                case 'left':
                default:
                    break;
            }
            y += this._charSize.height;
            this._graphics.drawLine(x, y, x + lineWidth, y, this.underlineColor || this.color, 1);
        }
        typeset() {
            this._isChanged = false;
            if (!this._text) {
                this._clipPoint = null;
                this._textWidth = this._textHeight = 0;
                this.graphics.clear(true);
                return;
            }
            if (ILaya.Render.isConchApp) {
                window.conchTextCanvas.font = this._getContextFont();
            }
            else {
                ILaya.Browser.context.font = this._getContextFont();
            }
            this._lines.length = 0;
            this._lineWidths.length = 0;
            if (this._isPassWordMode()) {
                this._parseLines(this._getPassWordTxt(this._text));
            }
            else
                this._parseLines(this._text);
            this._evalTextSize();
            if (this._checkEnabledViewportOrNot())
                this._clipPoint || (this._clipPoint = new Point(0, 0));
            else
                this._clipPoint = null;
            this._renderText();
        }
        _evalTextSize() {
            var nw, nh;
            nw = Math.max.apply(this, this._lineWidths);
            if (this._style.currBitmapFont)
                nh = this._lines.length * (this._style.currBitmapFont.getMaxHeight() + this.leading) + this.padding[0] + this.padding[2];
            else
                nh = this._lines.length * (this._charSize.height + this.leading) + this.padding[0] + this.padding[2];
            if (nw != this._textWidth || nh != this._textHeight) {
                this._textWidth = nw;
                this._textHeight = nh;
            }
        }
        _checkEnabledViewportOrNot() {
            return this.overflow == Text.SCROLL && ((this._width > 0 && this._textWidth > this._width) || (this._height > 0 && this._textHeight > this._height));
        }
        changeText(text) {
            if (this._text !== text) {
                this.lang(text + "");
                if (this._graphics && this._graphics.replaceText(this._text)) ;
                else {
                    this.typeset();
                }
            }
        }
        _parseLines(text) {
            var needWordWrapOrTruncate = this.wordWrap || this.overflow == Text.HIDDEN;
            if (needWordWrapOrTruncate) {
                var wordWrapWidth = this._getWordWrapWidth();
            }
            var bitmapFont = this._style.currBitmapFont;
            if (bitmapFont) {
                this._charSize.width = bitmapFont.getMaxWidth();
                this._charSize.height = bitmapFont.getMaxHeight();
            }
            else {
                var measureResult = null;
                if (ILaya.Render.isConchApp) {
                    measureResult = window.conchTextCanvas.measureText(Text._testWord);
                }
                else {
                    measureResult = ILaya.Browser.context.measureText(Text._testWord);
                }
                if (!measureResult)
                    measureResult = { width: 100 };
                this._charSize.width = measureResult.width;
                this._charSize.height = (measureResult.height || this.fontSize);
            }
            var lines = text.replace(/\r\n/g, "\n").split("\n");
            for (var i = 0, n = lines.length; i < n; i++) {
                var line = lines[i];
                if (needWordWrapOrTruncate)
                    this._parseLine(line, wordWrapWidth);
                else {
                    this._lineWidths.push(this._getTextWidth(line));
                    this._lines.push(line);
                }
            }
        }
        _parseLine(line, wordWrapWidth) {
            var lines = this._lines;
            var maybeIndex = 0;
            var charsWidth = 0;
            var wordWidth = 0;
            var startIndex = 0;
            charsWidth = this._getTextWidth(line);
            if (charsWidth <= wordWrapWidth) {
                lines.push(line);
                this._lineWidths.push(charsWidth);
                return;
            }
            charsWidth = this._charSize.width;
            maybeIndex = Math.floor(wordWrapWidth / charsWidth);
            (maybeIndex == 0) && (maybeIndex = 1);
            charsWidth = this._getTextWidth(line.substring(0, maybeIndex));
            wordWidth = charsWidth;
            for (var j = maybeIndex, m = line.length; j < m; j++) {
                charsWidth = this._getTextWidth(line.charAt(j));
                wordWidth += charsWidth;
                if (wordWidth > wordWrapWidth) {
                    if (this.wordWrap) {
                        var newLine = line.substring(startIndex, j);
                        if (newLine.charCodeAt(newLine.length - 1) < 255) {
                            var execResult = /(?:\w|-)+$/.exec(newLine);
                            if (execResult) {
                                j = execResult.index + startIndex;
                                if (execResult.index == 0)
                                    j += newLine.length;
                                else
                                    newLine = line.substring(startIndex, j);
                            }
                        }
                        lines.push(newLine);
                        this._lineWidths.push(wordWidth - charsWidth);
                        startIndex = j;
                        if (j + maybeIndex < m) {
                            j += maybeIndex;
                            charsWidth = this._getTextWidth(line.substring(startIndex, j));
                            wordWidth = charsWidth;
                            j--;
                        }
                        else {
                            lines.push(line.substring(startIndex, m));
                            this._lineWidths.push(this._getTextWidth(lines[lines.length - 1]));
                            startIndex = -1;
                            break;
                        }
                    }
                    else if (this.overflow == Text.HIDDEN) {
                        lines.push(line.substring(0, j));
                        this._lineWidths.push(this._getTextWidth(lines[lines.length - 1]));
                        return;
                    }
                }
            }
            if (this.wordWrap && startIndex != -1) {
                lines.push(line.substring(startIndex, m));
                this._lineWidths.push(this._getTextWidth(lines[lines.length - 1]));
            }
        }
        _getTextWidth(text) {
            var bitmapFont = this._style.currBitmapFont;
            if (bitmapFont)
                return bitmapFont.getTextWidth(text);
            else {
                if (ILaya.Render.isConchApp) {
                    return window.conchTextCanvas.measureText(text).width;
                }
                else
                    return ILaya.Browser.context.measureText(text).width;
            }
        }
        _getWordWrapWidth() {
            var p = this.padding;
            var w;
            var bitmapFont = this._style.currBitmapFont;
            if (bitmapFont && bitmapFont.autoScaleSize)
                w = this._width * (bitmapFont.fontSize / this.fontSize);
            else
                w = this._width;
            if (w <= 0) {
                w = this.wordWrap ? 100 : ILaya.Browser.width;
            }
            w <= 0 && (w = 100);
            return w - p[3] - p[1];
        }
        getCharPoint(charIndex, out = null) {
            this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
            var len = 0, lines = this._lines, startIndex = 0;
            for (var i = 0, n = lines.length; i < n; i++) {
                len += lines[i].length;
                if (charIndex < len) {
                    var line = i;
                    break;
                }
                startIndex = len;
            }
            var ctxFont = (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + this.font;
            ILaya.Browser.context.font = ctxFont;
            var width = this._getTextWidth(this._text.substring(startIndex, charIndex));
            var point = out || new Point();
            return point.setTo(this._startX + width - (this._clipPoint ? this._clipPoint.x : 0), this._startY + line * (this._charSize.height + this.leading) - (this._clipPoint ? this._clipPoint.y : 0));
        }
        set scrollX(value) {
            if (this.overflow != Text.SCROLL || (this.textWidth < this._width || !this._clipPoint))
                return;
            value = value < this.padding[3] ? this.padding[3] : value;
            var maxScrollX = this._textWidth - this._width;
            value = value > maxScrollX ? maxScrollX : value;
            this._clipPoint.x = value;
            this._renderText();
        }
        get scrollX() {
            if (!this._clipPoint)
                return 0;
            return this._clipPoint.x;
        }
        set scrollY(value) {
            if (this.overflow != Text.SCROLL || (this.textHeight < this._height || !this._clipPoint))
                return;
            value = value < this.padding[0] ? this.padding[0] : value;
            var maxScrollY = this._textHeight - this._height;
            value = value > maxScrollY ? maxScrollY : value;
            this._clipPoint.y = value;
            this._renderText();
        }
        get scrollY() {
            if (!this._clipPoint)
                return 0;
            return this._clipPoint.y;
        }
        get maxScrollX() {
            return (this.textWidth < this._width) ? 0 : this._textWidth - this._width;
        }
        get maxScrollY() {
            return (this.textHeight < this._height) ? 0 : this._textHeight - this._height;
        }
        get lines() {
            if (this._isChanged)
                this.typeset();
            return this._lines;
        }
        get underlineColor() {
            return this._style.underlineColor;
        }
        set underlineColor(value) {
            this._getTextStyle().underlineColor = value;
            if (!this._isChanged)
                this._renderText();
        }
        get underline() {
            return this._style.underline;
        }
        set underline(value) {
            this._getTextStyle().underline = value;
        }
        set singleCharRender(value) {
            this._singleCharRender = value;
        }
        get singleCharRender() {
            return this._singleCharRender;
        }
    }
    Text.VISIBLE = "visible";
    Text.SCROLL = "scroll";
    Text.HIDDEN = "hidden";
    Text.defaultFontSize = 12;
    Text.defaultFont = "Arial";
    Text.isComplexText = false;
    Text.fontFamilyMap = { "报隶": "报隶-简", "黑体": "黑体-简", "楷体": "楷体-简", "兰亭黑": "兰亭黑-简", "隶变": "隶变-简", "凌慧体": "凌慧体-简", "翩翩体": "翩翩体-简", "苹方": "苹方-简", "手札体": "手札体-简", "宋体": "宋体-简", "娃娃体": "娃娃体-简", "魏碑": "魏碑-简", "行楷": "行楷-简", "雅痞": "雅痞-简", "圆体": "圆体-简" };
    Text._testWord = "游";
    Text.CharacterCache = true;
    Text.RightToLeft = false;
    ILaya.regClass(Text);
    ClassUtils.regClass("laya.display.Text", Text);
    ClassUtils.regClass("Laya.Text", Text);

    class Input extends Text {
        constructor() {
            super();
            this._multiline = false;
            this._editable = true;
            this._maxChars = 1E5;
            this._type = "text";
            this._prompt = '';
            this._promptColor = "#A9A9A9";
            this._originColor = "#000000";
            this._content = '';
            Input.IOS_IFRAME = (ILaya.Browser.onIOS && ILaya.Browser.window.top != ILaya.Browser.window.self);
            this._width = 100;
            this._height = 20;
            this.multiline = false;
            this.overflow = Text.SCROLL;
            this.on(Event.MOUSE_DOWN, this, this._onMouseDown);
            this.on(Event.UNDISPLAY, this, this._onUnDisplay);
        }
        static __init__() {
            Input._createInputElement();
            if (ILaya.Browser.onMobile) {
                var isTrue = false;
                if (ILaya.Browser.onMiniGame || ILaya.Browser.onBDMiniGame || ILaya.Browser.onQGMiniGame || ILaya.Browser.onKGMiniGame || ILaya.Browser.onVVMiniGame || ILaya.Browser.onAlipayMiniGame || ILaya.Browser.onQQMiniGame) {
                    isTrue = true;
                }
                ILaya.Render.canvas.addEventListener(Input.IOS_IFRAME ? (isTrue ? "touchend" : "click") : "touchend", Input._popupInputMethod);
            }
        }
        static _popupInputMethod(e) {
            if (!Input.isInputting)
                return;
            var input = Input.inputElement;
            input.focus();
        }
        static _createInputElement() {
            Input._initInput(Input.area = ILaya.Browser.createElement("textarea"));
            Input._initInput(Input.input = ILaya.Browser.createElement("input"));
            Input.inputContainer = ILaya.Browser.createElement("div");
            Input.inputContainer.style.position = "absolute";
            Input.inputContainer.style.zIndex = 1E5;
            ILaya.Browser.container.appendChild(Input.inputContainer);
            Input.inputContainer.setPos = function (x, y) {
                Input.inputContainer.style.left = x + 'px';
                Input.inputContainer.style.top = y + 'px';
            };
        }
        static _initInput(input) {
            var style = input.style;
            style.cssText = "position:absolute;overflow:hidden;resize:none;transform-origin:0 0;-webkit-transform-origin:0 0;-moz-transform-origin:0 0;-o-transform-origin:0 0;";
            style.resize = 'none';
            style.backgroundColor = 'transparent';
            style.border = 'none';
            style.outline = 'none';
            style.zIndex = 1;
            input.addEventListener('input', Input._processInputting);
            input.addEventListener('mousemove', Input._stopEvent);
            input.addEventListener('mousedown', Input._stopEvent);
            input.addEventListener('touchmove', Input._stopEvent);
            input.setFontFace = function (fontFace) { input.style.fontFamily = fontFace; };
            if (!ILaya.Render.isConchApp) {
                input.setColor = function (color) { input.style.color = color; };
                input.setFontSize = function (fontSize) { input.style.fontSize = fontSize + 'px'; };
            }
        }
        static _processInputting(e) {
            var input = Input.inputElement.target;
            if (!input)
                return;
            var value = Input.inputElement.value;
            if (input._restrictPattern) {
                value = value.replace(/\u2006|\x27/g, "");
                if (input._restrictPattern.test(value)) {
                    value = value.replace(input._restrictPattern, "");
                    Input.inputElement.value = value;
                }
            }
            input._text = value;
            input.event(Event.INPUT);
        }
        static _stopEvent(e) {
            if (e.type == 'touchmove')
                e.preventDefault();
            e.stopPropagation && e.stopPropagation();
        }
        setSelection(startIndex, endIndex) {
            this.focus = true;
            Input.inputElement.selectionStart = startIndex;
            Input.inputElement.selectionEnd = endIndex;
        }
        get multiline() {
            return this._multiline;
        }
        set multiline(value) {
            this._multiline = value;
            this.valign = value ? "top" : "middle";
        }
        get nativeInput() {
            return this._multiline ? Input.area : Input.input;
        }
        _onUnDisplay(e = null) {
            this.focus = false;
        }
        _onMouseDown(e) {
            this.focus = true;
        }
        _syncInputTransform() {
            var inputElement = this.nativeInput;
            var transform = Utils.getTransformRelativeToWindow(this, this.padding[3], this.padding[0]);
            var inputWid = this._width - this.padding[1] - this.padding[3];
            var inputHei = this._height - this.padding[0] - this.padding[2];
            if (ILaya.Render.isConchApp) {
                inputElement.setScale(transform.scaleX, transform.scaleY);
                inputElement.setSize(inputWid, inputHei);
                inputElement.setPos(transform.x, transform.y);
            }
            else {
                Input.inputContainer.style.transform = Input.inputContainer.style.webkitTransform = "scale(" + transform.scaleX + "," + transform.scaleY + ") rotate(" + (ILaya.stage.canvasDegree) + "deg)";
                inputElement.style.width = inputWid + 'px';
                inputElement.style.height = inputHei + 'px';
                Input.inputContainer.style.left = transform.x + 'px';
                Input.inputContainer.style.top = transform.y + 'px';
            }
        }
        select() {
            this.nativeInput.select();
        }
        get focus() {
            return this._focus;
        }
        set focus(value) {
            var input = this.nativeInput;
            if (this._focus !== value) {
                if (value) {
                    if (input.target) {
                        input.target._focusOut();
                    }
                    else {
                        this._setInputMethod();
                    }
                    input.target = this;
                    this._focusIn();
                }
                else {
                    input.target = null;
                    this._focusOut();
                    ILaya.Browser.document.body.scrollTop = 0;
                    input.blur();
                    if (ILaya.Render.isConchApp)
                        input.setPos(-10000, -10000);
                    else if (Input.inputContainer.contains(input))
                        Input.inputContainer.removeChild(input);
                }
            }
        }
        _setInputMethod() {
            Input.input.parentElement && (Input.inputContainer.removeChild(Input.input));
            Input.area.parentElement && (Input.inputContainer.removeChild(Input.area));
            Input.inputElement = (this._multiline ? Input.area : Input.input);
            Input.inputContainer.appendChild(Input.inputElement);
            if (Text.RightToLeft) {
                Input.inputElement.style.direction = "rtl";
            }
        }
        _focusIn() {
            Input.isInputting = true;
            var input = this.nativeInput;
            this._focus = true;
            var cssStyle = input.style;
            cssStyle.whiteSpace = (this.wordWrap ? "pre-wrap" : "nowrap");
            this._setPromptColor();
            input.readOnly = !this._editable;
            if (ILaya.Render.isConchApp) {
                input.setType(this._type);
                input.setForbidEdit(!this._editable);
            }
            input.maxLength = this._maxChars;
            var padding = this.padding;
            input.value = this._content;
            input.placeholder = this._prompt;
            ILaya.stage.off(Event.KEY_DOWN, this, this._onKeyDown);
            ILaya.stage.on(Event.KEY_DOWN, this, this._onKeyDown);
            ILaya.stage.focus = this;
            this.event(Event.FOCUS);
            if (ILaya.Browser.onPC)
                input.focus();
            if (!ILaya.Browser.onMiniGame && !ILaya.Browser.onBDMiniGame && !ILaya.Browser.onQGMiniGame && !ILaya.Browser.onKGMiniGame && !ILaya.Browser.onVVMiniGame && !ILaya.Browser.onAlipayMiniGame && !ILaya.Browser.onQQMiniGame) {
                var temp = this._text;
                this._text = null;
            }
            this.typeset();
            input.setColor(this._originColor);
            input.setFontSize(this.fontSize);
            input.setFontFace(ILaya.Browser.onIPhone ? (Text.fontFamilyMap[this.font] || this.font) : this.font);
            if (ILaya.Render.isConchApp) {
                input.setMultiAble && input.setMultiAble(this._multiline);
            }
            cssStyle.lineHeight = (this.leading + this.fontSize) + "px";
            cssStyle.fontStyle = (this.italic ? "italic" : "normal");
            cssStyle.fontWeight = (this.bold ? "bold" : "normal");
            cssStyle.textAlign = this.align;
            cssStyle.padding = "0 0";
            this._syncInputTransform();
            if (!ILaya.Render.isConchApp && ILaya.Browser.onPC)
                ILaya.systemTimer.frameLoop(1, this, this._syncInputTransform);
        }
        _setPromptColor() {
            Input.promptStyleDOM = ILaya.Browser.getElementById("promptStyle");
            if (!Input.promptStyleDOM) {
                Input.promptStyleDOM = ILaya.Browser.createElement("style");
                Input.promptStyleDOM.setAttribute("id", "promptStyle");
                ILaya.Browser.document.head.appendChild(Input.promptStyleDOM);
            }
            Input.promptStyleDOM.innerText = "input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {" + "color:" + this._promptColor + "}" + "input:-moz-placeholder, textarea:-moz-placeholder {" + "color:" + this._promptColor + "}" + "input::-moz-placeholder, textarea::-moz-placeholder {" + "color:" + this._promptColor + "}" + "input:-ms-input-placeholder, textarea:-ms-input-placeholder {" + "color:" + this._promptColor + "}";
        }
        _focusOut() {
            Input.isInputting = false;
            this._focus = false;
            this._text = null;
            this._content = this.nativeInput.value;
            if (!this._content) {
                super.set_text(this._prompt);
                super.set_color(this._promptColor);
            }
            else {
                super.set_text(this._content);
                super.set_color(this._originColor);
            }
            ILaya.stage.off(Event.KEY_DOWN, this, this._onKeyDown);
            ILaya.stage.focus = null;
            this.event(Event.BLUR);
            this.event(Event.CHANGE);
            if (ILaya.Render.isConchApp)
                this.nativeInput.blur();
            ILaya.Browser.onPC && ILaya.systemTimer.clear(this, this._syncInputTransform);
        }
        _onKeyDown(e) {
            if (e.keyCode === 13) {
                if (ILaya.Browser.onMobile && !this._multiline)
                    this.focus = false;
                this.event(Event.ENTER);
            }
        }
        set text(value) {
            super.set_color(this._originColor);
            value += '';
            if (this._focus) {
                this.nativeInput.value = value || '';
                this.event(Event.CHANGE);
            }
            else {
                if (!this._multiline)
                    value = value.replace(/\r?\n/g, '');
                this._content = value;
                if (value)
                    super.set_text(value);
                else {
                    super.set_text(this._prompt);
                    super.set_color(this.promptColor);
                }
            }
        }
        get text() {
            if (this._focus)
                return this.nativeInput.value;
            else
                return this._content || "";
        }
        changeText(text) {
            this._content = text;
            if (this._focus) {
                this.nativeInput.value = text || '';
                this.event(Event.CHANGE);
            }
            else
                super.changeText(text);
        }
        set color(value) {
            if (this._focus)
                this.nativeInput.setColor(value);
            super.set_color(this._content ? value : this._promptColor);
            this._originColor = value;
        }
        get color() {
            return super.color;
        }
        set bgColor(value) {
            super.set_bgColor(value);
            if (ILaya.Render.isConchApp)
                this.nativeInput.setBgColor(value);
        }
        get bgColor() {
            return super.bgColor;
        }
        get restrict() {
            if (this._restrictPattern) {
                return this._restrictPattern.source;
            }
            return "";
        }
        set restrict(pattern) {
            if (pattern) {
                pattern = "[^" + pattern + "]";
                if (pattern.indexOf("^^") > -1)
                    pattern = pattern.replace("^^", "");
                this._restrictPattern = new RegExp(pattern, "g");
            }
            else
                this._restrictPattern = null;
        }
        set editable(value) {
            this._editable = value;
            if (ILaya.Render.isConchApp) {
                Input.input.setForbidEdit(!value);
            }
        }
        get editable() {
            return this._editable;
        }
        get maxChars() {
            return this._maxChars;
        }
        set maxChars(value) {
            if (value <= 0)
                value = 1E5;
            this._maxChars = value;
        }
        get prompt() {
            return this._prompt;
        }
        set prompt(value) {
            if (!this._text && value)
                super.set_color(this._promptColor);
            this.promptColor = this._promptColor;
            if (this._text)
                super.set_text((this._text == this._prompt) ? value : this._text);
            else
                super.set_text(value);
            this._prompt = Text.langPacks && Text.langPacks[value] ? Text.langPacks[value] : value;
        }
        get promptColor() {
            return this._promptColor;
        }
        set promptColor(value) {
            this._promptColor = value;
            if (!this._content)
                super.set_color(value);
        }
        get type() {
            return this._type;
        }
        set type(value) {
            if (value === "password")
                this._getTextStyle().asPassword = true;
            else
                this._getTextStyle().asPassword = false;
            this._type = value;
        }
    }
    Input.TYPE_TEXT = "text";
    Input.TYPE_PASSWORD = "password";
    Input.TYPE_EMAIL = "email";
    Input.TYPE_URL = "url";
    Input.TYPE_NUMBER = "number";
    Input.TYPE_RANGE = "range";
    Input.TYPE_DATE = "date";
    Input.TYPE_MONTH = "month";
    Input.TYPE_WEEK = "week";
    Input.TYPE_TIME = "time";
    Input.TYPE_DATE_TIME = "datetime";
    Input.TYPE_DATE_TIME_LOCAL = "datetime-local";
    Input.TYPE_SEARCH = "search";
    Input.IOS_IFRAME = false;
    Input.inputHeight = 45;
    Input.isInputting = false;
    ClassUtils.regClass("laya.display.Input", Input);
    ClassUtils.regClass("Laya.Input", Input);

    class TouchManager {
        constructor() {
            this.preOvers = [];
            this.preDowns = [];
            this.preRightDowns = [];
            this.enable = true;
            this._event = new Event();
            this._lastClickTime = 0;
        }
        _clearTempArrs() {
            TouchManager._oldArr.length = 0;
            TouchManager._newArr.length = 0;
            TouchManager._tEleArr.length = 0;
        }
        getTouchFromArr(touchID, arr) {
            var i, len;
            len = arr.length;
            var tTouchO;
            for (i = 0; i < len; i++) {
                tTouchO = arr[i];
                if (tTouchO.id == touchID) {
                    return tTouchO;
                }
            }
            return null;
        }
        removeTouchFromArr(touchID, arr) {
            var i;
            for (i = arr.length - 1; i >= 0; i--) {
                if (arr[i].id == touchID) {
                    arr.splice(i, 1);
                }
            }
        }
        createTouchO(ele, touchID) {
            var rst;
            rst = Pool.getItem("TouchData") || {};
            rst.id = touchID;
            rst.tar = ele;
            return rst;
        }
        onMouseDown(ele, touchID, isLeft = false) {
            if (!this.enable)
                return;
            var preO;
            var tO;
            var arrs;
            preO = this.getTouchFromArr(touchID, this.preOvers);
            arrs = this.getEles(ele, null, TouchManager._tEleArr);
            if (!preO) {
                tO = this.createTouchO(ele, touchID);
                this.preOvers.push(tO);
            }
            else {
                preO.tar = ele;
            }
            if (Browser.onMobile)
                this.sendEvents(arrs, Event.MOUSE_OVER);
            var preDowns;
            preDowns = isLeft ? this.preDowns : this.preRightDowns;
            preO = this.getTouchFromArr(touchID, preDowns);
            if (!preO) {
                tO = this.createTouchO(ele, touchID);
                preDowns.push(tO);
            }
            else {
                preO.tar = ele;
            }
            this.sendEvents(arrs, isLeft ? Event.MOUSE_DOWN : Event.RIGHT_MOUSE_DOWN);
            this._clearTempArrs();
        }
        sendEvents(eles, type) {
            var i, len;
            len = eles.length;
            this._event._stoped = false;
            var _target;
            _target = eles[0];
            for (i = 0; i < len; i++) {
                var tE = eles[i];
                if (tE.destroyed)
                    return;
                tE.event(type, this._event.setTo(type, tE, _target));
                if (this._event._stoped)
                    break;
            }
        }
        getEles(start, end = null, rst = null) {
            if (!rst) {
                rst = [];
            }
            else {
                rst.length = 0;
            }
            while (start && start != end) {
                rst.push(start);
                start = start.parent;
            }
            return rst;
        }
        checkMouseOutAndOverOfMove(eleNew, elePre, touchID = 0) {
            if (elePre == eleNew)
                return;
            var tar;
            var arrs;
            var i, len;
            if (elePre.contains(eleNew)) {
                arrs = this.getEles(eleNew, elePre, TouchManager._tEleArr);
                this.sendEvents(arrs, Event.MOUSE_OVER);
            }
            else if (eleNew.contains(elePre)) {
                arrs = this.getEles(elePre, eleNew, TouchManager._tEleArr);
                this.sendEvents(arrs, Event.MOUSE_OUT);
            }
            else {
                arrs = TouchManager._tEleArr;
                arrs.length = 0;
                var oldArr;
                oldArr = this.getEles(elePre, null, TouchManager._oldArr);
                var newArr;
                newArr = this.getEles(eleNew, null, TouchManager._newArr);
                len = oldArr.length;
                var tIndex;
                for (i = 0; i < len; i++) {
                    tar = oldArr[i];
                    tIndex = newArr.indexOf(tar);
                    if (tIndex >= 0) {
                        newArr.splice(tIndex, newArr.length - tIndex);
                        break;
                    }
                    else {
                        arrs.push(tar);
                    }
                }
                if (arrs.length > 0) {
                    this.sendEvents(arrs, Event.MOUSE_OUT);
                }
                if (newArr.length > 0) {
                    this.sendEvents(newArr, Event.MOUSE_OVER);
                }
            }
        }
        onMouseMove(ele, touchID) {
            if (!this.enable)
                return;
            var preO;
            preO = this.getTouchFromArr(touchID, this.preOvers);
            var arrs;
            if (!preO) {
                arrs = this.getEles(ele, null, TouchManager._tEleArr);
                this.sendEvents(arrs, Event.MOUSE_OVER);
                this.preOvers.push(this.createTouchO(ele, touchID));
            }
            else {
                this.checkMouseOutAndOverOfMove(ele, preO.tar);
                preO.tar = ele;
                arrs = this.getEles(ele, null, TouchManager._tEleArr);
            }
            this.sendEvents(arrs, Event.MOUSE_MOVE);
            this._clearTempArrs();
        }
        getLastOvers() {
            TouchManager._tEleArr.length = 0;
            if (this.preOvers.length > 0 && this.preOvers[0].tar) {
                return this.getEles(this.preOvers[0].tar, null, TouchManager._tEleArr);
            }
            TouchManager._tEleArr.push(ILaya.stage);
            return TouchManager._tEleArr;
        }
        stageMouseOut() {
            var lastOvers;
            lastOvers = this.getLastOvers();
            this.preOvers.length = 0;
            this.sendEvents(lastOvers, Event.MOUSE_OUT);
        }
        onMouseUp(ele, touchID, isLeft = false) {
            if (!this.enable)
                return;
            var preO;
            var arrs;
            var oldArr;
            var i, len;
            var tar;
            var sendArr;
            var onMobile = Browser.onMobile;
            arrs = this.getEles(ele, null, TouchManager._tEleArr);
            this.sendEvents(arrs, isLeft ? Event.MOUSE_UP : Event.RIGHT_MOUSE_UP);
            var preDowns;
            preDowns = isLeft ? this.preDowns : this.preRightDowns;
            preO = this.getTouchFromArr(touchID, preDowns);
            if (!preO) ;
            else {
                var isDouble;
                var now = Browser.now();
                isDouble = now - this._lastClickTime < 300;
                this._lastClickTime = now;
                if (ele == preO.tar) {
                    sendArr = arrs;
                }
                else {
                    oldArr = this.getEles(preO.tar, null, TouchManager._oldArr);
                    sendArr = TouchManager._newArr;
                    sendArr.length = 0;
                    len = oldArr.length;
                    for (i = 0; i < len; i++) {
                        tar = oldArr[i];
                        if (arrs.indexOf(tar) >= 0) {
                            sendArr.push(tar);
                        }
                    }
                }
                if (sendArr.length > 0) {
                    this.sendEvents(sendArr, isLeft ? Event.CLICK : Event.RIGHT_CLICK);
                }
                if (isLeft && isDouble) {
                    this.sendEvents(sendArr, Event.DOUBLE_CLICK);
                }
                this.removeTouchFromArr(touchID, preDowns);
                preO.tar = null;
                Pool.recover("TouchData", preO);
            }
            preO = this.getTouchFromArr(touchID, this.preOvers);
            if (!preO) ;
            else {
                if (onMobile) {
                    sendArr = this.getEles(preO.tar, null, sendArr);
                    if (sendArr && sendArr.length > 0) {
                        this.sendEvents(sendArr, Event.MOUSE_OUT);
                    }
                    this.removeTouchFromArr(touchID, this.preOvers);
                    preO.tar = null;
                    Pool.recover("TouchData", preO);
                }
            }
            this._clearTempArrs();
        }
    }
    TouchManager.I = new TouchManager();
    TouchManager._oldArr = [];
    TouchManager._newArr = [];
    TouchManager._tEleArr = [];

    class MouseManager {
        constructor() {
            this.mouseX = 0;
            this.mouseY = 0;
            this.disableMouseEvent = false;
            this.mouseDownTime = 0;
            this.mouseMoveAccuracy = 2;
            this._event = new Event();
            this._captureSp = null;
            this._captureChain = [];
            this._captureExlusiveMode = false;
            this._hitCaputreSp = false;
            this._point = new Point();
            this._rect = new Rectangle();
            this._lastMoveTimer = 0;
            this._prePoint = new Point();
            this._touchIDs = {};
            this._curTouchID = NaN;
            this._id = 1;
        }
        __init__(stage, canvas) {
            this._stage = stage;
            var _this = this;
            canvas.oncontextmenu = function (e) {
                if (MouseManager.enabled)
                    return false;
            };
            canvas.addEventListener('mousedown', function (e) {
                if (MouseManager.enabled) {
                    if (!Browser.onIE)
                        e.preventDefault();
                    _this.mouseDownTime = Browser.now();
                    _this.runEvent(e);
                }
            });
            canvas.addEventListener('mouseup', function (e) {
                if (MouseManager.enabled) {
                    e.preventDefault();
                    _this.mouseDownTime = -Browser.now();
                    _this.runEvent(e);
                }
            }, true);
            canvas.addEventListener('mousemove', function (e) {
                if (MouseManager.enabled) {
                    e.preventDefault();
                    var now = Browser.now();
                    if (now - _this._lastMoveTimer < 10)
                        return;
                    _this._lastMoveTimer = now;
                    _this.runEvent(e);
                }
            }, true);
            canvas.addEventListener("mouseout", function (e) {
                if (MouseManager.enabled)
                    _this.runEvent(e);
            });
            canvas.addEventListener("mouseover", function (e) {
                if (MouseManager.enabled)
                    _this.runEvent(e);
            });
            canvas.addEventListener("touchstart", function (e) {
                if (MouseManager.enabled) {
                    if (!MouseManager._isFirstTouch && !Input.isInputting)
                        e.preventDefault();
                    _this.mouseDownTime = Browser.now();
                    _this.runEvent(e);
                }
            });
            canvas.addEventListener("touchend", function (e) {
                if (MouseManager.enabled) {
                    if (!MouseManager._isFirstTouch && !Input.isInputting)
                        e.preventDefault();
                    MouseManager._isFirstTouch = false;
                    _this.mouseDownTime = -Browser.now();
                    _this.runEvent(e);
                }
                else {
                    _this._curTouchID = NaN;
                }
            }, true);
            canvas.addEventListener("touchmove", function (e) {
                if (MouseManager.enabled) {
                    e.preventDefault();
                    _this.runEvent(e);
                }
            }, true);
            canvas.addEventListener("touchcancel", function (e) {
                if (MouseManager.enabled) {
                    e.preventDefault();
                    _this.runEvent(e);
                }
                else {
                    _this._curTouchID = NaN;
                }
            }, true);
            canvas.addEventListener('mousewheel', function (e) {
                if (MouseManager.enabled)
                    _this.runEvent(e);
            });
            canvas.addEventListener('DOMMouseScroll', function (e) {
                if (MouseManager.enabled)
                    _this.runEvent(e);
            });
        }
        initEvent(e, nativeEvent = null) {
            var _this = this;
            _this._event._stoped = false;
            _this._event.nativeEvent = nativeEvent || e;
            _this._target = null;
            this._point.setTo(e.pageX || e.clientX || e.x, e.pageY || e.clientY || e.y);
            if (this._stage._canvasTransform) {
                this._stage._canvasTransform.invertTransformPoint(this._point);
                _this.mouseX = this._point.x;
                _this.mouseY = this._point.y;
            }
            _this._event.touchId = e.identifier || 0;
            this._tTouchID = _this._event.touchId;
            var evt;
            evt = TouchManager.I._event;
            evt._stoped = false;
            evt.nativeEvent = _this._event.nativeEvent;
            evt.touchId = _this._event.touchId;
        }
        checkMouseWheel(e) {
            this._event.delta = e.wheelDelta ? e.wheelDelta * 0.025 : -e.detail;
            var _lastOvers = TouchManager.I.getLastOvers();
            for (var i = 0, n = _lastOvers.length; i < n; i++) {
                var ele = _lastOvers[i];
                ele.event(Event.MOUSE_WHEEL, this._event.setTo(Event.MOUSE_WHEEL, ele, this._target));
            }
        }
        onMouseMove(ele) {
            TouchManager.I.onMouseMove(ele, this._tTouchID);
        }
        onMouseDown(ele) {
            if (Input.isInputting && ILaya.stage.focus && ILaya.stage.focus["focus"] && !ILaya.stage.focus.contains(this._target)) {
                var pre_input = ILaya.stage.focus['_tf'] || ILaya.stage.focus;
                var new_input = ele['_tf'] || ele;
                if (new_input instanceof Input && new_input.multiline == pre_input.multiline)
                    pre_input['_focusOut']();
                else
                    pre_input.focus = false;
            }
            TouchManager.I.onMouseDown(ele, this._tTouchID, this._isLeftMouse);
        }
        onMouseUp(ele) {
            TouchManager.I.onMouseUp(ele, this._tTouchID, this._isLeftMouse);
        }
        check(sp, mouseX, mouseY, callBack) {
            this._point.setTo(mouseX, mouseY);
            sp.fromParentPoint(this._point);
            mouseX = this._point.x;
            mouseY = this._point.y;
            var scrollRect = sp._style.scrollRect;
            if (scrollRect) {
                this._rect.setTo(scrollRect.x, scrollRect.y, scrollRect.width, scrollRect.height);
                if (!this._rect.contains(mouseX, mouseY))
                    return false;
            }
            if (!this.disableMouseEvent) {
                if (sp.hitTestPrior && !sp.mouseThrough && !this.hitTest(sp, mouseX, mouseY)) {
                    return false;
                }
                for (var i = sp._children.length - 1; i > -1; i--) {
                    var child = sp._children[i];
                    if (!child.destroyed && child._mouseState > 1 && child._visible) {
                        if (this.check(child, mouseX, mouseY, callBack))
                            return true;
                    }
                }
                for (i = sp._extUIChild.length - 1; i >= 0; i--) {
                    var c = sp._extUIChild[i];
                    if (!c.destroyed && c._mouseState > 1 && c._visible) {
                        if (this.check(c, mouseX, mouseY, callBack))
                            return true;
                    }
                }
            }
            var isHit = (sp.hitTestPrior && !sp.mouseThrough && !this.disableMouseEvent) ? true : this.hitTest(sp, mouseX, mouseY);
            if (isHit) {
                this._target = sp;
                callBack.call(this, sp);
                if (this._target == this._hitCaputreSp) {
                    this._hitCaputreSp = true;
                }
            }
            else if (callBack === this.onMouseUp && sp === this._stage) {
                this._target = this._stage;
                callBack.call(this, this._target);
            }
            return isHit;
        }
        hitTest(sp, mouseX, mouseY) {
            var isHit = false;
            if (sp.scrollRect) {
                mouseX -= sp._style.scrollRect.x;
                mouseY -= sp._style.scrollRect.y;
            }
            var hitArea = sp._style.hitArea;
            if (hitArea && hitArea._hit) {
                return hitArea.contains(mouseX, mouseY);
            }
            if (sp.width > 0 && sp.height > 0 || sp.mouseThrough || hitArea) {
                if (!sp.mouseThrough) {
                    isHit = (hitArea ? hitArea : this._rect.setTo(0, 0, sp.width, sp.height)).contains(mouseX, mouseY);
                }
                else {
                    isHit = sp.getGraphicBounds().contains(mouseX, mouseY);
                }
            }
            return isHit;
        }
        _checkAllBaseUI(mousex, mousey, callback) {
            var ret = this.handleExclusiveCapture(this.mouseX, this.mouseY, callback);
            if (ret)
                return true;
            ret = this.check(this._stage, this.mouseX, this.mouseY, callback);
            return this.handleCapture(this.mouseX, this.mouseY, callback) || ret;
        }
        check3DUI(mousex, mousey, callback) {
            var uis = this._stage._3dUI;
            var i = 0;
            var ret = false;
            for (; i < uis.length; i++) {
                var curui = uis[i];
                this._stage._curUIBase = curui;
                if (!curui.destroyed && curui._mouseState > 1 && curui._visible) {
                    ret = ret || this.check(curui, this.mouseX, this.mouseY, callback);
                }
            }
            this._stage._curUIBase = this._stage;
            return ret;
        }
        handleExclusiveCapture(mousex, mousey, callback) {
            if (this._captureExlusiveMode && this._captureSp && this._captureChain.length > 0) {
                var cursp;
                this._point.setTo(mousex, mousey);
                for (var i = 0; i < this._captureChain.length; i++) {
                    cursp = this._captureChain[i];
                    cursp.fromParentPoint(this._point);
                }
                this._target = cursp;
                callback.call(this, cursp);
                return true;
            }
            return false;
        }
        handleCapture(mousex, mousey, callback) {
            if (!this._hitCaputreSp && this._captureSp && this._captureChain.length > 0) {
                var cursp;
                this._point.setTo(mousex, mousey);
                for (var i = 0; i < this._captureChain.length; i++) {
                    cursp = this._captureChain[i];
                    cursp.fromParentPoint(this._point);
                }
                this._target = cursp;
                callback.call(this, cursp);
                return true;
            }
            return false;
        }
        runEvent(evt) {
            var i, n, touch;
            if (evt.type !== 'mousemove')
                this._prePoint.x = this._prePoint.y = -1000000;
            switch (evt.type) {
                case 'mousedown':
                    this._touchIDs[0] = this._id++;
                    if (!MouseManager._isTouchRespond) {
                        this._isLeftMouse = evt.button === 0;
                        this.initEvent(evt);
                        this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseDown);
                    }
                    else
                        MouseManager._isTouchRespond = false;
                    break;
                case 'mouseup':
                    this._isLeftMouse = evt.button === 0;
                    this.initEvent(evt);
                    this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseUp);
                    break;
                case 'mousemove':
                    if ((Math.abs(this._prePoint.x - evt.clientX) + Math.abs(this._prePoint.y - evt.clientY)) >= this.mouseMoveAccuracy) {
                        this._prePoint.x = evt.clientX;
                        this._prePoint.y = evt.clientY;
                        this.initEvent(evt);
                        this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseMove);
                    }
                    break;
                case "touchstart":
                    MouseManager._isTouchRespond = true;
                    this._isLeftMouse = true;
                    var touches = evt.changedTouches;
                    for (i = 0, n = touches.length; i < n; i++) {
                        touch = touches[i];
                        if (MouseManager.multiTouchEnabled || isNaN(this._curTouchID)) {
                            this._curTouchID = touch.identifier;
                            if (this._id % 200 === 0)
                                this._touchIDs = {};
                            this._touchIDs[touch.identifier] = this._id++;
                            this.initEvent(touch, evt);
                            this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseDown);
                        }
                    }
                    break;
                case "touchend":
                case "touchcancel":
                    MouseManager._isTouchRespond = true;
                    this._isLeftMouse = true;
                    var touchends = evt.changedTouches;
                    for (i = 0, n = touchends.length; i < n; i++) {
                        touch = touchends[i];
                        if (MouseManager.multiTouchEnabled || touch.identifier == this._curTouchID) {
                            this._curTouchID = NaN;
                            this.initEvent(touch, evt);
                            var isChecked;
                            isChecked = this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseUp);
                            if (!isChecked) {
                                this.onMouseUp(null);
                            }
                        }
                    }
                    break;
                case "touchmove":
                    var touchemoves = evt.changedTouches;
                    for (i = 0, n = touchemoves.length; i < n; i++) {
                        touch = touchemoves[i];
                        if (MouseManager.multiTouchEnabled || touch.identifier == this._curTouchID) {
                            this.initEvent(touch, evt);
                            this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseMove);
                        }
                    }
                    break;
                case "wheel":
                case "mousewheel":
                case "DOMMouseScroll":
                    this.checkMouseWheel(evt);
                    break;
                case "mouseout":
                    TouchManager.I.stageMouseOut();
                    break;
                case "mouseover":
                    this._stage.event(Event.MOUSE_OVER, this._event.setTo(Event.MOUSE_OVER, this._stage, this._stage));
                    break;
            }
        }
        setCapture(sp, exclusive = false) {
            this._captureSp = sp;
            this._captureExlusiveMode = exclusive;
            this._captureChain.length = 0;
            this._captureChain.push(sp);
            var cursp = sp;
            while (true) {
                if (cursp == ILaya.stage)
                    break;
                if (cursp == ILaya.stage._curUIBase)
                    break;
                cursp = cursp.parent;
                if (!cursp)
                    break;
                this._captureChain.splice(0, 0, cursp);
            }
        }
        releaseCapture() {
            console.log('release capture');
            this._captureSp = null;
        }
    }
    MouseManager.instance = new MouseManager();
    MouseManager.enabled = true;
    MouseManager.multiTouchEnabled = true;
    MouseManager._isFirstTouch = true;

    class CallLater {
        constructor() {
            this._pool = [];
            this._map = [];
            this._laters = [];
        }
        _update() {
            var laters = this._laters;
            var len = laters.length;
            if (len > 0) {
                for (var i = 0, n = len - 1; i <= n; i++) {
                    var handler = laters[i];
                    this._map[handler.key] = null;
                    if (handler.method !== null) {
                        handler.run();
                        handler.clear();
                    }
                    this._pool.push(handler);
                    i === n && (n = laters.length - 1);
                }
                laters.length = 0;
            }
        }
        _getHandler(caller, method) {
            var cid = caller ? caller.$_GID || (caller.$_GID = ILaya.Utils.getGID()) : 0;
            var mid = method.$_TID || (method.$_TID = (ILaya.Timer._mid++) * 100000);
            return this._map[cid + mid];
        }
        callLater(caller, method, args = null) {
            if (this._getHandler(caller, method) == null) {
                if (this._pool.length)
                    var handler = this._pool.pop();
                else
                    handler = new LaterHandler();
                handler.caller = caller;
                handler.method = method;
                handler.args = args;
                var cid = caller ? caller.$_GID : 0;
                var mid = method["$_TID"];
                handler.key = cid + mid;
                this._map[handler.key] = handler;
                this._laters.push(handler);
            }
        }
        runCallLater(caller, method) {
            var handler = this._getHandler(caller, method);
            if (handler && handler.method != null) {
                this._map[handler.key] = null;
                handler.run();
                handler.clear();
            }
        }
    }
    CallLater.I = new CallLater();
    class LaterHandler {
        clear() {
            this.caller = null;
            this.method = null;
            this.args = null;
        }
        run() {
            var caller = this.caller;
            if (caller && caller.destroyed)
                return this.clear();
            var method = this.method;
            var args = this.args;
            if (method == null)
                return;
            args ? method.apply(caller, args) : method.call(caller);
        }
    }

    class RunDriver {
    }
    RunDriver.createShaderCondition = function (conditionScript) {
        var fn = "(function() {return " + conditionScript + ";})";
        return window.Laya._runScript(fn);
    };
    RunDriver.changeWebGLSize = function (w, h) {
        WebGL.onStageResize(w, h);
    };

    class Stage extends Sprite {
        constructor() {
            super();
            this.offset = new Point();
            this._frameRate = "fast";
            this.designWidth = 0;
            this.designHeight = 0;
            this.canvasRotation = false;
            this.canvasDegree = 0;
            this.renderingEnabled = true;
            this.screenAdaptationEnabled = true;
            this._canvasTransform = new Matrix();
            this._screenMode = "none";
            this._scaleMode = "noscale";
            this._alignV = "top";
            this._alignH = "left";
            this._bgColor = "black";
            this._mouseMoveTime = 0;
            this._renderCount = 0;
            this._safariOffsetY = 0;
            this._frameStartTime = 0;
            this._previousOrientation = Browser.window.orientation;
            this._wgColor = [0, 0, 0, 1];
            this._scene3Ds = [];
            this._globalRepaintSet = false;
            this._globalRepaintGet = false;
            this._3dUI = [];
            this._curUIBase = null;
            this.useRetinalCanvas = false;
            super.set_transform(this._createTransform());
            this.mouseEnabled = true;
            this.hitTestPrior = true;
            this.autoSize = false;
            this._setBit(Const.DISPLAYED_INSTAGE, true);
            this._setBit(Const.ACTIVE_INHIERARCHY, true);
            this._isFocused = true;
            this._isVisibility = true;
            this.useRetinalCanvas = Config.useRetinalCanvas;
            var window = Browser.window;
            var _me = this;
            window.addEventListener("focus", function () {
                this._isFocused = true;
                _me.event(Event.FOCUS);
                _me.event(Event.FOCUS_CHANGE);
            });
            window.addEventListener("blur", function () {
                this._isFocused = false;
                _me.event(Event.BLUR);
                _me.event(Event.FOCUS_CHANGE);
                if (_me._isInputting())
                    Input["inputElement"].target.focus = false;
            });
            var state = "visibilityState", visibilityChange = "visibilitychange";
            var document = window.document;
            if (typeof document.hidden !== "undefined") {
                visibilityChange = "visibilitychange";
                state = "visibilityState";
            }
            else if (typeof document.mozHidden !== "undefined") {
                visibilityChange = "mozvisibilitychange";
                state = "mozVisibilityState";
            }
            else if (typeof document.msHidden !== "undefined") {
                visibilityChange = "msvisibilitychange";
                state = "msVisibilityState";
            }
            else if (typeof document.webkitHidden !== "undefined") {
                visibilityChange = "webkitvisibilitychange";
                state = "webkitVisibilityState";
            }
            window.document.addEventListener(visibilityChange, visibleChangeFun);
            function visibleChangeFun() {
                if (Browser.document[state] == "hidden") {
                    this._isVisibility = false;
                    if (_me._isInputting())
                        Input["inputElement"].target.focus = false;
                }
                else {
                    this._isVisibility = true;
                }
                this.renderingEnabled = this._isVisibility;
                _me.event(Event.VISIBILITY_CHANGE);
            }
            window.addEventListener("resize", function () {
                var orientation = Browser.window.orientation;
                if (orientation != null && orientation != this._previousOrientation && _me._isInputting()) {
                    Input["inputElement"].target.focus = false;
                }
                this._previousOrientation = orientation;
                if (_me._isInputting())
                    return;
                if (Browser.onSafari)
                    _me._safariOffsetY = (Browser.window.__innerHeight || Browser.document.body.clientHeight || Browser.document.documentElement.clientHeight) - Browser.window.innerHeight;
                _me._resetCanvas();
            });
            window.addEventListener("orientationchange", function (e) {
                _me._resetCanvas();
            });
            this.on(Event.MOUSE_MOVE, this, this._onmouseMove);
            if (Browser.onMobile)
                this.on(Event.MOUSE_DOWN, this, this._onmouseMove);
        }
        _isInputting() {
            return (Browser.onMobile && Input.isInputting);
        }
        set width(value) {
            this.designWidth = value;
            super.set_width(value);
            ILaya.systemTimer.callLater(this, this._changeCanvasSize);
        }
        get width() {
            return super.get_width();
        }
        set height(value) {
            this.designHeight = value;
            super.set_height(value);
            ILaya.systemTimer.callLater(this, this._changeCanvasSize);
        }
        get height() {
            return super.get_height();
        }
        set transform(value) {
            super.set_transform(value);
        }
        get transform() {
            if (this._tfChanged)
                this._adjustTransform();
            return (this._transform = this._transform || this._createTransform());
        }
        get isFocused() {
            return this._isFocused;
        }
        get isVisibility() {
            return this._isVisibility;
        }
        _changeCanvasSize() {
            this.setScreenSize(Browser.clientWidth * Browser.pixelRatio, Browser.clientHeight * Browser.pixelRatio);
        }
        _resetCanvas() {
            if (!this.screenAdaptationEnabled)
                return;
            this._changeCanvasSize();
        }
        setScreenSize(screenWidth, screenHeight) {
            var rotation = false;
            if (this._screenMode !== Stage.SCREEN_NONE) {
                var screenType = screenWidth / screenHeight < 1 ? Stage.SCREEN_VERTICAL : Stage.SCREEN_HORIZONTAL;
                rotation = screenType !== this._screenMode;
                if (rotation) {
                    var temp = screenHeight;
                    screenHeight = screenWidth;
                    screenWidth = temp;
                }
            }
            this.canvasRotation = rotation;
            var canvas = Render._mainCanvas;
            var canvasStyle = canvas.source.style;
            var mat = this._canvasTransform.identity();
            var scaleMode = this._scaleMode;
            var scaleX = screenWidth / this.designWidth;
            var scaleY = screenHeight / this.designHeight;
            var canvasWidth = this.useRetinalCanvas ? screenWidth : this.designWidth;
            var canvasHeight = this.useRetinalCanvas ? screenHeight : this.designHeight;
            var realWidth = screenWidth;
            var realHeight = screenHeight;
            var pixelRatio = Browser.pixelRatio;
            this._width = this.designWidth;
            this._height = this.designHeight;
            switch (scaleMode) {
                case Stage.SCALE_NOSCALE:
                    scaleX = scaleY = 1;
                    realWidth = this.designWidth;
                    realHeight = this.designHeight;
                    break;
                case Stage.SCALE_SHOWALL:
                    scaleX = scaleY = Math.min(scaleX, scaleY);
                    canvasWidth = realWidth = Math.round(this.designWidth * scaleX);
                    canvasHeight = realHeight = Math.round(this.designHeight * scaleY);
                    break;
                case Stage.SCALE_NOBORDER:
                    scaleX = scaleY = Math.max(scaleX, scaleY);
                    realWidth = Math.round(this.designWidth * scaleX);
                    realHeight = Math.round(this.designHeight * scaleY);
                    break;
                case Stage.SCALE_FULL:
                    scaleX = scaleY = 1;
                    this._width = canvasWidth = screenWidth;
                    this._height = canvasHeight = screenHeight;
                    break;
                case Stage.SCALE_FIXED_WIDTH:
                    scaleY = scaleX;
                    this._height = canvasHeight = Math.round(screenHeight / scaleX);
                    break;
                case Stage.SCALE_FIXED_HEIGHT:
                    scaleX = scaleY;
                    this._width = canvasWidth = Math.round(screenWidth / scaleY);
                    break;
                case Stage.SCALE_FIXED_AUTO:
                    if ((screenWidth / screenHeight) < (this.designWidth / this.designHeight)) {
                        scaleY = scaleX;
                        this._height = canvasHeight = Math.round(screenHeight / scaleX);
                    }
                    else {
                        scaleX = scaleY;
                        this._width = canvasWidth = Math.round(screenWidth / scaleY);
                    }
                    break;
            }
            if (this.useRetinalCanvas) {
                canvasWidth = screenWidth;
                canvasHeight = screenHeight;
            }
            scaleX *= this.scaleX;
            scaleY *= this.scaleY;
            if (scaleX === 1 && scaleY === 1) {
                this.transform.identity();
            }
            else {
                this.transform.a = this._formatData(scaleX / (realWidth / canvasWidth));
                this.transform.d = this._formatData(scaleY / (realHeight / canvasHeight));
            }
            canvas.size(canvasWidth, canvasHeight);
            RunDriver.changeWebGLSize(canvasWidth, canvasHeight);
            mat.scale(realWidth / canvasWidth / pixelRatio, realHeight / canvasHeight / pixelRatio);
            if (this._alignH === Stage.ALIGN_LEFT)
                this.offset.x = 0;
            else if (this._alignH === Stage.ALIGN_RIGHT)
                this.offset.x = screenWidth - realWidth;
            else
                this.offset.x = (screenWidth - realWidth) * 0.5 / pixelRatio;
            if (this._alignV === Stage.ALIGN_TOP)
                this.offset.y = 0;
            else if (this._alignV === Stage.ALIGN_BOTTOM)
                this.offset.y = screenHeight - realHeight;
            else
                this.offset.y = (screenHeight - realHeight) * 0.5 / pixelRatio;
            this.offset.x = Math.round(this.offset.x);
            this.offset.y = Math.round(this.offset.y);
            mat.translate(this.offset.x, this.offset.y);
            if (this._safariOffsetY)
                mat.translate(0, this._safariOffsetY);
            this.canvasDegree = 0;
            if (rotation) {
                if (this._screenMode === Stage.SCREEN_HORIZONTAL) {
                    mat.rotate(Math.PI / 2);
                    mat.translate(screenHeight / pixelRatio, 0);
                    this.canvasDegree = 90;
                }
                else {
                    mat.rotate(-Math.PI / 2);
                    mat.translate(0, screenWidth / pixelRatio);
                    this.canvasDegree = -90;
                }
            }
            mat.a = this._formatData(mat.a);
            mat.d = this._formatData(mat.d);
            mat.tx = this._formatData(mat.tx);
            mat.ty = this._formatData(mat.ty);
            super.set_transform(this.transform);
            //canvasStyle.transformOrigin = canvasStyle.webkitTransformOrigin = canvasStyle.msTransformOrigin = canvasStyle.mozTransformOrigin = canvasStyle.oTransformOrigin = "0px 0px 0px";
            //canvasStyle.transform = canvasStyle.webkitTransform = canvasStyle.msTransform = canvasStyle.mozTransform = canvasStyle.oTransform = "matrix(" + mat.toString() + ")";
            if (this._safariOffsetY)
                mat.translate(0, -this._safariOffsetY);
            mat.translate(0,  0);
            this.visible = true;
            this._repaint |= SpriteConst.REPAINT_CACHE;
            this.event(Event.RESIZE);
        }
        _formatData(value) {
            if (Math.abs(value) < 0.000001)
                return 0;
            if (Math.abs(1 - value) < 0.001)
                return value > 0 ? 1 : -1;
            return value;
        }
        get scaleMode() {
            return this._scaleMode;
        }
        set scaleMode(value) {
            this._scaleMode = value;
            ILaya.systemTimer.callLater(this, this._changeCanvasSize);
        }
        get alignH() {
            return this._alignH;
        }
        set alignH(value) {
            this._alignH = value;
            ILaya.systemTimer.callLater(this, this._changeCanvasSize);
        }
        get alignV() {
            return this._alignV;
        }
        set alignV(value) {
            this._alignV = value;
            ILaya.systemTimer.callLater(this, this._changeCanvasSize);
        }
        get bgColor() {
            return this._bgColor;
        }
        set bgColor(value) {
            this._bgColor = value;
            if (value)
                this._wgColor = ColorUtils.create(value).arrColor;
            else
                this._wgColor = null;
            /*if (value) {
                Render.canvas.style.background = value;
            }
            else {
                Render.canvas.style.background = "none";
            }*/
        }
        get mouseX() {
            return Math.round(MouseManager.instance.mouseX / this.clientScaleX);
        }
        get mouseY() {
            return Math.round(MouseManager.instance.mouseY / this.clientScaleY);
        }
        getMousePoint() {
            return Point.TEMP.setTo(this.mouseX, this.mouseY);
        }
        get clientScaleX() {
            return this._transform ? this._transform.getScaleX() : 1;
        }
        get clientScaleY() {
            return this._transform ? this._transform.getScaleY() : 1;
        }
        get screenMode() {
            return this._screenMode;
        }
        set screenMode(value) {
            this._screenMode = value;
        }
        repaint(type = SpriteConst.REPAINT_CACHE) {
            this._repaint |= type;
        }
        parentRepaint(type = SpriteConst.REPAINT_CACHE) {
        }
        _loop() {
            this._globalRepaintGet = this._globalRepaintSet;
            this._globalRepaintSet = false;
            this.render(Render._context, 0, 0);
            return true;
        }
        getFrameTm() {
            return this._frameStartTime;
        }
        _onmouseMove(e) {
            this._mouseMoveTime = Browser.now();
        }
        getTimeFromFrameStart() {
            return Browser.now() - this._frameStartTime;
        }
        set visible(value) {
            if (this.visible !== value) {
                super.set_visible(value);
                var style = Render._mainCanvas.source.style;
                style.visibility = value ? "visible" : "hidden";
            }
        }
        get visible() {
            return super.visible;
        }
        render(context, x, y) {
            if (window.conch) {
                this.renderToNative(context, x, y);
                return;
            }
            Stage._dbgSprite.graphics.clear();
            if (this._frameRate === Stage.FRAME_SLEEP) {
                var now = Browser.now();
                if (now - this._frameStartTime >= 1000)
                    this._frameStartTime = now;
                else
                    return;
            }
            else {
                if (!this._visible) {
                    this._renderCount++;
                    if (this._renderCount % 5 === 0) {
                        CallLater.I._update();
                        Stat.loopCount++;
                        RenderInfo.loopCount = Stat.loopCount;
                        this._updateTimers();
                    }
                    return;
                }
                this._frameStartTime = Browser.now();
                RenderInfo.loopStTm = this._frameStartTime;
            }
            this._renderCount++;
            var frameMode = this._frameRate === Stage.FRAME_MOUSE ? (((this._frameStartTime - this._mouseMoveTime) < 2000) ? Stage.FRAME_FAST : Stage.FRAME_SLOW) : this._frameRate;
            var isFastMode = (frameMode !== Stage.FRAME_SLOW);
            var isDoubleLoop = (this._renderCount % 2 === 0);
            Stat.renderSlow = !isFastMode;
            if (!isFastMode && !isDoubleLoop)
                return;
            CallLater.I._update();
            Stat.loopCount++;
            RenderInfo.loopCount = Stat.loopCount;
            if (this.renderingEnabled) {
                for (var i = 0, n = this._scene3Ds.length; i < n; i++)
                    this._scene3Ds[i]._update();
                context.clear();
                super.render(context, x, y);
                Stat._StatRender.renderNotCanvas(context, x, y);
            }
            Stage._dbgSprite.render(context, 0, 0);
            if (this.renderingEnabled) {
                Stage.clear(this._bgColor);
                context.flush();
                VectorGraphManager.instance && VectorGraphManager.getInstance().endDispose();
            }
            this._updateTimers();
        }
        renderToNative(context, x, y) {
            this._renderCount++;
            if (!this._visible) {
                if (this._renderCount % 5 === 0) {
                    CallLater.I._update();
                    Stat.loopCount++;
                    RenderInfo.loopCount = Stat.loopCount;
                    this._updateTimers();
                }
                return;
            }
            CallLater.I._update();
            Stat.loopCount++;
            RenderInfo.loopCount = Stat.loopCount;
            if (this.renderingEnabled) {
                for (var i = 0, n = this._scene3Ds.length; i < n; i++)
                    this._scene3Ds[i]._update();
                context.clear();
                super.render(context, x, y);
                Stat._StatRender.renderNotCanvas(context, x, y);
            }
            if (this.renderingEnabled) {
                Stage.clear(this._bgColor);
                context.flush();
                VectorGraphManager.instance && VectorGraphManager.getInstance().endDispose();
            }
            this._updateTimers();
        }
        _updateTimers() {
            ILaya.systemTimer._update();
            ILaya.startTimer._update();
            ILaya.physicsTimer._update();
            ILaya.updateTimer._update();
            ILaya.lateTimer._update();
            ILaya.timer._update();
        }
        set fullScreenEnabled(value) {
            var document = Browser.document;
            var canvas = Render.canvas;
            if (value) {
                canvas.addEventListener('mousedown', this._requestFullscreen);
                canvas.addEventListener('touchstart', this._requestFullscreen);
                document.addEventListener("fullscreenchange", this._fullScreenChanged);
                document.addEventListener("mozfullscreenchange", this._fullScreenChanged);
                document.addEventListener("webkitfullscreenchange", this._fullScreenChanged);
                document.addEventListener("msfullscreenchange", this._fullScreenChanged);
            }
            else {
                canvas.removeEventListener('mousedown', this._requestFullscreen);
                canvas.removeEventListener('touchstart', this._requestFullscreen);
                document.removeEventListener("fullscreenchange", this._fullScreenChanged);
                document.removeEventListener("mozfullscreenchange", this._fullScreenChanged);
                document.removeEventListener("webkitfullscreenchange", this._fullScreenChanged);
                document.removeEventListener("msfullscreenchange", this._fullScreenChanged);
            }
        }
        get frameRate() {
            if (!ILaya.Render.isConchApp) {
                return this._frameRate;
            }
            else {
                return this._frameRateNative;
            }
        }
        set frameRate(value) {
            if (!ILaya.Render.isConchApp) {
                this._frameRate = value;
            }
            else {
                var c = window.conch;
                switch (value) {
                    case Stage.FRAME_FAST:
                        c.config.setLimitFPS(60);
                        break;
                    case Stage.FRAME_MOUSE:
                        c.config.setMouseFrame(2000);
                        break;
                    case Stage.FRAME_SLOW:
                        c.config.setSlowFrame(true);
                        break;
                    case Stage.FRAME_SLEEP:
                        c.config.setLimitFPS(1);
                        break;
                }
                this._frameRateNative = value;
            }
        }
        _requestFullscreen() {
            var element = Browser.document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
            else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
            else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
            else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
        _fullScreenChanged() {
            ILaya.stage.event(Event.FULL_SCREEN_CHANGE);
        }
        exitFullscreen() {
            var document = Browser.document;
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
        isGlobalRepaint() {
            return this._globalRepaintGet;
        }
        setGlobalRepaint() {
            this._globalRepaintSet = true;
        }
        add3DUI(uibase) {
            var uiroot = uibase.rootView;
            if (this._3dUI.indexOf(uiroot) >= 0)
                return;
            this._3dUI.push(uiroot);
        }
        remove3DUI(uibase) {
            var uiroot = uibase.rootView;
            var p = this._3dUI.indexOf(uiroot);
            if (p >= 0) {
                this._3dUI.splice(p, 1);
                return true;
            }
            return false;
        }
    }
    Stage.SCALE_NOSCALE = "noscale";
    Stage.SCALE_EXACTFIT = "exactfit";
    Stage.SCALE_SHOWALL = "showall";
    Stage.SCALE_NOBORDER = "noborder";
    Stage.SCALE_FULL = "full";
    Stage.SCALE_FIXED_WIDTH = "fixedwidth";
    Stage.SCALE_FIXED_HEIGHT = "fixedheight";
    Stage.SCALE_FIXED_AUTO = "fixedauto";
    Stage.ALIGN_LEFT = "left";
    Stage.ALIGN_RIGHT = "right";
    Stage.ALIGN_CENTER = "center";
    Stage.ALIGN_TOP = "top";
    Stage.ALIGN_MIDDLE = "middle";
    Stage.ALIGN_BOTTOM = "bottom";
    Stage.SCREEN_NONE = "none";
    Stage.SCREEN_HORIZONTAL = "horizontal";
    Stage.SCREEN_VERTICAL = "vertical";
    Stage.FRAME_FAST = "fast";
    Stage.FRAME_SLOW = "slow";
    Stage.FRAME_MOUSE = "mouse";
    Stage.FRAME_SLEEP = "sleep";
    Stage._dbgSprite = new Sprite();
    Stage.clear = function (value) {
        Context.set2DRenderConfig();
        var gl = LayaGL.instance;
        RenderState2D.worldScissorTest && gl.disable(gl.SCISSOR_TEST);
        var ctx = Render.context;
        var c = (ctx._submits._length == 0 || Config.preserveDrawingBuffer) ? ColorUtils.create(value).arrColor : window.Laya.stage._wgColor;
        if (c)
            ctx.clearBG(c[0], c[1], c[2], c[3]);
        else
            ctx.clearBG(0, 0, 0, 0);
        RenderState2D.clear();
    };
    ClassUtils.regClass("laya.display.Stage", Stage);
    ClassUtils.regClass("Laya.Stage", Stage);

    class KeyBoardManager {
        static __init__() {
            KeyBoardManager._addEvent("keydown");
            KeyBoardManager._addEvent("keypress");
            KeyBoardManager._addEvent("keyup");
        }
        static _addEvent(type) {
            ILaya.Browser.document.addEventListener(type, function (e) {
                KeyBoardManager._dispatch(e, type);
            }, true);
        }
        static _dispatch(e, type) {
            if (!KeyBoardManager.enabled)
                return;
            KeyBoardManager._event._stoped = false;
            KeyBoardManager._event.nativeEvent = e;
            KeyBoardManager._event.keyCode = e.keyCode || e.which || e.charCode;
            if (type === "keydown")
                KeyBoardManager._pressKeys[KeyBoardManager._event.keyCode] = true;
            else if (type === "keyup")
                KeyBoardManager._pressKeys[KeyBoardManager._event.keyCode] = null;
            var target = (ILaya.stage.focus && (ILaya.stage.focus.event != null) && ILaya.stage.focus.displayedInStage) ? ILaya.stage.focus : ILaya.stage;
            var ct = target;
            while (ct) {
                ct.event(type, KeyBoardManager._event.setTo(type, ct, target));
                ct = ct.parent;
            }
        }
        static hasKeyDown(key) {
            return KeyBoardManager._pressKeys[key];
        }
    }
    KeyBoardManager._pressKeys = {};
    KeyBoardManager.enabled = true;
    KeyBoardManager._event = new Event();

    class SoundChannel extends EventDispatcher {
        constructor() {
            super(...arguments);
            this.isStopped = false;
        }
        set volume(v) {
        }
        get volume() {
            return 1;
        }
        get position() {
            return 0;
        }
        get duration() {
            return 0;
        }
        play() {
        }
        stop() {
            if (this.completeHandler)
                this.completeHandler.run();
        }
        pause() {
        }
        resume() {
        }
        __runComplete(handler) {
            if (handler) {
                handler.run();
            }
        }
    }

    class AudioSoundChannel extends SoundChannel {
        constructor(audio) {
            super();
            this._audio = null;
            this._onEnd = this.__onEnd.bind(this);
            this._resumePlay = this.__resumePlay.bind(this);
            audio.addEventListener("ended", this._onEnd);
            this._audio = audio;
        }
        __onEnd(evt) {
            if (this.loops == 1) {
                if (this.completeHandler) {
                    ILaya.systemTimer.once(10, this, this.__runComplete, [this.completeHandler], false);
                    this.completeHandler = null;
                }
                this.stop();
                this.event(Event.COMPLETE);
                return;
            }
            if (this.loops > 0) {
                this.loops--;
            }
            this.startTime = 0;
            this.play();
        }
        __resumePlay() {
            if (this._audio)
                this._audio.removeEventListener("canplay", this._resumePlay);
            if (this.isStopped)
                return;
            try {
                this._audio.currentTime = this.startTime;
                Browser.container.appendChild(this._audio);
                this._audio.play();
            }
            catch (e) {
                this.event(Event.ERROR);
            }
        }
        play() {
            this.isStopped = false;
            try {
                this._audio.playbackRate = ILaya.SoundManager.playbackRate;
                this._audio.currentTime = this.startTime;
            }
            catch (e) {
                this._audio.addEventListener("canplay", this._resumePlay);
                return;
            }
            ILaya.SoundManager.addChannel(this);
            Browser.container.appendChild(this._audio);
            if ("play" in this._audio)
                this._audio.play();
        }
        get position() {
            if (!this._audio)
                return 0;
            return this._audio.currentTime;
        }
        get duration() {
            if (!this._audio)
                return 0;
            return this._audio.duration;
        }
        stop() {
            super.stop();
            this.isStopped = true;
            ILaya.SoundManager.removeChannel(this);
            this.completeHandler = null;
            if (!this._audio)
                return;
            if ("pause" in this._audio)
                if (ILaya.Render.isConchApp) {
                    this._audio.stop();
                }
            this._audio.pause();
            this._audio.removeEventListener("ended", this._onEnd);
            this._audio.removeEventListener("canplay", this._resumePlay);
            if (!ILaya.Browser.onIE) {
                if (this._audio != ILaya.AudioSound._musicAudio) {
                    ILaya.Pool.recover("audio:" + this.url, this._audio);
                }
            }
            Browser.removeElement(this._audio);
            this._audio = null;
            if (ILaya.SoundManager.autoReleaseSound)
                ILaya.SoundManager.disposeSoundLater(this.url);
        }
        pause() {
            this.isStopped = true;
            ILaya.SoundManager.removeChannel(this);
            if ("pause" in this._audio)
                this._audio.pause();
            if (ILaya.SoundManager.autoReleaseSound)
                ILaya.SoundManager.disposeSoundLater(this.url);
        }
        resume() {
            if (!this._audio)
                return;
            this.isStopped = false;
            ILaya.SoundManager.addChannel(this);
            if ("play" in this._audio)
                this._audio.play();
        }
        set volume(v) {
            if (!this._audio)
                return;
            this._audio.volume = v;
        }
        get volume() {
            if (!this._audio)
                return 1;
            return this._audio.volume;
        }
    }

    class AudioSound extends EventDispatcher {
        constructor() {
            super(...arguments);
            this.loaded = false;
        }
        dispose() {
            var ad = AudioSound._audioCache[this.url];
            Pool.clearBySign("audio:" + this.url);
            if (ad) {
                if (!Render.isConchApp) {
                    ad.src = "";
                }
                delete AudioSound._audioCache[this.url];
            }
        }
        static _initMusicAudio() {
            if (AudioSound._musicAudio)
                return;
            if (!AudioSound._musicAudio)
                AudioSound._musicAudio = Browser.createElement("audio");
            if (!Render.isConchApp) {
                Browser.document.addEventListener("mousedown", AudioSound._makeMusicOK);
            }
        }
        static _makeMusicOK() {
            Browser.document.removeEventListener("mousedown", AudioSound._makeMusicOK);
            if (!AudioSound._musicAudio.src) {
                AudioSound._musicAudio.src = "";
                AudioSound._musicAudio.load();
            }
            else {
                AudioSound._musicAudio.play();
            }
        }
        load(url) {
            url = URL.formatURL(url);
            this.url = url;
            var ad;
            if (url == ILaya.SoundManager._bgMusic) {
                AudioSound._initMusicAudio();
                ad = AudioSound._musicAudio;
                if (ad.src != url) {
                    AudioSound._audioCache[ad.src] = null;
                    ad = null;
                }
            }
            else {
                ad = AudioSound._audioCache[url];
            }
            if (ad && ad.readyState >= 2) {
                this.event(Event.COMPLETE);
                return;
            }
            if (!ad) {
                if (url == ILaya.SoundManager._bgMusic) {
                    AudioSound._initMusicAudio();
                    ad = AudioSound._musicAudio;
                }
                else {
                    ad = Browser.createElement("audio");
                }
                AudioSound._audioCache[url] = ad;
                ad.src = url;
            }
            ad.addEventListener("canplaythrough", onLoaded);
            ad.addEventListener("error", onErr);
            var me = this;
            function onLoaded() {
                offs();
                me.loaded = true;
                me.event(Event.COMPLETE);
            }
            function onErr() {
                ad.load = null;
                offs();
                me.event(Event.ERROR);
            }
            function offs() {
                ad.removeEventListener("canplaythrough", onLoaded);
                ad.removeEventListener("error", onErr);
            }
            this.audio = ad;
            if (ad.load) {
                ad.load();
            }
            else {
                onErr();
            }
        }
        play(startTime = 0, loops = 0) {
            if (!this.url)
                return null;
            var ad;
            if (this.url == ILaya.SoundManager._bgMusic) {
                ad = AudioSound._musicAudio;
            }
            else {
                ad = AudioSound._audioCache[this.url];
            }
            if (!ad)
                return null;
            var tAd;
            tAd = Pool.getItem("audio:" + this.url);
            if (Render.isConchApp) {
                if (!tAd) {
                    tAd = Browser.createElement("audio");
                    tAd.src = this.url;
                }
            }
            else {
                if (this.url == ILaya.SoundManager._bgMusic) {
                    AudioSound._initMusicAudio();
                    tAd = AudioSound._musicAudio;
                    tAd.src = this.url;
                }
                else {
                    tAd = tAd ? tAd : ad.cloneNode(true);
                }
            }
            var channel = new AudioSoundChannel(tAd);
            channel.url = this.url;
            channel.loops = loops;
            channel.startTime = startTime;
            channel.play();
            ILaya.SoundManager.addChannel(channel);
            return channel;
        }
        get duration() {
            var ad;
            ad = AudioSound._audioCache[this.url];
            if (!ad)
                return 0;
            return ad.duration;
        }
    }
    AudioSound._audioCache = {};

    class WebAudioSoundChannel extends SoundChannel {
        constructor() {
            super();
            this.bufferSource = null;
            this._currentTime = 0;
            this._volume = 1;
            this._startTime = 0;
            this._pauseTime = 0;
            this.context = ILaya.WebAudioSound.ctx;
            this._onPlayEnd = Utils.bind(this.__onPlayEnd, this);
            if (this.context["createGain"]) {
                this.gain = this.context["createGain"]();
            }
            else {
                this.gain = this.context["createGainNode"]();
            }
        }
        play() {
            ILaya.SoundManager.addChannel(this);
            this.isStopped = false;
            this._clearBufferSource();
            if (!this.audioBuffer)
                return;
            if (this.startTime >= this.duration)
                return stop();
            var context = this.context;
            var gain = this.gain;
            var bufferSource = context.createBufferSource();
            this.bufferSource = bufferSource;
            bufferSource.buffer = this.audioBuffer;
            bufferSource.connect(gain);
            if (gain)
                gain.disconnect();
            gain.connect(context.destination);
            bufferSource.onended = this._onPlayEnd;
            this._startTime = Browser.now();
            if (this.gain.gain.setTargetAtTime) {
                this.gain.gain.setTargetAtTime(this._volume, this.context.currentTime, WebAudioSoundChannel.SetTargetDelay);
            }
            else
                this.gain.gain.value = this._volume;
            if (this.loops == 0) {
                bufferSource.loop = true;
            }
            if (bufferSource.playbackRate.setTargetAtTime) {
                bufferSource.playbackRate.setTargetAtTime(ILaya.SoundManager.playbackRate, this.context.currentTime, WebAudioSoundChannel.SetTargetDelay);
            }
            else
                bufferSource.playbackRate.value = ILaya.SoundManager.playbackRate;
            bufferSource.start(0, this.startTime);
            this._currentTime = 0;
        }
        __onPlayEnd() {
            if (this.loops == 1) {
                if (this.completeHandler) {
                    ILaya.timer.once(10, this, this.__runComplete, [this.completeHandler], false);
                    this.completeHandler = null;
                }
                this.stop();
                this.event(Event.COMPLETE);
                return;
            }
            if (this.loops > 0) {
                this.loops--;
            }
            this.startTime = 0;
            this.play();
        }
        get position() {
            if (this.bufferSource) {
                return (Browser.now() - this._startTime) / 1000 + this.startTime;
            }
            return 0;
        }
        get duration() {
            if (this.audioBuffer) {
                return this.audioBuffer.duration;
            }
            return 0;
        }
        _clearBufferSource() {
            if (this.bufferSource) {
                var sourceNode = this.bufferSource;
                if (sourceNode.stop) {
                    sourceNode.stop(0);
                }
                else {
                    sourceNode.noteOff(0);
                }
                sourceNode.disconnect(0);
                sourceNode.onended = null;
                if (!WebAudioSoundChannel._tryCleanFailed)
                    this._tryClearBuffer(sourceNode);
                this.bufferSource = null;
            }
        }
        _tryClearBuffer(sourceNode) {
            if (!Browser.onMac) {
                try {
                    sourceNode.buffer = null;
                }
                catch (e) {
                    WebAudioSoundChannel._tryCleanFailed = true;
                }
                return;
            }
            try {
                sourceNode.buffer = ILaya.WebAudioSound._miniBuffer;
            }
            catch (e) {
                WebAudioSoundChannel._tryCleanFailed = true;
            }
        }
        stop() {
            super.stop();
            this._clearBufferSource();
            this.audioBuffer = null;
            if (this.gain)
                this.gain.disconnect();
            this.isStopped = true;
            ILaya.SoundManager.removeChannel(this);
            this.completeHandler = null;
            if (ILaya.SoundManager.autoReleaseSound)
                ILaya.SoundManager.disposeSoundLater(this.url);
        }
        pause() {
            if (!this.isStopped) {
                this._pauseTime = this.position;
            }
            this._clearBufferSource();
            if (this.gain)
                this.gain.disconnect();
            this.isStopped = true;
            ILaya.SoundManager.removeChannel(this);
            if (ILaya.SoundManager.autoReleaseSound)
                ILaya.SoundManager.disposeSoundLater(this.url);
        }
        resume() {
            this.startTime = this._pauseTime;
            this.play();
        }
        set volume(v) {
            this._volume = v;
            if (this.isStopped) {
                return;
            }
            if (this.gain.gain.setTargetAtTime) {
                this.gain.gain.setTargetAtTime(v, this.context.currentTime, WebAudioSoundChannel.SetTargetDelay);
            }
            else
                this.gain.gain.value = v;
        }
        get volume() {
            return this._volume;
        }
    }
    WebAudioSoundChannel._tryCleanFailed = false;
    WebAudioSoundChannel.SetTargetDelay = 0.001;

    class WebAudioSound extends EventDispatcher {
        constructor() {
            super(...arguments);
            this.loaded = false;
            this._disposed = false;
        }
        static decode() {
            if (WebAudioSound.buffs.length <= 0 || WebAudioSound.isDecoding) {
                return;
            }
            WebAudioSound.isDecoding = true;
            WebAudioSound.tInfo = WebAudioSound.buffs.shift();
            WebAudioSound.ctx.decodeAudioData(WebAudioSound.tInfo["buffer"], WebAudioSound._done, WebAudioSound._fail);
        }
        static _done(audioBuffer) {
            WebAudioSound.e.event("loaded:" + WebAudioSound.tInfo.url, audioBuffer);
            WebAudioSound.isDecoding = false;
            WebAudioSound.decode();
        }
        static _fail() {
            WebAudioSound.e.event("err:" + WebAudioSound.tInfo.url, null);
            WebAudioSound.isDecoding = false;
            WebAudioSound.decode();
        }
        static _playEmptySound() {
            if (WebAudioSound.ctx == null) {
                return;
            }
            var source = WebAudioSound.ctx.createBufferSource();
            source.buffer = WebAudioSound._miniBuffer;
            source.connect(WebAudioSound.ctx.destination);
            source.start(0, 0, 0);
        }
        static _unlock() {
            if (WebAudioSound._unlocked) {
                return;
            }
            WebAudioSound._playEmptySound();
            if (WebAudioSound.ctx.state == "running") {
                window.document.removeEventListener("mousedown", WebAudioSound._unlock, true);
                window.document.removeEventListener("touchend", WebAudioSound._unlock, true);
                window.document.removeEventListener("touchstart", WebAudioSound._unlock, true);
                WebAudioSound._unlocked = true;
            }
        }
        static initWebAudio() {
            if (WebAudioSound.ctx.state != "running") {
                WebAudioSound._unlock();
                window.document.addEventListener("mousedown", WebAudioSound._unlock, true);
                window.document.addEventListener("touchend", WebAudioSound._unlock, true);
                window.document.addEventListener("touchstart", WebAudioSound._unlock, true);
            }
        }
        load(url) {
            var me = this;
            url = URL.formatURL(url);
            this.url = url;
            this.audioBuffer = WebAudioSound._dataCache[url];
            if (this.audioBuffer) {
                this._loaded(this.audioBuffer);
                return;
            }
            WebAudioSound.e.on("loaded:" + url, this, this._loaded);
            WebAudioSound.e.on("err:" + url, this, this._err);
            if (WebAudioSound.__loadingSound[url]) {
                return;
            }
            WebAudioSound.__loadingSound[url] = true;
            var request = new window.XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
            request.onload = function () {
                if (me._disposed) {
                    me._removeLoadEvents();
                    return;
                }
                me.data = request.response;
                WebAudioSound.buffs.push({ "buffer": me.data, "url": me.url });
                WebAudioSound.decode();
            };
            request.onerror = function (e) {
                me._err();
            };
            request.send();
        }
        _err() {
            this._removeLoadEvents();
            WebAudioSound.__loadingSound[this.url] = false;
            this.event(Event.ERROR);
        }
        _loaded(audioBuffer) {
            this._removeLoadEvents();
            if (this._disposed) {
                return;
            }
            this.audioBuffer = audioBuffer;
            WebAudioSound._dataCache[this.url] = this.audioBuffer;
            this.loaded = true;
            this.event(Event.COMPLETE);
        }
        _removeLoadEvents() {
            WebAudioSound.e.off("loaded:" + this.url, this, this._loaded);
            WebAudioSound.e.off("err:" + this.url, this, this._err);
        }
        __playAfterLoaded() {
            if (!this.__toPlays)
                return;
            var i, len;
            var toPlays;
            toPlays = this.__toPlays;
            len = toPlays.length;
            var tParams;
            for (i = 0; i < len; i++) {
                tParams = toPlays[i];
                if (tParams[2] && !tParams[2].isStopped) {
                    this.play(tParams[0], tParams[1], tParams[2]);
                }
            }
            this.__toPlays.length = 0;
        }
        play(startTime = 0, loops = 0, channel = null) {
            channel = channel ? channel : new WebAudioSoundChannel();
            if (!this.audioBuffer) {
                if (this.url) {
                    if (!this.__toPlays)
                        this.__toPlays = [];
                    this.__toPlays.push([startTime, loops, channel]);
                    this.once(Event.COMPLETE, this, this.__playAfterLoaded);
                    this.load(this.url);
                }
            }
            channel.url = this.url;
            channel.loops = loops;
            channel["audioBuffer"] = this.audioBuffer;
            channel.startTime = startTime;
            channel.play();
            ILaya.SoundManager.addChannel(channel);
            return channel;
        }
        get duration() {
            if (this.audioBuffer) {
                return this.audioBuffer.duration;
            }
            return 0;
        }
        dispose() {
            this._disposed = true;
            delete WebAudioSound._dataCache[this.url];
            delete WebAudioSound.__loadingSound[this.url];
            this.audioBuffer = null;
            this.data = null;
            this.__toPlays = [];
        }
    }
    WebAudioSound._dataCache = {};
    WebAudioSound.webAudioEnabled = window["AudioContext"] || window["webkitAudioContext"] || window["mozAudioContext"];
    WebAudioSound.ctx = WebAudioSound.webAudioEnabled ? new (window["AudioContext"] || window["webkitAudioContext"] || window["mozAudioContext"])() : undefined;
    WebAudioSound.buffs = [];
    WebAudioSound.isDecoding = false;
    WebAudioSound._miniBuffer = WebAudioSound.ctx ? WebAudioSound.ctx.createBuffer(1, 1, 22050) : undefined;
    WebAudioSound.e = new EventDispatcher();
    WebAudioSound._unlocked = false;
    WebAudioSound.__loadingSound = {};

    class SoundManager {
        static __init__() {
            var win = ILaya.Browser.window;
            var supportWebAudio = win["AudioContext"] || win["webkitAudioContext"] || win["mozAudioContext"] ? true : false;
            if (supportWebAudio)
                WebAudioSound.initWebAudio();
            SoundManager._soundClass = supportWebAudio ? WebAudioSound : AudioSound;
            AudioSound._initMusicAudio();
            SoundManager._musicClass = AudioSound;
            return supportWebAudio;
        }
        static addChannel(channel) {
            if (SoundManager._channels.indexOf(channel) >= 0)
                return;
            SoundManager._channels.push(channel);
        }
        static removeChannel(channel) {
            var i;
            for (i = SoundManager._channels.length - 1; i >= 0; i--) {
                if (SoundManager._channels[i] == channel) {
                    SoundManager._channels.splice(i, 1);
                }
            }
        }
        static disposeSoundLater(url) {
            SoundManager._lastSoundUsedTimeDic[url] = ILaya.Browser.now();
            if (!SoundManager._isCheckingDispose) {
                SoundManager._isCheckingDispose = true;
                ILaya.timer.loop(5000, null, SoundManager._checkDisposeSound);
            }
        }
        static _checkDisposeSound() {
            var key;
            var tTime = ILaya.Browser.now();
            var hasCheck = false;
            for (key in SoundManager._lastSoundUsedTimeDic) {
                if (tTime - SoundManager._lastSoundUsedTimeDic[key] > 30000) {
                    delete SoundManager._lastSoundUsedTimeDic[key];
                    SoundManager.disposeSoundIfNotUsed(key);
                }
                else {
                    hasCheck = true;
                }
            }
            if (!hasCheck) {
                SoundManager._isCheckingDispose = false;
                ILaya.timer.clear(null, SoundManager._checkDisposeSound);
            }
        }
        static disposeSoundIfNotUsed(url) {
            var i;
            for (i = SoundManager._channels.length - 1; i >= 0; i--) {
                if (SoundManager._channels[i].url == url) {
                    return;
                }
            }
            SoundManager.destroySound(url);
        }
        static set autoStopMusic(v) {
            ILaya.stage.off(Event.BLUR, null, SoundManager._stageOnBlur);
            ILaya.stage.off(Event.FOCUS, null, SoundManager._stageOnFocus);
            ILaya.stage.off(Event.VISIBILITY_CHANGE, null, SoundManager._visibilityChange);
            SoundManager._autoStopMusic = v;
            if (v) {
                ILaya.stage.on(Event.BLUR, null, SoundManager._stageOnBlur);
                ILaya.stage.on(Event.FOCUS, null, SoundManager._stageOnFocus);
                ILaya.stage.on(Event.VISIBILITY_CHANGE, null, SoundManager._visibilityChange);
            }
        }
        static get autoStopMusic() {
            return SoundManager._autoStopMusic;
        }
        static _visibilityChange() {
            if (ILaya.stage.isVisibility) {
                SoundManager._stageOnFocus();
            }
            else {
                SoundManager._stageOnBlur();
            }
        }
        static _stageOnBlur() {
            SoundManager._isActive = false;
            if (SoundManager._musicChannel) {
                if (!SoundManager._musicChannel.isStopped) {
                    SoundManager._blurPaused = true;
                    SoundManager._musicChannel.pause();
                }
            }
            SoundManager.stopAllSound();
            ILaya.stage.once(Event.MOUSE_DOWN, null, SoundManager._stageOnFocus);
        }
        static _recoverWebAudio() {
            if (WebAudioSound.ctx && WebAudioSound.ctx.state != "running" && WebAudioSound.ctx.resume)
                WebAudioSound.ctx.resume();
        }
        static _stageOnFocus() {
            SoundManager._isActive = true;
            SoundManager._recoverWebAudio();
            ILaya.stage.off(Event.MOUSE_DOWN, null, SoundManager._stageOnFocus);
            if (SoundManager._blurPaused) {
                if (SoundManager._musicChannel && SoundManager._musicChannel.isStopped) {
                    SoundManager._blurPaused = false;
                    SoundManager._musicChannel.resume();
                }
            }
        }
        static set muted(value) {
            if (value == SoundManager._muted)
                return;
            if (value) {
                SoundManager.stopAllSound();
            }
            SoundManager.musicMuted = value;
            SoundManager._muted = value;
        }
        static get muted() {
            return SoundManager._muted;
        }
        static set soundMuted(value) {
            SoundManager._soundMuted = value;
        }
        static get soundMuted() {
            return SoundManager._soundMuted;
        }
        static set musicMuted(value) {
            if (value == SoundManager._musicMuted)
                return;
            if (value) {
                if (SoundManager._bgMusic) {
                    if (SoundManager._musicChannel && !SoundManager._musicChannel.isStopped) {
                        if (ILaya.Render.isConchApp) {
                            if (SoundManager._musicChannel._audio)
                                SoundManager._musicChannel._audio.muted = true;
                        }
                        else {
                            SoundManager._musicChannel.pause();
                        }
                    }
                    else {
                        SoundManager._musicChannel = null;
                    }
                }
                else {
                    SoundManager._musicChannel = null;
                }
                SoundManager._musicMuted = value;
            }
            else {
                SoundManager._musicMuted = value;
                if (SoundManager._bgMusic) {
                    if (SoundManager._musicChannel) {
                        if (ILaya.Render.isConchApp) {
                            if (SoundManager._musicChannel._audio)
                                SoundManager._musicChannel._audio.muted = false;
                        }
                        else {
                            SoundManager._musicChannel.resume();
                        }
                    }
                }
            }
        }
        static get musicMuted() {
            return SoundManager._musicMuted;
        }
        static get useAudioMusic() {
            return SoundManager._useAudioMusic;
        }
        static set useAudioMusic(value) {
            SoundManager._useAudioMusic = value;
            if (value) {
                SoundManager._musicClass = AudioSound;
            }
            else {
                SoundManager._musicClass = null;
            }
        }
        static playSound(url, loops = 1, complete = null, soundClass = null, startTime = 0) {
            if (!SoundManager._isActive || !url)
                return null;
            if (SoundManager._muted)
                return null;
            SoundManager._recoverWebAudio();
            url = URL.formatURL(url);
            if (url == SoundManager._bgMusic) {
                if (SoundManager._musicMuted)
                    return null;
            }
            else {
                if (ILaya.Render.isConchApp) {
                    var ext = Utils.getFileExtension(url);
                    if (ext != "wav" && ext != "ogg") {
                        alert("The sound only supports wav or ogg format,for optimal performance reason,please refer to the official website document.");
                        return null;
                    }
                }
                if (SoundManager._soundMuted)
                    return null;
            }
            var tSound;
            if (!ILaya.Browser.onBDMiniGame && !ILaya.Browser.onMiniGame && !ILaya.Browser.onKGMiniGame && !ILaya.Browser.onQGMiniGame && !ILaya.Browser.onVVMiniGame && !ILaya.Browser.onAlipayMiniGame && !ILaya.Browser.onQQMiniGame) {
                tSound = ILaya.loader.getRes(url);
            }
            if (!soundClass)
                soundClass = SoundManager._soundClass;
            if (!tSound) {
                tSound = new soundClass();
                tSound.load(url);
                if (!ILaya.Browser.onBDMiniGame && !ILaya.Browser.onMiniGame && !ILaya.Browser.onKGMiniGame && !ILaya.Browser.onQGMiniGame && !ILaya.Browser.onVVMiniGame && !ILaya.Browser.onAlipayMiniGame && !ILaya.Browser.onQQMiniGame) {
                    ILaya.Loader.cacheRes(url, tSound);
                }
            }
            var channel;
            channel = tSound.play(startTime, loops);
            if (!channel)
                return null;
            channel.url = url;
            channel.volume = (url == SoundManager._bgMusic) ? SoundManager.musicVolume : SoundManager.soundVolume;
            channel.completeHandler = complete;
            return channel;
        }
        static destroySound(url) {
            var tSound = ILaya.loader.getRes(url);
            if (tSound) {
                ILaya.Loader.clearRes(url);
                tSound.dispose();
            }
        }
        static playMusic(url, loops = 0, complete = null, startTime = 0) {
            url = URL.formatURL(url);
            SoundManager._bgMusic = url;
            if (SoundManager._musicChannel)
                SoundManager._musicChannel.stop();
            return SoundManager._musicChannel = SoundManager.playSound(url, loops, complete, SoundManager._musicClass, startTime);
        }
        static stopSound(url) {
            url = URL.formatURL(url);
            var i;
            var channel;
            for (i = SoundManager._channels.length - 1; i >= 0; i--) {
                channel = SoundManager._channels[i];
                if (channel.url == url) {
                    channel.stop();
                }
            }
        }
        static stopAll() {
            SoundManager._bgMusic = null;
            var i;
            var channel;
            for (i = SoundManager._channels.length - 1; i >= 0; i--) {
                channel = SoundManager._channels[i];
                channel.stop();
            }
        }
        static stopAllSound() {
            var i;
            var channel;
            for (i = SoundManager._channels.length - 1; i >= 0; i--) {
                channel = SoundManager._channels[i];
                if (channel.url != SoundManager._bgMusic) {
                    channel.stop();
                }
            }
        }
        static stopMusic() {
            if (SoundManager._musicChannel)
                SoundManager._musicChannel.stop();
            SoundManager._bgMusic = null;
        }
        static setSoundVolume(volume, url = null) {
            if (url) {
                url = URL.formatURL(url);
                SoundManager._setVolume(url, volume);
            }
            else {
                SoundManager.soundVolume = volume;
                var i;
                var channel;
                for (i = SoundManager._channels.length - 1; i >= 0; i--) {
                    channel = SoundManager._channels[i];
                    if (channel.url != SoundManager._bgMusic) {
                        channel.volume = volume;
                    }
                }
            }
        }
        static setMusicVolume(volume) {
            SoundManager.musicVolume = volume;
            SoundManager._setVolume(SoundManager._bgMusic, volume);
        }
        static _setVolume(url, volume) {
            url = URL.formatURL(url);
            var i;
            var channel;
            for (i = SoundManager._channels.length - 1; i >= 0; i--) {
                channel = SoundManager._channels[i];
                if (channel.url == url) {
                    channel.volume = volume;
                }
            }
        }
    }
    SoundManager.musicVolume = 1;
    SoundManager.soundVolume = 1;
    SoundManager.playbackRate = 1;
    SoundManager._useAudioMusic = true;
    SoundManager._muted = false;
    SoundManager._soundMuted = false;
    SoundManager._musicMuted = false;
    SoundManager._bgMusic = null;
    SoundManager._musicChannel = null;
    SoundManager._channels = [];
    SoundManager._blurPaused = false;
    SoundManager._isActive = true;
    SoundManager._lastSoundUsedTimeDic = {};
    SoundManager._isCheckingDispose = false;
    SoundManager.autoReleaseSound = true;

    class HttpRequest extends EventDispatcher {
        constructor() {
            super(...arguments);
            this._http = new window.XMLHttpRequest();
        }
        send(url, data = null, method = "get", responseType = "text", headers = null) {
            this._responseType = responseType;
            this._data = null;
            if (Browser.onVVMiniGame || Browser.onQGMiniGame || Browser.onQQMiniGame) {
                url = encodeURI(url);
            }
            this._url = url;
            var _this = this;
            var http = this._http;
            url = URL.getAdptedFilePath(url);
            http.open(method, url, true);
            if (headers) {
                for (var i = 0; i < headers.length; i++) {
                    http.setRequestHeader(headers[i++], headers[i]);
                }
            }
            else if (!(window.conch)) {
                if (!data || typeof (data) == 'string')
                    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                else
                    http.setRequestHeader("Content-Type", "application/json");
            }
            let restype = responseType !== "arraybuffer" ? "text" : "arraybuffer";
            http.responseType = restype;
            if (http.dataType) {
                http.dataType = restype;
            }
            http.onerror = function (e) {
                _this._onError(e);
            };
            http.onabort = function (e) {
                _this._onAbort(e);
            };
            http.onprogress = function (e) {
                _this._onProgress(e);
            };
            http.onload = function (e) {
                _this._onLoad(e);
            };
            http.send(data);
        }
        _onProgress(e) {
            if (e && e.lengthComputable)
                this.event(Event.PROGRESS, e.loaded / e.total);
        }
        _onAbort(e) {
            this.error("Request was aborted by user");
        }
        _onError(e) {
            this.error("Request failed Status:" + this._http.status + " text:" + this._http.statusText);
        }
        _onLoad(e) {
            var http = this._http;
            var status = http.status !== undefined ? http.status : 200;
            if (status === 200 || status === 204 || status === 0) {
                this.complete();
            }
            else {
                this.error("[" + http.status + "]" + http.statusText + ":" + http.responseURL);
            }
        }
        error(message) {
            this.clear();
            console.warn(this.url, message);
            this.event(Event.ERROR, message);
        }
        complete() {
            this.clear();
            var flag = true;
            try {
                if (this._responseType === "json") {
                    this._data = JSON.parse(this._http.responseText);
                }
                else if (this._responseType === "xml") {
                    this._data = Utils.parseXMLFromString(this._http.responseText);
                }
                else {
                    this._data = this._http.response || this._http.responseText;
                }
            }
            catch (e) {
                flag = false;
                this.error(e.message);
            }
            flag && this.event(Event.COMPLETE, this._data instanceof Array ? [this._data] : this._data);
        }
        clear() {
            var http = this._http;
            http.onerror = http.onabort = http.onprogress = http.onload = null;
        }
        get url() {
            return this._url;
        }
        get data() {
            return this._data;
        }
        get http() {
            return this._http;
        }
    }

    class BitmapFont {
        constructor() {
            this._fontCharDic = {};
            this._fontWidthMap = {};
            this._maxWidth = 0;
            this._spaceWidth = 10;
            this.fontSize = 12;
            this.autoScaleSize = false;
            this.letterSpacing = 0;
        }
        loadFont(path, complete) {
            this._path = path;
            this._complete = complete;
            if (!path || path.indexOf(".fnt") === -1) {
                console.error('Bitmap font configuration information must be a ".fnt" file');
                return;
            }
            ILaya.loader.load([{ url: path, type: ILaya.Loader.XML }, { url: path.replace(".fnt", ".png"), type: ILaya.Loader.IMAGE }], Handler.create(this, this._onLoaded));
        }
        _onLoaded() {
            this.parseFont(ILaya.Loader.getRes(this._path), ILaya.Loader.getRes(this._path.replace(".fnt", ".png")));
            this._complete && this._complete.run();
        }
        parseFont(xml, texture) {
            if (xml == null || texture == null)
                return;
            this._texture = texture;
            var tScale = 1;
            var tInfo = xml.getElementsByTagName("info");
            if (!tInfo[0].getAttributeNode) {
                return this.parseFont2(xml, texture);
            }
            this.fontSize = parseInt(tInfo[0].getAttributeNode("size").nodeValue);
            var tPadding = tInfo[0].getAttributeNode("padding").nodeValue;
            var tPaddingArray = tPadding.split(",");
            this._padding = [parseInt(tPaddingArray[0]), parseInt(tPaddingArray[1]), parseInt(tPaddingArray[2]), parseInt(tPaddingArray[3])];
            var chars = xml.getElementsByTagName("char");
            var i = 0;
            for (i = 0; i < chars.length; i++) {
                var tAttribute = chars[i];
                var tId = parseInt(tAttribute.getAttributeNode("id").nodeValue);
                var xOffset = parseInt(tAttribute.getAttributeNode("xoffset").nodeValue) / tScale;
                var yOffset = parseInt(tAttribute.getAttributeNode("yoffset").nodeValue) / tScale;
                var xAdvance = parseInt(tAttribute.getAttributeNode("xadvance").nodeValue) / tScale;
                var region = new Rectangle();
                region.x = parseInt(tAttribute.getAttributeNode("x").nodeValue);
                region.y = parseInt(tAttribute.getAttributeNode("y").nodeValue);
                region.width = parseInt(tAttribute.getAttributeNode("width").nodeValue);
                region.height = parseInt(tAttribute.getAttributeNode("height").nodeValue);
                var tTexture = Texture.create(texture, region.x, region.y, region.width, region.height, xOffset, yOffset);
                this._maxWidth = Math.max(this._maxWidth, xAdvance + this.letterSpacing);
                this._fontCharDic[tId] = tTexture;
                this._fontWidthMap[tId] = xAdvance;
            }
        }
        parseFont2(xml, texture) {
            if (xml == null || texture == null)
                return;
            this._texture = texture;
            var tScale = 1;
            var tInfo = xml.getElementsByTagName("info");
            this.fontSize = parseInt(tInfo[0].attributes["size"].nodeValue);
            var tPadding = tInfo[0].attributes["padding"].nodeValue;
            var tPaddingArray = tPadding.split(",");
            this._padding = [parseInt(tPaddingArray[0]), parseInt(tPaddingArray[1]), parseInt(tPaddingArray[2]), parseInt(tPaddingArray[3])];
            var chars = xml.getElementsByTagName("char");
            var i = 0;
            for (i = 0; i < chars.length; i++) {
                var tAttribute = chars[i].attributes;
                var tId = parseInt(tAttribute["id"].nodeValue);
                var xOffset = parseInt(tAttribute["xoffset"].nodeValue) / tScale;
                var yOffset = parseInt(tAttribute["yoffset"].nodeValue) / tScale;
                var xAdvance = parseInt(tAttribute["xadvance"].nodeValue) / tScale;
                var region = new Rectangle();
                region.x = parseInt(tAttribute["x"].nodeValue);
                region.y = parseInt(tAttribute["y"].nodeValue);
                region.width = parseInt(tAttribute["width"].nodeValue);
                region.height = parseInt(tAttribute["height"].nodeValue);
                var tTexture = Texture.create(texture, region.x, region.y, region.width, region.height, xOffset, yOffset);
                this._maxWidth = Math.max(this._maxWidth, xAdvance + this.letterSpacing);
                this._fontCharDic[tId] = tTexture;
                this._fontWidthMap[tId] = xAdvance;
            }
        }
        getCharTexture(char) {
            return this._fontCharDic[char.charCodeAt(0)];
        }
        destroy() {
            if (this._texture) {
                for (var p in this._fontCharDic) {
                    var tTexture = this._fontCharDic[p];
                    if (tTexture)
                        tTexture.destroy();
                }
                this._texture.destroy();
                this._fontCharDic = null;
                this._fontWidthMap = null;
                this._texture = null;
                this._complete = null;
                this._padding = null;
            }
        }
        setSpaceWidth(spaceWidth) {
            this._spaceWidth = spaceWidth;
        }
        getCharWidth(char) {
            var code = char.charCodeAt(0);
            if (this._fontWidthMap[code])
                return this._fontWidthMap[code] + this.letterSpacing;
            if (char === " ")
                return this._spaceWidth + this.letterSpacing;
            return 0;
        }
        getTextWidth(text) {
            var tWidth = 0;
            for (var i = 0, n = text.length; i < n; i++) {
                tWidth += this.getCharWidth(text.charAt(i));
            }
            return tWidth;
        }
        getMaxWidth() {
            return this._maxWidth;
        }
        getMaxHeight() {
            return this.fontSize;
        }
        _drawText(text, sprite, drawX, drawY, align, width) {
            var tWidth = this.getTextWidth(text);
            var tTexture;
            var dx = 0;
            align === "center" && (dx = (width - tWidth) / 2);
            align === "right" && (dx = (width - tWidth));
            var tx = 0;
            for (var i = 0, n = text.length; i < n; i++) {
                tTexture = this.getCharTexture(text.charAt(i));
                if (tTexture) {
                    sprite.graphics.drawImage(tTexture, drawX + tx + dx, drawY);
                    tx += this.getCharWidth(text.charAt(i));
                }
            }
        }
    }
    ClassUtils.regClass("laya.display.BitmapFont", BitmapFont);
    ClassUtils.regClass("Laya.BitmapFont", BitmapFont);

    class Prefab {
        create() {
            if (this.json)
                return ILaya.SceneUtils.createByData(null, this.json);
            return null;
        }
    }

    class Byte {
        constructor(data = null) {
            this._xd_ = true;
            this._allocated_ = 8;
            this._pos_ = 0;
            this._length = 0;
            if (data) {
                this._u8d_ = new Uint8Array(data);
                this._d_ = new DataView(this._u8d_.buffer);
                this._length = this._d_.byteLength;
            }
            else {
                this._resizeBuffer(this._allocated_);
            }
        }
        static getSystemEndian() {
            if (!Byte._sysEndian) {
                var buffer = new ArrayBuffer(2);
                new DataView(buffer).setInt16(0, 256, true);
                Byte._sysEndian = (new Int16Array(buffer))[0] === 256 ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
            }
            return Byte._sysEndian;
        }
        get buffer() {
            var rstBuffer = this._d_.buffer;
            if (rstBuffer.byteLength === this._length)
                return rstBuffer;
            return rstBuffer.slice(0, this._length);
        }
        get endian() {
            return this._xd_ ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
        }
        set endian(value) {
            this._xd_ = (value === Byte.LITTLE_ENDIAN);
        }
        set length(value) {
            if (this._allocated_ < value)
                this._resizeBuffer(this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2)));
            else if (this._allocated_ > value)
                this._resizeBuffer(this._allocated_ = value);
            this._length = value;
        }
        get length() {
            return this._length;
        }
        _resizeBuffer(len) {
            try {
                var newByteView = new Uint8Array(len);
                if (this._u8d_ != null) {
                    if (this._u8d_.length <= len)
                        newByteView.set(this._u8d_);
                    else
                        newByteView.set(this._u8d_.subarray(0, len));
                }
                this._u8d_ = newByteView;
                this._d_ = new DataView(newByteView.buffer);
            }
            catch (err) {
                throw "Invalid typed array length:" + len;
            }
        }
        getString() {
            return this.readString();
        }
        readString() {
            return this._rUTF(this.getUint16());
        }
        getFloat32Array(start, len) {
            return this.readFloat32Array(start, len);
        }
        readFloat32Array(start, len) {
            var end = start + len;
            end = (end > this._length) ? this._length : end;
            var v = new Float32Array(this._d_.buffer.slice(start, end));
            this._pos_ = end;
            return v;
        }
        getUint8Array(start, len) {
            return this.readUint8Array(start, len);
        }
        readUint8Array(start, len) {
            var end = start + len;
            end = (end > this._length) ? this._length : end;
            var v = new Uint8Array(this._d_.buffer.slice(start, end));
            this._pos_ = end;
            return v;
        }
        getInt16Array(start, len) {
            return this.readInt16Array(start, len);
        }
        readInt16Array(start, len) {
            var end = start + len;
            end = (end > this._length) ? this._length : end;
            var v = new Int16Array(this._d_.buffer.slice(start, end));
            this._pos_ = end;
            return v;
        }
        getFloat32() {
            return this.readFloat32();
        }
        readFloat32() {
            if (this._pos_ + 4 > this._length)
                throw "getFloat32 error - Out of bounds";
            var v = this._d_.getFloat32(this._pos_, this._xd_);
            this._pos_ += 4;
            return v;
        }
        getFloat64() {
            return this.readFloat64();
        }
        readFloat64() {
            if (this._pos_ + 8 > this._length)
                throw "getFloat64 error - Out of bounds";
            var v = this._d_.getFloat64(this._pos_, this._xd_);
            this._pos_ += 8;
            return v;
        }
        writeFloat32(value) {
            this._ensureWrite(this._pos_ + 4);
            this._d_.setFloat32(this._pos_, value, this._xd_);
            this._pos_ += 4;
        }
        writeFloat64(value) {
            this._ensureWrite(this._pos_ + 8);
            this._d_.setFloat64(this._pos_, value, this._xd_);
            this._pos_ += 8;
        }
        getInt32() {
            return this.readInt32();
        }
        readInt32() {
            if (this._pos_ + 4 > this._length)
                throw "getInt32 error - Out of bounds";
            var float = this._d_.getInt32(this._pos_, this._xd_);
            this._pos_ += 4;
            return float;
        }
        getUint32() {
            return this.readUint32();
        }
        readUint32() {
            if (this._pos_ + 4 > this._length)
                throw "getUint32 error - Out of bounds";
            var v = this._d_.getUint32(this._pos_, this._xd_);
            this._pos_ += 4;
            return v;
        }
        writeInt32(value) {
            this._ensureWrite(this._pos_ + 4);
            this._d_.setInt32(this._pos_, value, this._xd_);
            this._pos_ += 4;
        }
        writeUint32(value) {
            this._ensureWrite(this._pos_ + 4);
            this._d_.setUint32(this._pos_, value, this._xd_);
            this._pos_ += 4;
        }
        getInt16() {
            return this.readInt16();
        }
        readInt16() {
            if (this._pos_ + 2 > this._length)
                throw "getInt16 error - Out of bounds";
            var us = this._d_.getInt16(this._pos_, this._xd_);
            this._pos_ += 2;
            return us;
        }
        getUint16() {
            return this.readUint16();
        }
        readUint16() {
            if (this._pos_ + 2 > this._length)
                throw "getUint16 error - Out of bounds";
            var us = this._d_.getUint16(this._pos_, this._xd_);
            this._pos_ += 2;
            return us;
        }
        writeUint16(value) {
            this._ensureWrite(this._pos_ + 2);
            this._d_.setUint16(this._pos_, value, this._xd_);
            this._pos_ += 2;
        }
        writeInt16(value) {
            this._ensureWrite(this._pos_ + 2);
            this._d_.setInt16(this._pos_, value, this._xd_);
            this._pos_ += 2;
        }
        getUint8() {
            return this.readUint8();
        }
        readUint8() {
            if (this._pos_ + 1 > this._length)
                throw "getUint8 error - Out of bounds";
            return this._u8d_[this._pos_++];
        }
        writeUint8(value) {
            this._ensureWrite(this._pos_ + 1);
            this._d_.setUint8(this._pos_, value);
            this._pos_++;
        }
        _getUInt8(pos) {
            return this._readUInt8(pos);
        }
        _readUInt8(pos) {
            return this._d_.getUint8(pos);
        }
        _getUint16(pos) {
            return this._readUint16(pos);
        }
        _readUint16(pos) {
            return this._d_.getUint16(pos, this._xd_);
        }
        _getMatrix() {
            return this._readMatrix();
        }
        _readMatrix() {
            var rst = new Matrix(this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32());
            return rst;
        }
        _rUTF(len) {
            var max = this._pos_ + len, c, c2, c3, f = String.fromCharCode;
            var u = this._u8d_;
            var strs = [];
            var n = 0;
            strs.length = 1000;
            while (this._pos_ < max) {
                c = u[this._pos_++];
                if (c < 0x80) {
                    if (c != 0)
                        strs[n++] = f(c);
                }
                else if (c < 0xE0) {
                    strs[n++] = f(((c & 0x3F) << 6) | (u[this._pos_++] & 0x7F));
                }
                else if (c < 0xF0) {
                    c2 = u[this._pos_++];
                    strs[n++] = f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[this._pos_++] & 0x7F));
                }
                else {
                    c2 = u[this._pos_++];
                    c3 = u[this._pos_++];
                    strs[n++] = f(((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 << 6) & 0x7F) | (u[this._pos_++] & 0x7F));
                }
            }
            strs.length = n;
            return strs.join('');
        }
        getCustomString(len) {
            return this.readCustomString(len);
        }
        readCustomString(len) {
            var v = "", ulen = 0, c, c2, f = String.fromCharCode;
            var u = this._u8d_;
            while (len > 0) {
                c = u[this._pos_];
                if (c < 0x80) {
                    v += f(c);
                    this._pos_++;
                    len--;
                }
                else {
                    ulen = c - 0x80;
                    this._pos_++;
                    len -= ulen;
                    while (ulen > 0) {
                        c = u[this._pos_++];
                        c2 = u[this._pos_++];
                        v += f((c2 << 8) | c);
                        ulen--;
                    }
                }
            }
            return v;
        }
        get pos() {
            return this._pos_;
        }
        set pos(value) {
            this._pos_ = value;
        }
        get bytesAvailable() {
            return this._length - this._pos_;
        }
        clear() {
            this._pos_ = 0;
            this.length = 0;
        }
        __getBuffer() {
            return this._d_.buffer;
        }
        writeUTFBytes(value) {
            value = value + "";
            for (var i = 0, sz = value.length; i < sz; i++) {
                var c = value.charCodeAt(i);
                if (c <= 0x7F) {
                    this.writeByte(c);
                }
                else if (c <= 0x7FF) {
                    this._ensureWrite(this._pos_ + 2);
                    this._u8d_.set([0xC0 | (c >> 6), 0x80 | (c & 0x3F)], this._pos_);
                    this._pos_ += 2;
                }
                else if (c <= 0xFFFF) {
                    this._ensureWrite(this._pos_ + 3);
                    this._u8d_.set([0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                    this._pos_ += 3;
                }
                else {
                    this._ensureWrite(this._pos_ + 4);
                    this._u8d_.set([0xF0 | (c >> 18), 0x80 | ((c >> 12) & 0x3F), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                    this._pos_ += 4;
                }
            }
        }
        writeUTFString(value) {
            var tPos = this.pos;
            this.writeUint16(1);
            this.writeUTFBytes(value);
            var dPos = this.pos - tPos - 2;
            this._d_.setUint16(tPos, dPos, this._xd_);
        }
        readUTFString() {
            return this.readUTFBytes(this.getUint16());
        }
        getUTFString() {
            return this.readUTFString();
        }
        readUTFBytes(len = -1) {
            if (len === 0)
                return "";
            var lastBytes = this.bytesAvailable;
            if (len > lastBytes)
                throw "readUTFBytes error - Out of bounds";
            len = len > 0 ? len : lastBytes;
            return this._rUTF(len);
        }
        getUTFBytes(len = -1) {
            return this.readUTFBytes(len);
        }
        writeByte(value) {
            this._ensureWrite(this._pos_ + 1);
            this._d_.setInt8(this._pos_, value);
            this._pos_ += 1;
        }
        readByte() {
            if (this._pos_ + 1 > this._length)
                throw "readByte error - Out of bounds";
            return this._d_.getInt8(this._pos_++);
        }
        getByte() {
            return this.readByte();
        }
        _ensureWrite(lengthToEnsure) {
            if (this._length < lengthToEnsure)
                this._length = lengthToEnsure;
            if (this._allocated_ < lengthToEnsure)
                this.length = lengthToEnsure;
        }
        writeArrayBuffer(arraybuffer, offset = 0, length = 0) {
            if (offset < 0 || length < 0)
                throw "writeArrayBuffer error - Out of bounds";
            if (length == 0)
                length = arraybuffer.byteLength - offset;
            this._ensureWrite(this._pos_ + length);
            var uint8array = new Uint8Array(arraybuffer);
            this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
            this._pos_ += length;
        }
        readArrayBuffer(length) {
            var rst;
            rst = this._u8d_.buffer.slice(this._pos_, this._pos_ + length);
            this._pos_ = this._pos_ + length;
            return rst;
        }
    }
    Byte.BIG_ENDIAN = "bigEndian";
    Byte.LITTLE_ENDIAN = "littleEndian";
    Byte._sysEndian = null;

    class Loader extends EventDispatcher {
        constructor() {
            super(...arguments);
            this._customParse = false;
        }
        static getTypeFromUrl(url) {
            var type = Utils.getFileExtension(url);
            if (type)
                return Loader.typeMap[type];
            console.warn("Not recognize the resources suffix", url);
            return "text";
        }
        load(url, type = null, cache = true, group = null, ignoreCache = false, useWorkerLoader = ILaya.WorkerLoader.enable) {
            if (!url) {
                this.onLoaded(null);
                return;
            }
            Loader.setGroup(url, "666");
            this._url = url;
            if (url.indexOf("data:image") === 0)
                type = Loader.IMAGE;
            else
                url = URL.formatURL(url);
            this._type = type || (type = Loader.getTypeFromUrl(this._url));
            this._cache = cache;
            this._useWorkerLoader = useWorkerLoader;
            this._data = null;
            if (useWorkerLoader)
                ILaya.WorkerLoader.enableWorkerLoader();
            if (!ignoreCache && Loader.loadedMap[url]) {
                this._data = Loader.loadedMap[url];
                this.event(Event.PROGRESS, 1);
                this.event(Event.COMPLETE, this._data);
                return;
            }
            if (group)
                Loader.setGroup(url, group);
            if (Loader.parserMap[type] != null) {
                this._customParse = true;
                if (Loader.parserMap[type] instanceof Handler)
                    Loader.parserMap[type].runWith(this);
                else
                    Loader.parserMap[type].call(null, this);
                return;
            }
            this._loadResourceFilter(type, url);
        }
        _loadResourceFilter(type, url) {
            this._loadResource(type, url);
        }
        _loadResource(type, url) {
            switch (type) {
                case Loader.IMAGE:
                case "htmlimage":
                case "nativeimage":
                    this._loadImage(url);
                    break;
                case Loader.SOUND:
                    this._loadSound(url);
                    break;
                case Loader.TTF:
                    this._loadTTF(url);
                    break;
                case Loader.ATLAS:
                case Loader.PREFAB:
                case Loader.PLF:
                    this._loadHttpRequestWhat(url, Loader.JSON);
                    break;
                case Loader.FONT:
                    this._loadHttpRequestWhat(url, Loader.XML);
                    break;
                case Loader.PLFB:
                    this._loadHttpRequestWhat(url, Loader.BUFFER);
                    break;
                default:
                    this._loadHttpRequestWhat(url, type);
            }
        }
        _loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError) {
            if (Browser.onVVMiniGame) {
                this._http = new HttpRequest();
            }
            else {
                if (!this._http)
                    this._http = new HttpRequest();
            }
            this._http.on(Event.PROGRESS, onProcessCaller, onProcess);
            this._http.on(Event.COMPLETE, onLoadCaller, onLoad);
            this._http.on(Event.ERROR, onErrorCaller, onError);
            this._http.send(url, null, "get", contentType);
        }
        _loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError) {
            var image;
            function clear() {
                var img = image;
                img.onload = null;
                img.onerror = null;
                delete Loader._imgCache[url];
            }
            var onerror = function () {
                clear();
                onError.call(onErrorCaller);
            };
            var onload = function () {
                clear();
                onLoad.call(onLoadCaller, image);
            };
            image = new Browser.window.Image();
            image.crossOrigin = "";
            image.onload = onload;
            image.onerror = onerror;
            image.src = url;
            Loader._imgCache[url] = image;
        }
        _loadHttpRequestWhat(url, contentType) {
            if (Loader.preLoadedMap[url])
                this.onLoaded(Loader.preLoadedMap[url]);
            else
                this._loadHttpRequest(url, contentType, this, this.onLoaded, this, this.onProgress, this, this.onError);
        }
        _loadTTF(url) {
            url = URL.formatURL(url);
            var ttfLoader = new ILaya.TTFLoader();
            ttfLoader.complete = Handler.create(this, this.onLoaded);
            ttfLoader.load(url);
        }
        _loadImage(url) {
            var _this = this;
            url = URL.formatURL(url);
            var onLoaded;
            var onError = function () {
                _this.event(Event.ERROR, "Load image failed");
            };
            if (this._type === "nativeimage") {
                onLoaded = function (image) {
                    _this.onLoaded(image);
                };
                this._loadHtmlImage(url, this, onLoaded, this, onError);
            }
            else {
                var ext = Utils.getFileExtension(url);
                if (ext === "ktx" || ext === "pvr") {
                    onLoaded = function (imageData) {
                        var format;
                        switch (ext) {
                            case "ktx":
                                format = 5;
                                break;
                            case "pvr":
                                format = 12;
                                break;
                        }
                        var tex = new Texture2D(0, 0, format, false, false);
                        tex.wrapModeU = BaseTexture.WARPMODE_CLAMP;
                        tex.wrapModeV = BaseTexture.WARPMODE_CLAMP;
                        tex.setCompressData(imageData);
                        tex._setCreateURL(url);
                        _this.onLoaded(tex);
                    };
                    this._loadHttpRequest(url, Loader.BUFFER, this, onLoaded, null, null, this, onError);
                }
                else {
                    onLoaded = function (image) {
                        var tex = new Texture2D(image.width, image.height, 1, false, false);
                        tex.wrapModeU = BaseTexture.WARPMODE_CLAMP;
                        tex.wrapModeV = BaseTexture.WARPMODE_CLAMP;
                        tex.loadImageSource(image, true);
                        tex._setCreateURL(url);
                        _this.onLoaded(tex);
                    };
                    this._loadHtmlImage(url, this, onLoaded, this, onError);
                }
            }
        }
        _loadSound(url) {
            var sound = (new SoundManager._soundClass());
            var _this = this;
            sound.on(Event.COMPLETE, this, soundOnload);
            sound.on(Event.ERROR, this, soundOnErr);
            sound.load(url);
            function soundOnload() {
                clear();
                _this.onLoaded(sound);
            }
            function soundOnErr() {
                clear();
                sound.dispose();
                _this.event(Event.ERROR, "Load sound failed");
            }
            function clear() {
                sound.offAll();
            }
        }
        onProgress(value) {
            if (this._type === Loader.ATLAS)
                this.event(Event.PROGRESS, value * 0.3);
            else
                this.event(Event.PROGRESS, value);
        }
        onError(message) {
            this.event(Event.ERROR, message);
        }
        onLoaded(data = null) {
            var type = this._type;
            if (type == Loader.PLFB) {
                this.parsePLFBData(data);
                this.complete(data);
            }
            else if (type == Loader.PLF) {
                this.parsePLFData(data);
                this.complete(data);
            }
            else if (type === Loader.IMAGE) {
                var tex = new Texture(data);
                tex.url = this._url;
                this.complete(tex);
            }
            else if (type === Loader.SOUND || type === "htmlimage" || type === "nativeimage") {
                this.complete(data);
            }
            else if (type === Loader.ATLAS) {
                if (!(data instanceof Texture2D)) {
                    if (!this._data) {
                        this._data = data;
                        if (data.meta && data.meta.image) {
                            var toloadPics = data.meta.image.split(",");
                            var split = this._url.indexOf("/") >= 0 ? "/" : "\\";
                            var idx = this._url.lastIndexOf(split);
                            var folderPath = idx >= 0 ? this._url.substr(0, idx + 1) : "";
                            var changeType;
                            if (Browser.onAndroid && data.meta.compressTextureAndroid) {
                                changeType = ".ktx";
                            }
                            if (Browser.onIOS && data.meta.compressTextureIOS) {
                                changeType = ".pvr";
                            }
                            for (var i = 0, len = toloadPics.length; i < len; i++) {
                                if (changeType) {
                                    toloadPics[i] = folderPath + toloadPics[i].replace(".png", changeType);
                                }
                                else {
                                    toloadPics[i] = folderPath + toloadPics[i];
                                }
                            }
                        }
                        else {
                            toloadPics = [this._url.replace(".json", ".png")];
                        }
                        toloadPics.reverse();
                        data.toLoads = toloadPics;
                        data.pics = [];
                    }
                    this.event(Event.PROGRESS, 0.3 + 1 / toloadPics.length * 0.6);
                    return this._loadResourceFilter(Loader.IMAGE, toloadPics.pop());
                }
                else {
                    this._data.pics.push(data);
                    if (this._data.toLoads.length > 0) {
                        this.event(Event.PROGRESS, 0.3 + 1 / this._data.toLoads.length * 0.6);
                        return this._loadResourceFilter(Loader.IMAGE, this._data.toLoads.pop());
                    }
                    var frames = this._data.frames;
                    var cleanUrl = this._url.split("?")[0];
                    var directory = (this._data.meta && this._data.meta.prefix) ? this._data.meta.prefix : cleanUrl.substring(0, cleanUrl.lastIndexOf(".")) + "/";
                    var pics = this._data.pics;
                    var atlasURL = URL.formatURL(this._url);
                    var map = Loader.atlasMap[atlasURL] || (Loader.atlasMap[atlasURL] = []);
                    map.dir = directory;
                    var scaleRate = 1;
                    if (this._data.meta && this._data.meta.scale && this._data.meta.scale != 1) {
                        scaleRate = parseFloat(this._data.meta.scale);
                        for (var name in frames) {
                            var obj = frames[name];
                            var tPic = pics[obj.frame.idx ? obj.frame.idx : 0];
                            var url = URL.formatURL(directory + name);
                            tPic.scaleRate = scaleRate;
                            var tTexture;
                            tTexture = Texture._create(tPic, obj.frame.x, obj.frame.y, obj.frame.w, obj.frame.h, obj.spriteSourceSize.x, obj.spriteSourceSize.y, obj.sourceSize.w, obj.sourceSize.h, Loader.getRes(url));
                            Loader.cacheRes(url, tTexture);
                            tTexture.url = url;
                            map.push(url);
                        }
                    }
                    else {
                        for (name in frames) {
                            obj = frames[name];
                            tPic = pics[obj.frame.idx ? obj.frame.idx : 0];
                            url = URL.formatURL(directory + name);
                            tTexture = Texture._create(tPic, obj.frame.x, obj.frame.y, obj.frame.w, obj.frame.h, obj.spriteSourceSize.x, obj.spriteSourceSize.y, obj.sourceSize.w, obj.sourceSize.h, Loader.getRes(url));
                            Loader.cacheRes(url, tTexture);
                            tTexture.url = url;
                            map.push(url);
                        }
                    }
                    delete this._data.pics;
                    this.complete(this._data);
                }
            }
            else if (type === Loader.FONT) {
                if (!data._source) {
                    this._data = data;
                    this.event(Event.PROGRESS, 0.5);
                    return this._loadImage(this._url.replace(".fnt", ".png"));
                }
                else {
                    var bFont = new BitmapFont();
                    bFont.parseFont(this._data, new Texture(data));
                    var tArr = this._url.split(".fnt")[0].split("/");
                    var fontName = tArr[tArr.length - 1];
                    Text.registerBitmapFont(fontName, bFont);
                    this._data = bFont;
                    this.complete(this._data);
                }
            }
            else if (type === Loader.PREFAB) {
                var prefab = new Prefab();
                prefab.json = data;
                this.complete(prefab);
            }
            else {
                this.complete(data);
            }
        }
        parsePLFData(plfData) {
            var type;
            var filePath;
            var fileDic;
            for (type in plfData) {
                fileDic = plfData[type];
                switch (type) {
                    case "json":
                    case "text":
                        for (filePath in fileDic) {
                            Loader.preLoadedMap[URL.formatURL(filePath)] = fileDic[filePath];
                        }
                        break;
                    default:
                        for (filePath in fileDic) {
                            Loader.preLoadedMap[URL.formatURL(filePath)] = fileDic[filePath];
                        }
                }
            }
        }
        parsePLFBData(plfData) {
            var byte;
            byte = new Byte(plfData);
            var i, len;
            len = byte.getInt32();
            for (i = 0; i < len; i++) {
                this.parseOnePLFBFile(byte);
            }
        }
        parseOnePLFBFile(byte) {
            var fileLen;
            var fileName;
            var fileData;
            fileName = byte.getUTFString();
            fileLen = byte.getInt32();
            fileData = byte.readArrayBuffer(fileLen);
            Loader.preLoadedMap[URL.formatURL(fileName)] = fileData;
        }
        complete(data) {
            this._data = data;
            if (this._customParse) {
                this.event(Event.LOADED, data instanceof Array ? [data] : data);
            }
            else {
                Loader._loaders.push(this);
                if (!Loader._isWorking)
                    Loader.checkNext();
            }
        }
        static checkNext() {
            Loader._isWorking = true;
            var startTimer = Browser.now();
            var thisTimer = startTimer;
            while (Loader._startIndex < Loader._loaders.length) {
                thisTimer = Browser.now();
                Loader._loaders[Loader._startIndex].endLoad();
                Loader._startIndex++;
                if (Browser.now() - startTimer > Loader.maxTimeOut) {
                    console.warn("loader callback cost a long time:" + (Browser.now() - startTimer) + " url=" + Loader._loaders[Loader._startIndex - 1].url);
                    ILaya.systemTimer.frameOnce(1, null, Loader.checkNext);
                    return;
                }
            }
            Loader._loaders.length = 0;
            Loader._startIndex = 0;
            Loader._isWorking = false;
        }
        endLoad(content = null) {
            content && (this._data = content);
            if (this._cache)
                Loader.cacheRes(this._url, this._data);
            this.event(Event.PROGRESS, 1);
            this.event(Event.COMPLETE, this.data instanceof Array ? [this.data] : this.data);
        }
        get url() {
            return this._url;
        }
        get type() {
            return this._type;
        }
        get cache() {
            return this._cache;
        }
        get data() {
            return this._data;
        }
        static clearRes(url) {
            url = URL.formatURL(url);
            var arr = Loader.getAtlas(url);
            if (arr) {
                for (var i = 0, n = arr.length; i < n; i++) {
                    var resUrl = arr[i];
                    var tex = Loader.getRes(resUrl);
                    delete Loader.loadedMap[resUrl];
                    if (tex)
                        tex.destroy();
                }
                arr.length = 0;
                delete Loader.atlasMap[url];
                delete Loader.loadedMap[url];
            }
            else {
                var res = Loader.loadedMap[url];
                if (res) {
                    delete Loader.loadedMap[url];
                    if (res instanceof Texture && res.bitmap)
                        res.destroy();
                }
            }
        }
        static clearTextureRes(url) {
            url = URL.formatURL(url);
            var arr = Loader.getAtlas(url);
            if (arr && arr.length > 0) {
                arr.forEach(function (t) {
                    var tex = Loader.getRes(t);
                    if (tex instanceof Texture) {
                        tex.disposeBitmap();
                    }
                });
            }
            else {
                var t = Loader.getRes(url);
                if (t instanceof Texture) {
                    t.disposeBitmap();
                }
            }
        }
        static getRes(url) {
            return Loader.loadedMap[URL.formatURL(url)];
        }
        static getAtlas(url) {
            return Loader.atlasMap[URL.formatURL(url)];
        }
        static cacheRes(url, data) {
            url = URL.formatURL(url);
            if (Loader.loadedMap[url] != null) {
                console.warn("Resources already exist,is repeated loading:", url);
            }
            else {
                Loader.loadedMap[url] = data;
            }
        }
        static setGroup(url, group) {
            if (!Loader.groupMap[group])
                Loader.groupMap[group] = [];
            Loader.groupMap[group].push(url);
        }
        static clearResByGroup(group) {
            if (!Loader.groupMap[group])
                return;
            var arr = Loader.groupMap[group], i, len = arr.length;
            for (i = 0; i < len; i++) {
                Loader.clearRes(arr[i]);
            }
            arr.length = 0;
        }
    }
    Loader.TEXT = "text";
    Loader.JSON = "json";
    Loader.PREFAB = "prefab";
    Loader.XML = "xml";
    Loader.BUFFER = "arraybuffer";
    Loader.IMAGE = "image";
    Loader.SOUND = "sound";
    Loader.ATLAS = "atlas";
    Loader.FONT = "font";
    Loader.TTF = "ttf";
    Loader.PLF = "plf";
    Loader.PLFB = "plfb";
    Loader.HIERARCHY = "HIERARCHY";
    Loader.MESH = "MESH";
    Loader.MATERIAL = "MATERIAL";
    Loader.TEXTURE2D = "TEXTURE2D";
    Loader.TEXTURECUBE = "TEXTURECUBE";
    Loader.ANIMATIONCLIP = "ANIMATIONCLIP";
    Loader.AVATAR = "AVATAR";
    Loader.TERRAINHEIGHTDATA = "TERRAINHEIGHTDATA";
    Loader.TERRAINRES = "TERRAIN";
    Loader.typeMap = { "ttf": "ttf", "png": "image", "jpg": "image", "jpeg": "image", "ktx": "image", "pvr": "image", "txt": "text", "json": "json", "prefab": "prefab", "xml": "xml", "als": "atlas", "atlas": "atlas", "mp3": "sound", "ogg": "sound", "wav": "sound", "part": "json", "fnt": "font", "plf": "plf", "plfb": "plfb", "scene": "json", "ani": "json", "sk": "arraybuffer" };
    Loader.parserMap = {};
    Loader.maxTimeOut = 100;
    Loader.groupMap = {};
    Loader.loadedMap = {};
    Loader.atlasMap = {};
    Loader.preLoadedMap = {};
    Loader._imgCache = {};
    Loader._loaders = [];
    Loader._isWorking = false;
    Loader._startIndex = 0;

    class AtlasInfoManager {
        static enable(infoFile, callback = null) {
            ILaya.loader.load(infoFile, Handler.create(null, AtlasInfoManager._onInfoLoaded, [callback]), null, Loader.JSON);
        }
        static _onInfoLoaded(callback, data) {
            var tKey;
            var tPrefix;
            var tArr;
            var i, len;
            for (tKey in data) {
                tArr = data[tKey];
                tPrefix = tArr[0];
                tArr = tArr[1];
                len = tArr.length;
                for (i = 0; i < len; i++) {
                    AtlasInfoManager._fileLoadDic[tPrefix + tArr[i]] = tKey;
                }
            }
            callback && callback.run();
        }
        static getFileLoadPath(file) {
            return AtlasInfoManager._fileLoadDic[file] || file;
        }
    }
    AtlasInfoManager._fileLoadDic = {};

    class LoaderManager extends EventDispatcher {
        constructor() {
            super();
            this.retryNum = 1;
            this.retryDelay = 0;
            this.maxLoader = 5;
            this._loaders = [];
            this._loaderCount = 0;
            this._resInfos = [];
            this._infoPool = [];
            this._maxPriority = 5;
            this._failRes = {};
            this._statInfo = { count: 1, loaded: 1 };
            for (var i = 0; i < this._maxPriority; i++)
                this._resInfos[i] = [];
        }
        getProgress() {
            return this._statInfo.loaded / this._statInfo.count;
        }
        resetProgress() {
            this._statInfo.count = this._statInfo.loaded = 1;
        }
        create(url, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true) {
            this._create(url, true, complete, progress, type, constructParams, propertyParams, priority, cache);
        }
        _create(url, mainResou, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true) {
            if (url instanceof Array) {
                var allScuess = true;
                var items = url;
                var itemCount = items.length;
                var loadedCount = 0;
                if (progress) {
                    var progress2 = Handler.create(progress.caller, progress.method, progress.args, false);
                }
                for (var i = 0; i < itemCount; i++) {
                    var item = items[i];
                    if (typeof (item) == 'string')
                        item = items[i] = { url: item };
                    item.progress = 0;
                }
                for (i = 0; i < itemCount; i++) {
                    item = items[i];
                    var progressHandler = progress ? Handler.create(null, function (item, value) {
                        item.progress = value;
                        var num = 0;
                        for (var j = 0; j < itemCount; j++) {
                            var item1 = items[j];
                            num += item1.progress;
                        }
                        var v = num / itemCount;
                        progress2.runWith(v);
                    }, [item], false) : null;
                    var completeHandler = (progress || complete) ? Handler.create(null, function (item, content = null) {
                        loadedCount++;
                        item.progress = 1;
                        content || (allScuess = false);
                        if (loadedCount === itemCount && complete) {
                            complete.runWith(allScuess);
                        }
                    }, [item]) : null;
                    this._createOne(item.url, mainResou, completeHandler, progressHandler, item.type || type, item.constructParams || constructParams, item.propertyParams || propertyParams, item.priority || priority, cache);
                }
            }
            else {
                this._createOne(url, mainResou, complete, progress, type, constructParams, propertyParams, priority, cache);
            }
        }
        _createOne(url, mainResou, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true) {
            var item = this.getRes(url);
            if (!item) {
                var extension = Utils.getFileExtension(url);
                (type) || (type = LoaderManager.createMap[extension] ? LoaderManager.createMap[extension][0] : null);
                if (!type) {
                    this.load(url, complete, progress, type, priority, cache);
                    return;
                }
                var parserMap = Loader.parserMap;
                if (!parserMap[type]) {
                    this.load(url, complete, progress, type, priority, cache);
                    return;
                }
                this._createLoad(url, Handler.create(null, function (createRes) {
                    if (createRes) {
                        if (!mainResou && createRes instanceof Resource)
                            createRes._addReference();
                        createRes._setCreateURL(url);
                    }
                    complete && complete.runWith(createRes);
                    ILaya.loader.event(url);
                }), progress, type, constructParams, propertyParams, priority, cache, true);
            }
            else {
                if (!mainResou && item instanceof Resource)
                    item._addReference();
                progress && progress.runWith(1);
                complete && complete.runWith(item);
            }
        }
        load(url, complete = null, progress = null, type = null, priority = 1, cache = true, group = null, ignoreCache = false, useWorkerLoader = ILaya.WorkerLoader.enable) {
            if (url instanceof Array)
                return this._loadAssets(url, complete, progress, type, priority, cache, group);
            var content = Loader.getRes(url);
            if (!ignoreCache && content != null) {
                ILaya.systemTimer.frameOnce(1, this, function () {
                    progress && progress.runWith(1);
                    complete && complete.runWith(content instanceof Array ? [content] : content);
                    this._loaderCount || this.event(Event.COMPLETE);
                });
            }
            else {
                var original;
                original = url;
                url = AtlasInfoManager.getFileLoadPath(url);
                if (url != original && type !== "nativeimage") {
                    type = Loader.ATLAS;
                }
                else {
                    original = null;
                }
                var info = LoaderManager._resMap[url];
                if (!info) {
                    info = this._infoPool.length ? this._infoPool.pop() : new ResInfo();
                    info.url = url;
                    info.type = type;
                    info.cache = cache;
                    info.group = group;
                    info.ignoreCache = ignoreCache;
                    info.useWorkerLoader = useWorkerLoader;
                    info.originalUrl = original;
                    complete && info.on(Event.COMPLETE, complete.caller, complete.method, complete.args);
                    progress && info.on(Event.PROGRESS, progress.caller, progress.method, progress.args);
                    LoaderManager._resMap[url] = info;
                    priority = priority < this._maxPriority ? priority : this._maxPriority - 1;
                    this._resInfos[priority].push(info);
                    this._statInfo.count++;
                    this.event(Event.PROGRESS, this.getProgress());
                    this._next();
                }
                else {
                    if (complete) {
                        if (original) {
                            complete && info._createListener(Event.COMPLETE, this, this._resInfoLoaded, [original, complete], false, false);
                        }
                        else {
                            complete && info._createListener(Event.COMPLETE, complete.caller, complete.method, complete.args, false, false);
                        }
                    }
                    progress && info._createListener(Event.PROGRESS, progress.caller, progress.method, progress.args, false, false);
                }
            }
            return this;
        }
        _resInfoLoaded(original, complete) {
            complete.runWith(Loader.getRes(original));
        }
        _createLoad(url, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true, ignoreCache = false) {
            if (url instanceof Array)
                return this._loadAssets(url, complete, progress, type, priority, cache);
            var content = Loader.getRes(url);
            if (content != null) {
                ILaya.systemTimer.frameOnce(1, this, function () {
                    progress && progress.runWith(1);
                    complete && complete.runWith(content);
                    this._loaderCount || this.event(Event.COMPLETE);
                });
            }
            else {
                var info = LoaderManager._resMap[url];
                if (!info) {
                    info = this._infoPool.length ? this._infoPool.pop() : new ResInfo();
                    info.url = url;
                    info.type = type;
                    info.cache = false;
                    info.ignoreCache = ignoreCache;
                    info.originalUrl = null;
                    info.group = null;
                    info.createCache = cache;
                    info.createConstructParams = constructParams;
                    info.createPropertyParams = propertyParams;
                    complete && info.on(Event.COMPLETE, complete.caller, complete.method, complete.args);
                    progress && info.on(Event.PROGRESS, progress.caller, progress.method, progress.args);
                    LoaderManager._resMap[url] = info;
                    priority = priority < this._maxPriority ? priority : this._maxPriority - 1;
                    this._resInfos[priority].push(info);
                    this._statInfo.count++;
                    this.event(Event.PROGRESS, this.getProgress());
                    this._next();
                }
                else {
                    complete && info._createListener(Event.COMPLETE, complete.caller, complete.method, complete.args, false, false);
                    progress && info._createListener(Event.PROGRESS, progress.caller, progress.method, progress.args, false, false);
                }
            }
            return this;
        }
        _next() {
            if (this._loaderCount >= this.maxLoader)
                return;
            for (var i = 0; i < this._maxPriority; i++) {
                var infos = this._resInfos[i];
                while (infos.length > 0) {
                    var info = infos.shift();
                    if (info)
                        return this._doLoad(info);
                }
            }
            this._loaderCount || this.event(Event.COMPLETE);
        }
        _doLoad(resInfo) {
            this._loaderCount++;
            var loader = this._loaders.length ? this._loaders.pop() : new Loader();
            loader.on(Event.COMPLETE, null, onLoaded);
            loader.on(Event.PROGRESS, null, function (num) {
                resInfo.event(Event.PROGRESS, num);
            });
            loader.on(Event.ERROR, null, function (msg) {
                onLoaded(null);
            });
            var _me = this;
            function onLoaded(data = null) {
                loader.offAll();
                loader._data = null;
                loader._customParse = false;
                _me._loaders.push(loader);
                _me._endLoad(resInfo, data instanceof Array ? [data] : data);
                _me._loaderCount--;
                _me._next();
            }
            loader._constructParams = resInfo.createConstructParams;
            loader._propertyParams = resInfo.createPropertyParams;
            loader._createCache = resInfo.createCache;
            loader.load(resInfo.url, resInfo.type, resInfo.cache, resInfo.group, resInfo.ignoreCache, resInfo.useWorkerLoader);
        }
        _endLoad(resInfo, content) {
            var url = resInfo.url;
            if (content == null) {
                var errorCount = this._failRes[url] || 0;
                if (errorCount < this.retryNum) {
                    console.warn("[warn]Retry to load:", url);
                    this._failRes[url] = errorCount + 1;
                    ILaya.systemTimer.once(this.retryDelay, this, this._addReTry, [resInfo], false);
                    return;
                }
                else {
                    Loader.clearRes(url);
                    console.warn("[error]Failed to load:", url);
                    this.event(Event.ERROR, url);
                }
            }
            if (this._failRes[url])
                this._failRes[url] = 0;
            delete LoaderManager._resMap[url];
            if (resInfo.originalUrl) {
                content = Loader.getRes(resInfo.originalUrl);
            }
            resInfo.event(Event.COMPLETE, content);
            resInfo.offAll();
            this._infoPool.push(resInfo);
            this._statInfo.loaded++;
            this.event(Event.PROGRESS, this.getProgress());
        }
        _addReTry(resInfo) {
            this._resInfos[this._maxPriority - 1].push(resInfo);
            this._next();
        }
        clearRes(url) {
            Loader.clearRes(url);
        }
        clearTextureRes(url) {
            Loader.clearTextureRes(url);
        }
        getRes(url) {
            return Loader.getRes(url);
        }
        cacheRes(url, data) {
            Loader.cacheRes(url, data);
        }
        setGroup(url, group) {
            Loader.setGroup(url, group);
        }
        clearResByGroup(group) {
            Loader.clearResByGroup(group);
        }
        static cacheRes(url, data) {
            Loader.cacheRes(url, data);
        }
        clearUnLoaded() {
            for (var i = 0; i < this._maxPriority; i++) {
                var infos = this._resInfos[i];
                for (var j = infos.length - 1; j > -1; j--) {
                    var info = infos[j];
                    if (info) {
                        info.offAll();
                        this._infoPool.push(info);
                    }
                }
                infos.length = 0;
            }
            this._loaderCount = 0;
            LoaderManager._resMap = {};
        }
        cancelLoadByUrls(urls) {
            if (!urls)
                return;
            for (var i = 0, n = urls.length; i < n; i++) {
                this.cancelLoadByUrl(urls[i]);
            }
        }
        cancelLoadByUrl(url) {
            for (var i = 0; i < this._maxPriority; i++) {
                var infos = this._resInfos[i];
                for (var j = infos.length - 1; j > -1; j--) {
                    var info = infos[j];
                    if (info && info.url === url) {
                        infos[j] = null;
                        info.offAll();
                        this._infoPool.push(info);
                    }
                }
            }
            if (LoaderManager._resMap[url])
                delete LoaderManager._resMap[url];
        }
        _loadAssets(arr, complete = null, progress = null, type = null, priority = 1, cache = true, group = null) {
            var itemCount = arr.length;
            var loadedCount = 0;
            var totalSize = 0;
            var items = [];
            var success = true;
            for (var i = 0; i < itemCount; i++) {
                var item = arr[i];
                if (typeof (item) == 'string')
                    item = { url: item, type: type, size: 1, priority: priority };
                if (!item.size)
                    item.size = 1;
                item.progress = 0;
                totalSize += item.size;
                items.push(item);
                var progressHandler = progress ? Handler.create(null, loadProgress, [item], false) : null;
                var completeHandler = (complete || progress) ? Handler.create(null, loadComplete, [item]) : null;
                this.load(item.url, completeHandler, progressHandler, item.type, item.priority || 1, cache, item.group || group, false, item.useWorkerLoader);
            }
            function loadComplete(item, content = null) {
                loadedCount++;
                item.progress = 1;
                if (!content)
                    success = false;
                if (loadedCount === itemCount && complete) {
                    complete.runWith(success);
                }
            }
            function loadProgress(item, value) {
                if (progress != null) {
                    item.progress = value;
                    var num = 0;
                    for (var j = 0; j < items.length; j++) {
                        var item1 = items[j];
                        num += item1.size * item1.progress;
                    }
                    var v = num / totalSize;
                    progress.runWith(v);
                }
            }
            return this;
        }
        decodeBitmaps(urls) {
            var i, len = urls.length;
            var ctx;
            ctx = ILaya.Render._context;
            for (i = 0; i < len; i++) {
                var atlas;
                atlas = Loader.getAtlas(urls[i]);
                if (atlas) {
                    this._decodeTexture(atlas[0], ctx);
                }
                else {
                    var tex;
                    tex = this.getRes(urls[i]);
                    if (tex && tex instanceof Texture) {
                        this._decodeTexture(tex, ctx);
                    }
                }
            }
        }
        _decodeTexture(tex, ctx) {
            var bitmap = tex.bitmap;
            if (!tex || !bitmap)
                return;
            var tImg = bitmap.source || bitmap.image;
            if (!tImg)
                return;
            if (tImg instanceof HTMLImageElement) {
                ctx.drawImage(tImg, 0, 0, 1, 1);
                var info = ctx.getImageData(0, 0, 1, 1);
            }
        }
    }
    LoaderManager._resMap = {};
    LoaderManager.createMap = { atlas: [null, Loader.ATLAS] };
    class ResInfo extends EventDispatcher {
    }

    class LocalStorage {
        static __init__() {
            if (!LocalStorage._baseClass) {
                LocalStorage._baseClass = Storage;
                Storage.init();
            }
            LocalStorage.items = LocalStorage._baseClass.items;
            LocalStorage.support = LocalStorage._baseClass.support;
            return LocalStorage.support;
        }
        static setItem(key, value) {
            LocalStorage._baseClass.setItem(key, value);
        }
        static getItem(key) {
            return LocalStorage._baseClass.getItem(key);
        }
        static setJSON(key, value) {
            LocalStorage._baseClass.setJSON(key, value);
        }
        static getJSON(key) {
            return LocalStorage._baseClass.getJSON(key);
        }
        static removeItem(key) {
            LocalStorage._baseClass.removeItem(key);
        }
        static clear() {
            LocalStorage._baseClass.clear();
        }
    }
    LocalStorage.support = false;
    class Storage {
        static init() {
            try {
                Storage.support = true;
                Storage.items = window.localStorage;
                Storage.setItem('laya', '1');
                Storage.removeItem('laya');
            }
            catch (e) {
                Storage.support = false;
            }
            if (!Storage.support)
                console.log('LocalStorage is not supprot or browser is private mode.');
        }
        static setItem(key, value) {
            try {
                Storage.support && Storage.items.setItem(key, value);
            }
            catch (e) {
                console.warn("set localStorage failed", e);
            }
        }
        static getItem(key) {
            return Storage.support ? Storage.items.getItem(key) : null;
        }
        static setJSON(key, value) {
            try {
                Storage.support && Storage.items.setItem(key, JSON.stringify(value));
            }
            catch (e) {
                console.warn("set localStorage failed", e);
            }
        }
        static getJSON(key) {
            return JSON.parse(Storage.support ? Storage.items.getItem(key) : null);
        }
        static removeItem(key) {
            Storage.support && Storage.items.removeItem(key);
        }
        static clear() {
            Storage.support && Storage.items.clear();
        }
    }
    Storage.support = false;

    class TTFLoader {
        load(fontPath) {
            this._url = fontPath;
            var tArr = fontPath.split(".ttf")[0].split("/");
            this.fontName = tArr[tArr.length - 1];
            if (ILaya.Render.isConchApp) {
                this._loadConch();
            }
            else if (window.FontFace) {
                this._loadWithFontFace();
            }
            else {
                this._loadWithCSS();
            }
        }
        _loadConch() {
            this._http = new HttpRequest();
            this._http.on(Event.ERROR, this, this._onErr);
            this._http.on(Event.COMPLETE, this, this._onHttpLoaded);
            this._http.send(this._url, null, "get", Loader.BUFFER);
        }
        _onHttpLoaded(data = null) {
            window["conchTextCanvas"].setFontFaceFromBuffer(this.fontName, data);
            this._clearHttp();
            this._complete();
        }
        _clearHttp() {
            if (this._http) {
                this._http.off(Event.ERROR, this, this._onErr);
                this._http.off(Event.COMPLETE, this, this._onHttpLoaded);
                this._http = null;
            }
        }
        _onErr() {
            this._clearHttp();
            if (this.err) {
                this.err.runWith("fail:" + this._url);
                this.err = null;
            }
        }
        _complete() {
            ILaya.systemTimer.clear(this, this._complete);
            ILaya.systemTimer.clear(this, this._checkComplete);
            if (this._div && this._div.parentNode) {
                this._div.parentNode.removeChild(this._div);
                this._div = null;
            }
            if (this.complete) {
                this.complete.runWith(this);
                this.complete = null;
            }
        }
        _checkComplete() {
            if (ILaya.Browser.measureText(TTFLoader._testString, this._fontTxt).width != this._txtWidth) {
                this._complete();
            }
        }
        _loadWithFontFace() {
            var fontFace = new window.FontFace(this.fontName, "url('" + this._url + "')");
            document.fonts.add(fontFace);
            var self = this;
            fontFace.loaded.then((function () {
                self._complete();
            }));
            fontFace.load();
        }
        _createDiv() {
            this._div = Browser.createElement("div");
            this._div.innerHTML = "laya";
            var _style = this._div.style;
            _style.fontFamily = this.fontName;
            _style.position = "absolute";
            _style.left = "-100px";
            _style.top = "-100px";
            document.body.appendChild(this._div);
        }
        _loadWithCSS() {
            var fontStyle = Browser.createElement("style");
            fontStyle.type = "text/css";
            document.body.appendChild(fontStyle);
            fontStyle.textContent = "@font-face { font-family:'" + this.fontName + "'; src:url('" + this._url + "');}";
            this._fontTxt = "40px " + this.fontName;
            this._txtWidth = Browser.measureText(TTFLoader._testString, this._fontTxt).width;
            var self = this;
            fontStyle.onload = function () {
                ILaya.systemTimer.once(10000, self, this._complete);
            };
            ILaya.systemTimer.loop(20, this, this._checkComplete);
            this._createDiv();
        }
    }
    TTFLoader._testString = "LayaTTFFont";

    class Ease {
        static linearNone(t, b, c, d) {
            return c * t / d + b;
        }
        static linearIn(t, b, c, d) {
            return c * t / d + b;
        }
        static linearInOut(t, b, c, d) {
            return c * t / d + b;
        }
        static linearOut(t, b, c, d) {
            return c * t / d + b;
        }
        static bounceIn(t, b, c, d) {
            return c - Ease.bounceOut(d - t, 0, c, d) + b;
        }
        static bounceInOut(t, b, c, d) {
            if (t < d * 0.5)
                return Ease.bounceIn(t * 2, 0, c, d) * .5 + b;
            else
                return Ease.bounceOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
        static bounceOut(t, b, c, d) {
            if ((t /= d) < (1 / 2.75))
                return c * (7.5625 * t * t) + b;
            else if (t < (2 / 2.75))
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            else if (t < (2.5 / 2.75))
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            else
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
        static backIn(t, b, c, d, s = 1.70158) {
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        }
        static backInOut(t, b, c, d, s = 1.70158) {
            if ((t /= d * 0.5) < 1)
                return c * 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
        static backOut(t, b, c, d, s = 1.70158) {
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        }
        static elasticIn(t, b, c, d, a = 0, p = 0) {
            var s;
            if (t == 0)
                return b;
            if ((t /= d) == 1)
                return b + c;
            if (!p)
                p = d * .3;
            if (!a || (c > 0 && a < c) || (c < 0 && a < -c)) {
                a = c;
                s = p / 4;
            }
            else
                s = p / Ease.PI2 * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * Ease.PI2 / p)) + b;
        }
        static elasticInOut(t, b, c, d, a = 0, p = 0) {
            var s;
            if (t == 0)
                return b;
            if ((t /= d * 0.5) == 2)
                return b + c;
            if (!p)
                p = d * (.3 * 1.5);
            if (!a || (c > 0 && a < c) || (c < 0 && a < -c)) {
                a = c;
                s = p / 4;
            }
            else
                s = p / Ease.PI2 * Math.asin(c / a);
            if (t < 1)
                return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * Ease.PI2 / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * Ease.PI2 / p) * .5 + c + b;
        }
        static elasticOut(t, b, c, d, a = 0, p = 0) {
            var s;
            if (t == 0)
                return b;
            if ((t /= d) == 1)
                return b + c;
            if (!p)
                p = d * .3;
            if (!a || (c > 0 && a < c) || (c < 0 && a < -c)) {
                a = c;
                s = p / 4;
            }
            else
                s = p / Ease.PI2 * Math.asin(c / a);
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * Ease.PI2 / p) + c + b);
        }
        static strongIn(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        }
        static strongInOut(t, b, c, d) {
            if ((t /= d * 0.5) < 1)
                return c * 0.5 * t * t * t * t * t + b;
            return c * 0.5 * ((t -= 2) * t * t * t * t + 2) + b;
        }
        static strongOut(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        }
        static sineInOut(t, b, c, d) {
            return -c * 0.5 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
        static sineIn(t, b, c, d) {
            return -c * Math.cos(t / d * Ease.HALF_PI) + c + b;
        }
        static sineOut(t, b, c, d) {
            return c * Math.sin(t / d * Ease.HALF_PI) + b;
        }
        static quintIn(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        }
        static quintInOut(t, b, c, d) {
            if ((t /= d * 0.5) < 1)
                return c * 0.5 * t * t * t * t * t + b;
            return c * 0.5 * ((t -= 2) * t * t * t * t + 2) + b;
        }
        static quintOut(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        }
        static quartIn(t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        }
        static quartInOut(t, b, c, d) {
            if ((t /= d * 0.5) < 1)
                return c * 0.5 * t * t * t * t + b;
            return -c * 0.5 * ((t -= 2) * t * t * t - 2) + b;
        }
        static quartOut(t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        }
        static cubicIn(t, b, c, d) {
            return c * (t /= d) * t * t + b;
        }
        static cubicInOut(t, b, c, d) {
            if ((t /= d * 0.5) < 1)
                return c * 0.5 * t * t * t + b;
            return c * 0.5 * ((t -= 2) * t * t + 2) + b;
        }
        static cubicOut(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        }
        static quadIn(t, b, c, d) {
            return c * (t /= d) * t + b;
        }
        static quadInOut(t, b, c, d) {
            if ((t /= d * 0.5) < 1)
                return c * 0.5 * t * t + b;
            return -c * 0.5 * ((--t) * (t - 2) - 1) + b;
        }
        static quadOut(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        }
        static expoIn(t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
        }
        static expoInOut(t, b, c, d) {
            if (t == 0)
                return b;
            if (t == d)
                return b + c;
            if ((t /= d * 0.5) < 1)
                return c * 0.5 * Math.pow(2, 10 * (t - 1)) + b;
            return c * 0.5 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
        static expoOut(t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        }
        static circIn(t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        }
        static circInOut(t, b, c, d) {
            if ((t /= d * 0.5) < 1)
                return -c * 0.5 * (Math.sqrt(1 - t * t) - 1) + b;
            return c * 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        }
        static circOut(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        }
    }
    Ease.HALF_PI = Math.PI * 0.5;
    Ease.PI2 = Math.PI * 2;

    class Tween {
        constructor() {
            this.gid = 0;
            this.repeat = 1;
            this._count = 0;
        }
        static to(target, props, duration, ease = null, complete = null, delay = 0, coverBefore = false, autoRecover = true) {
            return Pool.getItemByClass("tween", Tween)._create(target, props, duration, ease, complete, delay, coverBefore, true, autoRecover, true);
        }
        static from(target, props, duration, ease = null, complete = null, delay = 0, coverBefore = false, autoRecover = true) {
            return Pool.getItemByClass("tween", Tween)._create(target, props, duration, ease, complete, delay, coverBefore, false, autoRecover, true);
        }
        to(target, props, duration, ease = null, complete = null, delay = 0, coverBefore = false) {
            return this._create(target, props, duration, ease, complete, delay, coverBefore, true, false, true);
        }
        from(target, props, duration, ease = null, complete = null, delay = 0, coverBefore = false) {
            return this._create(target, props, duration, ease, complete, delay, coverBefore, false, false, true);
        }
        _create(target, props, duration, ease, complete, delay, coverBefore, isTo, usePool, runNow) {
            if (!target)
                throw new Error("Tween:target is null");
            this._target = target;
            this._duration = duration;
            this._ease = ease || props.ease || Tween.easeNone;
            this._complete = complete || props.complete;
            this._delay = delay;
            this._props = [];
            this._usedTimer = 0;
            this._startTimer = Browser.now();
            this._usedPool = usePool;
            this._delayParam = null;
            this.update = props.update;
            var gid = (target.$_GID || (target.$_GID = Utils.getGID()));
            if (!Tween.tweenMap[gid]) {
                Tween.tweenMap[gid] = [this];
            }
            else {
                if (coverBefore)
                    Tween.clearTween(target);
                Tween.tweenMap[gid].push(this);
            }
            if (runNow) {
                if (delay <= 0)
                    this.firstStart(target, props, isTo);
                else {
                    this._delayParam = [target, props, isTo];
                    ILaya.timer.once(delay, this, this.firstStart, this._delayParam);
                }
            }
            else {
                this._initProps(target, props, isTo);
            }
            return this;
        }
        firstStart(target, props, isTo) {
            this._delayParam = null;
            if (target.destroyed) {
                this.clear();
                return;
            }
            this._initProps(target, props, isTo);
            this._beginLoop();
        }
        _initProps(target, props, isTo) {
            for (var p in props) {
                if (typeof (target[p]) == 'number') {
                    var start = isTo ? target[p] : props[p];
                    var end = isTo ? props[p] : target[p];
                    this._props.push([p, start, end - start]);
                    if (!isTo)
                        target[p] = start;
                }
            }
        }
        _beginLoop() {
            ILaya.timer.frameLoop(1, this, this._doEase);
        }
        _doEase() {
            this._updateEase(Browser.now());
        }
        _updateEase(time) {
            var target = this._target;
            if (!target)
                return;
            if (target.destroyed)
                return Tween.clearTween(target);
            var usedTimer = this._usedTimer = time - this._startTimer - this._delay;
            if (usedTimer < 0)
                return;
            if (usedTimer >= this._duration)
                return this.complete();
            var ratio = usedTimer > 0 ? this._ease(usedTimer, 0, 1, this._duration) : 0;
            var props = this._props;
            for (var i = 0, n = props.length; i < n; i++) {
                var prop = props[i];
                target[prop[0]] = prop[1] + (ratio * prop[2]);
            }
            if (this.update)
                this.update.run();
        }
        set progress(v) {
            var uTime = v * this._duration;
            this._startTimer = Browser.now() - this._delay - uTime;
        }
        complete() {
            if (!this._target)
                return;
            ILaya.timer.runTimer(this, this.firstStart);
            var target = this._target;
            var props = this._props;
            var handler = this._complete;
            for (var i = 0, n = props.length; i < n; i++) {
                var prop = props[i];
                target[prop[0]] = prop[1] + prop[2];
            }
            if (this.update)
                this.update.run();
            this._count++;
            if (this.repeat != 0 && this._count >= this.repeat) {
                this.clear();
                handler && handler.run();
            }
            else {
                this.restart();
            }
        }
        pause() {
            ILaya.timer.clear(this, this._beginLoop);
            ILaya.timer.clear(this, this._doEase);
            ILaya.timer.clear(this, this.firstStart);
            var time = Browser.now();
            var dTime;
            dTime = time - this._startTimer - this._delay;
            if (dTime < 0) {
                this._usedTimer = dTime;
            }
        }
        setStartTime(startTime) {
            this._startTimer = startTime;
        }
        static clearAll(target) {
            if (!target || !target.$_GID)
                return;
            var tweens = Tween.tweenMap[target.$_GID];
            if (tweens) {
                for (var i = 0, n = tweens.length; i < n; i++) {
                    tweens[i]._clear();
                }
                tweens.length = 0;
            }
        }
        static clear(tween) {
            tween.clear();
        }
        static clearTween(target) {
            Tween.clearAll(target);
        }
        clear() {
            if (this._target) {
                this._remove();
                this._clear();
            }
        }
        _clear() {
            this.pause();
            ILaya.timer.clear(this, this.firstStart);
            this._complete = null;
            this._target = null;
            this._ease = null;
            this._props = null;
            this._delayParam = null;
            if (this._usedPool) {
                this.update = null;
                Pool.recover("tween", this);
            }
        }
        recover() {
            this._usedPool = true;
            this._clear();
        }
        _remove() {
            var tweens = Tween.tweenMap[this._target.$_GID];
            if (tweens) {
                for (var i = 0, n = tweens.length; i < n; i++) {
                    if (tweens[i] === this) {
                        tweens.splice(i, 1);
                        break;
                    }
                }
            }
        }
        restart() {
            this.pause();
            this._usedTimer = 0;
            this._startTimer = Browser.now();
            if (this._delayParam) {
                ILaya.timer.once(this._delay, this, this.firstStart, this._delayParam);
                return;
            }
            var props = this._props;
            for (var i = 0, n = props.length; i < n; i++) {
                var prop = props[i];
                this._target[prop[0]] = prop[1];
            }
            ILaya.timer.once(this._delay, this, this._beginLoop);
        }
        resume() {
            if (this._usedTimer >= this._duration)
                return;
            this._startTimer = Browser.now() - this._usedTimer - this._delay;
            if (this._delayParam) {
                if (this._usedTimer < 0) {
                    ILaya.timer.once(-this._usedTimer, this, this.firstStart, this._delayParam);
                }
                else {
                    this.firstStart.apply(this, this._delayParam);
                }
            }
            else {
                this._beginLoop();
            }
        }
        static easeNone(t, b, c, d) {
            return c * t / d + b;
        }
    }
    Tween.tweenMap = [];

    class Dragging {
        constructor() {
            this.ratio = 0.92;
            this.maxOffset = 60;
            this._dragging = false;
            this._clickOnly = true;
        }
        start(target, area, hasInertia, elasticDistance, elasticBackTime, data, disableMouseEvent, ratio = 0.92) {
            this.clearTimer();
            this.target = target;
            this.area = area;
            this.hasInertia = hasInertia;
            this.elasticDistance = area ? elasticDistance : 0;
            this.elasticBackTime = elasticBackTime;
            this.data = data;
            this._disableMouseEvent = disableMouseEvent;
            this.ratio = ratio;
            this._parent = target.parent;
            this._clickOnly = true;
            this._dragging = true;
            this._elasticRateX = this._elasticRateY = 1;
            this._lastX = this._parent.mouseX;
            this._lastY = this._parent.mouseY;
            ILaya.stage.on(Event.MOUSE_UP, this, this.onStageMouseUp);
            ILaya.stage.on(Event.MOUSE_OUT, this, this.onStageMouseUp);
            ILaya.systemTimer.frameLoop(1, this, this.loop);
        }
        clearTimer() {
            ILaya.systemTimer.clear(this, this.loop);
            ILaya.systemTimer.clear(this, this.tweenMove);
            if (this._tween) {
                this._tween.recover();
                this._tween = null;
            }
        }
        stop() {
            if (this._dragging) {
                MouseManager.instance.disableMouseEvent = false;
                ILaya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp);
                ILaya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp);
                this._dragging = false;
                this.target && this.area && this.backToArea();
                this.clear();
            }
        }
        loop() {
            var point = this._parent.getMousePoint();
            var mouseX = point.x;
            var mouseY = point.y;
            var offsetX = mouseX - this._lastX;
            var offsetY = mouseY - this._lastY;
            if (this._clickOnly) {
                if (Math.abs(offsetX * ILaya.stage._canvasTransform.getScaleX()) > 1 || Math.abs(offsetY * ILaya.stage._canvasTransform.getScaleY()) > 1) {
                    this._clickOnly = false;
                    this._offsets || (this._offsets = []);
                    this._offsets.length = 0;
                    this.target.event(Event.DRAG_START, this.data);
                    MouseManager.instance.disableMouseEvent = this._disableMouseEvent;
                }
                else
                    return;
            }
            else {
                this._offsets.push(offsetX, offsetY);
            }
            if (offsetX === 0 && offsetY === 0)
                return;
            this._lastX = mouseX;
            this._lastY = mouseY;
            this.target.x += offsetX * this._elasticRateX;
            this.target.y += offsetY * this._elasticRateY;
            this.area && this.checkArea();
            this.target.event(Event.DRAG_MOVE, this.data);
        }
        checkArea() {
            if (this.elasticDistance <= 0) {
                this.backToArea();
            }
            else {
                if (this.target._x < this.area.x) {
                    var offsetX = this.area.x - this.target._x;
                }
                else if (this.target._x > this.area.x + this.area.width) {
                    offsetX = this.target._x - this.area.x - this.area.width;
                }
                else {
                    offsetX = 0;
                }
                this._elasticRateX = Math.max(0, 1 - (offsetX / this.elasticDistance));
                if (this.target._y < this.area.y) {
                    var offsetY = this.area.y - this.target.y;
                }
                else if (this.target._y > this.area.y + this.area.height) {
                    offsetY = this.target._y - this.area.y - this.area.height;
                }
                else {
                    offsetY = 0;
                }
                this._elasticRateY = Math.max(0, 1 - (offsetY / this.elasticDistance));
            }
        }
        backToArea() {
            this.target.x = Math.min(Math.max(this.target._x, this.area.x), this.area.x + this.area.width);
            this.target.y = Math.min(Math.max(this.target._y, this.area.y), this.area.y + this.area.height);
        }
        onStageMouseUp(e) {
            MouseManager.instance.disableMouseEvent = false;
            ILaya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp);
            ILaya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp);
            ILaya.systemTimer.clear(this, this.loop);
            if (this._clickOnly || !this.target)
                return;
            if (this.hasInertia) {
                if (this._offsets.length < 1) {
                    this._offsets.push(this._parent.mouseX - this._lastX, this._parent.mouseY - this._lastY);
                }
                this._offsetX = this._offsetY = 0;
                var len = this._offsets.length;
                var n = Math.min(len, 6);
                var m = this._offsets.length - n;
                for (var i = len - 1; i > m; i--) {
                    this._offsetY += this._offsets[i--];
                    this._offsetX += this._offsets[i];
                }
                this._offsetX = this._offsetX / n * 2;
                this._offsetY = this._offsetY / n * 2;
                if (Math.abs(this._offsetX) > this.maxOffset)
                    this._offsetX = this._offsetX > 0 ? this.maxOffset : -this.maxOffset;
                if (Math.abs(this._offsetY) > this.maxOffset)
                    this._offsetY = this._offsetY > 0 ? this.maxOffset : -this.maxOffset;
                ILaya.systemTimer.frameLoop(1, this, this.tweenMove);
            }
            else if (this.elasticDistance > 0) {
                this.checkElastic();
            }
            else {
                this.clear();
            }
        }
        checkElastic() {
            var tx = NaN;
            var ty = NaN;
            if (this.target.x < this.area.x)
                tx = this.area.x;
            else if (this.target._x > this.area.x + this.area.width)
                tx = this.area.x + this.area.width;
            if (this.target.y < this.area.y)
                ty = this.area.y;
            else if (this.target._y > this.area.y + this.area.height)
                ty = this.area.y + this.area.height;
            if (!isNaN(tx) || !isNaN(ty)) {
                var obj = {};
                if (!isNaN(tx))
                    obj.x = tx;
                if (!isNaN(ty))
                    obj.y = ty;
                this._tween = Tween.to(this.target, obj, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.clear), 0, false, false);
            }
            else {
                this.clear();
            }
        }
        tweenMove() {
            this._offsetX *= this.ratio * this._elasticRateX;
            this._offsetY *= this.ratio * this._elasticRateY;
            this.target.x += this._offsetX;
            this.target.y += this._offsetY;
            this.area && this.checkArea();
            this.target.event(Event.DRAG_MOVE, this.data);
            if ((Math.abs(this._offsetX) < 1 && Math.abs(this._offsetY) < 1) || this._elasticRateX < 0.5 || this._elasticRateY < 0.5) {
                ILaya.systemTimer.clear(this, this.tweenMove);
                if (this.elasticDistance > 0)
                    this.checkElastic();
                else
                    this.clear();
            }
        }
        clear() {
            if (this.target) {
                this.clearTimer();
                var sp = this.target;
                this.target = null;
                this._parent = null;
                sp.event(Event.DRAG_END, this.data);
            }
        }
    }

    class Component {
        constructor() {
            this._id = Utils.getGID();
            this._resetComp();
        }
        get id() {
            return this._id;
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            if (this._enabled != value) {
                this._enabled = value;
                if (this.owner) {
                    if (value)
                        this.owner.activeInHierarchy && this._onEnable();
                    else
                        this.owner.activeInHierarchy && this._onDisable();
                }
            }
        }
        get isSingleton() {
            return true;
        }
        get destroyed() {
            return this._destroyed;
        }
        _isScript() {
            return false;
        }
        _resetComp() {
            this._indexInList = -1;
            this._enabled = true;
            this._awaked = false;
            this.owner = null;
        }
        _getIndexInList() {
            return this._indexInList;
        }
        _setIndexInList(index) {
            this._indexInList = index;
        }
        _onAdded() {
        }
        _onAwake() {
        }
        _onEnable() {
        }
        _onDisable() {
        }
        _onDestroy() {
        }
        onReset() {
        }
        _parse(data) {
        }
        _cloneTo(dest) {
        }
        _setActive(value) {
            if (value) {
                if (!this._awaked) {
                    this._awaked = true;
                    this._onAwake();
                }
                this._enabled && this._onEnable();
            }
            else {
                this._enabled && this._onDisable();
            }
        }
        destroy() {
            if (this.owner)
                this.owner._destroyComponent(this);
        }
        _destroy() {
            if (this.owner.activeInHierarchy && this._enabled) {
                this._setActive(false);
                (this._isScript()) && (this.onDisable());
            }
            this._onDestroy();
            this._destroyed = true;
            if (this.onReset !== Component.prototype.onReset) {
                this.onReset();
                this._resetComp();
                Pool.recoverByClass(this);
            }
            else {
                this._resetComp();
            }
        }
    }

    class AnimationBase extends Sprite {
        constructor() {
            super();
            this.wrapMode = 0;
            this._interval = Config.animationInterval;
            this._isReverse = false;
            this._frameRateChanged = false;
            this._setBitUp(Const.DISPLAY);
        }
        play(start = 0, loop = true, name = "") {
            this._isPlaying = true;
            this._actionName = name;
            this.index = (typeof (start) == 'string') ? this._getFrameByLabel(start) : start;
            this.loop = loop;
            this._isReverse = this.wrapMode === AnimationBase.WRAP_REVERSE;
            if (this.index == 0 && this._isReverse) {
                this.index = this.count - 1;
            }
            if (this.interval > 0)
                this.timerLoop(this.interval, this, this._frameLoop, null, true, true);
        }
        get interval() {
            return this._interval;
        }
        set interval(value) {
            if (this._interval != value) {
                this._frameRateChanged = true;
                this._interval = value;
                if (this._isPlaying && value > 0) {
                    this.timerLoop(value, this, this._frameLoop, null, true, true);
                }
            }
        }
        _getFrameByLabel(label) {
            for (var i = 0; i < this._count; i++) {
                var item = this._labels[i];
                if (item && item.indexOf(label) > -1)
                    return i;
            }
            return 0;
        }
        _frameLoop() {
            if (this._isReverse) {
                this._index--;
                if (this._index < 0) {
                    if (this.loop) {
                        if (this.wrapMode == AnimationBase.WRAP_PINGPONG) {
                            this._index = this._count > 0 ? 1 : 0;
                            this._isReverse = false;
                        }
                        else {
                            this._index = this._count - 1;
                        }
                        this.event(Event.COMPLETE);
                    }
                    else {
                        this._index = 0;
                        this.stop();
                        this.event(Event.COMPLETE);
                        return;
                    }
                }
            }
            else {
                this._index++;
                if (this._index >= this._count) {
                    if (this.loop) {
                        if (this.wrapMode == AnimationBase.WRAP_PINGPONG) {
                            this._index = this._count - 2 >= 0 ? this._count - 2 : 0;
                            this._isReverse = true;
                        }
                        else {
                            this._index = 0;
                        }
                        this.event(Event.COMPLETE);
                    }
                    else {
                        this._index--;
                        this.stop();
                        this.event(Event.COMPLETE);
                        return;
                    }
                }
            }
            this.index = this._index;
        }
        _setControlNode(node) {
            if (this._controlNode) {
                this._controlNode.off(Event.DISPLAY, this, this._resumePlay);
                this._controlNode.off(Event.UNDISPLAY, this, this._resumePlay);
            }
            this._controlNode = node;
            if (node && node != this) {
                node.on(Event.DISPLAY, this, this._resumePlay);
                node.on(Event.UNDISPLAY, this, this._resumePlay);
            }
        }
        _setDisplay(value) {
            super._setDisplay(value);
            this._resumePlay();
        }
        _resumePlay() {
            if (this._isPlaying) {
                if (this._controlNode.displayedInStage)
                    this.play(this._index, this.loop, this._actionName);
                else
                    this.clearTimer(this, this._frameLoop);
            }
        }
        stop() {
            this._isPlaying = false;
            this.clearTimer(this, this._frameLoop);
        }
        get isPlaying() {
            return this._isPlaying;
        }
        addLabel(label, index) {
            if (!this._labels)
                this._labels = {};
            if (!this._labels[index])
                this._labels[index] = [];
            this._labels[index].push(label);
        }
        removeLabel(label) {
            if (!label)
                this._labels = null;
            else if (this._labels) {
                for (var name in this._labels) {
                    this._removeLabelFromList(this._labels[name], label);
                }
            }
        }
        _removeLabelFromList(list, label) {
            if (!list)
                return;
            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i] == label) {
                    list.splice(i, 1);
                }
            }
        }
        gotoAndStop(position) {
            this.index = (typeof (position) == 'string') ? this._getFrameByLabel(position) : position;
            this.stop();
        }
        get index() {
            return this._index;
        }
        set index(value) {
            this._index = value;
            this._displayToIndex(value);
            if (this._labels && this._labels[value]) {
                var tArr = this._labels[value];
                for (var i = 0, len = tArr.length; i < len; i++) {
                    this.event(Event.LABEL, tArr[i]);
                }
            }
        }
        _displayToIndex(value) {
        }
        get count() {
            return this._count;
        }
        clear() {
            this.stop();
            this._labels = null;
            return this;
        }
    }
    AnimationBase.WRAP_POSITIVE = 0;
    AnimationBase.WRAP_REVERSE = 1;
    AnimationBase.WRAP_PINGPONG = 2;
    ClassUtils.regClass("laya.display.AnimationBase", AnimationBase);
    ClassUtils.regClass("Laya.AnimationBase", AnimationBase);

    class MathUtil {
        static subtractVector3(l, r, o) {
            o[0] = l[0] - r[0];
            o[1] = l[1] - r[1];
            o[2] = l[2] - r[2];
        }
        static lerp(left, right, amount) {
            return left * (1 - amount) + right * amount;
        }
        static scaleVector3(f, b, e) {
            e[0] = f[0] * b;
            e[1] = f[1] * b;
            e[2] = f[2] * b;
        }
        static lerpVector3(l, r, t, o) {
            var ax = l[0], ay = l[1], az = l[2];
            o[0] = ax + t * (r[0] - ax);
            o[1] = ay + t * (r[1] - ay);
            o[2] = az + t * (r[2] - az);
        }
        static lerpVector4(l, r, t, o) {
            var ax = l[0], ay = l[1], az = l[2], aw = l[3];
            o[0] = ax + t * (r[0] - ax);
            o[1] = ay + t * (r[1] - ay);
            o[2] = az + t * (r[2] - az);
            o[3] = aw + t * (r[3] - aw);
        }
        static slerpQuaternionArray(a, Offset1, b, Offset2, t, out, Offset3) {
            var ax = a[Offset1 + 0], ay = a[Offset1 + 1], az = a[Offset1 + 2], aw = a[Offset1 + 3], bx = b[Offset2 + 0], by = b[Offset2 + 1], bz = b[Offset2 + 2], bw = b[Offset2 + 3];
            var omega, cosom, sinom, scale0, scale1;
            cosom = ax * bx + ay * by + az * bz + aw * bw;
            if (cosom < 0.0) {
                cosom = -cosom;
                bx = -bx;
                by = -by;
                bz = -bz;
                bw = -bw;
            }
            if ((1.0 - cosom) > 0.000001) {
                omega = Math.acos(cosom);
                sinom = Math.sin(omega);
                scale0 = Math.sin((1.0 - t) * omega) / sinom;
                scale1 = Math.sin(t * omega) / sinom;
            }
            else {
                scale0 = 1.0 - t;
                scale1 = t;
            }
            out[Offset3 + 0] = scale0 * ax + scale1 * bx;
            out[Offset3 + 1] = scale0 * ay + scale1 * by;
            out[Offset3 + 2] = scale0 * az + scale1 * bz;
            out[Offset3 + 3] = scale0 * aw + scale1 * bw;
            return out;
        }
        static getRotation(x0, y0, x1, y1) {
            return Math.atan2(y1 - y0, x1 - x0) / Math.PI * 180;
        }
        static sortBigFirst(a, b) {
            if (a == b)
                return 0;
            return b > a ? 1 : -1;
        }
        static sortSmallFirst(a, b) {
            if (a == b)
                return 0;
            return b > a ? -1 : 1;
        }
        static sortNumBigFirst(a, b) {
            return parseFloat(b) - parseFloat(a);
        }
        static sortNumSmallFirst(a, b) {
            return parseFloat(a) - parseFloat(b);
        }
        static sortByKey(key, bigFirst = false, forceNum = true) {
            var _sortFun;
            if (bigFirst) {
                _sortFun = forceNum ? MathUtil.sortNumBigFirst : MathUtil.sortBigFirst;
            }
            else {
                _sortFun = forceNum ? MathUtil.sortNumSmallFirst : MathUtil.sortSmallFirst;
            }
            return function (a, b) {
                return _sortFun(a[key], b[key]);
            };
        }
    }

    class FrameAnimation extends AnimationBase {
        constructor() {
            super();
            if (FrameAnimation._sortIndexFun === null) {
                FrameAnimation._sortIndexFun = MathUtil.sortByKey("index", false, true);
            }
        }
        _setUp(targetDic, animationData) {
            this._targetDic = targetDic;
            this._animationData = animationData;
            this.interval = 1000 / animationData.frameRate;
            if (animationData.parsed) {
                this._count = animationData.count;
                this._labels = animationData.labels;
                this._usedFrames = animationData.animationNewFrames;
            }
            else {
                this._usedFrames = [];
                this._calculateDatas();
                animationData.parsed = true;
                animationData.labels = this._labels;
                animationData.count = this._count;
                animationData.animationNewFrames = this._usedFrames;
            }
        }
        clear() {
            super.clear();
            this._targetDic = null;
            this._animationData = null;
            return this;
        }
        _displayToIndex(value) {
            if (!this._animationData)
                return;
            if (value < 0)
                value = 0;
            if (value > this._count)
                value = this._count;
            var nodes = this._animationData.nodes, i, len = nodes.length;
            for (i = 0; i < len; i++) {
                this._displayNodeToFrame(nodes[i], value);
            }
        }
        _displayNodeToFrame(node, frame, targetDic = null) {
            if (!targetDic)
                targetDic = this._targetDic;
            var target = targetDic[node.target];
            if (!target) {
                return;
            }
            var frames = node.frames, key, propFrames, value;
            var keys = node.keys, i, len = keys.length;
            for (i = 0; i < len; i++) {
                key = keys[i];
                propFrames = frames[key];
                if (propFrames.length > frame) {
                    value = propFrames[frame];
                }
                else {
                    value = propFrames[propFrames.length - 1];
                }
                target[key] = value;
            }
            var funkeys = node.funkeys;
            len = funkeys.length;
            var funFrames;
            if (len == 0)
                return;
            for (i = 0; i < len; i++) {
                key = funkeys[i];
                funFrames = frames[key];
                if (funFrames[frame] !== undefined) {
                    target[key] && target[key].apply(target, funFrames[frame]);
                }
            }
        }
        _calculateDatas() {
            if (!this._animationData)
                return;
            var nodes = this._animationData.nodes, i, len = nodes.length, tNode;
            this._count = 0;
            for (i = 0; i < len; i++) {
                tNode = nodes[i];
                this._calculateKeyFrames(tNode);
            }
            this._count += 1;
        }
        _calculateKeyFrames(node) {
            var keyFrames = node.keyframes, key, tKeyFrames, target = node.target;
            if (!node.frames)
                node.frames = {};
            if (!node.keys)
                node.keys = [];
            else
                node.keys.length = 0;
            if (!node.funkeys)
                node.funkeys = [];
            else
                node.funkeys.length = 0;
            if (!node.initValues)
                node.initValues = {};
            for (key in keyFrames) {
                var isFun = key.indexOf("()") != -1;
                tKeyFrames = keyFrames[key];
                if (isFun)
                    key = key.substr(0, key.length - 2);
                if (!node.frames[key]) {
                    node.frames[key] = [];
                }
                if (!isFun) {
                    if (this._targetDic && this._targetDic[target]) {
                        node.initValues[key] = this._targetDic[target][key];
                    }
                    tKeyFrames.sort(FrameAnimation._sortIndexFun);
                    node.keys.push(key);
                    this._calculateNodePropFrames(tKeyFrames, node.frames[key], key, target);
                }
                else {
                    node.funkeys.push(key);
                    var map = node.frames[key];
                    for (var i = 0; i < tKeyFrames.length; i++) {
                        var temp = tKeyFrames[i];
                        map[temp.index] = temp.value;
                        if (temp.index > this._count)
                            this._count = temp.index;
                    }
                }
            }
        }
        resetNodes() {
            if (!this._targetDic)
                return;
            if (!this._animationData)
                return;
            var nodes = this._animationData.nodes, i, len = nodes.length;
            var tNode;
            var initValues;
            for (i = 0; i < len; i++) {
                tNode = nodes[i];
                initValues = tNode.initValues;
                if (!initValues)
                    continue;
                var target = this._targetDic[tNode.target];
                if (!target)
                    continue;
                var key;
                for (key in initValues) {
                    target[key] = initValues[key];
                }
            }
        }
        _calculateNodePropFrames(keyframes, frames, key, target) {
            var i, len = keyframes.length - 1;
            frames.length = keyframes[len].index + 1;
            for (i = 0; i < len; i++) {
                this._dealKeyFrame(keyframes[i]);
                this._calculateFrameValues(keyframes[i], keyframes[i + 1], frames);
            }
            if (len == 0) {
                frames[0] = keyframes[0].value;
                if (this._usedFrames)
                    this._usedFrames[keyframes[0].index] = true;
            }
            this._dealKeyFrame(keyframes[i]);
        }
        _dealKeyFrame(keyFrame) {
            if (keyFrame.label && keyFrame.label != "")
                this.addLabel(keyFrame.label, keyFrame.index);
        }
        _calculateFrameValues(startFrame, endFrame, result) {
            var i, easeFun;
            var start = startFrame.index, end = endFrame.index;
            var startValue = startFrame.value;
            var dValue = endFrame.value - startFrame.value;
            var dLen = end - start;
            var frames = this._usedFrames;
            if (end > this._count)
                this._count = end;
            if (startFrame.tween) {
                easeFun = Ease[startFrame.tweenMethod];
                if (easeFun == null)
                    easeFun = Ease.linearNone;
                for (i = start; i < end; i++) {
                    result[i] = easeFun(i - start, startValue, dValue, dLen);
                    if (frames)
                        frames[i] = true;
                }
            }
            else {
                for (i = start; i < end; i++) {
                    result[i] = startValue;
                }
            }
            if (frames) {
                frames[startFrame.index] = true;
                frames[endFrame.index] = true;
            }
            result[endFrame.index] = endFrame.value;
        }
    }
    ClassUtils.regClass("laya.display.FrameAnimation", FrameAnimation);
    ClassUtils.regClass("Laya.FrameAnimation", FrameAnimation);

    var supportWeakMap = !!WeakMap;
    class WeakObject {
        constructor() {
            this._obj = WeakObject.supportWeakMap ? new WeakMap() : {};
            if (!WeakObject.supportWeakMap)
                WeakObject._maps.push(this);
        }
        static __init__() {
            WeakObject.I = new WeakObject();
            if (!WeakObject.supportWeakMap)
                ILaya.systemTimer.loop(WeakObject.delInterval, null, WeakObject.clearCache);
        }
        static clearCache() {
            for (var i = 0, n = WeakObject._maps.length; i < n; i++) {
                var obj = WeakObject._maps[i];
                obj._obj = {};
            }
        }
        set(key, value) {
            if (key == null)
                return;
            if (WeakObject.supportWeakMap) {
                var objKey = key;
                if (typeof (key) == 'string' || typeof (key) == 'number') {
                    objKey = WeakObject._keys[key];
                    if (!objKey)
                        objKey = WeakObject._keys[key] = { k: key };
                }
                this._obj.set(objKey, value);
            }
            else {
                if (typeof (key) == 'string' || typeof (key) == 'number') {
                    this._obj[key] = value;
                }
                else {
                    key.$_GID || (key.$_GID = Utils.getGID());
                    this._obj[key.$_GID] = value;
                }
            }
        }
        get(key) {
            if (key == null)
                return null;
            if (WeakObject.supportWeakMap) {
                var objKey = (typeof (key) == 'string' || typeof (key) == 'number') ? WeakObject._keys[key] : key;
                if (!objKey)
                    return null;
                return this._obj.get(objKey);
            }
            else {
                if (typeof (key) == 'string' || typeof (key) == 'number')
                    return this._obj[key];
                return this._obj[key.$_GID];
            }
        }
        del(key) {
            if (key == null)
                return;
            if (WeakObject.supportWeakMap) {
                var objKey = (typeof (key) == 'string' || typeof (key) == 'number') ? WeakObject._keys[key] : key;
                if (!objKey)
                    return;
                this._obj.delete(objKey);
            }
            else {
                if (typeof (key) == 'string' || typeof (key) == 'number')
                    delete this._obj[key];
                else
                    delete this._obj[this._obj.$_GID];
            }
        }
        has(key) {
            if (key == null)
                return false;
            if (WeakObject.supportWeakMap) {
                var objKey = (typeof (key) == 'string' || typeof (key) == 'number') ? WeakObject._keys[key] : key;
                return this._obj.has(objKey);
            }
            else {
                if (typeof (key) == 'string' || typeof (key) == 'number')
                    return this._obj[key] != null;
                return this._obj[this._obj.$_GID] != null;
            }
        }
    }
    WeakObject.supportWeakMap = supportWeakMap;
    WeakObject.delInterval = 10 * 60 * 1000;
    WeakObject._keys = {};
    WeakObject._maps = [];

    class SceneUtils {
        static __init() {
            SceneUtils._funMap = new WeakObject();
        }
        static getBindFun(value) {
            var fun = SceneUtils._funMap.get(value);
            if (fun == null) {
                var temp = "\"" + value + "\"";
                temp = temp.replace(/^"\${|}"$/g, "").replace(/\${/g, "\"+").replace(/}/g, "+\"");
                var str = "(function(data){if(data==null)return;with(data){try{\nreturn " + temp + "\n}catch(e){}}})";
                fun = window.Laya._runScript(str);
                SceneUtils._funMap.set(value, fun);
            }
            return fun;
        }
        static createByData(root, uiView) {
            var tInitTool = InitTool.create();
            root = SceneUtils.createComp(uiView, root, root, null, tInitTool);
            root._setBit(Const.NOT_READY, true);
            if ("_idMap" in root) {
                root["_idMap"] = tInitTool._idMap;
            }
            if (uiView.animations) {
                var anilist = [];
                var animations = uiView.animations;
                var i, len = animations.length;
                var tAni;
                var tAniO;
                for (i = 0; i < len; i++) {
                    tAni = new FrameAnimation();
                    tAniO = animations[i];
                    tAni._setUp(tInitTool._idMap, tAniO);
                    root[tAniO.name] = tAni;
                    tAni._setControlNode(root);
                    switch (tAniO.action) {
                        case 1:
                            tAni.play(0, false);
                            break;
                        case 2:
                            tAni.play(0, true);
                            break;
                    }
                    anilist.push(tAni);
                }
                root._aniList = anilist;
            }
            if (root._$componentType === "Scene" && root._width > 0 && uiView.props.hitTestPrior == null && !root.mouseThrough)
                root.hitTestPrior = true;
            tInitTool.beginLoad(root);
            return root;
        }
        static createInitTool() {
            return InitTool.create();
        }
        static createComp(uiView, comp = null, view = null, dataMap = null, initTool = null) {
            if (uiView.type == "Scene3D" || uiView.type == "Sprite3D") {
                var outBatchSprits = [];
                var scene3D = ILaya.Laya["Utils3D"]._createSceneByJsonForMaker(uiView, outBatchSprits, initTool);
                if (uiView.type == "Sprite3D")
                    ILaya.Laya["StaticBatchManager"].combine(scene3D, outBatchSprits);
                else
                    ILaya.Laya["StaticBatchManager"].combine(null, outBatchSprits);
                return scene3D;
            }
            comp = comp || SceneUtils.getCompInstance(uiView);
            if (!comp) {
                if (uiView.props && uiView.props.runtime)
                    console.warn("runtime not found:" + uiView.props.runtime);
                else
                    console.warn("can not create:" + uiView.type);
                return null;
            }
            var child = uiView.child;
            if (child) {
                var isList = comp["_$componentType"] == "List";
                for (var i = 0, n = child.length; i < n; i++) {
                    var node = child[i];
                    if ('itemRender' in comp && (node.props.name == "render" || node.props.renderType === "render")) {
                        comp["itemRender"] = node;
                    }
                    else if (node.type == "Graphic") {
                        ILaya.ClassUtils._addGraphicsToSprite(node, comp);
                    }
                    else if (ILaya.ClassUtils._isDrawType(node.type)) {
                        ILaya.ClassUtils._addGraphicToSprite(node, comp, true);
                    }
                    else {
                        if (isList) {
                            var arr = [];
                            var tChild = SceneUtils.createComp(node, null, view, arr, initTool);
                            if (arr.length)
                                tChild["_$bindData"] = arr;
                        }
                        else {
                            tChild = SceneUtils.createComp(node, null, view, dataMap, initTool);
                        }
                        if (node.type == "Script") {
                            if (tChild instanceof Component) {
                                comp._addComponentInstance(tChild);
                            }
                            else {
                                if ("owner" in tChild) {
                                    tChild["owner"] = comp;
                                }
                                else if ("target" in tChild) {
                                    tChild["target"] = comp;
                                }
                            }
                        }
                        else if (node.props.renderType == "mask" || node.props.name == "mask") {
                            comp.mask = tChild;
                        }
                        else {
                            tChild instanceof Node && comp.addChild(tChild);
                        }
                    }
                }
            }
            var props = uiView.props;
            for (var prop in props) {
                var value = props[prop];
                if (typeof (value) == 'string' && (value.indexOf("@node:") >= 0 || value.indexOf("@Prefab:") >= 0)) {
                    if (initTool) {
                        initTool.addNodeRef(comp, prop, value);
                    }
                }
                else
                    SceneUtils.setCompValue(comp, prop, value, view, dataMap);
            }
            if (comp._afterInited) {
                comp._afterInited();
            }
            if (uiView.compId && initTool && initTool._idMap) {
                initTool._idMap[uiView.compId] = comp;
            }
            return comp;
        }
        static setCompValue(comp, prop, value, view = null, dataMap = null) {
            if (typeof (value) == 'string' && value.indexOf("${") > -1) {
                SceneUtils._sheet || (SceneUtils._sheet = ILaya.ClassUtils.getClass("laya.data.Table"));
                if (!SceneUtils._sheet) {
                    console.warn("Can not find class Sheet");
                    return;
                }
                if (dataMap) {
                    dataMap.push(comp, prop, value);
                }
                else if (view) {
                    if (value.indexOf("].") == -1) {
                        value = value.replace(".", "[0].");
                    }
                    var watcher = new DataWatcher(comp, prop, value);
                    watcher.exe(view);
                    var one, temp;
                    var str = value.replace(/\[.*?\]\./g, ".");
                    while ((one = SceneUtils._parseWatchData.exec(str)) != null) {
                        var key1 = one[1];
                        while ((temp = SceneUtils._parseKeyWord.exec(key1)) != null) {
                            var key2 = temp[0];
                            var arr = (view._watchMap[key2] || (view._watchMap[key2] = []));
                            arr.push(watcher);
                            SceneUtils._sheet.I.notifer.on(key2, view, view.changeData, [key2]);
                        }
                        arr = (view._watchMap[key1] || (view._watchMap[key1] = []));
                        arr.push(watcher);
                        SceneUtils._sheet.I.notifer.on(key1, view, view.changeData, [key1]);
                    }
                }
                return;
            }
            if (prop === "var" && view) {
                view[value] = comp;
            }
            else {
                comp[prop] = (value === "true" ? true : (value === "false" ? false : value));
            }
        }
        static getCompInstance(json) {
            if (json.type == "UIView") {
                if (json.props && json.props.pageData) {
                    return SceneUtils.createByData(null, json.props.pageData);
                }
            }
            var runtime = (json.props && json.props.runtime) || json.type;
            var compClass = ILaya.ClassUtils.getClass(runtime);
            if (!compClass)
                throw "Can not find class " + runtime;
            if (json.type === "Script" && compClass.prototype._doAwake) {
                var comp = Pool.createByClass(compClass);
                comp._destroyed = false;
                return comp;
            }
            if (json.props && "renderType" in json.props && json.props["renderType"] == "instance") {
                if (!compClass["instance"])
                    compClass["instance"] = new compClass();
                return compClass["instance"];
            }
            return new compClass();
        }
    }
    SceneUtils._parseWatchData = /\${(.*?)}/g;
    SceneUtils._parseKeyWord = /[a-zA-Z_][a-zA-Z0-9_]*(?:(?:\.[a-zA-Z_][a-zA-Z0-9_]*)+)/g;
    class DataWatcher {
        constructor(comp, prop, value) {
            this.comp = comp;
            this.prop = prop;
            this.value = value;
        }
        exe(view) {
            var fun = SceneUtils.getBindFun(this.value);
            this.comp[this.prop] = fun.call(this, view);
        }
    }
    class InitTool {
        reset() {
            this._nodeRefList = null;
            this._initList = null;
            this._idMap = null;
            this._loadList = null;
            this._scene = null;
        }
        recover() {
            this.reset();
            Pool.recover("InitTool", this);
        }
        static create() {
            var tool = Pool.getItemByClass("InitTool", InitTool);
            tool._idMap = [];
            return tool;
        }
        addLoadRes(url, type = null) {
            if (!this._loadList)
                this._loadList = [];
            if (!type) {
                this._loadList.push(url);
            }
            else {
                this._loadList.push({ url: url, type: type });
            }
        }
        addNodeRef(node, prop, referStr) {
            if (!this._nodeRefList)
                this._nodeRefList = [];
            this._nodeRefList.push([node, prop, referStr]);
            if (referStr.indexOf("@Prefab:") >= 0) {
                this.addLoadRes(referStr.replace("@Prefab:", ""), Loader.PREFAB);
            }
        }
        setNodeRef() {
            if (!this._nodeRefList)
                return;
            if (!this._idMap) {
                this._nodeRefList = null;
                return;
            }
            var i, len;
            len = this._nodeRefList.length;
            var tRefInfo;
            for (i = 0; i < len; i++) {
                tRefInfo = this._nodeRefList[i];
                tRefInfo[0][tRefInfo[1]] = this.getReferData(tRefInfo[2]);
            }
            this._nodeRefList = null;
        }
        getReferData(referStr) {
            if (referStr.indexOf("@Prefab:") >= 0) {
                var prefab;
                prefab = Loader.getRes(referStr.replace("@Prefab:", ""));
                return prefab;
            }
            else if (referStr.indexOf("@arr:") >= 0) {
                referStr = referStr.replace("@arr:", "");
                var list;
                list = referStr.split(",");
                var i, len;
                var tStr;
                len = list.length;
                for (i = 0; i < len; i++) {
                    tStr = list[i];
                    if (tStr) {
                        list[i] = this._idMap[tStr.replace("@node:", "")];
                    }
                    else {
                        list[i] = null;
                    }
                }
                return list;
            }
            else {
                return this._idMap[referStr.replace("@node:", "")];
            }
        }
        addInitItem(item) {
            if (!this._initList)
                this._initList = [];
            this._initList.push(item);
        }
        doInits() {
            if (!this._initList)
                return;
            this._initList = null;
        }
        finish() {
            this.setNodeRef();
            this.doInits();
            this._scene._setBit(Const.NOT_READY, false);
            if (this._scene.parent && this._scene.parent.activeInHierarchy && this._scene.active)
                this._scene._processActive();
            this._scene.event("onViewCreated");
            this.recover();
        }
        beginLoad(scene) {
            this._scene = scene;
            if (!this._loadList || this._loadList.length < 1) {
                this.finish();
            }
            else {
                ILaya.loader.load(this._loadList, Handler.create(this, this.finish));
            }
        }
    }

    class IStatRender {
        show(x = 0, y = 0) {
        }
        enable() {
        }
        hide() {
        }
        set_onclick(fn) {
        }
        isCanvasRender() {
            return true;
        }
        renderNotCanvas(ctx, x, y) { }
    }

    class StatUI extends IStatRender {
        constructor() {
            super(...arguments);
            this._show = false;
            this._useCanvas = false;
            this._height = 100;
            this._view = [];
        }
        show(x = 0, y = 0) {
            if (!Browser.onMiniGame && !ILaya.Render.isConchApp && !Browser.onBDMiniGame && !Browser.onKGMiniGame && !Browser.onQGMiniGame && !Browser.onQQMiniGame)
                this._useCanvas = true;
            this._show = true;
            Stat._fpsData.length = 60;
            this._view[0] = { title: "FPS(Canvas)", value: "_fpsStr", color: "yellow", units: "int" };
            this._view[1] = { title: "Sprite", value: "_spriteStr", color: "white", units: "int" };
            this._view[2] = { title: "RenderBatches", value: "renderBatches", color: "white", units: "int" };
            this._view[3] = { title: "SavedRenderBatches", value: "savedRenderBatches", color: "white", units: "int" };
            this._view[4] = { title: "CPUMemory", value: "cpuMemory", color: "yellow", units: "M" };
            this._view[5] = { title: "GPUMemory", value: "gpuMemory", color: "yellow", units: "M" };
            this._view[6] = { title: "Shader", value: "shaderCall", color: "white", units: "int" };
            if (!Render.is3DMode) {
                this._view[0].title = "FPS(WebGL)";
                this._view[7] = { title: "Canvas", value: "_canvasStr", color: "white", units: "int" };
            }
            else {
                this._view[0].title = "FPS(3D)";
                this._view[7] = { title: "TriFaces", value: "trianglesFaces", color: "white", units: "int" };
                this._view[8] = { title: "FrustumCulling", value: "frustumCulling", color: "white", units: "int" };
                this._view[9] = { title: "OctreeNodeCulling", value: "octreeNodeCulling", color: "white", units: "int" };
            }
            if (this._useCanvas) {
                this.createUIPre(x, y);
            }
            else
                this.createUI(x, y);
            this.enable();
        }
        createUIPre(x, y) {
            var pixel = Browser.pixelRatio;
            this._width = pixel * 180;
            this._vx = pixel * 120;
            this._height = pixel * (this._view.length * 12 + 3 * pixel) + 4;
            StatUI._fontSize = 12 * pixel;
            for (var i = 0; i < this._view.length; i++) {
                this._view[i].x = 4;
                this._view[i].y = i * StatUI._fontSize + 2 * pixel;
            }
            if (!this._canvas) {
                this._canvas = new HTMLCanvas(true);
                this._canvas.size(this._width, this._height);
                this._ctx = this._canvas.getContext('2d');
                this._ctx.textBaseline = "top";
                this._ctx.font = StatUI._fontSize + "px Arial";
                this._canvas.source.style.cssText = "pointer-events:none;background:rgba(150,150,150,0.8);z-index:100000;position: absolute;direction:ltr;left:" + x + "px;top:" + y + "px;width:" + (this._width / pixel) + "px;height:" + (this._height / pixel) + "px;";
            }
            if (!Browser.onKGMiniGame) {
                Browser.container.appendChild(this._canvas.source);
            }
            this._first = true;
            this.loop();
            this._first = false;
        }
        createUI(x, y) {
            var stat = this._sp;
            var pixel = Browser.pixelRatio;
            if (!stat) {
                stat = new Sprite();
                this._leftText = new Text();
                this._leftText.pos(5, 5);
                this._leftText.color = "#ffffff";
                stat.addChild(this._leftText);
                this._txt = new Text();
                this._txt.pos(80 * pixel, 5);
                this._txt.color = "#ffffff";
                stat.addChild(this._txt);
                this._sp = stat;
            }
            stat.pos(x, y);
            var text = "";
            for (var i = 0; i < this._view.length; i++) {
                var one = this._view[i];
                text += one.title + "\n";
            }
            this._leftText.text = text;
            var width = pixel * 138;
            var height = pixel * (this._view.length * 12 + 3 * pixel) + 4;
            this._txt.fontSize = StatUI._fontSize * pixel;
            this._leftText.fontSize = StatUI._fontSize * pixel;
            stat.size(width, height);
            stat.graphics.clear();
            stat.graphics.alpha(0.5);
            stat.graphics.drawRect(0, 0, width, height, "#999999");
            stat.graphics.alpha(2);
            this.loop();
        }
        enable() {
            ILaya.systemTimer.frameLoop(1, this, this.loop);
        }
        hide() {
            this._show = false;
            ILaya.systemTimer.clear(this, this.loop);
            if (this._canvas) {
                Browser.removeElement(this._canvas.source);
            }
        }
        set_onclick(fn) {
            if (this._sp) {
                this._sp.on("click", this._sp, fn);
            }
            if (this._canvas) {
                this._canvas.source.onclick = fn;
                this._canvas.source.style.pointerEvents = '';
            }
        }
        loop() {
            Stat._count++;
            var timer = Browser.now();
            if (timer - Stat._timer < 1000)
                return;
            var count = Stat._count;
            Stat.FPS = Math.round((count * 1000) / (timer - Stat._timer));
            if (this._show) {
                Stat.trianglesFaces = Math.round(Stat.trianglesFaces / count);
                if (!this._useCanvas) {
                    Stat.renderBatches = Math.round(Stat.renderBatches / count) - 1;
                }
                else {
                    Stat.renderBatches = Math.round(Stat.renderBatches / count);
                }
                Stat.savedRenderBatches = Math.round(Stat.savedRenderBatches / count);
                Stat.shaderCall = Math.round(Stat.shaderCall / count);
                Stat.spriteRenderUseCacheCount = Math.round(Stat.spriteRenderUseCacheCount / count);
                Stat.canvasNormal = Math.round(Stat.canvasNormal / count);
                Stat.canvasBitmap = Math.round(Stat.canvasBitmap / count);
                Stat.canvasReCache = Math.ceil(Stat.canvasReCache / count);
                Stat.frustumCulling = Math.round(Stat.frustumCulling / count);
                Stat.octreeNodeCulling = Math.round(Stat.octreeNodeCulling / count);
                var delay = Stat.FPS > 0 ? Math.floor(1000 / Stat.FPS).toString() : " ";
                Stat._fpsStr = Stat.FPS + (Stat.renderSlow ? " slow" : "") + " " + delay;
                Stat._spriteStr = Stat.spriteCount + (Stat.spriteRenderUseCacheCount ? ("/" + Stat.spriteRenderUseCacheCount) : '');
                Stat._canvasStr = Stat.canvasReCache + "/" + Stat.canvasNormal + "/" + Stat.canvasBitmap;
                Stat.cpuMemory = Resource.cpuMemory;
                Stat.gpuMemory = Resource.gpuMemory;
                if (this._useCanvas) {
                    this.renderInfoPre();
                }
                else
                    this.renderInfo();
                Stat.clear();
            }
            Stat._count = 0;
            Stat._timer = timer;
        }
        renderInfoPre() {
            var i = 0;
            var one;
            var value;
            if (this._canvas) {
                var ctx = this._ctx;
                ctx.clearRect(this._first ? 0 : this._vx, 0, this._width, this._height);
                for (i = 0; i < this._view.length; i++) {
                    one = this._view[i];
                    if (this._first) {
                        ctx.fillStyle = "white";
                        ctx.fillText(one.title, one.x, one.y);
                    }
                    ctx.fillStyle = one.color;
                    value = Stat[one.value];
                    (one.units == "M") && (value = Math.floor(value / (1024 * 1024) * 100) / 100 + " M");
                    ctx.fillText(value + "", one.x + this._vx, one.y);
                }
            }
        }
        renderInfo() {
            var text = "";
            for (var i = 0; i < this._view.length; i++) {
                var one = this._view[i];
                var value = Stat[one.value];
                (one.units == "M") && (value = Math.floor(value / (1024 * 1024) * 100) / 100 + " M");
                (one.units == "K") && (value = Math.floor(value / (1024) * 100) / 100 + " K");
                text += value + "\n";
            }
            this._txt.text = text;
        }
        isCanvasRender() {
            return this._useCanvas;
        }
        renderNotCanvas(ctx, x, y) {
            this._show && this._sp && this._sp.render(ctx, 0, 0);
        }
    }
    StatUI._fontSize = 12;

    class Timer {
        constructor(autoActive = true) {
            this.scale = 1;
            this.currTimer = Date.now();
            this.currFrame = 0;
            this._delta = 0;
            this._lastTimer = Date.now();
            this._map = [];
            this._handlers = [];
            this._temp = [];
            this._count = 0;
            autoActive && Timer.gSysTimer && Timer.gSysTimer.frameLoop(1, this, this._update);
        }
        get delta() {
            return this._delta;
        }
        _update() {
            if (this.scale <= 0) {
                this._lastTimer = Date.now();
                this._delta = 0;
                return;
            }
            var frame = this.currFrame = this.currFrame + this.scale;
            var now = Date.now();
            var awake = (now - this._lastTimer) > 30000;
            this._delta = (now - this._lastTimer) * this.scale;
            var timer = this.currTimer = this.currTimer + this._delta;
            this._lastTimer = now;
            var handlers = this._handlers;
            this._count = 0;
            for (var i = 0, n = handlers.length; i < n; i++) {
                var handler = handlers[i];
                if (handler.method !== null) {
                    var t = handler.userFrame ? frame : timer;
                    if (t >= handler.exeTime) {
                        if (handler.repeat) {
                            if (!handler.jumpFrame || awake) {
                                handler.exeTime += handler.delay;
                                handler.run(false);
                                if (t > handler.exeTime) {
                                    handler.exeTime += Math.ceil((t - handler.exeTime) / handler.delay) * handler.delay;
                                }
                            }
                            else {
                                while (t >= handler.exeTime) {
                                    handler.exeTime += handler.delay;
                                    handler.run(false);
                                }
                            }
                        }
                        else {
                            handler.run(true);
                        }
                    }
                }
                else {
                    this._count++;
                }
            }
            if (this._count > 30 || frame % 200 === 0)
                this._clearHandlers();
        }
        _clearHandlers() {
            var handlers = this._handlers;
            for (var i = 0, n = handlers.length; i < n; i++) {
                var handler = handlers[i];
                if (handler.method !== null)
                    this._temp.push(handler);
                else
                    this._recoverHandler(handler);
            }
            this._handlers = this._temp;
            handlers.length = 0;
            this._temp = handlers;
        }
        _recoverHandler(handler) {
            if (this._map[handler.key] == handler)
                this._map[handler.key] = null;
            handler.clear();
            Timer._pool.push(handler);
        }
        _create(useFrame, repeat, delay, caller, method, args, coverBefore) {
            if (!delay) {
                method.apply(caller, args);
                return null;
            }
            if (coverBefore) {
                var handler = this._getHandler(caller, method);
                if (handler) {
                    handler.repeat = repeat;
                    handler.userFrame = useFrame;
                    handler.delay = delay;
                    handler.caller = caller;
                    handler.method = method;
                    handler.args = args;
                    handler.exeTime = delay + (useFrame ? this.currFrame : this.currTimer + Date.now() - this._lastTimer);
                    return handler;
                }
            }
            handler = Timer._pool.length > 0 ? Timer._pool.pop() : new TimerHandler();
            handler.repeat = repeat;
            handler.userFrame = useFrame;
            handler.delay = delay;
            handler.caller = caller;
            handler.method = method;
            handler.args = args;
            handler.exeTime = delay + (useFrame ? this.currFrame : this.currTimer + Date.now() - this._lastTimer);
            this._indexHandler(handler);
            this._handlers.push(handler);
            return handler;
        }
        _indexHandler(handler) {
            var caller = handler.caller;
            var method = handler.method;
            var cid = caller ? caller.$_GID || (caller.$_GID = ILaya.Utils.getGID()) : 0;
            var mid = method.$_TID || (method.$_TID = (Timer._mid++) * 100000);
            handler.key = cid + mid;
            this._map[handler.key] = handler;
        }
        once(delay, caller, method, args = null, coverBefore = true) {
            this._create(false, false, delay, caller, method, args, coverBefore);
        }
        loop(delay, caller, method, args = null, coverBefore = true, jumpFrame = false) {
            var handler = this._create(false, true, delay, caller, method, args, coverBefore);
            if (handler)
                handler.jumpFrame = jumpFrame;
        }
        frameOnce(delay, caller, method, args = null, coverBefore = true) {
            this._create(true, false, delay, caller, method, args, coverBefore);
        }
        frameLoop(delay, caller, method, args = null, coverBefore = true) {
            this._create(true, true, delay, caller, method, args, coverBefore);
        }
        toString() {
            return " handlers:" + this._handlers.length + " pool:" + Timer._pool.length;
        }
        clear(caller, method) {
            var handler = this._getHandler(caller, method);
            if (handler) {
                this._map[handler.key] = null;
                handler.key = 0;
                handler.clear();
            }
        }
        clearAll(caller) {
            if (!caller)
                return;
            for (var i = 0, n = this._handlers.length; i < n; i++) {
                var handler = this._handlers[i];
                if (handler.caller === caller) {
                    this._map[handler.key] = null;
                    handler.key = 0;
                    handler.clear();
                }
            }
        }
        _getHandler(caller, method) {
            var cid = caller ? caller.$_GID || (caller.$_GID = ILaya.Utils.getGID()) : 0;
            var mid = method.$_TID || (method.$_TID = (Timer._mid++) * 100000);
            return this._map[cid + mid];
        }
        callLater(caller, method, args = null) {
            CallLater.I.callLater(caller, method, args);
        }
        runCallLater(caller, method) {
            CallLater.I.runCallLater(caller, method);
        }
        runTimer(caller, method) {
            var handler = this._getHandler(caller, method);
            if (handler && handler.method != null) {
                this._map[handler.key] = null;
                handler.run(true);
            }
        }
        pause() {
            this.scale = 0;
        }
        resume() {
            this.scale = 1;
        }
    }
    Timer.gSysTimer = null;
    Timer._pool = [];
    Timer._mid = 1;
    class TimerHandler {
        clear() {
            this.caller = null;
            this.method = null;
            this.args = null;
        }
        run(withClear) {
            var caller = this.caller;
            if (caller && caller.destroyed)
                return this.clear();
            var method = this.method;
            var args = this.args;
            withClear && this.clear();
            if (method == null)
                return;
            args ? method.apply(caller, args) : method.call(caller);
        }
    }

    class SkinSV extends Value2D {
        constructor(type) {
            super(ShaderDefines2D.SKINMESH, 0);
            this.offsetX = 300;
            this.offsetY = 0;
            var gl = WebGLContext.mainContext;
            var _vlen = 8 * CONST3D2D.BYTES_PE;
            this.position = [2, gl.FLOAT, false, _vlen, 0];
            this.texcoord = [2, gl.FLOAT, false, _vlen, 2 * CONST3D2D.BYTES_PE];
            this.color = [4, gl.FLOAT, false, _vlen, 4 * CONST3D2D.BYTES_PE];
        }
    }

    class PrimitiveSV extends Value2D {
        constructor(args) {
            super(ShaderDefines2D.PRIMITIVE, 0);
            this._attribLocation = ['position', 0, 'attribColor', 1];
        }
    }

    class TextureSV extends Value2D {
        constructor(subID = 0) {
            super(ShaderDefines2D.TEXTURE2D, subID);
            this.strength = 0;
            this.blurInfo = null;
            this.colorMat = null;
            this.colorAlpha = null;
            this._attribLocation = ['posuv', 0, 'attribColor', 1, 'attribFlags', 2];
        }
        clear() {
            this.texture = null;
            this.shader = null;
            this.defines._value = this.subID + (WebGL.shaderHighPrecision ? ShaderDefines2D.SHADERDEFINE_FSHIGHPRECISION : 0);
        }
    }

    class InlcudeFile {
        constructor(txt) {
            this.codes = {};
            this.funs = {};
            this.curUseID = -1;
            this.funnames = "";
            this.script = txt;
            var begin = 0, ofs, end;
            while (true) {
                begin = txt.indexOf("#begin", begin);
                if (begin < 0)
                    break;
                end = begin + 5;
                while (true) {
                    end = txt.indexOf("#end", end);
                    if (end < 0)
                        break;
                    if (txt.charAt(end + 4) === 'i')
                        end += 5;
                    else
                        break;
                }
                if (end < 0) {
                    throw "add include err,no #end:" + txt;
                }
                ofs = txt.indexOf('\n', begin);
                var words = ILaya.ShaderCompile.splitToWords(txt.substr(begin, ofs - begin), null);
                if (words[1] == 'code') {
                    this.codes[words[2]] = txt.substr(ofs + 1, end - ofs - 1);
                }
                else if (words[1] == 'function') {
                    ofs = txt.indexOf("function", begin);
                    ofs += "function".length;
                    this.funs[words[3]] = txt.substr(ofs + 1, end - ofs - 1);
                    this.funnames += words[3] + ";";
                }
                begin = end + 1;
            }
        }
        getWith(name = null) {
            var r = name ? this.codes[name] : this.script;
            if (!r) {
                throw "get with error:" + name;
            }
            return r;
        }
        getFunsScript(funsdef) {
            var r = "";
            for (var i in this.funs) {
                if (funsdef.indexOf(i + ";") >= 0) {
                    r += this.funs[i];
                }
            }
            return r;
        }
    }

    class ShaderNode {
        constructor(includefiles) {
            this.childs = [];
            this.text = "";
            this.useFuns = "";
            this.z = 0;
            this.includefiles = includefiles;
        }
        setParent(parent) {
            parent.childs.push(this);
            this.z = parent.z + 1;
            this.parent = parent;
        }
        setCondition(condition, type) {
            if (condition) {
                this.conditionType = type;
                condition = condition.replace(/(\s*$)/g, "");
                this.condition = function () {
                    return this[condition];
                };
                this.condition.__condition = condition;
            }
        }
        toscript(def, out) {
            return this._toscript(def, out, ++ShaderNode.__id);
        }
        _toscript(def, out, id) {
            if (this.childs.length < 1 && !this.text)
                return out;
            var outIndex = out.length;
            if (this.condition) {
                var ifdef = !!this.condition.call(def);
                this.conditionType === ILaya.ShaderCompile.IFDEF_ELSE && (ifdef = !ifdef);
                if (!ifdef)
                    return out;
            }
            this.text && out.push(this.text);
            this.childs.length > 0 && this.childs.forEach(function (o, index, arr) {
                o._toscript(def, out, id);
            });
            if (this.includefiles.length > 0 && this.useFuns.length > 0) {
                var funsCode;
                for (var i = 0, n = this.includefiles.length; i < n; i++) {
                    if (this.includefiles[i].curUseID == id) {
                        continue;
                    }
                    funsCode = this.includefiles[i].file.getFunsScript(this.useFuns);
                    if (funsCode.length > 0) {
                        this.includefiles[i].curUseID = id;
                        out[0] = funsCode + out[0];
                    }
                }
            }
            return out;
        }
    }
    ShaderNode.__id = 1;

    class ShaderCompile {
        constructor(vs, ps, nameMap) {
            this.defs = {};
            let _this = this;
            function _compile(script) {
                script = script.replace(ShaderCompile._clearCR, "");
                var includefiles = [];
                var top = new ShaderNode(includefiles);
                _this._compileToTree(top, script.split('\n'), 0, includefiles, _this.defs);
                return top;
            }
            var startTime = Date.now();
            this._VS = _compile(vs);
            this._PS = _compile(ps);
            this._nameMap = nameMap;
            if ((Date.now() - startTime) > 2)
                console.log("ShaderCompile use time:" + (Date.now() - startTime) + "  size:" + vs.length + "/" + ps.length);
        }
        static __init__() {
            var gl = LayaGL.instance;
            ShaderCompile.shaderParamsMap = { "float": gl.FLOAT, "int": gl.INT, "bool": gl.BOOL, "vec2": gl.FLOAT_VEC2, "vec3": gl.FLOAT_VEC3, "vec4": gl.FLOAT_VEC4, "ivec2": gl.INT_VEC2, "ivec3": gl.INT_VEC3, "ivec4": gl.INT_VEC4, "bvec2": gl.BOOL_VEC2, "bvec3": gl.BOOL_VEC3, "bvec4": gl.BOOL_VEC4, "mat2": gl.FLOAT_MAT2, "mat3": gl.FLOAT_MAT3, "mat4": gl.FLOAT_MAT4, "sampler2D": gl.SAMPLER_2D, "samplerCube": gl.SAMPLER_CUBE };
        }
        static _parseOne(attributes, uniforms, words, i, word, b) {
            var one = { type: ShaderCompile.shaderParamsMap[words[i + 1]], name: words[i + 2], size: isNaN(parseInt(words[i + 3])) ? 1 : parseInt(words[i + 3]) };
            if (b) {
                if (word == "attribute") {
                    attributes.push(one);
                }
                else {
                    uniforms.push(one);
                }
            }
            if (words[i + 3] == ':') {
                one.type = words[i + 4];
                i += 2;
            }
            i += 2;
            return i;
        }
        static addInclude(fileName, txt) {
            if (!txt || txt.length === 0)
                throw new Error("add shader include file err:" + fileName);
            if (ShaderCompile.includes[fileName])
                throw new Error("add shader include file err, has add:" + fileName);
            ShaderCompile.includes[fileName] = new InlcudeFile(txt);
        }
        static preGetParams(vs, ps) {
            var text = [vs, ps];
            var result = {};
            var attributes = [];
            var uniforms = [];
            var definesInfo = {};
            var definesName = [];
            result.attributes = attributes;
            result.uniforms = uniforms;
            result.defines = definesInfo;
            var i, n;
            for (var s = 0; s < 2; s++) {
                text[s] = text[s].replace(ShaderCompile._removeAnnotation, "");
                var words = text[s].match(ShaderCompile._reg);
                var tempelse;
                for (i = 0, n = words.length; i < n; i++) {
                    var word = words[i];
                    if (word != "attribute" && word != "uniform") {
                        if (word == "#define") {
                            word = words[++i];
                            definesName[word] = 1;
                            continue;
                        }
                        else if (word == "#ifdef") {
                            tempelse = words[++i];
                            var def = definesInfo[tempelse] = definesInfo[tempelse] || [];
                            for (i++; i < n; i++) {
                                word = words[i];
                                if (word != "attribute" && word != "uniform") {
                                    if (word == "#else") {
                                        for (i++; i < n; i++) {
                                            word = words[i];
                                            if (word != "attribute" && word != "uniform") {
                                                if (word == "#endif") {
                                                    break;
                                                }
                                                continue;
                                            }
                                            i = ShaderCompile._parseOne(attributes, uniforms, words, i, word, !definesName[tempelse]);
                                        }
                                    }
                                    continue;
                                }
                                i = ShaderCompile._parseOne(attributes, uniforms, words, i, word, definesName[tempelse]);
                            }
                        }
                        continue;
                    }
                    i = ShaderCompile._parseOne(attributes, uniforms, words, i, word, true);
                }
            }
            return result;
        }
        static splitToWords(str, block) {
            var out = [];
            var c;
            var ofs = -1;
            var word;
            for (var i = 0, n = str.length; i < n; i++) {
                c = str.charAt(i);
                if (" \t=+-*/&%!<>()'\",;".indexOf(c) >= 0) {
                    if (ofs >= 0 && (i - ofs) > 1) {
                        word = str.substr(ofs, i - ofs);
                        out.push(word);
                    }
                    if (c == '"' || c == "'") {
                        var ofs2 = str.indexOf(c, i + 1);
                        if (ofs2 < 0) {
                            throw "Sharder err:" + str;
                        }
                        out.push(str.substr(i + 1, ofs2 - i - 1));
                        i = ofs2;
                        ofs = -1;
                        continue;
                    }
                    if (c == '(' && block && out.length > 0) {
                        word = out[out.length - 1] + ";";
                        if ("vec4;main;".indexOf(word) < 0)
                            block.useFuns += word;
                    }
                    ofs = -1;
                    continue;
                }
                if (ofs < 0)
                    ofs = i;
            }
            if (ofs < n && (n - ofs) > 1) {
                word = str.substr(ofs, n - ofs);
                out.push(word);
            }
            return out;
        }
        _compileToTree(parent, lines, start, includefiles, defs) {
            var node, preNode;
            var text, name, fname;
            var ofs, words, noUseNode;
            var i, n, j;
            for (i = start; i < lines.length; i++) {
                text = lines[i];
                if (text.length < 1)
                    continue;
                ofs = text.indexOf("//");
                if (ofs === 0)
                    continue;
                if (ofs >= 0)
                    text = text.substr(0, ofs);
                node = noUseNode || new ShaderNode(includefiles);
                noUseNode = null;
                node.text = text;
                node.noCompile = true;
                if ((ofs = text.indexOf("#")) >= 0) {
                    name = "#";
                    for (j = ofs + 1, n = text.length; j < n; j++) {
                        var c = text.charAt(j);
                        if (c === ' ' || c === '\t' || c === '?')
                            break;
                        name += c;
                    }
                    node.name = name;
                    switch (name) {
                        case "#ifdef":
                        case "#ifndef":
                            node.src = text;
                            node.noCompile = text.match(/[!&|()=<>]/) != null;
                            if (!node.noCompile) {
                                words = text.replace(/^\s*/, '').split(/\s+/);
                                node.setCondition(words[1], name === "#ifdef" ? ShaderCompile.IFDEF_YES : ShaderCompile.IFDEF_ELSE);
                                node.text = "//" + node.text;
                            }
                            else {
                                console.log("function():Boolean{return " + text.substr(ofs + node.name.length) + "}");
                            }
                            node.setParent(parent);
                            parent = node;
                            if (defs) {
                                words = text.substr(j).split(ShaderCompile._splitToWordExps3);
                                for (j = 0; j < words.length; j++) {
                                    text = words[j];
                                    text.length && (defs[text] = true);
                                }
                            }
                            continue;
                        case "#if":
                            node.src = text;
                            node.noCompile = true;
                            node.setParent(parent);
                            parent = node;
                            if (defs) {
                                words = text.substr(j).split(ShaderCompile._splitToWordExps3);
                                for (j = 0; j < words.length; j++) {
                                    text = words[j];
                                    text.length && text != "defined" && (defs[text] = true);
                                }
                            }
                            continue;
                        case "#else":
                            node.src = text;
                            parent = parent.parent;
                            preNode = parent.childs[parent.childs.length - 1];
                            node.noCompile = preNode.noCompile;
                            if (!node.noCompile) {
                                node.condition = preNode.condition;
                                node.conditionType = preNode.conditionType == ShaderCompile.IFDEF_YES ? ShaderCompile.IFDEF_ELSE : ShaderCompile.IFDEF_YES;
                                node.text = "//" + node.text + " " + preNode.text + " " + node.conditionType;
                            }
                            node.setParent(parent);
                            parent = node;
                            continue;
                        case "#endif":
                            parent = parent.parent;
                            preNode = parent.childs[parent.childs.length - 1];
                            node.noCompile = preNode.noCompile;
                            if (!node.noCompile) {
                                node.text = "//" + node.text;
                            }
                            node.setParent(parent);
                            continue;
                        case "#include":
                            words = ShaderCompile.splitToWords(text, null);
                            var inlcudeFile = ShaderCompile.includes[words[1]];
                            if (!inlcudeFile) {
                                throw "ShaderCompile error no this include file:" + words[1];
                            }
                            if ((ofs = words[0].indexOf("?")) < 0) {
                                node.setParent(parent);
                                text = inlcudeFile.getWith(words[2] == 'with' ? words[3] : null);
                                this._compileToTree(node, text.split('\n'), 0, includefiles, defs);
                                node.text = "";
                                continue;
                            }
                            node.setCondition(words[0].substr(ofs + 1), ShaderCompile.IFDEF_YES);
                            node.text = inlcudeFile.getWith(words[2] == 'with' ? words[3] : null);
                            break;
                        case "#import":
                            words = ShaderCompile.splitToWords(text, null);
                            fname = words[1];
                            includefiles.push({ node: node, file: ShaderCompile.includes[fname], ofs: node.text.length });
                            continue;
                    }
                }
                else {
                    preNode = parent.childs[parent.childs.length - 1];
                    if (preNode && !preNode.name) {
                        includefiles.length > 0 && ShaderCompile.splitToWords(text, preNode);
                        noUseNode = node;
                        preNode.text += "\n" + text;
                        continue;
                    }
                    includefiles.length > 0 && ShaderCompile.splitToWords(text, node);
                }
                node.setParent(parent);
            }
        }
        createShader(define, shaderName, createShader, bindAttrib) {
            var defMap = {};
            var defineStr = "";
            if (define) {
                for (var i in define) {
                    defineStr += "#define " + i + "\n";
                    defMap[i] = true;
                }
            }
            var vs = this._VS.toscript(defMap, []);
            var ps = this._PS.toscript(defMap, []);
            return (createShader || Shader.create)(defineStr + vs.join('\n'), defineStr + ps.join('\n'), shaderName, this._nameMap, bindAttrib);
        }
    }
    ShaderCompile.IFDEF_NO = 0;
    ShaderCompile.IFDEF_YES = 1;
    ShaderCompile.IFDEF_ELSE = 2;
    ShaderCompile.IFDEF_PARENT = 3;
    ShaderCompile._removeAnnotation = new RegExp("(/\\*([^*]|[\\r\\\n]|(\\*+([^*/]|[\\r\\n])))*\\*+/)|(//.*)", "g");
    ShaderCompile._reg = new RegExp("(\".*\")|('.*')|([#\\w\\*-\\.+/()=<>{}\\\\]+)|([,;:\\\\])", "g");
    ShaderCompile._splitToWordExps = new RegExp("[(\".*\")]+|[('.*')]+|([ \\t=\\+\\-*/&%!<>!%\(\),;])", "g");
    ShaderCompile.includes = {};
    ShaderCompile._clearCR = new RegExp("\r", "g");
    ShaderCompile._splitToWordExps3 = new RegExp("[ \\t=\\+\\-*/&%!<>!%\(\),;\\|]", "g");

    class WorkerLoader extends EventDispatcher {
        constructor() {
            super();
            this.worker = new Worker(WorkerLoader.workerPath);
            let me = this;
            this.worker.onmessage = function (evt) {
                me.workerMessage(evt.data);
            };
        }
        static __init__() {
            if (WorkerLoader._preLoadFun != null)
                return false;
            if (!Worker)
                return false;
            WorkerLoader._preLoadFun = Loader["prototype"]["_loadImage"];
            Loader["prototype"]["_loadImage"] = WorkerLoader["prototype"]["_loadImage"];
            if (!WorkerLoader.I)
                WorkerLoader.I = new WorkerLoader();
            return true;
        }
        static workerSupported() {
            return Worker ? true : false;
        }
        static enableWorkerLoader() {
            if (!WorkerLoader._tryEnabled) {
                WorkerLoader.enable = true;
                WorkerLoader._tryEnabled = true;
            }
        }
        static set enable(value) {
            if (WorkerLoader._enable != value) {
                WorkerLoader._enable = value;
                if (value && WorkerLoader._preLoadFun == null)
                    WorkerLoader._enable = WorkerLoader.__init__();
            }
        }
        static get enable() {
            return WorkerLoader._enable;
        }
        workerMessage(data) {
            if (data) {
                switch (data.type) {
                    case "Image":
                        this.imageLoaded(data);
                        break;
                    case "Disable":
                        WorkerLoader.enable = false;
                        break;
                }
            }
        }
        imageLoaded(data) {
            if (!data.dataType || data.dataType != "imageBitmap") {
                this.event(data.url, null);
                return;
            }
            var imageData = data.imageBitmap;
            var tex = new Texture2D();
            tex.loadImageSource(imageData);
            console.log("load:", data.url);
            this.event(data.url, tex);
        }
        loadImage(url) {
            this.worker.postMessage(url);
        }
        _loadImage(url) {
            var _this = this;
            if (!this._useWorkerLoader || !WorkerLoader._enable) {
                WorkerLoader._preLoadFun.call(_this, url);
                return;
            }
            url = URL.formatURL(url);
            function clear() {
                WorkerLoader.I.off(url, _this, onload);
            }
            var onload = function (image) {
                clear();
                if (image) {
                    _this["onLoaded"](image);
                }
                else {
                    WorkerLoader._preLoadFun.call(_this, url);
                }
            };
            WorkerLoader.I.on(url, _this, onload);
            WorkerLoader.I.loadImage(url);
        }
    }
    WorkerLoader.workerPath = "libs/workerloader.js";
    WorkerLoader._enable = false;
    WorkerLoader._tryEnabled = false;

    class Mouse {
        static set cursor(cursorStr) {
            Mouse._style.cursor = cursorStr;
        }
        static get cursor() {
            return Mouse._style.cursor;
        }
        static __init__() {
        }
        static hide() {
            if (Mouse.cursor != "none") {
                Mouse._preCursor = Mouse.cursor;
                Mouse.cursor = "none";
            }
        }
        static show() {
            if (Mouse.cursor == "none") {
                if (Mouse._preCursor) {
                    Mouse.cursor = Mouse._preCursor;
                }
                else {
                    Mouse.cursor = "auto";
                }
            }
        }
    }

    class MeshParticle2D extends Mesh2D {
        constructor(maxNum) {
            super(MeshParticle2D.const_stride, maxNum * 4 * MeshParticle2D.const_stride, 4);
            this.canReuse = true;
            this.setAttributes(MeshParticle2D._fixattriInfo);
            this.createQuadIB(maxNum);
            this._quadNum = maxNum;
        }
        static __init__() {
            var gl = LayaGL.instance;
            MeshParticle2D._fixattriInfo = [gl.FLOAT, 4, 0,
                gl.FLOAT, 3, 16,
                gl.FLOAT, 3, 28,
                gl.FLOAT, 4, 40,
                gl.FLOAT, 4, 56,
                gl.FLOAT, 3, 72,
                gl.FLOAT, 2, 84,
                gl.FLOAT, 4, 92,
                gl.FLOAT, 1, 108,
                gl.FLOAT, 1, 112];
        }
        setMaxParticleNum(maxNum) {
            this._vb._resizeBuffer(maxNum * 4 * MeshParticle2D.const_stride, false);
            this.createQuadIB(maxNum);
        }
        static getAMesh(maxNum) {
            if (MeshParticle2D._POOL.length) {
                var ret = MeshParticle2D._POOL.pop();
                ret.setMaxParticleNum(maxNum);
                return ret;
            }
            return new MeshParticle2D(maxNum);
        }
        releaseMesh() {
            this._vb.setByteLength(0);
            this.vertNum = 0;
            this.indexNum = 0;
            MeshParticle2D._POOL.push(this);
        }
        destroy() {
            this._ib.destroy();
            this._vb.destroy();
            this._vb.deleteBuffer();
        }
    }
    MeshParticle2D.const_stride = 116;
    MeshParticle2D._POOL = [];

    class HTMLImage extends Bitmap {
    }
    HTMLImage.create = function (width, height, format) {
        var tex = new Texture2D(width, height, format, false, false);
        tex.wrapModeU = BaseTexture.WARPMODE_CLAMP;
        tex.wrapModeV = BaseTexture.WARPMODE_CLAMP;
        return tex;
    };

    class Laya {
        static __init(_classs) {
            _classs.forEach(function (o) { o.__init$ && o.__init$(); });
        }
        static init(inputCanvas, input2dCanvas, inputCharCanvas, width, height, ...plugins) {
            if (Laya._isinit)
                return;
            Laya._isinit = true;
            Laya.inputCanvas = inputCanvas;
            Laya.input2dCanvas = input2dCanvas;
            Laya.inputCharCanvas = inputCharCanvas;
            const dpr = wx.getSystemInfoSync().pixelRatio;
            wx.window.innerWidth = wx.window.screen.availWidth = Laya.inputCanvas.width / dpr;
            wx.window.innerHeight = wx.window.screen.availHeight = Laya.inputCanvas.height / dpr;
            ArrayBuffer.prototype.slice || (ArrayBuffer.prototype.slice = Laya._arrayBufferSlice);
            Browser.__init__();
            var mainCanv = Browser.mainCanvas = new HTMLCanvas(true, Laya.inputCanvas);
            /*var style = mainCanv.source.style;
            style.position = 'absolute';
            style.top = style.left = "0px";
            style.background = "#000000";
            if (!Browser.onKGMiniGame && !Browser.onAlipayMiniGame) {
                Browser.container.appendChild(mainCanv.source);
            }*/
            Browser.canvas = new HTMLCanvas(true, Laya.input2dCanvas);
            Browser.context = Browser.canvas.getContext('2d');
            Browser.supportWebAudio = SoundManager.__init__();
            Browser.supportLocalStorage = LocalStorage.__init__();
            Laya.systemTimer = new Timer(false);
            exports.systemTimer = Timer.gSysTimer = Laya.systemTimer;
            Laya.startTimer = new Timer(false);
            Laya.physicsTimer = new Timer(false);
            Laya.updateTimer = new Timer(false);
            Laya.lateTimer = new Timer(false);
            Laya.timer = new Timer(false);
            exports.startTimer = ILaya.startTimer = Laya.startTimer;
            exports.lateTimer = ILaya.lateTimer = Laya.lateTimer;
            exports.updateTimer = ILaya.updateTimer = Laya.updateTimer;
            ILaya.systemTimer = Laya.systemTimer;
            exports.timer = ILaya.timer = Laya.timer;
            exports.physicsTimer = ILaya.physicsTimer = Laya.physicsTimer;
            Laya.loader = new LoaderManager();
            ILaya.Laya = Laya;
            exports.loader = ILaya.loader = Laya.loader;
            WeakObject.__init__();
            SceneUtils.__init();
            Mouse.__init__();
            WebGL.inner_enable();
            for (var i = 0, n = plugins.length; i < n; i++) {
                if (plugins[i] && plugins[i].enable) {
                    plugins[i].enable();
                }
            }
            if (ILaya.Render.isConchApp) {
                Laya.enableNative();
            }
            Laya.enableWebGLPlus();
            CacheManger.beginCheck();
            exports.stage = Laya.stage = new Stage();
            ILaya.stage = Laya.stage;
            Utils.gStage = Laya.stage;
            URL.rootPath = URL._basePath = Laya._getUrlPath();
            MeshQuadTexture.__int__();
            MeshVG.__init__();
            MeshTexture.__init__();
            Laya.render = new Render(0, 0, Browser.mainCanvas);
            exports.render = Laya.render;
            Laya.stage.size(width, height);
            window.stage = Laya.stage;
            WebGLContext.__init__();
            MeshParticle2D.__init__();
            ShaderCompile.__init__();
            RenderSprite.__init__();
            KeyBoardManager.__init__();
            MouseManager.instance.__init__(Laya.stage, Render.canvas);
            Input.__init__();
            SoundManager.autoStopMusic = true;
            Stat._StatRender = new StatUI();
            Value2D._initone(ShaderDefines2D.TEXTURE2D, TextureSV);
            Value2D._initone(ShaderDefines2D.TEXTURE2D | ShaderDefines2D.FILTERGLOW, TextureSV);
            Value2D._initone(ShaderDefines2D.PRIMITIVE, PrimitiveSV);
            Value2D._initone(ShaderDefines2D.SKINMESH, SkinSV);
            return Render.canvas;
        }
        static _getUrlPath() {
            var location = Browser.window.location;
            var pathName = location.pathname;
            pathName = pathName.charAt(2) == ':' ? pathName.substring(1) : pathName;
            return URL.getPath(location.protocol == "file:" ? pathName : location.protocol + "//" + location.host + location.pathname);
        }
        static _arrayBufferSlice(start, end) {
            var arr = this;
            var arrU8List = new Uint8Array(arr, start, end - start);
            var newU8List = new Uint8Array(arrU8List.length);
            newU8List.set(arrU8List);
            return newU8List.buffer;
        }
        static set alertGlobalError(value) {
            var erralert = 0;
            if (value) {
                Browser.window.onerror = function (msg, url, line, column, detail) {
                    if (erralert++ < 5 && detail)
                        this.alert("出错啦，请把此信息截图给研发商\n" + msg + "\n" + detail.stack);
                };
            }
            else {
                Browser.window.onerror = null;
            }
        }
        static _runScript(script) {
            return Browser.window[Laya._evcode](script);
        }
        static enableDebugPanel(debugJsPath = "libs/laya.debugtool.js") {
            if (!Laya["DebugPanel"]) {
                var script = Browser.createElement("script");
                script.onload = function () {
                    Laya["DebugPanel"].enable();
                };
                script.src = debugJsPath;
                Browser.document.body.appendChild(script);
            }
            else {
                Laya["DebugPanel"].enable();
            }
        }
        static enableWebGLPlus() {
            WebGLContext.__init_native();
        }
        static enableNative() {
            if (Laya.isNativeRender_enable)
                return;
            Laya.isNativeRender_enable = true;
            Shader.prototype.uploadTexture2D = function (value) {
                var gl = LayaGL.instance;
                gl.bindTexture(gl.TEXTURE_2D, value);
            };
            RenderState2D.width = Browser.window.innerWidth;
            RenderState2D.height = Browser.window.innerHeight;
            Browser.measureText = function (txt, font) {
                window["conchTextCanvas"].font = font;
                return window["conchTextCanvas"].measureText(txt);
            };
            Stage.clear = function (color) {
                Context.set2DRenderConfig();
                var c = ColorUtils.create(color).arrColor;
                var gl = LayaGL.instance;
                if (c)
                    gl.clearColor(c[0], c[1], c[2], c[3]);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
                RenderState2D.clear();
            };
            Sprite.drawToCanvas = Sprite.drawToTexture = function (sprite, _renderType, canvasWidth, canvasHeight, offsetX, offsetY) {
                offsetX -= sprite.x;
                offsetY -= sprite.y;
                offsetX |= 0;
                offsetY |= 0;
                canvasWidth |= 0;
                canvasHeight |= 0;
                var canv = new HTMLCanvas(false);
                var ctx = canv.getContext('2d');
                canv.size(canvasWidth, canvasHeight);
                ctx.asBitmap = true;
                ctx._targets.start();
                RenderSprite.renders[_renderType]._fun(sprite, ctx, offsetX, offsetY);
                ctx.flush();
                ctx._targets.end();
                ctx._targets.restore();
                return canv;
            };
            Object["defineProperty"](RenderTexture2D.prototype, "uv", {
                "get": function () {
                    return this._uv;
                },
                "set": function (v) {
                    this._uv = v;
                }
            });
            HTMLCanvas.prototype.getTexture = function () {
                if (!this._texture) {
                    this._texture = this.context._targets;
                    this._texture.uv = RenderTexture2D.flipyuv;
                    this._texture.bitmap = this._texture;
                }
                return this._texture;
            };
        }
    }
    Laya.stage = null;
    Laya.systemTimer = null;
    Laya.startTimer = null;
    Laya.physicsTimer = null;
    Laya.updateTimer = null;
    Laya.lateTimer = null;
    Laya.timer = null;
    Laya.loader = null;
    Laya.version = "2.2.0";
    Laya._isinit = false;
    Laya.isWXOpenDataContext = false;
    Laya.isWXPosMsg = false;
    Laya.__classmap = null;
    Laya.Config = Config;
    Laya.TextRender = TextRender;
    Laya.EventDispatcher = EventDispatcher;
    Laya.SoundChannel = SoundChannel;
    Laya.Stage = Stage;
    Laya.Render = Render;
    Laya.Browser = Browser;
    Laya.Sprite = Sprite;
    Laya.Node = Node;
    Laya.Context = Context;
    Laya.WebGL = WebGL;
    Laya.Handler = Handler;
    Laya.RunDriver = RunDriver;
    Laya.Utils = Utils;
    Laya.Input = Input;
    Laya.Loader = Loader;
    Laya.LocalStorage = LocalStorage;
    Laya.SoundManager = SoundManager;
    Laya.URL = URL;
    Laya.Event = Event;
    Laya.Matrix = Matrix;
    Laya.HTMLImage = HTMLImage;
    Laya.Laya = Laya;
    Laya._evcode = "eva" + "l";
    Laya.isNativeRender_enable = false;
    Laya.__classmap = ILaya.__classMap;
    ILaya.Timer = Timer;
    ILaya.Dragging = Dragging;
    ILaya.GraphicsBounds = GraphicsBounds;
    ILaya.Sprite = Sprite;
    ILaya.TextRender = TextRender;
    ILaya.Loader = Loader;
    ILaya.TTFLoader = TTFLoader;
    ILaya.WebAudioSound = WebAudioSound;
    ILaya.SoundManager = SoundManager;
    ILaya.ShaderCompile = ShaderCompile;
    ILaya.ClassUtils = ClassUtils;
    ILaya.SceneUtils = SceneUtils;
    ILaya.Context = Context;
    ILaya.Render = Render;
    ILaya.MouseManager = MouseManager;
    ILaya.Text = Text;
    ILaya.Browser = Browser;
    ILaya.WebGL = WebGL;
    ILaya.AudioSound = AudioSound;
    ILaya.Pool = Pool;
    ILaya.Utils = Utils;
    ILaya.Graphics = Graphics;
    ILaya.Submit = Submit;
    ILaya.Stage = Stage;
    ILaya.Resource = Resource;
    ILaya.WorkerLoader = WorkerLoader;
    var libs = window._layalibs;
    if (libs) {
        libs.sort(function (a, b) {
            return a.i - b.i;
        });
        for (var j = 0; j < libs.length; j++) {
            libs[j].f(window, window.document, Laya);
        }
    }
    let win = window;
    if (win.Laya) {
        win.Laya.Laya = Laya;
        Object.assign(win.Laya, Laya);
    }
    else
        win.Laya = Laya;
    var __init = Laya.__init;
    var init = Laya.init;
    var version = Laya.version;
    var isWXOpenDataContext;
    var isWXPosMsg;
    var alertGlobalError = Laya.alertGlobalError;
    var enableDebugPanel = Laya.enableDebugPanel;
    function _static(_class, def) {
        for (var i = 0, sz = def.length; i < sz; i += 2) {
            if (def[i] == 'length')
                _class.length = def[i + 1].call(_class);
            else {
                function tmp() {
                    var name = def[i];
                    var getfn = def[i + 1];
                    Object.defineProperty(_class, name, {
                        get: function () { delete this[name]; return this[name] = getfn.call(this); },
                        set: function (v) { delete this[name]; this[name] = v; }, enumerable: true, configurable: true
                    });
                }
                tmp();
            }
        }
    }

    class CommonScript extends Component {
        get isSingleton() {
            return false;
        }
        constructor() {
            super();
        }
        onAwake() {
        }
        onEnable() {
        }
        onStart() {
        }
        onUpdate() {
        }
        onLateUpdate() {
        }
        onDisable() {
        }
        onDestroy() {
        }
    }

    class Script extends Component {
        get isSingleton() {
            return false;
        }
        _onAwake() {
            this.onAwake();
            if (this.onStart !== Script.prototype.onStart) {
                ILaya.startTimer.callLater(this, this.onStart);
            }
        }
        _onEnable() {
            var proto = Script.prototype;
            if (this.onTriggerEnter !== proto.onTriggerEnter) {
                this.owner.on(Event.TRIGGER_ENTER, this, this.onTriggerEnter);
            }
            if (this.onTriggerStay !== proto.onTriggerStay) {
                this.owner.on(Event.TRIGGER_STAY, this, this.onTriggerStay);
            }
            if (this.onTriggerExit !== proto.onTriggerExit) {
                this.owner.on(Event.TRIGGER_EXIT, this, this.onTriggerExit);
            }
            if (this.onMouseDown !== proto.onMouseDown) {
                this.owner.on(Event.MOUSE_DOWN, this, this.onMouseDown);
            }
            if (this.onMouseUp !== proto.onMouseUp) {
                this.owner.on(Event.MOUSE_UP, this, this.onMouseUp);
            }
            if (this.onClick !== proto.onClick) {
                this.owner.on(Event.CLICK, this, this.onClick);
            }
            if (this.onStageMouseDown !== proto.onStageMouseDown) {
                ILaya.stage.on(Event.MOUSE_DOWN, this, this.onStageMouseDown);
            }
            if (this.onStageMouseUp !== proto.onStageMouseUp) {
                ILaya.stage.on(Event.MOUSE_UP, this, this.onStageMouseUp);
            }
            if (this.onStageClick !== proto.onStageClick) {
                ILaya.stage.on(Event.CLICK, this, this.onStageClick);
            }
            if (this.onStageMouseMove !== proto.onStageMouseMove) {
                ILaya.stage.on(Event.MOUSE_MOVE, this, this.onStageMouseMove);
            }
            if (this.onDoubleClick !== proto.onDoubleClick) {
                this.owner.on(Event.DOUBLE_CLICK, this, this.onDoubleClick);
            }
            if (this.onRightClick !== proto.onRightClick) {
                this.owner.on(Event.RIGHT_CLICK, this, this.onRightClick);
            }
            if (this.onMouseMove !== proto.onMouseMove) {
                this.owner.on(Event.MOUSE_MOVE, this, this.onMouseMove);
            }
            if (this.onMouseOver !== proto.onMouseOver) {
                this.owner.on(Event.MOUSE_OVER, this, this.onMouseOver);
            }
            if (this.onMouseOut !== proto.onMouseOut) {
                this.owner.on(Event.MOUSE_OUT, this, this.onMouseOut);
            }
            if (this.onKeyDown !== proto.onKeyDown) {
                ILaya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
            }
            if (this.onKeyPress !== proto.onKeyPress) {
                ILaya.stage.on(Event.KEY_PRESS, this, this.onKeyPress);
            }
            if (this.onKeyUp !== proto.onKeyUp) {
                ILaya.stage.on(Event.KEY_UP, this, this.onKeyUp);
            }
            if (this.onUpdate !== proto.onUpdate) {
                ILaya.updateTimer.frameLoop(1, this, this.onUpdate);
            }
            if (this.onLateUpdate !== proto.onLateUpdate) {
                ILaya.lateTimer.frameLoop(1, this, this.onLateUpdate);
            }
            if (this.onPreRender !== proto.onPreRender) {
                ILaya.lateTimer.frameLoop(1, this, this.onPreRender);
            }
        }
        _onDisable() {
            this.owner.offAllCaller(this);
            ILaya.stage.offAllCaller(this);
            ILaya.startTimer.clearAll(this);
            ILaya.updateTimer.clearAll(this);
            ILaya.lateTimer.clearAll(this);
        }
        _isScript() {
            return true;
        }
        _onDestroy() {
            this.onDestroy();
        }
        onAwake() {
        }
        onEnable() {
        }
        onStart() {
        }
        onTriggerEnter(other, self, contact) {
        }
        onTriggerStay(other, self, contact) {
        }
        onTriggerExit(other, self, contact) {
        }
        onMouseDown(e) {
        }
        onMouseUp(e) {
        }
        onClick(e) {
        }
        onStageMouseDown(e) {
        }
        onStageMouseUp(e) {
        }
        onStageClick(e) {
        }
        onStageMouseMove(e) {
        }
        onDoubleClick(e) {
        }
        onRightClick(e) {
        }
        onMouseMove(e) {
        }
        onMouseOver(e) {
        }
        onMouseOut(e) {
        }
        onKeyDown(e) {
        }
        onKeyPress(e) {
        }
        onKeyUp(e) {
        }
        onUpdate() {
        }
        onLateUpdate() {
        }
        onPreRender() {
        }
        onPostRender() {
        }
        onDisable() {
        }
        onDestroy() {
        }
    }

    class GraphicAnimation extends FrameAnimation {
        constructor() {
            super(...arguments);
            this._nodeIDAniDic = {};
        }
        _parseNodeList(uiView) {
            if (!this._nodeList)
                this._nodeList = [];
            this._nodeDefaultProps[uiView.compId] = uiView.props;
            if (uiView.compId)
                this._nodeList.push(uiView.compId);
            var childs = uiView.child;
            if (childs) {
                var i, len = childs.length;
                for (i = 0; i < len; i++) {
                    this._parseNodeList(childs[i]);
                }
            }
        }
        _calGraphicData(aniData) {
            this._setUp(null, aniData);
            this._createGraphicData();
            if (this._nodeIDAniDic) {
                var key;
                for (key in this._nodeIDAniDic) {
                    this._nodeIDAniDic[key] = null;
                }
            }
        }
        _createGraphicData() {
            var gList = [];
            var i, len = this.count;
            var animationDataNew = this._usedFrames;
            if (!animationDataNew)
                animationDataNew = [];
            var preGraphic;
            for (i = 0; i < len; i++) {
                if (animationDataNew[i] || !preGraphic) {
                    preGraphic = this._createFrameGraphic(i);
                }
                gList.push(preGraphic);
            }
            this._gList = gList;
        }
        _createFrameGraphic(frame) {
            var g = new Graphics();
            if (!GraphicAnimation._rootMatrix)
                GraphicAnimation._rootMatrix = new Matrix();
            this._updateNodeGraphic(this._rootNode, frame, GraphicAnimation._rootMatrix, g);
            return g;
        }
        _updateNodeGraphic(node, frame, parentTransfrom, g, alpha = 1) {
            var tNodeG;
            tNodeG = this._nodeGDic[node.compId] = this._getNodeGraphicData(node.compId, frame, this._nodeGDic[node.compId]);
            if (!tNodeG.resultTransform)
                tNodeG.resultTransform = new Matrix();
            var tResultTransform;
            tResultTransform = tNodeG.resultTransform;
            Matrix.mul(tNodeG.transform, parentTransfrom, tResultTransform);
            var tTex;
            var tGraphicAlpha = tNodeG.alpha * alpha;
            if (tGraphicAlpha < 0.01)
                return;
            if (tNodeG.skin) {
                tTex = this._getTextureByUrl(tNodeG.skin);
                if (tTex) {
                    if (tResultTransform._checkTransform()) {
                        g.drawTexture(tTex, 0, 0, tNodeG.width, tNodeG.height, tResultTransform, tGraphicAlpha);
                        tNodeG.resultTransform = null;
                    }
                    else {
                        g.drawTexture(tTex, tResultTransform.tx, tResultTransform.ty, tNodeG.width, tNodeG.height, null, tGraphicAlpha);
                    }
                }
            }
            var childs = node.child;
            if (!childs)
                return;
            var i, len;
            len = childs.length;
            for (i = 0; i < len; i++) {
                this._updateNodeGraphic(childs[i], frame, tResultTransform, g, tGraphicAlpha);
            }
        }
        _updateNoChilds(tNodeG, g) {
            if (!tNodeG.skin)
                return;
            var tTex = this._getTextureByUrl(tNodeG.skin);
            if (!tTex)
                return;
            var tTransform = tNodeG.transform;
            tTransform._checkTransform();
            var onlyTranslate;
            onlyTranslate = !tTransform._bTransform;
            if (!onlyTranslate) {
                g.drawTexture(tTex, 0, 0, tNodeG.width, tNodeG.height, tTransform.clone(), tNodeG.alpha);
            }
            else {
                g.drawTexture(tTex, tTransform.tx, tTransform.ty, tNodeG.width, tNodeG.height, null, tNodeG.alpha);
            }
        }
        _updateNodeGraphic2(node, frame, g) {
            var tNodeG;
            tNodeG = this._nodeGDic[node.compId] = this._getNodeGraphicData(node.compId, frame, this._nodeGDic[node.compId]);
            if (!node.child) {
                this._updateNoChilds(tNodeG, g);
                return;
            }
            var tTransform = tNodeG.transform;
            tTransform._checkTransform();
            var onlyTranslate;
            onlyTranslate = !tTransform._bTransform;
            var hasTrans;
            hasTrans = onlyTranslate && (tTransform.tx != 0 || tTransform.ty != 0);
            var ifSave;
            ifSave = (tTransform._bTransform) || tNodeG.alpha != 1;
            if (ifSave)
                g.save();
            if (tNodeG.alpha != 1)
                g.alpha(tNodeG.alpha);
            if (!onlyTranslate)
                g.transform(tTransform.clone());
            else if (hasTrans)
                g.translate(tTransform.tx, tTransform.ty);
            var childs = node.child;
            var tTex;
            if (tNodeG.skin) {
                tTex = this._getTextureByUrl(tNodeG.skin);
                if (tTex) {
                    g.drawImage(tTex, 0, 0, tNodeG.width, tNodeG.height);
                }
            }
            if (childs) {
                var i, len;
                len = childs.length;
                for (i = 0; i < len; i++) {
                    this._updateNodeGraphic2(childs[i], frame, g);
                }
            }
            if (ifSave) {
                g.restore();
            }
            else {
                if (!onlyTranslate) {
                    g.transform(tTransform.clone().invert());
                }
                else if (hasTrans) {
                    g.translate(-tTransform.tx, -tTransform.ty);
                }
            }
        }
        _calculateKeyFrames(node) {
            super._calculateKeyFrames(node);
            this._nodeIDAniDic[node.target] = node;
        }
        getNodeDataByID(nodeID) {
            return this._nodeIDAniDic[nodeID];
        }
        _getParams(obj, params, frame, obj2) {
            var rst = GraphicAnimation._temParam;
            rst.length = params.length;
            var i, len = params.length;
            for (i = 0; i < len; i++) {
                rst[i] = this._getObjVar(obj, params[i][0], frame, params[i][1], obj2);
            }
            return rst;
        }
        _getObjVar(obj, key, frame, noValue, obj2) {
            if (key in obj) {
                var vArr = obj[key];
                if (frame >= vArr.length)
                    frame = vArr.length - 1;
                return obj[key][frame];
            }
            if (key in obj2) {
                return obj2[key];
            }
            return noValue;
        }
        _getNodeGraphicData(nodeID, frame, rst) {
            if (!rst)
                rst = new GraphicNode();
            if (!rst.transform) {
                rst.transform = new Matrix();
            }
            else {
                rst.transform.identity();
            }
            var node = this.getNodeDataByID(nodeID);
            if (!node)
                return rst;
            var frameData = node.frames;
            var params = this._getParams(frameData, GraphicAnimation._drawTextureCmd, frame, this._nodeDefaultProps[nodeID]);
            var url = params[0];
            var width, height;
            var px = params[5], py = params[6];
            var aX = params[13], aY = params[14];
            var sx = params[7], sy = params[8];
            var rotate = params[9];
            var skewX = params[11], skewY = params[12];
            width = params[3];
            height = params[4];
            if (width == 0 || height == 0)
                url = null;
            if (width == -1)
                width = 0;
            if (height == -1)
                height = 0;
            var tex;
            rst.skin = url;
            rst.width = width;
            rst.height = height;
            if (url) {
                tex = this._getTextureByUrl(url);
                if (tex) {
                    if (!width)
                        width = tex.sourceWidth;
                    if (!height)
                        height = tex.sourceHeight;
                }
                else {
                    console.warn("lost skin:", url, ",you may load pics first");
                }
            }
            rst.alpha = params[10];
            var m = rst.transform;
            if (aX != 0) {
                px = aX * width;
            }
            if (aY != 0) {
                py = aY * height;
            }
            if (px != 0 || py != 0) {
                m.translate(-px, -py);
            }
            var tm = null;
            if (rotate || sx !== 1 || sy !== 1 || skewX || skewY) {
                tm = GraphicAnimation._tempMt;
                tm.identity();
                tm._bTransform = true;
                var skx = (rotate - skewX) * 0.0174532922222222;
                var sky = (rotate + skewY) * 0.0174532922222222;
                var cx = Math.cos(sky);
                var ssx = Math.sin(sky);
                var cy = Math.sin(skx);
                var ssy = Math.cos(skx);
                tm.a = sx * cx;
                tm.b = sx * ssx;
                tm.c = -sy * cy;
                tm.d = sy * ssy;
                tm.tx = tm.ty = 0;
            }
            if (tm) {
                m = Matrix.mul(m, tm, m);
            }
            m.translate(params[1], params[2]);
            return rst;
        }
        _getTextureByUrl(url) {
            return Loader.getRes(url);
        }
        setAniData(uiView, aniName = null) {
            if (uiView.animations) {
                this._nodeDefaultProps = {};
                this._nodeGDic = {};
                if (this._nodeList)
                    this._nodeList.length = 0;
                this._rootNode = uiView;
                this._parseNodeList(uiView);
                var aniDic = {};
                var anilist = [];
                var animations = uiView.animations;
                var i, len = animations.length;
                var tAniO;
                for (i = 0; i < len; i++) {
                    tAniO = animations[i];
                    this._labels = null;
                    if (aniName && aniName != tAniO.name) {
                        continue;
                    }
                    if (!tAniO)
                        continue;
                    try {
                        this._calGraphicData(tAniO);
                    }
                    catch (e) {
                        console.warn("parse animation fail:" + tAniO.name + ",empty animation created");
                        this._gList = [];
                    }
                    var frameO = {};
                    frameO.interval = 1000 / tAniO["frameRate"];
                    frameO.frames = this._gList;
                    frameO.labels = this._labels;
                    frameO.name = tAniO.name;
                    anilist.push(frameO);
                    aniDic[tAniO.name] = frameO;
                }
                this.animationList = anilist;
                this.animationDic = aniDic;
            }
            GraphicAnimation._temParam.length = 0;
        }
        parseByData(aniData) {
            var rootNode, aniO;
            rootNode = aniData.nodeRoot;
            aniO = aniData.aniO;
            delete aniData.nodeRoot;
            delete aniData.aniO;
            this._nodeDefaultProps = {};
            this._nodeGDic = {};
            if (this._nodeList)
                this._nodeList.length = 0;
            this._rootNode = rootNode;
            this._parseNodeList(rootNode);
            this._labels = null;
            try {
                this._calGraphicData(aniO);
            }
            catch (e) {
                console.warn("parse animation fail:" + aniO.name + ",empty animation created");
                this._gList = [];
            }
            var frameO = aniData;
            frameO.interval = 1000 / aniO["frameRate"];
            frameO.frames = this._gList;
            frameO.labels = this._labels;
            frameO.name = aniO.name;
            return frameO;
        }
        setUpAniData(uiView) {
            if (uiView.animations) {
                var aniDic = {};
                var anilist = [];
                var animations = uiView.animations;
                var i, len = animations.length;
                var tAniO;
                for (i = 0; i < len; i++) {
                    tAniO = animations[i];
                    if (!tAniO)
                        continue;
                    var frameO = {};
                    frameO.name = tAniO.name;
                    frameO.aniO = tAniO;
                    frameO.nodeRoot = uiView;
                    anilist.push(frameO);
                    aniDic[tAniO.name] = frameO;
                }
                this.animationList = anilist;
                this.animationDic = aniDic;
            }
        }
        _clear() {
            this.animationList = null;
            this.animationDic = null;
            this._gList = null;
            this._nodeGDic = null;
        }
        static parseAnimationByData(animationObject) {
            if (!GraphicAnimation._I)
                GraphicAnimation._I = new GraphicAnimation();
            var rst;
            rst = GraphicAnimation._I.parseByData(animationObject);
            GraphicAnimation._I._clear();
            return rst;
        }
        static parseAnimationData(aniData) {
            if (!GraphicAnimation._I)
                GraphicAnimation._I = new GraphicAnimation();
            GraphicAnimation._I.setUpAniData(aniData);
            var rst;
            rst = {};
            rst.animationList = GraphicAnimation._I.animationList;
            rst.animationDic = GraphicAnimation._I.animationDic;
            GraphicAnimation._I._clear();
            return rst;
        }
    }
    GraphicAnimation._drawTextureCmd = [["skin", null], ["x", 0], ["y", 0], ["width", -1], ["height", -1], ["pivotX", 0], ["pivotY", 0], ["scaleX", 1], ["scaleY", 1], ["rotation", 0], ["alpha", 1], ["skewX", 0], ["skewY", 0], ["anchorX", 0], ["anchorY", 0]];
    GraphicAnimation._temParam = [];
    GraphicAnimation._tempMt = new Matrix();
    class GraphicNode {
        constructor() {
            this.alpha = 1;
        }
    }

    class Animation extends AnimationBase {
        constructor() {
            super();
            this._setControlNode(this);
        }
        destroy(destroyChild = true) {
            this.stop();
            super.destroy(destroyChild);
            this._frames = null;
            this._labels = null;
        }
        play(start = 0, loop = true, name = "") {
            if (name)
                this._setFramesFromCache(name, true);
            super.play(start, loop, name);
        }
        _setFramesFromCache(name, showWarn = false) {
            if (this._url)
                name = this._url + "#" + name;
            if (name && Animation.framesMap[name]) {
                var tAniO = Animation.framesMap[name];
                if (tAniO instanceof Array) {
                    this._frames = Animation.framesMap[name];
                    this._count = this._frames.length;
                }
                else {
                    if (tAniO.nodeRoot) {
                        Animation.framesMap[name] = GraphicAnimation.parseAnimationByData(tAniO);
                        tAniO = Animation.framesMap[name];
                    }
                    this._frames = tAniO.frames;
                    this._count = this._frames.length;
                    if (!this._frameRateChanged)
                        this._interval = tAniO.interval;
                    this._labels = this._copyLabels(tAniO.labels);
                }
                return true;
            }
            else {
                if (showWarn)
                    console.log("ani not found:", name);
            }
            return false;
        }
        _copyLabels(labels) {
            if (!labels)
                return null;
            var rst;
            rst = {};
            var key;
            for (key in labels) {
                rst[key] = Utils.copyArray([], labels[key]);
            }
            return rst;
        }
        _frameLoop() {
            if (this._visible && this._style.alpha > 0.01 && this._frames) {
                super._frameLoop();
            }
        }
        _displayToIndex(value) {
            if (this._frames)
                this.graphics = this._frames[value];
        }
        get frames() {
            return this._frames;
        }
        set frames(value) {
            this._frames = value;
            if (value) {
                this._count = value.length;
                if (this._actionName)
                    this._setFramesFromCache(this._actionName, true);
                this.index = this._index;
            }
        }
        set source(value) {
            if (value.indexOf(".ani") > -1)
                this.loadAnimation(value);
            else if (value.indexOf(".json") > -1 || value.indexOf("als") > -1 || value.indexOf("atlas") > -1)
                this.loadAtlas(value);
            else
                this.loadImages(value.split(","));
        }
        set autoAnimation(value) {
            this.play(0, true, value);
        }
        set autoPlay(value) {
            if (value)
                this.play();
            else
                this.stop();
        }
        clear() {
            super.clear();
            this.stop();
            this.graphics = null;
            this._frames = null;
            this._labels = null;
            return this;
        }
        loadImages(urls, cacheName = "") {
            this._url = "";
            if (!this._setFramesFromCache(cacheName)) {
                this.frames = Animation.framesMap[cacheName] ? Animation.framesMap[cacheName] : Animation.createFrames(urls, cacheName);
            }
            return this;
        }
        loadAtlas(url, loaded = null, cacheName = "") {
            this._url = "";
            var _this = this;
            if (!_this._setFramesFromCache(cacheName)) {
                function onLoaded(loadUrl) {
                    if (url === loadUrl) {
                        _this.frames = Animation.framesMap[cacheName] ? Animation.framesMap[cacheName] : Animation.createFrames(url, cacheName);
                        if (loaded)
                            loaded.run();
                    }
                }
                if (Loader.getAtlas(url))
                    onLoaded(url);
                else
                    ILaya.loader.load(url, Handler.create(null, onLoaded, [url]), null, Loader.ATLAS);
            }
            return this;
        }
        loadAnimation(url, loaded = null, atlas = null) {
            this._url = url;
            var _this = this;
            if (!this._actionName)
                this._actionName = "";
            if (!_this._setFramesFromCache(this._actionName)) {
                if (!atlas || Loader.getAtlas(atlas)) {
                    this._loadAnimationData(url, loaded, atlas);
                }
                else {
                    ILaya.loader.load(atlas, Handler.create(this, this._loadAnimationData, [url, loaded, atlas]), null, Loader.ATLAS);
                }
            }
            else {
                _this._setFramesFromCache(this._actionName, true);
                this.index = 0;
                if (loaded)
                    loaded.run();
            }
            return this;
        }
        _loadAnimationData(url, loaded = null, atlas = null) {
            if (atlas && !Loader.getAtlas(atlas)) {
                console.warn("atlas load fail:" + atlas);
                return;
            }
            var _this = this;
            function onLoaded(loadUrl) {
                if (!Loader.getRes(loadUrl)) {
                    if (Animation.framesMap[url + "#"]) {
                        _this._setFramesFromCache(this._actionName, true);
                        _this.index = 0;
                        _this._resumePlay();
                        if (loaded)
                            loaded.run();
                    }
                    return;
                }
                if (url === loadUrl) {
                    var tAniO;
                    if (!Animation.framesMap[url + "#"]) {
                        var aniData = GraphicAnimation.parseAnimationData(Loader.getRes(url));
                        if (!aniData)
                            return;
                        var aniList = aniData.animationList;
                        var i, len = aniList.length;
                        var defaultO;
                        for (i = 0; i < len; i++) {
                            tAniO = aniList[i];
                            Animation.framesMap[url + "#" + tAniO.name] = tAniO;
                            if (!defaultO)
                                defaultO = tAniO;
                        }
                        if (defaultO) {
                            Animation.framesMap[url + "#"] = defaultO;
                            _this._setFramesFromCache(_this._actionName, true);
                            _this.index = 0;
                        }
                        _this._resumePlay();
                    }
                    else {
                        _this._setFramesFromCache(_this._actionName, true);
                        _this.index = 0;
                        _this._resumePlay();
                    }
                    if (loaded)
                        loaded.run();
                }
                Loader.clearRes(url);
            }
            if (Loader.getRes(url))
                onLoaded(url);
            else
                ILaya.loader.load(url, Handler.create(null, onLoaded, [url]), null, Loader.JSON);
        }
        static createFrames(url, name) {
            var arr;
            if (typeof (url) == 'string') {
                var atlas = Loader.getAtlas(url);
                if (atlas && atlas.length) {
                    arr = [];
                    for (var i = 0, n = atlas.length; i < n; i++) {
                        var g = new Graphics();
                        g.drawImage(Loader.getRes(atlas[i]), 0, 0);
                        arr.push(g);
                    }
                }
            }
            else if (url instanceof Array) {
                arr = [];
                for (i = 0, n = url.length; i < n; i++) {
                    g = new Graphics();
                    g.loadImage(url[i], 0, 0);
                    arr.push(g);
                }
            }
            if (name)
                Animation.framesMap[name] = arr;
            return arr;
        }
        static clearCache(key) {
            var cache = Animation.framesMap;
            var val;
            var key2 = key + "#";
            for (val in cache) {
                if (val === key || val.indexOf(key2) === 0) {
                    delete Animation.framesMap[val];
                }
            }
        }
    }
    Animation.framesMap = {};
    ILaya.regClass(Animation);
    ClassUtils.regClass("laya.display.Animation", Animation);
    ClassUtils.regClass("Laya.Animation", Animation);

    class EffectAnimation extends FrameAnimation {
        constructor() {
            super(...arguments);
            this._initData = {};
        }
        set target(v) {
            if (this._target)
                this._target.off(EffectAnimation.EFFECT_BEGIN, this, this._onOtherBegin);
            this._target = v;
            if (this._target)
                this._target.on(EffectAnimation.EFFECT_BEGIN, this, this._onOtherBegin);
            this._addEvent();
        }
        get target() {
            return this._target;
        }
        _onOtherBegin(effect) {
            if (effect === this)
                return;
            this.stop();
        }
        set playEvent(event) {
            this._playEvent = event;
            if (!event)
                return;
            this._addEvent();
        }
        _addEvent() {
            if (!this._target || !this._playEvent)
                return;
            this._setControlNode(this._target);
            this._target.on(this._playEvent, this, this._onPlayAction);
        }
        _onPlayAction() {
            this.play(0, false);
        }
        play(start = 0, loop = true, name = "") {
            if (!this._target)
                return;
            this._target.event(EffectAnimation.EFFECT_BEGIN, [this]);
            this._recordInitData();
            super.play(start, loop, name);
        }
        _recordInitData() {
            if (!this._aniKeys)
                return;
            var i, len;
            len = this._aniKeys.length;
            var key;
            for (i = 0; i < len; i++) {
                key = this._aniKeys[i];
                this._initData[key] = this._target[key];
            }
        }
        set effectClass(classStr) {
            this._effectClass = ClassUtils.getClass(classStr);
            if (this._effectClass) {
                var uiData = this._effectClass["uiView"];
                if (uiData) {
                    var aniData = uiData["animations"];
                    if (aniData && aniData[0]) {
                        var data = aniData[0];
                        this._setUp({}, data);
                        if (data.nodes && data.nodes[0]) {
                            this._aniKeys = data.nodes[0].keys;
                        }
                    }
                }
            }
        }
        set effectData(uiData) {
            if (uiData) {
                var aniData = uiData["animations"];
                if (aniData && aniData[0]) {
                    var data = aniData[0];
                    this._setUp({}, data);
                    if (data.nodes && data.nodes[0]) {
                        this._aniKeys = data.nodes[0].keys;
                    }
                }
            }
        }
        _displayToIndex(value) {
            if (!this._animationData)
                return;
            if (value < 0)
                value = 0;
            if (value > this._count)
                value = this._count;
            var nodes = this._animationData.nodes, i, len = nodes.length;
            len = len > 1 ? 1 : len;
            for (i = 0; i < len; i++) {
                this._displayNodeToFrame(nodes[i], value);
            }
        }
        _displayNodeToFrame(node, frame, targetDic = null) {
            if (!this._target)
                return;
            var target = this._target;
            var frames = node.frames, key, propFrames, value;
            var keys = node.keys, i, len = keys.length;
            var secondFrames = node.secondFrames;
            var tSecondFrame;
            var easeFun;
            var tKeyFrames;
            var startFrame;
            var endFrame;
            for (i = 0; i < len; i++) {
                key = keys[i];
                propFrames = frames[key];
                tSecondFrame = secondFrames[key];
                if (tSecondFrame == -1) {
                    value = this._initData[key];
                }
                else {
                    if (frame < tSecondFrame) {
                        tKeyFrames = node.keyframes[key];
                        startFrame = tKeyFrames[0];
                        if (startFrame.tween) {
                            easeFun = Ease[startFrame.tweenMethod];
                            if (easeFun == null)
                                easeFun = Ease.linearNone;
                            endFrame = tKeyFrames[1];
                            value = easeFun(frame, this._initData[key], endFrame.value - this._initData[key], endFrame.index);
                        }
                        else {
                            value = this._initData[key];
                        }
                    }
                    else {
                        if (propFrames.length > frame)
                            value = propFrames[frame];
                        else
                            value = propFrames[propFrames.length - 1];
                    }
                }
                target[key] = value;
            }
        }
        _calculateKeyFrames(node) {
            super._calculateKeyFrames(node);
            var keyFrames = node.keyframes, key, tKeyFrames, target = node.target;
            var secondFrames = {};
            node.secondFrames = secondFrames;
            for (key in keyFrames) {
                tKeyFrames = keyFrames[key];
                if (tKeyFrames.length <= 1)
                    secondFrames[key] = -1;
                else
                    secondFrames[key] = tKeyFrames[1].index;
            }
        }
    }
    EffectAnimation.EFFECT_BEGIN = "effectbegin";
    ClassUtils.regClass("laya.display.EffectAnimation", EffectAnimation);
    ClassUtils.regClass("Laya.EffectAnimation", EffectAnimation);

    class SceneLoader extends EventDispatcher {
        constructor() {
            super();
            this._completeHandler = new Handler(this, this.onOneLoadComplete);
            this.reset();
        }
        reset() {
            this._toLoadList = [];
            this._isLoading = false;
            this.totalCount = 0;
        }
        get leftCount() {
            if (this._isLoading)
                return this._toLoadList.length + 1;
            return this._toLoadList.length;
        }
        get loadedCount() {
            return this.totalCount - this.leftCount;
        }
        load(url, is3D = false, ifCheck = true) {
            if (url instanceof Array) {
                var i, len;
                len = url.length;
                for (i = 0; i < len; i++) {
                    this._addToLoadList(url[i], is3D);
                }
            }
            else {
                this._addToLoadList(url, is3D);
            }
            if (ifCheck)
                this._checkNext();
        }
        _addToLoadList(url, is3D = false) {
            if (this._toLoadList.indexOf(url) >= 0)
                return;
            if (Loader.getRes(url))
                return;
            if (is3D) {
                this._toLoadList.push({ url: url });
            }
            else
                this._toLoadList.push(url);
            this.totalCount++;
        }
        _checkNext() {
            if (!this._isLoading) {
                if (this._toLoadList.length == 0) {
                    this.event(Event.COMPLETE);
                    return;
                }
                var tItem;
                tItem = this._toLoadList.pop();
                if (typeof (tItem) == 'string') {
                    this.loadOne(tItem);
                }
                else {
                    this.loadOne(tItem.url, true);
                }
            }
        }
        loadOne(url, is3D = false) {
            this._curUrl = url;
            var type = Utils.getFileExtension(this._curUrl);
            if (is3D) {
                ILaya.loader.create(url, this._completeHandler);
            }
            else if (SceneLoader.LoadableExtensions[type]) {
                ILaya.loader.load(url, this._completeHandler, null, SceneLoader.LoadableExtensions[type]);
            }
            else if (url != AtlasInfoManager.getFileLoadPath(url) || SceneLoader.No3dLoadTypes[type] || !LoaderManager.createMap[type]) {
                ILaya.loader.load(url, this._completeHandler);
            }
            else {
                ILaya.loader.create(url, this._completeHandler);
            }
        }
        onOneLoadComplete() {
            this._isLoading = false;
            if (!Loader.getRes(this._curUrl)) {
                console.log("Fail to load:", this._curUrl);
            }
            var type = Utils.getFileExtension(this._curUrl);
            if (SceneLoader.LoadableExtensions[type]) {
                var dataO;
                dataO = Loader.getRes(this._curUrl);
                if (dataO && (dataO instanceof Prefab)) {
                    dataO = dataO.json;
                }
                if (dataO) {
                    if (dataO.loadList) {
                        this.load(dataO.loadList, false, false);
                    }
                    if (dataO.loadList3D) {
                        this.load(dataO.loadList3D, true, false);
                    }
                }
            }
            if (type == "sk") {
                this.load(this._curUrl.replace(".sk", ".png"), false, false);
            }
            this.event(Event.PROGRESS, this.getProgress());
            this._checkNext();
        }
        getProgress() {
            return this.loadedCount / this.totalCount;
        }
    }
    SceneLoader.LoadableExtensions = { "scene": Loader.JSON, "scene3d": Loader.JSON, "ani": Loader.JSON, "ui": Loader.JSON, "prefab": Loader.PREFAB };
    SceneLoader.No3dLoadTypes = { "png": true, "jpg": true, "txt": true };

    class Scene extends Sprite {
        constructor(createChildren = true) {
            super();
            this.autoDestroyAtClosed = false;
            this.url = null;
            this._viewCreated = false;
            this._$componentType = "Scene";
            this._setBit(Const.NOT_READY, true);
            Scene.unDestroyedScenes.push(this);
            this._scene = this;
            if (createChildren)
                this.createChildren();
        }
        createChildren() {
        }
        loadScene(path) {
            var url = path.indexOf(".") > -1 ? path : path + ".scene";
            var view = ILaya.loader.getRes(url);
            if (view) {
                this.createView(view);
            }
            else {
                ILaya.loader.resetProgress();
                var loader = new SceneLoader();
                loader.on(Event.COMPLETE, this, this._onSceneLoaded, [url]);
                loader.load(url);
            }
        }
        _onSceneLoaded(url) {
            this.createView(ILaya.Loader.getRes(url));
        }
        createView(view) {
            if (view && !this._viewCreated) {
                this._viewCreated = true;
                SceneUtils.createByData(this, view);
            }
        }
        getNodeByID(id) {
            if (this._idMap)
                return this._idMap[id];
            return null;
        }
        open(closeOther = true, param = null) {
            if (closeOther)
                Scene.closeAll();
            Scene.root.addChild(this);
            this.onOpened(param);
        }
        onOpened(param) {
        }
        close(type = null) {
            this.onClosed(type);
            if (this.autoDestroyAtClosed)
                this.destroy();
            else
                this.removeSelf();
        }
        onClosed(type = null) {
        }
        destroy(destroyChild = true) {
            this._idMap = null;
            super.destroy(destroyChild);
            var list = Scene.unDestroyedScenes;
            for (var i = list.length - 1; i > -1; i--) {
                if (list[i] === this) {
                    list.splice(i, 1);
                    return;
                }
            }
        }
        set scaleX(value) {
            if (super.get_scaleX() == value)
                return;
            super.set_scaleX(value);
            this.event(Event.RESIZE);
        }
        get scaleX() {
            return super.scaleX;
        }
        set scaleY(value) {
            if (super.get_scaleY() == value)
                return;
            super.set_scaleY(value);
            this.event(Event.RESIZE);
        }
        get scaleY() {
            return super.scaleY;
        }
        get width() {
            if (this._width)
                return this._width;
            var max = 0;
            for (var i = this.numChildren - 1; i > -1; i--) {
                var comp = this.getChildAt(i);
                if (comp._visible) {
                    max = Math.max(comp._x + comp.width * comp.scaleX, max);
                }
            }
            return max;
        }
        set width(value) {
            if (super.get_width() == value)
                return;
            super.set_width(value);
            this.callLater(this._sizeChanged);
        }
        get height() {
            if (this._height)
                return this._height;
            var max = 0;
            for (var i = this.numChildren - 1; i > -1; i--) {
                var comp = this.getChildAt(i);
                if (comp._visible) {
                    max = Math.max(comp._y + comp.height * comp.scaleY, max);
                }
            }
            return max;
        }
        set height(value) {
            if (super.get_height() == value)
                return;
            super.set_height(value);
            this.callLater(this._sizeChanged);
        }
        _sizeChanged() {
            this.event(Event.RESIZE);
        }
        static get root() {
            if (!Scene._root) {
                Scene._root = ILaya.stage.addChild(new Sprite());
                Scene._root.name = "root";
                ILaya.stage.on("resize", null, () => {
                    Scene._root.size(ILaya.stage.width, ILaya.stage.height);
                    Scene._root.event(Event.RESIZE);
                });
                Scene._root.size(ILaya.stage.width, ILaya.stage.height);
                Scene._root.event(Event.RESIZE);
            }
            return Scene._root;
        }
        get timer() {
            return this._timer || ILaya.timer;
        }
        set timer(value) {
            this._timer = value;
        }
        static load(url, complete = null, progress = null) {
            ILaya.loader.resetProgress();
            var loader = new SceneLoader();
            loader.on(Event.PROGRESS, null, onProgress);
            loader.once(Event.COMPLETE, null, create);
            loader.load(url);
            function onProgress(value) {
                if (Scene._loadPage)
                    Scene._loadPage.event("progress", value);
                progress && progress.runWith(value);
            }
            function create() {
                loader.off(Event.PROGRESS, null, onProgress);
                var obj = ILaya.Loader.getRes(url);
                if (!obj)
                    throw "Can not find scene:" + url;
                if (!obj.props)
                    throw "Scene data is error:" + url;
                var runtime = obj.props.runtime ? obj.props.runtime : obj.type;
                var clas = ILaya.ClassUtils.getClass(runtime);
                if (obj.props.renderType == "instance") {
                    var scene = clas.instance || (clas.instance = new clas());
                }
                else {
                    scene = new clas();
                }
                if (scene && scene instanceof Node) {
                    scene.url = url;
                    if (!scene._getBit(Const.NOT_READY)) {
                        complete && complete.runWith(scene);
                    }
                    else {
                        scene.on("onViewCreated", null, function () {
                            complete && complete.runWith(scene);
                        });
                        scene.createView(obj);
                    }
                    Scene.hideLoadingPage();
                }
                else {
                    throw "Can not find scene:" + runtime;
                }
            }
        }
        static open(url, closeOther = true, param = null, complete = null, progress = null) {
            if (param instanceof Handler) {
                var temp = complete;
                complete = param;
                param = temp;
            }
            Scene.showLoadingPage();
            Scene.load(url, Handler.create(null, this._onSceneLoaded, [closeOther, complete, param]), progress);
        }
        static _onSceneLoaded(closeOther, complete, param, scene) {
            scene.open(closeOther, param);
            if (complete)
                complete.runWith(scene);
        }
        static close(url, name = "") {
            var flag = false;
            var list = Scene.unDestroyedScenes;
            for (var i = 0, n = list.length; i < n; i++) {
                var scene = list[i];
                if (scene && scene.parent && scene.url === url && scene.name == name) {
                    scene.close();
                    flag = true;
                }
            }
            return flag;
        }
        static closeAll() {
            var root = Scene.root;
            for (var i = 0, n = root.numChildren; i < n; i++) {
                var scene = root.getChildAt(0);
                if (scene instanceof Scene)
                    scene.close();
                else
                    scene.removeSelf();
            }
        }
        static destroy(url, name = "") {
            var flag = false;
            var list = Scene.unDestroyedScenes;
            for (var i = 0, n = list.length; i < n; i++) {
                var scene = list[i];
                if (scene.url === url && scene.name == name) {
                    scene.destroy();
                    flag = true;
                }
            }
            return flag;
        }
        static gc() {
            Resource.destroyUnusedResources();
        }
        static setLoadingPage(loadPage) {
            if (Scene._loadPage != loadPage) {
                Scene._loadPage = loadPage;
            }
        }
        static showLoadingPage(param = null, delay = 500) {
            if (Scene._loadPage) {
                ILaya.systemTimer.clear(null, Scene._showLoading);
                ILaya.systemTimer.clear(null, Scene._hideLoading);
                ILaya.systemTimer.once(delay, null, Scene._showLoading, [param], false);
            }
        }
        static _showLoading(param) {
            ILaya.stage.addChild(Scene._loadPage);
            Scene._loadPage.onOpened(param);
        }
        static _hideLoading() {
            Scene._loadPage.close();
        }
        static hideLoadingPage(delay = 500) {
            if (Scene._loadPage) {
                ILaya.systemTimer.clear(null, Scene._showLoading);
                ILaya.systemTimer.clear(null, Scene._hideLoading);
                ILaya.systemTimer.once(delay, null, Scene._hideLoading);
            }
        }
    }
    Scene.unDestroyedScenes = [];
    ILaya.regClass(Scene);
    ClassUtils.regClass("laya.display.Scene", Scene);
    ClassUtils.regClass("Laya.Scene", Scene);

    class DrawCanvasCmd {
        constructor() {
            this._paramData = null;
        }
        static create(texture, x, y, width, height) {
            return null;
        }
        recover() {
            this._graphicsCmdEncoder = null;
            Pool.recover("DrawCanvasCmd", this);
        }
        get cmdID() {
            return DrawCanvasCmd.ID;
        }
    }
    DrawCanvasCmd.ID = "DrawCanvasCmd";
    DrawCanvasCmd._DRAW_IMAGE_CMD_ENCODER_ = null;
    DrawCanvasCmd._PARAM_TEXTURE_POS_ = 2;
    DrawCanvasCmd._PARAM_VB_POS_ = 5;

    class DrawParticleCmd {
        static create(_temp) {
            var cmd = Pool.getItemByClass("DrawParticleCmd", DrawParticleCmd);
            cmd._templ = _temp;
            return cmd;
        }
        recover() {
            this._templ = null;
            Pool.recover("DrawParticleCmd", this);
        }
        run(context, gx, gy) {
            context.drawParticle(gx, gy, this._templ);
        }
        get cmdID() {
            return DrawParticleCmd.ID;
        }
    }
    DrawParticleCmd.ID = "DrawParticleCmd";

    class FilterSetterBase {
        constructor() {
        }
        paramChanged() {
            Laya.systemTimer.callLater(this, this.buildFilter);
        }
        buildFilter() {
            if (this._target) {
                this.addFilter(this._target);
            }
        }
        addFilter(sprite) {
            if (!sprite)
                return;
            if (!sprite.filters) {
                sprite.filters = [this._filter];
            }
            else {
                var preFilters;
                preFilters = sprite.filters;
                if (preFilters.indexOf(this._filter) < 0) {
                    preFilters.push(this._filter);
                    sprite.filters = Utils.copyArray([], preFilters);
                }
            }
        }
        removeFilter(sprite) {
            if (!sprite)
                return;
            sprite.filters = null;
        }
        set target(value) {
            if (this._target != value) {
                this._target = value;
                this.paramChanged();
            }
        }
    }

    class BlurFilterGLRender {
        render(rt, ctx, width, height, filter) {
            var shaderValue = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
            this.setShaderInfo(shaderValue, filter, rt.width, rt.height);
            ctx.drawTarget(rt, 0, 0, width, height, Matrix.EMPTY.identity(), shaderValue);
        }
        setShaderInfo(shader, filter, w, h) {
            shader.defines.add(Filter.BLUR);
            var sv = shader;
            BlurFilterGLRender.blurinfo[0] = w;
            BlurFilterGLRender.blurinfo[1] = h;
            sv.blurInfo = BlurFilterGLRender.blurinfo;
            var sigma = filter.strength / 3.0;
            var sigma2 = sigma * sigma;
            filter.strength_sig2_2sig2_gauss1[0] = filter.strength;
            filter.strength_sig2_2sig2_gauss1[1] = sigma2;
            filter.strength_sig2_2sig2_gauss1[2] = 2.0 * sigma2;
            filter.strength_sig2_2sig2_gauss1[3] = 1.0 / (2.0 * Math.PI * sigma2);
            sv.strength_sig2_2sig2_gauss1 = filter.strength_sig2_2sig2_gauss1;
        }
    }
    BlurFilterGLRender.blurinfo = new Array(2);

    class BlurFilter extends Filter {
        constructor(strength = 4) {
            super();
            this.strength_sig2_2sig2_gauss1 = [];
            this.strength = strength;
            this._glRender = new BlurFilterGLRender();
        }
        get type() {
            return Filter.BLUR;
        }
        getStrenth_sig2_2sig2_native() {
            if (!this.strength_sig2_native) {
                this.strength_sig2_native = new Float32Array(4);
            }
            var sigma = this.strength / 3.0;
            var sigma2 = sigma * sigma;
            this.strength_sig2_native[0] = this.strength;
            this.strength_sig2_native[1] = sigma2;
            this.strength_sig2_native[2] = 2.0 * sigma2;
            this.strength_sig2_native[3] = 1.0 / (2.0 * Math.PI * sigma2);
            return this.strength_sig2_native;
        }
    }

    class BlurFilterSetter extends FilterSetterBase {
        constructor() {
            super();
            this._strength = 4;
            this._filter = new BlurFilter(this.strength);
        }
        buildFilter() {
            this._filter = new BlurFilter(this.strength);
            super.buildFilter();
        }
        get strength() {
            return this._strength;
        }
        set strength(value) {
            this._strength = value;
        }
    }

    class ButtonEffect {
        constructor() {
            this._curState = 0;
            this.effectScale = 1.5;
            this.tweenTime = 300;
        }
        set target(tar) {
            this._tar = tar;
            tar.on(Event.MOUSE_DOWN, this, this.toChangedState);
            tar.on(Event.MOUSE_UP, this, this.toInitState);
            tar.on(Event.MOUSE_OUT, this, this.toInitState);
        }
        toChangedState() {
            this._curState = 1;
            if (this._curTween)
                Tween.clear(this._curTween);
            this._curTween = Tween.to(this._tar, { scaleX: this.effectScale, scaleY: this.effectScale }, this.tweenTime, Ease[this.effectEase], Handler.create(this, this.tweenComplete));
        }
        toInitState() {
            if (this._curState == 2)
                return;
            if (this._curTween)
                Tween.clear(this._curTween);
            this._curState = 2;
            this._curTween = Tween.to(this._tar, { scaleX: 1, scaleY: 1 }, this.tweenTime, Ease[this.backEase], Handler.create(this, this.tweenComplete));
        }
        tweenComplete() {
            this._curState = 0;
            this._curTween = null;
        }
    }

    class ColorFilterSetter extends FilterSetterBase {
        constructor() {
            super();
            this._brightness = 0;
            this._contrast = 0;
            this._saturation = 0;
            this._hue = 0;
            this._red = 0;
            this._green = 0;
            this._blue = 0;
            this._alpha = 0;
            this._filter = new ColorFilter();
        }
        buildFilter() {
            this._filter.reset();
            this._filter.color(this.red, this.green, this.blue, this.alpha);
            this._filter.adjustHue(this.hue);
            this._filter.adjustContrast(this.contrast);
            this._filter.adjustBrightness(this.brightness);
            this._filter.adjustSaturation(this.saturation);
            super.buildFilter();
        }
        get brightness() {
            return this._brightness;
        }
        set brightness(value) {
            this._brightness = value;
            this.paramChanged();
        }
        get contrast() {
            return this._contrast;
        }
        set contrast(value) {
            this._contrast = value;
            this.paramChanged();
        }
        get saturation() {
            return this._saturation;
        }
        set saturation(value) {
            this._saturation = value;
            this.paramChanged();
        }
        get hue() {
            return this._hue;
        }
        set hue(value) {
            this._hue = value;
            this.paramChanged();
        }
        get red() {
            return this._red;
        }
        set red(value) {
            this._red = value;
            this.paramChanged();
        }
        get green() {
            return this._green;
        }
        set green(value) {
            this._green = value;
            this.paramChanged();
        }
        get blue() {
            return this._blue;
        }
        set blue(value) {
            this._blue = value;
            this.paramChanged();
        }
        get color() {
            return this._color;
        }
        set color(value) {
            this._color = value;
            var colorO;
            colorO = ColorUtils.create(value);
            this._red = colorO.arrColor[0] * 255;
            this._green = colorO.arrColor[1] * 255;
            this._blue = colorO.arrColor[2] * 255;
            this.paramChanged();
        }
        get alpha() {
            return this._alpha;
        }
        set alpha(value) {
            this._alpha = value;
            this.paramChanged();
        }
    }

    class EffectBase extends Component {
        constructor() {
            super(...arguments);
            this.duration = 1000;
            this.delay = 0;
            this.repeat = 0;
            this.autoDestroyAtComplete = true;
        }
        _onAwake() {
            this.target = this.target || this.owner;
            if (this.autoDestroyAtComplete)
                this._comlete = Handler.create(this.target, this.target.destroy, null, false);
            if (this.eventName)
                this.owner.on(this.eventName, this, this._exeTween);
            else
                this._exeTween();
        }
        _exeTween() {
            this._tween = this._doTween();
            this._tween.repeat = this.repeat;
        }
        _doTween() {
            return null;
        }
        onReset() {
            this.duration = 1000;
            this.delay = 0;
            this.repeat = 0;
            this.ease = null;
            this.target = null;
            if (this.eventName) {
                this.owner.off(this.eventName, this, this._exeTween);
                this.eventName = null;
            }
            if (this._comlete) {
                this._comlete.recover();
                this._comlete = null;
            }
            if (this._tween) {
                this._tween.clear();
                this._tween = null;
            }
        }
    }

    class FadeIn extends EffectBase {
        _doTween() {
            this.target.alpha = 0;
            return Tween.to(this.target, { alpha: 1 }, this.duration, Ease[this.ease], this._comlete, this.delay);
        }
    }

    class FadeOut extends EffectBase {
        _doTween() {
            this.target.alpha = 1;
            return Tween.to(this.target, { alpha: 0 }, this.duration, Ease[this.ease], this._comlete, this.delay);
        }
    }

    class GlowFilterGLRender {
        setShaderInfo(shader, w, h, data) {
            shader.defines.add(data.type);
            var sv = shader;
            sv.u_blurInfo1 = data._sv_blurInfo1;
            var info2 = data._sv_blurInfo2;
            info2[0] = w;
            info2[1] = h;
            sv.u_blurInfo2 = info2;
            sv.u_color = data.getColor();
        }
        render(rt, ctx, width, height, filter) {
            var w = width, h = height;
            var svBlur = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
            this.setShaderInfo(svBlur, w, h, filter);
            var svCP = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
            var matI = Matrix.TEMP.identity();
            ctx.drawTarget(rt, 0, 0, w, h, matI, svBlur);
            ctx.drawTarget(rt, 0, 0, w, h, matI, svCP);
        }
    }

    class GlowFilter extends Filter {
        constructor(color, blur = 4, offX = 6, offY = 6) {
            super();
            this._elements = new Float32Array(9);
            this._sv_blurInfo1 = new Array(4);
            this._sv_blurInfo2 = [0, 0, 1, 0];
            this._color = new ColorUtils(color);
            this.blur = Math.min(blur, 20);
            this.offX = offX;
            this.offY = offY;
            this._sv_blurInfo1[0] = this._sv_blurInfo1[1] = this.blur;
            this._sv_blurInfo1[2] = offX;
            this._sv_blurInfo1[3] = -offY;
            this._glRender = new GlowFilterGLRender();
        }
        get type() {
            return BlurFilter.GLOW;
        }
        get offY() {
            return this._elements[6];
        }
        set offY(value) {
            this._elements[6] = value;
            this._sv_blurInfo1[3] = -value;
        }
        get offX() {
            return this._elements[5];
        }
        set offX(value) {
            this._elements[5] = value;
            this._sv_blurInfo1[2] = value;
        }
        getColor() {
            return this._color.arrColor;
        }
        get blur() {
            return this._elements[4];
        }
        set blur(value) {
            this._elements[4] = value;
            this._sv_blurInfo1[0] = this._sv_blurInfo1[1] = value;
        }
        getColorNative() {
            if (!this._color_native) {
                this._color_native = new Float32Array(4);
            }
            var color = this.getColor();
            this._color_native[0] = color[0];
            this._color_native[1] = color[1];
            this._color_native[2] = color[2];
            this._color_native[3] = color[3];
            return this._color_native;
        }
        getBlurInfo1Native() {
            if (!this._blurInof1_native) {
                this._blurInof1_native = new Float32Array(4);
            }
            this._blurInof1_native[0] = this._blurInof1_native[1] = this.blur;
            this._blurInof1_native[2] = this.offX;
            this._blurInof1_native[3] = this.offY;
            return this._blurInof1_native;
        }
        getBlurInfo2Native() {
            if (!this._blurInof2_native) {
                this._blurInof2_native = new Float32Array(4);
            }
            this._blurInof2_native[2] = 1;
            return this._blurInof2_native;
        }
    }

    class GlowFilterSetter extends FilterSetterBase {
        constructor() {
            super();
            this._color = "#ff0000";
            this._blur = 4;
            this._offX = 6;
            this._offY = 6;
            this._filter = new GlowFilter(this._color);
        }
        buildFilter() {
            this._filter = new GlowFilter(this.color, this.blur, this.offX, this.offY);
            super.buildFilter();
        }
        get color() {
            return this._color;
        }
        set color(value) {
            this._color = value;
            this.paramChanged();
        }
        get blur() {
            return this._blur;
        }
        set blur(value) {
            this._blur = value;
            this.paramChanged();
        }
        get offX() {
            return this._offX;
        }
        set offX(value) {
            this._offX = value;
            this.paramChanged();
        }
        get offY() {
            return this._offY;
        }
        set offY(value) {
            this._offY = value;
            this.paramChanged();
        }
    }

    class KeyLocation {
    }
    KeyLocation.STANDARD = 0;
    KeyLocation.LEFT = 1;
    KeyLocation.RIGHT = 2;
    KeyLocation.NUM_PAD = 3;

    class Keyboard {
    }
    Keyboard.NUMBER_0 = 48;
    Keyboard.NUMBER_1 = 49;
    Keyboard.NUMBER_2 = 50;
    Keyboard.NUMBER_3 = 51;
    Keyboard.NUMBER_4 = 52;
    Keyboard.NUMBER_5 = 53;
    Keyboard.NUMBER_6 = 54;
    Keyboard.NUMBER_7 = 55;
    Keyboard.NUMBER_8 = 56;
    Keyboard.NUMBER_9 = 57;
    Keyboard.A = 65;
    Keyboard.B = 66;
    Keyboard.C = 67;
    Keyboard.D = 68;
    Keyboard.E = 69;
    Keyboard.F = 70;
    Keyboard.G = 71;
    Keyboard.H = 72;
    Keyboard.I = 73;
    Keyboard.J = 74;
    Keyboard.K = 75;
    Keyboard.L = 76;
    Keyboard.M = 77;
    Keyboard.N = 78;
    Keyboard.O = 79;
    Keyboard.P = 80;
    Keyboard.Q = 81;
    Keyboard.R = 82;
    Keyboard.S = 83;
    Keyboard.T = 84;
    Keyboard.U = 85;
    Keyboard.V = 86;
    Keyboard.W = 87;
    Keyboard.X = 88;
    Keyboard.Y = 89;
    Keyboard.Z = 90;
    Keyboard.F1 = 112;
    Keyboard.F2 = 113;
    Keyboard.F3 = 114;
    Keyboard.F4 = 115;
    Keyboard.F5 = 116;
    Keyboard.F6 = 117;
    Keyboard.F7 = 118;
    Keyboard.F8 = 119;
    Keyboard.F9 = 120;
    Keyboard.F10 = 121;
    Keyboard.F11 = 122;
    Keyboard.F12 = 123;
    Keyboard.F13 = 124;
    Keyboard.F14 = 125;
    Keyboard.F15 = 126;
    Keyboard.NUMPAD = 21;
    Keyboard.NUMPAD_0 = 96;
    Keyboard.NUMPAD_1 = 97;
    Keyboard.NUMPAD_2 = 98;
    Keyboard.NUMPAD_3 = 99;
    Keyboard.NUMPAD_4 = 100;
    Keyboard.NUMPAD_5 = 101;
    Keyboard.NUMPAD_6 = 102;
    Keyboard.NUMPAD_7 = 103;
    Keyboard.NUMPAD_8 = 104;
    Keyboard.NUMPAD_9 = 105;
    Keyboard.NUMPAD_ADD = 107;
    Keyboard.NUMPAD_DECIMAL = 110;
    Keyboard.NUMPAD_DIVIDE = 111;
    Keyboard.NUMPAD_ENTER = 108;
    Keyboard.NUMPAD_MULTIPLY = 106;
    Keyboard.NUMPAD_SUBTRACT = 109;
    Keyboard.SEMICOLON = 186;
    Keyboard.EQUAL = 187;
    Keyboard.COMMA = 188;
    Keyboard.MINUS = 189;
    Keyboard.PERIOD = 190;
    Keyboard.SLASH = 191;
    Keyboard.BACKQUOTE = 192;
    Keyboard.LEFTBRACKET = 219;
    Keyboard.BACKSLASH = 220;
    Keyboard.RIGHTBRACKET = 221;
    Keyboard.QUOTE = 222;
    Keyboard.ALTERNATE = 18;
    Keyboard.BACKSPACE = 8;
    Keyboard.CAPS_LOCK = 20;
    Keyboard.COMMAND = 15;
    Keyboard.CONTROL = 17;
    Keyboard.DELETE = 46;
    Keyboard.ENTER = 13;
    Keyboard.ESCAPE = 27;
    Keyboard.PAGE_UP = 33;
    Keyboard.PAGE_DOWN = 34;
    Keyboard.END = 35;
    Keyboard.HOME = 36;
    Keyboard.LEFT = 37;
    Keyboard.UP = 38;
    Keyboard.RIGHT = 39;
    Keyboard.DOWN = 40;
    Keyboard.SHIFT = 16;
    Keyboard.SPACE = 32;
    Keyboard.TAB = 9;
    Keyboard.INSERT = 45;

    class CommandEncoder {
        constructor(layagl, reserveSize, adjustSize, isSyncToRenderThread) {
            this._idata = [];
        }
        getArrayData() {
            return this._idata;
        }
        getPtrID() {
            return 0;
        }
        beginEncoding() {
        }
        endEncoding() {
        }
        clearEncoding() {
            this._idata.length = 0;
        }
        getCount() {
            return this._idata.length;
        }
        add_ShaderValue(o) {
            this._idata.push(o);
        }
        addShaderUniform(one) {
            this.add_ShaderValue(one);
        }
    }

    class LayaGLRunner {
        static uploadShaderUniforms(layaGL, commandEncoder, shaderData, uploadUnTexture) {
            var data = shaderData._data;
            var shaderUniform = commandEncoder.getArrayData();
            var shaderCall = 0;
            for (var i = 0, n = shaderUniform.length; i < n; i++) {
                var one = shaderUniform[i];
                if (uploadUnTexture || one.textureID !== -1) {
                    var value = data[one.dataOffset];
                    if (value != null)
                        shaderCall += one.fun.call(one.caller, one, value);
                }
            }
            return shaderCall;
        }
        static uploadCustomUniform(layaGL, custom, index, data) {
            var shaderCall = 0;
            var one = custom[index];
            if (one && data != null)
                shaderCall += one.fun.call(one.caller, one, data);
            return shaderCall;
        }
        static uploadShaderUniformsForNative(layaGL, commandEncoder, shaderData) {
            return LayaGL.instance.uploadShaderUniforms(commandEncoder, shaderData._data, shaderData._runtimeCopyValues.length > 0 ? LayaGL.UPLOAD_SHADER_UNIFORM_TYPE_DATA : LayaGL.UPLOAD_SHADER_UNIFORM_TYPE_ID);
        }
    }

    class QuickTestTool {
        constructor() {
        }
        static getMCDName(type) {
            return QuickTestTool._typeToNameDic[type];
        }
        static showRenderTypeInfo(type, force = false) {
            if (!force && QuickTestTool.showedDic[type])
                return;
            QuickTestTool.showedDic[type] = true;
            if (!QuickTestTool._rendertypeToStrDic[type]) {
                var arr = [];
                var tType;
                tType = 1;
                while (tType <= type) {
                    if (tType & type) {
                        arr.push(QuickTestTool.getMCDName(tType & type));
                    }
                    tType = tType << 1;
                }
                QuickTestTool._rendertypeToStrDic[type] = arr.join(",");
            }
            console.log("cmd:", QuickTestTool._rendertypeToStrDic[type]);
        }
        static __init__() {
            QuickTestTool._typeToNameDic[SpriteConst.ALPHA] = "ALPHA";
            QuickTestTool._typeToNameDic[SpriteConst.TRANSFORM] = "TRANSFORM";
            QuickTestTool._typeToNameDic[SpriteConst.TEXTURE] = "TEXTURE";
            QuickTestTool._typeToNameDic[SpriteConst.GRAPHICS] = "GRAPHICS";
            QuickTestTool._typeToNameDic[SpriteConst.ONECHILD] = "ONECHILD";
            QuickTestTool._typeToNameDic[SpriteConst.CHILDS] = "CHILDS";
            QuickTestTool._typeToNameDic[SpriteConst.TRANSFORM | SpriteConst.ALPHA] = "TRANSFORM|ALPHA";
            QuickTestTool._typeToNameDic[SpriteConst.CANVAS] = "CANVAS";
            QuickTestTool._typeToNameDic[SpriteConst.BLEND] = "BLEND";
            QuickTestTool._typeToNameDic[SpriteConst.FILTERS] = "FILTERS";
            QuickTestTool._typeToNameDic[SpriteConst.MASK] = "MASK";
            QuickTestTool._typeToNameDic[SpriteConst.CLIP] = "CLIP";
            QuickTestTool._typeToNameDic[SpriteConst.LAYAGL3D] = "LAYAGL3D";
        }
        render(context, x, y) {
            QuickTestTool._addType(this._renderType);
            QuickTestTool.showRenderTypeInfo(this._renderType);
            RenderSprite.renders[this._renderType]._fun(this, context, x + this._x, y + this._y);
            this._repaint = 0;
        }
        _stageRender(context, x, y) {
            QuickTestTool._countStart();
            QuickTestTool._PreStageRender.call(ILaya.stage, context, x, y);
            QuickTestTool._countEnd();
        }
        static _countStart() {
            var key;
            for (key in QuickTestTool._countDic) {
                QuickTestTool._countDic[key] = 0;
            }
        }
        static _countEnd() {
            QuickTestTool._i++;
            if (QuickTestTool._i > 60) {
                QuickTestTool.showCountInfo();
                QuickTestTool._i = 0;
            }
        }
        static _addType(type) {
            if (!QuickTestTool._countDic[type]) {
                QuickTestTool._countDic[type] = 1;
            }
            else {
                QuickTestTool._countDic[type] += 1;
            }
        }
        static showCountInfo() {
            console.log("===================");
            var key;
            for (key in QuickTestTool._countDic) {
                console.log("count:" + QuickTestTool._countDic[key]);
                QuickTestTool.showRenderTypeInfo(key, true);
            }
        }
        static enableQuickTest() {
            QuickTestTool.__init__();
            Sprite["prototype"]["render"] = QuickTestTool["prototype"]["render"];
            QuickTestTool._PreStageRender = Stage["prototype"]["render"];
            Stage["prototype"]["render"] = QuickTestTool["prototype"]["_stageRender"];
        }
    }
    QuickTestTool.showedDic = {};
    QuickTestTool._rendertypeToStrDic = {};
    QuickTestTool._typeToNameDic = {};
    QuickTestTool._countDic = {};
    QuickTestTool._i = 0;

    class Sound extends EventDispatcher {
        load(url) {
        }
        play(startTime = 0, loops = 0) {
            return null;
        }
        get duration() {
            return 0;
        }
        dispose() {
        }
    }

    class SoundNode extends Sprite {
        constructor() {
            super();
            this.visible = false;
            this.on(Event.ADDED, this, this._onParentChange);
            this.on(Event.REMOVED, this, this._onParentChange);
        }
        _onParentChange() {
            this.target = this.parent;
        }
        play(loops = 1, complete = null) {
            if (isNaN(loops)) {
                loops = 1;
            }
            if (!this.url)
                return;
            this.stop();
            this._channel = SoundManager.playSound(this.url, loops, complete);
        }
        stop() {
            if (this._channel && !this._channel.isStopped) {
                this._channel.stop();
            }
            this._channel = null;
        }
        _setPlayAction(tar, event, action, add = true) {
            if (!this[action])
                return;
            if (!tar)
                return;
            if (add) {
                tar.on(event, this, this[action]);
            }
            else {
                tar.off(event, this, this[action]);
            }
        }
        _setPlayActions(tar, events, action, add = true) {
            if (!tar)
                return;
            if (!events)
                return;
            var eventArr = events.split(",");
            var i, len;
            len = eventArr.length;
            for (i = 0; i < len; i++) {
                this._setPlayAction(tar, eventArr[i], action, add);
            }
        }
        set playEvent(events) {
            this._playEvents = events;
            if (!events)
                return;
            if (this._tar) {
                this._setPlayActions(this._tar, events, "play");
            }
        }
        set target(tar) {
            if (this._tar) {
                this._setPlayActions(this._tar, this._playEvents, "play", false);
                this._setPlayActions(this._tar, this._stopEvents, "stop", false);
            }
            this._tar = tar;
            if (this._tar) {
                this._setPlayActions(this._tar, this._playEvents, "play", true);
                this._setPlayActions(this._tar, this._stopEvents, "stop", true);
            }
        }
        set stopEvent(events) {
            this._stopEvents = events;
            if (!events)
                return;
            if (this._tar) {
                this._setPlayActions(this._tar, events, "stop");
            }
        }
    }

    class ResourceVersion {
        static enable(manifestFile, callback, type = 2) {
            ResourceVersion.type = type;
            ILaya.loader.load(manifestFile, Handler.create(null, ResourceVersion.onManifestLoaded, [callback]), null, Loader.JSON);
        }
        static onManifestLoaded(callback, data) {
            ResourceVersion.manifest = data;
            URL.customFormat = ResourceVersion.addVersionPrefix;
            callback.run();
            if (!data) {
                console.warn("资源版本清单文件不存在，不使用资源版本管理。忽略ERR_FILE_NOT_FOUND错误。");
            }
        }
        static addVersionPrefix(originURL) {
            originURL = URL.getAdptedFilePath(originURL);
            if (ResourceVersion.manifest && ResourceVersion.manifest[originURL]) {
                if (ResourceVersion.type == ResourceVersion.FILENAME_VERSION)
                    return ResourceVersion.manifest[originURL];
                return ResourceVersion.manifest[originURL] + "/" + originURL;
            }
            return originURL;
        }
    }
    ResourceVersion.FOLDER_VERSION = 1;
    ResourceVersion.FILENAME_VERSION = 2;
    ResourceVersion.type = ResourceVersion.FOLDER_VERSION;

    class Socket extends EventDispatcher {
        constructor(host = null, port = 0, byteClass = null, protocols = null) {
            super();
            this.disableInput = false;
            this.protocols = [];
            this._byteClass = byteClass ? byteClass : Byte;
            this.protocols = protocols;
            this.endian = Socket.BIG_ENDIAN;
            if (host && port > 0 && port < 65535)
                this.connect(host, port);
        }
        get input() {
            return this._input;
        }
        get output() {
            return this._output;
        }
        get connected() {
            return this._connected;
        }
        get endian() {
            return this._endian;
        }
        set endian(value) {
            this._endian = value;
            if (this._input != null)
                this._input.endian = value;
            if (this._output != null)
                this._output.endian = value;
        }
        connect(host, port) {
            var url = "ws://" + host + ":" + port;
            this.connectByUrl(url);
        }
        connectByUrl(url) {
            if (this._socket != null)
                this.close();
            this._socket && this.cleanSocket();
            if (!this.protocols || this.protocols.length == 0) {
                this._socket = new Browser.window.WebSocket(url);
            }
            else {
                this._socket = new Browser.window.WebSocket(url, this.protocols);
            }
            this._socket.binaryType = "arraybuffer";
            this._output = new this._byteClass();
            this._output.endian = this.endian;
            this._input = new this._byteClass();
            this._input.endian = this.endian;
            this._addInputPosition = 0;
            this._socket.onopen = (e) => {
                this._onOpen(e);
            };
            this._socket.onmessage = (msg) => {
                this._onMessage(msg);
            };
            this._socket.onclose = (e) => {
                this._onClose(e);
            };
            this._socket.onerror = (e) => {
                this._onError(e);
            };
        }
        cleanSocket() {
            this.close();
            this._connected = false;
            this._socket.onopen = null;
            this._socket.onmessage = null;
            this._socket.onclose = null;
            this._socket.onerror = null;
            this._socket = null;
        }
        close() {
            if (this._socket != null) {
                try {
                    this._socket.close();
                }
                catch (e) {
                }
            }
        }
        _onOpen(e) {
            this._connected = true;
            this.event(Event.OPEN, e);
        }
        _onMessage(msg) {
            if (!msg || !msg.data)
                return;
            var data = msg.data;
            if (this.disableInput && data) {
                this.event(Event.MESSAGE, data);
                return;
            }
            if (this._input.length > 0 && this._input.bytesAvailable < 1) {
                this._input.clear();
                this._addInputPosition = 0;
            }
            var pre = this._input.pos;
            !this._addInputPosition && (this._addInputPosition = 0);
            this._input.pos = this._addInputPosition;
            if (data) {
                if (typeof (data) == 'string') {
                    this._input.writeUTFBytes(data);
                }
                else {
                    this._input.writeArrayBuffer(data);
                }
                this._addInputPosition = this._input.pos;
                this._input.pos = pre;
            }
            this.event(Event.MESSAGE, data);
        }
        _onClose(e) {
            this._connected = false;
            this.event(Event.CLOSE, e);
        }
        _onError(e) {
            this.event(Event.ERROR, e);
        }
        send(data) {
            this._socket.send(data);
        }
        flush() {
            if (this._output && this._output.length > 0) {
                var evt;
                try {
                    this._socket && this._socket.send(this._output.__getBuffer().slice(0, this._output.length));
                }
                catch (e) {
                    evt = e;
                }
                this._output.endian = this.endian;
                this._output.clear();
                if (evt)
                    this.event(Event.ERROR, evt);
            }
        }
    }
    Socket.LITTLE_ENDIAN = "littleEndian";
    Socket.BIG_ENDIAN = "bigEndian";

    class System {
        static changeDefinition(name, classObj) {
            window.Laya[name] = classObj;
            var str = name + "=classObj";
            window['eval'](str);
        }
    }

    class HTMLChar {
        constructor() {
            this.reset();
        }
        setData(char, w, h, style) {
            this.char = char;
            this.charNum = char.charCodeAt(0);
            this.x = this.y = 0;
            this.width = w;
            this.height = h;
            this.style = style;
            this.isWord = !HTMLChar._isWordRegExp.test(char);
            return this;
        }
        reset() {
            this.x = this.y = this.width = this.height = 0;
            this.isWord = false;
            this.char = null;
            this.charNum = 0;
            this.style = null;
            return this;
        }
        recover() {
            Pool.recover("HTMLChar", this.reset());
        }
        static create() {
            return Pool.getItemByClass("HTMLChar", HTMLChar);
        }
        _isChar() {
            return true;
        }
        _getCSSStyle() {
            return this.style;
        }
    }
    HTMLChar._isWordRegExp = new RegExp("[\\w\.]", "");

    class Log {
        static enable() {
            if (!Log._logdiv) {
                Log._logdiv = Browser.createElement('div');
                Log._logdiv.style.cssText = "border:white;padding:4px;overflow-y:auto;z-index:1000000;background:rgba(100,100,100,0.6);color:white;position: absolute;left:0px;top:0px;width:50%;height:50%;";
                Browser.document.body.appendChild(Log._logdiv);
                Log._btn = Browser.createElement("button");
                Log._btn.innerText = "Hide";
                Log._btn.style.cssText = "z-index:1000001;position: absolute;left:10px;top:10px;";
                Log._btn.onclick = Log.toggle;
                Browser.document.body.appendChild(Log._btn);
            }
        }
        static toggle() {
            var style = Log._logdiv.style;
            if (style.display === "") {
                Log._btn.innerText = "Show";
                style.display = "none";
            }
            else {
                Log._btn.innerText = "Hide";
                style.display = "";
            }
        }
        static print(value) {
            if (Log._logdiv) {
                if (Log._count >= Log.maxCount)
                    Log.clear();
                Log._count++;
                Log._logdiv.innerText += value + "\n";
                if (Log.autoScrollToBottom) {
                    if (Log._logdiv.scrollHeight - Log._logdiv.scrollTop - Log._logdiv.clientHeight < 50) {
                        Log._logdiv.scrollTop = Log._logdiv.scrollHeight;
                    }
                }
            }
        }
        static clear() {
            Log._logdiv.innerText = "";
            Log._count = 0;
        }
    }
    Log._count = 0;
    Log.maxCount = 50;
    Log.autoScrollToBottom = true;

    let DATANUM = 300;
    class PerfData {
        constructor(id, color, name, scale) {
            this.scale = 1.0;
            this.datas = new Array(DATANUM);
            this.datapos = 0;
            this.id = id;
            this.color = color;
            this.name = name;
            this.scale = scale;
        }
        addData(v) {
            this.datas[this.datapos] = v;
            this.datapos++;
            this.datapos %= DATANUM;
        }
    }

    class PerfHUD extends Sprite {
        constructor() {
            super();
            this.datas = [];
            this.xdata = new Array(PerfHUD.DATANUM);
            this.ydata = new Array(PerfHUD.DATANUM);
            this.hud_width = 800;
            this.hud_height = 200;
            this.gMinV = 0;
            this.gMaxV = 100;
            this.textSpace = 40;
            this.sttm = 0;
            PerfHUD.inst = this;
            this._renderType |= SpriteConst.CUSTOM;
            this._setRenderType(this._renderType);
            this._setCustomRender();
            this.addDataDef(0, 0xffffff, 'frame', 1.0);
            this.addDataDef(1, 0x00ff00, 'update', 1.0);
            this.addDataDef(2, 0xff0000, 'flush', 1.0);
            PerfHUD._now = performance ? performance.now.bind(performance) : Date.now;
        }
        now() {
            return PerfHUD._now();
        }
        start() {
            this.sttm = PerfHUD._now();
        }
        end(i) {
            var dt = PerfHUD._now() - this.sttm;
            this.updateValue(i, dt);
        }
        config(w, h) {
            this.hud_width = w;
            this.hud_height = h;
        }
        addDataDef(id, color, name, scale) {
            this.datas[id] = new PerfData(id, color, name, scale);
        }
        updateValue(id, v) {
            this.datas[id].addData(v);
        }
        v2y(v) {
            var bb = this._y + this.hud_height * (1 - (v - this.gMinV) / this.gMaxV);
            return this._y + this.hud_height * (1 - (v - this.gMinV) / this.gMaxV);
        }
        drawHLine(ctx, v, color, text) {
            var sx = this._x;
            var ex = this._x + this.hud_width;
            var sy = this.v2y(v);
            ctx.fillText(text, sx, sy - 6, null, 'green', null);
            sx += this.textSpace;
            ctx.fillStyle = color;
            ctx.fillRect(sx, sy, this._x + this.hud_width, 1, null);
        }
        customRender(ctx, x, y) {
            var now = performance.now();
            if (PerfHUD._lastTm <= 0)
                PerfHUD._lastTm = now;
            this.updateValue(0, now - PerfHUD._lastTm);
            PerfHUD._lastTm = now;
            ctx.save();
            ctx.fillRect(this._x, this._y, this.hud_width, this.hud_height + 4, '#000000cc');
            ctx.globalAlpha = 0.9;
            this.drawHLine(ctx, 0, 'green', '    0');
            this.drawHLine(ctx, 10, 'green', '  10');
            this.drawHLine(ctx, 16.667, 'red', ' ');
            this.drawHLine(ctx, 20, 'green', '50|20');
            this.drawHLine(ctx, 16.667 * 2, 'yellow', '');
            this.drawHLine(ctx, 16.667 * 3, 'yellow', '');
            this.drawHLine(ctx, 16.667 * 4, 'yellow', '');
            this.drawHLine(ctx, 50, 'green', '20|50');
            this.drawHLine(ctx, 100, 'green', '10|100');
            for (var di = 0, sz = this.datas.length; di < sz; di++) {
                var cd = this.datas[di];
                if (!cd)
                    continue;
                var dtlen = cd.datas.length;
                var dx = (this.hud_width - this.textSpace) / dtlen;
                var cx = cd.datapos;
                var _cx = this._x + this.textSpace;
                ctx.fillStyle = cd.color;
                for (var dtsz = dtlen; cx < dtsz; cx++) {
                    var sty = this.v2y(cd.datas[cx] * cd.scale);
                    ctx.fillRect(_cx, sty, dx, this.hud_height + this._y - sty, null);
                    _cx += dx;
                }
                for (cx = 0; cx < cd.datapos; cx++) {
                    sty = this.v2y(cd.datas[cx] * cd.scale);
                    ctx.fillRect(_cx, sty, dx, this.hud_height + this._y - sty, null);
                    _cx += dx;
                }
            }
            ctx.restore();
        }
    }
    PerfHUD._lastTm = 0;
    PerfHUD._now = null;
    PerfHUD.DATANUM = 300;
    PerfHUD.drawTexTm = 0;

    class PoolCache {
        constructor() {
            this.maxCount = 1000;
        }
        getCacheList() {
            return Pool.getPoolBySign(this.sign);
        }
        tryDispose(force) {
            var list;
            list = Pool.getPoolBySign(this.sign);
            if (list.length > this.maxCount) {
                list.splice(this.maxCount, list.length - this.maxCount);
            }
        }
        static addPoolCacheManager(sign, maxCount = 100) {
            var cache;
            cache = new PoolCache();
            cache.sign = sign;
            cache.maxCount = maxCount;
            CacheManger.regCacheByFunction(Utils.bind(cache.tryDispose, cache), Utils.bind(cache.getCacheList, cache));
        }
    }

    class TimeLine extends EventDispatcher {
        constructor() {
            super(...arguments);
            this._tweenDic = {};
            this._tweenDataList = [];
            this._currTime = 0;
            this._lastTime = 0;
            this._startTime = 0;
            this._index = 0;
            this._gidIndex = 0;
            this._firstTweenDic = {};
            this._startTimeSort = false;
            this._endTimeSort = false;
            this._loopKey = false;
            this.scale = 1;
            this._frameRate = 60;
            this._frameIndex = 0;
            this._total = 0;
        }
        static to(target, props, duration, ease = null, offset = 0) {
            return (new TimeLine()).to(target, props, duration, ease, offset);
        }
        static from(target, props, duration, ease = null, offset = 0) {
            return (new TimeLine()).from(target, props, duration, ease, offset);
        }
        to(target, props, duration, ease = null, offset = 0) {
            return this._create(target, props, duration, ease, offset, true);
        }
        from(target, props, duration, ease = null, offset = 0) {
            return this._create(target, props, duration, ease, offset, false);
        }
        _create(target, props, duration, ease, offset, isTo) {
            var tTweenData = Pool.getItemByClass("tweenData", tweenData);
            tTweenData.isTo = isTo;
            tTweenData.type = 0;
            tTweenData.target = target;
            tTweenData.duration = duration;
            tTweenData.data = props;
            tTweenData.startTime = this._startTime + offset;
            tTweenData.endTime = tTweenData.startTime + tTweenData.duration;
            tTweenData.ease = ease;
            this._startTime = Math.max(tTweenData.endTime, this._startTime);
            this._tweenDataList.push(tTweenData);
            this._startTimeSort = true;
            this._endTimeSort = true;
            return this;
        }
        addLabel(label, offset) {
            var tTweenData = Pool.getItemByClass("tweenData", tweenData);
            tTweenData.type = 1;
            tTweenData.data = label;
            tTweenData.endTime = tTweenData.startTime = this._startTime + offset;
            this._labelDic || (this._labelDic = {});
            this._labelDic[label] = tTweenData;
            this._tweenDataList.push(tTweenData);
            return this;
        }
        removeLabel(label) {
            if (this._labelDic && this._labelDic[label]) {
                var tTweenData = this._labelDic[label];
                if (tTweenData) {
                    var tIndex = this._tweenDataList.indexOf(tTweenData);
                    if (tIndex > -1) {
                        this._tweenDataList.splice(tIndex, 1);
                    }
                }
                delete this._labelDic[label];
            }
        }
        gotoTime(time) {
            if (this._tweenDataList == null || this._tweenDataList.length == 0)
                return;
            var tTween;
            var tObject;
            for (var p in this._firstTweenDic) {
                tObject = this._firstTweenDic[p];
                if (tObject) {
                    for (var tDataP in tObject) {
                        if (tDataP in tObject.diyTarget) {
                            tObject.diyTarget[tDataP] = tObject[tDataP];
                        }
                    }
                }
            }
            for (p in this._tweenDic) {
                tTween = this._tweenDic[p];
                tTween.clear();
                delete this._tweenDic[p];
            }
            this._index = 0;
            this._gidIndex = 0;
            this._currTime = time;
            this._lastTime = Browser.now();
            var tTweenDataCopyList;
            if (this._endTweenDataList == null || this._endTimeSort) {
                this._endTimeSort = false;
                this._endTweenDataList = tTweenDataCopyList = this._tweenDataList.concat();
                function Compare(paraA, paraB) {
                    if (paraA.endTime > paraB.endTime) {
                        return 1;
                    }
                    else if (paraA.endTime < paraB.endTime) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                }
                tTweenDataCopyList.sort(Compare);
            }
            else {
                tTweenDataCopyList = this._endTweenDataList;
            }
            var tTweenData;
            for (var i = 0, n = tTweenDataCopyList.length; i < n; i++) {
                tTweenData = tTweenDataCopyList[i];
                if (tTweenData.type == 0) {
                    if (time >= tTweenData.endTime) {
                        this._index = Math.max(this._index, i + 1);
                        var props = tTweenData.data;
                        if (tTweenData.isTo) {
                            for (var tP in props) {
                                tTweenData.target[tP] = props[tP];
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            for (i = 0, n = this._tweenDataList.length; i < n; i++) {
                tTweenData = this._tweenDataList[i];
                if (tTweenData.type == 0) {
                    if (time >= tTweenData.startTime && time < tTweenData.endTime) {
                        this._index = Math.max(this._index, i + 1);
                        this._gidIndex++;
                        tTween = Pool.getItemByClass("tween", Tween);
                        tTween._create(tTweenData.target, tTweenData.data, tTweenData.duration, tTweenData.ease, Handler.create(this, this._animComplete, [this._gidIndex]), 0, false, tTweenData.isTo, true, false);
                        tTween.setStartTime(this._currTime - (time - tTweenData.startTime));
                        tTween._updateEase(this._currTime);
                        tTween.gid = this._gidIndex;
                        this._tweenDic[this._gidIndex] = tTween;
                    }
                }
            }
        }
        gotoLabel(Label) {
            if (this._labelDic == null)
                return;
            var tLabelData = this._labelDic[Label];
            if (tLabelData)
                this.gotoTime(tLabelData.startTime);
        }
        pause() {
            ILaya.timer.clear(this, this._update);
        }
        resume() {
            this.play(this._currTime, this._loopKey);
        }
        play(timeOrLabel = 0, loop = false) {
            if (!this._tweenDataList)
                return;
            if (this._startTimeSort) {
                this._startTimeSort = false;
                function Compare(paraA, paraB) {
                    if (paraA.startTime > paraB.startTime) {
                        return 1;
                    }
                    else if (paraA.startTime < paraB.startTime) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                }
                this._tweenDataList.sort(Compare);
                for (var i = 0, n = this._tweenDataList.length; i < n; i++) {
                    var tTweenData = this._tweenDataList[i];
                    if (tTweenData != null && tTweenData.type == 0) {
                        var tTarget = tTweenData.target;
                        var gid = (tTarget.$_GID || (tTarget.$_GID = Utils.getGID()));
                        var tSrcData = null;
                        if (this._firstTweenDic[gid] == null) {
                            tSrcData = {};
                            tSrcData.diyTarget = tTarget;
                            this._firstTweenDic[gid] = tSrcData;
                        }
                        else {
                            tSrcData = this._firstTweenDic[gid];
                        }
                        for (var p in tTweenData.data) {
                            if (tSrcData[p] == null) {
                                tSrcData[p] = tTarget[p];
                            }
                        }
                    }
                }
            }
            if (typeof (timeOrLabel) == 'string') {
                this.gotoLabel(timeOrLabel);
            }
            else {
                this.gotoTime(timeOrLabel);
            }
            this._loopKey = loop;
            this._lastTime = Browser.now();
            ILaya.timer.frameLoop(1, this, this._update);
        }
        _update() {
            if (this._currTime >= this._startTime) {
                if (this._loopKey) {
                    this._complete();
                    if (!this._tweenDataList)
                        return;
                    this.gotoTime(0);
                }
                else {
                    for (var p in this._tweenDic) {
                        tTween = this._tweenDic[p];
                        tTween.complete();
                    }
                    this._complete();
                    this.pause();
                    return;
                }
            }
            var tNow = Browser.now();
            var tFrameTime = tNow - this._lastTime;
            var tCurrTime = this._currTime += tFrameTime * this.scale;
            this._lastTime = tNow;
            for (p in this._tweenDic) {
                tTween = this._tweenDic[p];
                tTween._updateEase(tCurrTime);
            }
            var tTween;
            if (this._tweenDataList.length != 0 && this._index < this._tweenDataList.length) {
                var tTweenData = this._tweenDataList[this._index];
                if (tCurrTime >= tTweenData.startTime) {
                    this._index++;
                    if (tTweenData.type == 0) {
                        this._gidIndex++;
                        tTween = Pool.getItemByClass("tween", Tween);
                        tTween._create(tTweenData.target, tTweenData.data, tTweenData.duration, tTweenData.ease, Handler.create(this, this._animComplete, [this._gidIndex]), 0, false, tTweenData.isTo, true, false);
                        tTween.setStartTime(tCurrTime);
                        tTween.gid = this._gidIndex;
                        this._tweenDic[this._gidIndex] = tTween;
                        tTween._updateEase(tCurrTime);
                    }
                    else {
                        this.event(Event.LABEL, tTweenData.data);
                    }
                }
            }
        }
        _animComplete(index) {
            var tTween = this._tweenDic[index];
            if (tTween)
                delete this._tweenDic[index];
        }
        _complete() {
            this.event(Event.COMPLETE);
        }
        get index() {
            return this._frameIndex;
        }
        set index(value) {
            this._frameIndex = value;
            this.gotoTime(this._frameIndex / this._frameRate * 1000);
        }
        get total() {
            this._total = Math.floor(this._startTime / 1000 * this._frameRate);
            return this._total;
        }
        reset() {
            var p;
            if (this._labelDic) {
                for (p in this._labelDic) {
                    delete this._labelDic[p];
                }
            }
            var tTween;
            for (p in this._tweenDic) {
                tTween = this._tweenDic[p];
                tTween.clear();
                delete this._tweenDic[p];
            }
            for (p in this._firstTweenDic) {
                delete this._firstTweenDic[p];
            }
            this._endTweenDataList = null;
            if (this._tweenDataList && this._tweenDataList.length) {
                var i, len;
                len = this._tweenDataList.length;
                for (i = 0; i < len; i++) {
                    if (this._tweenDataList[i])
                        this._tweenDataList[i].destroy();
                }
            }
            this._tweenDataList.length = 0;
            this._currTime = 0;
            this._lastTime = 0;
            this._startTime = 0;
            this._index = 0;
            this._gidIndex = 0;
            this.scale = 1;
            ILaya.timer.clear(this, this._update);
        }
        destroy() {
            this.reset();
            this._labelDic = null;
            this._tweenDic = null;
            this._tweenDataList = null;
            this._firstTweenDic = null;
        }
    }
    class tweenData {
        constructor() {
            this.type = 0;
            this.isTo = true;
        }
        destroy() {
            this.target = null;
            this.ease = null;
            this.data = null;
            this.isTo = true;
            this.type = 0;
            Pool.recover("tweenData", this);
        }
    }

    class ShaderValue {
        constructor() {
        }
    }

    class ArabicReshaper {
        characterMapContains(c) {
            for (var i = 0; i < ArabicReshaper.charsMap.length; ++i) {
                if (ArabicReshaper.charsMap[i][0] === c) {
                    return true;
                }
            }
            return false;
        }
        getCharRep(c) {
            for (var i = 0; i < ArabicReshaper.charsMap.length; ++i) {
                if (ArabicReshaper.charsMap[i][0] === c) {
                    return ArabicReshaper.charsMap[i];
                }
            }
            return false;
        }
        getCombCharRep(c1, c2) {
            for (var i = 0; i < ArabicReshaper.combCharsMap.length; ++i) {
                if (ArabicReshaper.combCharsMap[i][0][0] === c1 && ArabicReshaper.combCharsMap[i][0][1] === c2) {
                    return ArabicReshaper.combCharsMap[i];
                }
            }
            return false;
        }
        isTransparent(c) {
            for (var i = 0; i < ArabicReshaper.transChars.length; ++i) {
                if (ArabicReshaper.transChars[i] === c) {
                    return true;
                }
            }
            return false;
        }
        getOriginalCharsFromCode(code) {
            var j;
            for (j = 0; j < ArabicReshaper.charsMap.length; ++j) {
                if (ArabicReshaper.charsMap[j].indexOf(code) > -1) {
                    return String.fromCharCode(ArabicReshaper.charsMap[j][0]);
                }
            }
            for (j = 0; j < ArabicReshaper.combCharsMap.length; ++j) {
                if (ArabicReshaper.combCharsMap[j].indexOf(code) > -1) {
                    return String.fromCharCode(ArabicReshaper.combCharsMap[j][0][0]) +
                        String.fromCharCode(ArabicReshaper.combCharsMap[j][0][1]);
                }
            }
            return String.fromCharCode(code);
        }
        convertArabic(normal) {
            var crep, combcrep, shaped = '';
            for (var i = 0; i < normal.length; ++i) {
                var current = normal.charCodeAt(i);
                if (this.characterMapContains(current)) {
                    var prev = null, next = null, prevID = i - 1, nextID = i + 1;
                    for (; prevID >= 0; --prevID) {
                        if (!this.isTransparent(normal.charCodeAt(prevID))) {
                            break;
                        }
                    }
                    prev = (prevID >= 0) ? normal.charCodeAt(prevID) : null;
                    crep = prev ? this.getCharRep(prev) : false;
                    if (!crep || crep[2] == null && crep[3] == null) {
                        prev = null;
                    }
                    for (; nextID < normal.length; ++nextID) {
                        if (!this.isTransparent(normal.charCodeAt(nextID))) {
                            break;
                        }
                    }
                    next = (nextID < normal.length) ? normal.charCodeAt(nextID) : null;
                    crep = next ? this.getCharRep(next) : false;
                    if (!crep || crep[3] == null && crep[4] == null) {
                        next = null;
                    }
                    if (current === 0x0644 && next != null &&
                        (next === 0x0622 || next === 0x0623 || next === 0x0625 || next === 0x0627)) {
                        combcrep = this.getCombCharRep(current, next);
                        if (prev != null) {
                            shaped += String.fromCharCode(combcrep[4]);
                        }
                        else {
                            shaped += String.fromCharCode(combcrep[1]);
                        }
                        ++i;
                        continue;
                    }
                    crep = this.getCharRep(current);
                    if (prev != null && next != null && crep[3] != null) {
                        shaped += String.fromCharCode(crep[3]);
                        continue;
                    }
                    else if (prev != null && crep[4] != null) {
                        shaped += String.fromCharCode(crep[4]);
                        continue;
                    }
                    else if (next != null && crep[2] != null) {
                        shaped += String.fromCharCode(crep[2]);
                        continue;
                    }
                    else {
                        shaped += String.fromCharCode(crep[1]);
                    }
                }
                else {
                    shaped += String.fromCharCode(current);
                }
            }
            return shaped;
        }
        convertArabicBack(apfb) {
            var toReturn = '', selectedChar;
            var i;
            for (i = 0; i < apfb.length; ++i) {
                selectedChar = apfb.charCodeAt(i);
                toReturn += this.getOriginalCharsFromCode(selectedChar);
            }
            return toReturn;
        }
    }
    ArabicReshaper.charsMap = [[0x0621, 0xFE80, null, null, null],
        [0x0622, 0xFE81, null, null, 0xFE82],
        [0x0623, 0xFE83, null, null, 0xFE84],
        [0x0624, 0xFE85, null, null, 0xFE86],
        [0x0625, 0xFE87, null, null, 0xFE88],
        [0x0626, 0xFE89, 0xFE8B, 0xFE8C, 0xFE8A],
        [0x0627, 0xFE8D, null, null, 0xFE8E],
        [0x0628, 0xFE8F, 0xFE91, 0xFE92, 0xFE90],
        [0x0629, 0xFE93, null, null, 0xFE94],
        [0x062A, 0xFE95, 0xFE97, 0xFE98, 0xFE96],
        [0x062B, 0xFE99, 0xFE9B, 0xFE9C, 0xFE9A],
        [0x062C, 0xFE9D, 0xFE9F, 0xFEA0, 0xFE9E],
        [0x062D, 0xFEA1, 0xFEA3, 0xFEA4, 0xFEA2],
        [0x062E, 0xFEA5, 0xFEA7, 0xFEA8, 0xFEA6],
        [0x062F, 0xFEA9, null, null, 0xFEAA],
        [0x0630, 0xFEAB, null, null, 0xFEAC],
        [0x0631, 0xFEAD, null, null, 0xFEAE],
        [0x0632, 0xFEAF, null, null, 0xFEB0],
        [0x0633, 0xFEB1, 0xFEB3, 0xFEB4, 0xFEB2],
        [0x0634, 0xFEB5, 0xFEB7, 0xFEB8, 0xFEB6],
        [0x0635, 0xFEB9, 0xFEBB, 0xFEBC, 0xFEBA],
        [0x0636, 0xFEBD, 0xFEBF, 0xFEC0, 0xFEBE],
        [0x0637, 0xFEC1, 0xFEC3, 0xFEC4, 0xFEC2],
        [0x0638, 0xFEC5, 0xFEC7, 0xFEC8, 0xFEC6],
        [0x0639, 0xFEC9, 0xFECB, 0xFECC, 0xFECA],
        [0x063A, 0xFECD, 0xFECF, 0xFED0, 0xFECE],
        [0x0640, 0x0640, 0x0640, 0x0640, 0x0640],
        [0x0641, 0xFED1, 0xFED3, 0xFED4, 0xFED2],
        [0x0642, 0xFED5, 0xFED7, 0xFED8, 0xFED6],
        [0x0643, 0xFED9, 0xFEDB, 0xFEDC, 0xFEDA],
        [0x0644, 0xFEDD, 0xFEDF, 0xFEE0, 0xFEDE],
        [0x0645, 0xFEE1, 0xFEE3, 0xFEE4, 0xFEE2],
        [0x0646, 0xFEE5, 0xFEE7, 0xFEE8, 0xFEE6],
        [0x0647, 0xFEE9, 0xFEEB, 0xFEEC, 0xFEEA],
        [0x0648, 0xFEED, null, null, 0xFEEE],
        [0x0649, 0xFEEF, null, null, 0xFEF0],
        [0x064A, 0xFEF1, 0xFEF3, 0xFEF4, 0xFEF2],
        [0x067E, 0xFB56, 0xFB58, 0xFB59, 0xFB57],
        [0x06CC, 0xFBFC, 0xFBFE, 0xFBFF, 0xFBFD],
        [0x0686, 0xFB7A, 0xFB7C, 0xFB7D, 0xFB7B],
        [0x06A9, 0xFB8E, 0xFB90, 0xFB91, 0xFB8F],
        [0x06AF, 0xFB92, 0xFB94, 0xFB95, 0xFB93],
        [0x0698, 0xFB8A, null, null, 0xFB8B]];
    ArabicReshaper.combCharsMap = [[[0x0644, 0x0622], 0xFEF5, null, null, 0xFEF6],
        [[0x0644, 0x0623], 0xFEF7, null, null, 0xFEF8],
        [[0x0644, 0x0625], 0xFEF9, null, null, 0xFEFA],
        [[0x0644, 0x0627], 0xFEFB, null, null, 0xFEFC]];
    ArabicReshaper.transChars = [0x0610,
        0x0612,
        0x0613,
        0x0614,
        0x0615,
        0x064B,
        0x064C,
        0x064D,
        0x064E,
        0x064F,
        0x0650,
        0x0651,
        0x0652,
        0x0653,
        0x0654,
        0x0655,
        0x0656,
        0x0657,
        0x0658,
        0x0670,
        0x06D6,
        0x06D7,
        0x06D8,
        0x06D9,
        0x06DA,
        0x06DB,
        0x06DC,
        0x06DF,
        0x06E0,
        0x06E1,
        0x06E2,
        0x06E3,
        0x06E4,
        0x06E7,
        0x06E8,
        0x06EA,
        0x06EB,
        0x06EC,
        0x06ED];

    class MatirxArray {
        static ArrayMul(a, b, o) {
            if (!a) {
                MatirxArray.copyArray(b, o);
                return;
            }
            if (!b) {
                MatirxArray.copyArray(a, o);
                return;
            }
            var ai0, ai1, ai2, ai3;
            for (var i = 0; i < 4; i++) {
                ai0 = a[i];
                ai1 = a[i + 4];
                ai2 = a[i + 8];
                ai3 = a[i + 12];
                o[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
                o[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
                o[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
                o[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
            }
        }
        static copyArray(f, t) {
            if (!f)
                return;
            if (!t)
                return;
            for (var i = 0; i < f.length; i++) {
                t[i] = f[i];
            }
        }
    }

    exports.AlphaCmd = AlphaCmd;
    exports.Animation = Animation;
    exports.AnimationBase = AnimationBase;
    exports.ArabicReshaper = ArabicReshaper;
    exports.AtlasGrid = AtlasGrid;
    exports.AtlasInfoManager = AtlasInfoManager;
    exports.AudioSound = AudioSound;
    exports.AudioSoundChannel = AudioSoundChannel;
    exports.BasePoly = BasePoly;
    exports.BaseShader = BaseShader;
    exports.BaseTexture = BaseTexture;
    exports.Bezier = Bezier;
    exports.Bitmap = Bitmap;
    exports.BitmapFont = BitmapFont;
    exports.BlendMode = BlendMode;
    exports.BlurFilter = BlurFilter;
    exports.BlurFilterGLRender = BlurFilterGLRender;
    exports.BlurFilterSetter = BlurFilterSetter;
    exports.BoundsStyle = BoundsStyle;
    exports.Browser = Browser;
    exports.Buffer = Buffer;
    exports.Buffer2D = Buffer2D;
    exports.BufferState2D = BufferState2D;
    exports.BufferStateBase = BufferStateBase;
    exports.ButtonEffect = ButtonEffect;
    exports.Byte = Byte;
    exports.CONST3D2D = CONST3D2D;
    exports.CacheManger = CacheManger;
    exports.CacheStyle = CacheStyle;
    exports.CallLater = CallLater;
    exports.CharRenderInfo = CharRenderInfo;
    exports.CharRender_Canvas = CharRender_Canvas;
    exports.CharRender_Native = CharRender_Native;
    exports.CharSubmitCache = CharSubmitCache;
    exports.ClassUtils = ClassUtils;
    exports.ClipRectCmd = ClipRectCmd;
    exports.ColorFilter = ColorFilter;
    exports.ColorFilterSetter = ColorFilterSetter;
    exports.ColorUtils = ColorUtils;
    exports.CommandEncoder = CommandEncoder;
    exports.CommonScript = CommonScript;
    exports.Component = Component;
    exports.Config = Config;
    exports.Const = Const;
    exports.Context = Context;
    exports.Dragging = Dragging;
    exports.Draw9GridTexture = Draw9GridTexture;
    exports.DrawCanvasCmd = DrawCanvasCmd;
    exports.DrawCircleCmd = DrawCircleCmd;
    exports.DrawCurvesCmd = DrawCurvesCmd;
    exports.DrawImageCmd = DrawImageCmd;
    exports.DrawLineCmd = DrawLineCmd;
    exports.DrawLinesCmd = DrawLinesCmd;
    exports.DrawParticleCmd = DrawParticleCmd;
    exports.DrawPathCmd = DrawPathCmd;
    exports.DrawPieCmd = DrawPieCmd;
    exports.DrawPolyCmd = DrawPolyCmd;
    exports.DrawRectCmd = DrawRectCmd;
    exports.DrawStyle = DrawStyle;
    exports.DrawTextureCmd = DrawTextureCmd;
    exports.DrawTexturesCmd = DrawTexturesCmd;
    exports.DrawTrianglesCmd = DrawTrianglesCmd;
    exports.Earcut = Earcut;
    exports.EarcutNode = EarcutNode;
    exports.Ease = Ease;
    exports.EffectAnimation = EffectAnimation;
    exports.EffectBase = EffectBase;
    exports.Event = Event;
    exports.EventDispatcher = EventDispatcher;
    exports.FadeIn = FadeIn;
    exports.FadeOut = FadeOut;
    exports.FillBorderTextCmd = FillBorderTextCmd;
    exports.FillBorderWordsCmd = FillBorderWordsCmd;
    exports.FillTextCmd = FillTextCmd;
    exports.FillTextureCmd = FillTextureCmd;
    exports.FillWordsCmd = FillWordsCmd;
    exports.Filter = Filter;
    exports.FilterSetterBase = FilterSetterBase;
    exports.FontInfo = FontInfo;
    exports.FrameAnimation = FrameAnimation;
    exports.GlowFilter = GlowFilter;
    exports.GlowFilterGLRender = GlowFilterGLRender;
    exports.GlowFilterSetter = GlowFilterSetter;
    exports.GrahamScan = GrahamScan;
    exports.GraphicAnimation = GraphicAnimation;
    exports.Graphics = Graphics;
    exports.GraphicsBounds = GraphicsBounds;
    exports.HTMLCanvas = HTMLCanvas;
    exports.HTMLChar = HTMLChar;
    exports.HTMLImage = HTMLImage;
    exports.Handler = Handler;
    exports.HitArea = HitArea;
    exports.HttpRequest = HttpRequest;
    exports.ICharRender = ICharRender;
    exports.ILaya = ILaya;
    exports.IStatRender = IStatRender;
    exports.IndexBuffer2D = IndexBuffer2D;
    exports.InlcudeFile = InlcudeFile;
    exports.Input = Input;
    exports.KeyBoardManager = KeyBoardManager;
    exports.KeyLocation = KeyLocation;
    exports.Keyboard = Keyboard;
    exports.Laya = Laya;
    exports.LayaGL = LayaGL;
    exports.LayaGLQuickRunner = LayaGLQuickRunner;
    exports.LayaGLRunner = LayaGLRunner;
    exports.LayaGPU = LayaGPU;
    exports.Loader = Loader;
    exports.LoaderManager = LoaderManager;
    exports.LocalStorage = LocalStorage;
    exports.Log = Log;
    exports.MathUtil = MathUtil;
    exports.MatirxArray = MatirxArray;
    exports.Matrix = Matrix;
    exports.Mesh2D = Mesh2D;
    exports.MeshParticle2D = MeshParticle2D;
    exports.MeshQuadTexture = MeshQuadTexture;
    exports.MeshTexture = MeshTexture;
    exports.MeshVG = MeshVG;
    exports.Mouse = Mouse;
    exports.MouseManager = MouseManager;
    exports.Node = Node;
    exports.Path = Path;
    exports.PerfData = PerfData;
    exports.PerfHUD = PerfHUD;
    exports.Point = Point;
    exports.Pool = Pool;
    exports.PoolCache = PoolCache;
    exports.Prefab = Prefab;
    exports.PrimitiveSV = PrimitiveSV;
    exports.QuickTestTool = QuickTestTool;
    exports.Rectangle = Rectangle;
    exports.Render = Render;
    exports.RenderInfo = RenderInfo;
    exports.RenderSprite = RenderSprite;
    exports.RenderState2D = RenderState2D;
    exports.RenderTexture2D = RenderTexture2D;
    exports.Resource = Resource;
    exports.ResourceVersion = ResourceVersion;
    exports.RestoreCmd = RestoreCmd;
    exports.RotateCmd = RotateCmd;
    exports.RunDriver = RunDriver;
    exports.SaveBase = SaveBase;
    exports.SaveClipRect = SaveClipRect;
    exports.SaveCmd = SaveCmd;
    exports.SaveMark = SaveMark;
    exports.SaveTransform = SaveTransform;
    exports.SaveTranslate = SaveTranslate;
    exports.ScaleCmd = ScaleCmd;
    exports.Scene = Scene;
    exports.SceneLoader = SceneLoader;
    exports.SceneUtils = SceneUtils;
    exports.Script = Script;
    exports.Shader = Shader;
    exports.Shader2D = Shader2D;
    exports.Shader2X = Shader2X;
    exports.ShaderCompile = ShaderCompile;
    exports.ShaderDefines2D = ShaderDefines2D;
    exports.ShaderDefinesBase = ShaderDefinesBase;
    exports.ShaderNode = ShaderNode;
    exports.ShaderValue = ShaderValue;
    exports.SkinMeshBuffer = SkinMeshBuffer;
    exports.SkinSV = SkinSV;
    exports.Socket = Socket;
    exports.Sound = Sound;
    exports.SoundChannel = SoundChannel;
    exports.SoundManager = SoundManager;
    exports.SoundNode = SoundNode;
    exports.Sprite = Sprite;
    exports.SpriteConst = SpriteConst;
    exports.SpriteStyle = SpriteStyle;
    exports.Stage = Stage;
    exports.Stat = Stat;
    exports.StatUI = StatUI;
    exports.StringKey = StringKey;
    exports.StrokeTextCmd = StrokeTextCmd;
    exports.Submit = Submit;
    exports.SubmitBase = SubmitBase;
    exports.SubmitCMD = SubmitCMD;
    exports.SubmitCanvas = SubmitCanvas;
    exports.SubmitKey = SubmitKey;
    exports.SubmitTarget = SubmitTarget;
    exports.SubmitTexture = SubmitTexture;
    exports.System = System;
    exports.TTFLoader = TTFLoader;
    exports.Text = Text;
    exports.TextAtlas = TextAtlas;
    exports.TextRender = TextRender;
    exports.TextStyle = TextStyle;
    exports.TextTexture = TextTexture;
    exports.Texture = Texture;
    exports.Texture2D = Texture2D;
    exports.TextureSV = TextureSV;
    exports.TimeLine = TimeLine;
    exports.Timer = Timer;
    exports.TouchManager = TouchManager;
    exports.TransformCmd = TransformCmd;
    exports.TranslateCmd = TranslateCmd;
    exports.Tween = Tween;
    exports.URL = URL;
    exports.Utils = Utils;
    exports.Value2D = Value2D;
    exports.VectorGraphManager = VectorGraphManager;
    exports.VertexArrayObject = VertexArrayObject;
    exports.VertexBuffer2D = VertexBuffer2D;
    exports.WeakObject = WeakObject;
    exports.WebAudioSound = WebAudioSound;
    exports.WebAudioSoundChannel = WebAudioSoundChannel;
    exports.WebGL = WebGL;
    exports.WebGLCacheAsNormalCanvas = WebGLCacheAsNormalCanvas;
    exports.WebGLContext = WebGLContext;
    exports.WebGLRTMgr = WebGLRTMgr;
    exports.WordText = WordText;
    exports.WorkerLoader = WorkerLoader;
    exports.__init = __init;
    exports._static = _static;
    exports.alertGlobalError = alertGlobalError;
    exports.enableDebugPanel = enableDebugPanel;
    exports.init = init;
    exports.isWXOpenDataContext = isWXOpenDataContext;
    exports.isWXPosMsg = isWXPosMsg;
    exports.version = version;

    exports.static=_static;

    return exports;

}({}));
