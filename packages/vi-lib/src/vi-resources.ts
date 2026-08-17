import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViResourceContainer } from './vi-resource-container';

/** Every VI file contains a a list of resource containers/chunks */
export class ViResources {
  private static logging = new Logger('ViResources');

  public resources: ViResourceContainer[] = [];

  constructor(reader: VirtualFile | null, dataReader: VirtualFile | null) {
    Object.freeze(this);

    if ((reader == null) || (dataReader == null)) {
      return;
    }

    reader.seek(0);

    // read number of resources
    const count = reader.readUInt32LE() + 1;
    ViResources.logging.log('Found Resources: ' + count);

    if (count > 1000) {
      ViResources.logging.error('Something is wrong! To many resources in file!');
      return;
    }

    // read header of resources
    for (let i = 0; i < count; i++) {
      this.resources.push(new ViResourceContainer(reader, dataReader));
    }
  }

  /** return True if a given resource is included in this file */
  public resourceExists(name: string): boolean {
    return !!this.resources.find((r) => r.compareName(name));
  }

  /** return the content of the resource */
  public getResourceByName(name: string): ViResourceContainer | null {
    return this.resources.find((r) => r.compareName(name)) ?? null;
  }
}
