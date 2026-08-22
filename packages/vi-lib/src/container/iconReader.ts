
import { Logger } from '@tomsoftware/logger';
import { ViResources } from '../vi-resources';
import { ViIcon } from './vi-icon';
import { Icl8Icon } from './icl8-icon';
import { Icl4Icon } from './icl4-icon';
import { Icon1Bit } from './icon-1bit';

export class IconReader {
  private static logging = new Logger('IconReader');

  private icons: ViIcon[] = [];

  constructor(lv: ViResources) {
    // detect available icon resources and instantiate appropriate classes
    if (lv.resourceExists('icl8')) {
      const container = lv.getResourceByName('icl8');
      const reader = container?.getReader(false) ?? null;
      if (reader) {
        const ic = new Icl8Icon('icl8');
        ic.load(reader);
        this.icons.push(ic);
      }
    }

    if (lv.resourceExists('icl4')) {
      const container = lv.getResourceByName('icl4');
      const reader = container?.getReader(false) ?? null;
      if (reader) {
        const ic = new Icl4Icon('icl4');
        ic.load(reader);
        this.icons.push(ic);
      }
    }

    if (lv.resourceExists('ICON')) {
      const container = lv.getResourceByName('ICON');
      const reader = container?.getReader(false) ?? null;
      if (reader) {
        const ic = new Icon1Bit('ICON');
        ic.load(reader);
        this.icons.push(ic);
      }
    }
  }

  public getIconCount(): number {
    return this.icons.length;
  }

  public getIcon(index: number): ViIcon | null {
    return this.icons[index] ?? null;
  }

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

  /** Alias für convenience: liefert das beste gefundene Icon-Objekt */
  public getBest(maxBitPerPixel = 32, fallback = true): ViIcon | null {
    return this.findIcon(maxBitPerPixel, fallback);
  }
}
