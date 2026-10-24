import { ViDataReader } from '../vi-data-reader';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';

export class VCTPObjectVoid extends VCTPObjectBase {
  public parse(reader: ViDataReader, version: ViVersion) {
    this.paresLabel(reader);
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }
}

