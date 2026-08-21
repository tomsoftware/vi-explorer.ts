<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { HttpFileProvider, VirtualFile, VirtualFS } from '@tomsoftware/virtual-fs';
import type { HexView } from '@tomsoftware/hex-view-control';
import { ViFile, ViResourceContainer } from '@tomsoftware/vi-lib';

const fs = new VirtualFS();
const filesize = ref<number>(0);
const hexView = ref<HexView | null>(null);
const fileList = ref<string[]>([]);
const filter = ref('');
const canvas = ref<HTMLCanvasElement | null>(null);
const selectedFile = ref<string | null>(null);

const fileListFiltered = computed(() => {
  if (!filter.value) {
    return fileList.value;
  }
  
  const filterValue = filter.value.toLowerCase();
  return fileList.value.filter(f => f.toLowerCase().indexOf(filterValue) >= 0)
});


function setHexViewValue(file: VirtualFile | null) {
  if ((hexView == null) || (hexView.value == null) || (file == null)) {
    return;
  }

  const data = file.getBytes(0, file?.length());
  hexView.value.setData(data, file.getFilename());
}

watch(selectedFile, async (fileName) => {
  if (fileName == null) {
    return;
  }

  const file = await fs.readFile(fileName);
  if (file == null) {
    console.error('File not found!');
    return;
  }

  console.log(file);

  const content = file;
  setHexViewValue(content);

  if ((content == null) || (canvas.value == null)) {
    return;
  }
});

onMounted(async () => {
  const httpProvider = await HttpFileProvider.fromUrlList('test-files/', 'file-list.txt')
  fs.registerFileProvider(httpProvider);

  const list = fs.getDirectories('');
  fileList.value = list;
 

  // pre selection
  selectedFile.value = fileList.value[0];
})

</script>

<template>
  File Browser
  <select v-model="selectedFile">
    <option v-for="fileName in fileListFiltered" :key="fileName">{{ fileName }}</option>
  </select>

  <input type="input" v-model="filter" placeholder="enter filter string" >

  <hex-view ref="hexView" class="hex-view"></hex-view>
 
  <canvas ref="canvas"></canvas>

</template>

<style scoped>
.hex-view {
  background-color: rgb(7, 7, 7);
  height: 500px;
}
</style>
