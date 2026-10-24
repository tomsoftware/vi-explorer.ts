import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { BufferedFile } from '@tomsoftware/virtual-fs';
import { ViFile } from '../src/vi-file';
import { ViPassword } from '../src/vi-password';

const fixturePath = fileURLToPath(new URL('../../../public/test-files/86_test-vi-2.vi', import.meta.url));
const vi86FileBytes = new Uint8Array(readFileSync(fixturePath));

describe('ViFile loading / basic properties - v 8.6', () => {
  /** Check reading basic VI file with Version 8.6  */
  it('loads a VI file from disk into a ViFile instance', () => {
    // create VI file buffer
    const testViFile = new BufferedFile(vi86FileBytes, 'test.vi');

    expect(testViFile.length()).toBeGreaterThan(0);

    const vi = new ViFile(testViFile);

    expect(vi).toBeInstanceOf(ViFile);

    // tile
    expect(vi.fileName.asAscii).toBe('86_test-vi-2.vi');

    // check version
    expect(vi.version.compareTo(8, 6)).toBe(0);
    expect(vi.version.compareTo(8, 7)).toBeLessThan(0);
    expect(vi.version.compareTo(8, 5)).toBeGreaterThan(0);
  });

  /** Check the password calculation for a VI file with Version 8.6  */
  it('Check ViFile password for version 8.6', () => {
    const testViFile = new BufferedFile(vi86FileBytes, 'test.vi');

    const vi = new ViFile(testViFile);

    // password
    const protection = new ViPassword(vi);
    expect(protection.fileHasPassword).toBeTruthy();
    expect(protection.checkHashesAreValid()).toBeTruthy();

    const result = protection.calcHashesForPassword('psw');
    expect(result?.passwordHash?.toHex()).toBe('7bb483729b5a8e26f73e1831cde5b842');

    // check calc hash equals hash in file
    expect(result?.hash1?.toHex()).toBe(protection.bdpw.hash1.toHex());
    expect(result?.hash2?.toHex()).toBe(protection.bdpw.hash2.toHex());
    expect(result?.passwordHash?.toHex()).toBe(protection.bdpw.passwordHash.toHex());
  });

});
