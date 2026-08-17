import { VirtualFile } from './virtual-file';

export interface FileProvider {
    /** Returns a new File-Instance for the given path */
    readFile(path: string): Promise<VirtualFile | null>;
    
    /** Returns all directories within the given path */
    getDirectories(path: string): string[];

    /** Returns all files within the given path */
    getFiles(path: string): string[];
}
