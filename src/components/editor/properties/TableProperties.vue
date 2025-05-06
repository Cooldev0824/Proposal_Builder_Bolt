<template>
  <div class="property-group">
    <div class="property-group-title">Table Properties</div>
    
    <!-- Table Structure -->
    <div class="section-title">Structure</div>
    <div class="property-row">
      <v-btn block @click="addColumn">
        <v-icon left>mdi-table-column-plus-after</v-icon>
        Add Column
      </v-btn>
    </div>
    <div class="property-row">
      <v-btn block @click="addRow">
        <v-icon left>mdi-table-row-plus-after</v-icon>
        Add Row
      </v-btn>
    </div>
    
    <!-- Border Style -->
    <div class="section-title mt-4">Border Style</div>
    <v-select
      v-model="borderStyle"
      label="Border Style"
      :items="['solid', 'dashed', 'dotted']"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateBorderStyle"
    ></v-select>
    
    <v-text-field
      v-model.number="borderWidth"
      label="Border Width"
      type="number"
      min="0"
      max="5"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateBorderWidth"
    ></v-text-field>
    
    <v-text-field
      v-model="borderColor"
      label="Border Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateBorderColor"
    ></v-text-field>
    
    <!-- Header Style -->
    <div class="section-title mt-4">Header Style</div>
    <v-text-field
      v-model="headerBackgroundColor"
      label="Background Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateHeaderBackgroundColor"
    ></v-text-field>
    
    <v-text-field
      v-model="headerTextColor"
      label="Text Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateHeaderTextColor"
    ></v-text-field>
    
    <!-- Cell Style -->
    <div class="section-title mt-4">Cell Style</div>
    <v-text-field
      v-model="cellBackgroundColor"
      label="Background Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateCellBackgroundColor"
    ></v-text-field>
    
    <v-text-field
      v-model="cellTextColor"
      label="Text Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateCellTextColor"
    ></v-text-field>
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

const borderStyle = ref(props.element.style?.borderStyle || 'solid')
const borderWidth = ref(props.element.style?.borderWidth || 1)
const borderColor = ref(props.element.style?.borderColor || '#E2E8F0')
const headerBackgroundColor = ref(props.element.style?.headerBackgroundColor || '#F8F9FA')
const headerTextColor = ref(props.element.style?.headerTextColor || '#000000')
const cellBackgroundColor = ref(props.element.style?.cellBackgroundColor || '#FFFFFF')
const cellTextColor = ref(props.element.style?.cellTextColor || '#000000')

watch(() => props.element, (newValue) => {
  borderStyle.value = newValue.style?.borderStyle || 'solid'
  borderWidth.value = newValue.style?.borderWidth || 1
  borderColor.value = newValue.style?.borderColor || '#E2E8F0'
  headerBackgroundColor.value = newValue.style?.headerBackgroundColor || '#F8F9FA'
  headerTextColor.value = newValue.style?.headerTextColor || '#000000'
  cellBackgroundColor.value = newValue.style?.cellBackgroundColor || '#FFFFFF'
  cellTextColor.value = newValue.style?.cellTextColor || '#000000'
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

function addColumn() {
  const updatedElement = { ...props.element }
  updatedElement.content = {
    headers: [...updatedElement.content.headers, 'New Column'],
    rows: updatedElement.content.rows.map(row => [...row, ''])
  }
  emit('update:element', updatedElement)
}

function addRow() {
  const updatedElement = { ...props.element }
  const newRow = new Array(updatedElement.content.headers.length).fill('')
  updatedElement.content = {
    ...updatedElement.content,
    rows: [...updatedElement.content.rows, newRow]
  }
  emit('update:element', updatedElement)
}

function updateBorderStyle() {
  updateElement({ borderStyle: borderStyle.value })
}

function updateBorderWidth() {
  updateElement({ borderWidth: borderWidth.value })
}

function updateBorderColor() {
  updateElement({ borderColor: borderColor.value })
}

function updateHeaderBackgroundColor() {
  updateElement({ headerBackgroundColor: headerBackgroundColor.value })
}

function updateHeaderTextColor() {
  updateElement({ headerTextColor: headerTextColor.value })
}

function updateCellBackgroundColor() {
  updateElement({ cellBackgroundColor: cellBackgroundColor.value })
}

function updateCellTextColor() {
  updateElement({ cellTextColor: cellTextColor.value })
}
</script>

<style scoped lang="scss">
.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.property-row {
  margin-bottom: 8px;
}
</style>