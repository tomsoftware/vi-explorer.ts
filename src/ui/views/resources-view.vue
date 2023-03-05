<template>
  <div class="home">

    <div class="cell-left">
      <div class="resource-info">
        <div
            class="download"
            @click="$refs['dir-upload'].click()"
            title="upload directory"
        >📁</div>
        <input
          ref="dir-upload"
          style="display: none;"
          type="file"
          directory webkitdirectory multiple
          @change="selectFiles"
        />

        <div
            class="download"
            @click="$refs['files-upload'].click()"
            title="upload files"
        >📄</div>
        <input
          ref="files-upload"
          style="display: none;"
          type="file"
          multiple
          name="files[]"
          @change="selectFiles"
        />
      </div>

      <file-select
        class="file-select"
        :folder="rootFolder"
        :selected="selectedFile"
        @select="onSelectFile($event)"
      />

      <hr style="clear:both;" />

      <vi-resource-list
        :vi="vi"
        :selected="selectedResource"
        @select="onSelectResource($event)"
      />
    </div>

    <div class="cell-right">
      <label>
        do uncompress:
        <input type="checkbox" v-model="enableUnCompression" />
      </label>

      <div class="resource-info" v-if="resourceData">
        Length: {{resourceDataLength}}
        <div
          class="download"
          @click="downloadResource()"
          title="download"
        >💾</div>
      </div>

      <div v-if="resourceData" style="clear:both;">
        <hex-view
          :reader="resourceData"
        />
      </div>

    </div>
  </div>
</template>

<script src="./resources-view.ts"></script>

<style scoped lang="scss">
.file-select {
  width: 80%;
}

.cell-left {
  width: 30%;
  border-right: 1px solid gray;
  padding: 1em;
  overflow: scroll;
}

.cell-right {
  padding: 1em;
}

.home {
  display: flex;
  height: calc( 100vh - 3em);
}

.resource-info {
  float: right;
}

.download {
  cursor: pointer;
  display: inline-block;
}

</style>
