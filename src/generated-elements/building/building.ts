import {vec2, vec3} from "gl-matrix";
import {Shape} from "./shape/shape";
import {Box} from "./shape/box";
import {Block, BlockType} from "./shape/block";
import {Sample} from "./shape/sample";
import Random from "../../noise/random";


export class Building {
  pos: vec3;
  footprint: vec3;
  rotation: number;
  shapes: Shape[];
  seed: number;


  constructor(options: {
    pos: vec3,
    footprint: vec3,
    rotation: number,
    seed: number
  }) {
    this.pos = options.pos;
    this.footprint = options.footprint;
    this.rotation = options.rotation;
    this.seed = options.seed;
    this.shapes = [
      new Box({
        footprint: this.footprint,
        pos: this.pos,
        rotation: this.rotation
      }),
    ];
    this.runReplacements();
  }

  getBlocks(): Block[] {
    let blocks: Block[] = [];
    for(let i = 0; i < this.shapes.length; i++) {
      blocks = blocks.concat(this.shapes[i].getBlocks());
    }
    return blocks;
  }

  allShapesTerminal(): boolean {
    for(let i = 0; i < this.shapes.length; i++) {
      if(!this.shapes[i].terminal) return false;
    }
    return true;
  }

  runReplacements() {
    let count: number = 0;
    while(!this.allShapesTerminal() && count < 20) {
      count++;
      this.runReplacement();
    }
  }

  runReplacement() {
    this.seed += 1.23;
    //get non terminal shapes
    let nonTerminal: number[] = [];
    for(let i = 0; i < this.shapes.length; i++) {
      if(!this.shapes[i].terminal) nonTerminal.push(i);
    }

    //pick a random shape to replace
    let replaceIndex = nonTerminal[Random.randomInt(nonTerminal.length - 1, this.seed)];

    let newShapes = this.shapes[replaceIndex].runReplacement(this.seed);
    this.shapes[replaceIndex] = newShapes[0];
    for(let i = 1; i < newShapes.length; i++) {
      this.shapes.push(newShapes[i]);
    }

  }





}