import { Logger } from '@tomsoftware/logger';
import { ByteString } from '@tomsoftware/virtual-fs';
import { ViDataReader } from '../vi-data-reader';

/** Contains help information about this VI */
export class STRG {
  private static logging = new Logger('STRG');

  private reader: ViDataReader | null = null;
  private length = 0;
  private offset = 0;

  /** return the description of this VI File */
  public get description(): ByteString {
    if (this.reader == null) {
        return ByteString.empty;
    }
    this.reader.seek(this.offset);

    return this.reader.readString(this.length, 'strg.description');
  }

  constructor(reader: ViDataReader | null) {
    if (reader == null) {
        STRG.logging.error('File has no string description');
        return;
    }

    this.reader = reader;
    this.length = reader.readUInt32('strg.length');
    this.offset = reader.tell();
  }
}
