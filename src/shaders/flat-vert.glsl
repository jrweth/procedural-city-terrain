#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

in vec4 vs_Pos;

void main() {
  gl_Position = vs_Pos;
}
