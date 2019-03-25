import {LSystem, Segment} from "../lsystem";
import {RoadType} from "../turtle";
import {vec2} from "gl-matrix";
import Roads from "../roads";


export class ConstraintAdjustment {
  added: boolean;
  intersected: boolean;
  segment: Segment;
}

export interface Constraint {
  checkConstraint(segment: Segment, endPosition: vec2): boolean;
  attemptAdjustment(segment: Segment, endPosition: vec2): ConstraintAdjustment;
}


