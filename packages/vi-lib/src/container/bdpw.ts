import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Md5 } from '../utils/md5';

/** Contains information about the password set on the vi */
export class BDPW {
  private static logging = new Logger('BDPW');

  /** the password hashed as MD5 */
  public passwordHash: Md5;
  /** hash1 to validate the password hash */
  public hash1: Md5;
  /** hash2 to validate the password hash */
  public hash2: Md5;

  /** 'True' if password information are available */
  public get hasPassword() {
    return this.passwordHash.isValid;
  }

  /** Has empty password */
  public get isPasswordEmpty() {
    return this.passwordHash.isEmpty;
  }

  constructor(reader: VirtualFile | null) {
    if (reader == null) {
        BDPW.logging.error('File has no password information! - Version < 5.0?');

        this.passwordHash = Md5.invalid;
        this.hash1 = Md5.invalid;
        this.hash2 = Md5.invalid;
        return;
    }

    this.passwordHash = Md5.fromBuffer(reader.readBytes(16));
    this.hash1 = Md5.fromBuffer(reader.readBytes(16));
    this.hash2 = Md5.fromBuffer(reader.readBytes(16));
  }
}
