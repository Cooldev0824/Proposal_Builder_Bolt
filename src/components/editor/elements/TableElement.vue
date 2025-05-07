<template>
  <div
    class="table-element element"
    :class="{ selected: isSelected }"
    :style="elementStyle"
    @mousedown.stop="startDrag"
  >
    <table class="editor-table" :style="tableStyle">
      <thead>
        <tr>
          <th
            v-for="(header, index) in element.content.headers"
            :key="index"
            @dblclick="editCell('header', index)"
            :style="headerStyle"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in element.content.rows" :key="rowIndex">
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            @dblclick="editCell('cell', rowIndex, cellIndex)"
            :style="cellStyle"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="isSelected" class="resize-handle" @mousedown.stop="startResize"></div>

    <!-- Cell edit dialog -->
    <v-dialog v-model="editDialog" max-width="400">
      <v-card>
        <v-card-title>Edit Cell</v-card-title>
        <v-card-text>
          <v-text-field v-model="editingCellValue" variant="outlined" auto-focus></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="editDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveCellEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DocumentElement } from '../../../types/document'

const props = defineProps<{
  element: DocumentElement
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'update:element', element: DocumentElement): void
}>()

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

// Cell editing
const editDialog = ref(false)
const editingCellValue = ref('')
const editingCellType = ref<'header' | 'cell'>('cell')
const editingRowIndex = ref(-1)
const editingCellIndex = ref(-1)

const elementStyle = computed(() => {
  return {
    left: `${props.element.position.x}px`,
    top: `${props.element.position.y}px`,
    width: `${props.element.size.width}px`,
    minHeight: `${props.element.size.height}px`,
    zIndex: props.element.zIndex ?? 0
  }
})

const tableStyle = computed(() => {
  const style = props.element.style || {}
  return {
    borderCollapse: 'collapse',
    width: '100%',
    borderColor: style.borderColor || '#E2E8F0',
    borderStyle: style.borderStyle || 'solid',
    borderWidth: `${style.borderWidth || 1}px`
  }
})

const headerStyle = computed(() => {
  const style = props.element.style || {}
  return {
    backgroundColor: style.headerBackgroundColor || '#F8F9FA',
    color: style.headerTextColor || '#000000',
    padding: '8px 12px',
    textAlign: 'left',
    fontWeight: 500,
    borderColor: style.borderColor || '#E2E8F0',
    borderStyle: style.borderStyle || 'solid',
    borderWidth: `${style.borderWidth || 1}px`
  }
})

const cellStyle = computed(() => {
  const style = props.element.style || {}
  return {
    backgroundColor: style.cellBackgroundColor || '#FFFFFF',
    color: style.cellTextColor || '#000000',
    padding: '8px 12px',
    borderColor: style.borderColor || '#E2E8F0',
    borderStyle: style.borderStyle || 'solid',
    borderWidth: `${style.borderWidth || 1}px`
  }
})

function startDrag(event: MouseEvent) {
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

  const newPosition = {
    x: startLeft + deltaX,
    y: startTop + deltaY
  }

  const updatedElement = {
    ...props.element,
    position: newPosition
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
    width: Math.max(300, startWidth + deltaX),
    height: Math.max(100, startHeight + deltaY)
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

function editCell(type: 'header' | 'cell', rowIndex: number, cellIndex?: number) {
  editingCellType.value = type
  editingRowIndex.value = rowIndex

  if (type === 'header') {
    editingCellValue.value = props.element.content.headers[rowIndex]
    editingCellIndex.value = -1
  } else {
    if (cellIndex !== undefined) {
      editingCellValue.value = props.element.content.rows[rowIndex][cellIndex]
      editingCellIndex.value = cellIndex
    }
  }

  editDialog.value = true
}

function saveCellEdit() {
  const updatedElement = { ...props.element }

  if (editingCellType.value === 'header') {
    updatedElement.content = {
      ...updatedElement.content,
      headers: [...updatedElement.content.headers]
    }
    updatedElement.content.headers[editingRowIndex.value] = editingCellValue.value
  } else {
    updatedElement.content = {
      ...updatedElement.content,
      rows: [...updatedElement.content.rows]
    }

    updatedElement.content.rows[editingRowIndex.value] = [...updatedElement.content.rows[editingRowIndex.value]]
    updatedElement.content.rows[editingRowIndex.value][editingCellIndex.value] = editingCellValue.value
  }

  emit('update:element', updatedElement)
  editDialog.value = false
}
</script>

<style scoped lang="scss">
.element {
  position: absolute;
  cursor: move;

  &.selected {
    outline: 2px solid var(--primary);
  }
}

.table-element {
  overflow: visible;
  background-color: white;
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
}
</style>