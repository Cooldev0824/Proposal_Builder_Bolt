<template>
  <div
    class="document-page"
    :class="{ active: isActive }"
    :style="pageStyle"
  >
    <div class="page-header">
      <h2 class="page-title">{{ section?.title || 'Untitled Section' }}</h2>
    </div>

    <div class="page-content" ref="pageContent">
      <Suspense v-if="section?.elements && Array.isArray(section.elements)">
        <template #default>
          <div class="elements-container">
            <component
              v-for="element in sortedElements"
              :key="element.id"
              :is="getElementComponent(element.type)"
              :element="element"
              :isSelected="selectedElement?.id === element.id"
              @click.stop="selectElement(element)"
              @update:element="updateElement"
              ref="elementRefs"
              :style="{ zIndex: element.zIndex || 0 }"
            />
          </div>
        </template>
        <template #fallback>
          <div class="loading">Loading elements...</div>
        </template>
      </Suspense>

      <div v-if="!section || !section?.elements || !Array.isArray(section.elements) || !section.elements?.length" class="empty-page">
        <p>This section is empty. Add elements from the toolbar above.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onErrorCaptured } from 'vue'
import { Section, DocumentElement } from '../../types/document'

// Lazy-loaded element components with error handling
const TextElement = defineAsyncComponent({
  loader: () => import('./elements/TextElement.vue'),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading text element</div>'
  }
})

const ImageElement = defineAsyncComponent({
  loader: () => import('./elements/ImageElement.vue'),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading image element</div>'
  }
})

const ShapeElement = defineAsyncComponent({
  loader: () => import('./elements/ShapeElement.vue'),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading shape element</div>'
  }
})

const TableElement = defineAsyncComponent({
  loader: () => import('./elements/TableElement.vue'),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading table element</div>'
  }
})

const SignatureElement = defineAsyncComponent({
  loader: () => import('./elements/SignatureElement.vue'),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading signature element</div>'
  }
})

const FormElement = defineAsyncComponent({
  loader: () => import('./elements/FormElement.vue'),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading form element</div>'
  }
})

const GridBlockElement = defineAsyncComponent({
  loader: () => import('./elements/GridBlockElement.vue'),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading grid block element</div>'
  }
})

const { section, isActive } = defineProps<{
  section: Section
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: 'element-selected', element: DocumentElement | null): void
  (e: 'element-updated', element: DocumentElement): void
}>()

const pageContent = ref<HTMLElement | null>(null)
const selectedElement = ref<DocumentElement | null>(null)
const elementRefs = ref<any[]>([])

const pageStyle = computed(() => {
  return {
    width: '8.5in',
    minHeight: '11in'
  }
})

// Sort elements by zIndex for proper layering
const sortedElements = computed(() => {
  if (!section?.elements) return []

  // Make a copy of the elements array to avoid modifying the original
  return [...section.elements].sort((a, b) => {
    // Default zIndex to 0 if not set
    const zIndexA = a.zIndex ?? 0
    const zIndexB = b.zIndex ?? 0
    return zIndexA - zIndexB
  })
})

function getElementComponent(type: string) {
  switch (type) {
    case 'text':
      return TextElement
    case 'image':
      return ImageElement
    case 'shape':
      return ShapeElement
    case 'table':
      return TableElement
    case 'signature':
      return SignatureElement
    case 'form':
      return FormElement
    case 'grid':
      return GridBlockElement
    default:
      console.warn(`Unknown element type: ${type}`)
      return null
  }
}

function selectElement(element: DocumentElement) {
  selectedElement.value = element
  emit('element-selected', element)
}

function updateElement(element: DocumentElement) {
  emit('element-updated', element)
}

// Text selection is now handled by the global selection manager

// Expose methods to parent components
defineExpose({
  // No special methods needed anymore
})

// Global error handler for async components
onErrorCaptured((error, instance, info) => {
  console.error('Component error:', error, instance, info)
  return false // prevent error from propagating
})
</script>

<style scoped lang="scss">
.document-page {
  background-color: var(--background);
  box-shadow: var(--shadow-md);
  margin: 16px auto;
  transition: transform 0.2s ease;
  position: relative;

  &.active {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.page-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.page-content {
  position: relative;
  min-height: 800px;
  padding: 24px;
}

.elements-container {
  position: relative;
  min-height: inherit;
}

.empty-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: var(--text-secondary);
  border: 2px dashed var(--border);
  border-radius: 8px;

  p {
    font-size: 16px;
    text-align: center;
    max-width: 300px;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: var(--text-secondary);
}

.error-loading {
  padding: 8px;
  color: var(--error);
  background-color: var(--error-bg);
  border-radius: 4px;
  margin: 8px 0;
}
</style>