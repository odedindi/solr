/**
 * Shared shader code for 3D planet rendering.
 * Deduplicated from planet-3d.tsx and planet-comparison.tsx.
 */

// ---------------------------------------------------------------------------
// Improved Multi-Layer Atmosphere Shader
// ---------------------------------------------------------------------------
export const AtmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const AtmosphereFragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform vec3 uSunDirection;
  uniform float uFalloff;
  uniform float uDensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    float outerGlow = pow(rim, uFalloff) * uIntensity;
    float innerGlow = pow(rim, uFalloff * 0.4) * uDensity * 0.3;
    float glow = outerGlow + innerGlow;
    vec3 scatter = mix(uColor, uColor * vec3(0.6, 0.8, 1.2), pow(rim, 2.0));
    float sunDot = max(dot(vNormal, uSunDirection), 0.0);
    float limbBright = smoothstep(-0.1, 0.5, sunDot);
    float backScatter = 0.15 + 0.85 * limbBright;
    gl_FragColor = vec4(scatter, glow * backScatter);
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
