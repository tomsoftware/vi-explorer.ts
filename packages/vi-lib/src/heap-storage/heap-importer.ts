import { Logger } from "@tomsoftware/logger";
import { ViDataReader } from "../vi-data-reader";
import { HeapFileVersion, HeapNode, HeapNodeScope } from "./heap-node";
import { HeapNodeConstants } from "./heap-node-constants";
import { HeapNodeBool } from "./heap-node-bool";
import { HeapNodePStrList } from "./heap-node-pstr-list";
import { HeapNodePoint } from "./heap-node-point";
import { HeapNodeRect } from "./heap-node-rect";
import { HeapNodeStdInt } from "./heap-node-std-int";
import { HeapNodeString } from "./heap-node-string";
import { HeapNodeTDDataFill } from "./heap-node-td-data-fill";
import { HeapNodeTDDataFillLeaf } from "./heap-node-td-data-fill-leaf";
import { HeapNodeTypeId } from "./heap-node-type-id";

interface HeapReaders {
  container: ViDataReader;
  data: ViDataReader;
}

const RECT_TAGS = new Set([
  "bounds", "contRect", "dBounds", "pBounds", "hoodBounds", "iconBounds", "growAreaBounds",
  "docBounds", "dynBounds", "savedSize", "termBounds",
]);
const POINT_TAGS = new Set(["origin", "minPaneSize", "minPanelSize", "termHotPoint", "MinButSize", "nRC", "oRC"]);
const STRING_TAGS = new Set([
  "format", "methName", "nodeName", "tagDLLName", "DefaultData", "PropItemName", "plotName", "name", "tag", "text",
]);
const TYPE_ID_TAGS = new Set(["typeDesc", "histTD", "connectorTM", "omidTypeDesc", "dataTypeDesc"]);
const DATA_FILL_TAGS = new Set(["StdNumMin", "StdNumMax", "StdNumInc"]);
const BOOL_TAGS = new Set([
  "FpgaEnableBoundsMux", "left", "right", "up", "down", "menu", "autoScaleLock", "autoScale",
  "formatButton", "fxpIsSigned", "isBus",
]);
const STRING_ARRAY_TAGS = new Set(["strings", "rowHeaders", "columnHeaders", "multiDimArrayElems"]);
const INT_ARRAY_TAGS = new Set(["arrayIndices", "arraySelectionStart", "arraySelectionEnd", "multiDimArraySizes"]);
const STD_INT_TAGS = new Set([
  "activeMarker", "partID", "partOrder", "objFlags", "howGrow", "masterPart", "conId", "dIdx",
  "dcoFiller", "dsw", "rsrcID", "conNum", "firstNodeIdx", "graphType", "GraphActivePlot",
  "GraphActivePort", "GraphActiveCursor", "GraphMinPlotNum", "GVNGrowTerms", "GVNMaxGrowTerms",
  "GVMinGVWidth", "GVHoodTermWidth", "MouseWheelSupport", "SelectNRightType", "refListLength",
  "hGrowNodeListLength", "i", "index", "inplace", "typeCode", "gridFlags", "state", "treeFlags",
  "labelPosRow", "labelPosCol", "listboxFlags", "lastSignalKind", "methCode", "numFrozenCols",
  "numFrozenRows", "baseListboxDoubleClickedRow", "baseListboxClickedColumnHeader", "nMajDivs",
  "paramIdx", "maxWordLength", "override", "overflow", "quantize", "shortCount", "clumpNum",
  "termBMPs", "termListLength", "annexDDOFlag", "paneFlags", "parmIndex", "primIndex", "primResID",
  "paramTableOffset", "cellPosRow", "cellPosCol", "selLabFlags", "selLabData", "tableFlags",
  "comboBoxIndex", "tagType", "FpgaImplementation", "PropItemCode", "variantIndex", "scaleRMin32",
  "scaleRMax32", "instrStyle", "nVisItems", "pRuntimeType",
]);

/** Parses A, B, or C binary heap data into a hierarchy of heap nodes. */
export class HeapImporter {
  private static readonly logging = new Logger("HeapImporter");

  public readonly roots: HeapNode[] = [];
  public readonly nodes: HeapNode[] = [];
  public readonly dataReader: ViDataReader | null = null;

