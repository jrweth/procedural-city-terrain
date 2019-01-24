#version 300 es
precision highp float;

// The fragment shader used to render the background of the scene
// Modify this to make your background more interesting

out vec4 out_Col;

void main() {
  out_Col = vec4(164.0 / 255.0, 233.0 / 255.0, 1.0, 1.0);
}
