import { Logger } from "@tomsoftware/logger";
import { ViDataReader } from "../vi-data-reader";

/** Describes how a heap tag's content is encoded in its header. */
export enum HeapContentDataType {
  False,
  OneByte,
  TwoBytes,
  ThreeBytes,
  FourBytes,
  Reserved,
  VariableLength,
  True,
}

/** Reads content payloads directly from the heap stream according to their header type. */
export class HeapContentWrapper {
  private static readonly logging = new Logger("HeapContentWrapper");

  public readonly contentDataType: HeapContentDataType;
  public readonly objectHeaderOffset: number;
  private readonly reader: ViDataReader | null;
  public readonly length: number;

  public constructor(contentDataType: HeapContentDataType, container: ViDataReader, objectHeaderOffset: number) {
    this.contentDataType = contentDataType;
    this.objectHeaderOffset = objectHeaderOffset;

    const length = HeapContentWrapper.parseLength(contentDataType, container);
    if (length <= 0) {
      this.length = 0;
      this.reader = null;
      return;
    }
    const pos = container.tell();
    this.length = length;
    this.reader = container.createSubReader(container.tell(), length);
    // jump over data
    container.seek(pos + length);
  }

  /** return the content reader ot throw if not data is available */
  public getReader(): ViDataReader {
    if (this.reader == null) {
      throw 'There is no content to read!';
    }
    return this.reader;
  }

  /** return all bytes of this content */
  public getBytes(label: string): Uint8Array {
    if (this.reader == null) {
      return new Uint8Array(0);
    }
    return this.reader.getBytes(0, this.length, label);
  }

  /** return the wrapped type-name as string */
  public get typeAsString(): string {
    return HeapContentDataType[this.contentDataType];
  }

  /** return true if there is a reader to read data from */
  public get hasReader(): boolean {
    return this.reader != null;
  }

  /** return true if the wrapped type is boolean  */
  public get isBool(): boolean {
    return this.contentDataType === HeapContentDataType.False || this.contentDataType === HeapContentDataType.True; 
  }

  /** return the bool-value of this content */
  public getBool(): boolean {
    if (this.contentDataType === HeapContentDataType.True) {
      return true;
    }
    if (this.contentDataType === HeapContentDataType.False) {
      return true;
    }

    HeapContentWrapper.logging.error(`Content data type ${this.contentDataType} does not represent a boolean`);
    return false;
  }

  /** returns the number of bytes this content uses in file */
  private static parseLength(contentDataType: HeapContentDataType, container: ViDataReader): number {
    switch (contentDataType) {
      case HeapContentDataType.OneByte:
      case HeapContentDataType.TwoBytes:
      case HeapContentDataType.ThreeBytes:
      case HeapContentDataType.FourBytes:
        return contentDataType;
      case HeapContentDataType.VariableLength:
        return container.readVariableUInt124('content-variable.length');
      case HeapContentDataType.False:
      case HeapContentDataType.True:
        return 0;
      case HeapContentDataType.Reserved:
      default:
        throw new RangeError(`Unsupported heap content data type ${contentDataType}`);
    }
  }

  /** just jumps over the bytes */
  public ignore() {

  }
}
