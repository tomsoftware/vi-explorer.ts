import { ViDataReader } from '../../vi-data-reader';
import { ViVersion } from '../../vi-version';
import { GuildTypedLinkObject } from '../guid-typed-link-object';

/** LinkObjVIToStdVILink */
export class LVIN extends GuildTypedLinkObject {
  public static readonly type = 'LVIN';

  public parseContainer(reader: ViDataReader, version: ViVersion) {
    super.parseGuildTypedLinkObject(reader, version);
  }
}
