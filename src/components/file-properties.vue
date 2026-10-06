<script setup lang="ts">
import { ref, watch } from 'vue';
import { IconReader, ViFile, ViPassword } from '@tomsoftware/vi-lib';
import ViResourceTable from './vi-resource-table.vue';
import { VirtualFS } from '@tomsoftware/virtual-fs';

const props = defineProps<{
  filePath: string;
  fsPromise: Promise<VirtualFS>;
}>();

const emit = defineEmits<{
  (e: 'open', path: string): void
  (e: 'open-container', path: string): void
  (e: 'close'): void
}>();

const size = ref<number | null>(null);
const img = ref<string | null>(null);
const passwordHash = ref<string>('');
const version = ref<string>('');
const libPasswordHash = ref<string>('');
const vi = ref<ViFile | null>(null);
const description = ref<string>('');

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
    const fs = await props.fsPromise;
    const vf = await fs.readFile(props.filePath);

    if (!vf) {
      return;
    }

    const viFile = new ViFile(vf);
    vi.value = viFile;

    size.value = vf.length();
    description.value = viFile.getStringDescription().description;
    img.value = getIconImage(viFile);
    passwordHash.value = getPasswordInfo(viFile);


    const lvsr = viFile.getSaveRecord();
    /** read the file version of the VI */
    version.value = viFile.version.toString();
    if (lvsr.fileHasLibraryPassword) {
      libPasswordHash.value = lvsr.libraryPasswordHashHex;
    }
    else {
      libPasswordHash.value = '';
    }
    
    /** test */
    /*
    const a = viFile.getLIvi();
    const b = viFile.getLIds();
    const c = viFile.getLIfp();
    const d = viFile.getLIbd();
    */
    const v = viFile.getVCTP();
    console.trace(v);
    const xml = v.toXml();
    console.trace(xml);
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

function openContainerView() {
  emit('open-container', props.filePath)
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

      <p><strong>Description: </strong>{{ description }}</p>
      <p><strong>LabView Version: </strong>{{ version }}</p>

      <p>
        <strong>Password: </strong>
        <i v-if="passwordHash === ''">not set</i>
        <span v-else>{{ passwordHash }}</span>
      </p>

      <p>
        <strong>Library Password: </strong>
        <i v-if="libPasswordHash === ''">not set</i>
        <span v-else>{{ libPasswordHash }}</span>
      </p>

    </div>

    <div class="actions">
      <button @click="openFile">Open</button>
      <button @click="openContainerView">Open Container View</button>
      <button @click="closeView">Close</button>
    </div>

    <ViResourceTable
      v-if="vi"
      :vi="vi as unknown as ViFile"
    />
  </div>
</template>

<style scoped>
.props { border:1px solid #ddd; padding:1rem; border-radius:6px }
.actions { margin-top:1rem; display:flex; gap:0.5rem }
pre { background:#f7f7f7; padding:0.5rem }
.vi-info { margin-left: 10pt}
</style>
