import {vec2, vec3} from "gl-matrix";
import Noise from "../noise/noise";

export enum TerrainType {
  WATER = 0,
  LAND = 1,
  COAST = 2
}

/**
 * Class which represents the terrain which can be calculated once
 */
export class Terrain {
  //the size of the grid (i.e number of squares in our grid representing the terrain).
  gridSize: vec2 = vec2.fromValues(1000, 1000);

  //the seed to generate the random elevation generation
  elevationSeed: vec2 = vec2.fromValues(122.323, 897.9855);

  populationSeed: vec2 = vec2.fromValues(97.9676, 85.959);

  //the elevation lower than which terrain is water
  waterLevel = 0.4;

  landLevel = 0.43;

  populationPoints: vec2[];
  numPopulationPoints: vec2 = vec2.fromValues(3, 4);

  //2 dimensional array representing the height at the [x][z] coordinate can be from 0 to 1
  elevations: number[][];

  //2 dimensional array representing the normal at each [x][z] coordinate
  normals: vec3[][];

  init() {
    this.initElevations();
    this.initNormals();
    this.initPopulation();

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

  initPopulation() {
      this.populationPoints = Noise.generateWorleyPoints2d(this.numPopulationPoints, this.populationSeed);
      console.log(this.populationPoints);
  }

  gridPosToWorlyPos(gridPos: vec2): vec2 {
    let worleyX: number = gridPos[0] * this.numPopulationPoints[0] / this.gridSize[0];
    let worleyY: number = gridPos[1] * this.numPopulationPoints[1] / this.gridSize[1];
    let worleyPos: vec2 = vec2.fromValues(worleyX, worleyY);
    return worleyPos;
  }

  /**
   * Get the population density at a particular gridPosition
   * @param gridPos
   */
  getPopulationDensity(gridPos: vec2): number {
    console.log('here');
    if(!this.positionOnLand(gridPos)) return 0;
    let worleyPos: vec2 = this.gridPosToWorlyPos(gridPos);
    let closestPopPoint = Noise.getClosestWorleyPoint2d(worleyPos, this.numPopulationPoints, this.populationPoints);
    if(closestPopPoint) {
      return Math.pow((1-vec2.dist(worleyPos, closestPopPoint))/1.414, 3);
    }
    return 0;
  }

  /**
   * Get the elevation at a particular position
   * @param gridPos
   * @todo interpolate between the four neighboring grid values
   */
  positionElevation(gridPos: vec2): number {
    let gridIndex = this.gridPosToGridIndex(gridPos);

    return this.elevations[gridIndex[0]][gridIndex[1]];
  }

  /**
   * Get the type of terrain at the given position
   * @param gridPos
   */
  positionTerrainType(gridPos: vec2): TerrainType {
    let elevation = this.positionElevation(gridPos);
    if(elevation < this.waterLevel) {
      return TerrainType.WATER;
    }
    else if (elevation < this.landLevel) {
      return TerrainType.COAST
    }
    return TerrainType.LAND;
  }

  /**
   * Check if the given position is on the water
   * @param gridPos
   */
  positionOnWater(gridPos: vec2): boolean {
    return this.positionTerrainType(gridPos) === TerrainType.WATER;
  }

  /**
   * Check if the given positio is on the land
   * @param gridPos
   */
  positionOnLand(gridPos: vec2): boolean {
    return this.positionTerrainType(gridPos) === TerrainType.LAND;
  }

  gridPosToGridIndex(gridPos: vec2): vec2 {
    let gridX = Math.floor(gridPos[0]);
    let gridY = Math.floor(gridPos[1]);
    if(gridX < 0) gridX = 0;
    if(gridY < 0) gridY = 0;
    if(gridX >= this.gridSize[0]) gridX = this.gridSize[0] -1;
    if(gridY >= this.gridSize[0]) gridY = this.gridSize[1] -1;
    return vec2.fromValues(gridX, gridY);
  }


}