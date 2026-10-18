import { describe, expect, it } from 'vitest';
import { Md5 } from './md5';
import { ByteString } from '@tomsoftware/virtual-fs';


describe('Md5', () => {
  it('hashes the empty string to the MD5 empty hash', () => {
    expect(Md5.hashString(ByteString.fromString('')).toHex()).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(Md5.empty.isEmpty).toBe(true);
  });

  it('hashes known text to the expected MD5 value', () => {
    expect(Md5.hashString(ByteString.fromString('hello')).toHex()).toBe('5d41402abc4b2a76b9719d911017c592');
    expect(Md5.hashString(ByteString.fromString('The quick brown fox jumps over the lazy dog')).toHex()).toBe('9e107d9d372bb6826bd81d3542a419d6');
  });

  it('supports buffer input and comparison', () => {
    const hash1 = Md5.hashString(ByteString.fromString('abc'));
    const hash2 = Md5.hashString(ByteString.fromString('abc'));
    const hash3 = Md5.hashString(ByteString.fromString('def'));

    expect(hash1.compare(hash2)).toBe(true);
    expect(hash1.compare(hash3)).toBe(false);
    expect(hash1.compare('900150983cd24fb0d6963f7d28e17f72')).toBe(true);
    expect(hash1.compare('invalid')).toBe(false);
  });

  it('supports streaming updates and invalid hashes', () => {
    const hash = Md5.stream()
      .update(ByteString.fromString('abc').buffer)
      .finalize();

    expect(hash.isValid).toBe(true);
    expect(hash.toHex()).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(Md5.invalid.isValid).toBe(false);
    expect(Md5.invalid.toHex()).toBe('');
  });

  it('returns correct for empty', () => {
    const hash = Md5.stream()
      .update(new Uint8Array(0))
      .update(new Uint8Array(0))
      .finalize();

    expect(hash.isValid).toBe(true);
    expect(hash.toHex()).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('returns correct md5 for long streaming input', () => {
    const testStr = ByteString.fromString('The quick brown fox jumps over the lazy dog.').buffer;

    const hash = Md5.stream()
      .update(testStr)
      .update(testStr)
      .update(testStr)
      .update(testStr)
      .finalize();

    expect(hash.isValid).toBe(true);
    expect(hash.toHex()).toBe('a1299363b9188a40cf9524e7490ff1eb');
  });
});
