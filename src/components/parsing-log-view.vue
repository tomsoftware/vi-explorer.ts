<script setup lang="ts">
import { ViFile } from '@tomsoftware/vi-lib';
import { computed, ref } from 'vue';

const props = defineProps<{
  vi: ViFile | null;
}>();

const hexViewRef = ref<any | null>(null);
const selectedLogEntry = ref<{ name: string; logger: any } | null>(null);
const logEntries = computed(() => props.vi?.logManager?.entries?.() ?? []);

function selectLogEntry(entry: { name: string; logger: any }) {
  selectedLogEntry.value = entry;

  const hexEl = hexViewRef.value as any;
  if (hexEl == null) {
    return;
  }

  const data = typeof entry.logger.getData === 'function'
    ? entry.logger.getData()
    : entry.logger.reader.getBytes(0, entry.logger.reader.length());

  hexEl.setData(data, entry.name);
  hexEl.setMarkers(entry.logger.readLog ?? new Map());
}


</script>

<template>
  <div class="container-view">
    <div class="left">

      <ul class="read-log-list">
        <li
          v-for="entry in logEntries"
          :key="entry.name"
          :class="{ selected: selectedLogEntry?.name === entry.name }"
          @click="selectLogEntry(entry)"
        >
          {{ entry.name }}
        </li>
      </ul>

    </div>

    <div class="right">
      <hex-view class="hex-view" ref="hexViewRef"></hex-view>
    </div>
  </div>
</template>

<style scoped>
.container-view { display:flex; gap:1rem }
.left { width:40%; overflow:auto }
.right { flex:1 }
.hex-view { height:600px }
li:hover { background-color: var(--hover-background-color);}
li.selected { background: var(--selection-background-color); }

li { cursor: pointer; }
</style>
