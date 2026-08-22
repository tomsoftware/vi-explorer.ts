import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViIcon } from './vi-icon';

export class Icl4Icon extends ViIcon {
  constructor(blocName : string) {
    super(blocName, 32, 32, 4, true);
  }

  public getPixelIndices(): Uint8Array | null {
    if (!this.content) return null;

    const pixels = new Uint8Array(this.width * this.height);
    let idx = 0;

    // each byte encodes two 4-bit pixels: high nibble first, low nibble second
    while (idx < pixels.length && !this.content.eof()) {
      const b = this.content.readByte();
      // high nibble
      pixels[idx++] = (b >> 4) & 0x0f;
      if (idx >= pixels.length) break;
      // low nibble
      pixels[idx++] = b & 0x0f;
    }

    return pixels;
  }
}

export default Icl4Icon;
