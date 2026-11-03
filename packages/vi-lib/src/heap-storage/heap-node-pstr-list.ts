import { HeapNode } from "./heap-node";
import { ViDataReader } from "../vi-data-reader";

/** Parses a sequence of strings prefixed by one-byte lengths. */
export class HeapNodePStrList extends HeapNode {
  public values: Uint8Array[] = [];

  public constructor(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null) {
    super(tagId, scopeInfo, offset, parent);
  }

  public override parseContent(reader: ViDataReader): void {
    if (!(this.content instanceof Uint8Array)) {
      this.value = this.content;
      return;
    }

    const values: Uint8Array[] = [];
    while (reader.leftLength() > 0) {
      const length = reader.readByte("heap-node.string-list.length");
      if (length > reader.leftLength()) {
        throw new RangeError(`Truncated heap string list at offset ${this.offset}`);
      }
      values.push(reader.readBytes(length, "heap-node.string-list.value"));
    }
    this.values = values;
    this.value = values[0] ?? new Uint8Array(0);
  }
}
