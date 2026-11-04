import { ViDataReader } from '../vi-data-reader';
import { ViVersion } from '../vi-version';
import { Logger } from '@tomsoftware/logger';
import { LinkSaveInfoBasic } from './link-save-info-base';

interface TypedLinkTarget {
  index: number;
  flags: number;
}


export abstract class TypedLinkSaveInfoBase extends LinkSaveInfoBasic {
  private static loggerTypedLink = new Logger('TypedLinkSaveInfoBase');


  public typedLinkTD: TypedLinkTarget | null = null;
  public viLinkUnknown1 = 0;
  public viLinkLibVersion = 0;
  public viLinkUnknown2 = 0;
  public viLinkUnknown3 = 0;
  public viLinkUnknown4 = 0;
  public viLinkUnknown5 = 0;
  public typedLinkFlags = 0;

  protected parseVILinkRefInfo(reader: ViDataReader, version: ViVersion) {
    let flagBt = 0xff;
    if (version.compareTo(14, 0) >= 0) {
      flagBt = reader.readByte('typed-link-save-info.flagBt');
    }

    if (flagBt !== 0xff) {
      this.viLinkUnknown1 = flagBt & 0x01;
      this.viLinkLibVersion = (flagBt >> 1) & 0x1f;
      this.viLinkUnknown2 = flagBt >> 6;
    }
    else {
      if (version.compareTo(8, 0) >= 0) {
        this.viLinkUnknown2 = reader.readUInt32('typed-link-save-info.viLinkUnknown2');
        this.viLinkLibVersion = reader.readUInt32('typed-link-save-info.viLinkLibVersion');
      }

      if (version.compareTo(6, 0) >= 0) {
        this.viLinkUnknown3 = reader.readUInt32('typed-link-save-info.viLinkUnknown3');
        this.viLinkUnknown4 = reader.readUInt32('typed-link-save-info.viLinkUnknown4');
        this.viLinkUnknown5 = reader.readUInt32('typed-link-save-info.viLinkUnknown5');
      }
    }

  }


  protected parseTypedLinkSaveInfo(reader: ViDataReader, version: ViVersion) {
    if (version.compareTo(8, 0) >= 0) {
      this.parseLinkSaveInfo(reader, version);

      this.typedLinkTD = {
        index: reader.readVariableUInt24('typedLinkTDIndex'),
        flags: 0,
      };

      this.parseVILinkRefInfo(reader, version)

      if (version.compareTo(12, 0) >= 0) {
        this.typedLinkFlags = reader.readUInt32('typed-link-save-info.typedLinkFlags');
      }
    }
    else {
      TypedLinkSaveInfoBase.loggerTypedLink.error('Unable to parse: parseTypedLinkSaveInfo - Not supported Version!');
    }
  }

}
