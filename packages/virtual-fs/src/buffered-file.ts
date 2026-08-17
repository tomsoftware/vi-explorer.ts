import { VirtualFile } from './virtual-file';

/** Simple file created form Uint8Array */
export class BufferedFile extends VirtualFile {
    private buffer: Uint8Array;

    constructor(buffer: Uint8Array, fileName?: string) {
        super(fileName);
        this.buffer = buffer;
    }

    public getBytes(offset: number, length: number): Uint8Array {
        return this.buffer.subarray(offset, offset + length);
    }

    public length(): number {
        return this.buffer.length;
    }

    public clone(): VirtualFile {
        return new BufferedFile(this.buffer, this.fileName);
    }

    /** Returns an empty file */
    public static empty(): VirtualFile {
        return new BufferedFile(new Uint8Array(0), 'null-file');
    }
}
