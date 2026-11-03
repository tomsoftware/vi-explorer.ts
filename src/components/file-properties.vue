<script setup lang="ts">
import { ref, watch } from 'vue';
import { IconReader, TerminalPattern, ViFile, ViPassword } from '@tomsoftware/vi-lib';
import { VirtualFS } from '@tomsoftware/virtual-fs';
import ResourcesView from './resources-view.vue';
import VctpTree from './vctp-tree.vue';
import Modal from './modal.vue';
import ParsingLogView from './parsing-log-view.vue';
import BlockDiagramView from './block-diagram-view.vue';

const props = defineProps<{
  filePath: string;
  fsPromise: Promise<VirtualFS>;
}>();

const emit = defineEmits<{
  (e: 'open', path: string): void
  (e: 'open-container', path: string): void
  (e: 'close'): void
}>();

type passwordInfos = {
  psw: string,
  hash: string
}

const showVctpTreeModal = ref<boolean>(false);
const showResourceTableModal = ref<boolean>(false);
const showParsingLogModal = ref<boolean>(false);
const showBlockDiagramModal = ref<boolean>(false);
const size = ref<number | null>(null);
const img = ref<string | null>(null);
const imgTerminal = ref<string | null>(null);
const passwordHash = ref<passwordInfos>({psw: '', hash: ''});
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

/** return a SVG image of the terminal pattern */
function getTerminalImage(vi: ViFile): string | null {
  const typeDef = vi.getTerminalDefinition();
  if (typeDef == null) {
    return null;
  }

  const pattern = new TerminalPattern();
  return pattern.toSvg(
    typeDef.terminalPattern, typeDef.terminalRotation, typeDef.terminalFlip,
    (index) => typeDef.children[index].target
  );
}

/** Read password information */
function getPasswordInfo(vi: ViFile): passwordInfos {
  const viPassword = new ViPassword(vi);

  const reCalculated = viPassword.calcHashesForFile();
  void reCalculated;

  if (viPassword.fileHasPassword) {
    return {
      psw: viPassword.passwordHashHex,
      hash: ''
    }
  }

  return {
    psw: '',
    hash: ''
  };
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
    description.value = viFile.getStringDescription().description.asUtf8;
    img.value = getIconImage(viFile);
    passwordHash.value = getPasswordInfo(viFile);

    imgTerminal.value = getTerminalImage(viFile);

    const lvsr = viFile.getSaveRecord();
    /** read the file version of the VI */
    version.value = viFile.version.toString();
    if (lvsr.fileHasLibraryPassword) {
      libPasswordHash.value = lvsr.libraryPasswordTohHex;
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
    /*
    const v = viFile.getVCTP();
    console.trace(v);
    const xml = v.toXml();
    console.trace(xml);
    */
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

function toViFile(o: any) {
   return o as unknown as ViFile;
}

</script>

<template>
  <div class="props">
    <h2>Properties</h2>
    <p><strong>Path:</strong> {{ props.filePath }}</p>
    <p><strong>Size:</strong> {{ size ?? '-' }} bytes</p>

    <img v-if="img" :src="img" />
    
    <div v-if="imgTerminal" v-html="imgTerminal"></div>

    <h3>VI Info</h3>
    <div class="vi-info">

      <p><strong>Description: </strong>{{ description }}</p>
      <p><strong>LabView Version: </strong>{{ version }}</p>

      <p>
        <strong>Password: </strong>
        <i v-if="passwordHash.psw === ''">not set</i>
        <span v-else>{{ passwordHash.psw }}</span>
      </p>

      <p>
        <strong>Library Password: </strong>
        <i v-if="libPasswordHash === ''">not set</i>
        <span v-else>{{ libPasswordHash }}</span>
      </p>

    </div>

    <div class="actions">
      <!--
      <button @click="openFile">Open</button>
      <button @click="openContainerView">Open Container View</button>
      <button @click="closeView">Close</button>
      -->
      <button @click="showVctpTreeModal=true">Type Definitions</button>
      <button @click="showResourceTableModal=true">Resource Table</button>
      <button @click="showParsingLogModal=true">Parsing log</button>
      <button @click="showBlockDiagramModal=true">Block Diagram</button>
    </div>

    <Modal
      v-if="vi"
      title="VI Resource Table"
      :show="showResourceTableModal"
      @on-close="showResourceTableModal = false"
    >
      <ResourcesView :vi="toViFile(vi)" />
    </Modal>

    <Modal
      v-if="vi"
      title="VCTP - VI Type Definitions"
      :show="showVctpTreeModal"
      @on-close="showVctpTreeModal = false"
    >
      <VctpTree :vi="toViFile(vi)" />
    </Modal>

    <Modal
      v-if="vi"
      title="Parsing log"
      :show="showParsingLogModal"
      @on-close="showParsingLogModal = false"
    >
      <ParsingLogView :vi="toViFile(vi)" />
    </Modal>

    <Modal
      v-if="vi"
      title="Block Diagram"
      :show="showBlockDiagramModal"
      @on-close="showBlockDiagramModal = false"
    >
      <BlockDiagramView :vi="toViFile(vi)" />
    </Modal>


  </div>
</template>

<style scoped>
.props { border:1px solid #ddd; padding:1rem; border-radius:6px }
.actions { margin-top:1rem; display:flex; gap:0.5rem }
pre { background:#f7f7f7; padding:0.5rem }
.vi-info { margin-left: 10pt}
</style>
