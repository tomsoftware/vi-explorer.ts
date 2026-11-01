import { unzlibSync } from 'fflate';
import { Logger } from '@tomsoftware/logger';
import { ViDataReader } from './vi-data-reader';

/** A VI resource container is a basic container i a VI file  */
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
  private reader: ViDataReader;
  /** size of first container */
  public firstSize: number;

  constructor(reader: ViDataReader, name: string, count: number, headerOffset: number, dataSetOffset: number) {
    this.name = name;
    this.count = count;
    this.headerOffset = headerOffset;

    // read resource data header
    const headerReader = reader.createSubReader(headerOffset);
    this.INT1 = headerReader.readUInt32('vi-resource-container.INT1@' + this.name);
    this.INT2 = headerReader.readUInt32('vi-resource-container.INT2@' + this.name);
    this.INT3 = headerReader.readUInt32('vi-resource-container.INT3@' + this.name);
    this.dataOffset = dataSetOffset + headerReader.readUInt32('vi-resource-container.dataOffset@' + this.name);
    this.INT4 = headerReader.readUInt32('vi-resource-container.INT4@' + this.name);

    ViResourceContainer.logging.log('Found container header "'+ name +'" at '+ headerOffset +' point to '+ this.dataOffset);

    // create reader to reade the parts header
    this.reader = reader.createSubReader(this.dataOffset, null);

    const firstPart = this.getPartOffset(this.reader, 0);
    this.firstSize = firstPart.size;

    Object.seal(this);
  }

  /** returns the full size of this container with all parts and part-headers */
  public calculateContainerSize(reader: ViDataReader, count: number): number {
    const lastPart = this.getPartOffset(reader, count - 1);
    return lastPart.nextOffset;
  }

  private getPartOffset(reader: ViDataReader, index: number): {offset: number, size: number, nextOffset: number} {
    let offset = 0;
    let nextOffset = 0;
    let size = 0;

    if (index < 0) {
      return {offset: 0, size: 0, nextOffset: 0};
    }

    // Jump over other blocks
    for (let i = 0; i <= index && !reader.eof(); i++) {
      offset = nextOffset;
      reader.seek(offset);

      size = reader.readUInt32('vi-resource-container.part-size@' + this.name);

      nextOffset += size;

      // add 4 bytes for size-value
      nextOffset += 4;

      // pad the size 4 Bytes
      nextOffset = (nextOffset + 3) & ~0x03;
    }

    return {offset: (offset + 4), size, nextOffset};
  }

  public compareName(other: string): boolean {
    return this.name === other;
  }

  /** return a file read to the content of this resource */
  public getReader(useCompression = true, index = 0): ViDataReader | null {
    const partInfo = this.getPartOffset(this.reader, index);

    if (this.reader.eof()) {
      ViResourceContainer.logging.error('Unable to get data for resource ' + this.name + ' with index: ' + index);
      return null;
    }

    const containerName = this.reader.getFilename() +':' + this.name;

    if (!useCompression) {
      // return plain data
      return this.reader.createSubReader(partInfo.offset, partInfo.size, containerName);
    }

    const unpackedSize = this.reader.readUInt32('vi-resource-container.unpacked-size@'+ this.name);

    // decompress
    this.reader.seek(partInfo.offset + 4);
    const buffer = this.reader.readBytes(partInfo.size - 4, 'vi-resource-container.compressed-data@'+ this.name);

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
    return this.reader.createNew(result, containerName);
  }
}
