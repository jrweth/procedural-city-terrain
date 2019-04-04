import {vec2, vec3} from "gl-matrix";
import Noise from "../noise/noise";
import Roads from "./road/roads";
import {Segment} from "./road/lsystem";
import {VecMath} from "../utils/vec-math";
import {RoadType} from "./road/turtle";
import {Building} from "./building/building";
import Random from "../noise/random";

export enum TerrainType {
  WATER = 0,
  LAND = 1,
  COAST = 2
}

export class GridPart {
  minElevation: number = 0;
  avgDensity: number = 0;
  roadSegmentIds: number[] = [];
  roadIntersectionIds: number[] = [];
  containsStreet: boolean = false;
  containsHighway: boolean = false;
  hasBuilding: boolean = false;
}

/**
 * Class which represents the terrain which can be calculated once
 */
export class Terrain {
  //the size of the grid (i.e number of squares in our grid representing the terrain).
  gridSize: vec2 = vec2.fromValues(500, 500);

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

  //2 dimensional array representing the density at each grid point
  populationDensities: number[][];


  //2 dimensional array representing the normal at each [x][z] coordinate
  normals: vec3[][];

  //2 dimenstional  array containing aggregate information for each gird part
  gridParts: GridPart[][];

  //the roads for the terrain
  roads: Roads;

  //seed for the road
  roadSeed: number = 1;

  //highway segment lenght for roads
  highwaySegmentLength: number = 12;

  //hightway max turn angle
  highwayMaxTurnAngle: number = Math.PI / 18;

  //number of times to iterate the highway lsystem
  highwayIterations: number = 3;

  streetSegmentLength: number = 8;

  streetIterations: number = 5;

  buildings: Building[] = [];

  numBuildings: number = 1000;

  buildingSeed: number = 1;

  init() {
    this.initElevations();
    this.initNormals();
    this.initPopulation();
    this.initGridParts();
    this.initRoads();
    this.initBuildings();
  }

