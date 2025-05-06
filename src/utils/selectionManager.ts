/**
 * Global selection manager to handle text selection and formatting
 */

// Store the current selection
let savedRange: Range | null = null;
let savedElement: HTMLElement | null = null;

/**
 * Save the current selection
 */
export function saveSelection(): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return false;

  // Find the contenteditable element containing the selection
  let element = range.commonAncestorContainer as HTMLElement;
  if (element.nodeType !== Node.ELEMENT_NODE) {
    element = element.parentElement as HTMLElement;
  }

  // Find the closest contenteditable element
  while (element && !element.hasAttribute('contenteditable')) {
    element = element.parentElement as HTMLElement;
  }

  if (!element) return false;

  // Make sure the selection is within a text element
  const textElement = element.closest('.text-element');
  if (!textElement) {
    console.log('Selection is not within a text element');
    return false;
  }

  // Save the selection
  savedRange = range.cloneRange();
  savedElement = element;

  console.log('Selection saved', {
    text: range.toString(),
    element: element.tagName
  });

  return true;
}

/**
 * Restore the saved selection
 */
export function restoreSelection(): boolean {
  if (!savedRange || !savedElement) return false;

  // Don't interfere with input fields
  if (isInputActive()) {
    console.log('Cannot restore selection: Input field is active');
    return false;
  }

  try {
    // Focus the element first
    savedElement.focus();

    // Restore the selection
    const selection = window.getSelection();
    if (!selection) return false;

    selection.removeAllRanges();
    selection.addRange(savedRange.cloneRange());

    console.log('Selection restored');
    return true;
  } catch (error) {
    console.error('Error restoring selection:', error);
    return false;
  }
}

/**
 * Check if there is a saved selection
 */
export function hasSavedSelection(): boolean {
  return savedRange !== null && savedElement !== null;
}

/**
 * Clear the saved selection
 */
export function clearSelection(): void {
  savedRange = null;
  savedElement = null;
}

/**
 * Apply a formatting command to the saved selection
 */
export function applyFormatting(command: string, value: string | boolean | null = null): boolean {
  // Don't interfere with input fields
  if (isInputActive()) {
    console.log('Cannot apply formatting: Input field is active');
    return false;
  }

  if (!savedRange || !savedElement) {
    console.error('Cannot apply formatting: No saved selection');
    return false;
  }

  try {
    // Focus the element first to ensure we're working with the right context
    savedElement.focus();

    // Get the current selection
    const selection = window.getSelection();
    if (!selection) return false;

    // Clear any existing selection
    selection.removeAllRanges();

    // Add our saved range
    const range = savedRange.cloneRange();
    selection.addRange(range);

    // Make sure we have a valid selection
    if (selection.rangeCount === 0 || selection.getRangeAt(0).collapsed) {
      console.error('Invalid selection range');
      return false;
    }

    // Apply the formatting
    document.execCommand('styleWithCSS', false, 'true');
    const result = document.execCommand(command, false, value as string);

    // Save the selection again to preserve it for future operations
    saveSelection();

    console.log(`Applied formatting: ${command} = ${value}`);
    return result;
  } catch (error) {
    console.error(`Error applying formatting ${command}:`, error);
    return false;
  }
}

/**
 * Apply bold formatting to the saved selection
 */
export function applyBold(): boolean {
  return applyFormatting('bold');
}

/**
 * Apply italic formatting to the saved selection
 */
export function applyItalic(): boolean {
  return applyFormatting('italic');
}

/**
 * Apply underline formatting to the saved selection
 */
export function applyUnderline(): boolean {
  return applyFormatting('underline');
}

/**
 * Apply font family to the saved selection
 */
export function applyFontFamily(fontFamily: string): boolean {
  return applyFormatting('fontName', fontFamily);
}

/**
 * Apply font size to the saved selection
 */
export function applyFontSize(fontSize: number): boolean {
  if (!savedRange || !savedElement) {
    console.error('Cannot apply font size: No saved selection');
    return false;
  }

  try {
    // Focus the element first to ensure we're working with the right context
    savedElement.focus();

    // Get the current selection
    const selection = window.getSelection();
    if (!selection) return false;

    // Clear any existing selection
    selection.removeAllRanges();

    // Add our saved range
    const range = savedRange.cloneRange();
    selection.addRange(range);

    // Make sure we have a valid selection
    if (selection.rangeCount === 0 || selection.getRangeAt(0).collapsed) {
      console.error('Invalid selection range');
      return false;
    }

    // Get the current range
    const currentRange = selection.getRangeAt(0);

    // Create a span with the specified font size in pixels
    const span = document.createElement('span');
    span.style.fontSize = `${fontSize}px`;

    // Extract the selected content and wrap it in the span
    const fragment = currentRange.extractContents();
    span.appendChild(fragment);

    // Insert the styled span
    currentRange.insertNode(span);

    // Create a new range that selects just the content we modified
    const newRange = document.createRange();
    newRange.selectNodeContents(span);

    // Update the selection
    selection.removeAllRanges();
    selection.addRange(newRange);

    // Update our saved range
    savedRange = newRange.cloneRange();

    console.log(`Applied font size: ${fontSize}px to selection`);
    return true;
  } catch (error) {
    console.error(`Error applying font size:`, error);
    return false;
  }
}

/**
 * Apply text color to the saved selection
 */
export function applyTextColor(color: string): boolean {
  return applyFormatting('foreColor', color);
}

/**
 * Apply background color to the saved selection
 */
export function applyBackgroundColor(color: string): boolean {
  return applyFormatting('backColor', color);
}

/**
 * Apply text alignment to the saved selection
 */
export function applyTextAlignment(alignment: 'left' | 'center' | 'right' | 'justify'): boolean {
  const command = `justify${alignment.charAt(0).toUpperCase()}${alignment.slice(1)}`;
  return applyFormatting(command);
}

// Check if the active element is an input or textarea
export function isInputActive(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  return tagName === 'input' ||
         tagName === 'textarea' ||
         tagName === 'select' ||
         activeElement.hasAttribute('contenteditable');
}

// Set up global event listeners to track selection
export function initSelectionTracking(): void {
  document.addEventListener('selectionchange', () => {
    // Don't interfere with input fields
    if (isInputActive()) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    // Save the selection when it changes
    saveSelection();
  });

  document.addEventListener('mouseup', () => {
    // Don't interfere with input fields
    if (isInputActive()) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    // Save the selection after mouse up (when user finishes selecting)
    saveSelection();
  });

  document.addEventListener('keyup', (event) => {
    // Don't interfere with input fields
    if (isInputActive()) return;

    // Only track selection changes for navigation keys
    if (event.key.includes('Arrow') ||
        event.key === 'Home' ||
        event.key === 'End' ||
        event.key === 'PageUp' ||
        event.key === 'PageDown' ||
        event.key === 'Shift') {

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
      }

      // Save the selection after key navigation
      saveSelection();
    }
  });
}
