import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViIcon } from './vi-icon';

export class Icl8Icon extends ViIcon {
  constructor(blocName: string) {
    super(blocName, 32, 32, 8, true);
  }

  public getPixelIndices(): Uint8Array | null {
    if (!this.content) return null;

    const pixels = new Uint8Array(this.width * this.height);
    // read pixel indices (one byte per pixel)
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = this.content.readByte();
    }

    return pixels;
  }
}

export default Icl8Icon;
