import { ByteString } from "@tomsoftware/virtual-fs";

export class Md5 {
  private hash: Uint8Array;

  private constructor(hash: Uint8Array) {
    this.hash = hash;
  }

  /** return the hash as Hex-string */
  public toHex() {
    if (!this.isValid) {
      return '';
    }

    const hexChars = '0123456789abcdef';
    let hexStr = '';
    for (let j = 0; j < 16; j++) {
      const num = this.hash[j];
      hexStr += hexChars.charAt((num >> 4) & 0x0F) +
              hexChars.charAt(num & 0x0F);
    }
    return hexStr;
  }

  /** true if this is a valid md5 hash */
  public get isValid() {
    return (this.hash.length === 16);
  }

  /** return the hash as binary values */
  public toBuffer(): Uint8Array {
    return this.hash;
  }

  /** compare hash against other */
  public compare(other: string | Md5 | null | undefined) {
    return Md5.compare(this, other);
  }

  /** return true if this hash is the empty hash e.g. md5('') */
  public get isEmpty(): boolean {
    return this.compare(Md5.empty);
  }

  /** return a md5 hash for a empty value */
  public static empty = new Md5(new Uint8Array([
    0xd4, 0x1d, 0x8c, 0xd9, 0x8f, 0x00, 0xb2, 0x04,
    0xe9, 0x80, 0x09, 0x98, 0xec, 0xf8, 0x42, 0x7e
  ]));

  /** returns a invalid md5 hash */
  public static invalid = new Md5(new Uint8Array([]));

  /** compare two hashes */
  public static compare(hash1: string | Md5 | null | undefined, hash2: string | Md5 | null | undefined) {
    if ((hash1 == null) || (hash2 == null)) {
      return false;
    }

    // compare by hex-string
    if ((typeof hash1 === 'string') || (typeof hash2 === 'string')) {
      if (typeof hash1 !== 'string') {
        hash1 = hash1.toHex();
      }
      if (typeof hash2 !== 'string') {
        hash2 = hash2.toHex();
      }

      return hash1.toLowerCase() === hash2.toLowerCase();
    }

    // compare hash-value
    for (let i = 0; i < 16; i++) {
      if (hash1.hash[i] !== hash2.hash[i]) {
        return false;
      }
    }

    return true;
  }

  /** return a md5 hash for a given string */
  public static hashString(str: ByteString): Md5 {
    return this.hashBuffer(str.buffer);
  }

  /** return a md5 hash for a given buffer */
  public static hashBuffer(buffer: Uint8Array): Md5 {
    const md5 = new Md5State();
    return md5.update(buffer).finalize();
  }

  /** create a new md5 stream. Use update to add content
   *  to the stream. */
  public static stream(): Md5State {
    return new Md5State();
  }

  public static fromHash(hash: Uint8Array): Md5 {
    return new Md5(hash);
  }

  static fromState(a: number, b: number, c: number, d: number) {
    const v = new Uint8Array(16);

    function update(num: number, offset: number) {
      for (let j = 0; j < 4; j++) {
        v[offset + j] = num >> (j << 3);
      }
    }

    update(a, 0);
    update(b, 4);
    update(c, 8);
    update(d, 12);

    return new Md5(v);
  }
}

class Md5State {
  private static CachedTextEncoder = new TextEncoder();

  private a = 0x67452301;
  private b = 0xefcdab89;
  private c = 0x98badcfe;
  private d = 0x10325476;
  // padding bytes not yet processes by the hashing
  private leftBuffer = new Uint8Array(64);
  private leftBufferLength = 0;
  // number of bytes added to the hash
  private length = 0;

  // add a 32 bit Little-ending number
  public updateWithInt32LE(i: number): Md5State {
    const buf = new Uint8Array(4);
    buf[0] = (i >> 0) & 0xff;
    buf[1] = (i >> 8) & 0xff;
    buf[2] = (i >> 16) & 0xff;
    buf[3] = (i >> 24) & 0xff;
    this.update(buf);
    return this;
  }

  /** add a Uint8Array to the state of the hash */
  public update(data: Uint8Array | null | undefined): Md5State {
    if (data == null) {
      return this;
    }

    const buffer = this.leftBuffer;
    let bufferLength = this.leftBufferLength;

    for (let i = 0; i < data.length; i++) {
      buffer[bufferLength] = data[i];
      bufferLength++;

      if (bufferLength >= 64) {
        this.computeCycle(this.leftBuffer);
        bufferLength = 0;
      }
    }

    this.leftBufferLength = bufferLength;
    this.length += data.length;

    return this;
  }

  /** close the state and generate the final hash */
  public finalize(): Md5 {
    const tailLength = (this.leftBufferLength > 55) ? 128 : 64;
    const tail = new Uint8Array(tailLength - this.leftBufferLength);

    // write end-of-stream bit
    tail[0] = 0x80;

    // write length of data to stream
    const sizeValue = this.length * 8;
    tail[tail.length - 8] = (sizeValue >> 0) & 0xff;
    tail[tail.length - 7] = (sizeValue >> 8) & 0xff;
    tail[tail.length - 6] = (sizeValue >> 16) & 0xff;
    tail[tail.length - 5] = (sizeValue >> 24) & 0xff;

    // write tail
    this.update(tail);

    // destroy objects
    this.leftBuffer = new Uint8Array(0);

    return Md5.fromState(this.a, this.b, this.c, this.d);
  }

