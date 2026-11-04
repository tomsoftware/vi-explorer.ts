import { HeapNode } from "./heap-node";
import { HeapContentWrapper } from "./heap-content-wrapper";

/** Stores type-description-dependent numeric fill data for later interpretation. */
export class HeapNodeTDDataFill extends HeapNode {

  public override parseContent(content: HeapContentWrapper): void {
    throw new Error('Not implemented');
  }
}
