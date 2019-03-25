import {BaseDrawRule} from "./base-draw-rule";
import {DrawRule} from "./draw-rule";
import {Turtle} from "../turtle";
import {Segment} from "../lsystem";

export class TurnLeft extends BaseDrawRule implements DrawRule {
  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[], options?: string) {

    let angle: number = turtle.angle;
    if(!isNaN(parseFloat(options))) {
      angle = parseFloat(options);
    }

    turtle.dir += angle;
    return turtle;
  }
}