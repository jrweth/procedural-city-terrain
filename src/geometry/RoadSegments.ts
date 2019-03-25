import {gl} from '../globals';
import Drawable from "../rendering/gl/Drawable";
import {vec2} from "gl-matrix";
import {Intersection, Segment} from "../generated-elements/road/lsystem";
import {RoadType} from "../generated-elements/road/turtle";

class RoadSegments extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  offsets: Float32Array; // Data for bufTranslate
  colors: Float32Array; // Data for bufTranslate
  scale: vec2; //how far to scale the grid
  gridSize: vec2; //the size of the grid (number of squares)



  constructor(options: {scale: vec2, gridSize: vec2}) {
    super(); // Call the constructor of the super class. This is required.
    this.scale = options.scale;
    this.gridSize = options.gridSize;
  }

  create() {

    this.indices = new Uint32Array([0, 1, 2,
      1, 3, 2]);
    this.positions = new Float32Array([
      0, 0.6, -0.5, 1,
      0, 0.6, 0.5,  1,
      1, 0.6, -0.5, 1,
      1, 0.6, 0.5,  1]);

    this.generateIdx();
    this.generatePos();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(this.positions);

  }

  gridPosToScreenPos(gridPos: vec2) {
    let screenPos: vec2 = vec2.create();
    screenPos[0] = gridPos[0] * this.scale[0] / this.gridSize[0] - this.scale[0] * 0.5;
    screenPos[1] = gridPos[1] * this.scale[1] / this.gridSize[1] - this.scale[1] * 0.5;
    return screenPos;
  }

  setInstanceVBOs(segments: Segment[], intersections: Intersection[]) {
    this.generateTranslate();
    this.generateCol();

    let offsets: number[] = [];
    let colors: number[] = [];
    let width: number;

    this.numInstances = segments.length;

    for(let i = 0; i < segments.length; i++) {
      let startPos: vec2 = intersections[segments[i].startIntersectionId].pos;
      let endPos: vec2 = intersections[segments[i].endIntersectionId].pos;
      let startPosScreen = this.gridPosToScreenPos(startPos);
      let endPosScreen = this.gridPosToScreenPos(endPos);

      offsets.push(startPosScreen[0], 0, startPosScreen[1], 0);

      switch(segments[i].roadType) {
        case RoadType.HIGHWAY: width = 0.01; break
        case RoadType.STREET:    width = 0.005; break
      }
      length = vec2.dist(startPosScreen, endPosScreen);
      colors.push(length * this.scale[0], width * this.scale[1], segments[i].rotation, 0);
    }

    this.offsets = new Float32Array(offsets);
    this.colors = new Float32Array(colors);
    console.log(this.colors);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

  }
};

export default RoadSegments;
