import { VirtualFile } from "@tomsoftware/virtual-fs";
import { LinkObjectBase } from "./link-object-base";
import { ViVersion } from "../vi-version";
import { Logger } from "@tomsoftware/logger";
import { LinkObjectFactory } from "./link-object-factory";

export abstract class LinkSaveInfoBasic extends LinkObjectBase {
  private static loggerLinkSave = new Logger('LinkSaveInfoBasic');
  public linkSaveQualName: string[] = [];
  public linkSavePathRef: LinkObjectBase | null = null;
  public linkSaveFlag = 0;


  protected readQualifiedName(reader: VirtualFile): string[] {
    const items: string[] = [];

    const count = reader.readUInt32BE();
    if (count > 4095) {
      LinkSaveInfoBasic.loggerLinkSave.error('Qualified Name has to many elements: ' + count + ' > '+ 4095);
      return items;
    }

    if ((count * 2) > reader.leftLength()) {
      LinkSaveInfoBasic.loggerLinkSave.error('Not enough bytes left to read Qualified Name.');
      return items;
    }

    for (let i = 0; i < count; i++) {
      const length = reader.readByte();
      items.push(reader.readAsciiString(length));
    }

    return items;
  }

  protected readPathRef(reader: VirtualFile, version: ViVersion): LinkObjectBase | null {
    const ident = reader.readAsciiString(4);

    const parser = LinkObjectFactory.create(ident);
    if (parser == null) {
      LinkSaveInfoBasic.loggerLinkSave.error('Unable to parse PathRef - Unknown Identity-Tag: ' + ident + ' in ' + reader.getFilename());
      return null;
    }

    // parse next object
    parser.parseContainer(reader, version);

    return parser;
  }

  protected parseLinkSaveInfo(reader: VirtualFile, version: ViVersion) {
    this.alignPaddingBytes(reader, 4);
    this.linkSaveQualName = this.readQualifiedName(reader);

    this.alignPaddingBytes(reader, 2);
    this.linkSavePathRef = this.readPathRef(reader, version);

    if (version.compareTo(8, 6) >= 0) {
      this.linkSaveFlag = reader.readUInt32BE();
    }
    else if (version.compareTo(8, 5) >= 0) {
      this.linkSaveFlag = reader.readByte();
    }
  }
}