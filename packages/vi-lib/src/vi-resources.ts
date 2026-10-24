import { Logger } from '@tomsoftware/logger';
import { ViResourceContainer } from './vi-resource-container';
import { ResourcesListHeader } from './vi-header';
import { ViDataReader } from './vi-data-reader';

/** Every VI file contains a list of resource containers/chunks */
export class ViResources {
  private static logging = new Logger('ViResources');

  public readonly resources: ViResourceContainer[] = [];

  constructor(reader: ViDataReader, resourcesHeader: ResourcesListHeader | null) {
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
    const resourcesCount = resourceHeaderReader.readUInt32('vi-resources.resource-count') + 1;
    ViResources.logging.log('Found Resources: ' + resourcesCount);

    if (resourcesCount > 1000) {
      ViResources.logging.error('Something is wrong! To many resources in file!');
      return;
    }

    // read header of resources
    for (let i = 0; i < resourcesCount; i++) {

      // Read basic resource information
      const name = resourceHeaderReader.readString(4, 'vi-resources.resource-name').asAscii;
      const count = resourceHeaderReader.readUInt32('vi-resources.resource-count-for-' + name) + 1;
      // not sure about versions before 8.0
      const headerOffset = resourceHeaderReader.readUInt32('vi-resources.resource-header-offset') + resourcesHeader.resourceListOffset;

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

  /** return the content of a resource by name */
  public getResourceByName(name: string): ViResourceContainer | null {
    return this.resources.find((r) => r.compareName(name)) ?? null;
  }

  /** return a file reader of a resource by name */
  public getReaderByName(name: string, compressed: boolean): ViDataReader | null {
    const resource = this.getResourceByName(name);
    if (resource == null) {
      return null;
    }
    return resource.getReader(compressed);
  }
}
