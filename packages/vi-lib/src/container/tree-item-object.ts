import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { TreeItem, TreeObjectType } from './tree-item';
import { TreeObjectHelper } from './tree-object-helper';
import { FileVersion } from './tree-object-reader';
import { Tools } from '../tools';

export class TreeItemObject extends TreeItem {
  private static logging = new Logger('TreeItemObject');

  private classTypeId = 0;

  constructor(objectTypeId: number, cmd1: number, pos: number, cRead: VirtualFile, dRead: VirtualFile, version: FileVersion) {
    super(objectTypeId, pos);

    cRead.seek(pos);

    console.log('objectName: ' + this.objectName);
    console.log('c: ' + pos + '\t--> ' + Tools.readHex(cRead, 10));
    console.log('d: ' + dRead.tell + '\t--> ' + Tools.readHex(dRead, 10));

    let argLen = 1;

    if ((cmd1 & 4) === 0) {
      const flags1 = cRead.readByte();
      const newObjectTypeId = cRead.readByte();
      argLen = (flags1 & 3);
    }

    const data = cRead.readBytes(argLen);
    this.classTypeId = this.bytesToNumber(data);

    // --------------------------------------------------------------------
    // - Second Object Attribute - [ attribute="value" ] -//
    // --------------------------------------------------------------------
    let dataLen = cRead.readByte();

    if ((dataLen & 0xF0) === 0xF0) {
      // remove last char
      if (dataLen === 0xFD) {
        dataLen = 2;
      } else if (dataLen === 0xF8) {
        dataLen = 0;
      } else if (dataLen === 0xF4) {
        dataLen = 8;
      } else if (dataLen === 0xFA) {
        dataLen = 8;
      } else {
        // - ??
        TreeItemObject.logging.error('Unknown Object-Data-Length: 0x' + dataLen + ' @ pos: ' + pos);
      }
    } else {
      dataLen = 0;
    }

    if (dataLen > 0) {
      if (version === FileVersion.B) {
        // - VERSION_B -//
        argLen = 2;
        const argStr = cRead.readBytes(argLen);
        TreeItemObject.logging.log(Tools.bytesToHex(argStr));
        this.prop = argStr;
      } else {
        // - VERSION_C -//
        const argStr = dRead.readBytes(dataLen);
        TreeItemObject.logging.log(Tools.bytesToHex(argStr));
        this.prop = argStr;
      }
    }
  }


  public get objectType(): TreeObjectType {
    return this.classTypeId > 0 ? TreeObjectType.TreeObject : TreeObjectType.TreeArray;
  }

  public get className(): string {
    return TreeObjectHelper.getClassNameById(this.classTypeId);
  }

  public getXML(deep = 0): string {
    let tmp = '  '.repeat(deep);

    tmp += '[object type="' + this.objectName + '"';

    if (this.classTypeId > 0) {
      tmp += ' class="' + this.className + '"';
    } else {
      tmp += ' elements="' + this.children.length + '"';
    }

    // id="${this.objectTypeId}" pos="${this.filePos}"`;

    if (this.prop !== null) {
      tmp += ' prop="' + this.numbersAsHex(this.prop) + '"';
    }

    tmp += ' pos="' + this.filePos + '"';

    tmp += this.getXmlChildren(deep, 'object');

    return tmp;
  }
}
