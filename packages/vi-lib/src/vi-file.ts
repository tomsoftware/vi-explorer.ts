import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViHeader } from './vi-header';
import { ViResources } from './vi-resources';
import { STRG } from './container/strg';

export class ViFile {
  private static logging = new Logger('ViFile');
  private readonly reader: VirtualFile;
  private readonly header: ViHeader;
  public readonly resources: ViResources;

  /** Return the internals file name of the VI */
  public get fileName(): string {
    return this.header.fileName ?? 'unknown';
  } 

  constructor(reader: VirtualFile) {
    this.reader = reader;
    this.header = new ViHeader(this.reader);
    this.resources = new ViResources(reader, this.header.resourcesHeader);
  }

  /** Returns the STRG-Container with string description of the VI */
  public getStringDescription(): STRG {
    const container = this.resources.getResourceByName('STRG');
    const reader = container?.getReader(false);
    return new STRG(reader ?? null);
  }
}
