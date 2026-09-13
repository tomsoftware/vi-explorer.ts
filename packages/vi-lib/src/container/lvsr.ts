import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';


export class LVSR {
  private static logging = new Logger('LVSR');

  public versionNumber: number = 0;
  public unknown: number = 0;
  public flags: number = 0;
  public libPasswordHash: Uint8Array;

  /** True it the protected flag is set */
  public get isProtected(): boolean {
    return ((this.flags & 0x2000) > 0);
  }

  /** unknown flags */
  public get unknownFlags(): number {
    return (this.flags & 0xDFFF);
  }


  constructor(reader: VirtualFile | null) {
    if (reader == null) {
        this.libPasswordHash = new Uint8Array(0);
        LVSR.logging.error('File has no LVSR container');
        return;
    }

    this.versionNumber = reader.readUInt32LE();
    this.unknown = reader.readUInt16LE();
    this.flags = reader.readUInt16LE();

    reader.seek(96);
    this.libPasswordHash = reader.readBytes(16);
  }

}
