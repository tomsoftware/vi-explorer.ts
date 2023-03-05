import { FolderItem } from '@/utilities/folder-item';
import { RemoteFileProvider } from '@/utilities/remote-file-porivder';
import { Options, Vue } from 'vue-class-component';

@Options({
})
export default class App extends Vue {
  public rootFolder = new FolderItem('');

  public async mounted() {
    // load file list form "public/test-files" folder
    const provider = new RemoteFileProvider('test-files');
    await provider.addToFolder('file-list.txt', this.rootFolder);
  }
}
