import { BufferedFile, VirtualFile } from '@tomsoftware/virtual-fs';
import { unzlibSync } from 'fflate';
import { Logger } from '@tomsoftware/logger';

export class ViResourceContainer {
  private static logging = new Logger('ViResourceContainer');

  public name: string;
  // every resource container can have multiple resources
  public count: number;
  public headerOffset: number;
  public INT1: number;
  public INT2: number;
  public INT3: number;
  public dataOffset: number;
  public INT4: number;
  private reader: VirtualFile;

  constructor(reader: VirtualFile, dataReader: VirtualFile) {
    // Read basic resource information
    this.name = reader.readAsciiString(4);
    this.count = reader.readUInt32LE() + 1;
    // not sure about versions before 8.0
    this.headerOffset = reader.readUInt32LE();

    // read resource data header
    const headerReader = reader.getSubReader(this.headerOffset);
    this.INT1 = headerReader.readUInt32LE();
    this.INT2 = headerReader.readUInt32LE();
    this.INT3 = headerReader.readUInt32LE();
    this.dataOffset = headerReader.readUInt32LE();
    this.INT4 = headerReader.readUInt32LE();

    this.reader = dataReader.getSubReader(this.dataOffset);

    Object.seal(this);
  }

  public compareName(other: string): boolean {
    return this.name === other;
  }

  public getReader(useCompression = true, index = 0): VirtualFile | null {
    this.reader.seek(0);
    let offset = 0;

    for (let i = 0; i < index && !this.reader.eof(); i++) {
      this.reader.seek(offset);
      const size = this.reader.readUInt32LE();
      offset += size;

      // pad the size 4 Bytes
      offset += (offset + 3) & 0x03;

      // add 4 bytes for size-value
      offset += 4;
    }

    if (this.reader.eof()) {
      ViResourceContainer.logging.error('Unable to get data for resource ' + this.name + ' with index: ' + index);
      return null;
    }

    this.reader.seek(offset);
    const size = this.reader.readUInt32LE();

    if (!useCompression) {
      // return plain data
      return this.reader.getSubReader(offset + 4, size);
    }

    const unpackedSize = this.reader.readUInt32LE();

    // decompress
    this.reader.seek(offset + 8);
    const buffer = this.reader.readBytes(size - 4);

    let result: Uint8Array;
    try {
      result = unzlibSync(buffer);
    } catch (e) {
      ViResourceContainer.logging.error('Unable to unpack resource data: ' + e);
      return null;
    }

    if (result.length !== unpackedSize) {
      ViResourceContainer.logging.error('Uncompressed data size mismatch: ' + unpackedSize + ' != ' + result.length);
    }

    // return uncompressed data
    return new BufferedFile(result);
  }
}
