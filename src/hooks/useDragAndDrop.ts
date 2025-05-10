/**
 * Hook for handling drag and drop functionality
 * 
 * This hook provides functionality for implementing drag and drop behavior.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * Options for the useDragAndDrop hook
 */
interface UseDragAndDropOptions {
  /**
   * Whether to enable drag and drop immediately (default: true)
   */
  enabled?: boolean;
  
  /**
   * Whether to prevent default browser behavior (default: true)
   */
  preventDefault?: boolean;
  
  /**
   * Whether to stop event propagation (default: false)
   */
  stopPropagation?: boolean;
  
  /**
   * Callback when drag starts
   */
  onDragStart?: (event: DragEvent) => void;
  
  /**
   * Callback when dragging
   */
  onDrag?: (event: DragEvent) => void;
  
  /**
   * Callback when drag ends
   */
  onDragEnd?: (event: DragEvent) => void;
  
  /**
   * Callback when drag enters a drop target
   */
  onDragEnter?: (event: DragEvent) => void;
  
  /**
   * Callback when drag is over a drop target
   */
  onDragOver?: (event: DragEvent) => void;
  
  /**
   * Callback when drag leaves a drop target
   */
  onDragLeave?: (event: DragEvent) => void;
  
  /**
   * Callback when item is dropped
   */
  onDrop?: (event: DragEvent) => void;
}

/**
 * Hook for handling drag and drop functionality
 * 
 * @param {HTMLElement | null} dragElement - Element that can be dragged
 * @param {HTMLElement | null} dropElement - Element that accepts drops
 * @param {UseDragAndDropOptions} options - Options for the hook
 * @returns {Object} Object containing drag and drop functionality
 */
export function useDragAndDrop(
  dragElement: HTMLElement | null,
  dropElement: HTMLElement | null,
  options: UseDragAndDropOptions = {}
) {
  // Default options
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop
  } = options;
  
  // State
  const isDragging = ref(false);
  const isOverDropTarget = ref(false);
  
  /**
   * Handle drag start event
   * 
   * @param {DragEvent} event - Drag event
   */
  function handleDragStart(event: DragEvent) {
    isDragging.value = true;
    
    if (preventDefault) {
      event.preventDefault();
    }
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    // Set dragged data
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
    
    if (onDragStart) {
      onDragStart(event);
    }
  }
  
  /**
   * Handle drag event
   * 
   * @param {DragEvent} event - Drag event
   */
  function handleDrag(event: DragEvent) {
    if (preventDefault) {
      event.preventDefault();
    }
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    if (onDrag) {
      onDrag(event);
    }
  }
  
  /**
   * Handle drag end event
   * 
   * @param {DragEvent} event - Drag event
   */
  function handleDragEnd(event: DragEvent) {
    isDragging.value = false;
    
    if (preventDefault) {
      event.preventDefault();
    }
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    if (onDragEnd) {
      onDragEnd(event);
    }
  }
  
  /**
   * Handle drag enter event
   * 
   * @param {DragEvent} event - Drag event
   */
  function handleDragEnter(event: DragEvent) {
    isOverDropTarget.value = true;
    
    if (preventDefault) {
      event.preventDefault();
    }
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    if (onDragEnter) {
      onDragEnter(event);
    }
  }
  
  /**
   * Handle drag over event
   * 
   * @param {DragEvent} event - Drag event
   */
  function handleDragOver(event: DragEvent) {
    if (preventDefault) {
      event.preventDefault();
    }
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    // Set drop effect
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    
    if (onDragOver) {
      onDragOver(event);
    }
  }
  
  /**
   * Handle drag leave event
   * 
   * @param {DragEvent} event - Drag event
   */
  function handleDragLeave(event: DragEvent) {
    isOverDropTarget.value = false;
    
    if (preventDefault) {
      event.preventDefault();
    }
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    if (onDragLeave) {
      onDragLeave(event);
    }
  }
  
  /**
   * Handle drop event
   * 
   * @param {DragEvent} event - Drag event
   */
  function handleDrop(event: DragEvent) {
    isOverDropTarget.value = false;
    
    if (preventDefault) {
      event.preventDefault();
    }
    
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    if (onDrop) {
      onDrop(event);
    }
  }
  
  /**
   * Enable drag and drop functionality
   */
  function enableDragAndDrop() {
    if (dragElement) {
      dragElement.setAttribute('draggable', 'true');
      dragElement.addEventListener('dragstart', handleDragStart);
      dragElement.addEventListener('drag', handleDrag);
      dragElement.addEventListener('dragend', handleDragEnd);
    }
    
    if (dropElement) {
      dropElement.addEventListener('dragenter', handleDragEnter);
      dropElement.addEventListener('dragover', handleDragOver);
      dropElement.addEventListener('dragleave', handleDragLeave);
      dropElement.addEventListener('drop', handleDrop);
    }
  }
  
  /**
   * Disable drag and drop functionality
   */
  function disableDragAndDrop() {
    if (dragElement) {
      dragElement.removeAttribute('draggable');
      dragElement.removeEventListener('dragstart', handleDragStart);
      dragElement.removeEventListener('drag', handleDrag);
      dragElement.removeEventListener('dragend', handleDragEnd);
    }
    
    if (dropElement) {
      dropElement.removeEventListener('dragenter', handleDragEnter);
      dropElement.removeEventListener('dragover', handleDragOver);
      dropElement.removeEventListener('dragleave', handleDragLeave);
      dropElement.removeEventListener('drop', handleDrop);
    }
  }
  
  // Set up event listeners
  onMounted(() => {
    if (enabled) {
      enableDragAndDrop();
    }
  });
  
  // Clean up event listeners
  onBeforeUnmount(() => {
    disableDragAndDrop();
  });
  
  return {
    // State
    isDragging,
    isOverDropTarget,
    
    // Methods
    enableDragAndDrop,
    disableDragAndDrop
  };
}
