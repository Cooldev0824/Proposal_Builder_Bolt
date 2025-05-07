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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { DocumentElement } from '../../../types/document'
import { saveSelection } from '../../../utils/selectionManager'

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
    backgroundColor: props.element.style?.blockBackground ?
      props.element.style?.blockBackgroundColor || '#f5f5f5' :
      'transparent',
    padding: '8px',
    borderRadius: '4px',
    border: props.isSelected ? '2px solid var(--primary)' : '2px solid transparent',
    cursor: isEditing.value ? 'text' : 'move',
    zIndex: props.element.zIndex ?? 0
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
    backgroundColor: style.blockBackground ? 'transparent' : (style.backgroundColor || 'transparent'),
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
watch(() => props.element.style, (newStyle) => {
  console.log('TextElement: style changed', newStyle)

  // Update the text style
  if (contentElement.value) {
    Object.assign(contentElement.value.style, textStyle.value)
  }

  // Force update of the element style for block background
  if (newStyle?.blockBackground) {
    console.log('Updating block background color:', newStyle.blockBackgroundColor)
    const elementDiv = contentElement.value?.parentElement
    if (elementDiv) {
      elementDiv.style.backgroundColor = newStyle.blockBackgroundColor || '#f5f5f5'
    }
  }
}, { deep: true, immediate: true })

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

  // Save the current selection state with more detailed information
  const range = selection.getRangeAt(0)
  const container = range.endContainer
  const offset = range.endOffset

  // Save the path to the node for more reliable restoration
  const nodePath = getNodePath(container)

  // Save text before and after cursor for text-based restoration
  let textBeforeCursor = ''
  let textAfterCursor = ''

  try {
    // Create a range from the start of the content to the cursor
    const beforeRange = document.createRange()
    beforeRange.setStart(contentElement.value, 0)
    beforeRange.setEnd(range.endContainer, range.endOffset)
    textBeforeCursor = beforeRange.toString()

    // Create a range from the cursor to the end of the content
    const afterRange = document.createRange()
    afterRange.setStart(range.endContainer, range.endOffset)
    afterRange.setEnd(contentElement.value, contentElement.value.childNodes.length)
    textAfterCursor = afterRange.toString()
  } catch (error) {
    console.error('Error getting text around cursor:', error)
  }

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
      if (!contentElement.value) {
        isUpdating = false
        return
      }

      // Focus the element
      contentElement.value.focus()

      // First try to restore using the original container reference
      if (container && contentElement.value.contains(container)) {
        // Create a new range at the saved position
        const newRange = document.createRange()

        // Ensure the offset is valid for the container
        const maxOffset = container.nodeType === Node.TEXT_NODE
          ? (container.textContent?.length || 0)
          : container.childNodes.length

        const safeOffset = Math.min(offset, maxOffset)

        newRange.setStart(container, safeOffset)
        newRange.setEnd(container, safeOffset)

        // Apply the selection
        selection.removeAllRanges()
        selection.addRange(newRange)

        console.log('Cursor restored using direct container reference')
      }
      // If that fails, try using the node path
      else if (nodePath) {
        const nodeAtPath = findNodeAtPath(nodePath)
        if (nodeAtPath) {
          // Create a new range at the saved position
          const newRange = document.createRange()

          // Ensure the offset is valid for the node
          const maxOffset = nodeAtPath.nodeType === Node.TEXT_NODE
            ? (nodeAtPath.textContent?.length || 0)
            : nodeAtPath.childNodes.length

          const safeOffset = Math.min(offset, maxOffset)

          newRange.setStart(nodeAtPath, safeOffset)
          newRange.setEnd(nodeAtPath, safeOffset)

          // Apply the selection
          selection.removeAllRanges()
          selection.addRange(newRange)

          console.log('Cursor restored using node path')
        }
        // If node path fails, try text-based approach
        else if (textBeforeCursor) {
          // Get all text nodes
          const textNodes = []
          const walker = document.createTreeWalker(
            contentElement.value,
            NodeFilter.SHOW_TEXT,
            null
          )

          let node
          while (node = walker.nextNode()) {
            textNodes.push(node)
          }

          if (textNodes.length > 0) {
            // Combine all text content
            let fullText = ''
            const nodePositions = []

            textNodes.forEach(node => {
              const startPos = fullText.length
              fullText += node.textContent
              const endPos = fullText.length

              nodePositions.push({
                node,
                startPos,
                endPos
              })
            })

            // Find the position in the full text that matches our cursor position
            const cursorPos = textBeforeCursor.length

            // Find which node contains the cursor position
            let targetNode = null
            let targetOffset = 0

            for (const pos of nodePositions) {
              if (cursorPos >= pos.startPos && cursorPos <= pos.endPos) {
                targetNode = pos.node
                targetOffset = cursorPos - pos.startPos
                break
              }
            }

            // If we found a node, set the cursor position
            if (targetNode) {
              const newRange = document.createRange()
              newRange.setStart(targetNode, targetOffset)
              newRange.setEnd(targetNode, targetOffset)
              selection.removeAllRanges()
              selection.addRange(newRange)
              console.log('Cursor restored using text content approach')
            }
          }
        }
      }
    } catch (error) {
      console.error('Error restoring selection:', error)
    } finally {
      isUpdating = false
    }
  }, 10)
}

