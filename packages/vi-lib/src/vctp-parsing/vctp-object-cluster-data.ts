import { VirtualFile } from "@tomsoftware/virtual-fs";
import { VCTPObjectBase } from "./vctp-object-base";
import { ViVersion } from "../vi-version";
import { VCTPAttributeType } from "./vctp-attribute-type";

export class VCTPObjectClusterData extends VCTPObjectBase {
  public parse(reader: VirtualFile, version: ViVersion) {

    const tmp = reader.readUInt16BE();
    let tmpStr = `0x${tmp.toString(16)}`;
    switch (tmp) {
      case 6: tmpStr = 'TimeStamp'; break;
      case 7: tmpStr = 'Digitaldata'; break;
      case 9: tmpStr = 'Dynamicdata'; break;
      default: break;
    }

    this.addPropertyNumber(VCTPAttributeType.ClusterFormat, tmp);
    this.addPropertyString(VCTPAttributeType.ClusterFormatStr, tmpStr);
    this.paresLabel(reader);
  }
}
