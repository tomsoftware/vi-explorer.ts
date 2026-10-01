import { Logger } from '@tomsoftware/logger';
import { BufferedFile, VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../vi-version';
import { VCTPMainType, VCTPType } from '../vctp-parsing/vctp-types';
import { VCTPAttributeType } from '../vctp-parsing/vctp-attribute-type';
import { VCTPObject } from '../vctp-parsing/vctp-object';
import { VCTPAttribute } from '../vctp-parsing/vctp-attribute';
import { VCTPClientRef } from '../vctp-parsing/vctp-client-ref';
import { VCTPValueEntry } from '../vctp-parsing/vctp-value-entry';


export class VCTP {
  private static readonly logging = new Logger('VCTP');

  private readonly reader: VirtualFile;
  private readonly version: ViVersion;
  private readonly objects: VCTPObject[] = [];
  private readonly interfaceCache: number[] = [];
  private readonly typeNames = new Map<number, string>();
  private readonly attributeNames = new Map<number, string>();

  /*
  public get objectCount(): number {
    return this.objects.length;
  }

  public getObjects(): readonly VCTPObject[] {
    return this.objects;
  }

  public getInterfaceIndex(index: number): number {
    return this.interfaceCache[index] ?? -1;
  }

  public getInterfaceCount(): number {
    return this.interfaceCache.length;
  }
  */
 
  constructor(reader: VirtualFile | null, version: ViVersion) {
    if (reader == null) {
      VCTP.logging.error('File has no connector information!');
      this.reader = new BufferedFile(new Uint8Array(0));
      this.version = version;
      return;
    }

    this.reader = reader;
    this.version = version;
    this.initNameTables();
    this.parse();
  }

  private parse(): void {
    this.reader.seek(0);
    const count = this.reader.readUInt32BE();
    let pos = this.reader.tell();

    for (let i = 0; i < count; i++) {
      this.createObject(0, 0);
    }

    for (let i = 0; i < count; i++) {
      this.reader.seek(pos);
      const len = this.reader.readUInt16BE();

      if (len < 4) {
        VCTP.logging.error(`Internal error: wrong block size at object ${i}!`);
        return;
      }

      const object = this.objects[i];
      object.pos = pos;
      object.size = len;
      object.flags = this.reader.readByte();
      this.setObjectType(object, this.reader.readByte());

      const nextPos = pos + len;
      this.readObjectInfo(i);
      this.reader.seek(nextPos);
      pos = nextPos;
    }
  }

  private createObject(filePos: number, length: number): number {
    const object = new VCTPObject(this.objects.length);
    object.pos = filePos;
    object.size = length;
    object.flags = 0;
    object.label = '';
    object.fileType = 0;
    object.name = '';
    object.type = VCTPType.Unknown;
    object.mainType = VCTPMainType.Unknown;

    this.objects.push(object);
    return object.index;
  }

  private setObjectType(object: VCTPObject, type: number): void {
    object.fileType = type;
    object.type = type;
    object.mainType = (type >> 4) & 0xF;
    if (type === 0) {
      object.mainType = VCTPMainType.Void;
    }

    if (!this.typeNames.has(type)) {
      VCTP.logging.warn('Unknown type: ' + type.toString(16));
      this.typeNames.set(type, `Unknown${type.toString(16)}`);
    }

    let typeName = this.typeNames.get(type)!;

    object.name = typeName;

  }

  private addPropertyNumber(objectIndex: number, propertyType: number, value: number): void {
    const object = this.objects[objectIndex];
    if (!object) {
      return;
    }

    object.attributes.push(new VCTPAttribute(
      propertyType,
      this.attributeNames.get(propertyType) ?? `UNKNOWN_${propertyType}`,
      value,
      'number'
    ));
  }

  private addPropertyString(objectIndex: number, propertyType: number, value: string): void {
    const object = this.objects[objectIndex];
    if (!object) {
      return;
    }

    object.attributes.push(new VCTPAttribute(
      propertyType,
      this.attributeNames.get(propertyType) ?? `UNKNOWN_${propertyType}`,
      value,
      'string'
    ));
  }

  private readObjectInfo(objectIndex: number): void {
    const object = this.objects[objectIndex];
    if (!object) {
      return;
    }

    let propertyReadOk = false;
    const subType = object.type;

    switch (object.mainType) {
      case VCTPMainType.Number:
        propertyReadOk = this.readObjectPropertyNumber(objectIndex);
        break;
      case VCTPMainType.NumberPointer:
        propertyReadOk = this.readObjectPropertyNumberPtr(objectIndex);
        break;
      case VCTPMainType.Blob:
        if (subType === VCTPType.PascalString || subType === VCTPType.CString) {
          propertyReadOk = true;
        } else {
          propertyReadOk = this.readObjectPropertyBlob(objectIndex);
        }
        break;
      case VCTPMainType.Terminal:
        if (subType === VCTPType.Terminal) {
          propertyReadOk = this.readObjectPropertyTerminal(objectIndex);
        } else if (subType === VCTPType.TypeDef) {
          propertyReadOk = this.readObjectPropertyTypDef(objectIndex);
        }
        break;
      case VCTPMainType.Array:
        propertyReadOk = this.readObjectPropertyArray(objectIndex);
        break;
      case VCTPMainType.Unit:
        propertyReadOk = this.readObjectPropertyUnit(objectIndex);
        break;
      case VCTPMainType.Ref:
        propertyReadOk = this.readObjectPropertyRef(objectIndex);
        break;
      case VCTPMainType.Bool:
      case VCTPMainType.Void:
        propertyReadOk = true;
        break;
      case VCTPMainType.Cluster:
        propertyReadOk = this.readObjectPropertyCluster(objectIndex);
        break;
      default:
        VCTP.logging.error(`Unknown object type 0x${object.fileType.toString(16)} [index=${objectIndex}] @ ${object.pos}`);
        propertyReadOk = false;
        break;
    }

    if (propertyReadOk && (object.flags & 0x40) !== 0) {
      const length = this.reader.readByte();
      const deltaLen = object.size - (this.reader.tell() - object.pos);

      if (deltaLen === length || deltaLen === length + 1) {
        object.label = this.reader.readAsciiString(length);
      } else {
        VCTP.logging.error(`Caption/Label size mismatch (${deltaLen - length} - len: ${length} - size: ${object.size}) of type:0x${object.fileType.toString(16)} [index=${objectIndex}] Error @ ${object.pos}`);
      }
    }
  }

  private readObjectPropertyArray(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    const dimensions = this.reader.readUInt16BE();
    if (dimensions > 64) {
      VCTP.logging.error(`Array Dimension (${dimensions}) is > 64 @ ${object.pos}`);
      return false;
    }

    this.addPropertyNumber(objectIndex, VCTPAttributeType.ArrayDimensions, dimensions);

    let ok = true;
    for (let i = 0; i < dimensions; i++) {
      const tmp = this.reader.readUInt32BE();
      if (tmp !== 0xffffffff && tmp !== 0xffffffff) {
        if ((tmp & 0x80000000) !== 0) {
          this.addPropertyNumber(objectIndex, VCTPAttributeType.ArrayFixedSize, tmp & 0x00ffffff);
        } else {
          VCTP.logging.error(`Array with property (index: ${i} - flag: ${tmp} ? ) @ ${object.pos}`);
          ok = false;
        }
      }
    }

    if (ok) {
      const tmp = this.reader.readUInt16BE();
      if (tmp > objectIndex) {
        VCTP.logging.error(`Wrong value for Array-Type-Index ${tmp} is > "This-Array-Object"-Index: ${objectIndex} @ ${object.pos}`);
        ok = false;
      } else {
        object.clients.push(new VCTPClientRef(tmp, 0));
      }
    }

    return ok;
  }

  private readObjectPropertyNumber(objectIndex: number): boolean {
    const tmp = this.reader.readByte();
    if (tmp === 0) {
      return true;
    }

    VCTP.logging.error(`Number [index=${objectIndex}] with property (0x${tmp.toString(16)})??? @ ${this.objects[objectIndex]?.pos ?? 0}`);
    return false;
  }

  private readObjectPropertyNumberPtr(_objectIndex: number): boolean {
    return true;
  }

  private readObjectPropertyCluster(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    switch (object.type) {
      case VCTPType.Cluster: {
        const count = this.reader.readUInt16BE();
        if (count > 500) {
          VCTP.logging.error(`Cluster Item count (${count}) is > 124 @ ${object.pos}`);
          return false;
        }

        for (let i = 0; i < count; i++) {
          object.clients.push(new VCTPClientRef(this.reader.readUInt16BE(), 0));
        }
        return true;
      }
      case VCTPType.ClusterData: {
        const tmp = this.reader.readUInt16BE();
        let tmpStr = `0x${tmp.toString(16)}`;
        switch (tmp) {
          case 6: tmpStr = 'TimeStamp'; break;
          case 7: tmpStr = 'Digitaldata'; break;
          case 9: tmpStr = 'Dynamicdata'; break;
          default: break;
        }

        this.addPropertyNumber(objectIndex, VCTPAttributeType.ClusterFormat, tmp);
        this.addPropertyString(objectIndex, VCTPAttributeType.ClusterFormatStr, tmpStr);
        return true;
      }
      default:
        return false;
    }
  }

  private readObjectPropertyRef(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    const refType = this.reader.readUInt16BE();
    this.addPropertyNumber(objectIndex, VCTPAttributeType.RefType, refType);

    let refTypeName = '[unknown]';
    let ok = false;

    switch (refType) {
      case 0x1:
        refTypeName = 'DataLogFile';
        ok = this.readObjectPropertyRefQueue(objectIndex);
        break;
      case 0x4:
        refTypeName = 'Occurrence';
        ok = true;
        break;
      case 0x17:
        refTypeName = 'EventRegistration';
        ok = this.readObjectPropertyRefEventRegist(objectIndex);
        break;
      case 0x19:
        refTypeName = 'UserEvent';
        ok = this.readObjectPropertyRefQueue(objectIndex);
        break;
      case 0x5:
        refTypeName = 'TCP connection';
        ok = true;
        break;
      case 0x10:
        refTypeName = 'UDP connection';
        ok = true;
        break;
      case 0x11:
        refTypeName = 'Notifier Refnum';
        ok = this.readObjectProperty_0Pre0Post(objectIndex);
        break;
      case 0x13:
        refTypeName = 'IrDA connection';
        ok = true;
        break;
      case 0x1F:
        refTypeName = 'Bluetooth connection';
        ok = true;
        break;
      case 0x15:
        refTypeName = 'Shared variable';
        ok = false;
        break;
      case 0x0D:
        refTypeName = 'DataSocket';
        break;
      case 0x08:
        refTypeName = 'Control';
        ok = this.readObjectPropertyRefControl(objectIndex);
        break;
      case 0x12:
        refTypeName = 'Queue';
        ok = this.readObjectPropertyRefQueue(objectIndex);
        break;
      case 0x14:
        refTypeName = 'Channel';
        break;
      case 0x20:
        refTypeName = 'data value reference';
        ok = this.readObjectPropertyRefDataValue(objectIndex);
        break;
      case 0x21:
        refTypeName = 'fifo refnum';
        ok = this.readObjectProperty_0Pre0Post(objectIndex);
        break;
      case 0x1E:
        refTypeName = 'Class';
        break;
      default:
        VCTP.logging.error(`Unknown refenence Type (index: ${objectIndex} - 0x${refType.toString(16)})??? @ ${object.pos}`);
        break;
    }

    this.addPropertyString(objectIndex, VCTPAttributeType.RefTypeName, refTypeName);
    return ok;
  }

  private readObjectPropertyRefDataValue(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    const count = this.reader.readUInt16BE();
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        object.clients.push(new VCTPClientRef(this.reader.readUInt16BE(), 0));
      }

      const value = this.reader.readByte();
      this.addPropertyNumber(objectIndex, VCTPAttributeType.RefDataValFlags, value);
      return true;
    }

    VCTP.logging.error(`[readObjectPropertyRefDataValue] Unknown value/count (0x${count.toString(16)}) ? @ ${object.pos}`);
    return false;
  }

  private readObjectProperty_0Pre0Post(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    const count = this.reader.readUInt16BE();
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        object.clients.push(new VCTPClientRef(this.reader.readUInt16BE(), 0));
      }
      return true;
    }

    VCTP.logging.error(`[readObjectProperty_0Pre0Post] Unknown value/count (0x${count.toString(16)}) ? @ ${object.pos}`);
    return false;
  }

  private readObjectPropertyRefControl(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    const count = this.reader.readUInt16BE();
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        object.clients.push(new VCTPClientRef(this.reader.readUInt16BE(), 0));
      }

      const flags = this.reader.readUInt32BE();
      this.addPropertyNumber(objectIndex, VCTPAttributeType.RefControlFlags, flags);
      return true;
    }

    VCTP.logging.error(`[readObjectPropertyRefControl] Unknown value/count (0x${count.toString(16)}) ? @ ${object.pos}`);
    return false;
  }

  private readObjectPropertyRefEventRegist(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    const tmp1 = this.reader.readUInt16BE();
    const count = this.reader.readUInt16BE();

    if (tmp1 === 0 && count > 0) {
      for (let i = 0; i < count; i++) {
        this.reader.readUInt16BE();
        this.reader.readUInt16BE();
        this.reader.readUInt16BE();
        object.clients.push(new VCTPClientRef(this.reader.readUInt16BE(), 0));
      }
      return true;
    }

    VCTP.logging.error(`[readObjectPropertyRefEventRegist] Unknown value {0x${tmp1.toString(16)}, count=${count}} ? @ ${object.pos}`);
    return false;
  }

  private readObjectPropertyRefQueue(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    const count = this.reader.readUInt16BE();
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        object.clients.push(new VCTPClientRef(this.reader.readUInt16BE(), 0));
      }
      return true;
    }

    VCTP.logging.error(`[readObjectPropertyRefQueue] Unknown value/count [0x${count.toString(16)}] ? @ ${object.pos}`);
    return false;
  }

  private readObjectPropertyUnit(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    const count = this.reader.readUInt16BE();
    const isTextEnum = object.type === VCTPType.UnitU16 || object.type === VCTPType.UnitU8 || object.type === VCTPType.UnitU32;
    let dataSize = 0;

    for (let i = 0; i < count; i++) {
      const pos = this.reader.tell();
      let label = '';
      let length = 0;

      if (isTextEnum) {
        length = this.reader.readByte();
        label = this.reader.readAsciiString(length);
        dataSize += length + 1;
      } else {
        label = `0x${this.reader.readUInt32BE().toString(16)}`;
        dataSize += 4;
      }

      object.values.push(new VCTPValueEntry(pos, label, length, object.type, 'UnitValue'));
    }

    if ((dataSize % 2) !== 0) {
      const tmp = this.reader.readByte();
      if (tmp !== 0) {
        VCTP.logging.error(`Number+Unit padding Error - unknown Data [0x${tmp.toString(16)}] ? index=${objectIndex} @ ${object.pos}`);
      }
    }

    const trailing = this.reader.readByte();
    if (trailing !== 0) {
      VCTP.logging.error(`Number+Unit - Unknown Data [0x${trailing.toString(16)}] Property? index=${objectIndex} @ ${object.pos}`);
    }

    return true;
  }

  private readObjectPropertyTypDef(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    const tmp = this.reader.readUInt32BE();
    this.addPropertyNumber(objectIndex, VCTPAttributeType.TypDefFlag1, tmp);

    const count = this.reader.readUInt32BE();
    this.addPropertyNumber(objectIndex, VCTPAttributeType.TypDefControlNameCount, count);

    for (let i = 0; i < count; i++) {
      const length = this.reader.readByte();
      const value = this.reader.readAsciiString(length);
      this.addPropertyString(objectIndex, VCTPAttributeType.TypDefControlName1 + i, value);
    }

    const length = this.reader.readUInt16BE() - 6;
    const unitIndex = this.createObject(this.reader.tell() + 2, length - 2);
    const newObject = this.objects[unitIndex];
    newObject.flags = this.reader.readByte();
    this.setObjectType(newObject, this.reader.readByte());

    object.clients.push(new VCTPClientRef(unitIndex, 0));
    this.readObjectInfo(unitIndex);

    return true;
  }

  private readObjectPropertyTerminal(objectIndex: number): boolean {
    const object = this.objects[objectIndex];
    if (!object) {
      return false;
    }

    const count = this.reader.readUInt16BE();
    if (count > 125) {
      VCTP.logging.error(`Terminal count > 124 @ ${object.pos}`);
      return false;
    }

    for (let i = 0; i < count; i++) {
      object.clients.push(new VCTPClientRef(this.reader.readUInt16BE(), 0));
    }

    this.addPropertyNumber(objectIndex, VCTPAttributeType.TerminalFlags, this.reader.readUInt16BE());
    this.addPropertyNumber(objectIndex, VCTPAttributeType.TerminalPattern, this.reader.readUInt16BE());

    if (this.version.compareTo(8, 0) >= 0) {
      this.reader.readUInt16BE();
      for (let i = 0; i < count; i++) {
        object.clients[i].flags = this.reader.readUInt32BE();
      }
    } else {
      for (let i = 0; i < count; i++) {
        object.clients[i].flags = this.reader.readUInt16BE();
      }
    }

    this.interfaceCache.push(objectIndex);
    return true;
  }

  private readObjectPropertyBlob(objectIndex: number): boolean {
    const tmp = this.reader.readUInt32BE();
    if (tmp === 0xffffffff || tmp === -1) {
      return true;
    }

    VCTP.logging.error(`Blob with prop (0x${tmp.toString(16)})??? @ ${this.objects[objectIndex]?.pos ?? 0}`);
    return false;
  }

  private initNameTables(): void {
    this.typeNames.set(VCTPType.Void, 'Void');
    this.typeNames.set(VCTPType.Terminal, 'Terminal');
    this.typeNames.set(VCTPType.TypeDef, 'TypeDef');

    this.typeNames.set(VCTPType.NumberI8, 'I8');
    this.typeNames.set(VCTPType.NumberI16, 'I16');
    this.typeNames.set(VCTPType.NumberI32, 'I32');
    this.typeNames.set(VCTPType.NumberI64, 'I64');
    this.typeNames.set(VCTPType.NumberU8, 'U8');
    this.typeNames.set(VCTPType.NumberU16, 'U16');
    this.typeNames.set(VCTPType.NumberU32, 'U32');
    this.typeNames.set(VCTPType.NumberU64, 'U64');
    this.typeNames.set(VCTPType.NumberSGL, 'Single precision');
    this.typeNames.set(VCTPType.NumberDBL, 'Double precision');
    this.typeNames.set(VCTPType.NumberXTP, 'Extended precision');
    this.typeNames.set(VCTPType.NumberCSG, 'Complex Single');
    this.typeNames.set(VCTPType.NumberCDB, 'Complex Double');
    this.typeNames.set(VCTPType.NumberCXT, 'Complex Extended');

    this.typeNames.set(VCTPType.UnitI8, 'I8+Unit');
    this.typeNames.set(VCTPType.UnitI16, 'I16+Unit');
    this.typeNames.set(VCTPType.UnitI32, 'I32+Unit');
    this.typeNames.set(VCTPType.UnitI64, 'I64+Unit');
    this.typeNames.set(VCTPType.UnitU8, 'U8+Unit');
    this.typeNames.set(VCTPType.UnitU16, 'U16+Unit');
    this.typeNames.set(VCTPType.UnitU32, 'U32+Unit');
    this.typeNames.set(VCTPType.UnitU64, 'U64+Unit');
    this.typeNames.set(VCTPType.UnitSGL, 'Single precision+Unit');
    this.typeNames.set(VCTPType.UnitDBL, 'Double precision+Unit');
    this.typeNames.set(VCTPType.UnitXTP, 'Extended precision+Unit');
    this.typeNames.set(VCTPType.UnitCSG, 'Complex Single+Unit');
    this.typeNames.set(VCTPType.UnitCDB, 'Complex Double+Unit');
    this.typeNames.set(VCTPType.UnitCXT, 'Complex Extended+Unit');

    this.typeNames.set(VCTPType.PointerNumberXX, 'Pointer Number XX');
    this.typeNames.set(VCTPType.PointerNumberI8, 'I8 Pointer');
    this.typeNames.set(VCTPType.PointerNumberI16, 'I16 Pointer');
    this.typeNames.set(VCTPType.PointerNumberI32, 'I32 Pointer');
    this.typeNames.set(VCTPType.PointerNumberI64, 'I64 Pointer');
    this.typeNames.set(VCTPType.PointerNumberU8, 'U8 Pointer');
    this.typeNames.set(VCTPType.PointerNumberU16, 'U16 Pointer');
    this.typeNames.set(VCTPType.PointerNumberU32, 'U32 Pointer');
    this.typeNames.set(VCTPType.PointerNumberU64, 'U64');
    this.typeNames.set(VCTPType.PointerNumberSGL, 'Single precision Pointer');
    this.typeNames.set(VCTPType.PointerNumberDBL, 'Double precision Pointer');
    this.typeNames.set(VCTPType.PointerNumberXTP, 'Extended precision Pointer');
    this.typeNames.set(VCTPType.PointerNumberCSG, 'Complex Single Pointer');
    this.typeNames.set(VCTPType.PointerNumberCDB, 'Complex Double Pointer');
    this.typeNames.set(VCTPType.PointerNumberCXT, 'Complex Extended Pointer');

    this.typeNames.set(VCTPType.Bool, 'Boolean');
    this.typeNames.set(VCTPType.String, 'String');
    this.typeNames.set(VCTPType.CString, 'C String');
    this.typeNames.set(VCTPType.PascalString, 'Pascal String');
    this.typeNames.set(VCTPType.Path, 'Path');
    this.typeNames.set(VCTPType.Picture, 'Picture');
    this.typeNames.set(VCTPType.DAQChannel, 'DAQ Channel');
    this.typeNames.set(VCTPType.Array, 'Array');
    this.typeNames.set(VCTPType.Cluster, 'Cluster');
    this.typeNames.set(VCTPType.ClusterData, 'Data');
    this.typeNames.set(VCTPType.ClusterNumFixPoint, 'FixPointNumber');
    this.typeNames.set(VCTPType.ClusterVariant, 'Variant');
    this.typeNames.set(VCTPType.Ref, 'Reference');

    this.attributeNames.set(VCTPAttributeType.TerminalPattern, 'TerminalPattern');
    this.attributeNames.set(VCTPAttributeType.TerminalFlags, 'TerminalFlags');
    this.attributeNames.set(VCTPAttributeType.StringFlag, 'StringFlag');
    this.attributeNames.set(VCTPAttributeType.ArrayDimensions, 'ArrayDimensions');
    this.attributeNames.set(VCTPAttributeType.ArrayFixedSize, 'ArrayFixedSize');
    this.attributeNames.set(VCTPAttributeType.NumberFlag, 'NumberFlag');
    this.attributeNames.set(VCTPAttributeType.ClusterFormat, 'ClusterFormat');
    this.attributeNames.set(VCTPAttributeType.ClusterFormatStr, 'ClusterFormatStr');
    this.attributeNames.set(VCTPAttributeType.TypDefFlag1, 'TypDefFalg1');
    this.attributeNames.set(VCTPAttributeType.TypDefControlNameCount, 'TypDefControlNameCount');
    this.attributeNames.set(VCTPAttributeType.TypDefControlName1, 'TypDefControlName1');
    this.attributeNames.set(VCTPAttributeType.TypDefControlName2, 'TypDefControlName2');
    this.attributeNames.set(VCTPAttributeType.TypDefControlName3, 'TypDefControlName3');
    this.attributeNames.set(VCTPAttributeType.RefType, 'RefType');
    this.attributeNames.set(VCTPAttributeType.RefTypeName, 'RefTypeName');
    this.attributeNames.set(VCTPAttributeType.RefControlFlags, 'RefControlFlags');
    this.attributeNames.set(VCTPAttributeType.RefEventRegistFlags, 'RefEventRegistFlags');
    this.attributeNames.set(VCTPAttributeType.RefDataValFlags, 'RefDataValeuFlags');
    this.attributeNames.set(VCTPAttributeType.Unknown, '_unknown_');
  }
}
