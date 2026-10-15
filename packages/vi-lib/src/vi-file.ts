import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViHeader } from './vi-header';
import { ViResources } from './vi-resources';
import { STRG } from './container/strg';
import { ViVersion } from './vi-version';
import { ViSaveRecord } from './vi-save-record';
import { VCTP } from './container/vctp';
import { LinkedObjectContainer } from './container/linked-object-container';
import { CONP } from './container/conp';
import { CPC2 } from './container/cpc2';
import { VCTPObjectBase } from './vctp-parsing/vctp-object-base';
import { LIBN } from './container/libn';

export class ViFile {
  private static logging = new Logger('ViFile');
  private readonly reader: VirtualFile;
  private readonly header: ViHeader;
  public readonly resources: ViResources;
  private readonly viSaveRecord: ViSaveRecord;
  private vctp: VCTP | null = null;

  /** Return the internals file name of the VI */
  public get fileName(): string {
    return this.header.fileName ?? 'unknown';
  } 

  /** Return the version on this VI file */
  public get version(): ViVersion {
    return this.viSaveRecord.fileVersion;
  }

  constructor(reader: VirtualFile) {
    this.reader = reader;
    this.header = new ViHeader(this.reader);
    this.resources = new ViResources(reader, this.header.resourcesHeader);

    this.viSaveRecord = new ViSaveRecord(this);
  }

  /** Returns the STRG-Container with string description of the VI */
  public getStringDescription(): STRG {
    const container = this.resources.getResourceByName('STRG');
    const reader = container?.getReader(false);
    return new STRG(reader ?? null);
  }

  public getSaveRecord() {
    return this.viSaveRecord;
  }

  /** Returns Dependency information */
  public getLIvi() {
    const container = this.resources.getResourceByName('LIvi');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }

  /** Returns LIds as LinkedObjectContainer*/
  public getLIds() {
    const container = this.resources.getResourceByName('LIds');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }

  /** Returns LIfp as LinkedObjectContainer */
  public getLIfp() {
    const container = this.resources.getResourceByName('LIfp');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }

  /** Returns LIbd as LinkedObjectContainer */
  public getLIbd() {
    const container = this.resources.getResourceByName('LIbd');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }

  /** returns the LIBN container */
  public getLIBN(): LIBN {
    const container = this.resources.getResourceByName('LIBN');
    const reader = container?.getReader(false) ?? null;
    return new LIBN(reader);
  }

  /**
   * Returns the CPC2 Object
   * - ID to terminal in the vctp type definition
   * - This ID pointing the main terminal used for the password Hash
   **/
  public getCPC2() {
    const container = this.resources.getResourceByName('CPC2');
    const reader = container?.getReader(false);
    if (reader == null) {
      return null;
    }
    return new CPC2(reader);
  }

  /** Returns the CONP Object 
   * - ID to terminal in the vctp type definition 
   * - This ID might be pointing the main terminal connector of the VI
   **/
  public getCONP() {
    const container = this.resources.getResourceByName('CONP');
    const reader = container?.getReader(false);
    if (reader == null) {
      return null;
    }
    return new CONP(reader);
  }


  /** Returns VCTP "VI Consolidated Types" container */
  public getVCTP(): VCTP {
    if (this.vctp != null) {
      return this.vctp;
    }

    const container = this.resources.getResourceByName('VCTP');
    const reader = container?.getReader(true) ?? null;
    this.vctp = new VCTP(reader, this.version);
    return this.vctp;
  }

}
