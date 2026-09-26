import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../../vi-version';
import { LinkSaveInfoBasic } from '../link-save-info-base';

/** Real name: LinkObjVIToLib */
export class VILB extends LinkSaveInfoBasic {
  public static readonly type = 'VILB';

  public parseContainer(reader: VirtualFile, version: ViVersion) {
    super.parseLinkSaveInfo(reader, version);
  }
}
