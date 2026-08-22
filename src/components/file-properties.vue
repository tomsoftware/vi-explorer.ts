<script setup lang="ts">
import { ref, watch } from 'vue';
import type { VirtualFS } from '@tomsoftware/virtual-fs';
import { IconReader, ViFile } from '@tomsoftware/vi-lib';

const props = defineProps<{ 
  fs: VirtualFS;
  filePath: string 
}>();
const emit = defineEmits<{
  (e: 'open', path: string): void
  (e: 'close'): void
}>();

const size = ref<number | null>(null);
const img = ref<string | null>(null);

async function loadFileProperties() {
  size.value = null

  try {
    const vf = await props.fs.readFile(props.filePath)

    if (vf) {
      size.value = vf.length();

      try {
        const vi = new ViFile(vf);
        const iconReader = new IconReader(vi);
        const icon = iconReader.findIcon();
        img.value = icon ? icon.generate() : null;

      } catch (e) {

      }
    }
  } catch (e) {
    console.error(e);
  }
}

watch(
  () => props.filePath, loadFileProperties, { immediate: true }
);

function openFile() {
  emit('open', props.filePath)
}

function closeView() {
  emit('close')
}
</script>

<template>
  <div class="props">
    <h2>Properties</h2>
    <p><strong>Path:</strong> {{ props.filePath }}</p>
    <p><strong>Size:</strong> {{ size ?? '—' }} bytes</p>
    <img v-if="img" :src="img" />

    <div class="vi-info">
      <h3>VI Info</h3>

    </div>

    <div class="actions">
      <button @click="openFile">Open</button>
      <button @click="closeView">Close</button>
    </div>
  </div>
</template>

<style scoped>
.props { border:1px solid #ddd; padding:1rem; border-radius:6px }
.actions { margin-top:1rem; display:flex; gap:0.5rem }
pre { background:#f7f7f7; padding:0.5rem }
</style>
