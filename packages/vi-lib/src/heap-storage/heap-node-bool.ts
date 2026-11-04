import { HeapNode } from './heap-node';
import { HeapContentWrapper } from './heap-content-wrapper';
import { Logger } from '@tomsoftware/logger';

/** Parses heap content encoded as a boolean flag. */
export class HeapNodeBool extends HeapNode {
  private static readonly logging = new Logger('HeapNodeBool');

  public value: boolean = false;

  public parseContent(content: HeapContentWrapper): void {
    if (content.isBool) {
      this.value = content.getBool();
    } else {
      HeapNodeBool.logging.error('Type mismatch - expect bool get ' + content.typeAsString);
      this.value = false;
    }
  }
}
