import {vec3} from "gl-matrix";

export enum BlockType  {
  'CUBE' = 1, //standard cube
  'QUARTER_ROUND' = 2,//standard quarter round
  'PYRAMID' = 3 //a pyramid
};



export class Block {
  blockType: BlockType;
  pos: vec3;
  footprint: vec3;
  adjustScaleTop: number;
  adjustScaleBottom: number;
  rotation: number;
}