import {vec3} from "gl-matrix";

export enum BlockType  {
  'CUBE' = 1, //standard cube
  'PYRAMID' = 2, //a pyramid
  'TENT' = 3, //tent
  'TRI_TUBE' = 4,
  'QUARTER_PYRAMID' = 5,
  'QUARTER_ROUND' = 10//standard quarter round
};



export class Block {
  blockType: BlockType;
  pos: vec3;
  footprint: vec3;
  adjustScaleTop: number;
  adjustScaleBottom: number;
  rotation: number;
}