  /** calculate the md5 hash of a given string */
  private computeCycle(buffer: Uint8Array) {
    function add(x: number, y: number) {
      const lsw = (x & 0xFFFF) + (y & 0xFFFF);
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    }

    function rol(num: number, cnt: number) {
      return (num << cnt) | (num >>> (32 - cnt));
    }

    function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
      return add(rol(add(add(a, q), add(x, t)), s), b);
    }

    function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
      return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
      return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
      return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
      return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    const x = new Uint32Array(buffer.buffer);

    let a = this.a;
    let b = this.b;
    let c = this.c;
    let d = this.d;

    a = ff(a, b, c, d, x[0], 7, 0xd76aa478);
    d = ff(d, a, b, c, x[1], 12, 0xe8c7b756);
    c = ff(c, d, a, b, x[2], 17, 0x242070db);
    b = ff(b, c, d, a, x[3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, x[4], 7, 0xf57c0faf);
    d = ff(d, a, b, c, x[5], 12, 0x4787c62a);
    c = ff(c, d, a, b, x[6], 17, 0xa8304613);
    b = ff(b, c, d, a, x[7], 22, 0xfd469501);
    a = ff(a, b, c, d, x[8], 7, 0x698098d8);
    d = ff(d, a, b, c, x[9], 12, 0x8b44f7af);
    c = ff(c, d, a, b, x[10], 17, 0xffff5bb1);
    b = ff(b, c, d, a, x[11], 22, 0x895cd7be);
    a = ff(a, b, c, d, x[12], 7, 0x6b901122);
    d = ff(d, a, b, c, x[13], 12, 0xfd987193);
    c = ff(c, d, a, b, x[14], 17, 0xa679438e);
    b = ff(b, c, d, a, x[15], 22, 0x49b40821);

    a = gg(a, b, c, d, x[1], 5, 0xf61e2562);
    d = gg(d, a, b, c, x[6], 9, 0xc040b340);
    c = gg(c, d, a, b, x[11], 14, 0x265e5a51);
    b = gg(b, c, d, a, x[0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[5], 5, 0xd62f105d);
    d = gg(d, a, b, c, x[10], 9, 0x02441453);
    c = gg(c, d, a, b, x[15], 14, 0xd8a1e681);

    b = gg(b, c, d, a, x[4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[9], 5, 0x21e1cde6);
    d = gg(d, a, b, c, x[14], 9, 0xc33707d6);
    c = gg(c, d, a, b, x[3], 14, 0xf4d50d87);
    b = gg(b, c, d, a, x[8], 20, 0x455a14ed);
    a = gg(a, b, c, d, x[13], 5, 0xa9e3e905);
    d = gg(d, a, b, c, x[2], 9, 0xfcefa3f8);
    c = gg(c, d, a, b, x[7], 14, 0x676f02d9);
    b = gg(b, c, d, a, x[12], 20, 0x8d2a4c8a);

    a = hh(a, b, c, d, x[5], 4, 0xfffa3942);
    d = hh(d, a, b, c, x[8], 11, 0x8771f681);
    c = hh(c, d, a, b, x[11], 16, 0x6d9d6122);
    b = hh(b, c, d, a, x[14], 23, 0xfde5380c);
    a = hh(a, b, c, d, x[1], 4, 0xa4beea44);
    d = hh(d, a, b, c, x[4], 11, 0x4bdecfa9);
    c = hh(c, d, a, b, x[7], 16, 0xf6bb4b60);
    b = hh(b, c, d, a, x[10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, x[13], 4, 0x289b7ec6);
    d = hh(d, a, b, c, x[0], 11, 0xeaa127fa);
    c = hh(c, d, a, b, x[3], 16, 0xd4ef3085);
    b = hh(b, c, d, a, x[6], 23, 0x04881d05);
    a = hh(a, b, c, d, x[9], 4, 0xd9d4d039);
    d = hh(d, a, b, c, x[12], 11, 0xe6db99e5);
    c = hh(c, d, a, b, x[15], 16, 0x1fa27cf8);
    b = hh(b, c, d, a, x[2], 23, 0xc4ac5665);

    a = ii(a, b, c, d, x[0], 6, 0xf4292244);
    d = ii(d, a, b, c, x[7], 10, 0x432aff97);
    c = ii(c, d, a, b, x[14], 15, 0xab9423a7);
    b = ii(b, c, d, a, x[5], 21, 0xfc93a039);
    a = ii(a, b, c, d, x[12], 6, 0x655b59c3);
    d = ii(d, a, b, c, x[3], 10, 0x8f0ccc92);
    c = ii(c, d, a, b, x[10], 15, 0xffeff47d);
    b = ii(b, c, d, a, x[1], 21, 0x85845dd1);
    a = ii(a, b, c, d, x[8], 6, 0x6fa87e4f);
    d = ii(d, a, b, c, x[15], 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, x[6], 15, 0xa3014314);
    b = ii(b, c, d, a, x[13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, x[4], 6, 0xf7537e82);
    d = ii(d, a, b, c, x[11], 10, 0xbd3af235);
    c = ii(c, d, a, b, x[2], 15, 0x2ad7d2bb);
    b = ii(b, c, d, a, x[9], 21, 0xeb86d391);

    this.a = add(a, this.a);
    this.b = add(b, this.b);
    this.c = add(c, this.c);
    this.d = add(d, this.d);
  }
}
