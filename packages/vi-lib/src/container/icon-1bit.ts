import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViIcon } from './vi-icon';

export class Icon1Bit extends ViIcon {
  constructor(blocName: string) {
    super(blocName, 32, 32, 1, false);
  }

  public getPixelIndices(): Uint8Array | null {
    if (!this.content) return null;

    const pixels = new Uint8Array(this.width * this.height);
    let idx = 0;

    while (idx < pixels.length && !this.content.eof()) {
      const b = this.content.readByte();
      // high bit first (bit 7)
      for (let bit = 7; bit >= 0 && idx < pixels.length; bit--) {
        const bitVal = ((b >> bit) & 0x01) === 1 ? 1 : 0;
        pixels[idx++] = bitVal;
      }
    }

    return pixels;
  }
}

export default Icon1Bit;
