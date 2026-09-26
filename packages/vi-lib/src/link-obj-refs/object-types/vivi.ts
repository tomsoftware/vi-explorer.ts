import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../../vi-version';
import { Logger } from '@tomsoftware/logger';
import { GuildTypedLinkObject } from '../guid-typed-link-object';

/** real name: LinkObjVIToStdVILink */
export class VIVI extends GuildTypedLinkObject {
  public static readonly type = 'VIVI';
  private static logging = new Logger(VIVI.type);

  public parseContainer(reader: VirtualFile, version: ViVersion) {
    super.parseGuildTypedLinkObject(reader, version);
  }
}
