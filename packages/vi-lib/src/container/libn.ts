import { Logger } from '@tomsoftware/logger';
import { ByteString } from '@tomsoftware/virtual-fs';
import { ViDataReader } from '../vi-data-reader';

/** List of parent Libraries */
export class LIBN {
  private static logging = new Logger('LIBN');

  private reader: ViDataReader | null = null;
  private namesCache: ByteString[] | null = null;

  /** return the names of the libraries used by this vi */
  public get names(): ByteString[] {
    if (this.namesCache != null) {
      return this.namesCache;
    }

    if (this.reader == null) {
      return [];
    }

    this.reader.seek(0);

    const names: ByteString[] = [];
    const count = this.reader.readUInt32('libn.count');
    if (count > 500) {
      LIBN.logging.error('Unable to get number of names form LIBN! Count=' + count);
      return [];
    }

    for (let i = 0; i < count; i++) {
      const len = this.reader.readByte('libn.name-length');
      names.push(this.reader.readString(len, 'libn.name'));
    }

    this.namesCache = names;

    return this.namesCache;
  }

  constructor(reader: ViDataReader | null) {
    if (reader == null) {
        LIBN.logging.error('File has no library name section!');
        return;
    }

    this.reader = reader;
  }
}
