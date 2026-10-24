import { ViDataReader } from '../vi-data-reader';
import { ViVersion } from '../../vi-version';
import { GuildTypedLinkObject } from '../guid-typed-link-object';

/** real name: LinkObjVIToStdVILink */
export class VIVI extends GuildTypedLinkObject {
  public static readonly type = 'VIVI';

  public parseContainer(reader: ViDataReader, version: ViVersion) {
    super.parseGuildTypedLinkObject(reader, version);
  }
}
