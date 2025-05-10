/**
 * Dimension constants for the application
 * 
 * This file contains dimension constants used throughout the application.
 * Dimensions are organized by purpose and include spacing, sizes, and breakpoints.
 */

/**
 * Spacing values for margins, padding, etc.
 */
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48
};

/**
 * Border radius values
 */
export const BORDER_RADIUS = {
  XS: 2,
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  ROUND: '50%'
};

/**
 * Border width values
 */
export const BORDER_WIDTH = {
  XS: 1,
  SM: 2,
  MD: 3,
  LG: 4
};

/**
 * Font size values
 */
export const FONT_SIZE = {
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 32
};

/**
 * Line height values
 */
export const LINE_HEIGHT = {
  XS: 1.2,
  SM: 1.4,
  MD: 1.5,
  LG: 1.8,
  XL: 2.0
};

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  XS: 320,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400
};

/**
 * Z-index values for stacking elements
 */
export const Z_INDEX = {
  BACKGROUND: -1,
  DEFAULT: 0,
  CONTENT: 1,
  OVERLAY: 10,
  DROPDOWN: 100,
  MODAL: 1000,
  TOOLTIP: 1500,
  NOTIFICATION: 2000
};

/**
 * Element size values
 */
export const ELEMENT_SIZE = {
  XS: 24,
  SM: 32,
  MD: 40,
  LG: 48,
  XL: 56,
  XXL: 64
};

/**
 * Grid values
 */
export const GRID = {
  COLUMNS: 12,
  GUTTER: 16,
  MARGIN: 16
};

/**
 * Animation timing values (in milliseconds)
 */
export const ANIMATION_TIMING = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

/**
 * Convert pixel value to rem
 * 
 * @param {number} px - Pixel value
 * @param {number} baseFontSize - Base font size in pixels (default: 16)
 * @returns {string} Rem value
 */
export function pxToRem(px: number, baseFontSize: number = 16): string {
  return `${px / baseFontSize}rem`;
}

/**
 * Convert pixel value to em
 * 
 * @param {number} px - Pixel value
 * @param {number} baseFontSize - Base font size in pixels (default: 16)
 * @returns {string} Em value
 */
export function pxToEm(px: number, baseFontSize: number = 16): string {
  return `${px / baseFontSize}em`;
}

/**
 * Get responsive value based on breakpoint
 * 
 * @param {Record<string, any>} values - Values for different breakpoints
 * @param {string} breakpoint - Current breakpoint
 * @param {any} defaultValue - Default value if breakpoint not found
 * @returns {any} Value for the current breakpoint
 */
export function getResponsiveValue<T>(
  values: Record<string, T>,
  breakpoint: string,
  defaultValue: T
): T {
  return values[breakpoint] || defaultValue;
}
