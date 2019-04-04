import {Shape} from './shape'
import {BlockType} from './block';
import {vec3} from "gl-matrix";

export class StandardRoof extends Shape{

  blockType: BlockType;

  constructor(options: {pos: vec3, footprint: vec3, rotation: number, blockType: BlockType}) {
    super(options);
    this.symbol = 'T';
    this.terminal = true;
    this.blockType = options.blockType;
  }

  getBlocks() {
    return [{
      blockType: this.blockType,
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