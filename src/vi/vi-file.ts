import { BinaryReader } from '@/utilities/binary-reader';
import { LogHandler } from '@/utilities/log-handler';
import { ViHeader } from './vi-header';
import { ViResources } from './vi-resources';

export class ViFile {
  private static logging = new LogHandler('ViFile');
  private reader: BinaryReader;
  public resources: ViResources | null = null;

  constructor(reader: BinaryReader) {
    this.reader = reader;

    this.read();
  }

  private read(): boolean {
    const viHeader = new ViHeader(this.reader);

    if (viHeader.resourcesHeader == null) {
      ViFile.logging.error('No resource header found in file ' + this.reader.filename);
      return false;
    }

    this.resources = new ViResources(viHeader.getResourceHeaderReader(), viHeader.getDataReader());

    return true;
  }
}
