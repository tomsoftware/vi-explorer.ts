import { FileItem } from './file-system-items';

/**
 * Virtual-File-System Folder item
*/
export class FolderItem {
  public name: string;
  public folders: FolderItem[] = [];
  public files: FileItem[] = [];

  constructor(name: string) {
    this.name = name;
  }

  private createFolder(path: string[], pathPos = 0): FolderItem {
    if (pathPos >= path.length) {
      return this;
    }

    const name = path[pathPos];

    let subFolder = this.folders.find((f) => FolderItem.compareName(f.name, name));
    if (subFolder == null) {
      // create new folder
      subFolder = new FolderItem(name);
      this.folders.push(subFolder);
    }

    // return sub folder
    return subFolder.createFolder(path, pathPos + 1);
  }

  private findFolder(path: string[], pathPos = 0): FolderItem | null {
    if (pathPos >= path.length) {
      return this;
    }

    const name = path[pathPos];

    const subFolder = this.folders.find((f) => FolderItem.compareName(f.name, name));
    if (subFolder == null) {
      return null;
    }

    // return sub folder
    return subFolder.findFolder(path, pathPos + 1);
  }

  public addFile(path: string[], file: FileItem) {
    const folder = this.createFolder(path);
    folder.files.push(file);
  }

  public getFile(path: string, fileName: string): FileItem | null {
    const pathParts = FolderItem.splitPath(path);
    const folder = this.findFolder(pathParts);
    if (folder == null) {
      return null;
    }

    return this.files.find((f) => FolderItem.compareName(f.name, fileName)) ?? null;
  }

  private static compareName(n1: string, n2: string) {
    return n1.toUpperCase() === n2.toUpperCase();
  }

  public static splitPath(path: string): string[] {
    return path.split(/[\\/]/);
  }
}
