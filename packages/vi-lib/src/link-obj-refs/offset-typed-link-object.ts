import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../vi-version';
import { TypedLinkSaveInfoBase } from './typed-link-save-info-base';
import { Logger } from '@tomsoftware/logger';

export abstract class OffsetTypedLinkObject extends TypedLinkSaveInfoBase {
  private static offsetTypedLogging = new Logger('OffsetTypedLinkObject');

  private offsetList: number [] = [];

  private parseLinkOffsetList(reader: VirtualFile): number[] {
    const count = reader.readUInt32BE();
    if ((count * 4) > reader.leftLength()) {
      OffsetTypedLinkObject.offsetTypedLogging.error('');
      return [];
    }

    const offsetList: number[] = [];
    for (let i = 0; i< count; i++) {
      offsetList.push(reader.readUInt32BE());
    }

    return offsetList;
  }

  protected parseOffsetTypedLinkObject(reader: VirtualFile, version: ViVersion) {
    super.parseTypedLinkSaveInfo(reader, version);

    if (version.compareTo(8, 2) >= 0) {
      this.offsetList = this.parseLinkOffsetList(reader);
    }
  }

}