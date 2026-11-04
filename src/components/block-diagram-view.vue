<script setup lang="ts">
import { computed } from 'vue';
import { ViBlockDiagram, type ViFile } from '@tomsoftware/vi-lib';

const props = defineProps<{
  vi: ViFile | null;
}>();

const xmlText = computed(() => {
  if (props.vi == null) {
    return '';
  }
  const blockDiagram = new ViBlockDiagram(props.vi);
  const out = JSON.stringify(blockDiagram.tree, null, " ");
  return out;
});
</script>

<template>
  <div>
    <pre v-if="xmlText">{{ xmlText }}</pre>
    <div v-else>No Block Diagram.</div>
  </div>
</template>

<style scoped>

</style>
