import { Logger } from '@tomsoftware/logger';
import { ViIcon } from './container/vi-icon';
import { Icon8Bit } from './container/icon-8bit';
import { Icon4Bit } from './container/icon-4bit';
import { Icon1Bit } from './container/icon-1bit';
import { ViFile } from './vi-file';

export class IconReader {
  private static logging = new Logger('IconReader');

  private readonly icons: ViIcon[] = [];

  constructor(vi: ViFile) {
    const iconTypes = [
      ['icl8', Icon8Bit],
      ['icl4', Icon4Bit],
      ['ICON', Icon1Bit],
    ] as const;

    for (const [name, IconClass] of iconTypes) {
      if (!vi.resources.resourceExists(name)) {
        continue;
      }

      const container = vi.resources.getResourceByName(name);
      const reader = container?.getReader(false);

      if (!reader) {
        continue;
      }

      const icon = new IconClass(reader);
      this.icons.push(icon);
    }

    if (this.getIconCount() == 0) {
      IconReader.logging.warn('Unable to detect icon resources in this file.');
    }
  }

  /** Returns the number of icons in this file */
  public getIconCount(): number {
    return this.icons.length;
  }

  /** Returns a icon by it's index */
  public getIcon(index: number): ViIcon | null {
    return this.icons[index] ?? null;
  }

  /** Find a icon matching best the given bit per pixel attribute */
  public findIcon(maxBitPerPixel = 32, fallback = true): ViIcon | null {
    let bestIndex = -1;
    let bestBpp = 0;

    this.icons.forEach((icon, idx) => {
      if (icon.bitPerPixel <= maxBitPerPixel && icon.bitPerPixel > bestBpp) {
        if (fallback || icon.bitPerPixel === maxBitPerPixel) {
          bestBpp = icon.bitPerPixel;
          bestIndex = idx;
        }
      }
    });

    return this.getIcon(bestIndex);
  }
}
