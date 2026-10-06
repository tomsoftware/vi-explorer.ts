import { VirtualFile } from "@tomsoftware/virtual-fs";
import { VCTPObjectBase } from "./vctp-object-base";
import { ViVersion } from "../vi-version";
import { VCTPClientRef } from "./vctp-client-ref";
import { VCTPAttributeType } from "./vctp-attribute-type";


export class VCTPObjectRef extends VCTPObjectBase {
  public parse(reader: VirtualFile, version: ViVersion) {

    const refType = reader.readUInt16BE();
    this.addPropertyNumber(VCTPAttributeType.RefType, refType);

    let refTypeName = '[unknown]';
    let ok = false;

    switch (refType) {
      case 0x1:
        refTypeName = 'DataLogFile';
        ok = this.readObjectPropertyRefQueue(reader);
        break;
      case 0x4:
        refTypeName = 'Occurrence';
        ok = true;
        break;
      case 0x17:
        refTypeName = 'EventRegistration';
        ok = this.readObjectPropertyRefEventRegist(reader);
        break;
      case 0x19:
        refTypeName = 'UserEvent';
        ok = this.readObjectPropertyRefQueue(reader);
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
        ok = this.readObjectProperty_0Pre0Post(reader);
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
        ok = this.readObjectPropertyRefControl(reader);
        break;
      case 0x12:
        refTypeName = 'Queue';
        ok = this.readObjectPropertyRefQueue(reader);
        break;
      case 0x14:
        refTypeName = 'Channel';
        break;
      case 0x20:
        refTypeName = 'data value reference';
        ok = this.readObjectPropertyRefDataValue(reader);
        break;
      case 0x21:
        refTypeName = 'fifo refnum';
        ok = this.readObjectProperty_0Pre0Post(reader);
        break;
      case 0x1E:
        refTypeName = 'Class';
        break;
      default:
        VCTPObjectBase.logging.error(`Unknown reference Type (index: ${this.index} - 0x${refType.toString(16)})??? @ ${this.offset}`);
        break;
    }

    this.addPropertyString(VCTPAttributeType.RefTypeName, refTypeName);
    
    if (ok) {
      this.paresLabel(reader);
    }
  }


  private readObjectPropertyRefQueue(reader: VirtualFile): boolean {
    const count = reader.readUInt16BE();
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        this.children.push(new VCTPClientRef(reader.readUInt16BE(), 0));
      }
      return true;
    }

    VCTPObjectBase.logging.error(`[readObjectPropertyRefQueue] Unknown value/count [0x${count.toString(16)}] ? @ ${this.offset}`);
    return false;
  }

   private readObjectPropertyRefEventRegist(reader: VirtualFile): boolean {
    const tmp1 = reader.readUInt16BE();
    const count = reader.readUInt16BE();

    if (tmp1 === 0 && count > 0) {
      for (let i = 0; i < count; i++) {
        reader.readUInt16BE();
        reader.readUInt16BE();
        reader.readUInt16BE();
        this.children.push(new VCTPClientRef(reader.readUInt16BE(), 0));
      }
      return true;
    }

    VCTPObjectBase.logging.error(`[readObjectPropertyRefEventRegist] Unknown value {0x${tmp1.toString(16)}, count=${count}} ? @ ${this.offset}`);
    return false;
  }


  private readObjectPropertyRefControl(reader: VirtualFile): boolean {
    const count = reader.readUInt16BE();
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        this.children.push(new VCTPClientRef(reader.readUInt16BE(), 0));
      }

      const flags = reader.readUInt32BE();
      this.addPropertyNumber(VCTPAttributeType.RefControlFlags, flags);
      return true;
    }

    VCTPObjectBase.logging.error(`[readObjectPropertyRefControl] Unknown value/count (0x${count.toString(16)}) ? @ ${this.offset}`);
    return false;
  }


   private readObjectProperty_0Pre0Post(reader: VirtualFile): boolean {
    const count = reader.readUInt16BE();
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        this.children.push(new VCTPClientRef(reader.readUInt16BE(), 0));
      }
      return true;
    }

    VCTPObjectBase.logging.error(`[readObjectProperty_0Pre0Post] Unknown value/count (0x${count.toString(16)}) ? @ ${this.offset}`);
    return false;
  }

  private readObjectPropertyRefDataValue(reader: VirtualFile): boolean {

    const count = reader.readUInt16BE();
    if (count <= 1) {
      for (let i = 0; i < count; i++) {
        this.children.push(new VCTPClientRef(reader.readUInt16BE(), 0));
      }

      const value = reader.readByte();
      this.addPropertyNumber(VCTPAttributeType.RefDataValFlags, value);
      return true;
    }

    VCTPObjectBase.logging.error(`[readObjectPropertyRefDataValue] Unknown value/count (0x${count.toString(16)}) ? @ ${this.offset}`);
    return false;
  }
 
}
