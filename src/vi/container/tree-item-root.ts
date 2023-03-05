import { LogHandler } from '@/utilities/log-handler';
import { TreeItem, TreeObjectType } from './tree-item';

export class TreeItemBoot extends TreeItem {
  constructor() {
    super(0, -1);
  }

  public get objectType(): TreeObjectType {
    return TreeObjectType.Root;
  }

  public getXML(deep = 0): string {
    let tmp = '';
    for (const cpos of this.children) {
      tmp += cpos.getXML(deep);
    }
    return tmp;
  }
}
