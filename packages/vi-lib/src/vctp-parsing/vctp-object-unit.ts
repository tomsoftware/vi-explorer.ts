import { ViDataReader } from '../vi-data-reader';
import { TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { VCTPType } from './vctp-types';
import { VCTPValueEntry } from './vctp-value-entry';

export class VCTPObjectUnit extends VCTPObjectBase {
  public parse(reader: ViDataReader, version: ViVersion) {
    const count = reader.readUInt16('vctp-unit.count');
    const isTextEnum = this.type === VCTPType.UnitU16 || this.type === VCTPType.UnitU8 || this.type === VCTPType.UnitU32;
    let dataSize = 0;

    for (let i = 0; i < count; i++) {
      const pos = reader.tell();
      let label = '';
      let length = 0;

      if (isTextEnum) {
        length = reader.readByte('vctp-unit.label-length');
        // nt sure about the encoding?
        label = reader.readString(length, 'vctp-unit.label').asAscii;
        dataSize += length + 1;
      } else {
        label = `0x${reader.readUInt32('vctp-unit.constant').toString(16)}`;
        dataSize += 4;
      }

      this.values.push(new VCTPValueEntry(pos, label, length, this.type, 'UnitValue'));
    }

    if ((dataSize % 2) !== 0) {
      const tmp = reader.readByte('vctp-unit.padding-byte');
      if (tmp !== 0) {
        VCTPObjectBase.logging.error(`Number+Unit padding Error - unknown Data [0x${tmp.toString(16)}] ? index=${this.index} @ ${this.offset}`);
        return;
      }
    }

    const trailing = reader.readByte('vctp-unit.trailing-byte');
    if (trailing !== 0) {
      VCTPObjectBase.logging.error(`Number+Unit - Unknown Data [0x${trailing.toString(16)}] Property? index=${this.index} @ ${this.offset}`);
      return;
    }

    this.paresLabel(reader);
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Number;
  }

}
