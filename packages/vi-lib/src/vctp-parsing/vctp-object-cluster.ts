import { VirtualFile } from "@tomsoftware/virtual-fs";
import { VCTPObjectBase } from "./vctp-object-base";
import { ViVersion } from "../vi-version";
import { VCTPType } from "./vctp-types";
import { VCTPClientRef } from "./vctp-client-ref";
import { VCTPAttributeType } from "./vctp-attribute-type";

export class VCTPObjectCluster extends VCTPObjectBase {
  public parse(reader: VirtualFile, version: ViVersion) {
    const count = reader.readUInt16BE();
    if (count > 500) {
      VCTPObjectBase.logging.error(`Cluster Item count (${count}) is > 124 @ ${this.offset}`);
      return false;
    }

    for (let i = 0; i < count; i++) {
      this.children.push(new VCTPClientRef(reader.readUInt16BE(), 0));
    }

    this.paresLabel(reader);
  }
}
