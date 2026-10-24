import { ViDataReader } from '../vi-data-reader';
import { IObjectFactory, TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { VCTPClientRef } from './vctp-client-ref';

export class VCTPObjectArray extends VCTPObjectBase {
  public arrayDimensions = 0;
  public arrayFixedSize = 0;

  public parse(reader: ViDataReader, version: ViVersion, factory: IObjectFactory) {
    const dimensions = reader.readUInt16('vctp-array.dimensions');
    if (dimensions > 64) {
      VCTPObjectBase.logging.error(`Array Dimension (${dimensions}) is > 64 @ ${this.offset}`);
      return;
    }

    this.arrayDimensions = dimensions;

    let ok = true;
    for (let i = 0; i < dimensions; i++) {
      const tmp = reader.readUInt32('vctp-array.dimension');
      if (tmp !== 0xffffffff && tmp !== 0xffffffff) {
        if ((tmp & 0x80000000) !== 0) {
          this.arrayFixedSize = tmp & 0x00ffffff;
        } else {
          VCTPObjectBase.logging.error(`Array with property (index: ${i} - flag: ${tmp} ? ) @ ${this.offset}`);
          ok = false;
        }
      }
    }

    if (ok) {
      const arrayTypeIndex = reader.readUInt16('vctp-array.type-index');
      if (arrayTypeIndex > this.index) {
        VCTPObjectBase.logging.error(`Wrong value for Array-Type-Index ${arrayTypeIndex} is > 'This-Array-Object'-Index: ${this.index} @ ${this.offset}`);
        ok = false;
      } else {
        this.children.push(new VCTPClientRef(arrayTypeIndex, factory.resolveObjectByIndex(arrayTypeIndex), 0));
      }
    }

    if (ok) {
      this.paresLabel(reader);
    }
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }

  public override get connectorColor(): string {
    return this.children[0]?.target?.connectorColor ?? 'none';
  }
}
