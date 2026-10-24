import { ViDataReader } from '../vi-data-reader';
import { ViVersion } from '../../vi-version';
import { TypedLinkSaveInfoBase } from '../typed-link-save-info-base';


/** real name: LinkObjVIToCCLink */
export class VICC extends TypedLinkSaveInfoBase {
  public static readonly type = 'VICC';

  public parseContainer(reader: ViDataReader, version: ViVersion) {
    super.parseTypedLinkSaveInfo(reader, version);
  }
}
