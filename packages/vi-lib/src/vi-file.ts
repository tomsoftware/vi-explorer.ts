import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViHeader } from './vi-header';
import { ViResources } from './vi-resources';

export class ViFile {
  private static logging = new Logger('ViFile');
  private reader: VirtualFile;
  public resources: ViResources | null = null;

  constructor(reader: VirtualFile) {
    this.reader = reader;

    this.read();
  }

  private read(): boolean {
    const viHeader = new ViHeader(this.reader);

    if (viHeader.resourcesHeader == null) {
      ViFile.logging.error('No resource header found in file ' + this.reader.getFilename());
      return false;
    }

    this.resources = new ViResources(viHeader.getResourceHeaderReader(), viHeader.getDataReader());

    return true;
  }
}
