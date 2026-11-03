import { HeapNode } from "./heap-node";
import { ViDataReader } from "../vi-data-reader";

/** Stores one component of a type-description-dependent complex value. */
export class HeapNodeTDDataFillLeaf extends HeapNode {
  public constructor(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null) {
    super(tagId, scopeInfo, offset, parent);
  }

  public override parseContent(reader: ViDataReader): void {
    if (this.content instanceof Uint8Array) {
      this.value = reader.readBytes(this.content.length, "heap-node.data-fill-leaf");
    } else {
      this.value = this.content;
    }
  }
}
