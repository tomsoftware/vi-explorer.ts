import { HeapNode } from "./heap-node";
import { ViDataReader } from "../vi-data-reader";

/** Parses a rectangle stored as four signed 16-bit coordinates. */
export class HeapNodeRect extends HeapNode {
  public left = 0;
  public top = 0;
  public right = 0;
  public bottom = 0;

  public constructor(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null) {
    super(tagId, scopeInfo, offset, parent);
  }

  public override parseContent(reader: ViDataReader): void {
    if (!(this.content instanceof Uint8Array) || this.content.length !== 8) {
      this.value = this.content;
      return;
    }
    this.left = HeapNodeRect.readInt16(reader);
    this.top = HeapNodeRect.readInt16(reader);
    this.right = HeapNodeRect.readInt16(reader);
    this.bottom = HeapNodeRect.readInt16(reader);
    this.value = [this.left, this.top, this.right, this.bottom];
  }

  private static readInt16(reader: ViDataReader): number {
    const value = reader.readUInt16BE("heap-node.rect.coordinate");
    return value > 0x7fff ? value - 0x10000 : value;
  }
}
