import {Intersection, LSystem, Segment} from "./lsystem";
import {XReplace} from "./x-rule/x-replace";
import {TurnTowardPopulation} from "./draw-rule/turn-toward-population";
import {vec2} from "gl-matrix";
import {TurnAwayPopulation} from "./draw-rule/turn-away-population";
import {SpanPopulation} from "./draw-rule/span_population";
import {RoadType, Turtle} from "./turtle";
import {StartBranch} from "./draw-rule/start-branch";
import {Constraint, ConstraintAdjustment} from "./constraint/constraint";
import {WaterConstraint} from "./constraint/water-constraint";
import {EdgeOfMapConstraint} from "./constraint/edge-of-map-constraint";
import {Terrain} from "../terrain";
import {start} from "repl";
import Random from "../../noise/random";


class Roads extends LSystem {
  terrain: Terrain;
  seed: number;
  highwayRoadWidth: number = 0.5;
  streetRoadWidth: number = 0.2;
  streetSegmentLength: number = 8;
  streetIterations: number  = 5;

  //constructor
  constructor(iterations: number, options: {
    seed: number,
    terrain: Terrain,
    highwaySegmentLength: number,
    highwayMaxTurnAngle: number,
    streetSegmentLength: number,
    streetIterations: number
  }) {
    super(options);
    this.terrain = options.terrain;
    this.seed = options.seed;
    this.streetSegmentLength = options.streetSegmentLength;
    this.streetIterations = options.streetIterations;
    this.initRoadSections();

    this.axiom = '[----FL]FL';
    this.addStandardDrawRules();

    this.addDrawRule('P', new TurnTowardPopulation({
      seed: this.options.seed,
      terrain: this.options.terrain,
      maxTurnAngle: this.options.highwayMaxTurnAngle
    }));

    this.addDrawRule('p', new TurnAwayPopulation({
      seed: this.options.seed,
      terrain: this.options.terrain
    }));

    this.addDrawRule('S', new SpanPopulation({
      seed: this.options.seed,
      terrain: this.options.terrain
    }));

    this.addDrawRule('[', new StartBranch({terrain: this.terrain}));

    this.addXRule('A', new XReplace('FPFPFPFPFPFPF'));
    this.addXRule('L', new XReplace('A[--L]A[++L]A[--L]A[++L]AA[--L]A[++L]A'));

    this.initStartingPos();
    this.turtle.segmentLength = this.options.highwaySegmentLength;

    //add constraints
    let waterConstraint = new WaterConstraint({
      terrain: this.terrain,
      roads: this
    });
    this.addConstraint(waterConstraint);

    let edgeConstraint = new EdgeOfMapConstraint({
      terrain: this.terrain,
      roads: this
    });
    this.addConstraint(edgeConstraint);


  }

  initStartingPos(): void {

    //get the starting intersection
    let startPos: vec2 = this.getRoadStartingPos();
    let startIntersection: Intersection = new Intersection();
    startIntersection.pos = startPos;
    startIntersection.segmentIds = [];
    this.addIntersection(startIntersection);

    //setup the turtle
    this.turtle.roadType = RoadType.HIGHWAY;
    this.turtle.lastIntersectionId = 0;
    this.turtle.pos = startIntersection.pos;
    this.turtle.dir = Math.PI / 2;
  }

  getRoadStartingPos(): vec2 {
    let startPos: vec2 = vec2.create();
    let onWater: boolean = true;
    let seed = this.seed;
    while(onWater) {
      startPos[0] = this.terrain.gridSize[0] / 4 + Random.random1to1(1, vec2.fromValues(seed++, seed++)) * this.terrain.gridSize[0]/2;
      startPos[1] = this.terrain.gridSize[1] / 4 + Random.random1to1(2, vec2.fromValues(seed++, seed++)) * this.terrain.gridSize[1]/2;
      if(!this.terrain.positionOnWater(startPos)) {
        onWater = false;
      }
    }
    //startPos[0] = this.terrain.gridSize[0] / 2;
    //startPos[1] = this.terrain.gridSize[1] / 2;
    return startPos;
  }

  /**
   * Override the add segment - if the segment is added then we must add to terrain
   * @param startIntersectionId
   * @param endPos
   * @param rotation
   * @param roadType
   */
  addSegment(startIntersectionId: number, endPos: vec2, rotation: number, roadType: RoadType): ConstraintAdjustment {
    let adj: ConstraintAdjustment = super.addSegment(startIntersectionId, endPos, rotation, roadType);
    if (adj.added) {
      this.terrain.addRoadSegment(this.segments.length -1);
    }
    return adj;
  }

  addConstraint(constraint: Constraint) {
    this.constraints.push(constraint);
  }

  addIntersection(intersection: Intersection) {
    super.addIntersection(intersection);

    //add the intersection to the appropriate grid section
    //let gridIndex: vec2 = this.terrain.screenPosToGridIndex(intersection.pos);
    //this.roadGrid[gridIndex[0]][gridIndex[1]].intersectionIds.push(this.intersections.length -1);
  }

  //Loop through all of the terrain divisions and create a Raod
  initRoadSections() {
    //loop through the terrain trid
    // this.roadGrid = [];
    // for(let i = 0; i < this.terrain.divisions[0]; i++) {
    //   this.roadGrid.push([]);
    //   for(let j = 0; j < this.terrain.divisions[0]; j++) {
    //     this.roadGrid[i].push(new RoadSection());
    //     this.roadGrid[i][j].terrainSection = this.terrain.sectionGrid[i][j];
    //   }
    // }
  }

  addNeighborhoods(): void {
    console.log(this.streetSegmentLength);
    this.axiom = 'FXFFXFXFFX';
    this.addXRule('X', new XReplace('[-FX][FX][+FX]'));
    this.runExpansionIterations(this.streetIterations);

    let numInt = this.intersections.length;
    let numNeighborhoods = 50;
    console.log(this.turtle);
    for(let i = 0; i < numNeighborhoods; i++) {
      let intId = Math.floor(i * numInt / numNeighborhoods);
      this.addNeighborhood(intId, i % 5 * Math.PI / 69);
    }

  }

  addNeighborhood(intersectionId: number, startDir: number) {
    this.turtle = new Turtle();
    this.turtle.segmentLength = this.streetSegmentLength;
    this.turtle.roadType = RoadType.STREET;
    this.turtle.dir = startDir;
    this.turtle.lastIntersectionId = intersectionId;
    this.turtle.angle = Math.PI / 2;
    this.turtle.pos = this.intersections[intersectionId].pos;
    this.runDrawRules();

  }

  // getSegmentSlope(segmentId: number): number {
  //   let segment: Segment = this.segments[segmentId];
  //   let startPos: vec2 = this.intersections[segment.startIntersectionId].pos;
  //   let endPos: vec2 = this.intersections[segment.endIntersectionId].pos;
  //   //handle the 0 case
  //   if(endPos[0] == startPos[0]) return 999999999999;
  //
  //   return (endPos[1] - startPos[1]) /  (endPos[0] - startPos[0]);
  // }


}

export default Roads;