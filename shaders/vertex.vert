varying vec2 vUv;
varying float vFft;

attribute float fft;

void main() {
  /*     vec4 modelPosition = modelMatrix * vec4(position, 1.0);

      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
   */
  // gl_Position = projectionMatrix * viewMatrix * modelMatrix *
  // vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vUv = uv;
  vFft = fft;
}