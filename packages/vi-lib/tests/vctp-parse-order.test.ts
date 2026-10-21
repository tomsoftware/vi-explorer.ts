import { BufferedFile } from '@tomsoftware/virtual-fs';
import { describe, expect, it } from 'vitest';
import { ViVersion } from '../src/vi-version';
import { VCTP } from '../src/container/vctp';

describe('VCTP parsing order', () => {
  it('resets the reader to the top-level ID list after parsing type definitions', () => {
    const data = new Uint8Array([
      0x00, 0x00, 0x00, 0x01, // root object count: 1
      0x00, 0x08, 0x00, 0x00, // object length: 8, flags: 0, type: void
      0x00, 0x00, 0x00, 0x00, // object payload (4 bytes)
      0x00, 0x02,             // top-level ID-list count: 2
      0x00, 0x00,             // entry 1 -> flat index 0
      0x00, 0x00,             // entry 2 -> flat index 0
    ]);

    const reader = new BufferedFile(data, 'vctp-test');
    const vctp = new VCTP(reader, new ViVersion(0));

    expect(vctp.getById(1)).not.to.be.null;
    expect(vctp.getById(1)?.index).to.equal(0);
    expect(vctp.getById(2)).not.to.be.null;
    expect(vctp.getById(2)?.index).to.equal(0);
  });
});
