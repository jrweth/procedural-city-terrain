import {vec2, vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Noise from "../noise/noise";
import {Terrain} from "../generated-elements/terrain";

class TerrainPlane extends Drawable {
  seed: vec2 = vec2.fromValues(342.3423, 984.843);
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  scale: vec2;
  gridSize: vec2;
  subdivs: number; // 2^subdivs is how many squares will compose the plane; must be even.
  terrain: Terrain;

  constructor(terrain: Terrain) {
    super(); // Call the constructor of the super class. This is required.
    this.scale = vec2.fromValues(100, 100);
    this.gridSize = terrain.gridSize;
    this.subdivs =20;
    this.terrain = terrain;
  }

  create() {

    this.initGrid();

    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
  }


  initGrid() {
    let numPoints = (this.gridSize[1] + 1) * (this.gridSize[1] + 1);
    let numGridSquares = this.gridSize[0] * this.gridSize[1];
    let normalizeX: number = 1.0 / this.gridSize[0];
    let normalizeY: number = 1.0 / this.gridSize[1];

    this.positions = new Float32Array(numPoints * 4);
    this.normals = new Float32Array(numPoints * 4);
    this.indices = new Uint32Array(numGridSquares * 6); // NxN squares, each square is two triangles, each triangle is three indices
    this.colors = new Float32Array(numPoints * 4);

    let posIdx = 0;
    for(let x = 0; x <= this.gridSize[0]; ++x) {
      for(let z = 0; z <= this.gridSize[1]; ++z) {

        // Make a strip of vertices along Z with the current X coord
        this.normals  [posIdx] = 0;
        this.colors   [posIdx] = 0;
        this.positions[posIdx++] = x * normalizeX * this.scale[0]  - this.scale[0] * 0.5;

        this.normals[posIdx] = 1;
        this.colors[posIdx] = 0;
        this.positions[posIdx++] = this.terrain.elevations[x][z];

        this.normals[posIdx] = 0;
        this.positions[posIdx++] = z * normalizeY* this.scale[1]  - this.scale[1] * 0.5;
        this.colors[posIdx] = 0;

        this.normals[posIdx] = this.terrain.getPopulationDensity(vec2.fromValues(x, z));
        this.colors[posIdx] = 0;
        this.positions[posIdx++] = 1;
      }
    }

    let indexIdx = 0;
    // Make the squares out of indices
    for(let i = 0; i < this.gridSize[0]; ++i) { // X iter
      for(let j = 0; j < this.gridSize[1]; ++j) { // Z iter
        this.indices[indexIdx++] = j + i * (this.gridSize[1] + 1);
        this.indices[indexIdx++] = j + 1 + i * (this.gridSize[1] + 1);
        this.indices[indexIdx++] = j + (i + 1) * (this.gridSize[1] + 1);

        this.indices[indexIdx++] = j + 1 + i * (this.gridSize[1]+ 1);
        this.indices[indexIdx++] = j + (i + 1) * (this.gridSize[1] + 1);
        this.indices[indexIdx++] = j + 1 + (i + 1) * (this.gridSize[1] + 1);
      }
    }

  }

  setSeedFromNum(seed: number) {
    this.seed = vec2.fromValues(seed, seed + 8.33398);
  }

  gridPosToScreenPos(pos: vec3) {
    let screenPos: vec3 = vec3.create();
    let normalizeX = 1 / this.gridSize[0];
    screenPos[0] = pos[0]
    return screenPos;

  }


};

export default TerrainPlane;
