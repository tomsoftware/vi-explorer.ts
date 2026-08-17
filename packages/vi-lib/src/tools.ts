import { VirtualFile } from '@tomsoftware/virtual-fs';
export class Tools {
public static bytesToHex(buffer: Uint8Array): string {
    let result = '';

    for (let i = 0; i < length; i++) {
      const v = buffer[i];
      if (v == null) {
        return result + ' EOF';
      }

      result += ('00' + v.toString(16)).slice(-2) + ' ';
    }

    return result;
  }

  public static readHex(reader: VirtualFile, length: number): string {
    const buffer = reader.readBytes(length);
    return this.bytesToHex(buffer);
  }
}