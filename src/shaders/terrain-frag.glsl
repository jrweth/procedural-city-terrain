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
const float MAP_THEME = 1.0;
const float DAZZLE_THEME = 2.0;

const int WATER = 0;
const int LAND = 1;
const int COAST = 2;


int getTerrainType() {
    //check for water
    if(fs_Pos.y <= 0.4) {
        return WATER;
    }
    //check for sand
    else if(fs_Pos.y < 0.43) {
        return COAST;
    }
    return LAND;
}

vec3 getMapThemeBackground() {
    return vec3(164.0 / 255.0, 233.0 / 255.0, 1.0);
}

vec3 getMapThemeColor() {
    vec3 groundColor = vec3(.0, 1, 0);
    int type = getTerrainType();
    //add population density whic is stored in last of normal
    if(u_DisplayOptions.r > 0.0) {
        groundColor = groundColor * (1.0 - fs_Nor.a*2.0);
    }

    //check for water
    if(type == WATER) {
        groundColor = vec3(0.0, 0.0, 1.0);
    }
    //check for sand
    else if(type == COAST) {
        groundColor = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (0.43 - fs_Pos.y) * 33.33);
    }
    else if(type == LAND) {
        groundColor = vec3(.0, 1, 0);
    }


    //building possibility
    if(fs_Info.x == 1.0 && u_DisplayOptions.g > 0.0) {
        groundColor = vec3(0.5, 0.5, 0.5);
    }
    //building locations
    if(fs_Info.y == 1.0) {
        groundColor = vec3(0.0, 0.0, 0.0);
    }

    return groundColor;
}

vec3 getDazzleThemeColor() {
    int type = getTerrainType();
    if(type == WATER) {
        return vec3(0.0, 0.0, 0.1);
    }
    if(type == COAST) {
        return vec3(0.0, 0.1, 0.1);
    }
    if(type == LAND) {
        return vec3(0.0, 0.1, 0.0);

    }

    return vec3(1.0, 1.0, 1.0);

}

vec3 getDazzleThemeBackground() {
    return vec3(0.0, 0.0, 0.0);
}
void main()
{
    vec3 groundColor = vec3(.0, 1, 0);
    vec3 backgroundColor = vec3(1.0, 1.0, 1.0);
    if(u_DisplayOptions[2] == MAP_THEME) {
        groundColor = getMapThemeColor();
        backgroundColor = getMapThemeBackground();
    }
    else if(u_DisplayOptions[2] == DAZZLE_THEME) {
        groundColor = getDazzleThemeColor();
        backgroundColor = getDazzleThemeBackground();
    }



    float t = clamp(smoothstep(40.0, 50.0, length(fs_Pos)), 0.0, 1.0); // Distance fog

    out_Col = vec4(mix(groundColor, backgroundColor, t), 1.0);
}
