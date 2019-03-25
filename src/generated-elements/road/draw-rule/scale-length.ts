import {BaseDrawRule} from "./base-draw-rule";
import {DrawRule} from "./draw-rule";
import {Turtle} from "../turtle";
import {Segment} from "../lsystem";

export class ScaleLength extends BaseDrawRule implements DrawRule {
  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[], options?: string) {
    let scale: number = turtle.lengthScale;
    if(!isNaN(parseFloat(options))) {
      scale = parseFloat(options);
    }

    turtle.segmentLength *= scale;

    return turtle;
  }
}