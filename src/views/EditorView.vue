<template>
  <div class="document-editor">
    <EditorToolbar
      :activeTools="activeTools"
      :showGrid="showGrid"
      @tool-clicked="handleToolClick"
      @save="saveDocument"
    />

    <div class="editor-container">
      <SidebarNavigation
        :sections="document.sections"
        :currentSection="currentSection"
        @section-selected="selectSection"
        @section-added="addSection"
        @section-updated="updateSection"
        @section-deleted="deleteSection"
      />

      <div class="main-editor" ref="editorContainer">
        <Ruler :visible="showRuler" :zoom="zoom" />

        <div class="editor-content" :style="editorContentStyle">
          <DocumentPage
            v-for="(section, index) in document?.sections && document?.sections.length > 0 ? document.sections : []"
            :key="section.id"
            :section="section"
            :isActive="currentSection === index"
            :showGrid="showGrid"
            @element-selected="selectElement"
            @element-updated="updateElement"
            @move-element-up="moveElementUp"
            @move-element-down="moveElementDown"
            @move-element-to-top="moveElementToTop"
            @move-element-to-bottom="moveElementToBottom"
            @toggle-grid="toggleGrid"
            ref="documentPageRefs"
          />
        </div>
      </div>

      <div class="right-panel" v-if="selectedElement || showLayerPanel">
        <v-tabs v-model="activeTab">
          <v-tab value="properties">Properties</v-tab>
          <v-tab value="layers">Layers</v-tab>
        </v-tabs>

        <div class="tab-content">
          <PropertiesPanel
            v-if="selectedElement && activeTab === 'properties'"
            :selectedElement="selectedElement"
            @update:element="updateElement"
            @delete-element="deleteElement"
            @duplicate-element="duplicateElement"
            @close="selectedElement = null"
          />

          <LayerControlPanel
            v-if="activeTab === 'layers'"
            :elements="currentSectionElements"
            :selectedElement="selectedElement"
            @element-selected="selectElement"
            @move-up="moveElementUp"
            @move-down="moveElementDown"
            @move-to-top="moveElementToTop"
            @move-to-bottom="moveElementToBottom"
          />
        </div>
      </div>
    </div>

    <PreviewDialog
      v-model="showPreview"
      :document="document"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import EditorToolbar from '../components/editor/EditorToolbar.vue'
import SidebarNavigation from '../components/editor/SidebarNavigation.vue'
import DocumentPage from '../components/editor/DocumentPage.vue'
import PropertiesPanel from '../components/editor/PropertiesPanel.vue'
import LayerControlPanel from '../components/editor/LayerControlPanel.vue'
import Ruler from '../components/editor/Ruler.vue'
import PreviewDialog from '../components/editor/PreviewDialog.vue'
import { useDocumentStore } from '../stores/documentStore'
import { useHistoryStore } from '../stores/historyStore'
import { Section, DocumentElement, Document } from '../types/document'

const route = useRoute()
const documentStore = useDocumentStore()
const historyStore = useHistoryStore()
const documentId = route.params.id as string | undefined

const document = reactive<Document>({
  id: documentId || 'new-doc-' + Date.now(),
  title: 'Untitled Document',
  sections: []
})

const currentSection = ref(0)
const selectedElement = ref<DocumentElement | null>(null)
const activeTools = ref<string[]>([])
const editorContainer = ref<HTMLElement | null>(null)
const documentPageRefs = ref<any[]>([])
const showRuler = ref(false)
const showGrid = ref(true) // Show grid by default
const zoom = ref(1)
const showPreview = ref(false)
const showLayerPanel = ref(true) // Always show layer panel
const activeTab = ref('properties') // Default to properties tab

const editorContentStyle = computed(() => ({
  transform: `scale(${zoom.value})`,
  transformOrigin: '0 0'
}))

// Get elements from the current section for the layer panel
const currentSectionElements = computed(() => {
  if (!document.sections || !document.sections[currentSection.value]) {
    return []
  }
  return document.sections[currentSection.value].elements
})

watch(() => JSON.stringify(document), () => {
  historyStore.pushState(document)
}, { deep: true })

onMounted(async () => {
  if (documentId) {
    const loadedDoc = await documentStore.getDocument(documentId)
    if (loadedDoc) {
      Object.assign(document, loadedDoc)
      historyStore.pushState(document)
    }
  } else {
    document.sections = [
      {
        id: 'cover',
        title: 'Cover',
        elements: []
      }
    ]
    historyStore.pushState(document)
  }
})

