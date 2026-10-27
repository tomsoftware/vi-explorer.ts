import { ByteString } from '@tomsoftware/virtual-fs';
import { ViDataReader } from '../../vi-data-reader';
import { ViVersion } from '../../vi-version';
import { Logger } from '@tomsoftware/logger';
import { LinkSaveInfoBasic } from '../link-save-info-base';

/** real name: LinkObjVIToUDClassAPILink */
export class VIPI extends LinkSaveInfoBasic {
  public static readonly type = 'VIPI';
  private static logging = new Logger(VIPI.type);
  public apiLinkLibVersion: Uint8Array = new Uint8Array(0);
  public apiLinkIsInternal: number = 0;
  public apiLinkUnknown = 0;
  public apiLinkCallParentNodes = 0;
  public apiLinkContent: ByteString = ByteString.empty;

  public parseContainer(reader: ViDataReader, version: ViVersion) {
    super.parseLinkSaveInfo(reader, version);

    this.alignPaddingBytes(reader, 4);

    this.apiLinkLibVersion = reader.readBytes(8, 'vipi.apiLinkLibVersion');

    this.apiLinkIsInternal = reader.readByte('vipi.apiLinkIsInternal');

    if (version.compareTo(8, 1) >= 0) {
      this.apiLinkUnknown = reader.readByte('vipi.apiLinkUnknown');
    }

    if (version.compareTo(9, 0) >= 0) {
      this.apiLinkCallParentNodes = reader.readByte('vipi.apiLinkCallParentNodes');
    }

    this.apiLinkContent = this.readIntPrefixedString(reader);
  }
}
