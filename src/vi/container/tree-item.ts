import { TreeObjectHelper } from './tree-object-helper';

export enum TreeObjectType {
    Root = -1,
    Unknown = 0,
    TreeProperty = 1,
    TreeArray = 251,
    TreeObject = 254,
    /**
     * SL__rootObject
     * SL__arrayElement
     * SL__array
     * SL__reference
     * SL__object
     */
}

export abstract class TreeItem {
  public objectTypeId: number;
  public parent: TreeItem | null = null;
  public children: TreeItem[] = [];

  public value: string | null = null;
  public count = 0;
  // public objtype: number = 0;
  public prop: number[] | null = null;
  public filePos = 0;

  constructor(objectTypeId: number, filePos: number) {
    this.objectTypeId = objectTypeId;
    this.parent = null;
    this.filePos = filePos;
  }

  public get objectName() {
    return TreeObjectHelper.getObjectNameById(this.objectTypeId) ?? this.objectTypeId;
  }

  /** Adds object as child of this object. Any current parent on an object passed in here will be removed, since an object can have at most one parent. */
  public add(object: TreeItem) {
    this.children.push(object);
    object.parent = this;
  }

    public abstract getXML(deep: number): string;
    public abstract get objectType(): TreeObjectType;

    public toString() {
      return this.getXML(0);
    }

    protected numbersAsHex(n: number[] | null) {
      if (n == null) {
        return '';
      }

      let hex, i;

      let result = '';
      for (i = 0; i < n.length; i++) {
        hex = n[i].toString(16);
        result += ('00' + hex).slice(-2) + ' ';
      }

      return result;
    }

    protected bytesToNumber(data: number[]): number {
      let v = 0;
      for (let i = 0; i < data.length; i++) {
        v = (v << 8) | data[i];
      }
      return v;
    }

    protected stringAsHex(s: string | null) {
      if (s == null) {
        return '';
      }

      let hex, i;

      let result = '';
      for (i = 0; i < s.length; i++) {
        hex = s.charCodeAt(i).toString(16);
        result += ('00' + hex).slice(-2) + ' ';
      }

      return result;
    }

    public getXmlChildren(deep: number, closingTag: string) {
      const space = '  '.repeat(deep);
      let tmp = '';

      if (this.children.length === 0) {
        tmp += ' /]\n';
      } else {
        tmp += ']\n';
        for (const cpos of this.children) {
          tmp += cpos.getXML(deep + 1);
        }
        tmp += `${space}[/${closingTag}]\n`;
      }
      return tmp;
    }
}