function handleUndo() {
  const previousState = historyStore.undo(document)
  if (previousState) {
    Object.assign(document, previousState)
  }
}

function handleRedo() {
  const nextState = historyStore.redo(document)
  if (nextState) {
    Object.assign(document, nextState)
  }
}

function selectSection(index: number) {
  currentSection.value = index
  selectedElement.value = null
}

function addSection(section: Section) {
  document.sections.push(section)
  currentSection.value = document.sections.length - 1
}

function updateSection(index: number, section: Section) {
  document.sections[index] = section
}

function deleteSection(index: number) {
  if (document.sections.length > 1) {
    document.sections.splice(index, 1)
    if (currentSection.value >= document.sections.length) {
      currentSection.value = document.sections.length - 1
    }
  }
}

function selectElement(element: DocumentElement) {
  selectedElement.value = element
  activeTools.value = [element.type]
}

function updateElement(element: DocumentElement) {
  const sectionIndex = document.sections.findIndex(s =>
    s.elements.some(e => e.id === element.id)
  )

  if (sectionIndex >= 0) {
    const elementIndex = document.sections[sectionIndex].elements.findIndex(e =>
      e.id === element.id
    )
    if (elementIndex >= 0) {
      document.sections[sectionIndex].elements[elementIndex] = element
    }
  }
}

function deleteElement(element: DocumentElement) {
  const sectionIndex = document.sections.findIndex(s =>
    s.elements.some(e => e.id === element.id)
  )

  if (sectionIndex >= 0) {
    document.sections[sectionIndex].elements = document.sections[sectionIndex].elements.filter(
      e => e.id !== element.id
    )
    selectedElement.value = null
  }
}

function duplicateElement(element: DocumentElement) {
  const highestZIndex = getHighestZIndex()

  const newElement = {
    ...element,
    id: `${element.type}-${Date.now()}`,
    position: {
      x: element.position.x + 20,
      y: element.position.y + 20
    },
    zIndex: highestZIndex + 1 // Place the duplicate on top
  }

  document.sections[currentSection.value].elements.push(newElement)
  selectedElement.value = newElement
}

// Text selection is now handled by the global selection manager

function handleToolClick(tool: string, value?: any) {
  switch (tool) {
    case 'undo':
      handleUndo()
      break

    case 'redo':
      handleRedo()
      break

    case 'add-page':
      addSection({
        id: 'section-' + Date.now(),
        title: 'New Section',
        elements: []
      })
      break

    case 'ruler':
      showRuler.value = value
      break

    case 'grid':
      toggleGrid(value)
      break

    case 'zoom-in':
      zoom.value = Math.min(2, zoom.value + 0.1)
      break

    case 'zoom-out':
      zoom.value = Math.max(0.5, zoom.value - 0.1)
      break

    case 'text':
      addTextElement()
      break

    case 'image':
      addImageElement()
      break

    case 'shape':
      addShapeElement()
      break

    case 'line':
      addLineElement()
      break

    case 'table':
      addTableElement()
      break

    case 'signature':
      addSignatureElement()
      break

    case 'form':
      addFormElement()
      break

    case 'grid-element':
      addGridElement()
      break

    case 'preview':
      showPreview.value = true
      break
  }
}

