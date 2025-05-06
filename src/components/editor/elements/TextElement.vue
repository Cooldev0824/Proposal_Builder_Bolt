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
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @keyup="handleKeyUp"
      :style="textStyle"
      ref="contentElement"
      :data-element-id="props.element.id"
    ></div>
    <div v-if="isSelected" class="resize-handle" @mousedown.stop="startResize"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
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
let observer: MutationObserver | null = null
let isUpdating = false

// Cursor position tracking
let cursorPosition = {
  node: null as Node | null,
  offset: 0
}

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

// Watch for style changes
watch(() => props.element.style, () => {
  if (contentElement.value) {
    Object.assign(contentElement.value.style, textStyle.value)
  }
}, { deep: true })

// Watch for content changes from outside this component
watch(() => props.element.content, (newContent) => {
  if (contentElement.value && !isUpdating) {
    // Temporarily disable the observer to prevent loops
    if (observer) {
      observer.disconnect()
    }

    // Update the content
    contentElement.value.innerHTML = newContent || ''

    // Re-enable the observer
    setupMutationObserver()
  }
})

// No longer needed - using direct text selection utility instead

// Save the current cursor position
function saveCursorPosition() {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount || !contentElement.value) return false

  const range = selection.getRangeAt(0)

  // Make sure the selection is within our content element
  if (!contentElement.value.contains(range.commonAncestorContainer)) return false

  cursorPosition = {
    node: range.endContainer,
    offset: range.endOffset
  }

  return true
}

// Restore the cursor position
function restoreCursorPosition() {
  if (!cursorPosition.node || !contentElement.value) return false

  // Make sure the content element is still in the document
  if (!document.body.contains(contentElement.value)) return false

  // Make sure the node is still in the document
  if (!contentElement.value.contains(cursorPosition.node)) return false

  try {
    // Focus the element first
    contentElement.value.focus()

    const selection = window.getSelection()
    if (!selection) return false

    const range = document.createRange()
    range.setStart(cursorPosition.node, cursorPosition.offset)
    range.setEnd(cursorPosition.node, cursorPosition.offset)

    selection.removeAllRanges()
    selection.addRange(range)

    return true
  } catch (error) {
    console.error('Error restoring cursor position:', error)
    return false
  }
}

// Find a text node at the specified path
function findNodeAtPath(path: number[]): Node | null {
  if (!contentElement.value) return null

  let currentNode: Node = contentElement.value

  for (let i = 0; i < path.length; i++) {
    const index = path[i]
    if (currentNode.childNodes && index < currentNode.childNodes.length) {
      currentNode = currentNode.childNodes[index]
    } else {
      return null
    }
  }

  return currentNode
}

// Get the path to a node
function getNodePath(node: Node): number[] | null {
  if (!contentElement.value || !contentElement.value.contains(node)) return null

  const path: number[] = []
  let currentNode: Node | null = node

  while (currentNode && currentNode !== contentElement.value) {
    const parent = currentNode.parentNode
    if (!parent) return null

    const index = Array.from(parent.childNodes).indexOf(currentNode)
    if (index === -1) return null

    path.unshift(index)
    currentNode = parent
  }

  return path
}

// Handle text changes
function handleTextChange(event: Event) {
  if (!contentElement.value || isUpdating) return

  // Get the current selection
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return

  // Save the current selection state
  const range = selection.getRangeAt(0)
  const container = range.endContainer
  const offset = range.endOffset

  // Update the element content
  const updatedElement = {
    ...props.element,
    content: contentElement.value.innerHTML
  }

  isUpdating = true
  emit('update:element', updatedElement)

  // Restore cursor position after Vue updates the DOM
  setTimeout(() => {
    try {
      // Focus the element
      contentElement.value?.focus()

      // Check if the container is still in the document
      if (container && contentElement.value?.contains(container)) {
        // Create a new range at the saved position
        const newRange = document.createRange()
        newRange.setStart(container, offset)
        newRange.setEnd(container, offset)

        // Apply the selection
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    } catch (error) {
      console.error('Error restoring selection:', error)
    } finally {
      isUpdating = false
    }
  }, 0)
}

// Handle key down events
function handleKeyDown(event: KeyboardEvent) {
  // Handle Enter key press
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    event.stopPropagation() // Prevent event bubbling

    if (!contentElement.value) return

    // Simple approach: insert a <br> element directly
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    // Get the current range
    const range = selection.getRangeAt(0)

    // Create a <br> element
    const br = document.createElement('br')

    // Insert the <br> element
    range.deleteContents()
    range.insertNode(br)

    // Move the cursor after the <br>
    range.setStartAfter(br)
    range.setEndAfter(br)
    selection.removeAllRanges()
    selection.addRange(range)

    // Update the element content
    const updatedElement = {
      ...props.element,
      content: contentElement.value.innerHTML
    }

    // Emit the update
    emit('update:element', updatedElement)

    // Make sure the element stays focused
    contentElement.value.focus()

    // Prevent default behavior
    return false
  }
}

function handleFocus() {
  isEditing.value = true
  // Check for selection when focused
  emitSelectionState()
}

function handleBlur() {
  isEditing.value = false
}

// Selection is now handled by the global selection manager

// Handle mouse up event - selection is now handled by the global selection manager
function handleMouseUp() {
  // Emit an event to notify that text might be selected
  emitSelectionState();
}

