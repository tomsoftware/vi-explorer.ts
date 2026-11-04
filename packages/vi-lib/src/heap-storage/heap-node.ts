import { HeapNodeConstants } from "./heap-node-constants";
import { HeapContentWrapper } from "./heap-content-wrapper";

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

export type HeapNodeValue = number | bigint | string | Uint8Array | boolean | number[] | null;

/** Base representation of a parsed heap tag and its relationships. */
export abstract class HeapNode {
  public readonly tagId: number;
  public readonly tagName: string;
  public readonly scopeInfo: number;
  public readonly offset: number;
  public readonly attributes = new Map<number, number>();
  public readonly children: HeapNode[] = [];

  public constructor(tagId: number, scopeInfo: number, offset: number) {
    this.tagId = tagId;
    this.tagName = HeapNodeConstants.getFieldNameByTypeId(tagId);
    this.scopeInfo = scopeInfo;
    this.offset = offset;
  }

  public abstract parseContent(content: HeapContentWrapper): void;


}
