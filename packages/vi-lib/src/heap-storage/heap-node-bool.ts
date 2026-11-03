import { HeapNode } from "./heap-node";
import { ViDataReader } from "../vi-data-reader";

/** Parses heap content encoded as a boolean flag. */
export class HeapNodeBool extends HeapNode {
  public constructor(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null) {
    super(tagId, scopeInfo, offset, parent);
  }

  public override parseContent(reader: ViDataReader): void {
    this.value = this.content === true;
    if (this.content instanceof Uint8Array) {
      reader.seek(reader.length());
    }
  }
}
