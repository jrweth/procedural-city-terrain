import {gl} from '../globals';
import Drawable from "../rendering/gl/Drawable";
import {vec2, vec3} from "gl-matrix";
import {Building} from "../generated-elements/building/building";
import {Block, BlockType} from "../generated-elements/building/shape/block";

class Cube extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  offsets: Float32Array;
  colors: Float32Array;
  scale: vec2;
  gridSize: vec2;
  blockInfo: Float32Array;

  constructor(options: {scale: vec2, gridSize: vec2}) {
    super(); // Call the constructor of the super class. This is required.
    this.scale = options.scale;
    this.gridSize = options.gridSize;
  }

  create() {

    this.positions = new Float32Array([
      //left
      -0.5,  0.0, -0.5, 1,
      -0.5,  0.0,  0.5, 1,
      -0.5,  1.0, -0.5, 1,
      -0.5,  1.0,  0.5, 1,

      //right
      0.5,  0.0, -0.5, 1,
      0.5,  0.0,  0.5, 1,
      0.5,  1.0, -0.5, 1,
      0.5,  1.0,  0.5, 1,

      //top
      -0.5,  1.0, -0.5, 1,
      -0.5,  1.0,  0.5, 1,
      0.5,   1.0, -0.5, 1,
      0.5,   1.0,  0.5, 1,

      //bottom
      -0.5,  0.0, -0.5, 1,
      -0.5,  0.0,  0.5, 1,
      0.5,   0.0, -0.5, 1,
      0.5,   0.0,  0.5, 1,

      //back
      -0.5,  0.0, -0.5, 1,
      -0.5,  1.0, -0.5, 1,
      0.5,   0.0, -0.5, 1,
      0.5,   1.0, -0.5, 1,

      //front
      -0.5,  0.0, 0.5, 1,
      -0.5,  1.0, 0.5, 1,
      0.5,   0.0, 0.5, 1,
      0.5,   1.0, 0.5, 1
    ]);
    this.indices = new Uint32Array([
      //left side
      0, 1, 2,
      1, 2, 3,
      //right side
      4, 5, 6,
      5, 6, 7,
      //top
      8, 9, 10,
      9, 10, 11,
      //bottom
      12, 13, 14,
      13, 14, 15,
      //back
      16, 17, 18,
      17, 18, 19,
      //front
      20, 21, 22,
      21, 22, 23
    ]);
    this.normals = new Float32Array([
      //left
      -1,  0,  0, 0,
      -1,  0,  0, 0,
      -1,  0,  0, 0,
      -1,  0,  0, 0,
      //right
      1,  0,  0, 0,
      1,  0,  0, 0,
      1,  0,  0, 0,
      1,  0,  0, 0,
      //top
      0, 1, 0, 0,
      0, 1, 0, 0,
      0, 1, 0, 0,
      0, 1, 0, 0,
      //bottom
      0, -1, 0, 0,
      0, -1, 0, 0,
      0, -1, 0, 0,
      0, -1, 0, 0,
      //back
      0, 0, -1, 0,
      0, 0, -1, 0,
      0, 0, -1, 0,
      0, 0, -1, 0,
      //front
      0, 0, 1, 0,
      0, 0, 1, 0,
      0, 0, 1, 0,
      0, 0, 1, 0

    ]);

    // this.indices = new Uint32Array([0, 1, 2,
    //   1, 3, 2]);
    // this.positions = new Float32Array([
    //   0, 0.6, -0.5,, 1,
    //   0, 0.6, 0.5,  1,
    //   1, 0.6, -0.5,, 1,
    //   1, 0.6, 0.5,  1]);

    this.generateIdx();
    this.generatePos();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created Cube`);
  }

  gridPosToScreenPos(gridPos: vec3): vec3 {
    let screenPos: vec3 = vec3.create();
    screenPos[0] = gridPos[0] * this.scale[0] / this.gridSize[0] - this.scale[0] * 0.5;
    screenPos[1] = gridPos[1] * this.scale[0] / this.gridSize[0];
    screenPos[2] = gridPos[2] * this.scale[1] / this.gridSize[1] - this.scale[1] * 0.5;
    return screenPos;
  }

  setInstanceVBOs(buildings: Building[]) {
    this.generateTranslate();
    this.generateCol();
    this.generateBlockInfo();

    let offsets: number[] = [];
    let colors: number[] = []; //set to footprint
    let blockInfo: number[] = [];

    this.numInstances = 0;

    for(let i = 0; i < buildings.length; i++) {
      let blocks: Block[] = buildings[i].getBlocks();
      for(let j = 0; j < blocks.length; j++) {
        let block: Block = blocks[j];

        if(block.blockType == BlockType.CUBE
          || block.blockType == BlockType.PYRAMID
          || block.blockType == BlockType.TENT
          || block.blockType == BlockType.TRI_TUBE
          || block.blockType == BlockType.QUARTER_PYRAMID
        ) {
          this.numInstances++;
          let startPosScreen = this.gridPosToScreenPos(block.pos);

          offsets.push(startPosScreen[0], startPosScreen[1], startPosScreen[2], 0);
          colors.push(
            block.footprint[0] * this.scale[0] / this.gridSize[0],
            block.footprint[1] * this.scale[0] / this.gridSize[0],
            block.footprint[2] * this.scale[1] / this.gridSize[1],
            block.rotation
          );
          blockInfo.push(
            block.blockType,
            block.rotation,
            block.adjustScaleBottom,
            block.adjustScaleTop
          )

        }

      }
    }

    this.offsets = new Float32Array(offsets);
    this.colors = new Float32Array(colors);
    this.blockInfo = new Float32Array(blockInfo);


    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufBlockInfo);
    gl.bufferData(gl.ARRAY_BUFFER, this.blockInfo, gl.STATIC_DRAW);

  }
};

export default Cube;
