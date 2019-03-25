import {Turtle} from "../turtle";
import {Segment} from "../lsystem";

export interface DrawRule {

  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[], options?: string): Turtle;

}