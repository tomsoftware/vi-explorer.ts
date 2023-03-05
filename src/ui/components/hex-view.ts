import { BinaryReader } from '@/utilities/binary-reader';
import { stringLiteral } from '@babel/types';
import { Options, Vue } from 'vue-class-component';

@Options({
  name: 'HexView',
  components: {
  },
  props: {
    reader: BinaryReader
  }
})
export default class HexView extends Vue {
  public reader?: BinaryReader;
  protected hexData = '';

  public mounted() {
    this.$watch('reader', () => {
      this.updateData(0);
    });

    this.updateData(0);
  }

  private updateData(offset: number) {
    if (this.reader == null) {
      return;
    }

    this.reader.setOffset((offset >> 5) << 5);
    let text = '';
    for (let i = 0; i < 20; i++) {
      const lineData = this.reader.readBuffer(32);
      let lineHex = '';
      let lineText = '';

      for (let j = 0; j < lineData.length; j++) {
        const c = lineData[j];

        lineHex = lineHex + ('00' + c.toString(16)).slice(-2) + ' ';

        if (c > 32) {
          lineText = lineText + String.fromCharCode(lineData[j]);
        } else {
          lineText = lineText + '·';
        }
      }

      text = text + lineHex.padEnd(32 * 3) + '\t' + lineText.padEnd(32) + '\n';
    }
    this.hexData = text;
  }

  protected onScroll(e: Event) {
    if (this.reader == null) {
      return;
    }

    const element = e.target as HTMLElement;
    if (element == null) {
      return;
    }
    const offsetFactor = element.scrollTop / element.clientHeight / 10;
    const offset = this.reader.length * offsetFactor;

    this.updateData(offset);
  }

  protected onWheel(e: WheelEvent) {
    if (e.deltaY == null) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    const scrollBarContainer = this.$refs['scroll-bar'] as HTMLElement;
    if (scrollBarContainer == null) {
      return;
    }

    scrollBarContainer.scrollBy(0, e.deltaY);
  }
}
