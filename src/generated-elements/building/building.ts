import {vec2, vec3} from "gl-matrix";

export class Block {

}

export class Shape {
  symbol: string;
}

export class Building {
  pos: vec2;
  footprint: vec3;
  dir: number
  blocks: Block[][][];
  axium: 'B';

  constructor(options: {
    pos: vec2,
    footprint: vec3,
    dir: number
  }) {
    this.pos = options.pos;
    this.footprint = options.footprint;
    this.dir = options.dir;
  }



}