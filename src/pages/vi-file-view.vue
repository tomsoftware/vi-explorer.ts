<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { VirtualFS } from '@tomsoftware/virtual-fs';
import { ViFile } from '@tomsoftware/vi-lib';

const props = defineProps<{ fs: VirtualFS; filePath: string }>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const viJson = ref<any>(null)

onMounted(async () => {
  try {
    const vf = await props.fs.readFile(props.filePath)
    if (vf) {
      const reader = new ViFile(vf)
      // For now dump some structure; refine later
      viJson.value = {
        path: props.filePath,
        header: reader.resources?.resources ?? null }
    }
  } catch (e) {
    viJson.value = { error: String(e) }
  }
})

function closeView() {
  emit('close')
}
</script>

<template>
  <div class="vi-view">
    <div class="vi-header">
      <h2>VI File View</h2>
      <div class="actions">
        <button @click="closeView">Close</button>
      </div>
    </div>

    <section class="vi-content">
      <pre>{{ viJson ? JSON.stringify(viJson, null, 2) : 'Lade...' }}</pre>
    </section>
  </div>
</template>

<style scoped>
.vi-header { display:flex; justify-content:space-between; align-items:center }
.vi-content { margin-top:1rem; background:#f7f7f7; padding:1rem }
</style>
