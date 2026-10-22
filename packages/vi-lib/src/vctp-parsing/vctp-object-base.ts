import { VirtualFile, ByteString } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../vi-version';
import { VCTPClientRef } from './vctp-client-ref';
import { VCTPMainType, VCTPType } from './vctp-types';
import { VCTPValueEntry } from './vctp-value-entry';
import { Logger } from '@tomsoftware/logger';

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

export type GroupCounts = Record<TypeGroup, number>;

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

  public label: ByteString = ByteString.empty;

  public readonly children: VCTPClientRef[] = [];
  public readonly values: VCTPValueEntry[] = [];

  /** Return a grouped type of this type definition */
  public abstract typeGroup: TypeGroup;

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

  /** Connector color used for this data type in the terminal image. */
  public get connectorColor(): string {
    return 'none';
  }

  /** Human-readable tooltip text for the connector rectangle. */
  public get tooltipText(): string {
    const label = this.label?.asUtf8?.trim();
    return label ? label : this.typeName;
  }


  constructor(index: number, baseTypeInfo: BaseTypeInfo) {
    this.index = index;
    this.offset = baseTypeInfo.offset;
    this.length = baseTypeInfo.length;
    this.flags = baseTypeInfo.flags;
    this.type = baseTypeInfo.objectType;
  }

  public toXml(level = 0, objects: VCTPObjectBase[] = []): string {
    const indent = '  '.repeat(level);
    const attrs = this.buildXmlAttributes();
    const children = this.resolveChildren(objects);

    if (children.length === 0) {
      return `${indent}<Type ${attrs} />`;
    }

    const lines = [`${indent}<Type ${attrs} >`];
    for (const child of children) {
      lines.push(child.toXml(level + 1, objects));
    }
    lines.push(`${indent}</Type>`);
    return lines.join('\n');
  }

  public abstract parse(reader: VirtualFile, version: ViVersion, factory: IObjectFactory): void;


  /** Return the count of groups-type defined by this type definition */
  public countGroups(): GroupCounts {
    const result: GroupCounts = {
      [TypeGroup.Unknown]: 0,
      [TypeGroup.Number]: 0,
      [TypeGroup.String]: 0,
      [TypeGroup.Path]: 0,
      [TypeGroup.Container]: 0,
    };

    // add type itself
    result[this.typeGroup]++;

    // add children
    for (const child of this.children) {
      const childCounts = child.target.countGroups();

      for (const key of Object.keys(result)) {
        result[Number(key) as TypeGroup] += childCounts[Number(key) as TypeGroup];
      }
    }

    return result;
  }

  protected paresLabel(reader: VirtualFile) {
     if ((this.flags & 0x40) === 0) {
      return;
     }

    const length = reader.readByte();
    const leftLength = this.length - (reader.tell() - this.offset);

    if (leftLength >= length) {
      this.label = reader.readString(length);
    } else {
      VCTPObjectBase.logging.error(`Caption/Label size mismatch (${leftLength - length} - len: ${length} - size: ${this.length}) of type:0x${this.type.toString(16)} [index=${this.index}] Error @ ${this.offset}`);
    }
  }

  /** returns additional attributes this vctp object has */
  public getAttributes(): readonly [string, string | number][] {
    return [];
  }

  protected buildXmlAttributes(): string {
    const typeName = this.typeName;

    const parts = [
      `index='${this.index}'`,
      `type='${typeName}'`,
    ];

    if (this.label) {
      parts.push(`label='${this.label.asUtf8}'`);
    }

    const attributes = this.getAttributes();
    for (const attr of attributes) {
      parts.push(`${attr[0]}='${VCTPObjectBase.escapeXml(String(attr[1]))}'`);
    }

    return parts.join(' ');
  }

  protected resolveChildren(objects: VCTPObjectBase[]): VCTPObjectBase[] {
    const result: VCTPObjectBase[] = [];

    for (const ref of this.children) {
      const child = objects[ref.index];
      if (child) {
        result.push(child);
      } else {
        VCTPObjectBase.logging.warn(`Child index ${ref.index} not found (parent ${this.index})`);
      }
    }

    return result;
  }

  private static escapeXml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&apos;')
      .replace(/"/g, '&quot;');
  }
}
