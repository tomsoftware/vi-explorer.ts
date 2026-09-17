<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ViFile, ViResourceContainer } from '@tomsoftware/vi-lib';
import ViResourceTable from '../components/vi-resource-table.vue';
import { VirtualFS } from '@tomsoftware/virtual-fs';

const props = defineProps<{
  path: string;
  fsPromise: Promise<VirtualFS>;
}>();

const vi = ref<ViFile | null>(null);

onMounted(async () => {
  if (!props.path) {
    return
  }

  const fs = await props.fsPromise;
  const vf = await fs.readFile(props.path);
  if (!vf) {
    return
  }

  const viFile = new ViFile(vf);
  vi.value = viFile;
})

async function selectContainer(container: ViResourceContainer) {
  if (!container) {
    return;
  }

  let reader = container.getReader(true, 0);
  if (!reader) {
    // fallback to uncompressed data
    reader = container.getReader(false, 0);
  }
  if (!reader) {
    return;
  }

  const len = typeof reader.length === 'function' ? reader.length() : 0;
  const data = reader.getBytes(0, len);

  const hexEl = document.querySelector('hex-view') as any
  if (hexEl && hexEl.setData) hexEl.setData(data, `${props.path}:${container.name}`)
}
</script>

<template>
  <div class="container-view">
    <div class="left">
      <h2>Resources for {{ props.path }}</h2>

      <ViResourceTable
        :vi="vi as unknown as ViFile"
        @selected="selectContainer"
      />
    </div>

    <div class="right">
      <hex-view class="hex-view"></hex-view>
    </div>
  </div>
</template>

<style scoped>
.container-view { display:flex; gap:1rem }
.left { width:40%; overflow:auto }
.right { flex:1 }
.hex-view { height:600px }
</style>
