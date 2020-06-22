export function renderAnimation(canvas, spine) {

  var lastFrameTime = Date.now() / 1000;
  var shader;
  var batcher;
  var gl;
  var mvp = new spine.webgl.Matrix4();
  var assetManager;
  var skeleton, state, bounds, atlas, atlasLoader, premultipliedAlpha;
  var skeletonRenderer;
  var shapes;

  var baseUrl = "http://test.mine.cn/spine/assets/";
  var skelName = "spineboy";
  var animName = "run";
  var swirlEffect = new spine.SwirlEffect(0);
  var jitterEffect = new spine.JitterEffect(20, 20);
  var swirlTime = 0;

  init();

  function init() {
    var config = {
      alpha: false
    };
    gl = canvas.getContext("webgl", config) || canvas.getContext("experimental-webgl", config);
    if (!gl) {
      alert('WebGL is unavailable.');
      return;
    }

    shader = spine.webgl.Shader.newTwoColoredTextured(gl);
    batcher = new spine.webgl.PolygonBatcher(gl);
    mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
    skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);

    shapes = new spine.webgl.ShapeRenderer(gl);
    assetManager = new spine.webgl.AssetManager(gl, baseUrl);

    assetManager.loadText(skelName + ".json");
    assetManager.loadTextureAtlas(skelName.replace("-pro", "").replace("-ess", "") + ".atlas");

    canvas.requestAnimationFrame(load);
  }

  function load() {
    if (assetManager.isLoadingComplete()) {
      var data = loadSkeleton(skelName, animName, false);
      skeleton = data.skeleton;
      state = data.state;
      bounds = data.bounds;
      premultipliedAlpha = data.premultipliedAlpha;
      canvas.requestAnimationFrame(render);
    } else {
      canvas.requestAnimationFrame(load);
    }
  }

  function loadSkeleton(name, initialAnimation, premultipliedAlpha, skin) {
    if (skin === undefined) skin = "default";

    atlas = assetManager.get(name.replace("-ess", "").replace("-pro", "").replace("-stretchy-ik", "") + ".atlas");

    // Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
    atlasLoader = new spine.AtlasAttachmentLoader(atlas);

    // Create a SkeletonJson instance for parsing the .json file.
    var skeletonJson = new spine.SkeletonJson(atlasLoader);

    // Set the scale to apply during parsing, parse the file, and create a new skeleton.
    var skeletonData = skeletonJson.readSkeletonData(assetManager.get(name + ".json"));
    var skeleton = new spine.Skeleton(skeletonData);
    skeleton.scaleX = 0.5;
    skeleton.scaleY = 0.5;
    skeleton.setSkinByName(skin);
    var bounds = calculateBounds(skeleton);

    // Create an AnimationState, and set the initial animation in looping mode.
    var animationStateData = new spine.AnimationStateData(skeleton.data);
    var animationState = new spine.AnimationState(animationStateData);

      animationState.setAnimation(0, initialAnimation, true);
    animationState.addListener({
      start: function (track) {
        //console.log("Animation on track " + track.trackIndex + " started");
      },
      interrupt: function (track) {
        //console.log("Animation on track " + track.trackIndex + " interrupted");
      },
      end: function (track) {
        //console.log("Animation on track " + track.trackIndex + " ended");
      },
      disposed: function (track) {
        //console.log("Animation on track " + track.trackIndex + " disposed");
      },
      complete: function (track) {
        //console.log("Animation on track " + track.trackIndex + " completed");
      },
      event: function (track, event) {
        //console.log("Event on track " + track.trackIndex + ": " + JSON.stringify(event));
      }
    })

    // Pack everything up and return to caller.
    return {
      skeleton: skeleton,
      state: animationState,
      bounds: bounds,
      premultipliedAlpha: premultipliedAlpha
    };
  }

  function calculateBounds(skeleton) {
    skeleton.setToSetupPose();
    skeleton.updateWorldTransform();
    var offset = new spine.Vector2();
    var size = new spine.Vector2();
    skeleton.getBounds(offset, size, []);
    return {
      offset: offset,
      size: size
    };
  }

  function render() {
    var now = Date.now() / 1000;
    var delta = now - lastFrameTime;
    lastFrameTime = now;

    resize();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    state.update(delta);
    state.apply(skeleton);
    skeleton.updateWorldTransform();

    shader.bind();
    shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
    shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);

    batcher.begin(shader);

    skeletonRenderer.vertexEffect = null;

    skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
    skeletonRenderer.draw(batcher, skeleton);
    batcher.end();

    shader.unbind();

    canvas.requestAnimationFrame(render);
  }

  function resize() {
    /*var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (canvas.width != w || canvas.height != h) {
      canvas.width = w;
      canvas.height = h;
    }*/

    // magic
    var centerX = bounds.offset.x + bounds.size.x / 2;
    var centerY = bounds.offset.y + bounds.size.y / 2;
    var scaleX = bounds.size.x / canvas.width;
    var scaleY = bounds.size.y / canvas.height;
    var scale = Math.max(scaleX, scaleY) * 1.2;
    if (scale < 1) scale = 1;
    var width = canvas.width * scale;
    var height = canvas.height * scale;

    mvp.ortho2d(centerX - width / 2, centerY - height / 2, width, height);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
}