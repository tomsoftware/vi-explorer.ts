import { Logger } from '@tomsoftware/logger';
import { ViDataReader } from '../vi-data-reader';
import { ViVersion } from '../vi-version';
import { VCTPObjectBase } from '../vctp-parsing/vctp-object-base';
import { VCTPObjectFactory } from '../vctp-parsing/vctp-object-factory';

/** Parses the VCTP container that contains datatypes used in the VI */
export class VCTP {
  private static readonly logging = new Logger('VCTP');

  private readonly objects: VCTPObjectBase[] = [];
  private readonly indexMap: Array<number> = [];
  /** offset in file where the ID-Table starts */
  private idTableOffset = -1;

  constructor(reader: ViDataReader | null, version: ViVersion) {
    if (reader == null) {
      VCTP.logging.error('File has no connector information!');
      return;
    }

    // VCTP layout:
    // 1. Type descriptions
    this.objects = this.parseTypeDefinitions(reader, version);
    // 2. Type-Id-Table
    this.indexMap = this.parseIdList(reader);
  }

  /** returns one type definition by index */
  public getByIndex(index: number): VCTPObjectBase | null {
    return this.objects[index] ?? null;
  }

  /** returns one type definition by its ID (1-based) */
  public getById(id: number): VCTPObjectBase | null {
    // Type IDs are 1-based in the VI format.
    const index = (this.indexMap[id - 1]);
    if (index == null) {
      return null;
    }
    return this.objects[index] ?? null;
  }

  /** Parse a map of "index <-> id" */
  private parseIdList(reader: ViDataReader) {

    reader.seek(this.idTableOffset);
    const indexMap: number[] = [];
    const count = reader.readVarSizeNumber('count');
    for (let i = 0; i < count; i++) {
      const id = reader.readVarSizeNumber('id');
      indexMap.push(id);
    }
    return indexMap;
  }

  /** Parse list of Type Descriptions in the file */
  private parseTypeDefinitions(reader: ViDataReader, version: ViVersion): VCTPObjectBase[] {
    const factory = new VCTPObjectFactory();

    reader.seek(0);
    const count = reader.readUInt32('vctp.root-count');
    let pos = reader.tell();

    const rootObjects: VCTPObjectBase[] = [];

    // read all root objects
    for (let i = 0; i < count; i++) {
      const length = reader.readVarSizeNumber('object-length');

      if (length < 4) {
        VCTP.logging.error(`Internal error: wrong block size at object ${i}!`);
        return [];
      }

      const flags = reader.readByte('vctp.root.flags');
      const objectType = reader.readByte('vctp.root.objectType');
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

    this.idTableOffset = pos;

    // Now we parse the types. Doing this after the parsing of the root objects
    //   is important to keep the indexing of the elements cause parsing can also create
    //   new objects in "factory.objects" e.g. by a cluster but this need to be sorted
    //   behind the root-objects
    const subReader = reader.createSubReader(0);
    for (const newObject of rootObjects) {
      subReader.seek(newObject.offset);
      newObject.parse(subReader, version, factory);
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
