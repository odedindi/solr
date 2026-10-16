/**
 * Shared shader code for 3D planet rendering.
 * Deduplicated from planet-3d.tsx and planet-comparison.tsx.
 */

// ---------------------------------------------------------------------------
// Atmosphere Shader — limb glow rendered on a BackSide shell around the planet.
// For each pixel the view ray's closest approach to the planet centre gives
// the altitude it grazes at: glow is strongest just above the surface and
// fades to zero at the shell edge, so there is never a hard outer ring.
// The lit/night weighting uses the grazing point, in world space.
// ---------------------------------------------------------------------------
export const AtmosphereVertexShader = `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const AtmosphereFragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform vec3 uSunDirection;
  uniform float uFalloff;
  uniform vec3 uCenter;
  uniform float uPlanetRadius;
  uniform float uShellRadius;
  varying vec3 vWorldPos;
  void main() {
    vec3 rayDir = normalize(vWorldPos - cameraPosition);
    vec3 toCenter = uCenter - vWorldPos;
    vec3 closest = vWorldPos + rayDir * dot(toCenter, rayDir);
    vec3 offset = closest - uCenter;
    float impact = length(offset);

    // 0 at the surface, 1 at the shell edge.
    float h = clamp((impact - uPlanetRadius) / max(uShellRadius - uPlanetRadius, 1e-4), 0.0, 1.0);
    float glow = pow(1.0 - h, uFalloff) * (1.0 - smoothstep(0.85, 1.0, h));

    vec3 up = impact > 1e-4 ? offset / impact : vec3(0.0, 1.0, 0.0);
    float sunDot = dot(up, normalize(uSunDirection));
    float day = smoothstep(-0.25, 0.35, sunDot);
    // Light scattered towards the viewer when looking through the limb at the sun.
    float forward = pow(max(dot(rayDir, normalize(uSunDirection)), 0.0), 6.0);

    vec3 color = mix(uColor * 0.6, uColor, day) + uColor * forward * 0.5;
    float alpha = glow * uIntensity * (0.06 + day + forward * 0.6);
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

// ---------------------------------------------------------------------------
// Atmosphere haze — front-facing shell hugging the surface that brightens the
// day-side limb, so the atmosphere is visible over the disc and not only
// outside it.
// ---------------------------------------------------------------------------
export const AtmosphereHazeVertexShader = `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const AtmosphereHazeFragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform vec3 uSunDirection;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 n = normalize(vWorldNormal);
    vec3 v = normalize(cameraPosition - vWorldPos);
    float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    float day = smoothstep(-0.15, 0.4, dot(n, normalize(uSunDirection)));
    gl_FragColor = vec4(uColor, clamp(rim * day * uIntensity, 0.0, 1.0));
  }
`;

// ---------------------------------------------------------------------------
// Night Lights Shader — only visible on the dark side
// ---------------------------------------------------------------------------
export const NightLightsVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const NightLightsFragmentShader = `
  uniform sampler2D uNightMap;
  uniform float uIntensity;
  uniform vec3 uSunDirection;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  void main() {
    vec4 nightColor = texture2D(uNightMap, vUv);
    float sunDot = dot(vWorldNormal, uSunDirection);
    float nightFactor = smoothstep(0.1, -0.3, sunDot);
    float alpha = nightColor.r * nightFactor * uIntensity;
    gl_FragColor = vec4(nightColor.rgb * 1.5, alpha);
  }
`;
