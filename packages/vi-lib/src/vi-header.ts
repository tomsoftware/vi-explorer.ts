import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';

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
  private static logging = new Logger('ViHeader');
  private reader: VirtualFile;

  public baseHeader: BaseViHeader | null = null;
  public resourcesHeader: ResourcesListHeader | null = null;
  public fileName: string | null = null;

  constructor(reader: VirtualFile) {
    this.reader = reader;

    const rootHeader = this.readBaseHeader(reader);
    if (rootHeader == null) {
      ViHeader.logging.error('Bad file header!');
      return;
    }

    // move to real header
    reader.seek(rootHeader.rsrcOffset);

    // read real header
    this.baseHeader = this.readBaseHeader(reader);
    if (this.baseHeader == null) {
      ViHeader.logging.error('No resource header found in file!');
      return;
    }

    // read resource header
    this.resourcesHeader = this.readResourceHeader(reader);

    // read filename
    reader.seek(rootHeader.rsrcOffset + this.resourcesHeader.fileNameOffset);

    this.fileName = this.readFileName(reader);

    ViHeader.logging.log('Read VI header with internal name: ' + this.fileName);
  }

  public getResourceHeaderReader(): VirtualFile | null {
    if ((this.baseHeader == null) || (this.resourcesHeader == null)) {
      return null;
    }

    return this.reader.getSubReader(this.baseHeader.rsrcOffset + this.resourcesHeader.resourceListOffset);
  }

  public getDataReader(): VirtualFile | null {
    if (this.resourcesHeader == null) {
      return null;
    }

    return this.reader.getSubReader(this.resourcesHeader.dataSetOffset, this.resourcesHeader.dataSetSize);
  }

  private readFileName(reader: VirtualFile): string | null {
    const size = reader.readByte();
    return reader.readAsciiString(size);
  }

  private readResourceHeader(reader: VirtualFile): ResourcesListHeader {
    return {
      dataSetOffset: reader.readUInt32LE(),
      dataSetSize: reader.readUInt32LE(),
      dataSetINT1: reader.readUInt32LE(),
      dataSetINT2: reader.readUInt32LE(),
      dataSetINT3: reader.readUInt32LE(),
      resourceListOffset: reader.readUInt32LE(),
      fileNameOffset: reader.readUInt32LE()
    };
  }

  private readBaseHeader(reader: VirtualFile): BaseViHeader | null {
    const offset = reader.tell();
    const identifier1 = reader.readAsciiString(6);
    const identifier2 = reader.readUInt16LE();
    const identifier3 = reader.readAsciiString(4);
    const identifier4 = reader.readAsciiString(4);

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
      rsrcOffset: reader.readUInt32LE(),
      rsrcSize: reader.readUInt32LE()
    };
  }
}
