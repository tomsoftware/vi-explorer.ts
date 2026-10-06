import { VirtualFile } from "@tomsoftware/virtual-fs";
import { VCTPObjectBase } from "./vctp-object-base";
import { ViVersion } from "../vi-version";
import { VCTPClientRef } from "./vctp-client-ref";
import { VCTPAttributeType } from "./vctp-attribute-type";

export class VCTPObjectArray extends VCTPObjectBase {
  public parse(reader: VirtualFile, version: ViVersion) {

    const dimensions = reader.readUInt16BE();
    if (dimensions > 64) {
      VCTPObjectBase.logging.error(`Array Dimension (${dimensions}) is > 64 @ ${this.offset}`);
      return;
    }

    this.addPropertyNumber(VCTPAttributeType.ArrayDimensions, dimensions);

    let ok = true;
    for (let i = 0; i < dimensions; i++) {
      const tmp = reader.readUInt32BE();
      if (tmp !== 0xffffffff && tmp !== 0xffffffff) {
        if ((tmp & 0x80000000) !== 0) {
          this.addPropertyNumber(VCTPAttributeType.ArrayFixedSize, tmp & 0x00ffffff);
        } else {
          VCTPObjectBase.logging.error(`Array with property (index: ${i} - flag: ${tmp} ? ) @ ${this.offset}`);
          ok = false;
        }
      }
    }

    if (ok) {
      const arrayTypeIndex = reader.readUInt16BE();
      if (arrayTypeIndex > this.index) {
        VCTPObjectBase.logging.error(`Wrong value for Array-Type-Index ${arrayTypeIndex} is > "This-Array-Object"-Index: ${this.index} @ ${this.offset}`);
        ok = false;
      } else {
        this.children.push(new VCTPClientRef(arrayTypeIndex, 0));
      }
    }

    if (ok) {
      this.paresLabel(reader);
    }
  }
}
