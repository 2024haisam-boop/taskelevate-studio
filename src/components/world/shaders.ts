/**
 * GLSL for the home-page world. Glow is faked with additive geometry (no postprocessing passes), so the whole
 * world stays cheap on phones: beams = fresnel-faded cones, halos = radial sprites, reflections = mirrored
 * screens under a semi-transparent floor.
 */

/* ---------------------------------------------------------------- screens */

/** Plain screens (Well rows, carousel, gallery). */
export const screenVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

/** Shaft rows: instanced curved panels, each row spun on the GPU (aDir picks which spin uniform). */
export const shaftVertex = /* glsl */ `
  attribute float aAngle;
  attribute float aY;
  attribute float aDir;
  uniform float uSpinA;
  uniform float uSpinB;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    float a = aAngle + (aDir > 0.0 ? uSpinA : uSpinB);
    float c = cos(a);
    float s = sin(a);
    vec3 p = vec3(c * position.x + s * position.z, position.y + aY, -s * position.x + c * position.z);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

/**
 * Rounded, cover-fitted video screen with rim light and depth fog.
 * defines: CURVED (cylinder panel: mirror u on back faces, dim the far side from outside),
 *          REFLECT (mirrored copy under the floor: fades out with distance from the floor line).
 */
export const screenFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uPanelAspect;
  uniform float uMapAspect;
  uniform float uRadius;
  uniform float uInside;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform vec3 uFogColor;
  uniform vec3 uRim;
  uniform float uBoost;
  uniform float uExposure;
  uniform float uFade;
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vec2 uv = vUv;
    bool back = !gl_FrontFacing;
    #ifdef CURVED
      if (back) uv.x = 1.0 - uv.x;
    #endif

    vec2 p = (uv - 0.5) * vec2(uPanelAspect, 1.0);
    vec2 b = vec2(uPanelAspect, 1.0) * 0.5 - uRadius;
    float d = length(max(abs(p) - b, 0.0)) - uRadius;
    if (d > 0.0) discard;

    vec2 tuv = uv;
    float r = uPanelAspect / uMapAspect;
    if (r > 1.0) tuv.y = (tuv.y - 0.5) / r + 0.5;
    else tuv.x = (tuv.x - 0.5) * r + 0.5;

    vec3 col = texture2D(uMap, tuv).rgb;
    col = pow(col, vec3(0.9)) * 1.12;

    float vig = smoothstep(0.85, 0.2, length((uv - 0.5) * vec2(1.0, 1.25)));
    col *= mix(0.72, 1.0, vig);

    float rim = smoothstep(-0.035, 0.0, d);
    col += uRim * rim * (0.55 + uBoost * 0.9);

    #ifdef CURVED
      float farSide = back ? (1.0 - uInside) : 0.0;
      col = mix(col, col * vec3(0.62, 0.64, 0.82), farSide * 0.8);
    #endif

    col *= (1.0 + uBoost * 0.22) * uExposure;

    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    col = mix(col, uFogColor, max(fog, 1.0 - uFade));

    #ifdef REFLECT
      // uv.y = 0 is the screen's bottom edge — the one closest to the floor
      float a = pow(1.0 - uv.y, 2.4) * 0.32 * uFade * (1.0 - fog);
      gl_FragColor = vec4(col, a);
    #else
      gl_FragColor = vec4(col, 1.0);
    #endif
    #include <colorspace_fragment>
  }
`;

/* ---------------------------------------------------------------- light */

/** World-space varyings for view-dependent glow (beams, rings). */
export const fresnelVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec2 vUv;
  varying vec3 vW;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vW = wp.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

/** Volumetric light cone: brightest along its axis and near the source, fades at the silhouette. */
export const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  varying vec3 vN;
  varying vec3 vV;
  varying vec2 vUv;
  varying vec3 vW;
  void main() {
    float facing = abs(dot(normalize(vN), normalize(vV)));
    float core = pow(facing, 2.4);
    float along = pow(vUv.y, 1.35);
    float motes = 0.82 + 0.18 * sin(vW.y * 2.3 + uTime * 0.7 + sin(vW.x * 1.7 + vW.z * 1.3) * 2.0);
    float a = core * along * motes * uIntensity;
    gl_FragColor = vec4(uColor * a, 1.0);
  }
`;

/** Soft radial halo on a plane (additive). */
export const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  /** 0 = filled disc, >0 = ring at that radius (0..1) */
  uniform float uRing;
  uniform float uWidth;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = uRing > 0.0
      ? exp(-pow((d - uRing) / uWidth, 2.0))
      : pow(max(0.0, 1.0 - d), uPower);
    gl_FragColor = vec4(uColor * a * uIntensity, 1.0);
  }
`;

