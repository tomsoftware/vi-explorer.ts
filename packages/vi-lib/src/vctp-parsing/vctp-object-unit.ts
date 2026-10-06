import { VirtualFile } from "@tomsoftware/virtual-fs";
import { VCTPObjectBase } from "./vctp-object-base";
import { ViVersion } from "../vi-version";
import { VCTPType } from "./vctp-types";
import { VCTPValueEntry } from "./vctp-value-entry";

export class VCTPObjectUnit extends VCTPObjectBase {
  public parse(reader: VirtualFile, version: ViVersion) {

    const count = reader.readUInt16BE();
    const isTextEnum = this.type === VCTPType.UnitU16 || this.type === VCTPType.UnitU8 || this.type === VCTPType.UnitU32;
    let dataSize = 0;

    for (let i = 0; i < count; i++) {
      const pos = reader.tell();
      let label = '';
      let length = 0;

      if (isTextEnum) {
        length = reader.readByte();
        label = reader.readAsciiString(length);
        dataSize += length + 1;
      } else {
        label = `0x${reader.readUInt32BE().toString(16)}`;
        dataSize += 4;
      }

      this.values.push(new VCTPValueEntry(pos, label, length, this.type, 'UnitValue'));
    }

    if ((dataSize % 2) !== 0) {
      const tmp = reader.readByte();
      if (tmp !== 0) {
        VCTPObjectBase.logging.error(`Number+Unit padding Error - unknown Data [0x${tmp.toString(16)}] ? index=${this.index} @ ${this.offset}`);
        return;
      }
    }

    const trailing = reader.readByte();
    if (trailing !== 0) {
      VCTPObjectBase.logging.error(`Number+Unit - Unknown Data [0x${trailing.toString(16)}] Property? index=${this.index} @ ${this.offset}`);
      return;
    }

    this.paresLabel(reader);
  }
}
