import { ViDataReader } from '../vi-data-reader';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';

export class VCTPObjectClusterData extends VCTPObjectBase {
  public clusterFormat = 0;
  public get clusterFormatName() {

    switch (this.clusterFormat) {
      case 6: 
          return 'TimeStamp';
      case 7:
          return 'Digitaldata';
      case 9:
          return 'Dynamicdata';
      default:
          return `0x${this.clusterFormat.toString(16)}`;
    }
  }

  public parse(reader: ViDataReader, version: ViVersion) {
    this.clusterFormat = reader.readUInt16('vctp-cluster-data.format');
    this.paresLabel(reader);
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }

  public override get connectorColor(): string {
    return 'rgb(160, 64, 0)';
  }
}
