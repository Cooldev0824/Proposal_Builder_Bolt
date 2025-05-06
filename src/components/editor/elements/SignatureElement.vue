<template>
  <div 
    class="signature-element element"
    :class="{ selected: isSelected }"
    :style="elementStyle"
    @mousedown.stop="startDrag"
  >
    <div v-if="!element.content" class="signature-placeholder" @click="openSignatureCanvas">
      <span>{{ element.style?.label || 'Click to sign' }}</span>
    </div>
    <img v-else :src="element.content" alt="Signature" class="signature-image" />
    <div v-if="isSelected" class="resize-handle" @mousedown.stop="startResize"></div>
    
    <!-- Signature canvas dialog -->
    <v-dialog v-model="signatureDialog" max-width="600">
      <v-card>
        <v-card-title>Add Signature</v-card-title>
        <v-card-text>
          <div class="signature-canvas-container">
            <canvas ref="signatureCanvas" class="signature-canvas"></canvas>
          </div>
          <div class="signature-actions">
            <v-btn text @click="clearSignature">Clear</v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="signatureDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveSignature">Save Signature</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import SignaturePad from 'signature_pad'
import type { DocumentElement } from '../../../types/document'

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

// Signature pad
const signatureDialog = ref(false)
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
let signaturePad: SignaturePad | null = null

const elementStyle = computed(() => {
  return {
    left: `${props.element.position.x}px`,
    top: `${props.element.position.y}px`,
    width: `${props.element.size.width}px`,
    height: `${props.element.size.height}px`,
    borderBottom: props.element.style?.borderBottom || '1px solid #000000',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: props.isSelected ? '2px solid var(--primary)' : '1px solid var(--border)'
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
    width: Math.max(150, startWidth + deltaX),
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

function openSignatureCanvas() {
  signatureDialog.value = true
}

function setupSignaturePad() {
  if (signatureCanvas.value && !signaturePad) {
    const canvas = signatureCanvas.value
    canvas.width = 560
    canvas.height = 260
    
    signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      minWidth: 0.5,
      maxWidth: 2.5,
      throttle: 16,
      velocityFilterWeight: 0.7
    })
  }
}

function clearSignature() {
  if (signaturePad) {
    signaturePad.clear()
  }
}

function saveSignature() {
  if (signaturePad && !signaturePad.isEmpty()) {
    const signatureData = signaturePad.toDataURL()
    
    const updatedElement = {
      ...props.element,
      content: signatureData
    }
    
    emit('update:element', updatedElement)
  }
  
  signatureDialog.value = false
}

watch(signatureDialog, (isOpen) => {
  if (isOpen) {
    // Wait for the DOM to update
    setTimeout(() => {
      setupSignaturePad()
    }, 100)
  } else {
    signaturePad = null
  }
})

onMounted(() => {
  // Initialize if the dialog is already open
  if (signatureDialog.value) {
    setupSignaturePad()
  }
})
</script>

<style scoped lang="scss">
.signature-element {
  position: absolute;
  cursor: move;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  
  &.selected {
    outline: none;
  }
}

.signature-placeholder {
  cursor: pointer;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-style: italic;
}

.signature-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom;
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

.signature-canvas-container {
  border: 1px solid var(--border);
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;
}

.signature-canvas {
  width: 100%;
  height: 260px;
  background-color: white;
  touch-action: none;
}

.signature-actions {
  display: flex;
  justify-content: flex-start;
}
</style>