import { ViDataReader } from '../../vi-data-reader';
import { ViVersion } from '../../vi-version';
import { HeapToViLinkObject } from '../heap-to-vi-link-object';


/** real name: LinkObjTypeDefToCCLink */
export class TDCC extends HeapToViLinkObject {
  public static readonly type = 'TDCC';

  public parseContainer(reader: ViDataReader, version: ViVersion) {
    super.parseHeapToVILinkObject(reader, version);
  }
}
