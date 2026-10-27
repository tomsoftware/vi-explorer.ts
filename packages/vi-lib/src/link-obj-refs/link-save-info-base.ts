import { ViDataReader } from "../vi-data-reader";
import { LinkObjectBase } from "./link-object-base";
import { ViVersion } from "../vi-version";
import { Logger } from "@tomsoftware/logger";
import { LinkObjectFactory } from "./link-object-factory";
import { ByteString } from "@tomsoftware/virtual-fs";

export abstract class LinkSaveInfoBasic extends LinkObjectBase {
  private static loggerLinkSave = new Logger('LinkSaveInfoBasic');
  public linkSaveQualName: ByteString[] = [];
  public linkSavePathRef: LinkObjectBase | null = null;
  public linkSaveFlag = 0;


  protected readQualifiedName(reader: ViDataReader): ByteString[] {
    const items: ByteString[] = [];

    const count = reader.readUInt32BE('link-save-info.qualifed-name.count');
    if (count > 4095) {
      LinkSaveInfoBasic.loggerLinkSave.error('Qualified Name has to many elements: ' + count + ' > '+ 4095);
      return items;
    }

    if ((count * 2) > reader.leftLength()) {
      LinkSaveInfoBasic.loggerLinkSave.error('Not enough bytes left to read Qualified Name.');
      return items;
    }

    for (let i = 0; i < count; i++) {
      const length = reader.readByte('link-save-info.qualified-name.length');
      items.push(reader.readString(length, 'link-save-info.qualified-name.item'));
    }

    return items;
  }

  protected readPathRef(reader: ViDataReader, version: ViVersion): LinkObjectBase | null {
    const ident = reader.readString(4, 'link-save-info.path-ref.ident').asAscii;

    const parser = LinkObjectFactory.create(ident);
    if (parser == null) {
      LinkSaveInfoBasic.loggerLinkSave.error('Unable to parse PathRef - Unknown Identity-Tag: ' + ident + ' in ' + reader.getFilename());
      return null;
    }

    // parse next object
    parser.parseContainer(reader, version);

    return parser;
  }

  protected parseLinkSaveInfo(reader: ViDataReader, version: ViVersion) {
    this.alignPaddingBytes(reader, 4);
    this.linkSaveQualName = this.readQualifiedName(reader);

    this.alignPaddingBytes(reader, 2);
    this.linkSavePathRef = this.readPathRef(reader, version);

    if (version.compareTo(8, 6) >= 0) {
      this.linkSaveFlag = reader.readUInt32BE('link-save-info.flag');
    }
    else if (version.compareTo(8, 5) >= 0) {
      this.linkSaveFlag = reader.readByte('link-save-info.flag.byte');
    }
  }
}