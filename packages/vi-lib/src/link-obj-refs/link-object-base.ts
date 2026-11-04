import { ViVersion } from '../vi-version';
import { Logger } from '@tomsoftware/logger';
import { ViDataReader } from '../vi-data-reader';

/** Abstract base class for all Link-Objects */
export abstract class LinkObjectBase {
  private static baseLogging = new Logger('LinkObjectBase');
  public tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }

  /** Aligns the current reader position to a given alignment */
  protected alignPaddingBytes(reader: ViDataReader, alignment: number) {
    const current = reader.tell();
    const padding = (current % alignment);
    if (padding == 0) {
      return;
    }

    // Jump over Padding bytes
    reader.seek(current + alignment - padding);
  }

  /** Parse data from current reader position into this LinkObject */
  public abstract parseContainer(reader: ViDataReader, version?: ViVersion): void;
}
