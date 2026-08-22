import { VirtualFile } from '@tomsoftware/virtual-fs';

export abstract class ViIcon {
  public content: VirtualFile | null = null;

  constructor(
    public blocName: string,
    public width = 32,
    public height = 32,
    public bitPerPixel = 8,
    public usePalette = true
  ) {}

  public load(reader: VirtualFile | null): void {
    this.content = reader;
    if (this.content && typeof this.content.seek === 'function') {
      this.content.seek(0);
    }
  }

  public abstract getPixelIndices(): Uint8Array | null;

  /**
   * Generate a PNG data URL representing this icon. Runs in browser environments.
   * Returns `null` if generation is not possible (no content or no DOM).
   */
  public generate(palette?: number[]): string | null {
    const pixels = this.getPixelIndices();
    if (!pixels) return null;

    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
      // Not running in a browser environment
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.createImageData(this.width, this.height);
    const data = imageData.data;

    // choose palette
    let pal: number[] = palette ?? [];
    if (pal.length === 0) {
      if (this.bitPerPixel === 4) pal = ViIcon.LABVIEW_COLOR_PALETTE_16;
      else if (this.bitPerPixel === 1) pal = [0x000000, 0xFFFFFF];
      else pal = ViIcon.LABVIEW_COLOR_PALETTE_256.length ? ViIcon.LABVIEW_COLOR_PALETTE_256 : ViIcon.LABVIEW_COLOR_PALETTE_16;
    }

    const toRGB = (hex: number) => ({
      r: (hex >> 16) & 0xff,
      g: (hex >> 8) & 0xff,
      b: hex & 0xff
    });

    for (let i = 0; i < pixels.length; i++) {
      const idx = pixels[i];
      const rgbaIndex = i * 4;
      const color = pal[idx] ?? 0x000000;
      const { r, g, b } = toRGB(color);
      data[rgbaIndex] = r;
      data[rgbaIndex + 1] = g;
      data[rgbaIndex + 2] = b;
      data[rgbaIndex + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  // LabVIEW default 16 color palette (as hex numbers)
  public static LABVIEW_COLOR_PALETTE_16: number[] = [
    0xFFFFFF, 0xFFFF00, 0x000080, 0xFF0000, 0xFF00FF, 0x800080, 0x0000FF, 0x00FFFF,
    0x00FF00, 0x008000, 0x800000, 0x808000, 0xC0C0C0, 0x808080, 0x008080, 0x000000
  ];

  // (optional) extended 256 palette placeholder — can be filled later if needed
  public static LABVIEW_COLOR_PALETTE_256: number[] = [];
}

export default ViIcon;
