import { HeapNode } from "./heap-node";
import { HeapNodeStdInt } from "./heap-node-std-int";

/** Parses a heap type-description identifier as a signed integer. */
export class HeapNodeTypeId extends HeapNodeStdInt {
  public constructor(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null) {
    super(tagId, scopeInfo, offset, parent);
  }
}
