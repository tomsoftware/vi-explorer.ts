import { HeapNode } from "./heap-node";
import { ViDataReader } from "../vi-data-reader";

/** Decodes heap content bytes as a text string. */
export class HeapNodeString extends HeapNode {
  public constructor(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null) {
    super(tagId, scopeInfo, offset, parent);
  }

  public override parseContent(reader: ViDataReader): void {
    if (!(this.content instanceof Uint8Array)) {
      this.value = this.content;
      return;
    }
    const bytes = reader.readBytes(this.content.length, "heap-node.string");
    this.value = new TextDecoder().decode(bytes);
  }
}
