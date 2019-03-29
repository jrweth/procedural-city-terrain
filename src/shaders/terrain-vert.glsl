#version 300 es


uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;
uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;
in vec4 vs_Info;

out vec3 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;
out vec4 fs_Info;

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
  fs_Col = vs_Col;
  fs_Nor = vs_Nor;
  fs_Info = vs_Info;
  vec4 modelposition = vec4(vs_Pos.x, vs_Pos.y, vs_Pos.z, 1.0);
  //water
  if(vs_Pos.y < 0.4) {
     modelposition.y = 0.0;
  }
  //sand
  else if(vs_Pos.y < 0.5) {
     modelposition.y = vs_Pos.y;
  }
  //land
  else {
     modelposition.y = 0.5;
  }
  //building
  if(vs_Info.y == 1.0) {
     //modelposition.y = 4.0;
  }
  modelposition = u_Model * modelposition;
  gl_Position = u_ViewProj * modelposition;
}
