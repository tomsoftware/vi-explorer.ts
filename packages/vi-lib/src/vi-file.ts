import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViHeader } from './vi-header';
import { ViResources } from './vi-resources';
import { STRG } from './container/strg';
import { ViVersion } from './vi-version';
import { ViSaveRecord } from './vi-save-record';

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

}
