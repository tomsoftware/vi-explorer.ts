import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViHeader } from './vi-header';
import { ViResources } from './vi-resources';

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

}
