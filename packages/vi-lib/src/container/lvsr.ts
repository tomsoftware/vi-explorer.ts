import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Md5 } from '../utils/md5';


export class LVSR {
  private static logging = new Logger('LVSR');

  public versionNumber: number = 0;
  public unknown: number = 0;
  public flags: number = 0;
  public libPasswordHash: Md5;

  /** True it the protected flag is set */
  public get isProtected(): boolean {
    return ((this.flags & 0x2000) > 0);
  }

  /** unknown flags */
  public get unknownFlags(): number {
    return (this.flags & 0xDFFF);
  }

  /** return true if the VI has a library-password set */
  public get hasLibPassword(): boolean {
    return (this.libPasswordHash.isValid && !this.libPasswordHash.isEmpty);
  }

  constructor(reader: VirtualFile | null) {
    if (reader == null) {
        this.libPasswordHash = Md5.invalid;
        LVSR.logging.error('File has no LVSR container');
        return;
    }

    this.versionNumber = reader.readUInt32LE();
    this.unknown = reader.readUInt16LE();
    this.flags = reader.readUInt16LE();

    reader.seek(96);
    this.libPasswordHash = Md5.hashBuffer(reader.readBytes(16));
  }

}
