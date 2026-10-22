import { VirtualFile, ByteString } from '@tomsoftware/virtual-fs';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { VCTPClientRef } from './vctp-client-ref';
import { VCTPObjectFactory } from './vctp-object-factory';

export class VCTPObjectTypeDef extends VCTPObjectBase {
  public typDefFlag1: number = 0;
  public typDefControlNames: ByteString[] = [];

  public parse(reader: VirtualFile, version: ViVersion, factory: VCTPObjectFactory) {
    const tmp = reader.readUInt32BE();
    this.typDefFlag1 = tmp;

    const count = reader.readUInt32BE();

    for (let i = 0; i < count; i++) {
      const length = reader.readByte();
      const value = reader.readString(length);
      this.typDefControlNames.push(value);
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

  public override get connectorColor(): string {
    return 'rgb(193, 0, 97)';
  }
}
