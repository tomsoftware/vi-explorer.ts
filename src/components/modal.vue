<script setup lang="ts">
import { computed, useId } from 'vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    show?: boolean | string;
  }>(),
  {
    title: 'Dialog',
    show: false,
  }
);

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'onClose'): void;
  (event: 'onClone'): void;
  (event: 'update:show', value: boolean): void;
}>();

const titleId = useId();

const isVisible = computed(() => {
  if (props.show === true || props.show === 'true' || props.show === '') {
    return true;
  }

  if (props.show === false || props.show === 'false') {
    return false;
  }

  return !!props.show;
});

function closeModal() {
  emit('close');
  emit('onClose');
  emit('onClone');
  emit('update:show', false);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="modal-backdrop"
      @click.self="closeModal"
    >
      <div
        class="modal-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div class="modal-header">
          <h3 :id="titleId" class="modal-title">{{ title }}</h3>
          <button
            type="button"
            class="modal-close"
            aria-label="Close"
            @click="closeModal"
          >
            ×
          </button>
        </div>

        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-modal-backdrop);
  backdrop-filter: blur(2px);
}

.modal-dialog {
  width: calc(100vw - 2rem);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-background-subtle);
  border-radius: 10px;
  box-shadow: 0 18px 40px  var(--color-background-subtle);
  border: 1px solid var(--color-border);
}

.modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.2rem 1rem;
  background: var(--color-background-emphasized);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.modal-close {
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  background: transparent;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  min-height: 0;
  overflow-y: auto;
  padding: 1rem;
}

</style>
