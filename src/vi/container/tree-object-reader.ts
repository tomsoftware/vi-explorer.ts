import { TreeItem } from './tree-item';
import { BinaryReader } from '@/utilities/binary-reader';
import { LogHandler } from '@/utilities/log-handler';
import { TreeItemObject } from './tree-item-object';
import { TreeItemProperty } from './tree-item-property';
import { TreeItemBoot } from './tree-item-root';

export enum FileVersion {
    B,
    C
}

export class TreeObjectReader {
  private static logging = new LogHandler('TreeObjectReader');

  private static readHeader(reader: BinaryReader, version: FileVersion) {
    let pos = -1;
    let dataLength = 0;
    let dataOffset = 0;
    let containerOffset = 0;
    let containerLength = 0;

    // Read "Struct-Header"
    if (version === FileVersion.C) {
      pos = reader.readInt();
      containerOffset = reader.getOffset();

      reader.setOffset(pos);
      dataLength = reader.readInt();

      dataOffset = pos - dataLength;
      containerLength = pos - dataLength - containerOffset;
    } else if (version === FileVersion.B) {
      containerLength = reader.readInt();
      containerOffset = reader.getOffset();

      dataOffset = containerLength + containerOffset;
      dataLength = 0;
    }

    const cRead = new BinaryReader(reader, containerOffset, containerLength);
    const dRead = new BinaryReader(reader, dataOffset, dataLength);

    return [cRead, dRead];
  }

  public static read(reader: BinaryReader, version: FileVersion): TreeItem | null {
    const [cRead, dRead] = this.readHeader(reader, version);

    // build up a tree of objects
    const treeRoot = new TreeItemBoot();
    let treePos: TreeItem = treeRoot;

    // - read objects
    while (!cRead.eof()) {
      const pos = cRead.getOffset();

      // 87654321 87654321
      //    OCPii iiiiiiii
      // o

      const cmd1 = cRead.readByte();
      const cmd2 = cRead.readByte();

      // console.log(pos + '  --  ' + cmd1 + ' -- ' + cmd2);
      const objectTypeId = ((cmd1 & 3) << 8) | cmd2;

      if ((cmd1 & 16) > 0) {
        // - Object [ <object class="abc"> ]
        const autoClose = cmd1 & 4;

        const newObject = new TreeItemObject(objectTypeId, cmd1, pos, cRead, dRead, version);
        treePos.add(newObject);

        if (!autoClose) {
          treePos = newObject;
        }
      } else if (cmd1 & 8) {
        // - Close Object [ </object> ]

        if (objectTypeId !== treePos.objectTypeId) {
          TreeObjectReader.logging.error('Error closing Object (1- opened:' + treePos.objectTypeId + ' != closing:' + objectTypeId + ') @ pos: ' + pos);
        }

        if (treePos.parent == null) {
          TreeObjectReader.logging.error('Error closing Object (no parent) @ pos: ' + pos);
          return null;
        }

        treePos = treePos.parent;
      } else if (cmd1 & 4) {
        // - property-Node [ <prop name="123" value="345" /> ]

        const newProperty = new TreeItemProperty(objectTypeId, cmd1, pos, cRead, dRead);
        treePos.add(newProperty);
      } else {
        TreeObjectReader.logging.error('Error unknown type ' + cmd1 + ' @ pos: ' + pos);
      }
    }

    return treeRoot;
  }
}
