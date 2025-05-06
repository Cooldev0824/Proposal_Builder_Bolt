<template>
  <div v-if="selectedElement" class="properties-panel">
    <div class="panel-header">
      <h3 class="panel-title">Properties</h3>
      <v-btn icon size="small" @click="closePanel">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    
    <div class="panel-content">
      <div class="element-type">
        {{ formatElementType(selectedElement.type) }}
      </div>
      
      <v-divider class="my-4"></v-divider>
      
      <!-- Position and size controls -->
      <div class="property-group">
        <div class="property-group-title">Position & Size</div>
        <div class="property-row">
          <v-text-field
            v-model.number="position.x"
            label="X"
            type="number"
            density="compact"
            variant="outlined"
            hide-details
            class="position-input"
            @update:model-value="updatePosition"
          ></v-text-field>
          <v-text-field
            v-model.number="position.y"
            label="Y"
            type="number"
            density="compact"
            variant="outlined"
            hide-details
            class="position-input"
            @update:model-value="updatePosition"
          ></v-text-field>
        </div>
        <div class="property-row">
          <v-text-field
            v-model.number="size.width"
            label="Width"
            type="number"
            density="compact"
            variant="outlined"
            hide-details
            class="position-input"
            @update:model-value="updateSize"
          ></v-text-field>
          <v-text-field
            v-model.number="size.height"
            label="Height"
            type="number"
            density="compact"
            variant="outlined"
            hide-details
            class="position-input"
            @update:model-value="updateSize"
          ></v-text-field>
        </div>
      </div>
      
      <v-divider class="my-4"></v-divider>
      
      <!-- Element-specific properties -->
      <component 
        :is="getPropertiesComponent(selectedElement.type)"
        :element="selectedElement"
        @update:element="updateElement"
      />
      
      <v-divider class="my-4"></v-divider>
      
      <!-- Actions -->
      <div class="property-group">
        <div class="property-group-title">Actions</div>
        <div class="actions-row">
          <v-btn color="primary" block @click="duplicateElement">
            <v-icon left>mdi-content-duplicate</v-icon>
            Duplicate
          </v-btn>
        </div>
        <div class="actions-row">
          <v-btn color="error" block @click="deleteElement">
            <v-icon left>mdi-delete</v-icon>
            Delete
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DocumentElement } from '../../types/document'
import TextProperties from './properties/TextProperties.vue'
import ImageProperties from './properties/ImageProperties.vue'
import ShapeProperties from './properties/ShapeProperties.vue'
import TableProperties from './properties/TableProperties.vue'
import SignatureProperties from './properties/SignatureProperties.vue'
import FormProperties from './properties/FormProperties.vue'

const props = defineProps<{
  selectedElement: DocumentElement | null
}>()

const emit = defineEmits<{
  (e: 'update:element', element: DocumentElement): void
  (e: 'delete-element', element: DocumentElement): void
  (e: 'duplicate-element', element: DocumentElement): void
  (e: 'close'): void
}>()

const position = ref({ x: 0, y: 0 })
const size = ref({ width: 0, height: 0 })

watch(() => props.selectedElement, (newValue) => {
  if (newValue) {
    position.value = { ...newValue.position }
    size.value = { ...newValue.size }
  }
}, { immediate: true, deep: true })

function getPropertiesComponent(type: string) {
  switch (type) {
    case 'text':
      return TextProperties
    case 'image':
      return ImageProperties
    case 'shape':
      return ShapeProperties
    case 'table':
      return TableProperties
    case 'signature':
      return SignatureProperties
    case 'form':
      return FormProperties
    default:
      return null
  }
}

function formatElementType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1) + ' Element'
}

function updatePosition() {
  if (!props.selectedElement) return
  
  const updatedElement = {
    ...props.selectedElement,
    position: { ...position.value }
  }
  
  emit('update:element', updatedElement)
}

function updateSize() {
  if (!props.selectedElement) return
  
  const updatedElement = {
    ...props.selectedElement,
    size: { ...size.value }
  }
  
  emit('update:element', updatedElement)
}

function updateElement(element: DocumentElement) {
  emit('update:element', element)
}

function deleteElement() {
  if (!props.selectedElement) return
  emit('delete-element', props.selectedElement)
}

function duplicateElement() {
  if (!props.selectedElement) return
  emit('duplicate-element', props.selectedElement)
}

function closePanel() {
  emit('close')
}
</script>

<style scoped lang="scss">
.properties-panel {
  background-color: var(--background);
  border-left: 1px solid var(--border);
  width: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.panel-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.panel-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.element-type {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
}

.property-group {
  margin-bottom: 16px;
}

.property-group-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.property-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.position-input {
  flex: 1;
}

.actions-row {
  margin-bottom: 8px;
}
</style>