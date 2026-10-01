import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../../vi-version';
import { OffsetTypedLinkObject } from '../offset-typed-link-object';
import { LinkObjectBase } from '../link-object-base';
import { HeapToViLinkObject } from '../heap-to-vi-link-object';


/** real name: LinkObjIUseToVILink */
export class IUVI extends HeapToViLinkObject {
  public static readonly type = 'IUVI';

  public iuseStr: string = '';

  public parseContainer(reader: VirtualFile, version: ViVersion) {

    if (version.compareTo(8, 2) >= 0) {
        this.parseHeapToVILinkObject(reader, version);
    }
    else {
      this.parseOffsetTypedLinkObject(reader, version);
    }

    if (version.compareTo(8, 0) >= 0) {
      this.iuseStr = this.readBytePrefixedString(reader);
      this.alignPaddingBytes(reader, 2);
      
    }

  }
}
