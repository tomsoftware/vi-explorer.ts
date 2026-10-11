import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';

/**
 * Connector Pane Content Type -
 *   Holds a list of type descriptor references. A VI stores exactly one
 *   entry; a library (LLB) may store several.
 *   The referenced type descriptor is of the Function type. Its own list of
 *   sub-types holds the types of the connectors bound to the terminal
 *   points on the VI icon's connector pane.
 *   The referenced type is also used as input when calculating the salt
 *   for the Block Diagram password.
 *   In LabVIEW 7.1, the equivalent block is named CPCT.
*/
export class CONP {
  private static logging = new Logger('CONP');

  public readonly indices: number[] = [];

  /** returns the first index */
  public first(): number {
    return this.indices[0] ?? -1;
  }

  constructor(reader: VirtualFile | null) {
    if (reader == null) {
        CONP.logging.error('File has no CONP container');
        return;
    }

    /** read in all indices */
    while(!reader.eof()) {
      this.indices.push(reader.readUInt16BE() + 1);
    }
  }
}
