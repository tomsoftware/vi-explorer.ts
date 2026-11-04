import { HeapNode } from './heap-node';
import { HeapContentWrapper } from './heap-content-wrapper';
import { Logger } from '@tomsoftware/logger';

/** Stores one component of a type-description-dependent complex value. */
export class HeapNodeTDDataFillLeaf extends HeapNode {
  private static readonly logging = new Logger('HeapNodeTDDataFillLeaf');
  public value: Uint8Array = new Uint8Array(0);

  public override parseContent(content: HeapContentWrapper): void {
    throw new Error('Not implemented');

    if (!content.hasReader) {
      HeapNodeTDDataFillLeaf.logging.error('Expected content is empty!');
    }

    this.value = content.getBytes('TDDataFillLeaf-Content');
  }
}
