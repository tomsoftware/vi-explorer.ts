<script setup lang="ts">
import { ref, watch } from 'vue';
import type { VirtualFS } from '@tomsoftware/virtual-fs';
import { IconReader, ViFile, ViPassword, ViSaveRecord } from '@tomsoftware/vi-lib';

const props = defineProps<{
  fs: VirtualFS;
  filePath: string;
}>();
const emit = defineEmits<{
  (e: 'open', path: string): void
  (e: 'close'): void
}>();

const size = ref<number | null>(null);
const img = ref<string | null>(null);
const passwordHash = ref<string>('');
const version = ref<string>('');
const libPasswordHash = ref<string>('');

/** Read and convert the icon from the VI */
function getIconImage(vi: ViFile): string | null {
    try {
      const iconReader = new IconReader(vi);
      const icon = iconReader.findIcon();
      return icon ? icon.generate() : null;

    } catch (e) {
      console.error(e);
    }

    return null;
}

/** Read password information */
function getPasswordInfo(vi: ViFile) {
  const viPassword = new ViPassword(vi);

  if (viPassword.fileHasPassword) {
    return viPassword.passwordHashHex;
  }

  return '';
}

/** Read / process all properties from VI */
async function loadFileProperties() {
  size.value = null

  try {
    const vf = await props.fs.readFile(props.filePath)

    if (!vf) {
      return;
    }

    const vi = new ViFile(vf);

    size.value = vf.length();
    img.value = getIconImage(vi);
    passwordHash.value = getPasswordInfo(vi);

    /** read the file version of the VI */
    const lvsr = new ViSaveRecord(vi);
    version.value = lvsr.fileVersion.toString() ;
    if (lvsr.fileHasLibraryPassword) {
      libPasswordHash.value = lvsr.libraryPasswordHashHex;
    }
    else {
      libPasswordHash.value = '';
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
    <p><strong>Size:</strong> {{ size ?? '-' }} bytes</p>
    <img v-if="img" :src="img" />

    <h3>VI Info</h3>
    <div class="vi-info">
      <p>
        <strong>Password:</strong> <i v-if="passwordHash === ''">not set</i>
        <span v-else>{{ passwordHash }}</span>
      </p>

      <p>
        <strong>Library Password:</strong> <i v-if="libPasswordHash === ''">not set</i>
        <span v-else>{{ libPasswordHash }}</span>
      </p>

      <p><strong>LabView Version:</strong> {{ version }}</p>
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
.vi-info { margin-left: 10pt}
</style>