  public constructor(reader: ViDataReader, version: HeapFileVersion) {
    const readers = HeapImporter.createReaders(reader, version);
    if (readers != null) {
      this.dataReader = readers.data;
      this.parse(readers.container);
    }
  }

  private static createReaders(reader: ViDataReader, version: HeapFileVersion): HeapReaders | null {
    reader.seek(0);

    if (version === HeapFileVersion.A) {
      return {
        container: reader.createSubReader(0, reader.length()),
        data: reader.createSubReader(reader.length(), 0),
      };
    }

    let containerStart = 0;
    let containerLength = 0;
    let dataStart = 0;
    let dataLength = 0;

    if (version === HeapFileVersion.B) {
      containerLength = reader.readUInt32BE("heap.header.containerLength");
      containerStart = reader.tell();
      dataStart = containerStart + containerLength;
    } else if (version === HeapFileVersion.C) {
      const dataEnd = reader.readUInt32BE("heap.header.dataEnd");
      containerStart = reader.tell();
      if (dataEnd + 4 > reader.length()) {
        HeapImporter.logging.error(`Heap data-length header at ${dataEnd} is outside the reader`);
        return null;
      }

      reader.seek(dataEnd);
      dataLength = reader.readUInt32BE("heap.header.dataLength");
      dataStart = dataEnd - dataLength;
      containerLength = dataStart - containerStart;
    } else {
      HeapImporter.logging.error(`Unsupported heap format ${version}`);
      return null;
    }

    if (containerLength < 0 || dataLength < 0 || containerStart + containerLength > reader.length() ||
      dataStart < containerStart + containerLength || dataStart + dataLength > reader.length()) {
      HeapImporter.logging.error(
        `Invalid heap ranges (container ${containerStart}+${containerLength}, data ${dataStart}+${dataLength})`,
      );
      return null;
    }

    return {
      container: reader.createSubReader(containerStart, containerLength),
      data: reader.createSubReader(dataStart, dataLength),
    };
  }

  private parse(container: ViDataReader): void {
    let parent: HeapNode | null = null;

    while (container.leftLength() > 0) {
      const offset = container.tell();
      if (container.leftLength() < 2) {
        HeapImporter.logging.error(`Incomplete heap tag header at offset ${offset}`);
        return;
      }

      const command = container.readUInt16BE("heap.tag.header");
      const sizeSpec = (command >> 13) & 7;
      const hasAttributes = (command >> 12) & 1;
      const scopeInfo = (command >> 10) & 3;
      const rawTagId = command & 0x3ff;

      if (scopeInfo > HeapNodeScope.TagClose) {
        HeapImporter.logging.error(`Unknown heap node scope ${scopeInfo} at offset ${offset}`);
        return;
      }

      let tagId = rawTagId - 31;
      if (rawTagId === 0x3ff) {
        tagId = container.readUInt32BE("heap.tag.extendedId") | 0;
      }

      if (scopeInfo === HeapNodeScope.TagClose) {
        if (parent == null) {
          HeapImporter.logging.error(`Closing heap tag ${tagId} has no open parent at offset ${offset}`);
        } else {
          parent = parent.parent;
        }
      }

      const node = HeapImporter.createNode(tagId, scopeInfo, offset, parent);
      this.nodes.push(node);
      if (parent == null) {
        this.roots.push(node);
      } else {
        parent.children.push(node);
      }

      if (hasAttributes !== 0) {
        const attributeCount = HeapImporter.readVariableUInt124(container, "heap.attributes.count");
        if (attributeCount > container.leftLength()) {
          throw new RangeError(`Heap attribute count ${attributeCount} exceeds remaining input at offset ${offset}`);
        }

        for (let index = 0; index < attributeCount; index++) {
          const attributeId = HeapImporter.readVariableInt124(container, "heap.attribute.id");
          const value = HeapImporter.readVariableInt24(container, "heap.attribute.value");
          node.attributes.set(attributeId, value);
        }
      }

      if (sizeSpec === 0) {
        node.content = false;
      } else if (sizeSpec === 7) {
        node.content = true;
      } else if (sizeSpec >= 1 && sizeSpec <= 4) {
        node.content = container.readBytes(sizeSpec, "heap.node.content");
      } else if (sizeSpec === 6) {
        const contentLength = HeapImporter.readVariableUInt124(container, "heap.node.contentLength");
        if (contentLength > container.leftLength()) {
          throw new RangeError(`Heap node content length ${contentLength} exceeds remaining input at offset ${offset}`);
        }
        node.content = container.readBytes(contentLength, "heap.node.content");
      } else {
        HeapImporter.logging.error(`Unexpected heap node size specification ${sizeSpec} at offset ${offset}`);
        node.content = null;
      }

      const contentReader = container.createNew(
        node.content instanceof Uint8Array ? node.content : new Uint8Array(0),
        `${container.getFilename()}:heap-node-${offset}`,
      );

      node.parseContent(contentReader);

      if (scopeInfo === HeapNodeScope.TagOpen) {
        parent = node;
      }
    }
  }

