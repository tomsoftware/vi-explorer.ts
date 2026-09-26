import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';
import { LinkObjectContainerParser } from '../link-object-container-parser';
import { LinkObjectBase } from '../link-obj-refs/link-object-base';
import { ViVersion } from '../vi-version';

/** Stored dependencies between this VI and other VIs, classes and libraries. */
export class LIVI {
  private static logging = new Logger('LIvi');
  private objects: Array<LinkObjectBase | any> = [];
  private reader: VirtualFile | null = null;

  constructor(reader: VirtualFile | null, version: ViVersion) {
    if (reader == null) {
        LIVI.logging.error('File has no LinkObj Refs section!');
        return;
    }

    this.reader = reader;

    const parser = new LinkObjectContainerParser(version);
    this.objects = parser.parse(this.reader);
    LIVI.logging.log(`Parsed ${this.objects.length} entries`);
    
  }
}
