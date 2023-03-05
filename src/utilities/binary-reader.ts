import { LogHandler } from './log-handler';

/** Class to provide a read pointer and read functions to a binary Buffer */
export class BinaryReader {
  private static log = new LogHandler('BinaryReader');
  public filename: string;
  protected readonly data: Uint8Array;
  protected readonly hiddenOffset: number;
  public readonly length: number;
  public pos: number;

  constructor(dataArray?: BinaryReader | Uint8Array | ArrayBuffer, offset = 0, length: number | null = null, filename: string | null = null) {
    if (offset == null) {
      offset = 0;
    }

    let dataLength = 0;
    let srcHiddenOffset = 0;

    if (dataArray == null) {
      this.data = new Uint8Array(0);
      dataLength = 0;
    } else if (dataArray instanceof BinaryReader) {
      // - if dataArray is BinaryReader use there data
      this.data = dataArray.data;
      dataLength = dataArray.length;
      srcHiddenOffset = dataArray.hiddenOffset;

      if (!filename) {
        filename = dataArray.filename;
      }
    } else if (dataArray instanceof Uint8Array) {
      this.data = dataArray;
      dataLength = dataArray.byteLength;
    } else if (dataArray instanceof ArrayBuffer) {
      this.data = new Uint8Array(dataArray);
      dataLength = dataArray.byteLength;
    } else {
      this.data = dataArray;
      dataLength = this.data.length;
      BinaryReader.log.error('BinaryReader from unknown: ' + (typeof dataArray) + '; size:' + dataLength + ' - filename: ' + filename);
    }

    if (length == null) {
      length = dataLength - offset;
    }

    this.hiddenOffset = offset + srcHiddenOffset;
    this.length = length;
    this.pos = this.hiddenOffset;

    this.filename = (filename) || '[Unknown]';

    Object.seal(this);
  }

  /** return the selected data as new Uint8Array */
  public readBuffer(length: number | null = null): Uint8Array {
    const dataOffset = this.pos;

    if (length == null) {
      length = this.length;
    }

    length = Math.min(this.length - this.getOffset(), length);

    this.pos += length;

    return new Uint8Array(this.data.buffer, dataOffset, length);
  }

  /** Read one Byte from stream */
  public readByte(): number {
    if ((this.pos < 0) || (this.pos > this.data.length)) {
      BinaryReader.log.error('read out of data: ' + this.filename + ' - size: ' + this.data.length + ' @ ' + this.pos);
      return 0;
    }

    const value = this.data[this.pos];
    this.pos++;

    return value;
  }

  /** read and return a length number of bytes from the input */
  public readBytes(length: number | null = null): number[] {
    return Array.from(this.readBuffer(length));
  }

  /** Read one DWord (4 Byte) from stream (little ending) */
  public readInt(): number {
    const value =
            (this.data[this.pos] << 24) |
            (this.data[this.pos + 1] << 16) |
            (this.data[this.pos + 2] << 8) |
            (this.data[this.pos + 3]);

    this.pos += 4;
    return value;
  }

  /** Read one DWord (4 Byte) from stream (big ending) */
  public readIntBE(): number {
    const value =
            (this.data[this.pos]) |
            (this.data[this.pos + 1] << 8) |
            (this.data[this.pos + 2] << 16) |
            (this.data[this.pos + 3] << 24);

    this.pos += 4;
    return value;
  }

  /** Read one Word (2 Byte) from stream (big ending) */
  public readWord(): number {
    const value = (this.data[this.pos]) | (this.data[this.pos + 1] << 8);
    this.pos += 2;
    return value;
  }

  /** Read a String */
  public readString(length: number | null = null): string {
    if (length == null) {
      length = this.length;
    }

    length = Math.min(this.length - this.getOffset(), length);

    let result = '';

    for (let i = 0; i < length; i++) {
      const v = this.data[this.pos];
      this.pos++;

      result += String.fromCharCode(v);
    }
    return result;
  }

  /** Read a String */
  public readNullString(offset: number): string {
    let pos = offset + this.hiddenOffset;
    let result = '';

    while (this.data[pos]) {
      const v = this.data[pos];
      pos++;
      result += String.fromCharCode(v);
    }

    return result;
  }

  /** reads bytes and returns a hex-string */
  public readHex(length: number | null = null): string {
    if (length === null) {
      length = this.length;
    }
    length = Math.min(this.length - this.getOffset(), length);

    let result = '';

    for (let i = 0; i < length; i++) {
      const v = this.data[this.pos];
      this.pos++;

      result += ('00' + v.toString(16)).slice(-2);
    }

    return result;
  }

  public getHex(offset: number | null, length: number) {
    let pos;
    if (offset == null) {
      pos = this.pos;
    } else {
      pos = offset + this.hiddenOffset;
    }

    let result = '';

    for (let i = 0; i < length; i++) {
      const v = this.data[pos];
      if (v == null) {
        return result + ' EOF';
      }
      pos++;

      result += ('00' + v.toString(16)).slice(-2) + ' ';
    }

    return result;
  }

  /** return the current curser position */
  public getOffset(): number {
    return this.pos - this.hiddenOffset;
  }

  /** set the current curser position */
  public setOffset(newPos: number): void {
    this.pos = newPos + this.hiddenOffset;
  }

  /** return true if the curser position is out of data */
  public eof(): boolean {
    const pos = this.pos - this.hiddenOffset;
    return ((pos >= this.length) || (pos < 0));
  }

  /** return a String of the data */
  public readAll(): string {
    this.setOffset(0);
    return this.readString(this.length);
  }
}
