import { VirtualFile } from '@tomsoftware/virtual-fs';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';

export class VCTPObjectUnknown extends VCTPObjectBase {

  public parse(reader: VirtualFile, version: ViVersion) {
    // nothing - we do not know this type
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }
}
