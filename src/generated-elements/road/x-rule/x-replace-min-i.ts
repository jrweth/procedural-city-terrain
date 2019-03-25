import {XRule} from 'x-rule';


/**
 * replace
 */
export class XReplaceMinI implements XRule {
  output: string;
  minIterations: number;

  constructor(output: string, minIterations: number) {
    this.output = output;
    this.minIterations = minIterations;
  }

  apply(string: string, params: any) {
    if(params.iterations < this.minIterations) {
      return this.output;
    }
    return this.output;
  }

}