// Handle key down events
function handleKeyDown(event: KeyboardEvent) {
  // Handle Enter key press (both with and without Shift)
  // We treat all Enter key presses as Shift+Enter (inserting a line break instead of a paragraph)
  if (event.key === 'Enter') {
    event.preventDefault()
    event.stopPropagation() // Prevent event bubbling

    if (!contentElement.value) return

    // Get the current selection
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    // Get the current range
    const range = selection.getRangeAt(0)

    // Save the current cursor position information
    const cursorContainer = range.endContainer;
    const cursorOffset = range.endOffset;

    // Create a <br> element
    const br = document.createElement('br')

    // Also create a text node with a zero-width space to ensure cursor positioning works
    const textNode = document.createTextNode('\u200B')

    // Insert the <br> element
    range.deleteContents()
    range.insertNode(br)

    // Insert the text node after the <br>
    const newRange = document.createRange()
    newRange.setStartAfter(br)
    newRange.setEndAfter(br)
    newRange.insertNode(textNode)

    // Move the cursor after the text node
    newRange.setStartAfter(textNode)
    newRange.setEndAfter(textNode)
    selection.removeAllRanges()
    selection.addRange(newRange)

    // Flag to prevent cursor position from being overwritten
    isUpdating = true

    // Update the element content
    const updatedElement = {
      ...props.element,
      content: contentElement.value.innerHTML
    }

    // Emit the update
    emit('update:element', updatedElement)

    // Restore cursor position after Vue updates the DOM
    setTimeout(() => {
      try {
        if (!contentElement.value) {
          isUpdating = false
          return
        }

        // Focus the element
        contentElement.value.focus()

        // Find the <br> element we just inserted
        const allBrs = contentElement.value.querySelectorAll('br')
        if (allBrs.length > 0) {
          // Get the last <br> element (the one we just inserted)
          const lastBr = allBrs[allBrs.length - 1]

          // Create a range after this <br>
          const restoreRange = document.createRange()
          restoreRange.setStartAfter(lastBr)
          restoreRange.setEndAfter(lastBr)

          // Apply the selection
          selection.removeAllRanges()
          selection.addRange(restoreRange)

          console.log('Cursor position restored after Enter key press')
        } else {
          console.warn('Could not find the inserted <br> element')
        }
      } catch (error) {
        console.error('Error restoring cursor position after Enter key press:', error)
      } finally {
        isUpdating = false
      }
    }, 10)

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
  // Small delay to ensure the selection is properly set
  setTimeout(() => {
    // Emit an event to notify that text might be selected
    emitSelectionState();
  }, 0);
}

// Handle key up event - selection is now handled by the global selection manager
function handleKeyUp(event: KeyboardEvent) {
  // Check for selection changes on key up
  if (event.key === 'Shift' ||
      event.key.includes('Arrow') ||
      event.key === 'Home' ||
      event.key === 'End' ||
      event.ctrlKey ||
      event.metaKey) {

    // Small delay to ensure the selection is properly set
    setTimeout(() => {
      emitSelectionState();
    }, 0);
  }
}

// Function to emit selection state
function emitSelectionState() {
  if (!contentElement.value) return;

  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  // Skip if no text is selected
  if (range.collapsed) return;

  // Check if the selection is within our content element
  if (contentElement.value.contains(range.commonAncestorContainer)) {
    console.log('Text selection detected in TextElement', {
      elementId: props.element.id,
      text: range.toString()
    });

    // Force focus on the content element to ensure the selection is active
    contentElement.value.focus();

    // Explicitly call saveSelection from the selection manager
    const saved = saveSelection();
    console.log('Selection saved:', saved);
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
      // Special handling for font size
      console.log('Special handling for font size:', value)

      // Create a span with the specified font size
      const fontSizeSpan = document.createElement('span')
      fontSizeSpan.style.fontSize = value + 'px'

      // Extract the selected content
      const fontSizeFragment = range.extractContents()
      fontSizeSpan.appendChild(fontSizeFragment)

      // Insert the styled span
      range.insertNode(fontSizeSpan)

      // Update selection to include the new span
      selection.removeAllRanges()
      const fontSizeRange = document.createRange()
      fontSizeRange.selectNodeContents(fontSizeSpan)
      selection.addRange(fontSizeRange)

      // Update the element content
      const fontSizeUpdatedElement = {
        ...props.element,
        content: contentElement.value.innerHTML
      }

      emit('update:element', fontSizeUpdatedElement)
      console.log('Font size applied successfully with span')
      return true
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

  // Calculate new position
  let newX = startLeft + deltaX
  let newY = startTop + deltaY

  // Snap to grid (10px grid)
  const gridSize = 10
  newX = Math.round(newX / gridSize) * gridSize
  newY = Math.round(newY / gridSize) * gridSize

  const updatedElement = {
    ...props.element,
    position: {
      x: newX,
      y: newY
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

  // Calculate new size
  let newWidth = Math.max(100, startWidth + deltaX)
  let newHeight = Math.max(50, startHeight + deltaY)

  // Snap to grid (10px grid)
  const gridSize = 10
  newWidth = Math.round(newWidth / gridSize) * gridSize
  newHeight = Math.round(newHeight / gridSize) * gridSize

  const newSize = {
    width: newWidth,
    height: newHeight
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
      // Add a small delay to ensure the DOM has settled
      setTimeout(() => {
        handleTextChange({ target: contentElement.value } as unknown as Event)
      }, 10)
    }
  })

  observer.observe(contentElement.value, {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  })
}

// Initialize the component
onMounted(() => {
  // Apply initial styles
  nextTick(() => {
    // Force update of the element style for block background
    if (props.element.style?.blockBackground) {
      console.log('Initial block background color:', props.element.style.blockBackgroundColor)
      const elementDiv = contentElement.value?.parentElement
      if (elementDiv) {
        elementDiv.style.backgroundColor = props.element.style.blockBackgroundColor || '#f5f5f5'
      }
    }
  })
})

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
    contentElement.value.setAttribute('data-text-element', 'true') // Add a data attribute for easier selection

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

    // Add a mouseup handler to ensure selection is saved
    contentElement.value.addEventListener('mouseup', () => {
      // Add a small delay to ensure the selection is complete
      setTimeout(() => {
        // Save the selection for text formatting
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
          console.log('Selection saved in TextElement mouseup handler');
        }
      }, 10);
    });

    // Add a keyup handler to ensure selection is saved after keyboard navigation
    contentElement.value.addEventListener('keyup', (e) => {
      // Only for navigation keys and shift (for selection)
      if (e.key.includes('Arrow') || e.key === 'Home' || e.key === 'End' ||
          e.key === 'PageUp' || e.key === 'PageDown' || e.key === 'Shift') {
        // Save the selection for text formatting
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
          console.log('Selection saved in TextElement keyup handler');
        }
      }
    });
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
      min-height: 1.5em; /* Ensure line breaks have consistent height */
      user-select: none; /* Prevent selection of line breaks */
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

    /* Improve text selection visibility */
    &::selection {
      background-color: rgba(0, 123, 255, 0.3) !important;
      color: inherit !important;
    }

    /* Ensure spans created by text formatting are properly styled */
    span {
      display: inline;
      vertical-align: baseline;
      line-height: normal; /* Prevent line height issues with font size changes */
    }

    /* Ensure font size spans are displayed correctly */
    span[style*="font-size"] {
      display: inline;
      vertical-align: baseline;
      line-height: normal;
    }

    /* Handle zero-width spaces used for cursor positioning */
    &:after br {
      content: "";
      white-space: pre;
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