import {XRule} from 'x-rule';


export class XReplace implements XRule {
  output: string;

  constructor(output: string) {
    this.output = output;
  }

  apply(string: string, params: any) {
    return this.output;
  }

}