import { Options, Vue } from 'vue-class-component';
import { FolderItem } from '@/utilities/folder-item';
import { FileItem } from '@/utilities/file-system-items';
import { ViFile } from '@/vi/vi-file';
import { ViResourceContainer } from '@/vi/vi-resource-container';
import { BinaryReader } from '@/utilities/binary-reader';
import { Utilities } from '@/utilities/utilities';
import { LocalFileProvider } from '@/utilities/local-file-provider';
import FileSelect from '@/ui/components/file-select.vue';
import ViResourceList from '@/ui/components/vi-resource-list.vue';
import HexView from '@/ui/components/hex-view.vue';

@Options({
  name: 'ResourcesView',
  components: {
    FileSelect,
    ViResourceList,
    HexView
  },
  props: {
    rootFolder: FolderItem
  }
})
export default class ResourcesView extends Vue {
  protected rootFolder!: FolderItem;
  protected vi: ViFile | null = null;
  protected selectedFile: FileItem | null = null;
  protected selectedResource: ViResourceContainer | null = null;
  protected resourceData: BinaryReader | null = null;
  protected enableUnCompression = false;

  protected get resourceDataLength() {
    return this.resourceData?.length;
  }

  public mounted() {
    this.$watch('enableUnCompression', () => {
      this.onSelectResource(this.selectedResource);
    });
  }

  protected async onSelectFile(file: FileItem) {
    this.selectedFile = file;
    this.resourceData = null;
    this.vi = new ViFile(await file.read());
  }

  protected onSelectResource(resource: ViResourceContainer | null) {
    this.selectedResource = resource;

    if (resource == null) {
      this.resourceData = null;
      return;
    }

    this.resourceData = resource.getReader(this.enableUnCompression);
  }

  protected downloadResource() {
    if ((this.resourceData == null) || (this.selectedResource == null)) {
      return;
    }

    this.resourceData.setOffset(0);
    const data = this.resourceData.readBuffer();
    Utilities.downloadFile(data, this.selectedResource.name);
  }

  protected selectFiles(e: Event) {
    if ((!e) || (!e.target) || (!this.rootFolder)) {
      return;
    }

    const files = (e.target as HTMLInputElement).files;
    if ((!files)) {
      return;
    }

    const provider = new LocalFileProvider();
    provider.addToFolder(files, this.rootFolder);
  }
}
