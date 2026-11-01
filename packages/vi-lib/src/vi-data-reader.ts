import { Logger } from "@tomsoftware/logger";
import { BufferedFile, ByteString, VirtualFile } from "@tomsoftware/virtual-fs";

export class ReadLogEntry {
  public length: number;
  public label: string;
  
  constructor(length: number, label?: string) {
    this.length = length;
    this.label = label ?? 'unknown';
  }
}

export class ReadLogger {
  public readonly readLog = new Map<number, ReadLogEntry>();
  public readonly reader: VirtualFile;

  public constructor(reader: VirtualFile) {
    this.reader = reader;
  }

  public log(offset: number, length: number, label: string | undefined) {
    const newEntry = new ReadLogEntry(length, label);
    this.readLog.set(offset, newEntry);
  }

  public getData(): Uint8Array {
    return this.reader.getBytes(0, this.reader.length());
  }
}

export class LogManager {
  private loggers = new Map<string, ReadLogger>();

  public get(reader: VirtualFile): ReadLogger{
    const loggerName = reader.getFilename();
    const l = this.loggers.get(loggerName);
    if (l != null) {
      return l;
    }

    const newL = new ReadLogger(reader);
    this.loggers.set(loggerName, newL);
    return newL;
  }

  public entries(): Array<{ name: string; logger: ReadLogger }> {
    return Array.from(this.loggers.entries()).map(([name, logger]) => ({ name, logger }));
  }
}

export class ViDataReader {
  private static logging = new Logger('ViDataReader');
  private readonly reader: VirtualFile;
  private readonly readLog: ReadLogger;
  private readonly logManager: LogManager;
  private readonly baseOffset: number;

  public constructor(reader: VirtualFile, logManager: LogManager, baseOffset = 0) {
    this.reader = reader;
    this.logManager = logManager;
    this.readLog = logManager.get(reader);
    this.baseOffset = baseOffset;
  }

  private log(label: string | undefined, length: number) {
    const offset = this.reader.tell();
    this.readLog.log(this.baseOffset + offset, length, label ?? 'unknown');
  }

  public eof(): boolean {
    return this.reader.eof();
  }

  public length(): number {
    return this.reader.length();
  }

  public getBytes(offset: number, length: number, label?: string): Uint8Array {
    this.readLog.log(this.baseOffset + offset, length, label);
    return this.reader.getBytes(offset, length);
  }

  public readByte(label?: string): number {
    this.log(label, 1);
    return this.reader.readByte();
  }

  public readUInt16BE(label?: string): number {
    this.log(label, 2);
    return this.reader.readUInt16BE();
  }

  public readUInt16LE(label?: string): number {
    this.log(label, 2);
    return this.reader.readUInt16LE();
  }

  public readUInt16(label?: string): number {
    return this.readUInt16BE(label);
  }

  public readUInt32BE(label?: string): number {
    this.log(label, 4);
    return this.reader.readUInt32BE();
  }

  public readUInt32LE(label?: string): number {
    this.log(label, 4);
    return this.reader.readUInt32LE();
  }

  public readUInt32(label?: string): number {
    return this.readUInt32BE(label);
  }

  public readBytes(length: number, label?: string): Uint8Array {
    this.log(label, length);
    return this.reader.readBytes(length);
  }

  public readString(length: number, label?: string): ByteString {
    this.log(label, length);
    return this.reader.readString(length);
  }

  /** Read a string prefixed with is 4 byte size */
  public readLengthString(label: string) {
    const offset = this.reader.tell();
    const strLen = this.reader.readUInt32BE();
    if (strLen >= this.reader.leftLength()) {
      ViDataReader.logging.error('Size of string is to big! ' + strLen + ' to read '+ label + ' in ' + this.reader.getFilename());
      return ByteString.empty;
    }
    this.readLog.log(this.baseOffset + offset, strLen + 4, label);
    return this.reader.readString(strLen);
  }

  /** Read a number that can be 16 or 32 bit */
  public readVarSizeNumber(label: string) {
    const offset = this.reader.tell();
    const value = this.reader.readUInt16BE();
    if ((value & 0x8000) !== 0) {
      this.readLog.log(this.baseOffset + offset, 4, label);
      return ((value & 0x7fff) << 16) | this.reader.readUInt16BE();
    }
        this.readLog.log(this.baseOffset + offset, 2, label);
    return value;
  }

  public createNew(buffer: Uint8Array<ArrayBufferLike>, fileName: string): ViDataReader | null {
    const newReader = new BufferedFile(buffer, fileName)
    return new ViDataReader(newReader, this.logManager);
  }

  public createSubReader(offset: number, length?: number | null, fileName?: string): ViDataReader {
    if (fileName == null) {
      const newReader = this.reader.createSubReader(offset, length, this.reader.getFilename());
      return new ViDataReader(newReader, this.logManager, this.baseOffset + offset);
    }
    else {
      const newReader = this.reader.createSubReader(offset, length, fileName);
      return new ViDataReader(newReader, this.logManager);
    }
  }

  public leftLength(): number {
    return this.reader.leftLength();
  }

  public tell(): number {
    return this.reader.tell();
  }

  public getFilename(): string {
    return this.reader.getFilename();
  }

  public seek(position: number) {
    return this.reader.seek(position);
  }
}