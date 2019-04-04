import {XRule} from 'x-rule/x-rule';
import {RoadType, Turtle} from './turtle';
import {vec2} from "gl-matrix";
import {Constraint, ConstraintAdjustment} from "./constraint/constraint";
import {TurnRight} from "./draw-rule/turn-right";
import {TurnLeft} from "./draw-rule/turn-left";
import {RandomAngle} from "./draw-rule/random-angle";
import {ScaleLength} from "./draw-rule/scale-length";
import {ScaleAngle} from "./draw-rule/scale-angle";
import {EndBranch} from "./draw-rule/end-branch";
import {DrawRule} from "./draw-rule/draw-rule";
import {Draw} from "./draw-rule/draw";
import {VecMath} from "../../utils/vec-math";

export enum SegmentStatus {
  OPEN = "open",
  CLOSED = "closed"
}

export class Segment{
  roadType: RoadType;
  startIntersectionId: number;
  endIntersectionId: number;
  rotation: number;
}

export class Intersection {
  segmentIds: number[];
  pos: vec2;
}

export class LSystem {
  //the axiom to start with
  axiom: string;

  //the segments already created
  segments: Segment[] = [];

  intersections: Intersection[] = [];

  //the constraints to check for each prospective segment
  constraints: Constraint[] = [];

  //the current number of interations
  curIteration: number;

  //the set of expansion rules
  xRules : Map<string, XRule> = new Map();

  //the set of drawing rules
  drawRules : Map<string, DrawRule> = new Map();

  //any options that can be sent into the lsystem
  options: any;

  //the current state of the turtle
  turtle: Turtle = new Turtle();

  //the turtle stack
  turtleStack: Turtle[] = [];

  curString: string;

  //initialize with the options
  constructor(options: any) {
    this.options = options;
    this.curIteration = 0;


  }

  //add an expansion rule
  addXRule(char: string, rule: XRule) {
    this.xRules.set(char, rule);
  }

  addDrawRule(char: string, rule: DrawRule) {
    this.drawRules.set(char, rule);
  }

  //do one iteration over the string
  iterate(iterations: number): void {
    let nextString:string = '';
    let params: any ={iterations: iterations};
    for(let charIndex:number = 0; charIndex < this.curString.length; charIndex++) {
      let char = this.curString.charAt(charIndex);
      let func = this.xRules.get(char);
      //if rule is found then use
      if(func) {
        //special case for handling drawing
        nextString += func.apply(char, params);
      }
      //if no rule found then just retain the same character
      else {
        nextString += char;
      }
    }
    this.curString = nextString;

    this.curIteration++;
  }

  runExpansionIterations(iterations: number) {
    this.curString = this.axiom;
    for(let i:number = 0; i < iterations; i++) {
      this.iterate(i);
    }
  }


  addSegment(startIntersectionId: number, endPos: vec2, rotation: number, roadType: RoadType): ConstraintAdjustment {
    //create possible segment
    let segment: Segment = new Segment();
    let segmentId = this.segments.length;
    segment.startIntersectionId = startIntersectionId;
    segment.roadType = roadType;
    segment.rotation = rotation;
    segment.endIntersectionId = this.intersections.length;

    //do the checks
    for(let i = 0; i < this.constraints.length; i++) {
      //check if constraint fails
      if(!this.constraints[i].checkConstraint(segment, endPos)) {
        //try to adjust it
        let adj: ConstraintAdjustment = this.constraints[i].attemptAdjustment(segment, endPos);

        if(!adj.added) return adj;
      }
    }

    //add the end segment if we still need to
    if(segment.endIntersectionId == this.intersections.length) {
      let endIntersection = new Intersection();
      endIntersection.pos = endPos;
      endIntersection.segmentIds = [segmentId];

      this.addIntersection(endIntersection);
    }

    this.intersections[startIntersectionId].segmentIds.push(this.segments.length);
    this.segments.push(segment);

    return {
      added: true,
      intersected: false,
      segment: segment
    };
  }

  addIntersection(intersection: Intersection) {
    this.intersections.push(intersection);
  }

  findNearbyIntersectionId(pos: vec2, distThreshold: number): number | null {
    let closestDist: number = distThreshold;
    let closestId: number | null = null;
    for(let i = 0; i < this.intersections.length; i++) {
      let dist = vec2.dist(pos, this.intersections[i].pos);
      if(dist < closestDist) {
        closestDist = dist;
        closestId = i;
      }
    }
    return closestId;
  }


  setStartPosition() {
    //add the first intersection
    let firstIntersection: Intersection = new Intersection();
    firstIntersection.segmentIds = [];
    firstIntersection.pos = vec2.fromValues(0,0);
    this.addIntersection(firstIntersection);
    this.turtle.lastIntersectionId = 0;
  }

  runDrawRules() {
    if(this.intersections.length == 0) this.setStartPosition();

    //do the initial scaling
    for(let charIndex:number = 0; charIndex < this.curString.length; charIndex++) {
      let char = this.curString.charAt(charIndex);
      let func = this.drawRules.get(char);
      //if rule is found then use
      if(func) {
        //check to see if we have an option string for our draw rule
        let option = '';

        //options for the symbol are encloesed in () -- if they exist get the option
        if(this.curString.charAt(charIndex + 1) == '(') {
          charIndex += 2;
          while(this.curString.charAt(charIndex) !== ')') {
            option += this.curString.charAt(charIndex);
            charIndex++
          }
        }

        if(
          this.turtle.roadType == RoadType.HIGHWAY
          || this.turtle.branchEnded == false
          || char == ']')
        {
          this.turtle = func.draw(this.turtle, this.turtleStack, this.segments, option);
        }

      }
    }
  }



  /**
   * Add the standard rules based off Houdini codes
   */
  addStandardDrawRules(): void {
    this.addDrawRule('F', new Draw({lsystem: this, seed: 2}));
    this.addDrawRule('+', new TurnRight());
    this.addDrawRule('-', new TurnLeft());
    this.addDrawRule(']', new EndBranch());
    this.addDrawRule('~', new RandomAngle({seed: 1}));
    this.addDrawRule('"', new ScaleLength());
    this.addDrawRule(";", new ScaleAngle());
  }


}