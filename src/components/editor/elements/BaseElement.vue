<template>
  <div
    class="element"
    :class="[elementTypeClass, { selected: isSelected }]"
    :style="elementStyle"
    @mousedown.stop="handleElementMouseDown"
    @click.stop="handleElementClick"
  >
    <slot></slot>

    <!-- Resize handle (visible when selected) -->
    <div v-if="isSelected && resizable" class="resize-handle" @mousedown.stop="startResize"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { DocumentElement } from '../../../types/document';
import { useDocumentElement } from '../../../composables/useDocumentElement';

const props = defineProps<{
  element: DocumentElement;
  isSelected: boolean;
  resizable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:element', element: DocumentElement): void;
  (e: 'click', event: MouseEvent): void;
}>();

// Use the document element composable
const {
  elementStyle,
  isDragging,
  isResizing,
  startDrag,
  handleDrag,
  stopDrag,
  startResize: startResizeBase,
  handleResize,
  stopResize,
  updateElementPosition,
  updateElementSize
} = useDocumentElement(
  ref(props.element),
  {
    minWidth: 20,
    minHeight: 20,
    gridSize: 10,
    trackHistory: false
  }
);

const elementTypeClass = computed(() => {
  return `${props.element.type}-element`;
});

// Event handlers
function handleElementClick(event: MouseEvent) {
  emit('click', event);
}

function handleElementMouseDown(event: MouseEvent) {
  // Start dragging
  startDrag(event);

  // Add event listeners for drag
  document.addEventListener('mousemove', handleElementDrag);
  document.addEventListener('mouseup', handleElementMouseUp);
}

function startResize(event: MouseEvent) {
  // Start resizing
  startResizeBase(event);

  // Add event listeners for resize
  document.addEventListener('mousemove', handleElementResize);
  document.addEventListener('mouseup', handleElementMouseUp);

  // Prevent default to avoid text selection
  event.preventDefault();
}

function handleElementDrag(event: MouseEvent) {
  // Handle dragging
  const newPosition = handleDrag(event);

  // Update element
  const updatedElement = { ...props.element, position: newPosition };
  emit('update:element', updatedElement);
}

function handleElementResize(event: MouseEvent) {
  // Handle resizing
  const newSize = handleResize(event);

  // Update element
  const updatedElement = { ...props.element, size: newSize };
  emit('update:element', updatedElement);
}

function handleElementMouseUp() {
  // End dragging/resizing
  stopDrag();
  stopResize();

  // Remove event listeners
  document.removeEventListener('mousemove', handleElementDrag);
  document.removeEventListener('mousemove', handleElementResize);
  document.removeEventListener('mouseup', handleElementMouseUp);
}
</script>

<style scoped lang="scss">
// Base styles are imported from the global styles
</style>
