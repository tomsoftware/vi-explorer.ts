import { Logger } from "@tomsoftware/logger";
import { BufferedFile } from "./buffered-file";

/** Abstract representation of a file */
export abstract class VirtualFile {
    private static readonly logger = new Logger(VirtualFile.name);
    private static CachedAsciiTextDecoder = new TextDecoder('ascii');
    protected offset = 0;
    protected fileName: string;

    public abstract getBytes(offset: number, length: number): Uint8Array;

    constructor(fileName?: string) {
        this.fileName = fileName ?? 'unknown';
    }

    public getFilename(): string {
        return this.fileName;
    }

    /** Get the length of the file */
    public abstract length(): number;

    public abstract clone(): VirtualFile;

    /** clamp the input to the maximum possible range this file can provide */
    private clampRange(offset: number, length: number) {
        const fileLength = this.length();
        const requestedEnd = offset + length;

        // clamp start and end independently
        const start = Math.max(0, Math.min(offset, fileLength));
        const end = Math.max(0, Math.min(requestedEnd, fileLength));

        return {
            offset: start,
            length: Math.max(0, end - start)
        };
    }
   
    /** Create a new VirtualFile for the given sub buffer */
    public getSubReader(offset: number, length: number): VirtualFile {
        const fileLength = this.length();
        let data: Uint8Array;

        if ((offset < 0) || (length < 0) || (offset + length) > fileLength) {
            VirtualFile.logger.error('Try to read out of buffer [from: {0}, length: {1}] in file "{2}"',
                null, offset, length, this.fileName
            );

            // clamp values to maximum matching the data
            const clamped = this.clampRange(offset, length);
            data = this.getBytes(clamped.offset, clamped.length);
        }
        else {
            data = this.getBytes(offset, length);
        }
        
        return new BufferedFile(data, this.fileName);
    }

    /** Read a unsigned little ending int32 from the file */
    public readUInt32LE(): number {
        const bytes = this.getBytes(this.offset, 4);
        this.offset += 4;
        return (
            (bytes[0]) |
            (bytes[1] << 8) |
            (bytes[2] << 16) |
            (bytes[3] << 24)
        ) >>> 0;;
    }

    /** Read a unsigned little ending int16 from the file */
    public readUInt16LE(): number {
        const bytes = this.getBytes(this.offset, 2);
        this.offset += 2;
        return (
            (bytes[0]) |
            (bytes[1] << 8)
        );
    }

    /** Read a single byte from the file */
    public readByte(): number {
        const byte = this.getBytes(this.offset, 1);
        this.offset += 1;
        return byte[0];
    }

    /** Read size-bytes from the file and return a new sub-file */
    public readBytesAsReader(size: number): VirtualFile {
        const newFile = this.getSubReader(this.offset, size);
        this.offset += newFile.length();;
        return newFile;
    }

    /** Read size-bytes from the file and return them as Uint8Array */
    public readBytes(size: number): Uint8Array {
        const bytes = this.getBytes(this.offset, size);
        this.offset += bytes.length;
        return bytes;
    }

    /** Read a ascii coded string of given length from the file */
    public readAsciiString(length: number): string {
        const bytes = this.getBytes(this.offset, length);
        this.offset += length;
        return VirtualFile.CachedAsciiTextDecoder.decode(bytes);
    }

    /** Read a ascii coded string of given length from the file that also can be terminated by a '\0' char */
    public readAsciiNullString(length: number): string {
        const string = this.readAsciiString(length);
        const nullPos = string.indexOf('\0');
        return nullPos >= 0 ? string.substring(0, nullPos) : string;
    }

    /** Set the current position in the file and returns this */
    public seek(position: number): VirtualFile {
        this.offset = position;
        return this;
    }

    /** moves the file pointer count bytes */
    public move(count: number) {
        this.offset += count;
    }

    /** Get the current position in the file */
    public tell(): number {
        return this.offset;
    }

    /** Check if end of file is reached */
    public eof(): boolean {
        return this.offset >= this.length();
    }
}
