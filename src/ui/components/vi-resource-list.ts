import { ViFile } from '@/vi/vi-file';
import { ViResourceContainer } from '@/vi/vi-resource-container';
import { Options, Vue } from 'vue-class-component';

@Options({
  name: 'ViResourceList',
  components: {
  },
  emits: {
    select: Object
  },
  props: {
    vi: ViFile,
    selected: Object
  }
})
export default class ViResourceList extends Vue {
  public vi?: ViFile;
  public selected?: ViResourceContainer;

  public get resources(): ViResourceContainer[] {
    if ((this.vi == null) || (this.vi.resources == null)) {
      return [];
    }

    return this.vi.resources.resources;
  }

  protected onSelectResource(resource: ViResourceContainer) {
    this.$emit('select', resource);
  }
}
