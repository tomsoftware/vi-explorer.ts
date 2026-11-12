import { Logger } from '@tomsoftware/logger';
import { ViDataReader } from '../vi-data-reader';
import { HeapFileVersion, HeapNode, HeapNodeScope } from './heap-node';
import { HeapContentDataType, HeapContentWrapper } from './heap-content-wrapper';
import { HeapNodeConstants } from './heap-node-constants';
import { HeapNodeBool } from './heap-node-bool';
import { HeapNodePStrList } from './heap-node-pstr-list';
import { HeapNodePoint } from './heap-node-point';
import { HeapNodeRect } from './heap-node-rect';
import { HeapNodeStdInt } from './heap-node-std-int';
import { HeapNodeString } from './heap-node-string';
import { HeapNodeTDDataFill } from './heap-node-td-data-fill';
import { HeapNodeTDDataFillLeaf } from './heap-node-td-data-fill-leaf';
import { HeapNodeTypeId } from './heap-node-type-id';
import { HeapNodeGeneric } from './heap-node-generic';
import { HeapAttribute } from './heap-attribute';

interface HeapReaders {
  containerReader: ViDataReader;
  dataReader: ViDataReader;
}

const RECT_TAGS = new Set([
  'bounds', 'contRect', 'dBounds', 'pBounds', 'hoodBounds', 'iconBounds', 'growAreaBounds',
  'docBounds', 'dynBounds', 'savedSize', 'termBounds',
]);
const POINT_TAGS = new Set(['origin', 'minPaneSize', 'minPanelSize', 'termHotPoint', 'MinButSize', 'nRC', 'oRC']);
const STRING_TAGS = new Set([
  'format', 'methName', 'nodeName', 'tagDLLName', 'DefaultData', 'PropItemName', 'plotName', 'name', 'tag', 'text',
]);
const TYPE_ID_TAGS = new Set(['typeDesc', 'histTD', 'connectorTM', 'omidTypeDesc', 'dataTypeDesc']);
const DATA_FILL_TAGS = new Set(['StdNumMin', 'StdNumMax', 'StdNumInc']);
const BOOL_TAGS = new Set([
  'FpgaEnableBoundsMux', 'left', 'right', 'up', 'down', 'menu', 'autoScaleLock', 'autoScale',
  'formatButton', 'fxpIsSigned', 'isBus',
]);
const STRING_ARRAY_TAGS = new Set(['strings', 'rowHeaders', 'columnHeaders', 'multiDimArrayElems']);
const INT_ARRAY_TAGS = new Set(['arrayIndices', 'arraySelectionStart', 'arraySelectionEnd', 'multiDimArraySizes']);
const STD_INT_TAGS = new Set([
  'activeMarker', 'partID', 'partOrder', 'objFlags', 'howGrow', 'masterPart', 'conId', 'dIdx',
  'dcoFiller', 'dsw', 'rsrcID', 'conNum', 'firstNodeIdx', 'graphType', 'GraphActivePlot',
  'GraphActivePort', 'GraphActiveCursor', 'GraphMinPlotNum', 'GVNGrowTerms', 'GVNMaxGrowTerms',
  'GVMinGVWidth', 'GVHoodTermWidth', 'MouseWheelSupport', 'SelectNRightType', 'refListLength',
  'hGrowNodeListLength', 'i', 'index', 'inplace', 'typeCode', 'gridFlags', 'state', 'treeFlags',
  'labelPosRow', 'labelPosCol', 'listboxFlags', 'lastSignalKind', 'methCode', 'numFrozenCols',
  'numFrozenRows', 'baseListboxDoubleClickedRow', 'baseListboxClickedColumnHeader', 'nMajDivs',
  'paramIdx', 'maxWordLength', 'override', 'overflow', 'quantize', 'shortCount', 'clumpNum',
  'termBMPs', 'termListLength', 'annexDDOFlag', 'paneFlags', 'parmIndex', 'primIndex', 'primResID',
  'paramTableOffset', 'cellPosRow', 'cellPosCol', 'selLabFlags', 'selLabData', 'tableFlags',
  'comboBoxIndex', 'tagType', 'FpgaImplementation', 'PropItemCode', 'variantIndex', 'scaleRMin32',
  'scaleRMax32', 'instrStyle', 'nVisItems', 'pRuntimeType',
]);

