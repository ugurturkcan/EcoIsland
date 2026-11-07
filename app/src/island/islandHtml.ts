import { SCENE_CLASS_SOURCE } from './sceneSource';

const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

/** WebView içinde çalışan, dokunmayla döndürülüp yakınlaştırılabilen 3D ada sayfası. */
export function islandHtml(opts: { level: number; cy?: number; zoom?: number }) {
  const init = JSON.stringify({ level: opts.level, cy: opts.cy ?? 0.42, zoom: opts.zoom ?? 13 });
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>html,body{margin:0;height:100%;overflow:hidden;background:#8FD0EC;touch-action:none}canvas{display:block;width:100vw;height:100vh;touch-action:none}</style>
<script src="${THREE_CDN}"></script></head><body><canvas id="c"></canvas>
<script>
class DCLogic { constructor(p) { this.props = p; this.state = {}; } setState(o) { Object.assign(this.state, o); } }
${SCENE_CLASS_SOURCE}
(function () {
  var init = ${init};
  var cv = document.getElementById('c');
  var comp = new Component({ level: init.level, cy: init.cy, zoom: init.zoom, w: innerWidth, h: innerHeight });
  comp.cref(cv);
  ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
    var fn = t === 'pointerdown' ? comp.onDown : t === 'pointermove' ? comp.onMove : comp.onUp;
    cv.addEventListener(t, function (e) { fn(e); });
  });
  cv.addEventListener('wheel', function (e) { comp.onWheel(e); }, { passive: true });
  function update(next) { var pp = comp.props; comp.props = Object.assign({}, pp, next); comp.componentDidUpdate(pp); }
  window.addEventListener('resize', function () { update({ w: innerWidth, h: innerHeight }); });
  window.adacik = {
    setLevel: function (n) { update({ level: n }); },
    setZoom: function (z) { update({ zoom: z }); }
  };
  comp.componentDidMount();
  var tries = 0;
  (function check() {
    if (window.THREE) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage('ready'); return; }
    if (++tries > 100) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage('three-failed'); return; }
    setTimeout(check, 100);
  })();
})();
</script></body></html>`;
}
