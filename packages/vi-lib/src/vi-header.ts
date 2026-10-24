import { ByteString } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViDataReader } from './vi-data-reader';

export interface BaseViHeader {
    /** position of header in File */
    offset: number;
    /** position of the resources block in the file */
    resourceListOffset: number;
    /** magic of VI Vile */
    identifier1: string;
    /** version of the file format of this VI Vile */
    fileFormatVersion: number;
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
    resourceListSize: number;
}

export class ViHeader {
  private static logging = new Logger('ViHeader');

  public baseHeader: BaseViHeader | null = null;
  public resourcesHeader: ResourcesListHeader | null = null;
  public fileName: ByteString | null = null;

  constructor(reader: ViDataReader) {
    // find and read basic header
    this.baseHeader = this.findLastBasicHeader(reader);
    if (this.baseHeader == null) {
      ViHeader.logging.error('No basic header found in file!');
      return;
    }

    // read resource header
    this.resourcesHeader = this.readResourceHeader(reader, this.baseHeader);

    // read resource headers - ??
    this.fileName = this.readFileName(reader, this.resourcesHeader, this.baseHeader);

    ViHeader.logging.log('Read VI header with internal name: ' + this.fileName.asAscii);
  }

  /** Find and read the last basic header of this VI file */
  private findLastBasicHeader(reader: ViDataReader): BaseViHeader | null {
    let curPos = 0;
    let lastPos = -1;
    let header: BaseViHeader | null = null;

    // move as long as no new header with different offset has been found
    while (lastPos != curPos) {
      lastPos = curPos;

      header = this.readBaseHeader(reader, curPos);

      if ((header == null) || (header.rsrcOffset <= 0) || (header.rsrcSize <= 0)) {
        return null;
      }

      curPos = header.rsrcOffset;
    }

    return header;
  }

  private readFileName(reader: ViDataReader, header: ResourcesListHeader, basicHeader: BaseViHeader): ByteString {
    reader.seek(basicHeader.rsrcOffset + header.resourceListSize);
    const size = reader.readByte('vi-header.file-name.length');
    return reader.readString(size, 'vi-header.file-name');
  }

  private readResourceHeader(reader: ViDataReader, basicHeader: BaseViHeader): ResourcesListHeader {
    reader.seek(basicHeader.resourceListOffset);

    return {
      dataSetOffset: reader.readUInt32('vi-header.resource-header.dataSetOffset'),
      dataSetSize: reader.readUInt32('vi-header.resource-header.dataSetSize'),
      dataSetINT1: reader.readUInt32('vi-header.resource-header.dataSetINT1'),
      dataSetINT2: reader.readUInt32('vi-header.resource-header.dataSetINT2'),
      dataSetINT3: reader.readUInt32('vi-header.resource-header.dataSetINT3'),
      resourceListOffset: reader.readUInt32('vi-header.resource-header.resourceListOffset') + basicHeader.rsrcOffset,
      resourceListSize: reader.readUInt32('vi-header.resource-header.resourceListSize')
    };
  }

  /** read the basic header of the vi file */
  private readBaseHeader(reader: ViDataReader, offset: number): BaseViHeader | null {
    reader.seek(offset);

    const identifier1 = reader.readString(6, 'vi-header.base-header.identifier1').asAscii;
    const fileFormatVersion = reader.readUInt16('vi-header.base-header.fileFormatVersion');
    const identifier3 = reader.readString(4, 'vi-header.base-header.identifier3').asAscii;
    const identifier4 = reader.readString(4, 'vi-header.base-header.identifier4').asAscii;
    const rsrcOffset = reader.readUInt32('vi-header.base-header.rsrcOffset');
    const rsrcSize = reader.readUInt32('vi-header.base-header.rsrcSize');
    const resourceListOffset = reader.tell();

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
      fileFormatVersion,
      identifier3,
      identifier4,
      rsrcOffset,
      rsrcSize,
      resourceListOffset: resourceListOffset
    };
  }
}

