<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ViFile } from '@tomsoftware/vi-lib';
import FSFactory from '../services/fs-factory'

const props = defineProps<{ filePath: string }>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const abc = ref<string>('');

onMounted(async () => {
  try {
    const fs = await FSFactory.getInstance();
    const vf = await fs.readFile(props.filePath)
    if (vf) {
      const reader = new ViFile(vf)
      // For now dump some structure; refine later
      abc.value = props.filePath;
    }
  } catch (e) {
    abc.value = String(e);
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
      <pre>{{ abc ? abc : 'Lade...' }}</pre>
    </section>
  </div>
</template>

<style scoped>
.vi-header { display:flex; justify-content:space-between; align-items:center }
.vi-content { margin-top:1rem; padding:1rem }
</style>
