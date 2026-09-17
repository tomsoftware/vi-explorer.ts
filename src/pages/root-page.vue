<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FileProperties from '../components/file-properties.vue';
import { useRouter } from 'vue-router';
import { Logger } from '@tomsoftware/logger';
import { LocalFileProvider, VirtualFS } from '@tomsoftware/virtual-fs';

const props = defineProps<{
  fsPromise: Promise<VirtualFS>;
  localProvider: LocalFileProvider;
}>();


const logger = new Logger('root-page');
const path = ref<string>('');
const directories = ref<string[]>([]);
const files = ref<string[]>([]);
const fileSizes = ref<Record<string, number>>({});
const selectedFile = ref<string | null>(null);
const showProperties = ref(false);
const showViView = ref(false);
const openPath = ref<string | null>(null);
const isDragging = ref(false);

function joinPath(base: string, name: string) {
  if (!base) return name
  return `${base}/${name}`
}

async function loadPath(p: string) {
  path.value = p;

  const fs = await props.fsPromise;

  const dirList = fs.getDirectories(p)
  const fileList = fs.getFiles(p)
  directories.value = dirList || []
  files.value = fileList || []

  const sizes: Record<string, number> = {}
  for (const f of files.value) {
    try {
      const vf = await fs.readFile(joinPath(p, f))
      sizes[f] = vf ? vf.length() : 0
    } catch(e) {
      logger.error('Fail to read files', e);
      sizes[f] = 0
    }
  }
  fileSizes.value = sizes
  selectedFile.value = null
  showProperties.value = false
  showViView.value = false
}

function enterDirectory(name: string) {
  const nextPath = joinPath(path.value, name)
  loadPath(nextPath)
}

function goUp() {
  if (!path.value) return
  const parts = path.value.split('/')
  parts.pop()
  const nextPath = parts.join('/')
  loadPath(nextPath)
}

function selectFile(name: string) {
  selectedFile.value = joinPath(path.value, name)
  showProperties.value = true
  showViView.value = false
}

function onOpenFile(p: string) {
  openPath.value = p
  showViView.value = true
  showProperties.value = false
}

async function addLocalFiles(fileList: FileList | File[]) {
  if (!fileList || fileList.length === 0) {
    return
  }

  props.localProvider.addFiles(fileList);
  await loadPath(path.value);
}

function triggerInput(inputName: 'files' | 'folder') {
  const selector = inputName === 'files' ? 'input[data-role=files-input]' : 'input[data-role=folder-input]'
  const input = document.querySelector(selector) as HTMLInputElement | null
  input?.click()
}

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) {
    return
  }

  void addLocalFiles(input.files)
  input.value = ''
}

function onFolderSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) {
    return
  }

  void addLocalFiles(input.files)
  input.value = ''
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave(event: DragEvent) {
  if (event.currentTarget instanceof HTMLElement && event.relatedTarget instanceof Node) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      isDragging.value = false
    }
    return
  }

  isDragging.value = false
}

async function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (!files || files.length === 0) {
    return
  }

  await addLocalFiles(files)
}

onMounted(async () => {
  await loadPath('');
})

const router = useRouter();

function onOpenContainer(p: string) {
  router.push({ name: 'container-view', query: { path: p } });
}
</script>

<template>
  <div
    class="root-grid"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    :class="{ dragging: isDragging }"
  >
    <div class="left">
      <header>
        <h1>vi-explorer.ts - Browser</h1>

        <div class="toolbar">
          <button type="button" @click="triggerInput('files')">Add Files</button>
          <button type="button" @click="triggerInput('folder')">Add Folder</button>
          <input data-role="files-input" type="file" multiple hidden @change="onFilesSelected" />
          <input data-role="folder-input" type="file" multiple hidden webkitdirectory directory @change="onFolderSelected" />
        </div>

        <div class="path-controls">
          <span class="current-path">{{ path || '/' }}</span>
        </div>
      </header>

      <section class="list">
        <ul>

          <li v-if="path" class="entry dir" @click="goUp()">
            <span class="icon">📁</span>
            <span class="name">..</span>
            <span class="size">-</span>
          </li>

          <li v-for="d in directories" :key="d" class="entry dir" @click="enterDirectory(d)">
            <span class="icon">📁</span>
            <span class="name">{{ d }}</span>
            <span class="size">-</span>
          </li>
          <li v-for="f in files" :key="f" class="entry file" @click="selectFile(f)">
            <span class="icon">📄</span>
            <span class="name">{{ f }}</span>
            <span class="size">{{ fileSizes[f] ?? 0 }} bytes</span>
          </li>
        </ul>
      </section>
    </div>

    <div class="right">
      <div v-if="showProperties && selectedFile">
        <FileProperties
          :filePath="selectedFile"
          :fsPromise="fsPromise"
          @open="onOpenFile"
          @open-container="onOpenContainer"
          @close="showProperties = false"
        />
      </div>

      <div v-if="showViView && openPath">
        show the file
      </div>

      <div v-if="!showProperties && !showViView" class="placeholder">
        <p>Select a file from the file list.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.root-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 1rem;
  padding: 1rem;
}
.root-grid.dragging {
  outline: 2px dashed #4b7bec;
  background: rgba(75, 123, 236, 0.05);
}
.left {
  border-right: 1px solid #ddd;
}
.right {
  padding: 1rem;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin: 0.75rem 0;
}
.list { max-height: 70vh; overflow: auto }
.entry { display:flex; gap:0.5rem; align-items:center; padding:0.4rem; cursor:pointer }
.entry:hover { background:Highlight }
.dir .icon { color: #d19a66 }
.file .icon { color: #6aa3d6 }
.name { flex:1 }
.size { color:#666; font-size:0.9rem }
.path-controls { display:flex; gap:1rem; align-items:center }
.current-path { font-weight:600 }
.placeholder { color:#666 }
</style>
