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

const float WATER_LINE = 0.4;
const float COAST_LINE = 0.43;

const int WATER = 0;
const int LAND = 1;
const int COAST = 2;


float random1( vec2 p , vec2 seed) {
    return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
    return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
    return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

float interpNoiseRandom2to1(vec2 p, vec2 seed) {
    float fractX = fract(p.x);
    float x1 = floor(p.x);
    float x2 = x1 + 1.0;

    float fractY = fract(p.y);
    float y1 = floor(p.y);
    float y2 = y1 + 1.0;

    float v1 = random1(vec2(x1, y1), seed);
    float v2 = random1(vec2(x2, y1), seed);
    float v3 = random1(vec2(x1, y2), seed);
    float v4 = random1(vec2(x2, y2), seed);

    float i1 = mix(v1, v2, fractX);
    float i2 = mix(v3, v4, fractX);

    //    return smoothstep(i1, i2, fractY);
    return mix(i1, i2, fractY);

}

float fbm2to1(vec2 p, vec2 seed) {
    float total  = 0.0;
    float persistence = 0.5;
    float octaves = 8.0;

    for(float i = 0.0; i < octaves; i++) {
        float freq = pow(2.0, i);
        float amp = pow(persistence, i+1.0);
        total = total + interpNoiseRandom2to1(p * freq, seed) * amp;
    }
    return total;
}



int getTerrainType() {
    //check for water
    if(fs_Pos.y <= WATER_LINE) {
        return WATER;
    }
    //check for sand
    else if(fs_Pos.y < COAST_LINE) {
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


    //check for water
    if(type == WATER) {
        groundColor = vec3(0.0, 0.0, 1.0);
    }
    //check for sand
    else if(type == COAST) {
        groundColor = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (COAST_LINE - fs_Pos.y) * 33.33);
    }
    else if(type == LAND) {
        groundColor = vec3(.0, 1, 0);
        if(u_DisplayOptions.r > 0.0) {
            groundColor = groundColor * (1.0 - fs_Nor.a*2.0);
        }
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
    vec3 groundColor;
    if(type == WATER) {
        vec3 waterColor = vec3(0.0, 0.0, 0.2);
        vec3 highlightColor = vec3(0.3, 0.3, 0.8);

        float fbm = fbm2to1(fs_Pos.xz* 5.0, vec2(4.4343, 4.343));
        groundColor = waterColor * fbm;
        float hBreak = 0.70;
        if(fbm > hBreak) {
            //groundColor = highlightColor;
            groundColor = mix(waterColor * fbm, highlightColor, (fbm - hBreak) / (1.0 - hBreak));//);
        }
    }
    if(type == COAST) {
       groundColor = mix(vec3(0.0, 0.3, 0.2), vec3(0.1, 0.1, 0.0), (COAST_LINE - fs_Pos.y) * 33.33);
    }
    if(type == LAND) {
        groundColor = mix(vec3(0.0, 0.3, 0.2), vec3(0.7, 0.7, 1.0), (fs_Pos.y - COAST_LINE) / COAST_LINE);

    }
    if(u_DisplayOptions.r > 0.0) {
        groundColor = groundColor * (1.0 + pow(fs_Nor.a*2.0, 2.0));
    }

    return groundColor;

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
