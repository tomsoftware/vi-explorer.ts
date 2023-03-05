export class Utilities {
  public static downloadFile(data: Uint8Array, fileName: string) {
    const url = window.URL.createObjectURL(new Blob([data]));
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // the filename you want
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
