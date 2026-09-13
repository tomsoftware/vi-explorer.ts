import { Logger } from '@tomsoftware/logger';
import { ViFile } from './vi-file';
import { BDPW } from './container/bdpw';
import { Tools } from './tools';

/** Manages the password information of a VI file */
export class ViPassword {
  private static logging = new Logger('ViPassword');

  /** Contains the password hash of the file */
  public readonly bdpw: BDPW;

  /** returns the file password hash (MD5) as hex string */
  public get passwordHashHex(): string {
    return Tools.bytesToHex(this.bdpw.passwordHash);
  }

  /** return true if a password is set in the VI file */
  public get fileHasPassword(): boolean {
    const hash = this.bdpw.passwordHash;
    return (hash.length !== 0 && !Tools.compareArray(Tools.emptyMd5, hash));
  }


  constructor(vi: ViFile) {
    const container = vi.resources.getResourceByName('BDPW');
    const reader = container?.getReader(false);

    this.bdpw = new BDPW(reader ?? null);
  }

}
