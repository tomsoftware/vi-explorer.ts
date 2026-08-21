<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FileProperties from '../components/file-properties.vue'
import ViFileView from './vi-file-view.vue'
import { VirtualFS, HttpFileProvider } from '@tomsoftware/virtual-fs'

const fs = new VirtualFS()
const path = ref<string>('')
const directories = ref<string[]>([])
const files = ref<string[]>([])
const fileSizes = ref<Record<string, number>>({})
const selectedFile = ref<string | null>(null)
const showProperties = ref(false)
const showViView = ref(false)
const openPath = ref<string | null>(null)

function joinPath(base: string, name: string) {
  if (!base) return name
  return `${base}/${name}`
}

async function loadPath(p: string) {
  path.value = p
  // get directories and files
  const dir_list = fs.getDirectories(p)
  const file_list = fs.getFiles(p)
  directories.value = dir_list || []
  files.value = file_list || []

  // compute sizes (reads files) — may be optimized later
  const sizes: Record<string, number> = {}
  for (const f of files.value) {
    try {
      const vf = await fs.readFile(joinPath(p, f))
      sizes[f] = vf ? vf.length() : 0
    } catch (e) {
      sizes[f] = 0
    }
  }
  fileSizes.value = sizes
  selectedFile.value = null
  showProperties.value = false
  showViView.value = false
}

function enterDirectory(name: string) {
  const np = joinPath(path.value, name)
  loadPath(np)
}

function goUp() {
  if (!path.value) return
  const parts = path.value.split('/')
  parts.pop()
  const np = parts.join('/')
  loadPath(np)
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

function closeViView() {
  showViView.value = false
  openPath.value = null
}

onMounted(async () => {
  const httpProvider = await HttpFileProvider.fromUrlList('test-files/', 'file-list.txt')
  fs.registerFileProvider(httpProvider)
  await loadPath('')
})
</script>

<template>
  <div class="root-grid">
    <div class="left">
      <header>
        <h1>vi-explorer.ts — Browser</h1>
        <div class="path-controls">
          <button @click="goUp" :disabled="!path">Up</button>
          <span class="current-path">{{ path || '/' }}</span>
        </div>
      </header>

      <section class="list">
        <ul>
          <li v-for="d in directories" :key="d" class="entry dir" @click="enterDirectory(d)">
            <span class="icon">📁</span>
            <span class="name">{{ d }}</span>
            <span class="size">—</span>
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
        <FileProperties :fs="fs" :filePath="selectedFile" @open="onOpenFile" @close="showProperties = false" />
      </div>

      <div v-if="showViView && openPath">
        <ViFileView :fs="fs" :filePath="openPath" @close="closeViView" />
      </div>

      <div v-if="!showProperties && !showViView" class="placeholder">
        <p>Select a file from file list.</p>
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
.left {
  border-right: 1px solid #ddd;
}
.right {
  padding: 1rem;
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
