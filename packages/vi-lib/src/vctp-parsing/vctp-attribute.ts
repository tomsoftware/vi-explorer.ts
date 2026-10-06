import { VCTPAttributeType } from "./vctp-attribute-type";

export type VCTPPropertyValue = number | string;


export class VCTPAttribute {
  public readonly type: VCTPAttributeType;
  public readonly value: VCTPPropertyValue;
  public readonly kind: 'number' | 'string' | 'hex' | 'unknown';

  public get name(): string {
    return VCTPAttributeType[this.type] ?? 'Unknown';
  }


  constructor(type: VCTPAttributeType, value: VCTPPropertyValue, kind: 'number' | 'string' | 'hex' | 'unknown') {
    this.type = type;
    this.value = value;
    this.kind = kind;
  }
}