/** Parses A, B, or C binary heap data into a hierarchy of heap nodes. */
export class HeapImporter {
  private static readonly logging = new Logger('HeapImporter');

  public readonly roots: HeapNode[] = [];
  public readonly nodes: HeapNode[] = [];
  public readonly dataReader: ViDataReader | null = null;

  public constructor(reader: ViDataReader, formatVersion: HeapFileVersion) {
    HeapImporter.logging.log('Parsing ' + reader.getFilename() + ' heap version: ' + HeapFileVersion[formatVersion]);
    const readers = HeapImporter.createReaders(reader, formatVersion);
    if (readers != null) {
      this.dataReader = readers.dataReader;
      this.parse(readers.containerReader, this.dataReader, formatVersion);
    }
  }

  private static createReaders(reader: ViDataReader, formatVersion: HeapFileVersion): HeapReaders | null {
    reader.seek(0);

    if (formatVersion === HeapFileVersion.A) {
      return {
        containerReader: reader.createSubReader(0, reader.length()),
        dataReader: reader.createSubReader(reader.length(), 0),
      };
    }

    let containerOffset = 0;
    let containerSize = 0;
    let dataOffset = 0;
    let dataSize = 0;

    if (formatVersion === HeapFileVersion.B) {
      containerSize = reader.readUInt32BE('heap.header.containerSize');
      containerOffset = reader.tell();

      dataOffset = containerOffset + containerSize;
      dataSize = 0;
    }
    else if (formatVersion === HeapFileVersion.C) {
      const dataLengthOffset = reader.readUInt32BE('heap.header.dataLengthOffset');

      containerOffset = reader.tell();
      if (dataLengthOffset + 4 > reader.length()) {
        HeapImporter.logging.error(`Heap data-length header at ${dataLengthOffset} is outside the reader`);
        return null;
      }

      reader.seek(dataLengthOffset);
      dataSize = reader.readUInt32BE('heap.header.dataLength');
      dataOffset = dataLengthOffset - dataSize;

      containerSize = dataOffset - containerOffset;
    }
    else {
      HeapImporter.logging.error(`Unsupported heap format ${formatVersion}`);
      return null;
    }

    // checking consistency
    if (containerSize < 0 || dataSize < 0 || containerOffset + containerSize > reader.length() ||
      dataOffset < containerOffset + containerSize || dataOffset + dataSize > reader.length()) {
      HeapImporter.logging.error(
        `Invalid heap ranges (container ${containerOffset}+${containerSize}, data ${dataOffset}+${dataSize})`,
      );
      return null;
    }

    return {
      containerReader: reader.createSubReader(containerOffset, containerSize),
      dataReader: reader.createSubReader(dataOffset, dataSize),
    };
  }

