import { VirtualFile } from '@tomsoftware/virtual-fs';

export interface LIVIObjectData {
  tag: string;
  name?: string;
  unk1?: number;
  unk2?: number;
  unk3?: number;
}

export abstract class LIVIObject {
  public tag: string;
  public name?: string;
  public unk1?: number;
  public unk2?: number;
  public unk3?: number;

  constructor(tag: string) {
    this.tag = tag;
  }

  parseHeader(data: LIVIObjectData): void {
    this.name = data.name;
    this.unk1 = data.unk1;
    this.unk2 = data.unk2;
    this.unk3 = data.unk3;
  }

  // optional further parsing if needed
  parseRemaining(_: VirtualFile): void {
    return;
  }
}
