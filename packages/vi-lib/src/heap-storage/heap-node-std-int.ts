import { HeapNode } from "./heap-node";
import { ViDataReader } from "../vi-data-reader";

/** Parses a variable-width, big-endian signed integer value. */
export class HeapNodeStdInt extends HeapNode {
  public constructor(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null) {
    super(tagId, scopeInfo, offset, parent);
  }

  public override parseContent(reader: ViDataReader): void {
    if (!(this.content instanceof Uint8Array)) {
      this.value = this.content;
      return;
    }

    const bytes = reader.readBytes(this.content.length, "heap-node.integer");
    if (bytes.length === 0) {
      this.value = 0;
      return;
    }

    let value = BigInt(bytes[0]);
    for (let index = 1; index < bytes.length; index++) {
      value = (value << 8n) | BigInt(bytes[index]);
    }
    if ((bytes[0] & 0x80) !== 0) {
      value -= 1n << BigInt(bytes.length * 8);
    }
    this.value = value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(value)
      : value;
  }
}
