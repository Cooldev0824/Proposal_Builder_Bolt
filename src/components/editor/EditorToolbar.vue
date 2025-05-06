<template>
  <div class="editor-toolbar">
    <div class="toolbar-group">
      <v-btn icon @click="$emit('tool-clicked', 'undo')" size="small" :disabled="!canUndo">
        <v-icon>mdi-undo</v-icon>
        <v-tooltip activator="parent" location="bottom">Undo</v-tooltip>
      </v-btn>
      <v-btn icon @click="$emit('tool-clicked', 'redo')" size="small" :disabled="!canRedo">
        <v-icon>mdi-redo</v-icon>
        <v-tooltip activator="parent" location="bottom">Redo</v-tooltip>
      </v-btn>
    </div>
    
    <div class="toolbar-divider"></div>
    
    <div class="toolbar-group">
      <v-btn icon @click="$emit('tool-clicked', 'add-page')" size="small">
        <v-icon>mdi-file-plus</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Page</v-tooltip>
      </v-btn>
    </div>
    
    <div class="toolbar-divider"></div>
    
    <div class="toolbar-group">
      <v-btn icon @click="$emit('tool-clicked', 'text')" size="small" :color="isActive('text') ? 'primary' : ''">
        <v-icon>mdi-format-text</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Text</v-tooltip>
      </v-btn>
      <v-btn icon @click="$emit('tool-clicked', 'image')" size="small" :color="isActive('image') ? 'primary' : ''">
        <v-icon>mdi-image</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Image</v-tooltip>
      </v-btn>
      <v-btn icon @click="$emit('tool-clicked', 'shape')" size="small" :color="isActive('shape') ? 'primary' : ''">
        <v-icon>mdi-shape</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Shape</v-tooltip>
      </v-btn>
      <v-btn icon @click="$emit('tool-clicked', 'line')" size="small" :color="isActive('line') ? 'primary' : ''">
        <v-icon>mdi-minus</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Line</v-tooltip>
      </v-btn>
      <v-btn icon @click="$emit('tool-clicked', 'table')" size="small" :color="isActive('table') ? 'primary' : ''">
        <v-icon>mdi-table</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Table</v-tooltip>
      </v-btn>
      <v-btn icon @click="$emit('tool-clicked', 'signature')" size="small" :color="isActive('signature') ? 'primary' : ''">
        <v-icon>mdi-draw</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Signature</v-tooltip>
      </v-btn>
      <v-btn icon @click="$emit('tool-clicked', 'form')" size="small" :color="isActive('form') ? 'primary' : ''">
        <v-icon>mdi-form-select</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Form</v-tooltip>
      </v-btn>
    </div>
    
    <div class="toolbar-divider"></div>
    
    <v-spacer></v-spacer>
    
    <div class="toolbar-group">
      <v-btn icon @click="toggleRuler" size="small" :color="showRuler ? 'primary' : ''">
        <v-icon>mdi-ruler</v-icon>
        <v-tooltip activator="parent" location="bottom">Toggle Ruler</v-tooltip>
      </v-btn>
      <v-btn icon @click="$emit('tool-clicked', 'zoom-in')" size="small">
        <v-icon>mdi-magnify-plus</v-icon>
        <v-tooltip activator="parent" location="bottom">Zoom In</v-tooltip>
      </v-btn>
      <v-btn icon @click="$emit('tool-clicked', 'zoom-out')" size="small">
        <v-icon>mdi-magnify-minus</v-icon>
        <v-tooltip activator="parent" location="bottom">Zoom Out</v-tooltip>
      </v-btn>
    </div>
    
    <div class="toolbar-divider"></div>
    
    <div class="toolbar-group">
      <v-btn color="primary" @click="$emit('save')">
        <v-icon left>mdi-content-save</v-icon>
        Save
      </v-btn>
      <v-btn @click="$emit('tool-clicked', 'preview')">
        <v-icon left>mdi-eye</v-icon>
        Preview
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHistoryStore } from '../../stores/historyStore'

const historyStore = useHistoryStore()

const props = defineProps<{
  activeTools: string[]
}>()

const emit = defineEmits<{
  (e: 'tool-clicked', tool: string, value?: any): void
  (e: 'save'): void
}>()

const canUndo = computed(() => historyStore.canUndo())
const canRedo = computed(() => historyStore.canRedo())

// Text formatting state
const textFormat = ref('Paragraph')
const fontFamily = ref('Roboto')
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const textAlign = ref('left')

// UI state
const showRuler = ref(false)

function isActive(tool: string) {
  return props.activeTools.includes(tool)
}

function toggleBold() {
  isBold.value = !isBold.value
  emit('tool-clicked', 'format-bold', isBold.value)
}

function toggleItalic() {
  isItalic.value = !isItalic.value
  emit('tool-clicked', 'format-italic', isItalic.value)
}

function toggleUnderline() {
  isUnderline.value = !isUnderline.value
  emit('tool-clicked', 'format-underline', isUnderline.value)
}

function setTextAlign(align: string) {
  textAlign.value = align
  emit('tool-clicked', 'text-align', align)
}

function toggleRuler() {
  showRuler.value = !showRuler.value
  emit('tool-clicked', 'ruler', showRuler.value)
}
</script>

<style scoped lang="scss">
.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--background);
  border-bottom: 1px solid var(--border);
  z-index: 10;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  
  &.text-formatting {
    gap: 8px;
  }
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border);
  margin: 0 12px;
}

.font-select {
  width: 140px;
}

@media (max-width: 1200px) {
  .toolbar-group {
    &.text-formatting {
      .font-select {
        width: 120px;
      }
    }
  }
}

@media (max-width: 768px) {
  .editor-toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .toolbar-divider {
    display: none;
  }
}
</style>