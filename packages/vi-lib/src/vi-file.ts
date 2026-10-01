import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViHeader } from './vi-header';
import { ViResources } from './vi-resources';
import { STRG } from './container/strg';
import { ViVersion } from './vi-version';
import { ViSaveRecord } from './vi-save-record';
import { VCTP } from './container/vctp';
import { LinkedObjectContainer } from './container/linked-object-container';

export class ViFile {
  private static logging = new Logger('ViFile');
  private readonly reader: VirtualFile;
  private readonly header: ViHeader;
  public readonly resources: ViResources;
  private readonly viSaveRecord: ViSaveRecord;

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

  /** Returns */
  public getLIds() {
    const container = this.resources.getResourceByName('LIds');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }

  /** Returns */
  public getLIfp() {
    const container = this.resources.getResourceByName('LIfp');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }

  /** Returns */
  public getLIbd() {
    const container = this.resources.getResourceByName('LIbd');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }


  /** Returns VCTP "VI Consolidated Types" container */
  public getVCTP(): VCTP {
    const container = this.resources.getResourceByName('VCTP');
    const reader = container?.getReader(true) ?? null;
    return new VCTP(reader, this.version);
  }

}
