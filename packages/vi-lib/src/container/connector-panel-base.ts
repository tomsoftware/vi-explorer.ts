import { Logger } from "@tomsoftware/logger";
import { ViDataReader } from "../vi-data-reader";

export class ConnectorPanelBase {
  private static logging = new Logger('ConnectorPanelBase');

  // remember: indexes are 1-bases in LabView
  public readonly indices: number[] = [];

  /** returns the first index */
  public get first(): number {
    const value = this.indices[0];
    if (value == null) {
      return -1;
    }
    // index to use in vctp
    return value;
  }

  constructor(reader: ViDataReader) {
    if (reader == null) {
        ConnectorPanelBase.logging.error('File has no Connector Panel!');
        return;
    }

    /** read in all indices */
    while(!reader.eof()) {
      this.indices.push(reader.readUInt16('connector-panel-base.index'));
    }
  }
}
