<template>

  <div v-if="reader!=null" class="viewer">
    <pre
      @wheel="onWheel($event)"
    >{{ hexData }}</pre>
    <div
      class="scroll-bar"
      @scroll="onScroll($event)"
      ref="scroll-bar"
    >
      <div
        class="scroll-bar-container"
      ></div>
    </div>
  </div>
</template>

<script src="./hex-view.ts"></script>

<style scoped lang="scss">
.viewer {
  border: 1px solid black;
  display: flex;
}

.scroll-bar {
  overflow-y: scroll;
  flex-grow: 0;
  flex-shrink: 0;
}

.scroll-bar-container {
  overflow: hidden;
  height: 1100%;
  border: 1px solid transparent;
}

</style>
