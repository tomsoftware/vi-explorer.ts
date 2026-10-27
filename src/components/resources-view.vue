<script setup lang="ts">
import { ViFile, ViResourceContainer } from '@tomsoftware/vi-lib';
import ViResourceTable from './vi-resource-table.vue';

const props = defineProps<{
  vi: ViFile | null;
}>();

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

  const hexEl = document.querySelector('hex-view') as any;
  if (hexEl && hexEl.setData) {
    hexEl.setData(data, `${container.name}`);
  }
}

</script>

<template>
  <div class="container-view">
    <div class="left">
      <ViResourceTable
        :vi="vi"
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
