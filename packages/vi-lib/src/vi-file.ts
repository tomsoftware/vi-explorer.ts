import { ByteString, VirtualFile } from '@tomsoftware/virtual-fs';
import { Logger } from '@tomsoftware/logger';
import { ViHeader } from './vi-header';
import { ViResources } from './vi-resources';
import { STRG } from './container/strg';
import { ViVersion } from './vi-version';
import { ViSaveRecord } from './vi-save-record';
import { VCTP } from './container/vctp';
import { LinkedObjectContainer } from './container/linked-object-container';
import { CONP } from './container/conp';
import { CPC2 } from './container/cpc2';
import { LIBN } from './container/libn';
import { VCTPObjectTerminal } from './vctp-parsing/vctp-object-terminal';
import { LogManager, ViDataReader } from './vi-data-reader';

export class ViFile {
  private static logging = new Logger('ViFile');
  private readonly reader: ViDataReader;
  private readonly header: ViHeader;
  public readonly resources: ViResources;
  private readonly viSaveRecord: ViSaveRecord;
  public readonly logManager: LogManager;
  private vctp: VCTP | null = null;

  /** Return the internals file name of the VI */
  public get fileName(): ByteString {
    return this.header.fileName ?? ByteString.fromString('Unknown');
  } 

  /** Return the version on this VI file */
  public get version(): ViVersion {
    return this.viSaveRecord.fileVersion;
  }

  constructor(reader: VirtualFile) {
    this.logManager = new LogManager();
    this.reader = new ViDataReader(reader, this.logManager);
    this.header = new ViHeader(this.reader);
    this.resources = new ViResources(this.reader, this.header.resourcesHeader);

    this.viSaveRecord = new ViSaveRecord(this);
  }

  /** Returns the STRG-Container with string description of the VI */
  public getStringDescription(): STRG {
    const container = this.resources.getResourceByName('STRG');
    const reader = container?.getReader(false);
    return new STRG(reader ?? null);
  }

  public getSaveRecord() {
    return this.viSaveRecord;
  }

  /** Returns Dependency information */
  public getLIvi() {
    const container = this.resources.getResourceByName('LIvi');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }

  /** Returns LIds as LinkedObjectContainer*/
  public getLIds() {
    const container = this.resources.getResourceByName('LIds');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }

  /** Returns LIfp as LinkedObjectContainer */
  public getLIfp() {
    const container = this.resources.getResourceByName('LIfp');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }

  /** Returns LIbd as LinkedObjectContainer */
  public getLIbd() {
    const container = this.resources.getResourceByName('LIbd');
    const reader = container?.getReader(false) ?? null;
    return new LinkedObjectContainer(reader, this.version);
  }

  /** returns the LIBN container */
  public getLIBN(): LIBN {
    const container = this.resources.getResourceByName('LIBN');
    const reader = container?.getReader(false) ?? null;
    return new LIBN(reader);
  }

  /** return the reader for the block diagram */
  public getBlockDiagramReader(): ViDataReader | null {
    if (this.resources.resourceExists('BDHc')) {
      // for Version 10,11,12
      return this.resources.getReaderByName('BDHc', true);
    }

     if (this.resources.resourceExists('BDHb')) {
      // for Version 7,8
      return this.resources.getReaderByName('BDHb', true);
    }

     if (this.resources.resourceExists('BDHP')) {
      // for Version 5,6,7beta
      return this.resources.getReaderByName('BDHP', false);
    }

    ViFile.logging.warn('No Block diagram found!');
    return null;
  }

  /**
   * Returns the CPC2 Object
   * - ID to terminal in the vctp type definition
   * - This ID pointing the main terminal used for the password Hash
   **/
  public getCPC2() {
    const container = this.resources.getResourceByName('CPC2');
    const reader = container?.getReader(false);
    if (reader == null) {
      return null;
    }
    return new CPC2(reader);
  }

  /** Returns the CONP Object 
   * - ID to terminal in the vctp type definition 
   * - This ID might be pointing the main terminal connector of the VI
   **/
  public getCONP() {
    const container = this.resources.getResourceByName('CONP');
    const reader = container?.getReader(false);
    if (reader == null) {
      return null;
    }
    return new CONP(reader);
  }


  /** Returns VCTP "VI Consolidated Types" container */
  public getVCTP(): VCTP {
    if (this.vctp != null) {
      return this.vctp;
    }

    const container = this.resources.getResourceByName('VCTP');
    const reader = container?.getReader(true) ?? null;
    this.vctp = new VCTP(reader, this.version);
    return this.vctp;
  }

  /** Returns the type definition of the Terminal/Connector of this VI */
  public getTerminalDefinition(): VCTPObjectTerminal | null {
    const conp = this.getCONP();
    if (conp == null) {
      return null;
    }
    const terminalId = conp.first;
    const type = this.getVCTP().getById(terminalId);
    if (type == null) {
      ViFile.logging.warn('Unable to find terminal-type definition in VI with ID ' + terminalId);
      return null;
    }

    if (!(type instanceof VCTPObjectTerminal)) {
      ViFile.logging.warn('Type definition with ID ' + terminalId +' has wrong type: '+ type.mainTypeName);
      return null;
    }

    return type;
  }

}
