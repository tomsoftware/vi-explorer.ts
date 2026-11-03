import { HeapNode } from "./heap-node";
import { ViDataReader } from "../vi-data-reader";

/** Stores type-description-dependent numeric fill data for later interpretation. */
export class HeapNodeTDDataFill extends HeapNode {
  public constructor(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null) {
    super(tagId, scopeInfo, offset, parent);
  }

  public override parseContent(reader: ViDataReader): void {
    if (this.content instanceof Uint8Array) {
      this.value = reader.readBytes(this.content.length, "heap-node.data-fill");
    } else {
      this.value = this.content;
    }
  }
}
