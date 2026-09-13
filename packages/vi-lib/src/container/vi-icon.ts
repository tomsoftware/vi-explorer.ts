export abstract class ViIcon {
  /** number of columns */
  public abstract width: number;
  /** number of rows */
  public abstract height: number;
  /** number of bits used per pixel */
  public abstract bitPerPixel: number;

  /** returns the rgb values of the icon */
  public abstract getRGBA(): Uint8ClampedArray | null;

  /**
   * Generate a PNG data URL representing this icon. Runs in browser environments.
   * The concrete icon class must provide RGBA byte data via `getRGBA()`.
   */
  public generate(): string | null {
    const rgba = this.getRGBA();
    if (!rgba) {
        return null;
    }

    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return null;
    }

    // ImageData can be constructed directly from RGBA buffer
    const imageData = new ImageData(new Uint8ClampedArray(rgba), this.width, this.height);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }
}

export default ViIcon;
