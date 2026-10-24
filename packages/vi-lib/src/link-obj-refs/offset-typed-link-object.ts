import { ViDataReader } from '../vi-data-reader';
import { ViVersion } from '../vi-version';
import { TypedLinkSaveInfoBase } from './typed-link-save-info-base';
import { Logger } from '@tomsoftware/logger';

export abstract class OffsetTypedLinkObject extends TypedLinkSaveInfoBase {
  private static offsetTypedLogging = new Logger('OffsetTypedLinkObject');

  private offsetList: number [] = [];

  private parseLinkOffsetList(reader: ViDataReader): number[] {
    const count = reader.readUInt32('offset-typed-link-object.count');
    if ((count * 4) > reader.leftLength()) {
      OffsetTypedLinkObject.offsetTypedLogging.error('');
      return [];
    }

    const offsetList: number[] = [];
    for (let i = 0; i< count; i++) {
      offsetList.push(reader.readUInt32('offset-typed-link-object.offset'));
    }

    return offsetList;
  }

  protected parseOffsetTypedLinkObject(reader: ViDataReader, version: ViVersion) {
    super.parseTypedLinkSaveInfo(reader, version);

    if (version.compareTo(8, 2) >= 0) {
      this.offsetList = this.parseLinkOffsetList(reader);
    }
  }

}