import {BaseDrawRule} from "./base-draw-rule";
import {DrawRule} from "./draw-rule";
import {Turtle} from "../turtle";
import {Segment} from "../lsystem";
let Prando = require('prando').default;

export class RandomAngle extends BaseDrawRule implements DrawRule {
  prando: any;

  constructor(options: {seed: number}) {
    super(options);
    this.prando = new Prando(options.seed);
  }

  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[], options: string) {
    //default to the current turtle roll angle
    let maxAngle:number = turtle.angle;
    if(parseFloat(options) > 0) {
      maxAngle = parseFloat(options);
    }

    let angle: number;

    //get the roll transform
    angle= this.prando.next(0, maxAngle * 2) - maxAngle;
    turtle.dir += angle;


    return turtle;
  }
}