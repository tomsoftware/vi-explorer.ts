import { VirtualFile } from '@tomsoftware/virtual-fs';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';

export class VCTPObjectBlock extends VCTPObjectBase {
  public parse(reader: VirtualFile, version: ViVersion) {
    this.paresLabel(reader);
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }
}

