import { Logger } from '@tomsoftware/logger';
import { ViFile } from './vi-file';
import { BDPW } from './container/bdpw';
import { TypeGroup } from './vctp-parsing/vctp-object-base';
import { Md5 } from './utils/md5';
import { ByteString } from '@tomsoftware/virtual-fs';

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

  /** Check if the BDPW hashes are matching this vi file by recalculation the hashes and comparing */
  public checkHashesAreValid(): boolean {
    const result = this.calcHashesForFile();
    if (result == null) {
      return false;
    }
    // check calculated hashes against file hashes
    return result.hash1.compare(this.bdpw.hash1) && result.hash2.compare(this.bdpw.hash2);
  }

  /** Calculates the hashes for this VI for a given password-hash */
  public calcHashes(passwordHash: Md5) {
    const hash1 = this.calcHash1(passwordHash);
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
      passwordHash,
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
    const bytePassword = ByteString.fromString(newPassword);
    const md5 = Md5.hashString(bytePassword);
    return this.calcHashes(md5);
  }

  /** Recalculate the Hash1 for this VI for a given password-hash */
  public calcHash1(passwordHash: Md5): Md5 | null {
    const viResources = this.vi.resources;

    const hash1 = Md5.stream();

    // add password hash
    hash1.update(passwordHash.toBuffer());

    // Add LIBN content
    if (viResources.resourceExists('LIBN')) {
      const separator = ByteString.fromString(':').buffer;
      const libn = this.vi.getLIBN();
      for(let i = 0; i < libn.names.length; i++) {
        if (i > 0) {
          hash1.update(separator);
        }
        hash1.update(libn.names[0].buffer);
      }
    }

    // Add content of versions container
    if (viResources.resourceExists('LVSR')) {
      //- Versions: 6,7,8,...
      const lvsr = viResources.getReaderByName('LVSR', false)!;
      const buffer = lvsr.getBytes(0, lvsr.length());
      hash1.update(buffer);
    }
    else if (viResources.resourceExists('LVIN')) {
      //- Versions: 5
      const lvin = viResources.getReaderByName('LVIN', false)!;
      const buffer = lvin.getBytes(0, lvin.length());
      hash1.update(buffer);
    }
    else {
      ViPassword.logging.error('Unable to detect the LVSR or LVIN container!');
      return null; //- Fail!
    }

    // Add Terminal information
    // - not sure when to use CPC2 and when CONP
    if (this.vi.version.compareTo(12) >= 0) {
      const conp = this.vi.getCONP();
      if (conp != null) {
        const terminalId = conp.first;
        const terminalTypeDefinition = this.vi.getVCTP().getById(terminalId); 
        if (terminalTypeDefinition == null) {
          ViPassword.logging.error('Unable to get terminal Type definition!');
          return null; //- Fail!
        }

        // count number of types in terminal/connector
        const counts = terminalTypeDefinition?.countGroups();
        hash1.updateWithInt32LE(counts[TypeGroup.Number]);
        hash1.updateWithInt32LE(counts[TypeGroup.String]);
        hash1.updateWithInt32LE(counts[TypeGroup.Path]);
      }
    }
    // calculate hash 1
    return hash1.finalize();
  }

  /** Recalculate the hash2 for this VI File */
  public calcHash2(hash1: Md5): Md5 | null {
    const blockReader = this.vi.getBlockDiagramReader(); 

    // create the MD5 from the block diagram
    let blockDiagramMd5: Md5;
    if (blockReader != null) {
      const length = blockReader.readUInt32BE();
      const data = blockReader.readBytes(length);
      blockDiagramMd5 = Md5.hashBuffer(data);
    }
    else {
      blockDiagramMd5 = Md5.empty;
    }

    // build hash2 = hash1 & md5(BDHc)
    const hash2 = Md5.stream();
    // add hash1
    hash2.update(hash1.toBuffer());
    // add block diagram hash to hash2
    hash2.update(blockDiagramMd5.toBuffer());

    // calculate hash 2
    return hash2.finalize();
  }

}
