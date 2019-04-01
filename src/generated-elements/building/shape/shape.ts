import {vec3} from "gl-matrix";
import {Block} from "./block";

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

  abstract runReplacement(): Shape[];

  abstract getBlocks(): Block[];


}