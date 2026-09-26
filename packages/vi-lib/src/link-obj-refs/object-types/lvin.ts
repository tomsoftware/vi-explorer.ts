import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../../vi-version';
import { GuildTypedLinkObject } from '../guid-typed-link-object';

/** LinkObjVIToStdVILink */
export class LVIN extends GuildTypedLinkObject {
  public static readonly type = 'LVIN';

  public parseContainer(reader: VirtualFile, version: ViVersion) {
    super.parseGuildTypedLinkObject(reader, version);
  }
}
