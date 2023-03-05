<template>

  <div v-if="folder!=null">
    {{folder.name}}

    <div
      class="file"
      v-for="f of folder.files"
      :key="f.name"
      @click="onSelectFile(f)"
      :class="{ 'selected':selected===f}"
    >
      [ {{f.name}} ]
    </div>

    <file-select
      class="folder"
      v-for="f of folder.folders"
      :key="f.name"
      :folder="f"
      :selected="selected"
      @select="onSelectFile($event)"
    />
  </div>
</template>

<script src="./file-select.ts"></script>

<style scoped lang="scss">
.folder {
  padding-left: 1em;
}

.file {
  color: darkblue;
  cursor: pointer;
}
.file:hover {
  background-color: lightgray;
}

.selected {
  font-weight: bold;
}
</style>
