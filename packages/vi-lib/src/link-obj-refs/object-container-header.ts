import { VirtualFile } from '@tomsoftware/virtual-fs';
import { LinkObjectBase } from './link-object-base';
import { ViVersion } from '../vi-version';

export class ObjectContainerHeader extends LinkObjectBase {

  public unknown1: string | null = null;
  public unknown2: Uint8Array = new Uint8Array(0);

  public parseContainer(reader: VirtualFile, version: ViVersion) {
    this.unknown1 = this.readBytePrefixedString(reader);
    this.alignPaddingBytes(reader, 2);

    const wordCount = reader.readUInt16LE();
    this.unknown2 = reader.readBytes(wordCount * 2);  
  }
}

