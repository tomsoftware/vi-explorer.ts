import { ViDataReader } from '../vi-data-reader';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { VCTPType } from './vctp-types';

export class VCTPObjectNumber extends VCTPObjectBase {
  public unknown: number = 0;

  public parse(reader: ViDataReader, version: ViVersion) {
    this.unknown = reader.readByte('vctp-number.unknown');
    if (this.unknown !== 0) {
      VCTPObjectBase.logging.warn(`Number [index=${this.index}] with unknown property (0x${this.unknown.toString(16)})??? @ ${this.offset ?? 0}`);
    }

    this.paresLabel(reader);
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Number;
  }

  public override get connectorColor(): string {
    if (this.type === VCTPType.NumberDBL) {
      return 'rgb(226, 134, 13)';
    }

     return 'rgb(45, 45, 255)';
  }
  
}
