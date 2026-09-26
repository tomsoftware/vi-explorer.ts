<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ViFile, ViResourceContainer } from '@tomsoftware/vi-lib';

const props = defineProps<{
  vi: ViFile | null;
}>();

const emit = defineEmits<{
  selected: [container: ViResourceContainer]
}>()

const selectedIndex = ref<number | null>(null)

const containers = computed(() => props.vi?.resources?.resources ?? []);

function formatNumber(value: number | null | undefined): string {
  return value == null ? '-' : String(value);
}

function selectContainer(c: ViResourceContainer, idx: number) {
  selectedIndex.value = idx;
  emit('selected', c);
}

</script>

<template>
  <div class="resource-table">
    <div v-if="containers.length === 0" class="empty">
      No resource containers found.
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>Name</th>
          <th>Count</th>
          <th>Size</th>
          <th>Header Offset</th>
          <th>Data Offset</th>
          <th>INT1</th>
          <th>INT2</th>
          <th>INT3</th>
          <th>INT4</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(container, idx) in containers"
          :key="container.name + ':' + container.headerOffset"
          :class="{ selected: idx === selectedIndex }"
          @click="selectContainer(container, idx)"
        >
          <td>{{ container.name }}</td>
          <td>{{ formatNumber(container.count) }}</td>
          <td>{{ formatNumber(container.firstSize) }}</td>
          <td>{{ formatNumber(container.headerOffset) }}</td>
          <td>{{ formatNumber(container.dataOffset) }}</td>
          <td>{{ formatNumber(container.INT1) }}</td>
          <td>{{ formatNumber(container.INT2) }}</td>
          <td>{{ formatNumber(container.INT3) }}</td>
          <td>{{ formatNumber(container.INT4) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.resource-table {
  margin-top: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  border: 1px solid #ddd;
  padding: 0.4rem 0.5rem;
  text-align: left;
  vertical-align: top;
}

tr.selected { background:Highlight }

</style>
