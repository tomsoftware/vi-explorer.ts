import { FileProvider } from './file-provider';
import { VirtualFile } from './virtual-file';

export class VirtualFS implements FileProvider {
    private fileProvider: FileProvider[] = [];

    /** Returns a new File for the given path */
    public async readFile(path: string): Promise<VirtualFile | null> {
        for (const provider of this.fileProvider) {
            const file = await provider.readFile(path);
            if (file !== null) {
                return file;
            }
        }

        return null;
    }

    /** Returns all directories within the given path */
    public getDirectories(path: string): string[] {
        const dirs: string[] = [];
        for (const provider of this.fileProvider) {
            dirs.push(...provider.getDirectories(path));
        }
        return dirs;
    }

    /** Returns all files within the given path */
    public getFiles(path: string): string[] {
        const files: string[] = [];
        for (const provider of this.fileProvider) {
            files.push(...provider.getFiles(path));
        }
        return files;
    }

    /** Register a new FileProvider */
    public registerFileProvider(provider: FileProvider): void {
        this.fileProvider.push(provider);
    }
}
