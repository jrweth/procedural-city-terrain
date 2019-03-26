#version 300 es
precision highp float;

uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane

in vec3 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec4 fs_Translate;

//in float fs_Sine;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

void main()
{

    vec3 roadColor = vec3(1.0, 0.0, 0.0);

    float t = clamp(smoothstep(40.0, 50.0, length(fs_Translate.xz)), 0.0, 1.0); // Distance fog
    out_Col = vec4(mix(roadColor, vec3(164.0 / 255.0, 233.0 / 255.0, 1.0), t), 1.0);
}
