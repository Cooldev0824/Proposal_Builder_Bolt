<template>
  <div
    :class="[
      'base-element',
      { 'base-element--selected': isSelected },
      { 'base-element--dragging': isDragging },
      { 'base-element--resizing': isResizing }
    ]"
    :style="elementStyle"
    @mousedown="handleMouseDown"
    @click.stop="handleClick"
  >
    <slot></slot>
    
    <div v-if="isSelected" class="base-element__controls">
      <div
        v-for="handle in resizeHandles"
        :key="handle.position"
        :class="[
          'base-element__resize-handle',
          `base-element__resize-handle--${handle.position}`
        ]"
        @mousedown.stop="(event) => startResize(event, handle.position)"
      ></div>
      
      <div class="base-element__toolbar">
        <slot name="toolbar">
          <button
            class="base-element__toolbar-button"
            title="Bring to front"
            @click.stop="bringToFront"
          >
            <v-icon size="small">mdi-arrow-up-bold</v-icon>
          </button>
          
          <button
            class="base-element__toolbar-button"
            title="Send to back"
            @click.stop="sendToBack"
          >
            <v-icon size="small">mdi-arrow-down-bold</v-icon>
          </button>
          
          <button
            class="base-element__toolbar-button"
            title="Delete"
            @click.stop="removeElement"
          >
            <v-icon size="small">mdi-delete</v-icon>
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, onMounted, onBeforeUnmount } from 'vue';
import { DocumentElement } from '../../../types/document';
import { useDocumentStore } from '../../../stores/documentStore';
import { useDocumentElement } from '../../../composables/useDocumentElement';

export default defineComponent({
  name: 'BaseElement',
  
  props: {
    /**
     * The document element
     */
    element: {
      type: Object as PropType<DocumentElement>,
      required: true
    },
    
    /**
     * Whether the element is selected
     */
    isSelected: {
      type: Boolean,
      default: false
    },
    
    /**
     * Minimum width of the element
     */
    minWidth: {
      type: Number,
      default: 50
    },
    
    /**
     * Minimum height of the element
     */
    minHeight: {
      type: Number,
      default: 30
    },
    
    /**
     * Grid size for snapping
     */
    gridSize: {
      type: Number,
      default: 10
    },
    
    /**
     * Whether to allow resizing
     */
    allowResize: {
      type: Boolean,
      default: true
    },
    
    /**
     * Whether to allow dragging
     */
    allowDrag: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['update:element', 'select', 'deselect', 'remove'],
  
  setup(props, { emit }) {
    const documentStore = useDocumentStore();
    
    // Use the document element composable
    const {
      isSelected,
      isDragging,
      isResizing,
      elementStyle,
      selectElement,
      deselectElement,
      startDrag,
      handleDrag,
      stopDrag,
      startResize: startResizeBase,
      handleResize,
      stopResize,
      updateElementPosition,
      updateElementSize,
      updateElementStyle,
      updateElementZIndex,
      bringToFront: bringToFrontBase,
      sendToBack: sendToBackBase
    } = useDocumentElement(
      computed(() => props.element),
      {
        minWidth: props.minWidth,
        minHeight: props.minHeight,
        gridSize: props.gridSize
      }
    );
    
    // Resize handles
    const resizeHandles = [
      { position: 'n' },
      { position: 'ne' },
      { position: 'e' },
      { position: 'se' },
      { position: 's' },
      { position: 'sw' },
      { position: 'w' },
      { position: 'nw' }
    ];
    
    /**
     * Handle mouse down event
     * 
     * @param {MouseEvent} event - Mouse event
     */
    function handleMouseDown(event: MouseEvent) {
      if (!props.allowDrag) return;
      
      // Start dragging
      startDrag(event);
      
      // Add event listeners for dragging
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', stopDrag);
    }
    
    /**
     * Handle click event
     * 
     * @param {MouseEvent} event - Mouse event
     */
    function handleClick(event: MouseEvent) {
      // Select the element
      selectElement();
      emit('select', props.element);
      
      // Update the selected element in the document store
      documentStore.selectElement(props.element.id);
    }
    
    /**
     * Start resizing the element
     * 
     * @param {MouseEvent} event - Mouse event
     * @param {string} direction - Resize direction
     */
    function startResize(event: MouseEvent, direction: string) {
      if (!props.allowResize) return;
      
      // Start resizing
      startResizeBase(event);
      
      // Add event listeners for resizing
      document.addEventListener('mousemove', (e) => handleResize(e, direction));
      document.addEventListener('mouseup', stopResize);
    }
    
    /**
     * Bring the element to front
     */
    function bringToFront() {
      // Get the maximum z-index
      const maxZIndex = documentStore.getMaxZIndex();
      
      // Update the element z-index
      updateElementZIndex(maxZIndex + 1);
      
      // Emit the updated element
      emit('update:element', props.element);
    }
    
    /**
     * Send the element to back
     */
    function sendToBack() {
      // Get the minimum z-index
      const minZIndex = documentStore.getMinZIndex();
      
      // Update the element z-index
      updateElementZIndex(minZIndex - 1);
      
      // Emit the updated element
      emit('update:element', props.element);
    }
    
    /**
     * Remove the element
     */
    function removeElement() {
      emit('remove', props.element);
      documentStore.removeElement(props.element.id);
    }
    
    // Clean up event listeners
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', stopResize);
    });
    
    return {
      isSelected,
      isDragging,
      isResizing,
      elementStyle,
      resizeHandles,
      handleMouseDown,
      handleClick,
      startResize,
      bringToFront,
      sendToBack,
      removeElement
    };
  }
});
</script>

<style scoped>
.base-element {
  position: absolute;
  box-sizing: border-box;
  user-select: none;
  cursor: move;
}

.base-element--selected {
  outline: 2px solid #0C84FE;
}

.base-element--dragging {
  opacity: 0.8;
  cursor: grabbing;
}

.base-element--resizing {
  cursor: nwse-resize;
}

.base-element__controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.base-element__resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #0C84FE;
  border: 1px solid white;
  border-radius: 50%;
  pointer-events: all;
}

.base-element__resize-handle--n {
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  cursor: n-resize;
}

.base-element__resize-handle--ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.base-element__resize-handle--e {
  top: 50%;
  right: -4px;
  transform: translateY(-50%);
  cursor: e-resize;
}

.base-element__resize-handle--se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.base-element__resize-handle--s {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  cursor: s-resize;
}

.base-element__resize-handle--sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.base-element__resize-handle--w {
  top: 50%;
  left: -4px;
  transform: translateY(-50%);
  cursor: w-resize;
}

.base-element__resize-handle--nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.base-element__toolbar {
  position: absolute;
  top: -40px;
  right: 0;
  display: flex;
  gap: 4px;
  background-color: white;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: all;
}

.base-element__toolbar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #6E7275;
}

.base-element__toolbar-button:hover {
  background-color: #F5F7FA;
  color: #0C84FE;
}
</style>
