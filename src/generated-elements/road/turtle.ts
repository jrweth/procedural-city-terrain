import {vec2} from 'gl-matrix';


export enum RoadType {
  HIGHWAY = 1,
  STREET = 2,
}

/**
 * Struct to hold the parameters for the turtle
 */
export class Turtle {

  //the direction the turtle is facing represented by angle in radians
  dir: number = Math.PI / 2;

  //the position where the turtle exists
  pos: vec2 = vec2.fromValues(0.0, 0.0);

  //the type of road
  roadType: RoadType = RoadType.HIGHWAY;

  segmentLength: number = 0.035;
  lengthScale: number = 0.9;

  angle: number = Math.PI / 4;
  angleScale: number = 0.9;

  branchEnded: boolean = false;

  lastIntersectionId: number = 0;

}

export function cloneTurtle(turtle: Turtle): Turtle {
  let newTurtle: Turtle = new Turtle();

  let pos:vec2 = vec2.create();
  vec2.copy(pos, turtle.pos);

  newTurtle.dir = turtle.dir;
  newTurtle.pos = pos;
  newTurtle.roadType = turtle.roadType;
  newTurtle.segmentLength = turtle.segmentLength;
  newTurtle.lengthScale = turtle.lengthScale;
  newTurtle.angle = turtle.angle;
  newTurtle.angleScale = turtle.angleScale;
  newTurtle.branchEnded = turtle.branchEnded;
  newTurtle.lastIntersectionId = turtle.lastIntersectionId;

  return newTurtle;
}