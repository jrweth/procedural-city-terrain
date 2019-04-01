import {Shape} from './shape'
import {BlockType} from './block';
import {vec3} from "gl-matrix";

export class Box extends Shape{

  constructor(options: {pos: vec3, footprint: vec3, rotation: number}) {
    super(options);
    this.symbol = 'B';
    this.terminal = false;
  }

  getBlocks() {
    return [{
      blockType: BlockType.CUBE,
      footprint: this.footprint,
      pos: this.pos,
      adjustScaleTop: 1,
      adjustScaleBottom: 1,
      rotation: this.rotation
    }];
  }

  runReplacement() {
    return [this];
  }
}