export class FileTreeItem {
    public name: string;
    public dirs: FileTreeItem[];
    public files: string[];
    
    constructor(name: string){
        this.name = name;
        this.dirs = [];
        this.files = [];
    }

    /** Returns a directory by name or null if not found */
    public getDir(name: string): FileTreeItem | null {
        for (const dir of this.dirs) {
            if (dir.name === name) {
                return dir;
            }
        }
        return null;
    }

    /** Walks the path and returns the corresponding FileTreeItem or null if not found */
    public walkPath(path: string): FileTreeItem | null {
        const parts = splitPath(path);
        let current: FileTreeItem | null = this;

        for (const part of parts) {
            if (current === null) {
                return null;
            }
            current = current.getDir(part);
        }

        return current;
    }

    /** Creates or returns an existing directory */
    public createDir(name: string): FileTreeItem {
        const existing = this.getDir(name);
        if (existing !== null) {
            return existing;
        }

        const dir = new FileTreeItem(name);
        this.dirs.push(dir);
        return dir;
    }

    /** Creates a FileTree from a list of filenames */
    public static createFromFileNameList(filenames: string[]): FileTreeItem {
        const root = new FileTreeItem('');

        for (const path of filenames) {
            const parts = splitPath(path);

            insertPath(root, parts);
        }

        return root;
    }
}

function splitPath(path: string): string[] {
    return path.split('/').filter(p => p.length > 0);
}

function insertPath(node: FileTreeItem, parts: string[], partsIndex = 0): void {
    if ((parts.length === 0) || (partsIndex >= parts.length)) {
        return;
    }

    const currentPart = parts[partsIndex];

    // add last part as file
    if (partsIndex === parts.length - 1) {
        node.files.push(currentPart);
        return;
    }

    // find or create directory
    const next = node.createDir(currentPart);
 
    // continue with next part
    insertPath(next, parts, partsIndex + 1);
}
