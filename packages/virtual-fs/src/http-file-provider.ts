import { Logger } from '@tomsoftware/logger';
import { BufferedFile } from './buffered-file';
import { FileProvider } from './file-provider';
import { FileTreeItem } from './file-tree-item';
import { VirtualFile } from './virtual-file';

/**
 *  FileProvider that fetches files over HTTP.
 *  All known files are listed in a list of filenames.
 **/
export class HttpFileProvider implements FileProvider {
    private static readonly logger = new Logger(HttpFileProvider.name);
    private baseUrl: string;
    private fileList: string[];
    private fileTree: FileTreeItem;
    
    constructor(baseUrl: string, fileList: string[]) {
        this.baseUrl = baseUrl;
        this.fileList = fileList;
        this.fileTree = FileTreeItem.createFromFileNameList(fileList);
    }

    public async readFile(path: string): Promise<VirtualFile | null> {
        if (!this.fileList.includes(path)) {
            return Promise.resolve(null);
        }

        HttpFileProvider.logger.log('Read file "{0}" from backend.', path);

        const fullUrl = this.baseUrl + path;
        let data: ArrayBuffer;

        try {
            const response = await fetch(fullUrl);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();

            if (blob === null) {
                return null;
            }

            data = await blob.arrayBuffer();
        }
        catch(err)
        {
            HttpFileProvider.logger.error('Unable to fetch {0}.', err, path);
            return null;
        }

        return new BufferedFile(new Uint8Array(data), path);
    }

    public getDirectories(path: string): string[] {
        const dir = this.fileTree.walkPath(path);
        if (dir === null) {
            return [];
        }
        return dir.dirs.map(d => d.name);
    }

    public getFiles(path: string): string[] {
        const dir = this.fileTree.walkPath(path);
        if (dir === null) {
            return [];
        }
        return dir.files;
    }

    /** fetch a file list from fileListUrl and creates a new HttpFileProvider */
    public static async fromUrlList(baseUrl: string, fileListUrl: string): Promise<HttpFileProvider> {
        const response = await fetch(baseUrl + fileListUrl);
        const text = await response.text();
        const fileList = text.split(/\r\n|\r|\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return new HttpFileProvider(baseUrl, fileList);
    }
}
