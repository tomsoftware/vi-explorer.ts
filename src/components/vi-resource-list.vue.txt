<template>
  <table v-if="vi != null">
    <tr>
      <th>Name</th>
      <th>Data<br />offset</th>
      <th>Header<br />offset</th>
      <th>Count</th>
      <th>INT1</th>
      <th>INT2</th>
      <th>INT3</th>
      <th>INT4</th>
    </tr>
    <tr
      v-for="r of resources"
      :key="r.headerOffset"
      :class="{ 'resource': true, 'selected':selected===r}"
      @click="onSelectResource(r)"
    >
      <td>{{ r.name }}</td>
      <td>{{ r.dataOffset }}</td>
      <td>{{ r.headerOffset }}</td>
      <td>{{ r.count }}</td>
      <td>{{ r.INT1 }}</td>
      <td>{{ r.INT2 }}</td>
      <td>{{ r.INT3 }}</td>
      <td>{{ r.INT4 }}</td>
    </tr>
  </table>
</template>

<script src="./vi-resource-list.ts"></script>

<style scoped lang="scss">
.resource {
  cursor: pointer;
}

.resource:hover {
  background-color: lightgray;
}

.selected {
  font-weight: bold;
}
</style>
