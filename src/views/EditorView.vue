<template>
  <div class="document-editor">
    <EditorToolbar 
      :activeTools="activeTools" 
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
            @element-selected="selectElement"
            @element-updated="updateElement"
          />
        </div>
      </div>
      
      <PropertiesPanel 
        v-if="selectedElement"
        :selectedElement="selectedElement"
        @update:element="updateElement"
        @delete-element="deleteElement"
        @duplicate-element="duplicateElement"
        @close="selectedElement = null"
      />
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
const showRuler = ref(false)
const zoom = ref(1)
const showPreview = ref(false)

const editorContentStyle = computed(() => ({
  transform: `scale(${zoom.value})`,
  transformOrigin: '0 0'
}))

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
  const newElement = {
    ...element,
    id: `${element.type}-${Date.now()}`,
    position: {
      x: element.position.x + 20,
      y: element.position.y + 20
    }
  }
  
  document.sections[currentSection.value].elements.push(newElement)
  selectedElement.value = newElement
}

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
      
    case 'grid':
      addGridElement()
      break
      
    case 'preview':
      showPreview.value = true
      break
  }
}

function addTextElement() {
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
    }
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addImageElement() {
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
    }
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addShapeElement() {
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
    }
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addLineElement() {
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
    }
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addTableElement() {
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
    }
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addSignatureElement() {
  const newElement: DocumentElement = {
    id: 'signature-' + Date.now(),
    type: 'signature',
    content: '',
    position: { x: 100, y: 400 },
    size: { width: 300, height: 100 },
    style: {
      borderBottom: '1px solid #000000',
      label: 'Signature'
    }
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addFormElement() {
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
    }
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
}

function addGridElement() {
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
    }
  }
  document.sections[currentSection.value].elements.push(newElement)
  selectElement(newElement)
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
</style>