/** Portal ring (torus): fresnel glow with colour travelling around it. */
export const ringFragment = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vN;
  varying vec3 vV;
  varying vec2 vUv;
  varying vec3 vW;
  void main() {
    float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
    float t = 0.5 + 0.5 * sin(vUv.x * 6.2832 * 2.0 - uTime * 1.4);
    vec3 col = mix(uA, uB, t) * (0.7 + pow(f, 1.4) * 2.2);
    col += vec3(1.0) * pow(1.0 - f, 6.0) * 0.9;
    gl_FragColor = vec4(col * uIntensity, 1.0);
  }
`;

/** Swirling portal core (disc, additive). */
export const coreFragment = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    if (r > 1.0) discard;
    float a = atan(c.y, c.x);
    float s1 = 0.5 + 0.5 * sin(a * 3.0 + r * 9.0 - uTime * 1.3);
    float s2 = 0.5 + 0.5 * sin(a * 5.0 - r * 13.0 + uTime * 0.9);
    vec3 col = mix(uA, uB, s1) * (0.35 + s2 * 0.65) * pow(1.0 - r, 1.4);
    col += vec3(1.0, 0.95, 1.0) * pow(1.0 - r, 7.0) * 0.8;
    col *= smoothstep(1.0, 0.82, r);
    gl_FragColor = vec4(col * uIntensity, 1.0);
  }
`;

/* ---------------------------------------------------------------- pool */

/**
 * The bottom of the well: from above it plays the reel with ripples and a glowing rim; from below it is
 * the bright hole in the studio's ceiling.
 */
export const poolFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uMapAspect;
  uniform float uTime;
  uniform float uExposure;
  uniform float uRipple;
  uniform vec3 uRim;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c) * 2.0;
    if (d > 1.0) discard;
    vec3 col;
    if (gl_FrontFacing) {
      float wave = sin(d * 38.0 - uTime * 2.4);
      vec2 dir = d > 0.001 ? c / (d * 0.5) : vec2(0.0);
      vec2 uv = vUv + dir * wave * 0.0035 * uRipple * (1.0 - d);
      vec2 tuv = uv;
      tuv.x = (tuv.x - 0.5) / uMapAspect + 0.5;
      col = texture2D(uMap, tuv).rgb;
      col = pow(col, vec3(0.92)) * 1.1;
      col += vec3(0.45, 0.35, 1.0) * pow(0.5 + 0.5 * wave, 10.0) * 0.1 * uRipple * (1.0 - d);
      col *= mix(1.0, 0.5, smoothstep(0.62, 0.97, d));
      col = mix(col, uRim * 2.4, smoothstep(0.9, 1.0, d) * 0.85);
    } else {
      float g = pow(1.0 - d, 0.55);
      col = mix(vec3(0.42, 0.3, 0.95), vec3(1.0, 0.97, 1.0), g * 0.75) * (0.35 + g * 1.4);
    }
    gl_FragColor = vec4(col * uExposure, 1.0);
    #include <colorspace_fragment>
  }
`;

/* ---------------------------------------------------------------- floor */

export const floorVertex = /* glsl */ `
  varying vec3 vW;
  varying float vDepth;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vW = wp.xyz;
    vec4 mv = viewMatrix * wp;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

/**
 * Dark glossy studio floor: faint grid, pools of light (x, z, radius, intensity) and side light strips
 * that run toward the portal. Semi-transparent so the mirrored screens beneath read as reflections.
 */
export const floorFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uTint;
  uniform vec4 uPoolA;
  uniform vec4 uPoolB;
  uniform vec4 uPoolC;
  uniform float uStripX;
  uniform vec2 uStripZ;
  uniform float uTime;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform vec3 uFogColor;
  uniform float uFade;
  varying vec3 vW;
  varying float vDepth;

  float pool(vec4 p) {
    vec2 q = vW.xz - p.xy;
    return exp(-dot(q, q) / (p.z * p.z)) * p.w;
  }

  void main() {
    vec3 col = uBase;
    vec2 f = abs(fract(vW.xz * 0.5) - 0.5);
    vec2 w = fwidth(vW.xz * 0.5) * 1.2;
    float grid = max(1.0 - smoothstep(0.0, w.x, 0.5 - f.x), 1.0 - smoothstep(0.0, w.y, 0.5 - f.y));
    float light = pool(uPoolA) + pool(uPoolB) + pool(uPoolC);
    col += uTint * grid * (0.02 + light * 0.22);
    col += uTint * light * 0.55;

    // light strips along the hall, with pulses travelling toward the portal
    float sx = abs(abs(vW.x) - uStripX);
    // strips fade in after the carousel and fade out before the portal (no hard ends)
    float inHall = smoothstep(uStripZ.y, uStripZ.y + 9.0, vW.z) * (1.0 - smoothstep(uStripZ.x - 4.0, uStripZ.x, vW.z));
    float strip = (1.0 - smoothstep(0.0, 0.05, sx)) * inHall;
    float halo = (1.0 - smoothstep(0.0, 0.7, sx)) * inHall;
    float pulse = pow(0.5 + 0.5 * sin(vW.z * 0.9 + uTime * 3.0), 6.0);
    col += uTint * (strip * (0.9 + pulse * 1.6) + halo * (0.12 + pulse * 0.2));

    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    col = mix(col, uFogColor, fog);
    gl_FragColor = vec4(col, mix(0.86, 1.0, fog) * uFade);
    #include <colorspace_fragment>
  }
