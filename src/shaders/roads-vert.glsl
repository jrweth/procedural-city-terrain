#version 300 es


uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;
uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;
in vec4 vs_Translate;

out vec3 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

void main()
{
    fs_Pos = vs_Pos.xyz;
    vec4 modelposition = vec4(vs_Pos.x, vs_Pos.y, vs_Pos.z, 1.0);
   //scale by width and height
    modelposition.x = modelposition.x * vs_Col.x; //vs_Col.x = length
    modelposition.y = modelposition.y * vs_Col.y; //vs_Col.y = width;

    //fs_Pos.y = vs_Pos.y * vs_Col.y;

    //rotate
    float s = sin(vs_Col.z);
    float c = cos(vs_Col.z);
    modelposition.xz = mat2(c, s, -s, c) * modelposition.xz;

    //translate
    modelposition.xyz += vs_Translate.xyz;

    modelposition = u_Model * modelposition;
    gl_Position = u_ViewProj * modelposition;
}
