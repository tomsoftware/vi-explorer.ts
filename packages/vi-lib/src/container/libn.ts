import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';

/** List of parent Libraries */
export class LIBN {
  private static logging = new Logger('LIBN');

  private reader: VirtualFile | null = null;
  private namesCache: string[] | null = null;

  /** return the names of the libraries used by this vi */
  public get names(): string[] {
    if (this.namesCache != null) {
      return this.namesCache;
    }

    if (this.reader == null) {
      return [];
    }

    this.reader.seek(0);

    const names: string[] = [];
    const count = this.reader.readUInt32LE();
    for (let i = 0; i < count; i++) {
      const len = this.reader.readByte();
      names.push(this.reader.readAsciiString(len));
    }

    this.namesCache = names;

    return this.namesCache;
  }

  constructor(reader: VirtualFile | null) {
    if (reader == null) {
        LIBN.logging.error('File has no library name section!');
        return;
    }

    this.reader = reader;
  }
}
