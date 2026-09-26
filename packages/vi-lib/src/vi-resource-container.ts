import { BufferedFile, VirtualFile } from '@tomsoftware/virtual-fs';
import { unzlibSync } from 'fflate';
import { Logger } from '@tomsoftware/logger';

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
  private reader: VirtualFile;
  /** size of first container */
  public firstSize: number;

  constructor(reader: VirtualFile, name: string, count: number, headerOffset: number, dataSetOffset: number) {
    this.name = name;
    this.count = count;
    this.headerOffset = headerOffset;

    // read resource data header
    const headerReader = reader.createSubReader(headerOffset);
    this.INT1 = headerReader.readUInt32BE();
    this.INT2 = headerReader.readUInt32BE();
    this.INT3 = headerReader.readUInt32BE();
    this.dataOffset = dataSetOffset + headerReader.readUInt32BE();
    this.INT4 = headerReader.readUInt32BE();

    ViResourceContainer.logging.log('Found container header "'+ name +'" at '+ headerOffset +' point to '+ this.dataOffset);

    // unfortunately I do not know the size of the container
    this.reader = reader.createSubReader(this.dataOffset, null, reader.getFilename() +':' + name);

    const firstPart = ViResourceContainer.getPartOffset(this.reader, 0);
    this.firstSize = firstPart.size;

    Object.seal(this);
  }

  /** returns the full size of this container with all parts and part-headers */
  public calculateContainerSize(reader: VirtualFile, count: number): number {
    const lastPart = ViResourceContainer.getPartOffset(reader, count - 1);
    return lastPart.nextOffset;
  }

  private static getPartOffset(reader: VirtualFile, index: number): {offset: number, size: number, nextOffset: number} {
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

      size = reader.readUInt32BE();

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
  public getReader(useCompression = true, index = 0): VirtualFile | null {
    const partInfo = ViResourceContainer.getPartOffset(this.reader, index);

    if (this.reader.eof()) {
      ViResourceContainer.logging.error('Unable to get data for resource ' + this.name + ' with index: ' + index);
      return null;
    }

    if (!useCompression) {
      // return plain data
      return this.reader.createSubReader(partInfo.offset, partInfo.size);
    }

    const unpackedSize = this.reader.readUInt32BE();

    // decompress
    this.reader.seek(partInfo.offset + 4);
    const buffer = this.reader.readBytes(partInfo.size - 4);

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
