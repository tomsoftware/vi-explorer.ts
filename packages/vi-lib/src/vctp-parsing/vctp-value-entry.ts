export class VCTPValueEntry {
  public readonly pos: number;
  public readonly label: string;
  public readonly length: number;
  public readonly type: number;
  public readonly name: string;

  constructor(pos: number, label: string, length: number, type: number, name: string) {
    this.pos = pos;
    this.label = label;
    this.length = length;
    this.type = type;
    this.name = name;
  }
}

