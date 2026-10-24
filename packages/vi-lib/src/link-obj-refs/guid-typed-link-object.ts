import { ViDataReader } from '../vi-data-reader';
import { ViVersion } from '../vi-version';
import { TypedLinkSaveInfoBase } from './typed-link-save-info-base';

export abstract class GuildTypedLinkObject extends TypedLinkSaveInfoBase {
  public stdViGUID: Uint8Array = new Uint8Array(0);

  private readViBool(reader: ViDataReader, version: ViVersion): boolean {
    if (version.compareTo(4, 5) >= 0) {
      return (reader.readByte('guid-typed-link-object.hasGuid.byte') !== 0);
    }
    return (reader.readUInt16('guid-typed-link-object.hasGuid.word') !== 0);
  }

  protected parseGuildTypedLinkObject(reader: ViDataReader, version: ViVersion) {
    super.parseTypedLinkSaveInfo(reader, version);

    if (version.compareTo(10, 0) >= 0) {
      const hasGuid = this.readViBool(reader, version);
      if (hasGuid) {
        this.stdViGUID = reader.readBytes(36, 'guid-typed-link-object.stdViGUID');
      }
    }
  }

}