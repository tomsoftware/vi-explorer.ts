import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../vi-version';
import { TypedLinkSaveInfoBase } from './typed-link-save-info-base';

export abstract class GuildTypedLinkObject extends TypedLinkSaveInfoBase {
  public stdViGUID: Uint8Array = new Uint8Array(0);

  private readViBool(reader: VirtualFile, version: ViVersion): boolean {
    if (version.compareTo(4, 5) >= 0) {
      return (reader.readByte() !== 0);
    }
    return (reader.readUInt16BE() !== 0);
  }

  protected parseGuildTypedLinkObject(reader: VirtualFile, version: ViVersion) {
    super.parseTypedLinkSaveInfo(reader, version);

    if (version.compareTo(10, 0) >= 0) {
      const hasGuid = this.readViBool(reader, version);
      if (hasGuid) {
        this.stdViGUID = reader.readBytes(36);
      }
    }
  }

}