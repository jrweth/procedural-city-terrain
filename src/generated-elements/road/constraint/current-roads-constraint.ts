import Roads from "../roads";
import {Segment} from "../lsystem";
import {vec2} from "gl-matrix";
import {RoadType} from "../turtle";
import {Constraint, ConstraintAdjustment} from "./constraint";
import {Terrain} from "../../terrain";
import {VecMath} from "../../../utils/vec-math";

export class CurrentRoadsConstraint implements Constraint {
  terrain: Terrain;
  roads: Roads;
  constructor(options: {terrain: Terrain, roads: Roads}) {
    this.terrain = options.terrain;
    this.roads = options.roads;
  }

  checkConstraint(segment: Segment, endPos: vec2): boolean {

    let nearestSegmentId = this.getNearestSegmentId(segment, endPos);
    if(nearestSegmentId !== null && segment.roadType == RoadType.STREET) {
      return false;
    }

    return true;
  }

  attemptAdjustment(segment: Segment, endPos: vec2): ConstraintAdjustment {
    let adj = new ConstraintAdjustment();
    adj.added = false;
    adj.intersected = false;

    let nearestSegmentId = this.getNearestSegmentId(segment, endPos);

    if(nearestSegmentId !== null){
      //get the segment
      segment.endIntersectionId = this.getNearestSegmentIntersectionId(endPos, nearestSegmentId);
      segment.rotation = VecMath.getRotationFromPoints(
        this.roads.intersections[segment.startIntersectionId].pos,
        this.roads.intersections[segment.endIntersectionId].pos
      );
      adj.added = true;
      adj.intersected = true;
      // console.log('adjusted');
    }

    return adj;
  }

  getNearestSegmentId(segment: Segment, endPos: vec2) {
    let threshold = this.terrain.highwaySegmentLength / 3;
    if(segment.roadType == RoadType.STREET) threshold = this.terrain.streetSegmentLength / 3;

    return this.roads.findNearestSegment(endPos, threshold);

  }

  getNearestSegmentIntersectionId(pos: vec2, segmentId: number) {
    let start = this.roads.intersections[this.roads.segments[segmentId].startIntersectionId];
    let end = this.roads.intersections[this.roads.segments[segmentId].endIntersectionId];

    if(vec2.dist(start.pos, pos) < vec2.dist(end.pos, pos)) {
      return this.roads.segments[segmentId].startIntersectionId;
    }
    else {
      return this.roads.segments[segmentId].endIntersectionId;
    }

  }



}