`;

/* ---------------------------------------------------------------- particles */

/** Dust motes that always surround the camera (wrapped in a box around it). */
export const dustVertex = /* glsl */ `
  attribute vec3 aSeed;
  uniform vec3 uCam;
  uniform vec3 uBox;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixel;
  varying float vA;
  void main() {
    vec3 p = aSeed * uBox;
    p += vec3(
      sin(uTime * 0.11 + aSeed.y * 6.2832) * 0.4,
      uTime * 0.06 * (0.4 + aSeed.x),
      cos(uTime * 0.13 + aSeed.z * 6.2832) * 0.4
    );
    p = mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5 + uCam;
    vec4 mv = viewMatrix * vec4(p, 1.0);
    float z = -mv.z;
    gl_PointSize = uSize * (0.5 + aSeed.y) * uPixel / max(z, 0.1);
    float twinkle = 0.55 + 0.45 * sin(uTime * 1.3 + aSeed.x * 40.0);
    vA = smoothstep(0.25, 1.4, z) * smoothstep(uBox.z * 0.55, uBox.z * 0.2, z) * twinkle;
    gl_Position = projectionMatrix * mv;
  }
`;

export const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = pow(max(0.0, 1.0 - d), 2.2) * vA * uOpacity;
    gl_FragColor = vec4(uColor * a, 1.0);
  }
`;

/** Light streaks hanging in the shaft — stretched by the camera's fall speed (motion blur). */
export const streakVertex = /* glsl */ `
  attribute vec3 aSeed;
  attribute float aEnd;
  uniform float uTop;
  uniform float uSpan;
  uniform float uStretch;
  varying float vA;
  varying float vEnd;
  void main() {
    float ang = aSeed.x * 6.2832;
    float rad = 3.0 + aSeed.z * 0.85;
    float y = uTop - aSeed.y * uSpan + aEnd * uStretch * (0.6 + aSeed.z * 0.8);
    vec3 p = vec3(cos(ang) * rad, y, sin(ang) * rad);
    vEnd = aEnd;
    vA = 0.4 + aSeed.z * 0.6;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

export const streakFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vA;
  varying float vEnd;
  void main() {
    gl_FragColor = vec4(uColor * vA * uOpacity * (1.0 - vEnd * 0.85), 1.0);
  }
`;

/** Spiral particles streaming into the portal. */
export const spiralVertex = /* glsl */ `
  attribute vec3 aSeed;
  uniform float uTime;
  uniform float uPixel;
  uniform float uSize;
  varying float vA;
  void main() {
    float t = fract(aSeed.x + uTime * (0.05 + aSeed.y * 0.05));
    float r = mix(7.5, 0.3, t * t);
    float a = aSeed.z * 6.2832 + t * 7.0;
    vec3 p = vec3(cos(a) * r, sin(a) * r, mix(5.0, -0.2, t));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.6 + aSeed.y) * uPixel / max(-mv.z, 0.1);
    vA = smoothstep(0.0, 0.15, t) * smoothstep(1.0, 0.75, t);
    gl_Position = projectionMatrix * mv;
  }
`;

/* ---------------------------------------------------------------- text band */

/** Kinetic type on a cylinder around the portal (front half readable, back half mirrored + dimmer). */
export const bandFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uRepeat;
  uniform float uOffset;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vN;
  varying vec3 vV;
  varying vec2 vUv;
  varying vec3 vW;
  void main() {
    vec2 uv = vUv;
    bool back = !gl_FrontFacing;
    if (back) uv.x = 1.0 - uv.x;
    float a = texture2D(uMap, vec2(fract(uv.x * uRepeat + uOffset), uv.y)).a;
    float facing = abs(dot(normalize(vN), normalize(vV)));
    float k = back ? 0.22 : 1.0;
    gl_FragColor = vec4(uColor * a * k * (0.35 + facing * 0.65) * uIntensity, 1.0);
  }
`;
