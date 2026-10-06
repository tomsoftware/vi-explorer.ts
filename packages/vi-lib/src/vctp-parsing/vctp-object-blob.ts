import { VirtualFile } from "@tomsoftware/virtual-fs";
import { VCTPObjectBase } from "./vctp-object-base";
import { ViVersion } from "../vi-version";
import { VCTPType } from "./vctp-types";

export class VCTPObjectBlob extends VCTPObjectBase {
  public parse(reader: VirtualFile, version: ViVersion) {

    if (this.type == VCTPType.PascalString || this.type === VCTPType.CString) {
      this.paresLabel(reader);
      return;
    }

    const tmp = reader.readUInt32BE();
    if (tmp === 0xffffffff || tmp === -1) {
      this.paresLabel(reader);
      return;
    }

    VCTPObjectBase.logging.warn(`Blob with unknown property (0x${tmp.toString(16)})??? @ ${this.offset ?? 0}`);
    return;
  }
}