function addTextElement() {
  // Get highest zIndex in current section to place new element on top
  const highestZIndex = getHighestZIndex()

  const newElement: DocumentElement = {
    id: 'text-' + Date.now(),
    type: 'text',
    content: 'New text block',
    position: { x: 100, y: 100 },
    size: { width: 300, height: 100 },
    style: {
      fontFamily: 'Roboto',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
      backgroundColor: 'transparent'
    },
    zIndex: highestZIndex + 1 // Place on top
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

// Helper function to get the highest zIndex in the current section
function getHighestZIndex(): number {
  if (!document.sections || !document.sections[currentSection.value]) {
    return 0
  }

  const elements = document.sections[currentSection.value].elements
  if (!elements || elements.length === 0) {
    return 0
  }

  let highestZIndex = 0
  elements.forEach(element => {
    const zIndex = element.zIndex ?? 0
    if (zIndex > highestZIndex) {
      highestZIndex = zIndex
    }
  })

  return highestZIndex
}

function addImageElement() {
  const highestZIndex = getHighestZIndex()

  const newElement: DocumentElement = {
    id: 'image-' + Date.now(),
    type: 'image',
    content: 'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg',
    position: { x: 100, y: 100 },
    size: { width: 300, height: 200 },
    style: {
      borderRadius: 0,
      borderWidth: 0,
      borderColor: 'transparent',
      opacity: 1
    },
    zIndex: highestZIndex + 1 // Place on top
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addShapeElement() {
  const highestZIndex = getHighestZIndex()

  const newElement: DocumentElement = {
    id: 'shape-' + Date.now(),
    type: 'shape',
    content: 'rectangle',
    position: { x: 100, y: 100 },
    size: { width: 200, height: 100 },
    style: {
      fill: '#E2E8F0',
      stroke: '#CBD5E1',
      strokeWidth: 1,
      opacity: 1
    },
    zIndex: highestZIndex + 1 // Place on top
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addLineElement() {
  const highestZIndex = getHighestZIndex()

  const newElement: DocumentElement = {
    id: 'line-' + Date.now(),
    type: 'shape',
    content: 'line',
    position: { x: 100, y: 100 },
    size: { width: 200, height: 2 },
    style: {
      stroke: '#000000',
      strokeWidth: 2,
      opacity: 1
    },
    zIndex: highestZIndex + 1 // Place on top
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addTableElement() {
  const highestZIndex = getHighestZIndex()

  const newElement: DocumentElement = {
    id: 'table-' + Date.now(),
    type: 'table',
    content: {
      headers: ['Item', 'Description', 'Price'],
      rows: [['', '', '']]
    },
    position: { x: 50, y: 100 },
    size: { width: 600, height: 200 },
    style: {
      headerBackgroundColor: '#F8F9FA',
      headerTextColor: '#000000',
      cellBackgroundColor: '#FFFFFF',
      cellTextColor: '#000000',
      borderColor: '#E2E8F0'
    },
    zIndex: highestZIndex + 1 // Place on top
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addSignatureElement() {
  const highestZIndex = getHighestZIndex()

  const newElement: DocumentElement = {
    id: 'signature-' + Date.now(),
    type: 'signature',
    content: '',
    position: { x: 100, y: 400 },
    size: { width: 300, height: 100 },
    style: {
      borderBottom: '1px solid #000000',
      label: 'Signature'
    },
    zIndex: highestZIndex + 1 // Place on top
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addFormElement() {
  const highestZIndex = getHighestZIndex()

  const newElement: DocumentElement = {
    id: 'form-' + Date.now(),
    type: 'form',
    content: {
      type: 'textfield',
      label: 'Input Label',
      inputType: 'text'
    },
    position: { x: 100, y: 100 },
    size: { width: 300, height: 80 },
    style: {
      backgroundColor: 'white'
    },
    zIndex: highestZIndex + 1 // Place on top
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addGridElement() {
  const highestZIndex = getHighestZIndex()

  const newElement: DocumentElement = {
    id: 'grid-' + Date.now(),
    type: 'grid',
    content: {
      cells: [
        { type: 'text', content: 'Text content', size: 1 },
        { type: 'image', content: '', size: 1 }
      ]
    },
    position: { x: 100, y: 100 },
    size: { width: 600, height: 300 },
    style: {
      backgroundColor: 'white',
      borderColor: '#E2E8F0'
    },
    zIndex: highestZIndex + 1 // Place on top
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

// Layer management functions
function moveElementUp(element: DocumentElement) {
  const sectionIndex = document.sections.findIndex(s =>
    s.elements.some(e => e.id === element.id)
  )

  if (sectionIndex >= 0) {
    const elements = document.sections[sectionIndex].elements
    const elementIndex = elements.findIndex(e => e.id === element.id)

    if (elementIndex >= 0) {
      // Get current zIndex or default to 0
      const currentZIndex = element.zIndex ?? 0

      // Find the element with the next higher zIndex
      const higherElements = elements.filter(e => (e.zIndex ?? 0) > currentZIndex)

      if (higherElements.length > 0) {
        // Sort by zIndex to find the element immediately above
        higherElements.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
        const nextElement = higherElements[0]
        const nextZIndex = nextElement.zIndex ?? 0

        // Swap zIndex values
        const updatedElement = { ...element, zIndex: nextZIndex }
        const updatedNextElement = { ...nextElement, zIndex: currentZIndex }

        // Update both elements
        updateElement(updatedElement)
        updateElement(updatedNextElement)
      } else {
        // If this is already the top element, increment its zIndex
        const updatedElement = { ...element, zIndex: currentZIndex + 1 }
        updateElement(updatedElement)
      }
    }
  }
}

function moveElementDown(element: DocumentElement) {
  const sectionIndex = document.sections.findIndex(s =>
    s.elements.some(e => e.id === element.id)
  )

  if (sectionIndex >= 0) {
    const elements = document.sections[sectionIndex].elements
    const elementIndex = elements.findIndex(e => e.id === element.id)

    if (elementIndex >= 0) {
      // Get current zIndex or default to 0
      const currentZIndex = element.zIndex ?? 0

      // Find the element with the next lower zIndex
      const lowerElements = elements.filter(e => (e.zIndex ?? 0) < currentZIndex)

      if (lowerElements.length > 0) {
        // Sort by zIndex to find the element immediately below
        lowerElements.sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0))
        const prevElement = lowerElements[0]
        const prevZIndex = prevElement.zIndex ?? 0

        // Swap zIndex values
        const updatedElement = { ...element, zIndex: prevZIndex }
        const updatedPrevElement = { ...prevElement, zIndex: currentZIndex }

        // Update both elements
        updateElement(updatedElement)
        updateElement(updatedPrevElement)
      } else {
        // If this is already the bottom element, decrement its zIndex
        const updatedElement = { ...element, zIndex: currentZIndex - 1 }
        updateElement(updatedElement)
      }
    }
  }
}

function moveElementToTop(element: DocumentElement) {
  const sectionIndex = document.sections.findIndex(s =>
    s.elements.some(e => e.id === element.id)
  )

  if (sectionIndex >= 0) {
    const elements = document.sections[sectionIndex].elements

    // Find the highest zIndex
    let highestZIndex = 0
    elements.forEach(e => {
      const zIndex = e.zIndex ?? 0
      if (zIndex > highestZIndex) {
        highestZIndex = zIndex
      }
    })

    // Set this element's zIndex to be higher than the highest
    const updatedElement = { ...element, zIndex: highestZIndex + 1 }
    updateElement(updatedElement)
  }
}

function moveElementToBottom(element: DocumentElement) {
  const sectionIndex = document.sections.findIndex(s =>
    s.elements.some(e => e.id === element.id)
  )

  if (sectionIndex >= 0) {
    const elements = document.sections[sectionIndex].elements

    // Find the lowest zIndex
    let lowestZIndex = 0
    elements.forEach(e => {
      const zIndex = e.zIndex ?? 0
      if (zIndex < lowestZIndex) {
        lowestZIndex = zIndex
      }
    })

    // Set this element's zIndex to be lower than the lowest
    const updatedElement = { ...element, zIndex: lowestZIndex - 1 }
    updateElement(updatedElement)
  }
}

// Grid functions
function toggleGrid(visible?: boolean) {
  // If visible is provided, use it; otherwise toggle the current value
  showGrid.value = visible !== undefined ? visible : !showGrid.value

  console.log('Grid visibility toggled:', showGrid.value)

  // Update all elements to snap to grid if grid is enabled
  if (showGrid.value) {
    document.sections.forEach(section => {
      section.elements.forEach(element => {
        // Snap element position to grid
        const snappedPosition = {
          x: Math.round(element.position.x / 10) * 10,
          y: Math.round(element.position.y / 10) * 10
        }

        // Only update if position actually changed
        if (snappedPosition.x !== element.position.x ||
            snappedPosition.y !== element.position.y) {
          const updatedElement = {
            ...element,
            position: snappedPosition
          }
          updateElement(updatedElement)
        }
      })
    })
  }
}

async function saveDocument() {
  try {
    await documentStore.saveDocument({
      id: document.id,
      title: document.title,
      sections: document.sections
    })
    console.log('Document saved successfully')
  } catch (error) {
    console.error('Error saving document:', error)
  }
}
</script>

<style scoped lang="scss">
.document-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-editor {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background-color: var(--surface);
  position: relative;
}

.editor-content {
  min-height: 100%;
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.right-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border);
  background-color: var(--surface);

  .tab-content {
    flex: 1;
    overflow: auto;
  }
}
</style>