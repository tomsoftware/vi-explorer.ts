import { HeapNode } from './heap-node';
import { HeapContentWrapper } from './heap-content-wrapper';
import { Logger } from '@tomsoftware/logger';

/** Parses a variable-width, big-endian signed integer value. */
export class HeapNodeStdInt extends HeapNode {
  private static readonly logging = new Logger('HeapNodeStdInt');

  public value = 0;

  public override parseContent(content: HeapContentWrapper): void {
    if (!content.hasReader) {
      HeapNodeStdInt.logging.error('Unable to parse Int-Content - Content is empty!');
      return;
    }

    if (content.length === 0) {
      // this can be a regular 0
      return;
    }
    
    const bytes = content.getBytes('content-int-data');

    let value = bytes[0];
    for (let index = 1; index < bytes.length; index++) {
      value = (value << 8) | bytes[index];
    }
    if ((bytes[0] & 0x80) !== 0) {
      value -= 1 << (bytes.length * 8);
    }
    this.value = value;
  }
}
