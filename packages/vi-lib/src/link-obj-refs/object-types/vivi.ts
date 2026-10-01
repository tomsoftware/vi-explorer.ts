import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../../vi-version';
import { GuildTypedLinkObject } from '../guid-typed-link-object';

/** real name: LinkObjVIToStdVILink */
export class VIVI extends GuildTypedLinkObject {
  public static readonly type = 'VIVI';

  public parseContainer(reader: VirtualFile, version: ViVersion) {
    super.parseGuildTypedLinkObject(reader, version);
  }
}
