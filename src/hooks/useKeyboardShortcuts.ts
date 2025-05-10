/**
 * Hook for handling keyboard shortcuts
 * 
 * This hook provides functionality for registering and handling keyboard shortcuts.
 */

import { onMounted, onBeforeUnmount } from 'vue';

/**
 * Keyboard shortcut definition
 */
interface KeyboardShortcut {
  /**
   * Key or key combination (e.g., 'a', 'Ctrl+S', 'Shift+Alt+F')
   */
  key: string;
  
  /**
   * Handler function to execute when the shortcut is triggered
   */
  handler: (event: KeyboardEvent) => void;
  
  /**
   * Whether to prevent the default browser behavior
   */
  preventDefault?: boolean;
  
  /**
   * Whether to stop event propagation
   */
  stopPropagation?: boolean;
  
  /**
   * Description of the shortcut for documentation
   */
  description?: string;
}

/**
 * Options for the useKeyboardShortcuts hook
 */
interface UseKeyboardShortcutsOptions {
  /**
   * Target element to attach the event listener to (default: document)
   */
  target?: HTMLElement | Document | null;
  
  /**
   * Whether to enable the shortcuts immediately (default: true)
   */
  enabled?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 * 
 * @param {KeyboardShortcut[]} shortcuts - Array of keyboard shortcuts
 * @param {UseKeyboardShortcutsOptions} options - Options for the hook
 * @returns {Object} Object containing shortcut handling functionality
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  // Default options
  const {
    target = document,
    enabled = true
  } = options;
  
  /**
   * Parse a key string into its components
   * 
   * @param {string} keyString - Key string (e.g., 'Ctrl+S')
   * @returns {Object} Object containing key components
   */
  function parseKeyString(keyString: string) {
    const parts = keyString.split('+');
    const key = parts.pop()?.toLowerCase() || '';
    
    const modifiers = {
      ctrl: parts.some(part => part.toLowerCase() === 'ctrl'),
      alt: parts.some(part => part.toLowerCase() === 'alt'),
      shift: parts.some(part => part.toLowerCase() === 'shift'),
      meta: parts.some(part => part.toLowerCase() === 'meta')
    };
    
    return { key, modifiers };
  }
  
  /**
   * Check if a keyboard event matches a shortcut
   * 
   * @param {KeyboardEvent} event - Keyboard event
   * @param {string} shortcutKey - Shortcut key string
   * @returns {boolean} Whether the event matches the shortcut
   */
  function matchesShortcut(event: KeyboardEvent, shortcutKey: string): boolean {
    const { key, modifiers } = parseKeyString(shortcutKey);
    
    // Check if the key matches
    const eventKey = event.key.toLowerCase();
    if (key !== eventKey && key !== event.code.toLowerCase()) {
      return false;
    }
    
    // Check if modifiers match
    if (modifiers.ctrl !== event.ctrlKey) return false;
    if (modifiers.alt !== event.altKey) return false;
    if (modifiers.shift !== event.shiftKey) return false;
    if (modifiers.meta !== event.metaKey) return false;
    
    return true;
  }
  
  /**
   * Handle keyboard events
   * 
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeyDown(event: KeyboardEvent) {
    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut.key)) {
        if (shortcut.preventDefault) {
          event.preventDefault();
        }
        
        if (shortcut.stopPropagation) {
          event.stopPropagation();
        }
        
        shortcut.handler(event);
        break;
      }
    }
  }
  
  /**
   * Enable keyboard shortcuts
   */
  function enableShortcuts() {
    if (target) {
      target.addEventListener('keydown', handleKeyDown);
    }
  }
  
  /**
   * Disable keyboard shortcuts
   */
  function disableShortcuts() {
    if (target) {
      target.removeEventListener('keydown', handleKeyDown);
    }
  }
  
  /**
   * Get a list of all registered shortcuts
   * 
   * @returns {Array} Array of shortcut information
   */
  function getShortcutsList() {
    return shortcuts.map(shortcut => ({
      key: shortcut.key,
      description: shortcut.description || 'No description'
    }));
  }
  
  // Set up event listeners
  onMounted(() => {
    if (enabled) {
      enableShortcuts();
    }
  });
  
  // Clean up event listeners
  onBeforeUnmount(() => {
    disableShortcuts();
  });
  
  return {
    enableShortcuts,
    disableShortcuts,
    getShortcutsList
  };
}
