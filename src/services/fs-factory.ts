import { HttpFileProvider, LocalFileProvider, VirtualFS } from '@tomsoftware/virtual-fs';

export class FSFactory {
  private static instance: Promise<VirtualFS> | null = null;

  public static localProvider = new LocalFileProvider();

  public static getInstance(): Promise<VirtualFS> {
    if (FSFactory.instance) {
        return FSFactory.instance;
    }

    FSFactory.instance = new Promise((resolve) => {
        FSFactory.buildNew().then(resolve);
    });
    
    return FSFactory.instance;
  }


  private static async buildNew() {
    const fs = new VirtualFS();
    fs.registerFileProvider(FSFactory.localProvider);

    const httpProvider = await HttpFileProvider.fromUrlList('test-files/', 'file-list.txt')
    fs.registerFileProvider(httpProvider)

    return fs;
  }
}

export default FSFactory;
