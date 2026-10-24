import { ViDataReader, ByteString } from '@tomsoftware/virtual-fs';
import { LinkObjectBase } from '../link-object-base';
import { ViVersion } from '../../vi-version';

export class PTH0 extends LinkObjectBase {
  public static readonly type = 'PTH0';
  public pathParts: ByteString[] = [];
  public tpVal = 0;
  public canZeroFill = false;

  public parseContainer(reader: ViDataReader, _version: ViVersion) {
    const totalLength = reader.readUInt32BE('pth0.totalLength');
    this.tpVal = reader.readUInt16BE('pth0.tpVal');
    const count = reader.readUInt16BE('pth0.count');

    this.pathParts = [];
    this.canZeroFill = totalLength === 0;

    for (let i = 0; i < count; i++) {
      const length = reader.readByte('pth0.path-part.length');
      this.pathParts.push(reader.readString(length, 'pth0.path-part'));
    }

    if (this.canZeroFill && this.tpVal === 0 && this.pathParts.length === 0) {
      return;
    }
  }
}
