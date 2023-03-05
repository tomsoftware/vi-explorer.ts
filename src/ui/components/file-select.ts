import { FileItem } from '@/utilities/file-system-items';
import { FolderItem } from '@/utilities/folder-item';
import { Options, Vue } from 'vue-class-component';

@Options({
  name: 'FileSelect',
  components: {
  },
  emits: {
    select: Object
  },
  props: {
    // use | in filter to allow multiple filter patterns
    filter: String,
    folder: FolderItem,
    selected: Object
  }
})
export default class FileSelect extends Vue {
  public folder?: FolderItem;
  public selected?: FileItem;

  protected onSelectFile(file: FileItem) {
    this.$emit('select', file);
  }
}
