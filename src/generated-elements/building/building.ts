import {vec2, vec3} from "gl-matrix";
import {Shape} from "./shape/shape";
import {Box} from "./shape/box";
import {Block, BlockType} from "./shape/block";
import {Pyramid} from "./shape/pyramid";
import {Sample} from "./shape/sample";


export class Building {
  pos: vec3;
  footprint: vec3;
  rotation: number;
  shapes: Shape[];
  seed: number;


  constructor(options: {
    pos: vec3,
    footprint: vec3,
    rotation: number
  }) {
    this.pos = options.pos;
    this.footprint = options.footprint;
    this.rotation = options.rotation;
    this.shapes = [
      new Box({
        footprint: this.footprint,
        pos: this.pos,
        rotation: this.rotation
      }),
    ];
  }

  getBlocks(): Block[] {
    let blocks: Block[] = [];
    for(let i = 0; i < this.shapes.length; i++) {
      blocks = blocks.concat(this.shapes[i].getBlocks());
    }
    return blocks;
  }




}