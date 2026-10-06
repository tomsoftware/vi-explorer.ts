import { VirtualFile } from "@tomsoftware/virtual-fs";
import { VCTPObjectBase } from "./vctp-object-base";
import { ViVersion } from "../vi-version";
import { VCTPClientRef } from "./vctp-client-ref";
import { VCTPAttributeType } from "./vctp-attribute-type";

export class VCTPObjectTerminal extends VCTPObjectBase {
  public parse(reader: VirtualFile, version: ViVersion) {

    const count = reader.readUInt16BE();
    if (count > 125) {
      VCTPObjectBase.logging.error(`Terminal count > 124 @ ${this.offset}`);
      return;
    }

    for (let i = 0; i < count; i++) {
      this.children.push(new VCTPClientRef(reader.readUInt16BE(), 0));
    }

    this.addPropertyNumber(VCTPAttributeType.TerminalFlags, reader.readUInt16BE());
    this.addPropertyNumber(VCTPAttributeType.TerminalPattern, reader.readUInt16BE());

    if (version.compareTo(8, 0) >= 0) {
      const unknown = reader.readUInt16BE();
      for (let i = 0; i < count; i++) {
        this.children[i].flags = reader.readUInt32BE();
      }
    } else {
      for (let i = 0; i < count; i++) {
        this.children[i].flags = reader.readUInt16BE();
      }
    }

    this.paresLabel(reader);
  }
}
