import { ViDataReader } from '../../vi-data-reader';
import { LinkObjectBase } from '../link-object-base';
import { ViVersion } from '../../vi-version';

export class PICT extends LinkObjectBase {
  public static readonly type = 'PICT';

  public parseContainer(_: ViDataReader, _version: ViVersion) {
    // placeholder
  }
}

