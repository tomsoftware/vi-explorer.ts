import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../vi-version';

/** Abstract base class for all Link-Objects */
export abstract class LinkObjectBase {
  public tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }

  /** Aligns the current reader position to a given alignment */
  protected alignPaddingBytes(reader: VirtualFile, alignment: number) {
    const current = reader.tell();
    const padding = (current % alignment);
    if (padding == 0) {
      return;
    }

    // Jump over Padding bytes
    reader.seek(current + alignment - padding);
  }

  protected readVariableSizeFieldU2p2(reader: VirtualFile): number {
    const value = reader.readUInt16BE();
    if ((value & 0x8000) !== 0) {
      return ((value & 0x7fff) << 16) | reader.readUInt16BE();
    }
    return value;
  }

  /** read a string prefixed with is 1 byte size */
  protected readBytePrefixedString(reader: VirtualFile) {
    const strLen = reader.readByte();
    return reader.readAsciiString(strLen);
  }

    /** read a string prefixed with is 4 byte size */
  protected readIntPrefixedString(reader: VirtualFile) {
    const strLen = reader.readUInt32BE();
    return reader.readAsciiString(strLen);
  }

  /** Parse data from current reader position into this LinkObject */
  public abstract parseContainer(reader: VirtualFile, version?: ViVersion): void;
}
