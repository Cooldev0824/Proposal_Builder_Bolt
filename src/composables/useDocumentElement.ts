/**
 * Composable for handling document elements
 * 
 * This composable provides functionality for working with document elements,
 * including selection, positioning, resizing, and styling.
 */

import { ref, computed, Ref } from 'vue';
import { DocumentElement, Position, Size } from '../types/document';
import { useDocumentStore } from '../stores/documentStore';
import { useHistoryStore } from '../stores/historyStore';
import { Z_INDEX } from '../constants/dimensions';

/**
 * Options for the useDocumentElement composable
 */
interface UseDocumentElementOptions {
  /**
   * Minimum width of the element in pixels
   */
  minWidth?: number;
  
  /**
   * Minimum height of the element in pixels
   */
  minHeight?: number;
  
  /**
   * Grid size for snapping
   */
  gridSize?: number;
  
  /**
   * Whether to track history changes
   */
  trackHistory?: boolean;
}

/**
 * Composable for handling document elements
 * 
 * @param {Ref<DocumentElement>} element - The document element to handle
 * @param {UseDocumentElementOptions} options - Options for the composable
 * @returns {Object} Object containing element handling functionality
 */
export function useDocumentElement(
  element: Ref<DocumentElement>,
  options: UseDocumentElementOptions = {}
) {
  // Default options
  const {
    minWidth = 50,
    minHeight = 30,
    gridSize = 10,
    trackHistory = true
  } = options;
  
  // Stores
  const documentStore = useDocumentStore();
  const historyStore = useHistoryStore();
  
  // State
  const isSelected = ref(false);
  const isDragging = ref(false);
  const isResizing = ref(false);
  const dragStartPosition = ref<Position | null>(null);
  const resizeStartSize = ref<Size | null>(null);
  const resizeStartPosition = ref<Position | null>(null);
  
  // Computed properties
  const elementStyle = computed(() => {
    return {
      position: 'absolute',
      left: `${element.value.position.x}px`,
      top: `${element.value.position.y}px`,
      width: `${element.value.size.width}px`,
      height: `${element.value.size.height}px`,
      zIndex: element.value.zIndex || Z_INDEX.CONTENT
    };
  });
  
  /**
   * Select the element
   */
  function selectElement() {
    isSelected.value = true;
    documentStore.selectElement(element.value.id);
  }
  
  /**
   * Deselect the element
   */
  function deselectElement() {
    isSelected.value = false;
    documentStore.deselectElement(element.value.id);
  }
  
  /**
   * Start dragging the element
   * 
   * @param {MouseEvent} event - Mouse event
   */
  function startDrag(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    isDragging.value = true;
    dragStartPosition.value = {
      x: event.clientX - element.value.position.x,
      y: event.clientY - element.value.position.y
    };
    
    selectElement();
    
    // Add event listeners for dragging
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
  }
  
  /**
   * Handle element dragging
   * 
   * @param {MouseEvent} event - Mouse event
   */
  function handleDrag(event: MouseEvent) {
    if (!isDragging.value || !dragStartPosition.value) return;
    
    // Calculate new position
    let newX = event.clientX - dragStartPosition.value.x;
    let newY = event.clientY - dragStartPosition.value.y;
    
    // Snap to grid if gridSize is provided
    if (gridSize > 1) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }
    
    // Prevent negative positions
    newX = Math.max(0, newX);
    newY = Math.max(0, newY);
    
    // Update element position
    updateElementPosition({ x: newX, y: newY });
  }
  
  /**
   * Stop dragging the element
   */
  function stopDrag() {
    if (isDragging.value && trackHistory) {
      historyStore.addHistoryEntry({
        type: 'move',
        elementId: element.value.id,
        oldValue: dragStartPosition.value ? {
          x: element.value.position.x - (event.clientX - dragStartPosition.value.x),
          y: element.value.position.y - (event.clientY - dragStartPosition.value.y)
        } : element.value.position,
        newValue: element.value.position
      });
    }
    
    isDragging.value = false;
    dragStartPosition.value = null;
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
  }
  
  /**
   * Start resizing the element
   * 
   * @param {MouseEvent} event - Mouse event
   */
  function startResize(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    isResizing.value = true;
    resizeStartSize.value = { ...element.value.size };
    resizeStartPosition.value = {
      x: event.clientX,
      y: event.clientY
    };
    
    selectElement();
    
    // Add event listeners for resizing
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  }
  
  /**
   * Handle element resizing
   * 
   * @param {MouseEvent} event - Mouse event
   * @param {string} direction - Resize direction
   */
  function handleResize(event: MouseEvent, direction: string = 'se') {
    if (!isResizing.value || !resizeStartSize.value || !resizeStartPosition.value) return;
    
    // Calculate size changes
    const deltaX = event.clientX - resizeStartPosition.value.x;
    const deltaY = event.clientY - resizeStartPosition.value.y;
    
    // Calculate new size based on direction
    let newWidth = resizeStartSize.value.width;
    let newHeight = resizeStartSize.value.height;
    
    if (direction.includes('e')) {
      newWidth = Math.max(minWidth, resizeStartSize.value.width + deltaX);
    } else if (direction.includes('w')) {
      newWidth = Math.max(minWidth, resizeStartSize.value.width - deltaX);
    }
    
    if (direction.includes('s')) {
      newHeight = Math.max(minHeight, resizeStartSize.value.height + deltaY);
    } else if (direction.includes('n')) {
      newHeight = Math.max(minHeight, resizeStartSize.value.height - deltaY);
    }
    
    // Snap to grid if gridSize is provided
    if (gridSize > 1) {
      newWidth = Math.round(newWidth / gridSize) * gridSize;
      newHeight = Math.round(newHeight / gridSize) * gridSize;
    }
    
    // Update element size
    updateElementSize({ width: newWidth, height: newHeight });
  }
  
  /**
   * Stop resizing the element
   */
  function stopResize() {
    if (isResizing.value && trackHistory) {
      historyStore.addHistoryEntry({
        type: 'resize',
        elementId: element.value.id,
        oldValue: resizeStartSize.value,
        newValue: element.value.size
      });
    }
    
    isResizing.value = false;
    resizeStartSize.value = null;
    resizeStartPosition.value = null;
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  }
  
  /**
   * Update element position
   * 
   * @param {Position} position - New position
   */
  function updateElementPosition(position: Position) {
    element.value = {
      ...element.value,
      position
    };
  }
  
  /**
   * Update element size
   * 
   * @param {Size} size - New size
   */
  function updateElementSize(size: Size) {
    element.value = {
      ...element.value,
      size
    };
  }
  
  /**
   * Update element style
   * 
   * @param {Partial<any>} style - New style properties
   */
  function updateElementStyle(style: Partial<any>) {
    element.value = {
      ...element.value,
      style: {
        ...element.value.style,
        ...style
      }
    };
  }
  
  /**
   * Update element z-index
   * 
   * @param {number} zIndex - New z-index
   */
  function updateElementZIndex(zIndex: number) {
    element.value = {
      ...element.value,
      zIndex
    };
  }
  
  /**
   * Bring element to front
   */
  function bringToFront() {
    const maxZIndex = documentStore.getMaxZIndex();
    updateElementZIndex(maxZIndex + 1);
  }
  
  /**
   * Send element to back
   */
  function sendToBack() {
    const minZIndex = documentStore.getMinZIndex();
    updateElementZIndex(minZIndex - 1);
  }
  
  return {
    // State
    isSelected,
    isDragging,
    isResizing,
    
    // Computed
    elementStyle,
    
    // Methods
    selectElement,
    deselectElement,
    startDrag,
    handleDrag,
    stopDrag,
    startResize,
    handleResize,
    stopResize,
    updateElementPosition,
    updateElementSize,
    updateElementStyle,
    updateElementZIndex,
    bringToFront,
    sendToBack
  };
}