  /**
   * Initialize the elevation grid
   */
  initElevations() {
    this.elevations = [];
    for(let x = 0; x <= this.gridSize[0]; x++) {
      this.elevations.push([]);
      for(let z = 0; z <= this.gridSize[1]; z++) {
        let y = Noise.fbm2to1(vec2.fromValues(x * 5 / this.gridSize[0], z * 5/ this.gridSize[1]), this.elevationSeed);
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

  /**
   * Initialize the population density for the grid
   */
  initPopulation() {
    this.populationPoints = Noise.generateWorleyPoints2d(this.numPopulationPoints, this.populationSeed);

    this.populationDensities = [];
    for(let x = 0; x <= this.gridSize[0]; x++) {
      this.populationDensities.push([]);
      for(let z = 0; z <= this.gridSize[1]; z++) {
        let pos: vec2 = vec2.fromValues(x, z);
        this.populationDensities[x].push(this.getPopulationDensity(pos));
      }
    }
  }

  /**
   * loop through grid and calculate min elevation and avg density
   */
  initGridParts() {
    this.gridParts = [];
    for(let i = 0; i < this.gridSize[0]; i++) {
      this.gridParts.push([]);
      for (let j = 0; j < this.gridSize[1]; j++) {
        this.gridParts[i].push(new GridPart);
        let  minElevation = Math.min(
          this.elevations[i][j],
          this.elevations[i+1][j],
          this.elevations[i][j+1],
          this.elevations[i+1][j+1],
        );
        this.setGridPartAttribute(i, j, 'minElevation',minElevation);

        let avgDensity = (
          this.populationDensities[i][j] +
          this.populationDensities[i+1][j] +
          this.populationDensities[i][j+1] +
          this.populationDensities[i+1][j+1]
        )/4;
        this.setGridPartAttribute(i, j, 'avgDensity', avgDensity);
      }
    }

  }


  initRoads() {
    //initialize roads
    this.roads = new Roads(this.highwayIterations, {
      seed: this.roadSeed,
      terrain: this,
      highwaySegmentLength: this.highwaySegmentLength,
      highwayMaxTurnAngle: this.highwayMaxTurnAngle,
      streetSegmentLength: this.streetSegmentLength,
      streetIterations: this.streetIterations
    });
    this.roads.runExpansionIterations(this.highwayIterations);
    this.roads.runDrawRules();
    // console.log(this.gridParts[350][353]);
    // for(let i = 0; i < this.gridParts[350][353].roadSegmentIds.length; i++) {
    //   let roadSegment = this.roads.segments[this.gridParts[350][353].roadSegmentIds[i]];
    //   console.log(this.roads.intersections[roadSegment.startIntersectionId]);
    //   console.log(this.roads.intersections[roadSegment.endIntersectionId]);
    // }
    this.roads.addNeighborhoods();
  }

  initBuildings() {
    this.selectBuildingLocations();
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
    if(!this.positionOnLand(gridPos)) return 0;
    let worleyPos: vec2 = this.gridPosToWorlyPos(gridPos);
    let closestPopPoint = Noise.getClosestWorleyPoint2d(worleyPos, this.numPopulationPoints, this.populationPoints);
    if(closestPopPoint) {
      return Math.pow((1-vec2.dist(worleyPos, closestPopPoint))/1.414, 3);
    }
    return 0;
  }

  checkGridPosOutOfBounds(gridPos: vec2): boolean {
    //check if we are in bounds
    return (
      gridPos[0] < 0 ||
      gridPos[1] < 0 ||
      gridPos[0] >= this.gridSize[0] ||
      gridPos[1] >= this.gridSize[1]
    );
  }

  hasNearbyStreet(gridPos: vec2): boolean {
    if(this.checkGridPosOutOfBounds(gridPos)) return false;

    let blockRadius = this.streetSegmentLength * 0.75;
    let minX = Math.max(0, gridPos[0] - blockRadius);
    let minZ = Math.max(0, gridPos[1] - blockRadius);
    let maxX = Math.min(this.gridSize[0] - 1, gridPos[0] + blockRadius);
    let maxZ = Math.min(this.gridSize[1] - 1, gridPos[1] + blockRadius);
    for(let i = minX; i <= maxX; i++) {
      for (let j = minZ; j <= maxZ; j++) {
        if(this.gridParts[i][j].containsStreet == true) return true;
      }
    }

    return false;
  }

  getBuildingSuitability(gridPos: vec2): boolean {
    if(this.checkGridPosOutOfBounds(gridPos)) return false;

    return (
      this.hasNearbyStreet(gridPos)
      && this.gridParts[gridPos[0]][gridPos[1]].roadSegmentIds.length == 0
    );
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

  setGridPartAttribute(i: number, j: number, attribute: string, value: number) {
    switch (attribute) {
      case 'minElevation': this.gridParts[i][j].minElevation = value; break;
      case 'avgDensity': this.gridParts[i][j].avgDensity = value; break;
    }
  }


  /**
   * Add a road segment
   * @param segmentId
   */
  addRoadSegment(segmentId: number) {
    let gridPos: vec2[] = this.getSegmentGridPositions(segmentId);
    for(let i = 0; i < gridPos.length; i++) {
      this.gridParts[ gridPos[i][0] ][ gridPos[i][1] ].roadSegmentIds.push(segmentId);
      if(this.roads.segments[segmentId].roadType == RoadType.STREET) {
        this.gridParts[ gridPos[i][0] ][ gridPos[i][1] ].containsStreet = true;
      }
      if(this.roads.segments[segmentId].roadType == RoadType.HIGHWAY) {
        this.gridParts[ gridPos[i][0] ][ gridPos[i][1] ].containsHighway = true;
      }
    }
  }
  /**
   * Get the gridPositions through which the road passes
   * @param segmentId
   */
  getSegmentGridPositions(segmentId: number): vec2[] {
    let gridPos: vec2[] = [];

    let segment = this.roads.segments[segmentId];
    let p1: vec2 =this.roads.intersections[segment.startIntersectionId].pos;
    let p2: vec2 =this.roads.intersections[segment.endIntersectionId].pos;


    //loop through all the possible grid positions
    let minX = Math.floor(Math.min(p1[0], p2[0], this.gridSize[0]));
    let maxX = Math.floor(Math.max(p1[0], p2[0], 0));
    let minZ = Math.floor(Math.min(p1[1], p2[1], this.gridSize[1]));
    let maxZ = Math.floor(Math.max(p1[1], p2[1], 0));
    if(minX < 0) minX = 0;
    if(minZ < 0) minZ = 0;
    if(maxX >= this.gridSize[0]) maxX = this.gridSize[0] - 1;
    if(maxZ >= this.gridSize[1]) maxZ = this.gridSize[1] - 1;

    for(let i = minX; i <= maxX; i++) {
      for(let j = minZ; j <= maxZ; j++) {
        //console.log(i + '-' + j);
        //check for intersections
        let g1: vec2 = vec2.fromValues(i, j);
        let g2: vec2 = vec2.fromValues(i, j+1);
        let g3: vec2 = vec2.fromValues(i+i, j);
        let g4: vec2 = vec2.fromValues(i+i, j+1);
        if(
          VecMath.intersectionTest(g1, g2, p1, p2) !== undefined ||
          VecMath.intersectionTest(g1, g3, p1, p2) !== undefined ||
          VecMath.intersectionTest(g3, g4, p1, p2) !== undefined ||
          VecMath.intersectionTest(g2, g4, p1, p2) !== undefined
        ) {
          gridPos.push(vec2.fromValues(i,j));

        }

      }
    }

    return gridPos;
  }

  /**
   * set the building locations
   */
  selectBuildingLocations() {
    let possible: vec2[] = [];
    //get the possible building locations
    for(let i = 0; i < this.gridSize[0]; i++) {
      for(let j = 0; j < this.gridSize[0]; j++) {
        if(this.getBuildingSuitability(vec2.fromValues(i,j))) {
          possible.push(vec2.fromValues(i, j));
        }
      }
    }
    let index = Math.floor(possible.length/3);
    let advance = Math.floor(possible.length / 322);
    for(let x = 0; x < this.numBuildings; x++) {
      let gridPart: GridPart = this.gridParts[possible[index][0]][possible[index][1]];
      gridPart.hasBuilding = true;
      this.buildings.push(new Building({
        pos: vec3.fromValues(possible[index][0], 2.0, possible[index][1]),
        rotation: 0,
        footprint: vec3.fromValues(2, 2 + gridPart.avgDensity * 80, 2),
        seed: Random.random2to1(possible[index], vec2.fromValues(this.buildingSeed, 2.2))
      }));
      index += advance;
      index = index % possible.length;
    }


    for(let i = 0; i < 10; i++) {
      // this.buildings.push(new Building({
      //   pos: vec3.fromValues(150 + i * 20,0,250),
      //   rotation: 0,
      //   footprint: vec3.fromValues(15, 40, 15),
      //   seed: Random.random2to1(vec2.fromValues(i, 34.32), vec2.fromValues(this.buildingSeed, 2.2))
      // }));

    }



  }


}