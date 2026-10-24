import { ViDataReader } from '../vi-data-reader';
import { ViVersion } from '../../vi-version';
import { LinkSaveInfoBasic } from '../link-save-info-base';

/** Real name: LinkObjVIToLib */
export class VILB extends LinkSaveInfoBasic {
  public static readonly type = 'VILB';

  public parseContainer(reader: ViDataReader, version: ViVersion) {
    super.parseLinkSaveInfo(reader, version);
  }
}
