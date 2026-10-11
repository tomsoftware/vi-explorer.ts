import { VCTPObjectBase } from "./vctp-object-base";

export class VCTPClientRef {
  public index: number;
  public flags: number;
  public target: VCTPObjectBase;

  constructor(index: number, target: VCTPObjectBase, flags = 0) {
    this.index = index;
    this.flags = flags;
    this.target = target;
  }
}
