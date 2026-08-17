import { expect } from 'chai';
import { TestFileProvider } from '../utilities/test-file-provider';
import { BinaryReader } from '@/utilities/binary-reader';
import { ViFile } from '@/vi/vi-file';
import { BDHx } from '@/vi/container/bdhx';

describe('basic-block-diagram-reading', () => {
  let fileContent: Uint8Array;

  before(async() => {
    const fp = new TestFileProvider();
    // fileContent = await fp.loadBinary('test-files/icon_2012.vi');
    // fileContent = await fp.loadBinary('test-files/simple-add.vi');
    fileContent = await fp.loadBinary('test-files/simple-add.vi');
    expect(fileContent.length).to.be.greaterThan(1000);
  });

  it('Can read object tree', () => {
    expect(fileContent.length)
    // .withContext('No input file')
      .to.be.greaterThan(1000);

    const f = new BinaryReader(fileContent);
    const vi = new ViFile(f);

    if (vi.resources == null) {
      throw (new Error('Unable to open VI File!'));
    }

    const bdhx = new BDHx(vi.resources);
    console.log('\n' + bdhx.objectTree?.toString());
  });
});
