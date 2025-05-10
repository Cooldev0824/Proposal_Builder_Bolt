/**
 * Font data for the text editor
 * 
 * This file contains the font family data that can be used in the text editor.
 * The fonts are organized by category (sans-serif, serif, monospace, display, handwriting).
 * 
 * Note: These fonts rely on Google Fonts or system fonts. The Google Fonts need to be
 * loaded separately in the application.
 */

import { FontFamily, FontCategory } from './fontTypes';

/**
 * Sans-serif font collection
 */
export const SANS_SERIF_FONTS: FontFamily[] = [
  {
    name: 'Roboto',
    value: 'Roboto',
    category: 'sans-serif',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Open Sans',
    value: 'Open Sans',
    category: 'sans-serif',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Lato',
    value: 'Lato',
    category: 'sans-serif',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Montserrat',
    value: 'Montserrat',
    category: 'sans-serif',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Poppins',
    value: 'Poppins',
    category: 'sans-serif',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Inter',
    value: 'Inter',
    category: 'sans-serif',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Nunito',
    value: 'Nunito',
    category: 'sans-serif',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Arial',
    value: 'Arial',
    category: 'sans-serif',
    fallback: 'sans-serif'
  },
  {
    name: 'Helvetica',
    value: 'Helvetica',
    category: 'sans-serif',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Verdana',
    value: 'Verdana',
    category: 'sans-serif',
    fallback: 'Geneva, sans-serif'
  }
];

/**
 * Serif font collection
 */
export const SERIF_FONTS: FontFamily[] = [
  {
    name: 'Merriweather',
    value: 'Merriweather',
    category: 'serif',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Playfair Display',
    value: 'Playfair Display',
    category: 'serif',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Lora',
    value: 'Lora',
    category: 'serif',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Georgia',
    value: 'Georgia',
    category: 'serif',
    fallback: 'Times New Roman, serif'
  },
  {
    name: 'Times New Roman',
    value: 'Times New Roman',
    category: 'serif',
    fallback: 'serif'
  },
  {
    name: 'Garamond',
    value: 'EB Garamond',
    category: 'serif',
    fallback: 'Georgia, serif'
  }
];

/**
 * Monospace font collection
 */
export const MONOSPACE_FONTS: FontFamily[] = [
  {
    name: 'Roboto Mono',
    value: 'Roboto Mono',
    category: 'monospace',
    fallback: 'monospace'
  },
  {
    name: 'Source Code Pro',
    value: 'Source Code Pro',
    category: 'monospace',
    fallback: 'monospace'
  },
  {
    name: 'Fira Code',
    value: 'Fira Code',
    category: 'monospace',
    fallback: 'monospace'
  },
  {
    name: 'Courier New',
    value: 'Courier New',
    category: 'monospace',
    fallback: 'monospace'
  },
  {
    name: 'Consolas',
    value: 'Consolas',
    category: 'monospace',
    fallback: 'monospace'
  }
];

/**
 * Display font collection
 */
export const DISPLAY_FONTS: FontFamily[] = [
  {
    name: 'Bebas Neue',
    value: 'Bebas Neue',
    category: 'display',
    fallback: 'Impact, sans-serif'
  },
  {
    name: 'Oswald',
    value: 'Oswald',
    category: 'display',
    fallback: 'Impact, sans-serif'
  },
  {
    name: 'Archivo Black',
    value: 'Archivo Black',
    category: 'display',
    fallback: 'Impact, sans-serif'
  },
  {
    name: 'Anton',
    value: 'Anton',
    category: 'display',
    fallback: 'Impact, sans-serif'
  }
];

/**
 * Handwriting font collection
 */
export const HANDWRITING_FONTS: FontFamily[] = [
  {
    name: 'Dancing Script',
    value: 'Dancing Script',
    category: 'handwriting',
    fallback: 'cursive'
  },
  {
    name: 'Pacifico',
    value: 'Pacifico',
    category: 'handwriting',
    fallback: 'cursive'
  },
  {
    name: 'Caveat',
    value: 'Caveat',
    category: 'handwriting',
    fallback: 'cursive'
  },
  {
    name: 'Satisfy',
    value: 'Satisfy',
    category: 'handwriting',
    fallback: 'cursive'
  }
];

/**
 * Combined font collection with all categories
 */
export const ALL_FONTS: FontFamily[] = [
  ...SANS_SERIF_FONTS,
  ...SERIF_FONTS,
  ...MONOSPACE_FONTS,
  ...DISPLAY_FONTS,
  ...HANDWRITING_FONTS
];

/**
 * Default font to use when no font is specified
 */
export const DEFAULT_FONT: FontFamily = SANS_SERIF_FONTS[0]; // Roboto

/**
 * Map of font categories to their respective font collections
 */
export const FONT_COLLECTIONS: Record<FontCategory, FontFamily[]> = {
  'sans-serif': SANS_SERIF_FONTS,
  'serif': SERIF_FONTS,
  'monospace': MONOSPACE_FONTS,
  'display': DISPLAY_FONTS,
  'handwriting': HANDWRITING_FONTS
};

/**
 * Order of categories for display purposes
 */
export const CATEGORY_ORDER: Record<FontCategory, number> = {
  'sans-serif': 1,
  'serif': 2,
  'monospace': 3,
  'display': 4,
  'handwriting': 5
};
