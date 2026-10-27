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
  <div>
    <pre v-if="xmlText">{{ xmlText }}</pre>
    <div v-else>No VCTP generated.</div>
  </div>
</template>

<style scoped>

</style>
