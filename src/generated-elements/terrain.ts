import {vec2, vec3} from "gl-matrix";
import Noise from "../noise/noise";

export enum TerrainType {
  WATER = 0,
  LAND = 1
}

/**
 * Class which represents the terrain which can be calculated once
 */
export class Terrain {
  //the size of the grid (i.e number of squares in our grid representing the terrain).
  gridSize: vec2 = vec2.fromValues(1000, 1000);

  //the seed to generate the random elevation generation
  elevationSeed: vec2 = vec2.fromValues(122.323, 897.9855);

  //the elevation lower than which terrain is water
  waterLevel = 0.4;

  //2 dimensional array representing the height at the [x][z] coordinate can be from 0 to 1
  elevations: number[][];

  //2 dimensional array representing the normal at each [x][z] coordinate
  normals: vec3[][];

  init() {
    this.initElevations();
    this.initNormals();
  }

  /**
   * Initialize the elevation grid
   */
  initElevations() {
    this.elevations = [];
    for(let x = 0; x <= this.gridSize[0]; x++) {
      this.elevations.push([]);
      for(let z = 0; z <= this.gridSize[1]; z++) {
        let y = Noise.fbm2to1(vec2.fromValues(x/ 100, z/100), this.elevationSeed);
        this.elevations[x].push(y);
      }
    }
  }

  /**
   * Initialize the normal value for each point in our grid
   * should be called after initialization of elevations
   */
  initNormals() {
    this.normals = [];
    for(let x = 0; x <= this.gridSize[0]; x++) {
      this.normals.push([]);
      for (let z = 0; z <= this.gridSize[1]; z++) {
        //get the points to the left and right and above and below this point
        let startX = x - 1;
        let endX   = x + 1;
        let startZ = z - 1;
        let endZ   = z + 1;

        //adjust for start and end row positions that don't have left/right/up/down points
        if(x == 0)                startX = 0;
        if(x == this.gridSize[0]) endX = x;
        if(z == 0)                startZ = 0;
        if(z == this.gridSize[1]) endZ = z;

        //get the four surrounding points
        let xPoint1: vec3 = vec3.fromValues(startX, this.elevations[startX][z], z);
        let xPoint2: vec3 = vec3.fromValues(endX,   this.elevations[endX][z],   z);
        let zPoint1: vec3 = vec3.fromValues(x,      this.elevations[x][startZ], startZ);
        let zPoint2: vec3 = vec3.fromValues(x,      this.elevations[x][endZ], endZ);

        //get the lines from the two points
        let lineX: vec3 = vec3.create();
        vec3.subtract(lineX, xPoint2, xPoint1);
        let lineZ : vec3 = vec3.create();
        vec3.subtract(lineZ, zPoint2, zPoint1);

        let normal: vec3 = vec3.create();
        vec3.cross(normal, lineX, lineZ);

        this.normals[x].push(normal);
      }
    }
  }

}