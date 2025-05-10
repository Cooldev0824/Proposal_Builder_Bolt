/**
 * Composable for handling text formatting
 * 
 * This composable provides functionality for formatting text in the document editor,
 * including bold, italic, underline, font family, font size, color, etc.
 */

import { ref, computed } from 'vue';
import { TextElement } from '../types/document';
import { getFontFamilyValue, getDefaultFontFamily } from '../utils/fontFamilies';
import { rgbStringToHex } from '../constants/colors';

/**
 * Options for the useTextFormatting composable
 */
interface UseTextFormattingOptions {
  /**
   * Whether to use execCommand for formatting (default: true)
   */
  useExecCommand?: boolean;
  
  /**
   * Whether to track selection changes (default: true)
   */
  trackSelection?: boolean;
}

/**
 * Composable for handling text formatting
 * 
 * @param {HTMLElement | null} editorElement - The editor element
 * @param {UseTextFormattingOptions} options - Options for the composable
 * @returns {Object} Object containing text formatting functionality
 */
export function useTextFormatting(
  editorElement: HTMLElement | null,
  options: UseTextFormattingOptions = {}
) {
  // Default options
  const {
    useExecCommand = true,
    trackSelection = true
  } = options;
  
  // State
  const selection = ref<Selection | null>(null);
  const selectionRange = ref<Range | null>(null);
  const isBold = ref(false);
  const isItalic = ref(false);
  const isUnderline = ref(false);
  const fontFamily = ref(getDefaultFontFamily().value);
  const fontSize = ref(16);
  const textColor = ref('#000000');
  const backgroundColor = ref('transparent');
  const textAlign = ref('left');
  
  /**
   * Update the current selection
   */
  function updateSelection() {
    const windowSelection = window.getSelection();
    
    if (!windowSelection || windowSelection.rangeCount === 0) {
      selection.value = null;
      selectionRange.value = null;
      return;
    }
    
    selection.value = windowSelection;
    selectionRange.value = windowSelection.getRangeAt(0);
    
    // Update formatting state based on current selection
    updateFormattingState();
  }
  
  /**
   * Update the formatting state based on the current selection
   */
  function updateFormattingState() {
    if (!selection.value || !editorElement) return;
    
    // Check if selection is within the editor element
    if (!isSelectionInEditor()) return;
    
    // Get formatting from current selection
    isBold.value = document.queryCommandState('bold');
    isItalic.value = document.queryCommandState('italic');
    isUnderline.value = document.queryCommandState('underline');
    
    // Get font family
    const fontFamilyValue = document.queryCommandValue('fontName');
    if (fontFamilyValue && fontFamilyValue !== '') {
      fontFamily.value = fontFamilyValue;
    }
    
    // Get font size
    const fontSizeValue = document.queryCommandValue('fontSize');
    if (fontSizeValue && fontSizeValue !== '') {
      // Convert font size value to pixels
      // Note: execCommand fontSize uses 1-7 scale, so we need to convert
      const fontSizeMap: Record<string, number> = {
        '1': 10,
        '2': 13,
        '3': 16,
        '4': 18,
        '5': 24,
        '6': 32,
        '7': 48
      };
      fontSize.value = fontSizeMap[fontSizeValue] || 16;
    }
    
    // Get text color
    const foreColor = document.queryCommandValue('foreColor');
    if (foreColor && foreColor !== '') {
      textColor.value = rgbStringToHex(foreColor);
    }
    
    // Get background color
    const backColor = document.queryCommandValue('backColor');
    if (backColor && backColor !== '' && backColor !== 'rgb(0, 0, 0, 0)') {
      backgroundColor.value = rgbStringToHex(backColor);
    }
    
    // Get text alignment
    textAlign.value = 'left'; // Default
    if (document.queryCommandState('justifyCenter')) {
      textAlign.value = 'center';
    } else if (document.queryCommandState('justifyRight')) {
      textAlign.value = 'right';
    } else if (document.queryCommandState('justifyFull')) {
      textAlign.value = 'justify';
    }
  }
  
  /**
   * Check if the current selection is within the editor element
   * 
   * @returns {boolean} Whether the selection is within the editor
   */
  function isSelectionInEditor(): boolean {
    if (!selection.value || !editorElement) return false;
    
    const range = selection.value.getRangeAt(0);
    return editorElement.contains(range.commonAncestorContainer);
  }
  
  /**
   * Save the current selection
   */
  function saveSelection() {
    updateSelection();
  }
  
  /**
   * Restore the saved selection
   * 
   * @returns {boolean} Whether the selection was restored successfully
   */
  function restoreSelection(): boolean {
    if (!selection.value || !selectionRange.value) return false;
    
    try {
      selection.value.removeAllRanges();
      selection.value.addRange(selectionRange.value);
      return true;
    } catch (error) {
      console.error('Error restoring selection:', error);
      return false;
    }
  }
  
  /**
   * Apply formatting to the current selection
   * 
   * @param {string} command - The formatting command
   * @param {string | boolean} value - The value for the command
   * @returns {boolean} Whether the formatting was applied successfully
   */
  function applyFormatting(command: string, value: string | boolean = true): boolean {
    if (!restoreSelection()) return false;
    
    try {
      if (useExecCommand) {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand(command, false, value as string);
      } else {
        // Use modern Selection API
        // This is more complex and depends on the specific formatting
        // Implement as needed
      }
      
      // Update formatting state
      updateFormattingState();
      
      return true;
    } catch (error) {
      console.error(`Error applying formatting (${command}):`, error);
      return false;
    }
  }
  
  /**
   * Toggle bold formatting
   * 
   * @returns {boolean} Whether the formatting was applied successfully
   */
  function toggleBold(): boolean {
    isBold.value = !isBold.value;
    return applyFormatting('bold');
  }
  
  /**
   * Toggle italic formatting
   * 
   * @returns {boolean} Whether the formatting was applied successfully
   */
  function toggleItalic(): boolean {
    isItalic.value = !isItalic.value;
    return applyFormatting('italic');
  }
  
  /**
   * Toggle underline formatting
   * 
   * @returns {boolean} Whether the formatting was applied successfully
   */
  function toggleUnderline(): boolean {
    isUnderline.value = !isUnderline.value;
    return applyFormatting('underline');
  }
  
  /**
   * Set font family
   * 
   * @param {string} value - Font family name
   * @returns {boolean} Whether the formatting was applied successfully
   */
  function setFontFamily(value: string): boolean {
    fontFamily.value = value;
    return applyFormatting('fontName', value);
  }
  
  /**
   * Set font size
   * 
   * @param {number} value - Font size in pixels
   * @returns {boolean} Whether the formatting was applied successfully
   */
  function setFontSize(value: number): boolean {
    fontSize.value = value;
    
    // Convert pixel size to execCommand fontSize (1-7)
    // This is a rough approximation
    let execCommandSize = '3'; // Default (16px)
    if (value <= 10) execCommandSize = '1';
    else if (value <= 13) execCommandSize = '2';
    else if (value <= 16) execCommandSize = '3';
    else if (value <= 18) execCommandSize = '4';
    else if (value <= 24) execCommandSize = '5';
    else if (value <= 32) execCommandSize = '6';
    else execCommandSize = '7';
    
    return applyFormatting('fontSize', execCommandSize);
  }
  
  /**
   * Set text color
   * 
   * @param {string} value - Color in hex format
   * @returns {boolean} Whether the formatting was applied successfully
   */
  function setTextColor(value: string): boolean {
    textColor.value = value;
    return applyFormatting('foreColor', value);
  }
  
  /**
   * Set background color
   * 
   * @param {string} value - Color in hex format
   * @returns {boolean} Whether the formatting was applied successfully
   */
  function setBackgroundColor(value: string): boolean {
    backgroundColor.value = value;
    return applyFormatting('backColor', value);
  }
  
  /**
   * Set text alignment
   * 
   * @param {string} value - Alignment ('left', 'center', 'right', 'justify')
   * @returns {boolean} Whether the formatting was applied successfully
   */
  function setTextAlignment(value: string): boolean {
    textAlign.value = value;
    
    let command = 'justifyLeft';
    switch (value) {
      case 'center':
        command = 'justifyCenter';
        break;
      case 'right':
        command = 'justifyRight';
        break;
      case 'justify':
        command = 'justifyFull';
        break;
    }
    
    return applyFormatting(command);
  }
  
  /**
   * Apply text element style to the editor
   * 
   * @param {TextElement} element - The text element
   */
  function applyElementStyle(element: TextElement) {
    if (!editorElement) return;
    
    // Apply styles to the editor element
    const style = element.style;
    
    editorElement.style.fontFamily = getFontFamilyValue(style.fontFamily);
    editorElement.style.fontSize = `${style.fontSize}px`;
    editorElement.style.fontWeight = style.bold ? 'bold' : 'normal';
    editorElement.style.fontStyle = style.italic ? 'italic' : 'normal';
    editorElement.style.textDecoration = style.underline ? 'underline' : 'none';
    editorElement.style.color = style.color;
    editorElement.style.backgroundColor = style.backgroundColor;
    editorElement.style.textAlign = style.align || 'left';
  }
  
  // Set up selection tracking
  if (trackSelection && editorElement) {
    editorElement.addEventListener('mouseup', updateSelection);
    editorElement.addEventListener('keyup', updateSelection);
    document.addEventListener('selectionchange', () => {
      if (isSelectionInEditor()) {
        updateSelection();
      }
    });
  }
  
  return {
    // State
    selection,
    selectionRange,
    isBold,
    isItalic,
    isUnderline,
    fontFamily,
    fontSize,
    textColor,
    backgroundColor,
    textAlign,
    
    // Methods
    updateSelection,
    saveSelection,
    restoreSelection,
    applyFormatting,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    setFontFamily,
    setFontSize,
    setTextColor,
    setBackgroundColor,
    setTextAlignment,
    applyElementStyle
  };
}
