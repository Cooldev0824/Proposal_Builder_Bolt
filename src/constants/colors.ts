/**
 * Color constants for the application
 * 
 * This file contains color constants used throughout the application.
 * Colors are organized by purpose and include both hex values and RGB values.
 */

/**
 * Primary brand colors
 */
export const BRAND_COLORS = {
  PRIMARY: '#0C84FE',
  PRIMARY_RGB: '12, 132, 254',
  SECONDARY: '#05C2C9',
  ACCENT: '#8A8D93'
};

/**
 * Status colors for feedback and alerts
 */
export const STATUS_COLORS = {
  SUCCESS: '#36B37E',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6'
};

/**
 * UI colors for backgrounds, text, etc.
 */
export const UI_COLORS = {
  BACKGROUND: '#FFFFFF',
  SURFACE: '#F5F7FA',
  TEXT_PRIMARY: '#1E1E1E',
  TEXT_SECONDARY: '#6E7275',
  TEXT_DISABLED: '#ADB5BD',
  BORDER: '#E2E8F0'
};

/**
 * Shadow values for elevation
 */
export const SHADOWS = {
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
};

/**
 * Color presets for text
 */
export const TEXT_COLOR_PRESETS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#808080', // Gray
  '#C0C0C0'  // Silver
];

/**
 * Color presets for backgrounds
 */
export const BACKGROUND_COLOR_PRESETS = [
  '#F5F5F5', // Light Gray
  '#E0E0E0', // Gray
  '#F0F8FF', // Alice Blue
  '#F0FFF0', // Honeydew
  '#FFF0F0', // Light Pink
  '#FFFACD', // Lemon Chiffon
  '#E6E6FA', // Lavender
  '#F0FFFF', // Azure
  '#F5F5DC', // Beige
  '#FAEBD7'  // Antique White
];

/**
 * Color presets for shapes and elements
 */
export const SHAPE_COLOR_PRESETS = [
  '#0C84FE', // Primary
  '#05C2C9', // Secondary
  '#36B37E', // Success
  '#F59E0B', // Warning
  '#EF4444', // Error
  '#3B82F6', // Info
  '#8A8D93', // Accent
  '#1E1E1E', // Dark
  '#FFFFFF', // White
  '#F5F7FA'  // Light
];

/**
 * Get a color with opacity
 * 
 * @param {string} hexColor - Hex color code
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string
 */
export function getColorWithOpacity(hexColor: string, opacity: number): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Convert hex color to RGB
 * 
 * @param {string} hexColor - Hex color code
 * @returns {string} RGB color string (e.g., "12, 132, 254")
 */
export function hexToRgb(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Return RGB string
  return `${r}, ${g}, ${b}`;
}

/**
 * Convert RGB to hex color
 * 
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} Hex color code
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
}

/**
 * Convert RGB string to hex color
 * 
 * @param {string} rgbStr - RGB string (e.g., "rgb(12, 132, 254)")
 * @returns {string} Hex color code
 */
export function rgbStringToHex(rgbStr: string): string {
  // Extract RGB values
  const matches = rgbStr.match(/\d+/g);
  if (!matches || matches.length < 3) {
    return '#000000';
  }
  
  const r = parseInt(matches[0], 10);
  const g = parseInt(matches[1], 10);
  const b = parseInt(matches[2], 10);
  
  return rgbToHex(r, g, b);
}
