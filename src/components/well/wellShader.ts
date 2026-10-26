/**
 * Screen material for THE WELL — curved video panels on a cylinder.
 *  - readable from outside AND inside the cylinder (u is mirrored on back faces)
 *  - rounded corners (SDF in panel space, discarded → no transparency sorting)
 *  - violet rim light along the border, depth fade into the page background
 *  - far-side panels (seen through the well from outside) are dimmed and cooled
 */
export const wellVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const wellFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uPanelAspect;   // panel width / height (arc length / height)
  uniform float uMapAspect;     // video width / height
  uniform float uRadius;        // corner radius in panel-height units
  uniform float uInside;        // 0 = camera outside the well, 1 = inside
  uniform float uFogNear;
  uniform float uFogFar;
  uniform vec3 uFogColor;
  uniform vec3 uRim;
  uniform float uBoost;         // hover / velocity highlight 0..1
  uniform float uExposure;      // dim at rest (headline legibility) → full brightness inside
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vec2 uv = vUv;
    bool back = !gl_FrontFacing;
    if (back) uv.x = 1.0 - uv.x;

    // rounded-rectangle mask in panel space
    vec2 p = (uv - 0.5) * vec2(uPanelAspect, 1.0);
    vec2 b = vec2(uPanelAspect, 1.0) * 0.5 - uRadius;
    float d = length(max(abs(p) - b, 0.0)) - uRadius;
    if (d > 0.0) discard;

    // cover-fit the video into the panel
    vec2 tuv = uv;
    float r = uPanelAspect / uMapAspect;
    if (r > 1.0) tuv.y = (tuv.y - 0.5) / r + 0.5;
    else tuv.x = (tuv.x - 0.5) * r + 0.5;

    vec3 col = texture2D(uMap, tuv).rgb;
    col = pow(col, vec3(0.9)) * 1.12; // lift the mostly-dark studio footage a touch

    // subtle vignette inside each screen
    float vig = smoothstep(0.85, 0.2, length((uv - 0.5) * vec2(1.0, 1.25)));
    col *= mix(0.72, 1.0, vig);

    // rim light along the rounded border
    float rim = smoothstep(-0.035, 0.0, d);
    col += uRim * rim * (0.55 + uBoost * 0.9);

    // far side seen through the well from outside: dimmer + cooler
    float farSide = back ? (1.0 - uInside) : 0.0;
    col = mix(col, col * vec3(0.62, 0.64, 0.82), farSide * 0.8);

    col *= (1.0 + uBoost * 0.18) * uExposure;

    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    col = mix(col, uFogColor, fog);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;
