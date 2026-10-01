export class VCTPClientRef {
  public index: number;
  public flags: number;

  constructor(index: number, flags = 0) {
    this.index = index;
    this.flags = flags;
  }
}
