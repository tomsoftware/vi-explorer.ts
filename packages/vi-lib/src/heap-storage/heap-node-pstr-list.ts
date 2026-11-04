import { HeapNode } from './heap-node';
import { HeapContentWrapper } from './heap-content-wrapper';
import { Logger } from '@tomsoftware/logger';
import { ByteString } from '@tomsoftware/virtual-fs';

/** Parses a sequence of strings prefixed by one-byte lengths. */
export class HeapNodePStrList extends HeapNode {
  private static readonly logging = new Logger('HeapNodePoint');
  public values: ByteString[] = [];

  public parseContent(content: HeapContentWrapper): void {
    if (content.length < 1) {
      HeapNodePStrList.logging.error('Can not parse PStrList - size mismatch!');
      return;
    }

    const reader = content.getReader();
    while (reader.leftLength() > 0) {
      const str = reader.readBytePrefixedString('string-list.length');
      this.values.push(str);
    }
  }
}
