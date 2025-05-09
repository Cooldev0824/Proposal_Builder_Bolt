<template>
  <div class="element-layer-controls">
    <div class="layer-position-indicator">
      <div class="layer-number">{{ layerIndex + 1 }}</div>
      <div class="layer-label">
        <v-icon size="small" :icon="getElementIcon(element.type)" class="mr-1"></v-icon>
        <span>{{ getElementName(element) }}</span>
      </div>
    </div>

    <div class="layer-actions">
      <v-tooltip location="top" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            size="small"
            color="primary"
            variant="text"
            :disabled="isTopLayer"
            @click.stop="$emit('move-to-top', element)"
            class="layer-btn"
          >
            <v-icon>mdi-arrow-collapse-up</v-icon>
          </v-btn>
        </template>
        <span>Bring to Front</span>
      </v-tooltip>

      <v-tooltip location="top" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            size="small"
            color="primary"
            variant="text"
            :disabled="isTopLayer"
            @click.stop="$emit('move-up', element)"
            class="layer-btn"
          >
            <v-icon>mdi-arrow-up</v-icon>
          </v-btn>
        </template>
        <span>Move Up</span>
      </v-tooltip>

      <v-tooltip location="top" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            size="small"
            color="primary"
            variant="text"
            :disabled="isBottomLayer"
            @click.stop="$emit('move-down', element)"
            class="layer-btn"
          >
            <v-icon>mdi-arrow-down</v-icon>
          </v-btn>
        </template>
        <span>Move Down</span>
      </v-tooltip>

      <v-tooltip location="top" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            size="small"
            color="primary"
            variant="text"
            :disabled="isBottomLayer"
            @click.stop="$emit('move-to-bottom', element)"
            class="layer-btn"
          >
            <v-icon>mdi-arrow-collapse-down</v-icon>
          </v-btn>
        </template>
        <span>Send to Back</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentElement } from '../../types/document'

const props = defineProps<{
  element: DocumentElement
  elements: DocumentElement[]
  layerIndex: number
  totalLayers: number
}>()

defineEmits<{
  (e: 'move-up', element: DocumentElement): void
  (e: 'move-down', element: DocumentElement): void
  (e: 'move-to-top', element: DocumentElement): void
  (e: 'move-to-bottom', element: DocumentElement): void
}>()

const isTopLayer = computed(() => props.layerIndex === props.totalLayers - 1)
const isBottomLayer = computed(() => props.layerIndex === 0)

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
      return shortText || `${prefix}`

    case 'shape':
      // For shapes, include the shape type
      return `${prefix}: ${element.content || 'Rectangle'}`

    case 'image':
      return `${prefix}`

    case 'group':
      // For groups, show the number of elements in the group
      const childCount = element.children?.length || 0
      return `${prefix} (${childCount})`

    default:
      return `${prefix}`
  }
}
</script>

<style scoped lang="scss">
.element-layer-controls {
  position: absolute;
  top: -40px;
  left: 0;
  right: 0;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--primary);
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  z-index: 1000;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  pointer-events: all;
}

.layer-position-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.layer-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--primary);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
}

.layer-label {
  display: flex;
  align-items: center;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.layer-actions {
  display: flex;
  gap: 2px;
}

.layer-btn {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    opacity: 0.5;
  }
}

.layer-tooltip {
  font-size: 12px;
  padding: 4px 8px;
}
</style>
