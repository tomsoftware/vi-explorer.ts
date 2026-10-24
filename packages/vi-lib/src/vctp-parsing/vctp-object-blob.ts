import { ViDataReader } from '../vi-data-reader';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { VCTPType } from './vctp-types';

export class VCTPObjectBlob extends VCTPObjectBase {
  public parse(reader: ViDataReader, version: ViVersion) {

    if (this.type == VCTPType.PascalString || this.type === VCTPType.CString) {
      this.paresLabel(reader);
      return;
    }

    const tmp = reader.readUInt32('vctp-blob.property');
    if (tmp === 0xffffffff || tmp === -1) {
      this.paresLabel(reader);
      return;
    }

    VCTPObjectBase.logging.warn(`Blob with unknown property (0x${tmp.toString(16)})??? @ ${this.offset ?? 0}`);
    return;
  }
  
  public get typeGroup(): TypeGroup {
    if (this.type == VCTPType.String) {
      return TypeGroup.String;
    }
    if (this.type == VCTPType.Path) {
      return TypeGroup.Path;
    }
    return TypeGroup.Unknown;
  }

  public override get connectorColor(): string {
    if (this.type === VCTPType.Path || this.type === VCTPType.Picture) {
      return 'rgb(1, 128, 128)';
    }

    return 'rgb(255, 11, 255)';
  }
}
