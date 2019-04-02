import {Shape} from './shape'
import {BlockType} from './block';
import {vec3} from "gl-matrix";

export class Pyramid extends Shape{

  constructor(options: {pos: vec3, footprint: vec3, rotation: number}) {
    super(options);
    this.symbol = 'P';
    this.terminal = true;
  }

  getBlocks() {
    return [{
      blockType: BlockType.PYRAMID,
      footprint: this.footprint,
      pos: this.pos,
      adjustScaleTop: 0,
      adjustScaleBottom: 1,
      rotation: this.rotation
    }];
  }

  runReplacement() {
    return [this];
  }
}