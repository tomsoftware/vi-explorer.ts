import { BinaryReader } from '@/utilities/binary-reader';
import { LogHandler } from '@/utilities/log-handler';
import { ViResourceContainer } from './vi-resource-container';

/** Every VI file contains a a list of resource containers/chunks */
export class ViResources {
  private static logging = new LogHandler('ViResources');

  public resources: ViResourceContainer[] = [];

  constructor(reader: BinaryReader | null, dataReader: BinaryReader | null) {
    Object.freeze(this);

    if ((reader == null) || (dataReader == null)) {
      return;
    }

    reader.setOffset(0);

    // read number of resources
    const count = reader.readInt() + 1;
    ViResources.logging.debug('Found Resources: ' + count);

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
