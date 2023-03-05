import { BinaryReader } from '@/utilities/binary-reader';
import { LogHandler } from './../../utilities/log-handler';
import { TreeItem, TreeObjectType } from './tree-item';

export class TreeItemProperty extends TreeItem {
  private static logging = new LogHandler('TreeItemProperty');

  constructor(objectTypeId: number, cmd1: number, pos: number, cRead: BinaryReader, dRead: BinaryReader) {
    super(objectTypeId, pos);

    let argLen = cmd1 >> 5;

    let argStr = '';

    if (argLen > 6) {
      TreeItemProperty.logging.error('Error - Property length - >6  @ ' + pos);
    } else if (argLen === 6) {
      argLen = cRead.readByte();
      if (argLen === 255) argLen = cRead.readWord();
    } else if (argLen === 0) {
      // if (objectTypeId == 0x2D || objectTypeId == 0xD6 || objectTypeId == 0x4C || objectTypeId == 0x5F || objectTypeId == 0x20D || objectTypeId == 0x229 || objectTypeId == 0x4A || objectTypeId == 0x8B || objectTypeId == 0x87 || objectTypeId == 0x7A || objectTypeId == 0x1F || objectTypeId == 0x23 || objectTypeId == 0x76) {
      // console.error('argLen == 0 --> 8');
      argStr = dRead.readString(8);
      // }
      // else {
      // console.error('argLen == 0');
      // }
    }

    if (argLen > 0) {
      argStr = cRead.readString(argLen);
    }

    this.value = argStr;
  }

  public get objectType(): TreeObjectType {
    return TreeObjectType.TreeProperty;
  }

  public getXML(deep = 0): string {
    const space = '  '.repeat(deep);

    return `${space}[prop type="${this.objectName}" value="${this.stringAsHex(this.value)}" pos="${this.filePos}" /]\n`;
  }
}
