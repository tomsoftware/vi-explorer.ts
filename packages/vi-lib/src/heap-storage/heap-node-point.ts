import { HeapNode } from './heap-node';
import { HeapContentWrapper } from './heap-content-wrapper';
import { Logger } from '@tomsoftware/logger';

/** Parses a point stored as two signed 16-bit coordinates. */
export class HeapNodePoint extends HeapNode {
  private static readonly logging = new Logger('HeapNodePoint');
  public x = 0;
  public y = 0;

  public parseContent(content: HeapContentWrapper): void {
    if (content.length !== 4) {
      HeapNodePoint.logging.error('Content size mismatch - Unable to parse point value!');
      return;
    }
    const reader = content.getReader();
    this.x = reader.readInt16('HeapNodePoint.x');
    this.y = reader.readInt16('HeapNodePoint.y');
  }

}
