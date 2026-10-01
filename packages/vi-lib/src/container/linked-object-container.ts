import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';
import { LinkObjectContainerParser } from '../link-object-container-parser';
import { LinkObjectBase } from '../link-obj-refs/link-object-base';
import { ViVersion } from '../vi-version';

/** Gain access to containers using the "linked-object"-serializer 
 *   e.g. "LIds", "LIvi", "LIfp", "LIbd"
*/
export class LinkedObjectContainer {
  private static logging = new Logger('LinkedObjectContainer');
  public header: LinkObjectBase | null = null;
  public objects: Array<LinkObjectBase | any> = [];
  private reader: VirtualFile | null = null;

  constructor(reader: VirtualFile | null, version: ViVersion) {
    if (reader == null) {
        LinkedObjectContainer.logging.error('File has no LinkObj Refs section!');
        return;
    }

    this.reader = reader;

    const parser = new LinkObjectContainerParser(version);
    const result = parser.parse(this.reader);
    this.objects = result.objects;
    this.header = result.header;

    console.log(this.objects);

    LinkedObjectContainer.logging.log(`Parsed ${this.objects.length} entries`);
    
  }
}
