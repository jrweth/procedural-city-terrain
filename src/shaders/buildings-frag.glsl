#version 300 es
precision highp float;

uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane
uniform vec4 u_DisplayOptions; //

in vec3 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec4 fs_Translate;

//in float fs_Sine;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

float MAP_THEME = 1.0;
float DAZZLE_THEME = 2.0;

vec3 getMapThemeColor() {
    vec3 buildingColor = vec3(0.9, 0.9, 0.9);
    if(fs_Pos.x > 0.999999) {
        buildingColor = vec3(0.0, 0.0, 0.0);
    }
    else if(fs_Pos.z < 0.0001) {
        buildingColor = vec3(0.3, 0.3, 0.3);
    }
    else if(fs_Pos.z > 0.999999) {
        buildingColor = vec3(0.6, 0.6, 0.6);
    }

    return buildingColor;
}

vec3 getDazzleThemeColor() {
    vec3 color = vec3(0.5, 0.5, 1.0);

    //highlight the edges
    float lum = 500.0 * (
        max(pow(fs_Pos.x -0.5, 4.0) * pow(fs_Pos.z - 0.5, 4.0),
        max(pow(fs_Pos.x -0.5, 4.0) * pow(fs_Pos.y - 0.5, 4.0),
        pow(fs_Pos.z -0.5, 4.0) * pow(fs_Pos.y - 0.5, 4.0)))
    );
    //lum = smoothstep(0.9999, 1.0, lum);
    color = lum * color;

    return color;
}

vec3 getDazzleThemeBackground() {
    return vec3(0.0, 0.0, 0.0);
}
vec3 getMapThemeBackground() {
    return vec3(164.0 / 255.0, 233.0 / 255.0, 1.0);
}

void main()
{
    vec3 buildingColor = vec3(0,0,0);
    vec3 backgroundColor = vec3(0,0,0);

    if(u_DisplayOptions[2] == MAP_THEME) {
        buildingColor = getMapThemeColor();
        backgroundColor = getMapThemeBackground();
    }
    else if(u_DisplayOptions[2] == DAZZLE_THEME) {
        buildingColor = getDazzleThemeColor();
        backgroundColor = getDazzleThemeBackground();
    }


    float t = clamp(smoothstep(40.0, 50.0, length(fs_Translate.xz)), 0.0, 1.0); // Distance fog
    out_Col = vec4(mix(buildingColor, backgroundColor, t), 1.0);
}
