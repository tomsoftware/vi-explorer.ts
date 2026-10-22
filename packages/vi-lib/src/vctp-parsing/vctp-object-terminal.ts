import { VirtualFile } from '@tomsoftware/virtual-fs';
import { IObjectFactory, TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { VCTPClientRef } from './vctp-client-ref';

/** Defines the type-definition of a Connector / Terminal of a VI */
export class VCTPObjectTerminal extends VCTPObjectBase {
  public terminalFlags = 0;
  public terminalPatternValue = 0;

  /** Index of the pattern used by this terminal / connector definition */
  public get terminalPattern() {
    return (this.terminalPatternValue >> 3);
  }

  /** returns the number of rotations of this connector-definition */
  public get terminalRotation() {
    return (this.terminalPatternValue & 3);
  }

  /** returns >0 if the connector-definition is horizontal flipped */
  public get terminalFlip() {
    return (this.terminalPatternValue >> 2) & 1;
  }

  public parse(reader: VirtualFile, version: ViVersion, factory: IObjectFactory) {
    const count = reader.readUInt16BE();
    if (count > 125) {
      VCTPObjectBase.logging.error(`Terminal count > 124 @ ${this.offset}`);
      return;
    }

    for (let i = 0; i < count; i++) {
      const index = reader.readUInt16BE();
      this.children.push(new VCTPClientRef(index, factory.resolveObjectByIndex(index), 0));
    }

    this.terminalFlags = reader.readUInt16BE();
    this.terminalPatternValue = reader.readUInt16BE();

    if (version.compareTo(8, 0) >= 0) {
      const unknown = reader.readUInt16BE();
      for (let i = 0; i < count; i++) {
        this.children[i].flags = reader.readUInt32BE();
      }
    } else {
      for (let i = 0; i < count; i++) {
        this.children[i].flags = reader.readUInt16BE();
      }
    }

    this.paresLabel(reader);
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }

  public override getAttributes(): readonly [string, string | number][] {
    return [
      ['flags', this.terminalFlags],
      ['pattern', this.terminalPattern],
      ['rot', this.terminalRotation],
      ['flip', this.terminalFlip],
    ]
  }
}
