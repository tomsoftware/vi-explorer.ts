import { ByteString } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../vi-version';
import { Logger } from '@tomsoftware/logger';
import { ViDataReader } from '../vi-data-reader';

/** Abstract base class for all Link-Objects */
export abstract class LinkObjectBase {
  private static baseLogging = new Logger('LinkObjectBase');
  public tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }

  /** Aligns the current reader position to a given alignment */
  protected alignPaddingBytes(reader: ViDataReader, alignment: number) {
    const current = reader.tell();
    const padding = (current % alignment);
    if (padding == 0) {
      return;
    }

    // Jump over Padding bytes
    reader.seek(current + alignment - padding);
  }

  /** read a string prefixed with is 1 byte size */
  protected readBytePrefixedString(reader: ViDataReader): ByteString {
    const strLen = reader.readByte('link-object-base.byte-prefixed-string.length');
    return reader.readString(strLen, 'link-object-base.byte-prefixed-string');
  }

  /** read a string prefixed with is 4 byte size */
  protected readIntPrefixedString(reader: ViDataReader): ByteString {
    const strLen = reader.readUInt32BE('link-object-base.int-prefixed-string.length');
    if (strLen >= reader.leftLength()) {
      LinkObjectBase.baseLogging.error('Size of string is to big! ' + strLen + ' in ' + reader.getFilename());
      return ByteString.empty;
    }
    return reader.readString(strLen, 'link-object-base.int-prefixed-string');
  }

  /** Read a number that can be 16 or 32 bits */
  protected readVariableSizeFieldU2p2(reader: ViDataReader): number {
    const value = reader.readUInt16BE('link-object-base.var-size-field');
    if ((value & 0x8000) !== 0) {
      return ((value & 0x7fff) << 16) | reader.readUInt16BE('link-object-base.var-size-field.extended');
    }
    return value;
  }

  /** Parse data from current reader position into this LinkObject */
  public abstract parseContainer(reader: ViDataReader, version?: ViVersion): void;
}
