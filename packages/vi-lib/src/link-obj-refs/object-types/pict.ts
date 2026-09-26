import { VirtualFile } from '@tomsoftware/virtual-fs';
import { LinkObjectBase } from '../link-object-base';
import { ViVersion } from '../../vi-version';

export class PICT extends LinkObjectBase {
  public static readonly type = 'PICT';

  public parseContainer(_: VirtualFile, _version: ViVersion) {
    // placeholder
  }
}

