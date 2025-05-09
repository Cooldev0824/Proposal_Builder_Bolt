<template>
  <div class="layer-control-panel">
    <div class="panel-header">
      <h3>Layers</h3>
    </div>

    <div class="layer-list">
      <div
        v-for="element in sortedElements"
        :key="element.id"
        class="layer-item"
        :class="{ 'selected': selectedElement?.id === element.id }"
        @click="selectElement(element)"
      >
        <div class="layer-icon">
          <v-icon size="small">{{ getElementIcon(element.type) }}</v-icon>
        </div>
        <div class="layer-name">
          {{ getElementName(element) }}
        </div>
        <div class="layer-actions">
          <v-btn icon size="x-small" @click.stop="moveUp(element)">
            <v-icon size="small">mdi-arrow-up</v-icon>
            <v-tooltip activator="parent" location="top">Move Up</v-tooltip>
          </v-btn>
          <v-btn icon size="x-small" @click.stop="moveDown(element)">
            <v-icon size="small">mdi-arrow-down</v-icon>
            <v-tooltip activator="parent" location="top">Move Down</v-tooltip>
          </v-btn>
          <v-btn icon size="x-small" @click.stop="moveToTop(element)">
            <v-icon size="small">mdi-arrow-up-bold</v-icon>
            <v-tooltip activator="parent" location="top">Bring to Front</v-tooltip>
          </v-btn>
          <v-btn icon size="x-small" @click.stop="moveToBottom(element)">
            <v-icon size="small">mdi-arrow-down-bold</v-icon>
            <v-tooltip activator="parent" location="top">Send to Back</v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentElement } from '../../types/document'

const props = defineProps<{
  elements: DocumentElement[]
  selectedElement: DocumentElement | null
}>()

const emit = defineEmits<{
  (e: 'element-selected', element: DocumentElement): void
  (e: 'update-element', element: DocumentElement): void
  (e: 'move-up', element: DocumentElement): void
  (e: 'move-down', element: DocumentElement): void
  (e: 'move-to-top', element: DocumentElement): void
  (e: 'move-to-bottom', element: DocumentElement): void
}>()

// Sort elements by zIndex in reverse order (highest zIndex first)
const sortedElements = computed(() => {
  return [...props.elements].sort((a, b) => {
    const zIndexA = a.zIndex ?? 0
    const zIndexB = b.zIndex ?? 0
    return zIndexB - zIndexA // Reverse order for the layer panel
  })
})

function getElementIcon(type: string): string {
  switch (type) {
    case 'text': return 'mdi-format-text'
    case 'image': return 'mdi-image'
    case 'shape': return 'mdi-shape'
    case 'table': return 'mdi-table'
    case 'signature': return 'mdi-draw'
    case 'form': return 'mdi-form-select'
    case 'grid': return 'mdi-grid'
    case 'group': return 'mdi-folder'
    default: return 'mdi-shape-outline'
  }
}

function getElementName(element: DocumentElement): string {
  // Create a user-friendly name based on element type and content
  const prefix = element.type.charAt(0).toUpperCase() + element.type.slice(1)

  switch (element.type) {
    case 'text':
      // For text elements, use the first few words
      const text = typeof element.content === 'string'
        ? element.content.replace(/<[^>]*>/g, '') // Remove HTML tags
        : ''
      const shortText = text.length > 15 ? text.substring(0, 15) + '...' : text
      return `${prefix}: ${shortText || 'Empty'}`

    case 'shape':
      // For shapes, include the shape type
      return `${prefix}: ${element.content || 'Rectangle'}`

    case 'image':
      return `${prefix}`

    case 'table':
      return `${prefix}: ${element.content?.headers?.length || 0} columns`

    case 'group':
      // For groups, show the number of elements in the group
      const childCount = element.children?.length || 0
      return `${prefix} (${childCount} items)`

    default:
      return `${prefix} ${element.id.split('-')[1] || ''}`
  }
}

function selectElement(element: DocumentElement) {
  emit('element-selected', element)
}

function moveUp(element: DocumentElement) {
  emit('move-up', element)
}

function moveDown(element: DocumentElement) {
  emit('move-down', element)
}

function moveToTop(element: DocumentElement) {
  emit('move-to-top', element)
}

function moveToBottom(element: DocumentElement) {
  emit('move-to-bottom', element)
}
</script>

<style scoped lang="scss">
.layer-control-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--surface);
  border-left: 1px solid var(--border);
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
}

.layer-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.layer-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;

  &:hover {
    background-color: var(--hover);
  }

  &.selected {
    background-color: var(--selected);
  }
}

.layer-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.layer-name {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-actions {
  display: flex;
  gap: 2px;
  opacity: 0.5;

  .layer-item:hover & {
    opacity: 1;
  }
}
</style>
