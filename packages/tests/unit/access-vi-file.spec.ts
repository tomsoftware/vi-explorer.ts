import { expect } from 'chai';
import { TestFileProvider } from '../utilities/test-file-provider';
import { BinaryReader } from '@/utilities/binary-reader';
import { ViFile } from '@/vi/vi-file';
import { BDPW } from '@/vi/container/bdpw';

describe('access-vi-files.ts', () => {
  let fileContent: Uint8Array;

  before(async() => {
    const fp = new TestFileProvider();
    fileContent = await fp.loadBinary('test-files/simple-add.vi');
    expect(fileContent.length).to.greaterThan(1000);
  });

  it('ViFile can open VI file and returns resources', () => {
    expect(fileContent.length)
      // .withContext('No input file')
      .to.be.greaterThan(1000);

    const f = new BinaryReader(fileContent);
    const vi = new ViFile(f);

    if (vi.resources == null) {
      throw (new Error('Unable to open VI File!'));
    }

    expect(vi.resources.resourceExists('BDPW'))
      // .withContext('Unable to find "BDPW" resource!')
      .to.equal(true);

    expect(vi.resources.resourceExists('FTAB'))
      // .withContext('Unable to find "FTAB" resource!')
      .to.equal(true);

    const psw = new BDPW(vi.resources);
    expect(psw.passwordMd5)
    // .withContext('Wrong Password hash')
      .to.equal('d41d8cd98f00b204e9800998ecf8427e');
  });
});
