#version 300 es
precision highp float;

uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane
uniform vec4 u_DisplayOptions;

in vec3 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col; //fs_Col.x = length, fs_Col.y = width
in vec4 fs_Translate;

//in float fs_Sine;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

float MAP_THEME = 1.0;
float DAZZLE_THEME = 2.0;


vec2 random2( vec2 p , vec2 seed) {
    return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

/*
Determine worley noise for given position and grid size
- param vec2 pos :      the position to test for
- param vec2 gridSize:  the size of the grid
- param vec2 seed:       the random seed
- return vec2:          the location of the closest worley point
*/
vec2 getClosestWorleyPoint2d(vec2 pos, vec2 gridSize, vec2 seed) {
    vec2 centerGridPos = pos - mod(pos, gridSize);  //the corner of the grid in which this point resides
    vec2 closestWorleyPoint = vec2(1.0, 1.0);
    float closestDistance = (gridSize.x + gridSize.y) * 2.0;

    vec2 currentGridPos;
    vec2 currentWorleyPoint;
    float currentDistance;
    //loop through the 9 grid sections surrouding this one to find the closes worley point
    for(float gridX = -1.0; gridX <= 1.0; gridX += 1.0) {
        for(float gridY = -1.0; gridY <= 1.0; gridY += 1.0) {
            currentGridPos = centerGridPos + vec2(gridX, gridY) * gridSize;
            currentWorleyPoint = currentGridPos + random2(currentGridPos, seed) * gridSize;
            currentDistance = length(currentWorleyPoint - pos);
            if(currentDistance < closestDistance) {
                closestDistance = currentDistance;
                closestWorleyPoint = currentWorleyPoint;
            }
        }
    }

    return closestWorleyPoint;
}

float getWorleyNoise2d(vec2 pos, vec2 gridSize, vec2 seed) {
    vec2 wPoint = getClosestWorleyPoint2d(pos, gridSize, seed);
    return length(wPoint - pos) / length(gridSize);
}


vec3 getMapThemeColor() {
    //stripes in the road
    if(abs(fs_Pos.z) < 0.1) {
        return vec3(1.0, 1.0, 0.0);
    }

    return vec3(1.0, 0.0, 0.0);

}
vec3 getDazzleThemeColor() {
    vec3 roadColor = vec3(0.301, 0.274, 0.219);
    vec3 stripeColor = vec3(1.0, 1.0, 1.0);

    //stripes in the highway
    if(abs(fs_Pos.z) < 0.05 && fs_Col.y >= 0.5) {
       return stripeColor;
    }
    //dashes on the streets
    if(
      abs(fs_Pos.z) < 0.05
      && fs_Col.y < 0.5
      && floor(mod(fs_Pos.x * 8.0, 2.0)) == 0.0
    ) {
        return stripeColor;
    }

    //add worley noise to the road
    vec2 pos = fs_Pos.xz * 500.0;
    vec2 seed = vec2(1.23,2.32);
    vec2 gridSize = vec2(1.0, 1.0); //size of our road
    float wNoise = getWorleyNoise2d(pos, gridSize, seed);
    roadColor = mix(roadColor, vec3(0.0, 0.0, 0.0), pow(wNoise,2.0));


    return roadColor;

}
vec3 getDazzleThemeBackground() {
    return vec3(0.0, 0.0, 0.0);
}
vec3 getMapThemeBackground() {
    return vec3(164.0 / 255.0, 233.0 / 255.0, 1.0);
}

void main()
{

    vec3 roadColor = vec3(0.0, 0.0, 0.0);
    vec3 backgroundColor = vec3(0,0,0);

    if(u_DisplayOptions[2] == MAP_THEME) {
        roadColor = getMapThemeColor();
        backgroundColor = getMapThemeBackground();
    }
    else if(u_DisplayOptions[2] == DAZZLE_THEME) {
        roadColor = getDazzleThemeColor();
        backgroundColor = getDazzleThemeBackground();
    }

    float t = clamp(smoothstep(40.0, 50.0, length(fs_Translate.xz)), 0.0, 1.0); // Distance fog
    out_Col = vec4(mix(roadColor, backgroundColor, t), 1.0);
}
