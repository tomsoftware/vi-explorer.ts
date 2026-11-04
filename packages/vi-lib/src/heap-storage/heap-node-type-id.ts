import { HeapContentWrapper } from './heap-content-wrapper';
import { HeapNode } from './heap-node';
import { HeapNodeStdInt } from './heap-node-std-int';

/** Parses a heap type-description identifier as a signed integer. */
export class HeapNodeTypeId extends HeapNodeStdInt {

   public override parseContent(content: HeapContentWrapper): void {
    // Nothing to do
   }
}
