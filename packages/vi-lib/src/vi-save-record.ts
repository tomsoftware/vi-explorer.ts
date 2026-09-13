import { LVSR } from './container/lvsr';
import { Tools } from './tools';
import { ViFile } from './vi-file';
import { Logger } from '@tomsoftware/logger';
import { ViVersion } from './vi-version';

/** Process the file save record */
export class ViSaveRecord {
  private static logging = new Logger('ViSaveRecord');
  public readonly lvsr: LVSR;

  /** return true if a Library password is set in the VI file */
  public get fileHasLibraryPassword(): boolean {
    const hash = this.lvsr.libPasswordHash;
    return (hash.length !== 0 && !Tools.compareArray(Tools.emptyMd5, hash));
  }

  /** returns the library password hash (MD5) as hex string */
  public get libraryPasswordHashHex(): string {
    return Tools.bytesToHex(this.lvsr.libPasswordHash);
  }


  /** Return the Version of the VI file */
  public get fileVersion(): ViVersion {
    return new ViVersion(this.lvsr.versionNumber);
  }

  constructor(vi: ViFile) {
    const container = vi.resources.getResourceByName('LVSR');
    const reader = container?.getReader(false);
    
    this.lvsr = new LVSR(reader ?? null);
  }
}
