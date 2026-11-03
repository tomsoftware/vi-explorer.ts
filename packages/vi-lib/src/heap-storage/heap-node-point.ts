import { HeapNode } from "./heap-node";
import { ViDataReader } from "../vi-data-reader";

/** Parses a point stored as two signed 16-bit coordinates. */
export class HeapNodePoint extends HeapNode {
  public x = 0;
  public y = 0;

  public constructor(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null) {
    super(tagId, scopeInfo, offset, parent);
  }

  public override parseContent(reader: ViDataReader): void {
    if (!(this.content instanceof Uint8Array) || this.content.length !== 4) {
      this.value = this.content;
      return;
    }
    this.x = HeapNodePoint.readInt16(reader);
    this.y = HeapNodePoint.readInt16(reader);
    this.value = this.content;
  }

  private static readInt16(reader: ViDataReader): number {
    const value = reader.readUInt16BE("heap-node.point.coordinate");
    return value > 0x7fff ? value - 0x10000 : value;
  }
}
