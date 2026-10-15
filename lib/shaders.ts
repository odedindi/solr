/**
 * Shared shader code for 3D planet rendering.
 * Deduplicated from planet-3d.tsx and planet-comparison.tsx.
 */

// ---------------------------------------------------------------------------
// Atmosphere Shader — Fresnel limb glow with sun-side forward scattering.
// Renders on a BackSide sphere slightly larger than the planet.
// All vectors are in world space for stable lighting.
// ---------------------------------------------------------------------------
export const AtmosphereVertexShader = `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
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
  uniform float uDensity;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    // Fresnel rim: bright at the limb, soft towards the centre.
    float fres = 1.0 - max(dot(viewDir, vWorldNormal), 0.0);
    float rim = pow(fres, uFalloff);

    // Sun-side weighting: limb gets brightest where it faces the sun.
    float sunDot = dot(vWorldNormal, normalize(uSunDirection));
    float dayWeight = smoothstep(-0.35, 0.4, sunDot);

    // Forward scattering: halo around the sun (Mie-like) seen from the camera.
    float vDotS = max(dot(viewDir, normalize(uSunDirection)), 0.0);
    float forward = pow(vDotS, 8.0) * 0.6 * dayWeight;

    // Color shift towards a slightly warmer tint near the terminator.
    vec3 limbColor = mix(uColor * 0.5, uColor, dayWeight);
    vec3 scatter = limbColor + uColor * forward;

    float alpha = clamp(rim * uIntensity * (0.25 + 0.9 * dayWeight) + forward * 0.4, 0.0, 1.0);
    // Subtle inner haze to avoid a hard edge against the planet silhouette.
    alpha *= mix(0.6, 1.0, uDensity);

    gl_FragColor = vec4(scatter, alpha);
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
