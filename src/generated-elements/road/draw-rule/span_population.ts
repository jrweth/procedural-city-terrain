import {BaseDrawRule} from "./base-draw-rule";
import {DrawRule} from "./draw-rule";
import {Turtle} from "../turtle";
import {Segment} from "../lsystem";
import Prando from "prando";
import {TurnTowardPopulation} from "./turn-toward-population";
import {TurnAwayPopulation} from "./turn-away-population";
import {Terrain} from "../../terrain";

export class SpanPopulation extends BaseDrawRule implements DrawRule {
  prando: any;
  terrain: Terrain;

  constructor(options: {seed: number, terrain: Terrain}) {
    super(options);
    this.prando = new Prando(options.seed);
    this.terrain = options.terrain;
  }

  draw(turtle: Turtle, turtleStack: Turtle[], segments: Segment[], options?: string) {

    let rule: DrawRule;
    if(this.terrain.getPopulationDensity(turtle.pos) < 0.9) {
      rule = new TurnTowardPopulation(this.options);
    }
    else {
      rule = new TurnAwayPopulation(this.options);
    }
    return rule.draw(turtle, turtleStack, segments, options);
  }
}