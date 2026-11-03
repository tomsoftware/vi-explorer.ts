import { HeapFileVersion, HeapNode } from "./heap-storage/heap-node";
import { HeapImporter } from "./heap-storage/heap-importer";
import { ViFile } from "./vi-file";

export class ViBlockDiagram {
  public tree: HeapNode[] = [];

  public constructor(vi: ViFile) {
    const blockType = vi.getBlockDiagramType();
    if (blockType == null) {
      // no block diagram
      return;
    }

    const reader = vi.resources.getReaderByName(blockType.type, true);
    if (reader == null) {
      return;
    }

    this.tree = new HeapImporter(reader, ViBlockDiagram.name2Version(blockType.type)).roots;
  }

  private static name2Version(typeName: string) {
    if (typeName === 'BDHc') {
      return HeapFileVersion.C;
    }
    if (typeName === 'BDHb') {
      return HeapFileVersion.B;
    }

    return HeapFileVersion.A;
  }
}
