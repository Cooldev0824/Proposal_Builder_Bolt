<template>
  <BaseElement
    :element="element"
    :isSelected="isSelected"
    :resizable="true"
    @update:element="handleElementUpdate"
    @click="handleElementClick"
  >
    <img
      :src="element.content"
      alt="Image"
      class="element-image"
      :style="imageStyle"
      @error="handleImageError"
    />
    <div v-if="!element.content || imageError" class="image-placeholder">
      <v-icon size="32" color="grey">mdi-image</v-icon>
      <span>No image selected</span>
    </div>
  </BaseElement>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DocumentElement } from '../../../types/document'
import BaseElement from './BaseElement.vue'

const props = defineProps<{
  element: DocumentElement
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'update:element', element: DocumentElement): void
}>()

const imageError = ref(false)

// New methods for BaseElement integration
function handleElementUpdate(updatedElement: DocumentElement) {
  emit('update:element', updatedElement)
}

function handleElementClick(event: MouseEvent) {
  // This is handled by the parent component
}

const imageStyle = computed(() => {
  return {
    objectFit: props.element.style?.objectFit || 'cover',
    display: imageError.value ? 'none' : 'block'
  }
})

function handleImageError() {
  imageError.value = true
}
</script>

<style scoped lang="scss">
.element-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  background-color: #f5f5f5;
}
</style>