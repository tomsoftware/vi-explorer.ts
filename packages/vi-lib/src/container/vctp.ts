import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../vi-version';
import { VCTPObjectBase } from '../vctp-parsing/vctp-object-base';
import { VCTPObjectFactory } from '../vctp-parsing/vctp-object-factory';

/** Parses the VCTP container that contains datatypes used in the VI */
export class VCTP {
  private static readonly logging = new Logger('VCTP');

  private readonly objects: VCTPObjectBase[] = [];
  private readonly indexMap: Array<number> = [];
 
  constructor(reader: VirtualFile | null, version: ViVersion) {
    if (reader == null) {
      VCTP.logging.error('File has no connector information!');
      return;
    }

    this.objects = this.parseTypeDefinitions(reader, version);
    this.indexMap = this.parseIdList(reader);
  }

  /** returns one type definition by index */
  public getByIndex(index: number): VCTPObjectBase | null {
    return this.objects[index] ?? null;
  }

  /** returns one type definition by it's id */
  public getById(id: number): VCTPObjectBase | null {
    // indexes are 1 based in VIs
    const index = (this.indexMap[id - 1]);
    if (index == null) {
      return null;
    }
    return this.objects[index] ?? null;
  }

  /** Pars a map of "index <-> id" */
  private parseIdList(reader: VirtualFile) {
    const indexMap: number[] = [];
    const count = this.readVariableSizeFieldU2p2(reader);
    for (let i = 0; i< count; i++) {
      const id = this.readVariableSizeFieldU2p2(reader);
      indexMap.push(id);
    }
    return indexMap;
  }

  protected readVariableSizeFieldU2p2(reader: VirtualFile): number {
    const value = reader.readUInt16BE();
    if ((value & 0x8000) !== 0) {
      return ((value & 0x7fff) << 16) | reader.readUInt16BE();
    }
    return value;
  }


  /** Parse list of Type Descriptions in the file */
  private parseTypeDefinitions(reader: VirtualFile, version: ViVersion): VCTPObjectBase[] {
    const factory = new VCTPObjectFactory();

    reader.seek(0);
    // read root object count
    const count = reader.readUInt32BE();
    let pos = reader.tell();

    const rootObjects: VCTPObjectBase[] = [];

    // read all root objects
    for (let i = 0; i < count; i++) {
      const length = reader.readUInt16BE();

      if (length < 4) {
        VCTP.logging.error(`Internal error: wrong block size at object ${i}!`);
        return [];
      }

      const flags = reader.readByte();
      const objectType = reader.readByte();
      const offset = reader.tell();
      const newObject = factory.createObject({
        offset,
        length,
        flags,
        objectType
      });
      if (newObject != null) {
        rootObjects.push(newObject);
      }
      
      // Jump over the object-data
      pos = pos + length;
      reader.seek(pos);
    }

    // read type specific values
    for (const newObject of rootObjects) {
      reader.seek(newObject.offset);
      newObject.parse(reader, version, factory);
    }

    return factory.objects;
  }

  /** generate an xml-line output for this VCTP container */
  public toXml(): string {
    const lines: string[] = ['<VCTP>'];

    for (const obj of this.objects) {
      if (obj == null) {
        continue;
      }

      lines.push(obj.toXml(1, this.objects));
    }

    lines.push('</VCTP>');
    return lines.join('\n');
  }
}
