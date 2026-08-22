import { BufferedFile } from './buffered-file';
import { FileProvider } from './file-provider';
import { FileTreeItem } from './file-tree-item';
import { VirtualFile } from './virtual-file';

export class LocalFileProvider implements FileProvider {
    private readonly files = new Map<string, File>();
    private fileTree: FileTreeItem;

    constructor(initialFiles: Iterable<File> | FileList | null = null) {
        this.fileTree = new FileTreeItem('');

        if (initialFiles) {
            this.addFiles(initialFiles);
        }
    }

    public addFiles(files: Iterable<File> | FileList): void {
        const entries = Array.from(files);

        for (const file of entries) {
            const normalizedPath = this.normalizePath(file);
            if (!normalizedPath) {
                continue;
            }

            this.files.set(normalizedPath, file);
        }

        this.fileTree = FileTreeItem.createFromFileNameList(Array.from(this.files.keys()));
    }

    public removeFile(path: string): void {
        this.files.delete(this.normalizePathString(path));
        this.fileTree = FileTreeItem.createFromFileNameList(Array.from(this.files.keys()));
    }

    public readFile(path: string): Promise<VirtualFile | null> {
        const normalizedPath = this.normalizePathString(path);
        const file = this.files.get(normalizedPath);

        if (!file) {
            return Promise.resolve(null);
        }

        return file.arrayBuffer().then((buffer) => new BufferedFile(new Uint8Array(buffer), normalizedPath));
    }

    public getDirectories(path: string): string[] {
        const dir = this.fileTree.walkPath(this.normalizePathString(path));
        return dir ? dir.dirs.map((d) => d.name) : [];
    }

    public getFiles(path: string): string[] {
        const dir = this.fileTree.walkPath(this.normalizePathString(path));
        return dir ? dir.files : [];
    }

    private normalizePath(file: File): string {
        let relativePath = file.name;

        const tmp = (file as File & { webkitRelativePath?: string }).webkitRelativePath; 
        if (tmp != null && tmp.length > 0) {
            relativePath = tmp;
        }

        return this.normalizePathString(relativePath);
    }

    private normalizePathString(path: string): string {
        const normalized = path
            .replace(/\\/g, '/')
            .replace(/^\/+/, '')
            .replace(/^\.\//, '')
            .replace(/^\.\//, '')
            .replace(/\/+/g, '/');

        return normalized.replace(/^\.?\//, '');
    }
}
