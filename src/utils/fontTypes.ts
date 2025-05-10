/**
 * Type definitions for font-related functionality
 */

/**
 * Font categories supported by the application
 */
export type FontCategory = 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting';

/**
 * Font family definition
 */
export interface FontFamily {
  /**
   * Display name of the font
   */
  name: string;
  
  /**
   * CSS value to use for the font-family property
   */
  value: string;
  
  /**
   * Category the font belongs to
   */
  category: FontCategory;
  
  /**
   * Fallback fonts to use if the main font is not available
   */
  fallback: string;
}

/**
 * Options for font sorting
 */
export interface FontSortOptions {
  /**
   * Sort by category first
   */
  byCategory?: boolean;
  
  /**
   * Sort alphabetically within categories
   */
  alphabetical?: boolean;
}

/**
 * Font search options
 */
export interface FontSearchOptions {
  /**
   * Search by name
   */
  name?: string;
  
  /**
   * Filter by category
   */
  category?: FontCategory;
  
  /**
   * Case-sensitive search
   */
  caseSensitive?: boolean;
}
