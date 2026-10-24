import { ByteString } from '@tomsoftware/virtual-fs';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { VCTPClientRef } from './vctp-client-ref';
import { VCTPObjectFactory } from './vctp-object-factory';
import { ViDataReader } from '../vi-data-reader';

export class VCTPObjectTypeDef extends VCTPObjectBase {
  public typDefFlag1: number = 0;
  public typDefControlNames: ByteString[] = [];

  public parse(reader: ViDataReader, version: ViVersion, factory: VCTPObjectFactory) {
    const tmp = reader.readUInt32('vctp-type-def.flag1');
    this.typDefFlag1 = tmp;

    const count = reader.readUInt32('vctp-type-def.control-name-count');

    for (let i = 0; i < count; i++) {
      const length = reader.readByte('vctp-type-def.control-name-length');
      const value = reader.readString(length, 'vctp-type-def.control-name');
      this.typDefControlNames.push(value);
    }

    const length = Math.max(0, reader.readUInt16('vctp-type-def.child-length') - 4);
    const flags = reader.readByte('vctp-type-def.child-flags');
    const offset = reader.tell();
    const objectType = reader.readByte('vctp-type-def.child-type');

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
