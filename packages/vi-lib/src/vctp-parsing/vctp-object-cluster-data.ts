import { VirtualFile } from '@tomsoftware/virtual-fs';
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

  public parse(reader: VirtualFile, version: ViVersion) {
    this.clusterFormat = reader.readUInt16BE();
    this.paresLabel(reader);
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }

  public override get connectorColor(): string {
    return 'rgb(160, 64, 0)';
  }
}
