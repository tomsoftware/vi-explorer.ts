<script setup lang="ts">
import { computed } from 'vue';
import type { ViFile } from '@tomsoftware/vi-lib';

const props = defineProps<{
  vi: ViFile | null;
}>();

const xmlText = computed(() => {
  const vctp = props.vi?.getVCTP();
  return vctp ? vctp.toXml() : '';
});
</script>

<template>
  <div class="vctp-tree">
    <h3>VCTP</h3>

    <pre v-if="xmlText" class="xml-output">{{ xmlText }}</pre>
    <div v-else class="empty">No VCTP generated.</div>
  </div>
</template>

<style scoped>
.vctp-tree {
  margin-top: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
}

.xml-output {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
  font-size: 0.8rem;
  padding: 0.75rem;
  border-radius: 4px;
  overflow-x: auto;
}

.empty {
  color: #666;
}
</style>
