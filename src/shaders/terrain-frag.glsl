#version 300 es
precision highp float;

uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane
uniform vec4 u_DisplayOptions;

in vec3 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec4 fs_Info;

//in float fs_Sine;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

void main()
{
    vec3 groundColor = vec3(.0, 1, 0);

    //add population density whic is stored in last of normal
    if(u_DisplayOptions.r > 0.0) {
        groundColor = groundColor * (1.0 - fs_Nor.a*2.0);
    }
    float t = clamp(smoothstep(40.0, 50.0, length(fs_Pos)), 0.0, 1.0); // Distance fog
    //check for water
    if(fs_Pos.y <= 0.4) {
        groundColor = vec3(0.0, 0.0, 1.0);
    }
    //check for sand
    else if(fs_Pos.y < 0.43) {
        groundColor = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (0.43 - fs_Pos.y) * 33.33);
    }
    //building possibility
    if(fs_Info.x == 1.0 && u_DisplayOptions.g > 0.0) {
        groundColor = vec3(0.5, 0.5, 0.5);
    }
    //building locations
    if(fs_Info.y == 1.0) {
        groundColor = vec3(0.0, 0.0, 0.0);
    }

    out_Col = vec4(mix(groundColor, vec3(164.0 / 255.0, 233.0 / 255.0, 1.0), t), 1.0);
}
