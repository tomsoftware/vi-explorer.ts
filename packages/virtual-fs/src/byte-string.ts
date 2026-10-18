// todo - use https://www.npmjs.com/package/iconv-lite?activeTab=readme
/** A Buffer that can be represented as a String in different encodings */
export class ByteString {
  private static CachedAsciiTextDecoder = new TextDecoder('ascii');
  private static CachedUtf8TextDecoder = new TextDecoder('utf8');
  private static CachedUtf8TextEncoder = new TextEncoder();

  public buffer: Uint8Array;

  public static readonly empty = new ByteString(new Uint8Array(0));

  public constructor(buffer: Uint8Array) {
    this.buffer = buffer;
  }

  /** Convert a Javascript string as UTF8 text */
  public static fromString(source: string) {
    const buffer = ByteString.CachedUtf8TextEncoder.encode(source);
    return new ByteString(buffer);
  }

  public get asAscii() {
    return ByteString.CachedAsciiTextDecoder.decode(this.buffer);
  }

  
  public get asUtf8() {
    return ByteString.CachedUtf8TextDecoder.decode(this.buffer);
  }

  public get asHex() {
    return Array.from(this.buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

}
