import { VirtualFile } from '@tomsoftware/virtual-fs';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { VCTPClientRef } from './vctp-client-ref';
import { VCTPAttributeType } from './vctp-attribute-type';
import { VCTPObjectFactory } from './vctp-object-factory';


export class VCTPObjectTypeDef extends VCTPObjectBase {
  public parse(reader: VirtualFile, version: ViVersion, factory: VCTPObjectFactory) {

    const tmp = reader.readUInt32BE();
    this.addPropertyNumber(VCTPAttributeType.TypDefFlag1, tmp);

    const count = reader.readUInt32BE();
    this.addPropertyNumber(VCTPAttributeType.TypDefControlNameCount, count);

    for (let i = 0; i < count; i++) {
      const length = reader.readByte();
      const value = reader.readAsciiString(length);
      this.addPropertyString(VCTPAttributeType.TypDefControlName1 + i, value);
    }

    const length = Math.max(0, reader.readUInt16BE() - 4);
    const flags = reader.readByte();
    const offset = reader.tell();
    const objectType = reader.readByte();

    const newObject = factory.createObject({
      offset,
      length,
      flags,
      objectType
    });

    if (newObject == null) {
      return;
    }

    const newIndex = newObject.index;
    this.children.push(new VCTPClientRef(newIndex, factory.resolveObjectByIndex(newIndex), 0));
    newObject.parse(reader, version, factory);

    this.paresLabel(reader);
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }
}
