import Roads from "../roads";

import {Segment} from "../lsystem";
import {vec2} from "gl-matrix";
import {RoadType} from "../turtle";
import {Constraint, ConstraintAdjustment} from "./constraint";
import {Terrain} from "../../terrain";

export class EdgeOfMapConstraint implements Constraint {
  terrain: Terrain;
  roads: Roads;
  constructor(options: {roads: Roads}) {
    this.roads = options.roads;
  }

  checkConstraint(segment: Segment, endPos: vec2): boolean {
    let startPos: vec2 = this.roads.intersections[segment.startIntersectionId].pos;
    if(Math.abs(startPos[0]) > 1) return false;
    if(Math.abs(startPos[1]) > 1) return false;

    return true;
  }

  attemptAdjustment(segment: Segment, endPos: vec2): ConstraintAdjustment {
    let adj = new ConstraintAdjustment();
    adj.added = false;
    adj.intersected = false;{
      false
    };

    return adj;
  }

}