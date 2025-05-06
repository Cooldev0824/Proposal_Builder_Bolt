<template>
  <div class="property-group">
    <div class="property-group-title">Signature Properties</div>
    <v-text-field
      v-model.number="strokeWidth"
      label="Stroke Width"
      type="number"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateStrokeWidth"
    ></v-text-field>
    
    <v-text-field
      v-model="strokeColor"
      label="Stroke Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateStrokeColor"
    ></v-text-field>
    
    <v-btn block color="error" @click="clearSignature">
      Clear Signature
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DocumentElement } from '../../../types/document'

const props = defineProps<{
  element: DocumentElement
}>()

const emit = defineEmits<{
  (e: 'update:element', element: DocumentElement): void
}>()

const strokeWidth = ref(props.element.strokeWidth || 2)
const strokeColor = ref(props.element.strokeColor || '#000000')

watch(() => props.element, (newValue) => {
  strokeWidth.value = newValue.strokeWidth || 2
  strokeColor.value = newValue.strokeColor || '#000000'
}, { deep: true })

function updateElement(updates: Partial<DocumentElement>) {
  emit('update:element', {
    ...props.element,
    ...updates
  })
}

function updateStrokeWidth() {
  updateElement({ strokeWidth: strokeWidth.value })
}

function updateStrokeColor() {
  updateElement({ strokeColor: strokeColor.value })
}

function clearSignature() {
  updateElement({ paths: [] })
}
</script>