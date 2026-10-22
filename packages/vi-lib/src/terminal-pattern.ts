import { Logger } from "@tomsoftware/logger";
import { VCTPObjectBase } from "./vctp-parsing/vctp-object-base";

export type TerminalBound = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export class TerminalPattern {
  private static logging = new Logger('TerminalPattern');
  /**
   * Returns the terminal bounding boxes for a pattern.
   *
   * Permutation:
   *   Bits 0-1: Rotation (0-3 quarter-turns)
   *   Bit 2:    Vertical reflection
   */
  public getBounds(patternId: number, rotation: number, flip: number | boolean): TerminalBound[] {
    if (TerminalPattern.terminalBounds[patternId] === undefined) {
      TerminalPattern.logging.warn('Invalid/unknown pattern id '+ patternId);
      patternId = 0;
    }

    const bounds: TerminalBound[] = [];
    const packedBounds = TerminalPattern.terminalBounds[patternId];

    for (const b of packedBounds) {
      // Extract coordinates consisting of 4 bits each.
      let left = (b >> 0) & 0xF;
      let top = (b >> 4) & 0xF;
      let right = (b >> 8) & 0xF;
      let bottom = (b >> 12) & 0xF;

      // Decompress compressed values.
      left = TerminalPattern.terminalBoundsValues[left];
      top = TerminalPattern.terminalBoundsValues[top];
      right = TerminalPattern.terminalBoundsValues[right];
      bottom = TerminalPattern.terminalBoundsValues[bottom];

      // rotate by 90 degrees per step.
      for (let i = 0; i < rotation; i++) {
        const tmpVal = left;
        left = 32 - top;
        top = right;
        right = 32 - bottom;
        bottom = tmpVal;
      }

      // Flip vertically.
      if (flip) {
        top = 32 - top;
        bottom = 32 - bottom;
      }

      bounds.push({ left, top, right, bottom });
    }

    return bounds;
  }

  private static escapeHtml(str: string) {
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generates an SVG representation of the terminal bounding boxes.
   * Corresponds to the previous GD image generation (32 × 32 pixels).
   */
  public toSvg(patternNo: number, rotation: number, flip: number | boolean,
    terminalObjectResolver: (index: number) => VCTPObjectBase | undefined
  ): string {
    const terms = this.getBounds(patternNo, rotation, flip);

    const rectangles = terms
      .map((b, i) => {
        const x = Math.min(b.left, b.right);
        const y = Math.min(b.top, b.bottom);
        const width = Math.abs(b.right - b.left);
        const height = Math.abs(b.bottom - b.top);

        const info = terminalObjectResolver(i);
        const fill = info?.connectorColor ?? 'none';
        const tooltip = info?.tooltipText ?? '';
        const escapedTooltip = TerminalPattern.escapeHtml(tooltip)

        const title = tooltip ? `<title>${escapedTooltip}</title>` : '';

        return (
          `<rect x="${x}" y="${y}" ` +
          `width="${width}" height="${height}" ` +
          `fill="${fill}" stroke="#000000" stroke-width="1">${title}</rect>`
        );
      })
      .join("\n");

    return '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"> ' +
        '<rect width="32" height="32" fill="#ffffff" /> '+
        rectangles +
        '<rect x="0" y="0" width="31" height="31" fill="none" stroke="#000000" stroke-width="1" />' +
      '</svg>';
  }

  private static readonly terminalBoundsValues: number[] = [
    0, 6, 7, 8, 11, 13, 16, 19, 21, 24, 25, 26, 32,
  ];

  private static readonly terminalBounds: number[][] = [
    [0xCC00],
    [0xCC06, 0xC600],
    [0xCC06, 0xC660, 0x6600],
    [0xCC80, 0x8C40, 0x4C00],
    [0xCC06, 0xC680, 0x8640, 0x4600],
    [0xCC66, 0x6C06, 0xC660, 0x6600],
    [0xCC90, 0x9C60, 0x6C30, 0x3C00],
    [0xCC66, 0x6C06, 0xC680, 0x8640, 0x4600],
    [0xCC06, 0xC690, 0x9660, 0x6630, 0x3600],
    [0xCC66, 0x6C06, 0xC690, 0x9660, 0x6630, 0x3600],
    [0xCC86, 0x8C46, 0x4C06, 0xC680, 0x8640, 0x4600],
    [0xCC86, 0x8C46, 0x4C06, 0xC690, 0x9660, 0x6630, 0x3600],
    [0xCC96, 0x9C66, 0x6C36, 0x3C06, 0xC690, 0x9660, 0x6630, 0x3600],
    [0xCC96, 0x9C66, 0x6C36, 0x3C06, 0xC603, 0xC390, 0x9360, 0x6330, 0x3300],
    [0xCC96, 0x9C66, 0x6C36, 0x3C06, 0xC663, 0x6603, 0xC390, 0x9360, 0x6330, 0x3300],
    [0xCC99, 0x9C69, 0x6C39, 0x3C09, 0xC966, 0x6906, 0xC663, 0x6603, 0xC390, 0x9360, 0x6330, 0x3300],
    [0x4300, 0x4603, 0x8640, 0xC380, 0xC683, 0xCC06],
    [0x4300, 0x4603, 0x8640, 0xC380, 0xC683, 0x6C06, 0xCC66],
    [0x4300, 0x4603, 0x8640, 0xC380, 0xC683, 0x4C06, 0x8C46, 0xCC86],
    [0x4300, 0x4603, 0x8640, 0xC380, 0xC683, 0x3C06, 0x6C36, 0x9C66, 0xCC96],
    [0x4300, 0x4603, 0x8640, 0xC380, 0xC683, 0x4906, 0x4C09, 0x8C46, 0xC986, 0xCC89],
    [0x4300, 0x4603, 0x8640, 0xC380, 0xC683, 0x6906, 0x3C09, 0x6C39, 0xC966, 0x9C69, 0xCC99],
    [0x3300, 0x6603, 0x6330, 0x9360, 0xC663, 0xC390, 0x4C06, 0x8C46, 0xCC86],
    [0x3300, 0x6330, 0x9360, 0xC390, 0xC603, 0xCC06],
    [0x3300, 0x6330, 0x9360, 0xC390, 0xC603, 0x6C06, 0xCC66],
    [0x3300, 0x6330, 0x9360, 0xC390, 0xC603, 0x4C06, 0x8C46, 0xCC86],
    [0xCC99, 0x9C69, 0x6C39, 0x3C09, 0xC906, 0xC603, 0xC390, 0x9360, 0x6330, 0x3300],
    [0xCC06, 0xC663, 0x6603, 0xC390, 0x9360, 0x6330, 0x3300],
    [0xCC66, 0x6C06, 0xC663, 0x6603, 0xC390, 0x9360, 0x6330, 0x3300],
    [0xCC99, 0x9C69, 0x6C39, 0x3C09, 0xC906, 0xC663, 0x6603, 0xC390, 0x9360, 0x6330, 0x3300],
    [0xCC08, 0xC804, 0xC460, 0x6400],
    [0xCC08, 0xC804, 0xC480, 0x8440, 0x4400],
    [0xCC68, 0x6C08, 0xC804, 0xC480, 0x8440, 0x4400],
    [0x2200, 0x6502, 0x6705, 0x6A07, 0x2C0A, 0x5220, 0x5C2A, 0x7250, 0x7C5A, 0xA270, 0xAC7A, 0xC2A0, 0xC562, 0xC765, 0xCA67, 0xCCAA],
    [0x1100, 0x4110, 0x6140, 0x8160, 0xB180, 0xC1B0, 0x6401, 0xC461, 0x6604, 0xC664, 0x6806, 0xC866, 0x6B08, 0xCB68, 0x1C0B, 0x4C1B, 0x6C4B, 0x8C6B, 0xBC8B, 0xCCBB],
  ];

}
