import {vec2} from "gl-matrix";
import {VecMath} from "../utils/vec-math";


/**
 * Various random functions to help generate noise
 */
class Random {


  //get a pseudo random number based upon 2 values
  static random2to1(p: vec2, seed: vec2): number {
    return  Math.abs((Math.sin(vec2.dot(vec2.add(p, p, seed), vec2.fromValues(127.1, 311.7))) * 43758.5453) % 1);
  }


  //get a pseudo random number based upon 1 value
  static random1to1(p: number, seed: vec2): number {
    return  Math.abs((Math.sin(vec2.dot(vec2.fromValues(p, 311.2), seed)) * 43758.5453) % 1);
  }

  //mix two number toget
  static mix(a: number, b: number, ratio: number): number {
    return a + ((b - a) * (ratio));

  }


  static interpNoiseRandom2to1(p: vec2, seed: vec2 ): number {
    let fractX: number = p[0] % 1;
    let x1: number = Math.floor(p[0]);
    let x2: number = x1 + 1.0;

    let fractY: number = p[1] % 1;
    let y1: number = Math.floor(p[1]);
    let y2: number = y1 + 1.0;

    let v1: number = this.random2to1(vec2.fromValues(x1, y1), seed);
    let v2: number = this.random2to1(vec2.fromValues(x2, y1), seed);
    let v3: number = this.random2to1(vec2.fromValues(x1, y2), seed);
    let v4: number = this.random2to1(vec2.fromValues(x2, y2), seed);

    let i1: number = this.mix(v1, v2, fractX);
    let i2: number = this.mix(v3, v4, fractX);

    return this.mix(i1, i2, fractY);

  }

  static interp2D(fracX: number, fracY: number, x1y1: number, x2y1: number, x1y2: number, x2y2: number): number {
    let i1: number = this.mix(x1y1, x2y1, fracX);
    let i2: number = this.mix(x1y2, x2y2, fracX);

    return this.mix(i1, i2, fracY);

  }

  static fbm2to1(p: vec2 , seed: vec2, persistence: number = 0.5, octaves: number = 8.0): number {

    let total: number = 0.0;
    for (let i = 0.0; i < octaves; i++) {
      let freq = Math.pow(2.0, i);
      let amp = Math.pow(persistence, i + 1.0);
      total = total + this.interpNoiseRandom2to1(VecMath.multiply2(p, freq), seed) * amp;
    }
    return total;
  }
}

export default Random;