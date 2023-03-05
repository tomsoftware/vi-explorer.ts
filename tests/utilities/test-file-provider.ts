import * as fs from 'fs';

export class TestFileProvider {
  private rootUrl = 'public';

  public loadBinary(path: string): Promise<Uint8Array> {
    const fullUrl = this.rootUrl ? (this.rootUrl + '/' + path) : path;

    return new Promise((resolve, reject) => {
      fs.readFile(fullUrl, (err: any, data: any) => {
        if (err) {
          reject(err);
        }

        resolve(new Uint8Array(data.buffer));
      });
    });
  }
}
