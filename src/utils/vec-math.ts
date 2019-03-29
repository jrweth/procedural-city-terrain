import {mat4, vec2, vec3, vec4} from "gl-matrix";

//wraps the vec3 functions so that they are easier to deal with
export class VecMath {
  public static pi = 3.14159;

  public static ident(): mat4 {
    let identity: mat4;
    mat4.identity(identity);
    return identity;
  }
  public static id: mat4 = mat4.fromValues(1,0,0,0, 0,1,0,0, 0,0, 1,0, 0,0,0, 1);

  public static degreeToRad(deg: number): number {
    return deg * 2.0 *  this.pi /360 ;
  }

  public static convertToVec3(a: vec3 | number[] | number): vec3 {
    if (typeof a == 'number') {
      return vec3.fromValues(a, a, a);
    }
    else if( Array.isArray(a) && a.length == 3) {
      return vec3.fromValues(a[0], a[1], a[2]);
    }

    return a as vec3;
  }

  public static convertToVec2(a: vec2 | number[] | number): vec2 {
    if (typeof a == 'number') {
      return vec2.fromValues(a, a);
    }
    else if( Array.isArray(a) && a.length == 2) {
      return vec2.fromValues(a[0], a[1]);
    }

    return a as vec2;
  }

  public static add(a: vec3 | number[] | number, b: vec3 | number[] | number) {
    let out: vec3 = vec3.create();
    return vec3.add(out, this.convertToVec3(a), this.convertToVec3(b));
  }

  public static multiply3(a: vec3, b: vec3 | number[] | number): vec3 {
    let out: vec3 = vec3.create();
    return vec3.multiply(out, this.convertToVec3(a), this.convertToVec3(b));
  }

  public static multiply2(a: vec2, b: vec2 | number[] | number): vec2 {
    let out: vec2 = vec2.create();
    return vec2.multiply(out, this.convertToVec2(a), this.convertToVec2(b));
  }


  //this assumes that both the line and the point are normalized
  public static rotateAroundVector(point: vec3, vector: vec3, degree: number): vec3  {
    let start: vec4 = vec4.fromValues(point[0], point[1], point[2], 1);
    let result: vec4 = vec4.create();
    let rot: mat4 = this.rotationAroundVector(vector, degree);
    vec4.transformMat4(result, start, rot);

    return vec3.fromValues(result[0], result[1], result[2]);

  }

  /**
   * Get the rotation matrix for rotation the degrees around a vector
   * @param vector  the vector to rotate around
   * @param degree  the degrees to rotate
   */
  public static rotationAroundVector(vector: vec3, degree: number): mat4 {
    let rot: mat4 = mat4.create();
    mat4.rotate(rot, this.id, this.degreeToRad(degree), vector);
    return rot;
  }

  public static getRotationFromPoints(startPoint: vec2, endPoint: vec2): number {
    let dX = endPoint[0] - startPoint[0];
    let dY = endPoint[1] - startPoint[1];
    if(dX == 0 && dY >= 0) {
      return Math.PI / 2;
    }
    if(dX == 0 && dY < 0) {
      return Math.PI * 3 / 2;
    }
    if(dX < 0) {
      return Math.PI + Math.atan(dY/dX);
    }
    return Math.atan(dY/dX);
  }

  public static clamp(val: number, min: number, max: number) {
    if(val < min) return min;
    if(val > max) return max;
    return val;
  }

  public static intersectionTest(e0: vec2, e1:vec2, o0: vec2, o1: vec2) {
    // convert to Ax + By = C form
    var A1 = e1[1] - e0[1];
    var B1 = e0[0] - e1[0];
    var C1 = A1 * e0[0] + B1 * e0[1];

    var A2 = o1[1] - o0[1];
    var B2 = o0[0] - o1[0];
    var C2 = A2 * o0[0] + B2 * o0[1];

    var det = A1 * B2 - A2 * B1;

    // parallel lines
    if (Math.abs(det) < 0.000001) {
      return undefined;
    } else {
      var x = (B2 * C1 - B1 * C2) / det;
      var y = (A1 * C2 - A2 * C1) / det;

      //make sure they actually hit
      if(x < e0[0]) return undefined;
      if(x > e1[0]) return undefined;

      if(y < e0[1]) return undefined;
      if(y > e1[1]) return undefined;

      var intersection = vec2.fromValues(x, y);
      return intersection;
    }
  }
// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
  public static orientation(p: vec2, q: vec2, r: vec2) {
  // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
  // for details of below formula.
    let val: number = (q[1] - p[1]) * (r[0] - q[0]) -
         (q[0] - p[0]) * (r[1] - q[1]);

    if (val == 0) return 0;  // colinear

    return (val > 0)? 1: 2; // clock or counterclock wise
  }


  // Given three colinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
  public static onSegment(p: vec2, q: vec2, r: vec2)
{
  if (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
  q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]))
  return true;

  return false;
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
public static doIntersect(p1: vec2, q1: vec2, p2: vec2, q2: vec2) : boolean {
  // Find the four orientations needed for general and
  // special cases
  let o1 = this.orientation(p1, q1, p2);
  let o2 = this.orientation(p1, q1, q2);
  let o3 = this.orientation(p2, q2, p1);
  let o4 = this.orientation(p2, q2, q1);

  // General case
  if (o1 != o2 && o3 != o4)
    return true;

  // Special Cases
  // p1, q1 and p2 are colinear and p2 lies on segment p1q1
  if (o1 == 0 && this.onSegment(p1, p2, q1)) return true;

  // p1, q1 and q2 are colinear and q2 lies on segment p1q1
  if (o2 == 0 && this.onSegment(p1, q2, q1)) return true;

  // p2, q2 and p1 are colinear and p1 lies on segment p2q2
  if (o3 == 0 && this.onSegment(p2, p1, q2)) return true;

  // p2, q2 and q1 are colinear and q1 lies on segment p2q2
  if (o4 == 0 && this.onSegment(p2, q1, q2)) return true;

  return false; // Doesn't fall in any of the above cases
}

}