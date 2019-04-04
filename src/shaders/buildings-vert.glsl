#version 300 es


uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;
uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;
in vec4 vs_Translate;
in vec4 vs_BlockInfo;

out vec3 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;
out vec4 fs_Translate;

const float CUBE = 1.0;
const float PYRAMID = 2.0;
const float TENT = 3.0;
const float TRI_TUBE = 4.0;
const float QUARTER_PYRAMID = 5.0;
const float SLANT = 6.0;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}


float getVertexNum() {
   if(vs_BlockInfo.x < 10.0 ) {
       return vs_Pos.x + vs_Pos.z * 2.0 + vs_Pos.y * 4.0;
   }

   return 0.0;
}

vec3 getCubeVertexPosition() {
    float vertexNum = getVertexNum();
    //scale bottom toward middle
    if(vertexNum < 4.0) {
        return mix(vec3(0.5, 0.0, 0.5), vs_Pos.xyz, vs_BlockInfo[2]);
    }
    //scale top toward middle
    else {
        return mix(vec3(0.5, 1.0, 0.5), vs_Pos.xyz, vs_BlockInfo[3]);
    }
}

vec3 getSlantVertexPosition() {
    float vertexNum = getVertexNum();
    //scale bottom toward middle
    if(vertexNum == 0.0 || vertexNum == 2.0 || vertexNum == 4.0 || vertexNum == 6.0) {
        return vs_Pos.xyz;
    }
    //scale top toward middle
    else if(vertexNum == 1.0 || vertexNum == 3.0) {
        return mix(vec3(0.0, 0.0, vs_Pos.z), vs_Pos.xyz, vs_BlockInfo[2]);
    }
    else {
        return mix(vec3(0.0, 1.0, vs_Pos.z), vs_Pos.xyz, vs_BlockInfo[3]);
    }
}

vec3 getTentVertexPosition() {
    float vertexNum = getVertexNum();
    //scale bottom toward middle
    if(vertexNum < 4.0) {
        return mix(vec3(0.5, 0.0, 0.5), vs_Pos.xyz, vs_BlockInfo[2]);
    }
    //scale top toward middle
    else {
        return mix(vec3(0.5, vs_Pos[1], vs_Pos[2]), vs_Pos.xyz, vs_BlockInfo[3]);
    }
}

vec3 getTriTubeVertexPosition() {
    float vertexNum = getVertexNum();
    //scale bottom toward middle
    if(vertexNum < 3.0) {
        return mix(vec3(0.0, 0.0, 0.0), vs_Pos.xyz, vs_BlockInfo[2]);
    }
    else if(vertexNum == 3.0) {
        return mix(vec3(0.0, 0.0, 0.0), vec3(0.5, 0.0, 0.5), vs_BlockInfo[2]);
    }
    else if(vertexNum < 7.0) {
        return mix(vec3(0.0, 1.0, 0.0), vs_Pos.xyz, vs_BlockInfo[3]);
    }
    else { //vertex num = 7
        return mix(vec3(0.0, 1.0, 0.0), vec3(0.5, 1.0, 0.5), vs_BlockInfo[3]);
    }
}

vec3 getQuarterPyramidVertexPosition() {
    float vertexNum = getVertexNum();
    //scale bottom toward middle
    if(vertexNum < 4.0) {
        return mix(vec3(0.0, 0.0, 0.0), vs_Pos.xyz, vs_BlockInfo[2]);
    }
    else if(vertexNum < 7.0) {
        return mix(vec3(0.0, 1.0, 0.0), vs_Pos.xyz, vs_BlockInfo[3]);
    }
    else {
        return mix(vec3(0.0, 1.0, 0.0), vec3(0.5, 1.0, 0.5), vs_BlockInfo[3]);
    }
}


vec3 getVertexPosition() {
    if(vs_BlockInfo[0] == CUBE
      || vs_BlockInfo[0] == PYRAMID
    ) {
        return getCubeVertexPosition();
    }
    else if (vs_BlockInfo[0] == TENT) return getTentVertexPosition();
    else if (vs_BlockInfo[0] == TRI_TUBE) return getTriTubeVertexPosition();
    else if (vs_BlockInfo[0] == QUARTER_PYRAMID) return getQuarterPyramidVertexPosition();
    else if (vs_BlockInfo[0] == SLANT) return getSlantVertexPosition();
    return vs_Pos.xyz;
}


void main()
{
    fs_Pos = vs_Pos.xyz;
    fs_Translate = vs_Translate;
    vec4 modelposition = vec4(getVertexPosition(), 1.0);
   //scale by width and height
    modelposition.x = modelposition.x * vs_Col.x; //vs_Col.x = length
    modelposition.y = modelposition.y * vs_Col.y; //vs_Col.x = heigth
    modelposition.z = modelposition.z * vs_Col.z; //vs_Col.y = width;

    //fs_Pos.y = vs_Pos.y * vs_Col.y;

    //rotate
    float s = sin(vs_Col.w);
    float c = cos(vs_Col.w);
    modelposition.xz = mat2(c, s, -s, c) * modelposition.xz;

    //translate
    modelposition.xyz += vs_Translate.xyz;

    modelposition = u_Model * modelposition;
    gl_Position = u_ViewProj * modelposition;
}
