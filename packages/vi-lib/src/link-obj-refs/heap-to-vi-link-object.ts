import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ViVersion } from '../vi-version';
import { LinkObjectBase } from './link-object-base';
import { OffsetTypedLinkObject } from './offset-typed-link-object';

export abstract class HeapToViLinkObject extends OffsetTypedLinkObject {
  public viLSPathRef: LinkObjectBase | null = null;

  protected parseHeapToVILinkObject(reader: VirtualFile, version: ViVersion) {
    super.parseOffsetTypedLinkObject(reader, version);

    if (version.compareTo(8, 2) >= 0) {
        this.viLSPathRef = this.readPathRef(reader, version);
    }
  }

}