  private static createNode(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null): HeapNode {
    const tagName = HeapNodeConstants.getFieldNameById(tagId);
    if (RECT_TAGS.has(tagName)) {
      return new HeapNodeRect(tagId, scopeInfo, offset, parent);
    }
    if (POINT_TAGS.has(tagName)) {
      return new HeapNodePoint(tagId, scopeInfo, offset, parent);
    }
    if (STRING_TAGS.has(tagName)) {
      return new HeapNodeString(tagId, scopeInfo, offset, parent);
    }
    if (TYPE_ID_TAGS.has(tagName)) {
      return new HeapNodeTypeId(tagId, scopeInfo, offset, parent);
    }
    if (tagName === "real" || tagName === "imaginary") {
      return new HeapNodeTDDataFillLeaf(tagId, scopeInfo, offset, parent);
    }
    if (DATA_FILL_TAGS.has(tagName)) {
      return new HeapNodeTDDataFill(tagId, scopeInfo, offset, parent);
    }
    if (tagName === "buf" && HeapImporter.parentClassName(parent) === "multiLabel") {
      return new HeapNodePStrList(tagId, scopeInfo, offset, parent);
    }
    if (BOOL_TAGS.has(tagName)) {
      return new HeapNodeBool(tagId, scopeInfo, offset, parent);
    }
    if (tagId === -6 && parent != null) {
      if (STRING_ARRAY_TAGS.has(parent.tagName) ||
        (parent.tagName === "baseListboxItemStrings" &&
          HeapImporter.parentClassName(parent.parent) === "multiDimArray")) {
        return new HeapNodeString(tagId, scopeInfo, offset, parent);
      }
      if (INT_ARRAY_TAGS.has(parent.tagName)) {
        return new HeapNodeStdInt(tagId, scopeInfo, offset, parent);
      }
    }
    if (STD_INT_TAGS.has(tagName)) {
      return new HeapNodeStdInt(tagId, scopeInfo, offset, parent);
    }
    return new HeapNode(tagId, scopeInfo, offset, parent);
  }

  private static parentClassName(node: HeapNode | null): string | null {
    while (node != null) {
      const classId = node.attributes.get(-2);
      if (classId != null) {
        const className = HeapNodeConstants.getClassNameById(classId);
        return className.slice(className.indexOf(":") + 1);
      }
      node = node.parent;
    }
    return null;
  }

  private static readVariableUInt124(reader: ViDataReader, label: string): number {
    const value = reader.readByte(label);
    if (value === 0xff) {
      return reader.readUInt16BE(`${label}.extended16`);
    }
    if (value === 0xfe) {
      return reader.readUInt32BE(`${label}.extended32`);
    }
    return value;
  }

  private static readVariableInt124(reader: ViDataReader, label: string): number {
    const value = reader.readByte(label);
    if (value === 0x80) {
      const extended = reader.readUInt16BE(`${label}.extended16`);
      return extended > 0x7fff ? extended - 0x10000 : extended;
    }
    if (value === 0x81) {
      return reader.readUInt32BE(`${label}.extended32`) | 0;
    }
    return value > 0x7f ? value - 0x100 : value;
  }

  private static readVariableInt24(reader: ViDataReader, label: string): number {
    const value = reader.readUInt16BE(label);
    if (value !== 0x8000) {
      return value > 0x7fff ? value - 0x10000 : value;
    }
    return reader.readUInt32BE(`${label}.extended32`) | 0;
  }
}

export { HeapFileVersion as FileVersion };
