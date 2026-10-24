import { ViDataReader } from '../vi-data-reader';
import { IObjectFactory, TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { VCTPClientRef } from './vctp-client-ref';

export class VCTPObjectRef extends VCTPObjectBase {
  public refTypeName: string = '';
  public refType = 0;
  public refControlFlags = 0;
  public refDataValFlags = 0;

  public parse(reader: ViDataReader, version: ViVersion, factory: IObjectFactory) {
    const refType = reader.readUInt16('vctp-ref.type');
    this.refType = refType;

    let refTypeName = '[unknown]';
    let ok = false;

    switch (refType) {
      case 0x1:
        refTypeName = 'DataLogFile';
        ok = this.readObjectPropertyRefQueue(reader, factory);
        break;
      case 0x4:
        refTypeName = 'Occurrence';
        ok = true;
        break;
      case 0x17:
        refTypeName = 'EventRegistration';
        ok = this.readObjectPropertyRefEventRegistration(reader, factory);
        break;
      case 0x19:
        refTypeName = 'UserEvent';
        ok = this.readObjectPropertyRefQueue(reader, factory);
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
        ok = this.readObjectProperty_0Pre0Post(reader, factory);
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
        ok = this.readObjectPropertyRefControl(reader, factory);
        break;
      case 0x12:
        refTypeName = 'Queue';
        ok = this.readObjectPropertyRefQueue(reader, factory);
        break;
      case 0x14:
        refTypeName = 'Channel';
        break;
      case 0x20:
        refTypeName = 'data value reference';
        ok = this.readObjectPropertyRefDataValue(reader, factory);
        break;
      case 0x21:
        refTypeName = 'fifo refnum';
        ok = this.readObjectProperty_0Pre0Post(reader, factory);
        break;
      case 0x1E:
        refTypeName = 'Class';
        break;
      default:
        VCTPObjectBase.logging.error(`Unknown reference Type (index: ${this.index} - 0x${refType.toString(16)})??? @ ${this.offset}`);
        break;
    }

    this.refTypeName, refTypeName;
    
    if (ok) {
      this.paresLabel(reader);
    }
  }

  public get typeGroup(): TypeGroup {
    return TypeGroup.Unknown;
  }

  public override get connectorColor(): string {
    return 'rgb(1, 128, 128)';
  }

  private readObjectPropertyRefQueue(reader: ViDataReader, factory: IObjectFactory): boolean {
    const count = reader.readUInt16('vctp-ref.queue.count');
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        const index = reader.readUInt16('vctp-ref.queue.index');
        this.children.push(new VCTPClientRef(index, factory.resolveObjectByIndex(index), 0));
      }
      return true;
    }

    VCTPObjectBase.logging.error(`[readObjectPropertyRefQueue] Unknown value/count [0x${count.toString(16)}] ? @ ${this.offset}`);
    return false;
  }

   private readObjectPropertyRefEventRegistration(reader: ViDataReader, factory: IObjectFactory): boolean {
    const tmp1 = reader.readUInt16('vctp-ref.event-registration.tmp1');
    const count = reader.readUInt16('vctp-ref.event-registration.count');

    if (tmp1 === 0 && count > 0) {
      for (let i = 0; i < count; i++) {
        reader.readUInt16('vctp-ref.event-registration.entry.1');
        reader.readUInt16('vctp-ref.event-registration.entry.2');
        reader.readUInt16('vctp-ref.event-registration.entry.3');
        const index = reader.readUInt16('vctp-ref.event-registration.index');
        this.children.push(new VCTPClientRef(index, factory.resolveObjectByIndex(index), 0));
      }
      return true;
    }

    VCTPObjectBase.logging.error(`[readObjectPropertyRefEventRegist] Unknown value {0x${tmp1.toString(16)}, count=${count}} ? @ ${this.offset}`);
    return false;
  }


  private readObjectPropertyRefControl(reader: ViDataReader, factory: IObjectFactory): boolean {
    const count = reader.readUInt16('vctp-ref.control.count');
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        const index = reader.readUInt16('vctp-ref.control.index');
        this.children.push(new VCTPClientRef(index, factory.resolveObjectByIndex(index), 0));
      }

      const flags = reader.readUInt32('vctp-ref.control.flags');
      this.refControlFlags = flags;
      return true;
    }

    VCTPObjectBase.logging.error(`[readObjectPropertyRefControl] Unknown value/count (0x${count.toString(16)}) ? @ ${this.offset}`);
    return false;
  }


   private readObjectProperty_0Pre0Post(reader: ViDataReader, factory: IObjectFactory): boolean {
    const count = reader.readUInt16('vctp-ref.0pre0post.count');
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        const index = reader.readUInt16('vctp-ref.0pre0post.index');
        this.children.push(new VCTPClientRef(index, factory.resolveObjectByIndex(index), 0));
      }
      return true;
    }

    VCTPObjectBase.logging.error(`[readObjectProperty_0Pre0Post] Unknown value/count (0x${count.toString(16)}) ? @ ${this.offset}`);
    return false;
  }

  private readObjectPropertyRefDataValue(reader: ViDataReader, factory: IObjectFactory): boolean {

    const count = reader.readUInt16('vctp-ref.data-value.count');
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        const index = reader.readUInt16('vctp-ref.data-value.index');
        this.children.push(new VCTPClientRef(index, factory.resolveObjectByIndex(index), 0));
      }

      const value = reader.readByte('vctp-ref.data-value.flags');
      this.refDataValFlags = value;
      return true;
    }

    VCTPObjectBase.logging.error(`[readObjectPropertyRefDataValue] Unknown value/count (0x${count.toString(16)}) ? @ ${this.offset}`);
    return false;
  }
 
}
