import { HeapNodeConstants } from "./heap-node-constants";
import { ViDataReader } from "../vi-data-reader";

export enum HeapFileVersion {
  A,
  B,
  C,
}

export enum HeapNodeScope {
  TagOpen,
  TagLeaf,
  TagClose,
}

export type HeapNodeContent = Uint8Array | boolean | null;
export type HeapNodeValue = number | bigint | string | Uint8Array | boolean | number[] | null;

/** Base representation of a parsed heap tag and its relationships. */
export class HeapNode {
  public readonly tagId: number;
  public readonly tagName: string;
  public readonly scopeInfo: number;
  public readonly offset: number;
  public readonly attributes = new Map<number, number>();
  public readonly children: HeapNode[] = [];
  public readonly parent: HeapNode | null;
  public content: HeapNodeContent = null;
  public value: HeapNodeValue = null;

  public constructor(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null) {
    this.tagId = tagId;
    this.tagName = HeapNodeConstants.getFieldNameById(tagId);
    this.scopeInfo = scopeInfo;
    this.offset = offset;
    this.parent = parent;
  }

  public parseContent(reader: ViDataReader): void {
    if (this.content instanceof Uint8Array) {
      this.value = this.content;
      reader.seek(reader.length());
    } else {
      this.value = this.content;
    }
  }
}
