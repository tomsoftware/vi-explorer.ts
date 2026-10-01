import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../../vi-version';
import { HeapToViLinkObject } from '../heap-to-vi-link-object';


/** real name: LinkObjTypeDefToCCLink */
export class TDCC extends HeapToViLinkObject {
  public static readonly type = 'TDCC';

  public parseContainer(reader: VirtualFile, version: ViVersion) {
    super.parseHeapToVILinkObject(reader, version);
  }
}
