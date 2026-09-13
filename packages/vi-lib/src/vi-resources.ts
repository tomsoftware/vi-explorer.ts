import { VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViResourceContainer } from './vi-resource-container';
import { ResourcesListHeader } from './vi-header';

/** Every VI file contains a list of resource containers/chunks */
export class ViResources {
  private static logging = new Logger('ViResources');

  public readonly resources: ViResourceContainer[] = [];

  constructor(reader: VirtualFile, resourcesHeader: ResourcesListHeader | null) {
    if (resourcesHeader == null) {
      ViResources.logging.error('No resource header found in file ' + reader.getFilename());
      return;
    }

    /** the resourceHeader points to a list of all resource in this file */
    const resourceHeaderReader = reader.createSubReader(
      resourcesHeader.resourceListOffset,
      //resourcesHeader.resourceListSize
    );

    // read number of resources
    const count = resourceHeaderReader.readUInt32BE() + 1;
    ViResources.logging.log('Found Resources: ' + count);

    if (count > 1000) {
      ViResources.logging.error('Something is wrong! To many resources in file!');
      return;
    }

    // read header of resources
    for (let i = 0; i < count; i++) {

      // Read basic resource information
      const name = resourceHeaderReader.readAsciiString(4);
      const count = resourceHeaderReader.readUInt32BE() + 1;
      // not sure about versions before 8.0
      const headerOffset = resourceHeaderReader.readUInt32BE() + resourcesHeader.resourceListOffset;

      // create resource container
      this.resources.push(new ViResourceContainer(
        reader, name, count, headerOffset, resourcesHeader.dataSetOffset
      ));
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
