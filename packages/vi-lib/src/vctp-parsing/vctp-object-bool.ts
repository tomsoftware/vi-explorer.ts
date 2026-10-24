import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { ViDataReader } from '../vi-data-reader';

export class VCTPObjectBool extends VCTPObjectBase {
  public parse(reader: ViDataReader, version: ViVersion) {
    this.paresLabel(reader);
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }

  public override get connectorColor(): string {
    return 'rgb(42, 149, 42)';
  }
}
