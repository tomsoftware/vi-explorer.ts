import { BinaryReader } from './binary-reader';

export interface FileItem {
    name: string;
    read(): Promise<BinaryReader>;
}
