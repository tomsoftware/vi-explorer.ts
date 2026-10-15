import { Logger } from '@tomsoftware/logger';
import { ViFile } from './vi-file';
import { BDPW } from './container/bdpw';
import { TypeGroup } from './vctp-parsing/vctp-object-base';
import { Md5 } from './utils/md5';

/** Manages the password information of a VI file */
export class ViPassword {
  private static logging = new Logger('ViPassword');

  /** Contains the password hash of the file */
  public readonly bdpw: BDPW;

  private readonly vi: ViFile;

  /** returns the file password hash (MD5) as hex string */
  public get passwordHashHex(): string {
    return this.bdpw.passwordHash.toHex();
  }

  /** return true if a password is set in the VI file */
  public get fileHasPassword(): boolean {
    const hash = this.bdpw.passwordHash;

    return (this.bdpw.hasPassword && !this.bdpw.isPasswordEmpty);
  }

  constructor(vi: ViFile) {
    const container = vi.resources.getResourceByName('BDPW');
    const reader = container?.getReader(false);

    this.vi = vi;

    this.bdpw = new BDPW(reader ?? null);
  }

  /** Calculates the hashes for this VI for a given password-hash */
  public calcHashes(password: Md5) {
    const hash1 = this.calcHash1(password);
    if (hash1 == null) {
      ViPassword.logging.error('Unable to calculate file hashes!');
      return null;
    }
    const hash2 = this.calcHash2(hash1);
    if (hash2 == null) {
      ViPassword.logging.error('Unable to calculate file hashes!');
      return null;
    }

    return {
      password,
      hash1,
      hash2,
    }
  }

  /** Re-Calculates the file hashes for this VI */
  public calcHashesForFile() {
    return this.calcHashes(this.bdpw.passwordHash);
  }

  /** Calculates the hashes for this VI for a given password-string */
  public calcHashesForPassword(newPassword: string) {
    const md5 = Md5.fromString(newPassword);
    return this.calcHashes(md5);
  }

  /** recalculate the Hash1 */
  public calcHash1(passwordHash: Md5) {
    const viResources = this.vi.resources;

    const hash1 = Md5.stream();

    // add password hash
    hash1.updateBuffer(passwordHash.toBuffer());

    // Add LIBN content
    if (viResources.resourceExists('LIBN')) {
      const libn = this.vi.getLIBN();
      hash1.updateString(libn.names.join(':'));
    }

    // Add content of versions container
    if (viResources.resourceExists('LVSR')) {
      //- Versions: 6,7,8,...
      const lvsr = viResources.getReaderByName('LVSR', false)!;
      const buffer = lvsr.getBytes(0, lvsr.length());
      hash1.updateBuffer(buffer);
    }
    else if (viResources.resourceExists('LVIN')) {
      //- Versions: 5
      const lvin = viResources.getReaderByName('LVIN', false)!;
      const buffer = lvin.getBytes(0, lvin.length());
      hash1.updateBuffer(buffer);
    }
    else {
      ViPassword.logging.error('Unable to detect the LVSR or LVIN container!');
      return null; //- Fail!
    }

    // Add Terminal information
    // - not sure when to use CPC2 and when CONP
    const cpc2 = this.vi.getCONP();
    if (cpc2 != null) {
      const terminalId = cpc2.first;
      const terminalTypeDefinition = this.vi.getVCTP().getById(terminalId); 
      if (terminalTypeDefinition == null) {
        ViPassword.logging.error('Unable to get terminal Type definition!');
        return null; //- Fail!
      }

      // count number of types in terminal/connector
      const counts = terminalTypeDefinition?.countGroups();
      hash1.updateIntLE(counts[TypeGroup.Number]);
      hash1.updateIntLE(counts[TypeGroup.String]);
      hash1.updateIntLE(counts[TypeGroup.Path]);
    }

    // calculate hash 1
    return hash1.finalize();
  }

  public calcHash2(hash1: Md5): Md5 | null {
    const hash2 = Md5.stream();
    const viResources = this.vi.resources;

    hash2.updateBuffer(hash1.toBuffer());

    let blockName = '';
    let compressing: boolean;
    if (viResources.resourceExists('BDHc')) {
      // for Version 10,11,12
      blockName = 'BDHc';
      compressing = true;
    } else if (viResources.resourceExists('BDHb')) {
      // for Version 7,8
      blockName = 'BDHb';
      compressing = true;
    } else if (viResources.resourceExists('BDHP')) {
      // for Version 5,6,7beta
      blockName = 'BDHb';
      compressing = false;
    } else {
      ViPassword.logging.warn('Unable to detect the block-diagram container! Block diagram removed?');
      blockName = '';
      compressing = false;
    }

    if (blockName != '') {
      // add block diagram to hash
      const reader = viResources.getReaderByName(blockName, compressing)!;
      hash2.updateBuffer(reader.getBytes(0, reader.length()));
    }

    // calculate hash 2
    return hash2.finalize();
  }

}
