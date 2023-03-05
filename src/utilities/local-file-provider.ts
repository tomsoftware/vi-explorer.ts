import { BinaryReader } from './binary-reader';
import { FileItem } from './file-system-items';
import { FolderItem } from './folder-item';

class LocalFileItem implements FileItem {
  private file: File;

  public get name(): string {
    return this.file.name;
  }

  public get path(): string {
    return (this.file as any).webkitRelativePath ?? this.file.name;
  }

  constructor(file: File) {
    this.file = file;
    Object.seal(this);
  }

  public async read(): Promise<BinaryReader> {
    const data = await this.file.arrayBuffer();
    return new BinaryReader(data, 0, null, this.name);
  }
}

export class LocalFileProvider {
  public addToFolder(fileList: FileList, folder: FolderItem) {
    for (const f of fileList) {
      folder.addFile([], new LocalFileItem(f));
    }
  }
}
