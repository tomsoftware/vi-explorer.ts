import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../vi-version';
import { VCTPAttribute } from './vctp-attribute';
import { VCTPClientRef } from './vctp-client-ref';
import { VCTPMainType, VCTPType } from './vctp-types';
import { VCTPValueEntry } from './vctp-value-entry';
import { Logger } from '@tomsoftware/logger';
import { VCTPAttributeType } from './vctp-attribute-type';

export type BaseTypeInfo = {
  offset: number,
  length: number,
  flags: number,
  objectType: number
}

/** Defines groups a Type is associated with */
export enum TypeGroup {
  Unknown = 0,
  Number = 1,
  String = 2,
  Path = 3,
  Container = 4
}

export interface IObjectFactory {
  createObject(baseTypeInfo: BaseTypeInfo): VCTPObjectBase | null;
  resolveObjectByIndex(index: number): VCTPObjectBase;
}

export abstract class VCTPObjectBase {
  protected static readonly logging = new Logger('VCTPObject');

  public readonly index: number;
  public readonly type: VCTPType;
  public readonly offset;
  public readonly length;
  public readonly flags;

  public label = '';

  public readonly attributes: VCTPAttribute[] = [];
  public readonly children: VCTPClientRef[] = [];
  public readonly values: VCTPValueEntry[] = [];

  /** Return a grouped type of this type definition */
  public abstract getTypeGroup: TypeGroup;

  public static mainTypeFromValue(fileType: number): VCTPMainType {
    if (fileType < 0) {
      return VCTPMainType.Unknown;
    }
    if (fileType === 0) {
      return VCTPMainType.Void;
    }
    return (fileType >> 4) & 0xF;
  }

  public get mainType() : VCTPMainType {
    return VCTPObjectBase.mainTypeFromValue(this.type);
  }

  public get typeName(): string {
    return VCTPType[this.type] ?? ('Unknown-'+ this.type);
  }

  public get mainTypeName(): string {
    return VCTPMainType[this.mainType] ?? 'Unknown';
  }


  constructor(index: number, baseTypeInfo: BaseTypeInfo) {
    this.index = index;
    this.offset = baseTypeInfo.offset;
    this.length = baseTypeInfo.length;
    this.flags = baseTypeInfo.flags;
    this.type = baseTypeInfo.objectType;
  }

  public abstract parse(reader: VirtualFile, version: ViVersion, factory: IObjectFactory): void;

  protected addPropertyNumber(propertyType: VCTPAttributeType, value: number): void {
    this.attributes.push(
      new VCTPAttribute(propertyType, value, 'number')
    );
  }

  protected addPropertyString(propertyType: number, value: string): void {
    this.attributes.push(
      new VCTPAttribute(propertyType, value, 'string')
    );
  }


  protected paresLabel(reader: VirtualFile) {
     if ((this.flags & 0x40) === 0) {
      return;
     }

    const length = reader.readByte();
    const leftLength = this.length - (reader.tell() - this.offset);

    if (leftLength >= length) {
      this.label = reader.readAsciiString(length);
    } else {
      VCTPObjectBase.logging.error(`Caption/Label size mismatch (${leftLength - length} - len: ${length} - size: ${this.length}) of type:0x${this.type.toString(16)} [index=${this.index}] Error @ ${this.offset}`);
    }

  }
}
