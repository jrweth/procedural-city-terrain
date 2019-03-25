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


  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {


    this.indices = new Uint32Array([0, 1, 2,
      1, 3, 2]);
    this.positions = new Float32Array([0, -0.5, -0.001, 1,
      0, 0.5, -0.001, 1,
      1, -0.5, -0.001, 1,
      1, 0.5, -0.001, 1]);

    this.generateIdx();
    this.generatePos();
    //this.generateTranslate();
    //this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

  }

  setInstanceVBOs(segments: Segment[], intersections: Intersection[]) {
    let offsets: number[] = [];
    let colors: number[] = [];
    let width: number;

    this.numInstances = segments.length;

    for(let i = 0; i < segments.length; i++) {
      let startPos: vec2 = intersections[segments[i].startIntersectionId].pos;
      let endPos: vec2 = intersections[segments[i].endIntersectionId].pos;
      offsets.push(startPos[0], startPos[1], 0);

      switch(segments[i].roadType) {
        case RoadType.HIGHWAY: width = 0.01; break
        case RoadType.STREET:    width = 0.005; break
      }
      length = vec2.dist(startPos, endPos);
      colors.push(length, width, segments[i].rotation, 0);
    }

    this.offsets = new Float32Array(offsets);
    this.colors = new Float32Array(colors);

    // gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    // gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);
    //
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    // gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
  }
};

export default RoadSegments;
