import { VCTPAttribute } from "./vctp-attribute";
import { VCTPClientRef } from "./vctp-client-ref";
import { VCTPMainType, VCTPType } from "./vctp-types";
import { VCTPValueEntry } from "./vctp-value-entry";

export class VCTPObject {
  public readonly index: number;
  public pos = 0;
  public size = 0;
  public flags = 0;
  public label = '';
  public fileType = 0;
  public name = '';
  public type = VCTPType.Unknown;
  public mainType = VCTPMainType.Unknown;
  public readonly attributes: VCTPAttribute[] = [];
  public readonly clients: VCTPClientRef[] = [];
  public readonly values: VCTPValueEntry[] = [];

  constructor(index: number) {
    this.index = index;
  }
}
