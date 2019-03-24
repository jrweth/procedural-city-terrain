import {vec2} from "gl-matrix";
import {VecMath} from "../utils/vec-math";
import Random from "./random";

/**
 * Various random functions to help generate noise
 */
class Noise {

  static fbm2to1(p: vec2 , seed: vec2, persistence: number = 0.5, octaves: number = 8.0): number {

    let total: number = 0.0;
    for (let i = 0.0; i < octaves; i++) {
      let freq = Math.pow(2.0, i);
      let amp = Math.pow(persistence, i + 1.0);
      total = total + Random.interpNoiseRandom2to1(VecMath.multiply2(p, freq), seed) * amp;
    }
    return total;
  }

  static generateWorleyPoints2d(gridSize: vec2, seed: vec2): vec2[] {
    let points: vec2[] = [];
    let seed2: vec2 = vec2.create();
    vec2.add(seed2, seed, vec2.fromValues(0.2343, 1.232));
    for(let x: number = 0; x < gridSize[0]; x++) {
      for(let y: number = 0; y < gridSize[1]; y++) {
        let gridPos: vec2 = vec2.fromValues(x, y);
        let xOffset = Random.random2to1(gridPos, seed);
        let yOffset = Random.random2to1(gridPos, seed2);
        points.push(vec2.fromValues(x + xOffset, y + yOffset));
      }
    }
    return points;
  }

  /*
  Determine worley noise for given position and grid size
  - param vec2 pos :      the position to test for
  - param vec2 gridSize:  the size of the grid
  - param vec2 seed:       the random seed
  - return vec2:          the location of the closest worley point
  */
  static getClosestWorleyPoint2d(pos: vec2, gridSize: vec2, gridPoints: vec2[]): vec2 {
    let centerGridX: number = Math.floor(pos[0]);
    let centerGridY: number = Math.floor(pos[1]);

    let closestDistance: number = 3.0;
    let closestWorleyPoint: vec2;

    //loop through the 9 grid sections surrouding this one to find the closes worley point
    for(let gridX = -1.0; gridX <= 1.0; gridX += 1.0) {
      for (let gridY = -1.0; gridY <= 1.0; gridY += 1.0) {
        let currentGridX: number = centerGridX + gridX;
        let currentGridY: number = centerGridY + gridY;
        //make sure we aren't out of the grid
        if(currentGridX < 0 || currentGridY < 0 || currentGridX >= gridSize[0] || currentGridY >= gridSize[1]) {
          continue;
        }
        let currentWorleyPoint = gridPoints[currentGridX * gridSize[1] + currentGridY];
        let currentDistance = vec2.dist(pos, currentWorleyPoint);

        if (currentDistance < closestDistance) {
          closestDistance = currentDistance;
          closestWorleyPoint = currentWorleyPoint;
        }
      }
    }

    return closestWorleyPoint;
  }

}

export default Noise;