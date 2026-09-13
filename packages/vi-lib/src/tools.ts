import { VirtualFile } from '@tomsoftware/virtual-fs';

export class Tools {
  /** Result of an empty md5 input: md5('') */
  public static readonly emptyMd5 = new Uint8Array([
    0xd4, 0x1d, 0x8c, 0xd9, 0x8f, 0x00, 0xb2, 0x04,
    0xe9, 0x80, 0x09, 0x98, 0xec, 0xf8, 0x42, 0x7e
  ]);

  /** Returns a hex string from the given array */
  public static bytesToHex(buffer: Uint8Array): string {
    let result = '';
    const length = buffer.length;

    for (let i = 0; i < length; i++) {
      const v = buffer[i];
      result += ('00' + v.toString(16)).slice(-2) + ' ';
    }

    return result;
  }

  public static readHex(reader: VirtualFile, length: number): string {
    const buffer = reader.readBytes(length);
    return this.bytesToHex(buffer);
  }

  /** Test two arrays if there values are equal */
  public static compareArray(array1: Uint8Array, array2: Uint8Array) {
    if (array1.length !== array2.length) {
      return false;
    }

    return array1.every((byte, i) => byte === array2[i]);
  }
}