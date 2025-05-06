<template>
  <div class="property-group">
    <div class="property-group-title">Shape Properties</div>
    
    <v-select
      v-model="shapeType"
      label="Shape Type"
      :items="shapeTypes"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateShapeType"
    ></v-select>
    
    <template v-if="shapeType === 'line'">
      <v-select
        v-model="lineStyle"
        label="Line Style"
        :items="['solid', 'dashed', 'dotted']"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-4"
        @update:model-value="updateLineStyle"
      ></v-select>
      
      <v-text-field
        v-model.number="strokeWidth"
        label="Line Width"
        type="number"
        min="1"
        max="20"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-4"
        @update:model-value="updateStrokeWidth"
      ></v-text-field>
      
      <v-text-field
        v-model="strokeColor"
        label="Line Color"
        type="color"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-4"
        @update:model-value="updateStrokeColor"
      ></v-text-field>
    </template>
    
    <template v-else>
      <v-text-field
        v-model="fillColor"
        label="Fill Color"
        type="color"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-4"
        @update:model-value="updateFillColor"
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
      
      <v-text-field
        v-model.number="strokeWidth"
        label="Stroke Width"
        type="number"
        min="0"
        max="20"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-4"
        @update:model-value="updateStrokeWidth"
      ></v-text-field>
      
      <template v-if="shapeType === 'rectangle'">
        <v-text-field
          v-model.number="borderRadius"
          label="Border Radius"
          type="number"
          min="0"
          density="compact"
          variant="outlined"
          hide-details
          class="mb-4"
          @update:model-value="updateBorderRadius"
        ></v-text-field>
      </template>
    </template>
    
    <v-slider
      v-model="opacity"
      label="Opacity"
      min="0"
      max="1"
      step="0.1"
      density="compact"
      hide-details
      class="mb-4"
      @update:model-value="updateOpacity"
    ></v-slider>
    
    <v-slider
      v-model="rotation"
      label="Rotation"
      min="0"
      max="360"
      step="1"
      density="compact"
      hide-details
      class="mb-4"
      @update:model-value="updateRotation"
    >
      <template v-slot:append>
        <v-text-field
          v-model="rotation"
          type="number"
          style="width: 70px"
          density="compact"
          hide-details
          variant="outlined"
          @update:model-value="updateRotation"
        ></v-text-field>
      </template>
    </v-slider>
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

const shapeTypes = ['rectangle', 'circle', 'triangle', 'arrow', 'line']
const shapeType = ref(props.element.content || 'rectangle')
const fillColor = ref(props.element.style?.fill || '#E2E8F0')
const strokeColor = ref(props.element.style?.stroke || '#CBD5E1')
const strokeWidth = ref(props.element.style?.strokeWidth || 1)
const opacity = ref(props.element.style?.opacity || 1)
const borderRadius = ref(props.element.style?.borderRadius || 0)
const lineStyle = ref(props.element.style?.lineStyle || 'solid')
const rotation = ref(props.element.style?.rotation || 0)

watch(() => props.element, (newValue) => {
  shapeType.value = newValue.content || 'rectangle'
  fillColor.value = newValue.style?.fill || '#E2E8F0'
  strokeColor.value = newValue.style?.stroke || '#CBD5E1'
  strokeWidth.value = newValue.style?.strokeWidth || 1
  opacity.value = newValue.style?.opacity || 1
  borderRadius.value = newValue.style?.borderRadius || 0
  lineStyle.value = newValue.style?.lineStyle || 'solid'
  rotation.value = newValue.style?.rotation || 0
}, { deep: true })

function updateElement(updates: Partial<typeof props.element.style>) {
  emit('update:element', {
    ...props.element,
    style: {
      ...props.element.style,
      ...updates
    }
  })
}

function updateShapeType() {
  emit('update:element', {
    ...props.element,
    content: shapeType.value
  })
}

function updateFillColor() {
  updateElement({ fill: fillColor.value })
}

function updateStrokeColor() {
  updateElement({ stroke: strokeColor.value })
}

function updateStrokeWidth() {
  updateElement({ strokeWidth: strokeWidth.value })
}

function updateOpacity() {
  updateElement({ opacity: opacity.value })
}

function updateBorderRadius() {
  updateElement({ borderRadius: borderRadius.value })
}

function updateLineStyle() {
  updateElement({ lineStyle: lineStyle.value })
}

function updateRotation() {
  updateElement({ rotation: rotation.value })
}
</script>

<style scoped lang="scss">
.property-group {
  padding: 16px;
}

.property-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
</style>