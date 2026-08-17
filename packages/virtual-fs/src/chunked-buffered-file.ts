import { VirtualFile } from './virtual-file';

export class ChunkedBufferedFile extends VirtualFile {
    private chunks: Uint8Array[];
    private totalLength: number;
    private chunkOffsets: number[];

    constructor(chunks: Uint8Array[], fileName?: string) {
        super(fileName);
        this.chunks = chunks;

        this.chunkOffsets = [];
        let offset = 0;
        for (const c of chunks) {
            this.chunkOffsets.push(offset);
            offset += c.length;
        }
        this.totalLength = offset;
    }

    public length(): number {
        return this.totalLength;
    }

    public getBytes(offset: number, length: number): Uint8Array {
        if (offset < 0 || length < 0 || offset + length > this.totalLength) {
            throw new RangeError("Requested range is out of bounds in file: " + this.fileName);
        }

        // Finds the chunk that matches the given offset
        const chunkIndex = this.findChunkIndex(offset);
        const chunk = this.chunks[chunkIndex];
        const chunkStart = this.chunkOffsets[chunkIndex];
        const localOffset = offset - chunkStart;

        // check if this request is in this chunk only
        if (localOffset + length <= chunk.length) {
            return chunk.subarray(localOffset, localOffset + length);
        }

        // copy chunks together to get the result buffer
        const result = new Uint8Array(length);
        let resultPos = 0;
        let remaining = length;
        let globalPos = offset;
        let idx = chunkIndex;

        while (remaining > 0 && idx < this.chunks.length) {
            const c = this.chunks[idx];
            const start = this.chunkOffsets[idx];
            const local = globalPos - start;

            const available = c.length - local;
            const toCopy = Math.min(available, remaining);

            result.set(c.subarray(local, local + toCopy), resultPos);

            resultPos += toCopy;
            globalPos += toCopy;
            remaining -= toCopy;
            idx++;
        }

        return result;
    }

    private findChunkIndex(globalOffset: number): number {
        let low = 0;
        let high = this.chunkOffsets.length - 1;

        // binary search for the chunks index
        while (low <= high) {
            const mid = (low + high) >>> 1;
            const start = this.chunkOffsets[mid];
            const end = start + this.chunks[mid].length;

            if (globalOffset < start) {
                high = mid - 1;
            } else if (globalOffset >= end) {
                low = mid + 1;
            } else {
                return mid;
            }
        }

        throw new Error('Offset not found in any chunk');
    }

    public clone(): VirtualFile {
        return new ChunkedBufferedFile(this.chunks, this.fileName);
    }
}
