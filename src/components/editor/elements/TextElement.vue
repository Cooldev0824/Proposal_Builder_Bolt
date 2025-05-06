<template>
  <div 
    class="text-element element"
    :class="{ selected: isSelected }"
    :style="elementStyle"
    @mousedown.stop="startDrag"
  >
    <div 
      class="element-content" 
      contenteditable="true" 
      @input="handleTextChange"
      @keydown="handleKeyDown"
      @focus="handleFocus"
      @blur="handleBlur"
      :style="textStyle"
      ref="contentElement"
      v-html="element.content"
    ></div>
    <div v-if="isSelected" class="resize-handle" @mousedown.stop="startResize"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { DocumentElement } from '../../../types/document'

const props = defineProps<{
  element: DocumentElement
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'update:element', element: DocumentElement): void
}>()

const contentElement = ref<HTMLElement | null>(null)
const isEditing = ref(false)
let lastSelection: Range | null = null

// Drag & drop functionality
let isDragging = false
let startX = 0
let startY = 0
let startLeft = 0
let startTop = 0

// Resize functionality
let isResizing = false
let startWidth = 0
let startHeight = 0

const elementStyle = computed(() => {
  return {
    left: `${props.element.position.x}px`,
    top: `${props.element.position.y}px`,
    width: `${props.element.size.width}px`,
    minHeight: `${props.element.size.height}px`,
    backgroundColor: props.element.style?.backgroundColor || 'transparent',
    padding: '8px',
    borderRadius: '4px',
    border: props.isSelected ? '2px solid var(--primary)' : '2px solid transparent',
    cursor: isEditing.value ? 'text' : 'move'
  }
})

const textStyle = computed(() => {
  const style = props.element.style || {}
  return {
    fontFamily: style.fontFamily || 'Roboto',
    fontSize: `${style.fontSize || 16}px`,
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecoration: style.underline ? 'underline' : 'none',
    textAlign: style.align || 'left',
    color: style.color || '#000000',
    lineHeight: '1.5',
    margin: 0,
    padding: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    outline: 'none',
    cursor: 'text',
    userSelect: 'text'
  }
})

watch(() => props.element.style, () => {
  if (contentElement.value) {
    Object.assign(contentElement.value.style, textStyle.value)
  }
}, { deep: true })

function saveSelection() {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return

  lastSelection = selection.getRangeAt(0).cloneRange()
}

function restoreSelection() {
  if (!lastSelection || !contentElement.value) return

  const selection = window.getSelection()
  if (!selection) return

  selection.removeAllRanges()
  selection.addRange(lastSelection.cloneRange())
}

function handleTextChange(event: Event) {
  const target = event.target as HTMLElement
  saveSelection()
  
  const updatedElement = {
    ...props.element,
    content: target.innerHTML
  }
  
  emit('update:element', updatedElement)
  
  // Restore cursor position after Vue updates the DOM
  requestAnimationFrame(() => {
    restoreSelection()
  })
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    
    // Insert a new line at the current cursor position
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const br = document.createElement('br')
      range.deleteContents()
      range.insertNode(br)
      
      // Move cursor after the break
      range.setStartAfter(br)
      range.setEndAfter(br)
      selection.removeAllRanges()
      selection.addRange(range)
      
      // Trigger content update
      handleTextChange({ target: contentElement.value } as unknown as Event)
    }
  }
}

function handleFocus() {
  isEditing.value = true
}

function handleBlur() {
  isEditing.value = false
  lastSelection = null
}

function startDrag(event: MouseEvent) {
  if (isEditing.value || event.target === contentElement.value) return
  
  isDragging = true
  startX = event.clientX
  startY = event.clientY
  startLeft = props.element.position.x
  startTop = props.element.position.y
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(event: MouseEvent) {
  if (!isDragging) return
  
  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY
  
  const updatedElement = {
    ...props.element,
    position: {
      x: startLeft + deltaX,
      y: startTop + deltaY
    }
  }
  
  emit('update:element', updatedElement)
}

function stopDrag() {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

function startResize(event: MouseEvent) {
  isResizing = true
  startX = event.clientX
  startY = event.clientY
  startWidth = props.element.size.width
  startHeight = props.element.size.height
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(event: MouseEvent) {
  if (!isResizing) return
  
  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY
  
  const newSize = {
    width: Math.max(100, startWidth + deltaX),
    height: Math.max(50, startHeight + deltaY)
  }
  
  const updatedElement = {
    ...props.element,
    size: newSize
  }
  
  emit('update:element', updatedElement)
}

function stopResize() {
  isResizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

onMounted(() => {
  if (contentElement.value) {
    contentElement.value.innerHTML = props.element.content
  }
})
</script>

<style scoped lang="scss">
.element {
  position: absolute;
  user-select: none;
  
  &.selected {
    outline: none;
  }
}

.text-element {
  overflow: hidden;
  
  .element-content {
    width: 100%;
    height: 100%;
    outline: none;
    overflow: auto;
  }
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: var(--primary);
  bottom: 0;
  right: 0;
  cursor: nwse-resize;
  z-index: 1;
  border-radius: 2px;
}
</style>