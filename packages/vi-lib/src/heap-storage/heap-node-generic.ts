import { HeapNode } from "./heap-node";
import { HeapContentWrapper } from "./heap-content-wrapper";

/** Retains raw content for heap tags without a specialized value parser. */
export class HeapNodeGeneric extends HeapNode {
  public override parseContent(content: HeapContentWrapper): void {
    // we do not know this content.
  }
}
