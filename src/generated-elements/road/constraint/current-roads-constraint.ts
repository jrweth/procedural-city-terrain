import Roads from "../roads";
import {Segment} from "../lsystem";
import {vec2} from "gl-matrix";
import {RoadType} from "../turtle";
import {Constraint, ConstraintAdjustment} from "./constraint";
import {Terrain} from "../../terrain";
import {VecMath} from "../../../utils/vec-math";

export class WaterConstraint implements Constraint {
  terrain: Terrain;
  roads: Roads;
  constructor(options: {terrain: Terrain, roads: Roads}) {
    this.terrain = options.terrain;
    this.roads = options.roads;
  }

  checkConstraint(segment: Segment, endPos: vec2): boolean {

    let nearestIntersectionId = this.roads.findNearbyIntersectionId(endPos, 0.5);
    if(nearestIntersectionId !== null) {
      segment.endIntersectionId = nearestIntersectionId;
      segment.rotation = VecMath.getRotationFromPoints(
        this.roads.intersections[segment.startIntersectionId].pos,
        this.roads.intersections[nearestIntersectionId].pos
      )
      this.roads.segments.push(segment);
      this.roads.intersections[segment.startIntersectionId].segmentIds.push(segmentId);
      this.roads.intersections[nearestIntersectionId].segmentIds.push(segmentId);
    }
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