  private parse(container: ViDataReader, data: ViDataReader, formatVersion: HeapFileVersion): void {
    let parent: HeapNode | null = null;
    let parents = new Map<HeapNode, HeapNode>();

    while (!container.eof()) {
      const offset = container.tell();
      if (container.leftLength() < 2) {
        HeapImporter.logging.error(`Incomplete heap tag header at offset ${offset}`);
        return;
      }

      const command = container.readUInt16BE('heap.tag.header');
      const contentDataType = ((command >> 13) & 7) as HeapContentDataType;
      const hasAttributes = (command >> 12) & 1;
      const scopeInfo = (command >> 10) & 3;
      const rawTagId = command & 0x3ff;

      if (scopeInfo > HeapNodeScope.TagClose) {
        HeapImporter.logging.error(`Unknown heap node scope ${scopeInfo} at offset ${offset}`);
        return;
      }

      let tagId: number;
      if (rawTagId === 0x3ff) {
        tagId = container.readUInt32BE('heap.tag.extendedId') | 0;
      }
      else {
        tagId = rawTagId - 31;
      }

      if (scopeInfo === HeapNodeScope.TagClose) {
        if (parent == null) {
          HeapImporter.logging.error(`Closing heap tag ${tagId} has no open parent at offset ${offset}`);
        } else {
          parent = parents.get(parent) ?? null;
        }
      }

      const node = HeapImporter.createNode(tagId, scopeInfo, offset, parent, parents);
      this.nodes.push(node);

      if (parent == null) {
        this.roots.push(node);
      } else {
        parents.set(node, parent);
        parent.children.push(node);
      }

      if (hasAttributes !== 0) {
        const attributeCount = container.readVariableUInt124('heap.attributes.count');
        if (attributeCount > container.leftLength()) {
          throw new RangeError(`Heap attribute count ${attributeCount} exceeds remaining input at offset ${offset}`);
        }

        for (let index = 0; index < attributeCount; index++) {
          const attributeId = container.readVariableInt124('heap.attribute.id');
          let value: number;
          //if ((index == 0) || (formatVersion != HeapFileVersion.C)) {
            value = container.readVariableInt24('heap.attribute.value');
          //}
          //else {
//            value = data.readVariableInt24('heap.attribute.value');
          //}
          node.attributes.push(new HeapAttribute(attributeId, value));
        }
      }

      const content = new HeapContentWrapper(contentDataType, container, offset);
      node.parseContent(content);

      if (scopeInfo === HeapNodeScope.TagOpen) {
        parent = node;
      }
    }
  }

  private static createNode(tagId: number, scopeInfo: number, offset: number, parent: HeapNode | null, parents: Map<HeapNode, HeapNode>): HeapNode {
    const tagName = HeapNodeConstants.getFieldNameByTypeId(tagId);
    if (RECT_TAGS.has(tagName)) {
      return new HeapNodeRect(tagId, scopeInfo, offset);
    }
    if (POINT_TAGS.has(tagName)) {
      return new HeapNodePoint(tagId, scopeInfo, offset);
    }
    if (STRING_TAGS.has(tagName)) {
      return new HeapNodeString(tagId, scopeInfo, offset);
    }
    if (TYPE_ID_TAGS.has(tagName)) {
      return new HeapNodeTypeId(tagId, scopeInfo, offset);
    }
    if (tagName === 'real' || tagName === 'imaginary') {
      return new HeapNodeTDDataFillLeaf(tagId, scopeInfo, offset);
    }
    if (DATA_FILL_TAGS.has(tagName)) {
      return new HeapNodeTDDataFill(tagId, scopeInfo, offset);
    }
    if (tagName === 'buf' && HeapImporter.parentClassName(parent, parents) === 'multiLabel') {
      return new HeapNodePStrList(tagId, scopeInfo, offset);
    }
    if (BOOL_TAGS.has(tagName)) {
      return new HeapNodeBool(tagId, scopeInfo, offset);
    }
    if (tagId === -6 && parent != null) {
      const parentParent = parents.get(parent) ?? null;
      if (STRING_ARRAY_TAGS.has(parent.tagName) ||
        (parent.tagName === 'baseListboxItemStrings' &&
          HeapImporter.parentClassName(parentParent, parents) === 'multiDimArray')) {
        return new HeapNodeString(tagId, scopeInfo, offset);
      }
      if (INT_ARRAY_TAGS.has(parent.tagName)) {
        return new HeapNodeStdInt(tagId, scopeInfo, offset);
      }
    }
    if (STD_INT_TAGS.has(tagName)) {
      return new HeapNodeStdInt(tagId, scopeInfo, offset);
    }

    // fallback
    return new HeapNodeGeneric(tagId, scopeInfo, offset);
  }

  private static parentClassName(node: HeapNode | null, parents: Map<HeapNode, HeapNode>): string | null {
    while (node != null) {
      const className = node.className;
      if (className != null) {
        return className;
      }
      node = parents.get(node) ?? null;
    }
    return null;
  }

}

export { HeapFileVersion as FileVersion };
