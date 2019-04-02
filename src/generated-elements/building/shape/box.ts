import {Shape} from './shape'
import {BlockType} from './block';
import {vec3} from "gl-matrix";
import {Pyramid} from "./pyramid";
import Random from "../../../noise/random";

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

  runReplacement(seed: number): Shape[] {
    let type = Random.randomInt(2, seed);
    console.log(type);
    switch(type) {
      case 0: return this.addPyramidRoof(seed);
      case 1: return this.splitX(seed);
      case 2: return this.splitY(seed);
      case 3: return this.splitZ(seed);
    }
  }

  addPyramidRoof(seed: number): Shape[] {
    let height = 2;
    let pyramid = new Pyramid({
      pos: vec3.fromValues(this.pos[0], this.pos[1] + height * 3, this.pos[2]),
      footprint: vec3.fromValues(this.footprint[0], height, this.footprint[2]),
      rotation: this.rotation
    });
    this.footprint[1] = height * 3;
    this.terminal = true;
    return [this, pyramid];
  }

  splitX(seed: number): Shape[] { return this.split(0, seed); }
  splitY(seed: number): Shape[] { return this.split(1, seed); }
  splitZ(seed: number): Shape[] { return this.split(2, seed); }



  split(axis: number, seed: number) {
    //too small to spit vertically
    if(this.footprint[axis] < 2){
      return[this];
    }

    let size = Random.randomInt(this.footprint[axis] - 1, seed);
    let newPos = vec3.fromValues(this.pos[0], this.pos[1], this.pos[2]);
    newPos[axis] = newPos[axis] + this.footprint[axis]/2 - (this.footprint[axis] - size) / 2;

    let newFootprint = vec3.fromValues(this.footprint[0], this.footprint[1], this.footprint[2]);
    newFootprint[axis] = newFootprint[axis] - size;

    let newBox = new Box({
      pos: newPos,
      footprint: newFootprint,
      rotation: this.rotation
    });
    this.footprint[axis] = size;

    //no more changes if we are supporting something on top
    if(axis == 1) this.terminal = true;


    return[this, newBox];
  }
}

