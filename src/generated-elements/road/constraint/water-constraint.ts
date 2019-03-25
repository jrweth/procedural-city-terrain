import Roads from "../roads";
import {Segment} from "../lsystem";
import {vec2} from "gl-matrix";
import {RoadType} from "../turtle";
import {Constraint, ConstraintAdjustment} from "./constraint";
import {Terrain} from "../../terrain";

export class WaterConstraint implements Constraint {
  terrain: Terrain;
  roads: Roads;
  constructor(options: {terrain: Terrain, roads: Roads}) {
    this.terrain = options.terrain;
    this.roads = options.roads;
  }

  checkConstraint(segment: Segment, endPos: vec2): boolean {

    if(segment.roadType == RoadType.STREET) {
      if(!this.terrain.positionOnLand(endPos)) {
        return false;
      }
    }

    if(segment.roadType == RoadType.STREET) {
      //if(segment.startIntersectionId)

    }
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