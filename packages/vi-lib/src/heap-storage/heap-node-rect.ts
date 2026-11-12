import { HeapNode } from './heap-node';
import { HeapContentWrapper } from './heap-content-wrapper';
import { Logger } from '@tomsoftware/logger';

/** Parses a rectangle stored as four signed 16-bit coordinates. */
export class HeapNodeRect extends HeapNode {
  private static readonly logging = new Logger('HeapNodeRect');
  public left = 0;
  public top = 0;
  public right = 0;
  public bottom = 0;

  public parseContent(content: HeapContentWrapper): void {
    if (content.length !== 8) {
      HeapNodeRect.logging.error('Unable to parse Rect-Content - Size mismatch: ' + content.length + ' @ "' + this.tagName + '" pos: ' + content.objectHeaderOffset);
      return;
    }

    const reader = content.getReader();

    this.left = reader.readInt16('Rect.left');
    this.top = reader.readInt16('top');
    this.right = reader.readInt16('Rect.right');
    this.bottom = reader.readInt16('Rect.bottom');
  }
}
