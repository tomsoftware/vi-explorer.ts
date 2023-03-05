import { BinaryReader } from './binary-reader';
import { FileItem } from './file-system-items';
import { FolderItem } from './folder-item';

class RemoteFileItem implements FileItem {
  public name: string;
  public url: string;

  constructor(url: string, name: string) {
    this.url = url;
    this.name = name;
  }

  public async read(): Promise<BinaryReader> {
    const response = await fetch(this.url);
    const buffer = await response.arrayBuffer();
    return new BinaryReader(buffer, 0, null, this.name);
  }
}

/** Read a list of files from remote url "files.txt" */
export class RemoteFileProvider {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(fileName: string): string {
    return this.baseUrl + '/' + fileName;
  }

  public async addToFolder(fileListName: string, folder: FolderItem) {
    const response = await fetch(this.buildUrl(fileListName));
    const fileListText = await response.text();

    const fileList = fileListText.split(/\r?\n/);
    for (const f of fileList) {
      if (f.trim().length === 0) {
        continue;
      }

      const path = FolderItem.splitPath(f);
      const fileName = path.pop();
      if (fileName == null) {
        continue;
      }

      const url = this.buildUrl(f);
      folder.addFile(path, new RemoteFileItem(url, fileName));
    }
  }
}
