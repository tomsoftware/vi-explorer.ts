export type VCTPPropertyValue = number | string;


export class VCTPAttribute {
  public readonly type: number;
  public readonly name: string;
  public readonly value: VCTPPropertyValue;
  public readonly kind: 'number' | 'string' | 'hex' | 'unknown';

  constructor(type: number, name: string, value: VCTPPropertyValue, kind: 'number' | 'string' | 'hex' | 'unknown') {
    this.type = type;
    this.name = name;
    this.value = value;
    this.kind = kind;
  }
}
