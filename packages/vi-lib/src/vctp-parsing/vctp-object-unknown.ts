import { ViDataReader } from '../vi-data-reader';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';

export class VCTPObjectUnknown extends VCTPObjectBase {

  public parse(reader: ViDataReader, version: ViVersion) {
    // nothing - we do not know this type
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }
}
