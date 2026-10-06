import { VirtualFile } from "@tomsoftware/virtual-fs";
import { VCTPObjectBase } from "./vctp-object-base";
import { ViVersion } from "../vi-version";

export class VCTPObjectNumber extends VCTPObjectBase {
  public unknown: number = 0;

  public parse(reader: VirtualFile, version: ViVersion) {
    this.unknown = reader.readByte();
    if (this.unknown !== 0) {
      VCTPObjectBase.logging.warn(`Number [index=${this.index}] with unknown property (0x${this.unknown.toString(16)})??? @ ${this.offset ?? 0}`);
    }

    this.paresLabel(reader);
  }
}
