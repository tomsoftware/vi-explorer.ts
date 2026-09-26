import { VirtualFile } from '@tomsoftware/virtual-fs';
import { LinkObjectBase } from './link-obj-refs/link-object-base';
import { ViVersion } from './vi-version';
import { Logger } from '@tomsoftware/logger';
import { LinkObjectFactory } from './link-obj-refs/link-object-factory';
import { registerParsers } from './link-obj-refs/register-parsers';
import { ObjectContainerHeader } from './link-obj-refs/object-container-header';

/** Parses a container using the Link-Objects format used by VI */
export class LinkObjectContainerParser {
  private static logging = new Logger('LinkObjectContainerParser');
  private readonly version: ViVersion;

  public constructor(version: ViVersion) {
    // register & import all parsers
    registerParsers();

    this.version = version;
  }

  /** parses a given file and returns a list of objects */
  public parse(reader: VirtualFile | null): Array<LinkObjectBase> {
    let count = 0;
    const objs: Array<LinkObjectBase> = [];
    if (reader == null) {
        return objs;
    }

    LinkObjectContainerParser.logging.log('Parsing ' + reader.getFilename())

    // nextLinkInfo: expect 1 for the root
    let nextLinkInfo = reader.readUInt16BE();
    if (nextLinkInfo != 1) {
      LinkObjectContainerParser.logging.error('Expect root object link info! Got: (' + nextLinkInfo + ' != 1) in file: '+ reader.getFilename());
      return objs;
    }

    let ident = reader.readAsciiString(4);
    if (this.version.compareTo(14,0) < 0) {
      const header = new ObjectContainerHeader(ident);
      header.parseContainer(reader, this.version);
      objs.push(header);

      // we add the header also to the output
      count = reader.readUInt32BE() + 1;
    }
    else {
      count = reader.readUInt32BE();
    }
    

    // read each item in the container
    while (true) {
      // read next linkInfo marker -> expect 2 or 3
      nextLinkInfo = reader.readUInt16BE();
      if (nextLinkInfo === 3) {
        // end of marker
        break;
      }

      if (nextLinkInfo !== 2) {
        LinkObjectContainerParser.logging.error(
          'Unexpected info marker: 0x'+ nextLinkInfo.toString(16)
           + ' after parsing ' + ident
           + ' at ' + reader.tell()
           + ' in file: '+ reader.getFilename());
        break;
      }

      ident = reader.readAsciiString(4);

      // create parser for object data
      const obj = LinkObjectFactory.create(ident);
      if (obj == null) {
        break;
      }

      // parse object data
      obj.parseContainer(reader, this.version);

      // add new object to results
      objs.push(obj)
    }

    if (count != objs.length) {
      LinkObjectContainerParser.logging.error('Length mismatch ' + count + ' != ' + objs.length + ' when parsing parsing container!');
    }

    return objs;
  }
}
