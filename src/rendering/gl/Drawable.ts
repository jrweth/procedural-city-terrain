import {gl} from '../../globals';

// enum BufferType {
//   ELEMENT_ARRAY_BUFFER = 'ELEMENT_ARRAY_BUFFER',
//   ARRAY_BUFFER = 'ARRAY_BUFFER'
// }
//
// class Buffer {
//   buffer: WebGLBuffer;
//   bufferType: BufferType;
// }


abstract class Drawable {
  count: number = 0;
  numInstances: number = 1;

  //buffers: {[buffName: string]: Buffer};

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufInfo: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufTranslate: WebGLBuffer;
  bufBlockInfo: WebGLBuffer;

  idxBound: boolean = false;
  posBound: boolean = false;
  norBound: boolean = false;
  infoBound: boolean = false;
  colBound: boolean = false;
  translateBound: boolean = false;
  blockInfoBound: boolean = false;

  abstract create() : void;

  setNumInstances(num: number) {
    this.numInstances = num;
  }

  destory() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufNor);
    gl.deleteBuffer(this.bufCol);
  }

  generateIdx() {
    this.idxBound = true;
    this.bufIdx = gl.createBuffer();
  }

  generatePos() {
    this.posBound = true;
    this.bufPos = gl.createBuffer();
  }

  generateNor() {
    this.norBound = true;
    this.bufNor = gl.createBuffer();
  }

  generateInfo() {
    this.infoBound = true;
    this.bufInfo = gl.createBuffer();
  }

  generateCol() {
    this.colBound = true;
    this.bufCol = gl.createBuffer();
  }

  generateTranslate() {
    this.translateBound = true;
    this.bufTranslate = gl.createBuffer();
  }

  generateBlockInfo() {
    this.blockInfoBound = true;
    this.bufBlockInfo = gl.createBuffer();
  }

  bindIdx(): boolean {
    if (this.idxBound) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    }
    return this.idxBound;
  }

  bindPos(): boolean {
    if (this.posBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    }
    return this.posBound;
  }

  bindNor(): boolean {
    if (this.norBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    }
    return this.norBound;
  }

  bindInfo(): boolean {
    if (this.infoBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufInfo);
    }
    return this.infoBound;
  }

  bindCol(): boolean {
    if (this.colBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    }
    return this.colBound;
  }

  bindTranslate(): boolean {
    if (this.translateBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    }
    return this.translateBound;
  }

  bindBlockInfo(): boolean {
    if (this.blockInfoBound) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufBlockInfo);
    }
    return this.blockInfoBound;
  }

  elemCount(): number {
    return this.count;
  }

  drawMode(): GLenum {
    return gl.TRIANGLES;
  }



  //starting the process of abstracting this out since it is a huge pain to do each one individually
  // bufferExists(buffName: string) {
  //   return this.buffers.hasOwnProperty(buffName);
  // }
  //
  // generate(buffName: string, bufferType: BufferType) {
  //   if(!this.bufferExists(buffName)) {
  //     this.buffers[buffName] = {
  //       buffer: gl.createBuffer(),
  //       bufferType: bufferType
  //     }
  //   }
  // }
  //
  // bind(buffName: string, bufferType: BufferType | null): boolean {
  //   if(!this.bufferExists(buffName)) {
  //     this.generate(buffName, bufferType);
  //   }
  //   if(this.buffers[buffName].bufferType == BufferType.ARRAY_BUFFER) {
  //     gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[buffName].buffer);
  //   }
  //   else if(this.buffers[buffName].bufferType == BufferType.ELEMENT_ARRAY_BUFFER) {
  //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[buffName].buffer);
  //   }
  //
  //   return true;
  // }
};

export default Drawable;