// Handle key up event - selection is now handled by the global selection manager
function handleKeyUp(event: KeyboardEvent) {
  // Check for selection changes on key up
  if (event.key === 'Shift' ||
      event.key.includes('Arrow') ||
      event.key === 'Home' ||
      event.key === 'End') {
    emitSelectionState();
  }
}

// Function to emit selection state
function emitSelectionState() {
  if (!contentElement.value) return;

  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  // Check if the selection is within our content element
  if (contentElement.value.contains(range.commonAncestorContainer)) {
    console.log('Text selection detected in TextElement');
    // The global selection manager will handle saving the selection
  }
}

// Handle mouse down event
function handleMouseDown() {
  // Focus the element
  if (contentElement.value) {
    contentElement.value.focus();
  }
}

// Apply style to selected text
function applyStyleToSelectedText(styleProperty: string, value: string | boolean) {
  console.log(`Applying style: ${styleProperty} = ${value} to selected text`)

  if (!contentElement.value) {
    console.error('No content element found')
    return false
  }

  // Focus the content element to ensure selection works
  contentElement.value.focus()

  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) {
    console.error('No selection found')
    return false
  }

  const range = selection.getRangeAt(0)
  console.log('Selection range:', range.toString())

  // If no text is selected, return false (will apply to whole element instead)
  if (range.collapsed) {
    console.error('Range is collapsed (no text selected)')
    return false
  }

  // Make sure the selection is within our content element
  if (!contentElement.value.contains(range.commonAncestorContainer)) {
    console.error('Selection is not within content element')
    return false
  }

  console.log('Selection is valid, applying style...')

  // Apply the style to the selected text
  let command = ''
  let value2 = value

  switch (styleProperty) {
    case 'bold':
      command = 'bold'
      break
    case 'italic':
      command = 'italic'
      break
    case 'underline':
      command = 'underline'
      break
    case 'fontName':
      command = 'fontName'
      break
    case 'fontSize':
      command = 'fontSize'
      value2 = value + 'px'
      break
    case 'foreColor':
      command = 'foreColor'
      break
    case 'backColor':
      command = 'backColor'
      break
    case 'justifyLeft':
    case 'justifyCenter':
    case 'justifyRight':
    case 'justifyFull':
      command = styleProperty
      value2 = null
      break
    default:
      console.log(`Using custom span for style: ${styleProperty}`)
      // For unsupported commands, wrap in a span with inline style
      const span = document.createElement('span')
      span.style.setProperty(styleProperty, value as string)

      // Extract the selected content
      const fragment = range.extractContents()
      span.appendChild(fragment)

      // Insert the styled span
      range.insertNode(span)

      // Update selection to include the new span
      selection.removeAllRanges()
      const newRange = document.createRange()
      newRange.selectNodeContents(span)
      selection.addRange(newRange)

      // Update the element content
      const updatedElement = {
        ...props.element,
        content: contentElement.value.innerHTML
      }

      emit('update:element', updatedElement)
      console.log('Style applied successfully with span')
      return true
  }

  // For supported commands, use execCommand
  if (command) {
    console.log(`Using execCommand: ${command} with value: ${value2}`)
    document.execCommand(command, false, value2 as string | null)

    // Update the element content
    const updatedElement = {
      ...props.element,
      content: contentElement.value.innerHTML
    }

    emit('update:element', updatedElement)
    console.log('Style applied successfully with execCommand')
    return true
  }

  console.error('Failed to apply style')
  return false
}

// No longer needed - using direct text selection utility instead

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

// Set up mutation observer to track DOM changes
function setupMutationObserver() {
  if (!contentElement.value) return

  observer = new MutationObserver((mutations) => {
    if (isUpdating) return

    // If the content changed, update the element
    const contentChanged = mutations.some(mutation =>
      mutation.type === 'childList' || mutation.type === 'characterData'
    )

    if (contentChanged) {
      handleTextChange({ target: contentElement.value } as unknown as Event)
    }
  })

  observer.observe(contentElement.value, {
    childList: true,
    characterData: true,
    subtree: true
  })
}

// Expose methods to parent components
defineExpose({
  // No special methods needed anymore, selection is handled by the global selection manager
})

onMounted(() => {
  if (contentElement.value) {
    // Set initial content
    contentElement.value.innerHTML = props.element.content || ''

    // Ensure the element has proper attributes for editing
    contentElement.value.setAttribute('contenteditable', 'true')
    contentElement.value.setAttribute('spellcheck', 'false') // Disable spell checking to avoid browser interference

    // Apply styles directly to ensure they take effect immediately
    Object.assign(contentElement.value.style, textStyle.value)

    // Set up mutation observer
    setupMutationObserver()

    // Add a click handler to ensure focus works correctly
    contentElement.value.addEventListener('click', (e) => {
      if (e.target === contentElement.value) {
        contentElement.value.focus()
      }
    })
  }
})

onBeforeUnmount(() => {
  // Clean up mutation observer
  if (observer) {
    observer.disconnect()
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
    outline: none !important;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    caret-color: black; /* Ensure the caret is visible with high contrast */

    /* Ensure proper cursor positioning */
    &:focus {
      outline: none !important;
      box-shadow: none !important;
    }

    /* Fix for cursor position after line break */
    br {
      display: block;
      content: "";
      margin-top: 0;
      line-height: inherit;
    }

    /* Ensure empty lines are visible */
    &:empty::after {
      content: "\00a0"; /* Non-breaking space */
      display: inline;
    }

    /* Fix for cursor positioning on Enter key press */
    &[contenteditable] {
      -webkit-user-select: text;
      user-select: text;
      position: relative;
      cursor: text;
    }
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