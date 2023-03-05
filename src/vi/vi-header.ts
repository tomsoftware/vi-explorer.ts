import { BinaryReader } from '@/utilities/binary-reader';
import { LogHandler } from '@/utilities/log-handler';
import { ViResourceContainer } from './vi-resource-container';

export interface BaseViHeader {
    /** position of header in File */
    offset: number;
    /** magic of VI Vile */
    identifier1: string;
    /** magic of VI Vile */
    identifier2: number;
    /** magic of VI Vile */
    identifier3: string;
    /** magic of VI Vile */
    identifier4: string;
    /** resource block offset in file */
    rsrcOffset: number;
    /** resource block length */
    rsrcSize: number;
}

export interface ResourcesListHeader {
    dataSetOffset: number;
    dataSetSize: number;

    dataSetINT1: number;
    dataSetINT2: number;
    dataSetINT3: number;

    resourceListOffset: number;
    fileNameOffset: number;
}

export class ViHeader {
  private static logging = new LogHandler('ViHeader');
  private reader: BinaryReader;

  public baseHeader: BaseViHeader | null = null;
  public resourcesHeader: ResourcesListHeader | null = null;
  public fileName: string | null = null;

  constructor(reader: BinaryReader) {
    this.reader = reader;

    const rootHeader = this.readBaseHeader(reader);
    if (rootHeader == null) {
      ViHeader.logging.error('Bad file header!');
      return;
    }

    // move to real header
    reader.setOffset(rootHeader.rsrcOffset);

    // read real header
    this.baseHeader = this.readBaseHeader(reader);
    if (this.baseHeader == null) {
      ViHeader.logging.error('No resource header found in file!');
      return;
    }

    // read resource header
    this.resourcesHeader = this.readResourceHeader(reader);

    // read filename
    reader.setOffset(rootHeader.rsrcOffset + this.resourcesHeader.fileNameOffset);

    this.fileName = this.readFileName(reader);

    ViHeader.logging.debug('Read VI header with internal name: ' + this.fileName);
  }

  public getResourceHeaderReader(): BinaryReader | null {
    if ((this.baseHeader == null) || (this.resourcesHeader == null)) {
      return null;
    }

    return new BinaryReader(this.reader, this.baseHeader.rsrcOffset + this.resourcesHeader.resourceListOffset);
  }

  public getDataReader(): BinaryReader | null {
    if (this.resourcesHeader == null) {
      return null;
    }

    return new BinaryReader(this.reader, this.resourcesHeader.dataSetOffset, this.resourcesHeader.dataSetSize);
  }

  private readFileName(reader: BinaryReader): string | null {
    const size = reader.readByte();
    return reader.readString(size);
  }

  private readResourceHeader(reader: BinaryReader): ResourcesListHeader {
    return {
      dataSetOffset: reader.readInt(),
      dataSetSize: reader.readInt(),
      dataSetINT1: reader.readInt(),
      dataSetINT2: reader.readInt(),
      dataSetINT3: reader.readInt(),
      resourceListOffset: reader.readInt(),
      fileNameOffset: reader.readInt()
    };
  }

  private readBaseHeader(reader: BinaryReader): BaseViHeader | null {
    const offset = reader.pos;
    const identifier1 = reader.readString(6);
    const identifier2 = reader.readWord();
    const identifier3 = reader.readString(4);
    const identifier4 = reader.readString(4);

    if (identifier1 !== 'RSRC\r\n') {
      ViHeader.logging.error('Wrong File Format: Unknown identifier1: ' + identifier1);
      return null;
    }

    if (identifier3 === 'LVAR') {
      ViHeader.logging.error('This program does not support .lvlib / LabView-LIB-files : wrong value for HeadIdentifier3: LVAR');
      return null;
    }
    if (identifier3 !== 'LVIN') {
      ViHeader.logging.error('Wrong File Format: Unknown identifier3: ' + identifier3);
      return null;
    }
    if (identifier4 !== 'LBVW') {
      ViHeader.logging.error('Wrong File Format: Unknown identifier4: ' + identifier4);
      return null;
    }

    return {
      offset,
      identifier1,
      identifier2,
      identifier3,
      identifier4,
      rsrcOffset: reader.readInt(),
      rsrcSize: reader.readInt()
    };
  }
}
