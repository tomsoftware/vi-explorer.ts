import { VirtualFile } from '@tomsoftware/virtual-fs';
import { LinkObjectBase } from '../link-object-base';
import { ViVersion } from '../../vi-version';

export class PTH0 extends LinkObjectBase {
  public static readonly type = 'PTH0';
  public pathParts: string[] = [];
  public tpVal = 0;
  public canZeroFill = false;

  public parseContainer(reader: VirtualFile, _version: ViVersion) {
    const totalLength = reader.readUInt32BE();
    this.tpVal = reader.readUInt16BE();
    const count = reader.readUInt16BE();

    this.pathParts = [];
    this.canZeroFill = totalLength === 0;

    for (let i = 0; i < count; i++) {
      const length = reader.readByte();
      this.pathParts.push(reader.readAsciiString(length));
    }

    if (this.canZeroFill && this.tpVal === 0 && this.pathParts.length === 0) {
      return;
    }
  }
}
