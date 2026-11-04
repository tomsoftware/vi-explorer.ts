import { HeapNode } from './heap-node';
import { HeapContentWrapper } from './heap-content-wrapper';
import { ByteString } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';

/** Decodes heap content bytes as a text string. */
export class HeapNodeString extends HeapNode {
  private static readonly logging = new Logger('HeapNodeStdInt');
  public value = ByteString.empty;

  public override parseContent(content: HeapContentWrapper): void {
    if (!content.hasReader) {
      HeapNodeString.logging.error('Unable to parse string content. No bytes in content!');
      return;
    }

    this.value = content.getReader().readString(content.length ,'heap-node.string');
  }
}
