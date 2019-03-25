import {XRule} from 'x-rule';
let Prando = require('prando').default;


export class OutputPercent {
  output: string;
  percentage: number;
}

export class XReplacePercent implements XRule {
  outputs: OutputPercent[];
  seed: number;
  prando: any;


  constructor(outputs: OutputPercent[], seed: number) {
    this.outputs = outputs;
    this.prando = new Prando(seed);
    this.seed = seed;
  }

  apply(string: string) {
    let startingPercent = 0;
    let percent = this.prando.next();

    //loop through outputs
    for (let i = 0; i < this.outputs.length; i++) {
      if (percent >= startingPercent
        && percent < startingPercent + this.outputs[i].percentage
      ) {
        return this.outputs[i].output;
      }
      startingPercent += this.outputs[i].percentage;
    }

    return '';
  }

}