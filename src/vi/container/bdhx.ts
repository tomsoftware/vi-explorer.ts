import { TreeItem } from './tree-item';
import { LogHandler } from '@/utilities/log-handler';
import { ViResourceContainer } from '../vi-resource-container';
import { ViResources } from '../vi-resources';
import { FileVersion, TreeObjectReader } from './tree-object-reader';

export class BDHx {
  private static logging = new LogHandler('BDHx');
  public objectTree: TreeItem | null = null;

  constructor(lv: ViResources) {
    let container: ViResourceContainer | null;
    let fileVersion: FileVersion;

    if (lv.resourceExists('BDHb')) {
      container = lv.getResourceByName('BDHb');
      fileVersion = FileVersion.B;
    } else {
      container = lv.getResourceByName('BDHc');
      fileVersion = FileVersion.C;
    }

    if (container == null) {
      BDHx.logging.error('Unable to find BDHb or BDHc container!');
      return;
    }

    const reader = container.getReader(true);
    if (reader == null) {
      BDHx.logging.error('Unable to read container data!');
      return;
    }

    this.objectTree = TreeObjectReader.read(reader, fileVersion);
  }
}
