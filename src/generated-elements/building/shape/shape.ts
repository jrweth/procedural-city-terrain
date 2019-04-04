import {vec2, vec3} from "gl-matrix";
import {Block} from "./block";
import Random from "../../../noise/random";
import {Axis} from "../../../geometry/Axis";

export class NumOptions {
  value?: number;
  percentage?: number;
  seed?: number;

  static getValue(options: NumOptions, maxValue?: number, minValue?: number) {
    if(options.value) return options.value;
    if(options.percentage) return maxValue * options.percentage;

    if(!minValue) minValue = 0;
    let rand = Random.random1to1(1, vec2.fromValues(options.seed, 4.2343 ));
    return minValue + (maxValue - minValue) * rand;
  }
}


export abstract class Shape {
  pos: vec3;
  footprint: vec3;
  rotation: number;
  symbol: string;
  terminal: boolean;
  children: number[] = [];

  protected constructor(options: {
    pos: vec3,
    footprint: vec3,
    rotation: number
  }) {
    this.pos= options.pos;
    this.footprint = options.footprint;
    this.rotation = options.rotation;
  }

  abstract runReplacement(seed: number): Shape[];

  abstract getBlocks(): Block[];



  /**
   * Shrink shape from the center inward
   * @param axis
   * @param options
   */
  shrink(axis: Axis, shrinkBy: NumOptions): void {
    let shrinkage = NumOptions.getValue(shrinkBy, this.footprint[axis]);

    this.pos[axis] += shrinkage / 2;
    this.footprint[axis] -= shrinkage;

  }

  shrinkX(shrinkBy: NumOptions): void {
    this.shrink(0, shrinkBy);
  }

  shrinkZ(shrinkBy: NumOptions): void {
    this.shrink(2, shrinkBy);
  }

  shrinkBoth(shrinkBy: NumOptions): void {
    this.shrinkX(shrinkBy);
    this.shrinkZ(shrinkBy);
  }

  reduce(axis: Axis, reduceBy: NumOptions): void {

  }
}