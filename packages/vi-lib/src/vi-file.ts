import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViHeader } from './vi-header';
import { ViResources } from './vi-resources';

export class ViFile {
  private static logging = new Logger('ViFile');
  private reader: VirtualFile;
  private header: ViHeader;
  public resources: ViResources | null = null;

  /** Return the internals file name of the VI */
  public get fileName(): string {
    return this.header.fileName ?? 'unknown';
  } 

  constructor(reader: VirtualFile) {
    this.reader = reader;
    this.header = new ViHeader(this.reader);

    this.read(this.header);
  }

  private read(header: ViHeader): boolean {
    if (header.resourcesHeader == null) {
      ViFile.logging.error('No resource header found in file ' + this.reader.getFilename());
      return false;
    }

    this.resources = new ViResources(header.getResourceHeaderReader(), header.getDataReader());

    return true;
  }
}
