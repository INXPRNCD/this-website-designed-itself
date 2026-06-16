/* Hero aurora — raw WebGL, one quad, ~150 lines of GLSL and glue.
   Cursor-reactive, scroll-aware, paused when off-screen or hidden. */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;   // normalized, aspect-corrected in shader
uniform float u_scroll;  // 0..1 hero exit progress

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * snoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;

  float t = u_time * 0.045;

  // domain-warped field — the organic drift, kept soft
  vec2 q = vec2(fbm(p * 0.9 + t), fbm(p * 0.9 - t * 0.65 + 3.1));
  float n = fbm(p * 1.05 + q * 0.95 + vec2(0.0, -t * 0.5));

  // a slim aurora ribbon low in the frame
  float curve = 0.27 + 0.09 * snoise(vec2(p.x * 0.7 + t, t * 0.45));
  float band = uv.y - curve;
  float aurora = exp(-band * band * 22.0) * (0.5 + 0.5 * n);
  aurora = max(aurora, 0.0);

  // the cursor carries a quiet glow
  vec2 m = vec2(u_mouse.x * u_res.x / u_res.y, u_mouse.y);
  float d = distance(p, m);
  aurora += exp(-d * d * 7.0) * 0.18 * (0.6 + 0.4 * n);

  // dim as the visitor scrolls away
  aurora *= 1.0 - u_scroll * 0.9;

  vec3 base = vec3(0.048, 0.052, 0.038);
  vec3 moss = vec3(0.12, 0.20, 0.085);
  vec3 acid = vec3(0.80, 0.93, 0.27);

  vec3 col = base;
  // faint ambient breathing across the whole field
  col += moss * (0.10 + 0.10 * n);
  col += moss * aurora * 0.85;
  col += acid * pow(aurora, 3.1) * 0.5;

  // vignette
  float vig = smoothstep(1.3, 0.42, distance(uv, vec2(0.5, 0.42)));
  col *= mix(0.72, 1.0, vig);

  // blue-noise-ish dither kills gradient banding
  float dith = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dith - 0.5) / 160.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function initShader({ reduced = false } = {}) {
  const canvas = document.getElementById('shader-canvas');
  if (!canvas) return null;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null; // CSS gradient fallback stays visible

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };

  const prog = gl.createProgram();
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // fullscreen triangle-pair
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res: gl.getUniformLocation(prog, 'u_res'),
    time: gl.getUniformLocation(prog, 'u_time'),
    mouse: gl.getUniformLocation(prog, 'u_mouse'),
    scroll: gl.getUniformLocation(prog, 'u_scroll'),
  };

  const isCoarse = matchMedia('(pointer: coarse)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, isCoarse ? 1.5 : 2);

  let w = 0, h = 0;
  function resize() {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (cw === 0 || ch === 0) return;
    w = Math.round(cw * DPR);
    h = Math.round(ch * DPR);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  // smoothed cursor
  const mouse = { x: 0.5, y: 0.45, tx: 0.5, ty: 0.45 };
  addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / innerWidth;
    mouse.ty = 1 - e.clientY / innerHeight;
  }, { passive: true });

  let scrollProgress = 0;
  let visible = true;

  /* rAF already pauses in hidden tabs — only off-screen needs a gate */
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(canvas);

  const start = performance.now();
  function frame() {
    if (!visible) return;
    resize();
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    gl.uniform2f(U.res, w, h);
    gl.uniform1f(U.time, (performance.now() - start) / 1000);
    gl.uniform2f(U.mouse, mouse.x, mouse.y);
    gl.uniform1f(U.scroll, scrollProgress);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  if (reduced) {
    // one considered frame, then silence
    gl.uniform2f(U.res, w, h);
    gl.uniform1f(U.time, 14.0);
    gl.uniform2f(U.mouse, 0.62, 0.4);
    gl.uniform1f(U.scroll, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  } else {
    gsap.ticker.add(frame);
  }

  return {
    setScroll(p) { scrollProgress = p; },
  };
}
