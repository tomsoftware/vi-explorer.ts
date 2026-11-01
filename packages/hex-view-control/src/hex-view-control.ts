import { DownloadHelper } from './download-helper';

type ReadLogEntry = {
  length: number;
  label: string;
}

type MarkerRenderState = {
  leftBytes: number;
  marker: ReadLogEntry | undefined;
}

export class HexView extends HTMLElement {
  private data: Uint8Array = new Uint8Array(0);
  private fileName?: string;
  private markers = new Map<number, ReadLogEntry>();
  private bytesPerRow = 16;
  private rowHeight = 18; // font size dependent
  private container!: HTMLDivElement;
  private contentArea!: HTMLDivElement;
  private pre!: HTMLPreElement;
  private firstRow = 0;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.renderBase();
  }

  public setData(data: Uint8Array, fileName?: string) {
    this.data = data;
    this.fileName = fileName;

    this.updateElement('title', fileName);
    this.updateElement('size', data.length.toString());

    this.update();
  }

  public setMarkers(markers: Map<number, ReadLogEntry> | undefined) {
    this.markers = new Map(markers ?? []);
    this.update();
  }

  private updateElement(elementId: string, newValue?: string) {
    if (this.shadowRoot == null) {
      return;
    }

    const element = this.shadowRoot.getElementById(elementId);
    if (element == null) {
      return;
    }

    element.innerText = newValue ?? '';
  }

  private renderBase() {
    if (!this.shadowRoot) {
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          font-family: monospace;
          border: 1px solid #444;
          height: 400px;
          position: relative;
        }

        .menu-bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background-color: #333;
          border-bottom: 1px solid #444;
          padding: 5px;
          flex-shrink: 0;
          gap: 10px;
        }

        .menu-info {
          color: #aaa;
          font-size: 12px;
          white-space: nowrap;
        }

        .download-button {
          background-color: #555;
          border: 1px solid #888;
          color: #fff;
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }

        .download-button:hover {
          background-color: #666;
        }

        .content-area {
          flex: 1;
          overflow: auto;
          position: relative;
        }

        .spacer {
          position: relative;
          width: 100%;
        }

        pre {
          margin: 0;
          position: absolute;
          top: 0;
          left: 0;
          white-space: pre;
          font-size: 12px;
          line-height: 18px;
        }

        .byte,
        .ascii {
          display: inline-block;
          border-radius: 2px;
        }
      </style>

      <div class="menu-bar">
        <b>Name:</b> <span id="title"></span>
        <b>Size:</b> <span id="size"></span>
        <b>Position:</b> <span id="position" class="menu-info">-</span>
        <button class="download-button" title="Download">⬇</button>
      </div>
      <div class="content-area">
        <div class="spacer"></div>
        <pre></pre>
      </div>
    `;

    this.container = this.shadowRoot.querySelector('.spacer')!;
    this.pre = this.shadowRoot.querySelector('pre')!;
    this.contentArea = this.shadowRoot.querySelector('.content-area')!;

    const downloadButton = this.shadowRoot.querySelector('.download-button')!;
    downloadButton.addEventListener('click', () => {
      if (this.data == null) {
        return;
      }
      DownloadHelper.downloadBytes(this.data, this.fileName ?? 'data.bin');
    });

    this.contentArea.addEventListener('scroll', () => this.update());
    this.pre.addEventListener('mouseup', () => this.updatePosition());
    this.pre.addEventListener('keyup', () => this.updatePosition());
  }

  private update() {
    if (!this.container || !this.pre) {
      return;
    }

    const totalRows = Math.ceil(this.data.length / this.bytesPerRow);
    const totalHeight = totalRows * this.rowHeight;

    // set hight of hidden Placeholder
    this.container.style.height = totalHeight + 'px';

    // calculate visible space
    const scrollTop = this.contentArea.scrollTop;
    const viewHeight = this.clientHeight;

    this.firstRow = Math.floor(scrollTop / this.rowHeight);
    const visibleRows = Math.ceil(viewHeight / this.rowHeight) + 1;

    const start = this.firstRow * this.bytesPerRow;
    const end = Math.min(
      this.data.length,
      (this.firstRow + visibleRows) * this.bytesPerRow
    );

    // create Hex + ASCII
    let out = '';
    const markerState: MarkerRenderState = { leftBytes: 0, marker: undefined };
    for (let i = start; i < end; i += this.bytesPerRow) {
      const slice = this.data.slice(i, i + this.bytesPerRow);
      const row = this.renderMarkedRow(slice, i, markerState);
      // make every hex-line equal length
      const padding = ' '.repeat(((this.bytesPerRow - slice.length)* 3) + 2);
      // build one line
      out += row.hex + padding + row.ascii + '\n';
    }

    // set position of Pre-Element
    this.pre.style.transform = `translateY(${this.firstRow * this.rowHeight}px)`;
    this.pre.innerHTML = out;
  }

  private renderMarkedRow(
    bytes: Uint8Array,
    offset: number,
    state: MarkerRenderState
  ): { hex: string; ascii: string } {
    let hex = '';
    let ascii = '';
    let spanOpen = false;

    const openSpans = (marker: ReadLogEntry) => {
      const color = this.getMarkerColor(marker);
      const title = this.escapeHtml(marker.label);
      hex += `<span class="byte" title="${title}" style="background:${color};">`;
      ascii += `<span class="ascii" title="${title}" style="background:${color};">`;
      spanOpen = true;
    };

    if (state.leftBytes > 0 && state.marker != null) {
      openSpans(state.marker);
    }

    for (let index = 0; index < bytes.length; index++) {
      if (state.leftBytes <= 0) {
        if (spanOpen) {
          hex += '</span>';
          ascii += '</span>';
          spanOpen = false;
        }

        state.marker = this.markers.get(offset + index);
        state.leftBytes = Math.max(0, state.marker?.length ?? 0);
        if (state.leftBytes > 0 && state.marker != null) {
          openSpans(state.marker);
        }
      }

      const byte = bytes[index];

      hex += byte.toString(16).padStart(2, '0').toUpperCase();
      ascii += (byte >= 32 && byte <= 126) ? this.escapeHtml(String.fromCharCode(byte)) : '.';

      if (state.leftBytes > 0) {
        state.leftBytes--;
        if (state.leftBytes === 0) {
          hex += '</span>';
          ascii += '</span>';
          spanOpen = false;
          state.marker = undefined;
        }
      }

      hex += ' ';
    }

    if (spanOpen) {
      hex += '</span>';
      ascii += '</span>';
    }

    return { hex, ascii };
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]!);
  }

  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const letter = str.charCodeAt(i);
      if (letter === 64 /* 64 == '@' */) {
        break;
      }
      hash += (hash + letter) >>> 0;
      hash += (hash << 10);
      hash ^= (hash >> 6);
    }

    hash += (hash << 3);
    hash ^= (hash >> 11);
    hash += (hash << 15);

    return hash;
  }

  private getMarkerColor(marker: ReadLogEntry | undefined): string | null {
    if (marker == null) {
      return null;
    }

    let hash = HexView.hashString(marker.label);

    const hue = hash % 360;
    return `hsla(${hue}, 70%, 58%, 0.35)`;
  }

  private updatePosition() {
    if (this.shadowRoot == null) {
      return;
    }

    const positionDisplay = this.shadowRoot.getElementById('position');
    if (positionDisplay == null) {
      return;
    }

    const selection = HexView.getSelectedPosition(this.shadowRoot, this.pre);
    if (selection == null) {
      positionDisplay.innerText = '—';
      return;
    }

    // Calculate position in data:
    const fileOffset = (this.firstRow + selection.y) * this.bytesPerRow;
    const position = fileOffset + Math.floor(selection.x / 3);

    positionDisplay.innerText = `0x${position.toString(16).toUpperCase()} (${position})`;
  }


  private static getSelectedPosition(shadowRoot: ShadowRoot, baseElement: HTMLElement): { x: number; y: number } | null {
    const sel = (shadowRoot as any).getSelection() as Selection;
    if (!sel.rangeCount) {
      return null;
    }

    const range = sel.getRangeAt(0);

    // check if selection is inside pre
    if (!baseElement.contains(range.commonAncestorContainer)) {
        return null;
    }

    // create range from start to selection
    const r = document.createRange();
    r.selectNodeContents(baseElement);
    r.setEnd(range.startContainer, range.startOffset);

    const text = r.toString();

    return this.getLineAndColumn(text);
  }

  private static getLineAndColumn(text: string): { x: number; y: number } {
    let line = 0;
    let column = 0;

    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') {
        line++;
        column = 0;
      } else {
        column++;
      }
    }

    return { x: column, y: line };
  }


}

if (!customElements.get('hex-view')) {
  customElements.define('hex-view', HexView);
}
