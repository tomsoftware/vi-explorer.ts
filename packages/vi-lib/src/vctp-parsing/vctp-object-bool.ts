import { VirtualFile } from "@tomsoftware/virtual-fs";
import { VCTPObjectBase } from "./vctp-object-base";
import { ViVersion } from "../vi-version";

export class VCTPObjectBool extends VCTPObjectBase {
  public parse(reader: VirtualFile, version: ViVersion) {
    this.paresLabel(reader);
  }
}

