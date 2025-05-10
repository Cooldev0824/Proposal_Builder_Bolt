/**
 * Type definitions for paper size related functionality
 */

/**
 * Paper size units
 */
export type PaperSizeUnit = 'mm' | 'in' | 'px';

/**
 * Paper orientation
 */
export type PaperOrientation = 'portrait' | 'landscape';

/**
 * Paper size standard
 */
export type PaperStandard = 'ISO' | 'ANSI' | 'Other';

/**
 * Paper size definition
 */
export interface PaperSize {
  /**
   * Name of the paper size (e.g., "A4", "Letter")
   */
  name: string;
  
  /**
   * Width in pixels at 96 DPI
   */
  width: number;
  
  /**
   * Height in pixels at 96 DPI
   */
  height: number;
  
  /**
   * Human-readable description of the paper size
   */
  description: string;
  
  /**
   * Standard to which this paper size belongs
   */
  standard?: PaperStandard;
  
  /**
   * Current orientation of the paper
   */
  orientation?: PaperOrientation;
}

/**
 * Options for converting between paper size units
 */
export interface UnitConversionOptions {
  /**
   * Source unit
   */
  from: PaperSizeUnit;
  
  /**
   * Target unit
   */
  to: PaperSizeUnit;
  
  /**
   * DPI (dots per inch) for pixel conversions
   * Default: 96
   */
  dpi?: number;
}

/**
 * Paper size dimensions
 */
export interface PaperDimensions {
  /**
   * Width in the specified unit
   */
  width: number;
  
  /**
   * Height in the specified unit
   */
  height: number;
  
  /**
   * Unit of measurement
   */
  unit: PaperSizeUnit;
}

/**
 * Options for searching paper sizes
 */
export interface PaperSearchOptions {
  /**
   * Search by name
   */
  name?: string;
  
  /**
   * Filter by standard
   */
  standard?: PaperStandard;
  
  /**
   * Case-sensitive search
   */
  caseSensitive?: boolean;
}
