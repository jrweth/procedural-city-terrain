import {Intersection, LSystem} from "./lsystem";
import {XReplace} from "./x-rule/x-replace";
import {TurnTowardPopulation} from "./draw-rule/turn-toward-population";
import {vec2} from "gl-matrix";
import {TurnAwayPopulation} from "./draw-rule/turn-away-population";
import {SpanPopulation} from "./draw-rule/span_population";
import {RoadType, Turtle} from "./turtle";
import {StartBranch} from "./draw-rule/start-branch";
import {Constraint} from "./constraint/constraint";
import {WaterConstraint} from "./constraint/water-constraint";
import {EdgeOfMapConstraint} from "./constraint/edge-of-map-constraint";
import {Terrain} from "../terrain";
import {start} from "repl";
import Random from "../../noise/random";

class RoadGridSection {
  xIndex: number;
  zIndex: number;
  intersectionIds: number[] = [];
}

class Roads extends LSystem {
  roadGrid: RoadGridSection[][]  = [];
  terrain: Terrain;
  seed: number;

  //constructor
  constructor(iterations: number, options: {
    seed: number,
    terrain: Terrain
  }) {
    super(options);
    this.terrain = options.terrain;
    this.seed = options.seed;
    this.initRoadSections();

    this.axiom = '[----FL]FL';
    this.addStandardDrawRules();

    this.addDrawRule('P', new TurnTowardPopulation({
      seed: this.options.seed,
      terrain: this.options.terrain
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

    this.addXRule('A', new XReplace('FPFPFPFPFPFjjjPFPFPFPFPF'));
    this.addXRule('L', new XReplace('A[--L]A[++L]A[--L]A[++L]AA[--L]A[++L]A'));

    this.initStartingPos();


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
      startPos[0] = Random.random1to1(1, vec2.fromValues(seed++, seed++)) * this.terrain.gridSize[0];
      startPos[1] = Random.random1to1(2, vec2.fromValues(seed++, seed++)) * this.terrain.gridSize[1];
      if(!this.terrain.positionOnWater(startPos)) {
        onWater = false;
      }
    }
    //startPos[0] = this.terrain.gridSize[0] / 2;
    //startPos[1] = this.terrain.gridSize[1] / 2;
    return vec2.fromValues(500, 500);
    return startPos;
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
    console.log(this.segments);
    this.axiom = 'FXFFXFXFFX';
    this.addXRule('X', new XReplace('[-FX][FX][+FX]'));
    this.runExpansionIterations(5);

    let numInt = this.intersections.length;
    let numNeighborhoods = 1000;
    for(let i = 0; i < numNeighborhoods; i++) {
      let intId = Math.floor(i * numInt / numNeighborhoods);
      this.addNeighborhood(intId, Math.PI * i / 6);
    }

  }

  addNeighborhood(intersectionId: number, startDir: number) {
    this.turtle = new Turtle();
    this.turtle.roadType = RoadType.STREET;
    this.turtle.dir = startDir;
    this.turtle.lastIntersectionId = intersectionId;
    this.turtle.angle = Math.PI / 2;
    this.turtle.pos = this.intersections[intersectionId].pos;
    this.runDrawRules();

  }


}

export default Roads;