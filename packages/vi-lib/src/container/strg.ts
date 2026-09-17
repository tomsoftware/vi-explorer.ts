import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';

/** Contains help information about this VI */
export class STRG {
  private static logging = new Logger('STRG');

  private reader: VirtualFile | null = null;
  private length = 0;
  private offset = 0;

  /** return the description of this VI File */
  public get description(): string {
    if (this.reader == null) {
        return '';
    }
    this.reader.seek(this.offset);

    return this.reader.readAsciiString(this.length);
  }

  constructor(reader: VirtualFile | null) {
    if (reader == null) {
        STRG.logging.error('File has no string description');
        return;
    }

    this.reader = reader;
    this.length = reader.readUInt32LE();
    this.offset = reader.tell();
  }
}
