import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViIcon } from './vi-icon';

export class Icon1Bit extends ViIcon {

  private reader: VirtualFile;
  public width = 32;
  public height = 32;
  public bitPerPixel = 1;

  constructor(reader: VirtualFile) {
    super();
    this.reader = reader;
  }

  public getRGBA(): Uint8ClampedArray | null {
    this.reader.seek(0);

    const count = this.width * this.height;
    const out = new Uint8ClampedArray(count * 4);
    let idx = 0;

    while (idx < count && !this.reader.eof()) {
      const b = this.reader.readByte();
      for (let bit = 7; bit >= 0 && idx < count; bit--) {
        const bitVal = ((b >> bit) & 0x01) === 1 ? 1 : 0;
        const base = idx * 4;
        if (bitVal === 1) {
          // black
          out[base] = 0;
          out[base + 1] = 0;
          out[base + 2] = 0;
        } else {
          // white
          out[base] = 255;
          out[base + 1] = 255;
          out[base + 2] = 255;
        }
        out[base + 3] = 255;
        idx++;
      }
    }

    return out;
  }
}
