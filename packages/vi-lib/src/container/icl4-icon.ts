import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViIcon } from './vi-icon';

export class Icl4Icon extends ViIcon {
  public static Color_Palette_16: number[] = [
    0xFFFFFF, 0xFFFF00, 0x000080, 0xFF0000, 0xFF00FF, 0x800080, 0x0000FF, 0x00FFFF,
    0x00FF00, 0x008000, 0x800000, 0x808000, 0xC0C0C0, 0x808080, 0x008080, 0x000000
  ];

  private reader: VirtualFile;
  public width = 32;
  public height = 32;
  public bitPerPixel = 4;

  constructor(reader: VirtualFile) {
    super();
    this.reader = reader;
  }

  public getRGBA(): Uint8ClampedArray | null {
    if (!this.reader) {
        return null;
    }
    this.reader.seek(0);

    const count = this.width * this.height;
    const out = new Uint8ClampedArray(count * 4);

    const pal = Icl4Icon.Color_Palette_16;

    let idx = 0;
    while (idx < count && !this.reader.eof()) {
      const b = this.reader.readByte();

      // high nibble
      const hi = (b >> 4) & 0x0f;
      if (idx < count) {
        const color = pal[hi] ?? 0;
        const base = idx * 4;
        out[base] = (color >> 16) & 0xff;
        out[base + 1] = (color >> 8) & 0xff;
        out[base + 2] = color & 0xff;
        out[base + 3] = 255;
        idx++;
      }

      if (idx >= count) {
        break;
      }

      // low nibble
      const lo = b & 0x0f;
      const color = pal[lo] ?? 0;
      const base = idx * 4;
      out[base] = (color >> 16) & 0xff;
      out[base + 1] = (color >> 8) & 0xff;
      out[base + 2] = color & 0xff;
      out[base + 3] = 255;
      idx++;
    }

    return out;
  }
}
