import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../vi-version';
import { VCTPObjectBase } from '../vctp-parsing/vctp-object-base';
import { VCTPObjectFactory } from '../vctp-parsing/vctp-object-factory';

/** Parses the VCTP container that contains datatypes used in the VI */
export class VCTP {
  private static readonly logging = new Logger('VCTP');

  private objects: VCTPObjectBase[] = [];
  private readonly interfaceCache: number[] = [];

 
  constructor(reader: VirtualFile | null, version: ViVersion) {
    if (reader == null) {
      VCTP.logging.error('File has no connector information!');
      return;
    }

    this.parse(reader, version);
  }

  /** Parse a given container */
  private parse(reader: VirtualFile, version: ViVersion): void {
    const factory = new VCTPObjectFactory();

    reader.seek(0);
    // read root object count
    const count = reader.readUInt32BE();
    let pos = reader.tell();

    // 1. Create all objects
    reader.seek(pos);

    const rootObjects: VCTPObjectBase[] = [];

    for (let i = 0; i < count; i++) {
      const length = reader.readUInt16BE();

      if (length < 4) {
        VCTP.logging.error(`Internal error: wrong block size at object ${i}!`);
        return;
      }

      const flags = reader.readByte();
      const objectType = reader.readByte();
      const newObject = factory.createObject(reader.tell(), length,flags, objectType);
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

    this.objects = factory.objects;
  }

  /** generate an xml-line output for this VCTP container */
  public toXml(): string {
    const lines: string[] = ['<VCTP>'];
    this.objectsToXml(this.objects, 1, lines);
    lines.push('</VCTP>');
    return lines.join('\n');
  }


  private objectsToXml(
    objectList: VCTPObjectBase[],
    level: number,
    out: string[],
  ): void {
    const indent = '  '.repeat(level);

    for (const obj of objectList) {
      if (obj == null) {
        continue;
      }

      const attrs = this.buildAttributes(obj);
      const children = this.resolveChildren(obj);

      if (children.length === 0) {
        out.push(`${indent}<VAR ${attrs} />`);
      } else {
        out.push(`${indent}<VAR ${attrs} >`);
        this.objectsToXml(children, level + 1, out);
        out.push(`${indent}</VAR>`);
      }
    }
  }
/** Build the attribute values of the vcpt element */
  private buildAttributes(obj: VCTPObjectBase): string {
    const typeHex = '0x' + obj.type.toString(16);
    const typeName = obj.typeName;

    const parts = [
      `index='${obj.index}'`,
      `ObjectType='${typeHex}:${typeName}'`,
    ];

    if (obj.label) {
      parts.push(`label='${obj.label}'`);
    }

    // add additional attributes
    for (const attr of obj.attributes) {
      parts.push(`${attr.name}='${this.escapeXml(String(attr.value))}'`);
    }

    return parts.join(' ');
  }

  /** Resolves VCTPObjectBase from the children-references-index list */
  private resolveChildren(obj: VCTPObjectBase): VCTPObjectBase[] {
    const result: VCTPObjectBase[] = [];
    for (const ref of obj.children) {
      const child = this.objects[ref.index];
      if (child) {
        result.push(child);
      } else {
        VCTP.logging.warn(`Child index ${ref.index} not found (parent ${obj.index})`);
      }
    }
    return result;
  }

  private escapeXml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&apos;')
      .replace(/"/g, '&quot;');
  }
}
