import { BinaryReader } from '@/utilities/binary-reader';
import { unzlibSync } from 'fflate';
import { LogHandler } from '@/utilities/log-handler';

export class ViResourceContainer {
  private static logging = new LogHandler('ViResourceContainer');

  public name: string;
  // every resource container can have multiple resources
  public count: number;
  public headerOffset: number;
  public INT1: number;
  public INT2: number;
  public INT3: number;
  public dataOffset: number;
  public INT4: number;
  private reader: BinaryReader;

  constructor(reader: BinaryReader, dataReader: BinaryReader) {
    // Read basic resource information
    this.name = reader.readString(4);
    this.count = reader.readInt() + 1;
    // not sure about versions before 8.0
    this.headerOffset = reader.readInt();

    // read resource data header
    const headerReader = new BinaryReader(reader, this.headerOffset);
    this.INT1 = headerReader.readInt();
    this.INT2 = headerReader.readInt();
    this.INT3 = headerReader.readInt();
    this.dataOffset = headerReader.readInt();
    this.INT4 = headerReader.readInt();

    this.reader = new BinaryReader(dataReader, this.dataOffset);

    Object.seal(this);
  }

  public compareName(other: string): boolean {
    return this.name === other;
  }

  public getReader(useCompression = true, index = 0): BinaryReader | null {
    this.reader.setOffset(0);
    let offset = 0;

    for (let i = 0; i < index && !this.reader.eof(); i++) {
      this.reader.setOffset(offset);
      const size = this.reader.readInt();
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

    this.reader.setOffset(offset);
    const size = this.reader.readInt();

    if (!useCompression) {
      // return plain data
      return new BinaryReader(this.reader, offset + 4, size);
    }

    const unpackedSize = this.reader.readInt();

    // decompress
    this.reader.setOffset(offset + 8);
    const buffer = this.reader.readBuffer(size - 4);

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
    return new BinaryReader(result);
  }
}
