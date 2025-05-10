/**
 * Paper size data
 * 
 * This file contains the paper size data that can be used in the document editor.
 * The paper sizes are organized by standard (ISO, ANSI, etc.).
 * 
 * Note: All dimensions are in pixels at 96 DPI (standard screen resolution).
 * 1 inch = 96 pixels at standard screen resolution.
 */

import { PaperSize, PaperStandard } from './paperSizeTypes';

/**
 * ISO A series paper sizes
 */
export const ISO_A_SIZES: PaperSize[] = [
  {
    name: "A3",
    width: 1123, // 11.7 inches * 96 dpi
    height: 1587, // 16.5 inches * 96 dpi
    description: "A3 (297mm × 420mm)",
    standard: "ISO",
    orientation: "portrait"
  },
  {
    name: "A4",
    width: 794, // 8.27 inches * 96 dpi
    height: 1123, // 11.7 inches * 96 dpi
    description: "A4 (210mm × 297mm)",
    standard: "ISO",
    orientation: "portrait"
  },
  {
    name: "A5",
    width: 559, // 5.83 inches * 96 dpi
    height: 794, // 8.27 inches * 96 dpi
    description: "A5 (148mm × 210mm)",
    standard: "ISO",
    orientation: "portrait"
  }
];

/**
 * ISO B series paper sizes
 */
export const ISO_B_SIZES: PaperSize[] = [
  {
    name: "B4",
    width: 944, // 9.84 inches * 96 dpi
    height: 1334, // 13.9 inches * 96 dpi
    description: "B4 (250mm × 353mm)",
    standard: "ISO",
    orientation: "portrait"
  },
  {
    name: "B5",
    width: 693, // 7.17 inches * 96 dpi
    height: 984, // 10.12 inches * 96 dpi
    description: "B5 (176mm × 250mm)",
    standard: "ISO",
    orientation: "portrait"
  }
];

/**
 * ANSI paper sizes (US)
 */
export const ANSI_SIZES: PaperSize[] = [
  {
    name: "Letter",
    width: 816, // 8.5 inches * 96 dpi
    height: 1056, // 11 inches * 96 dpi
    description: "US Letter (8.5\" × 11\")",
    standard: "ANSI",
    orientation: "portrait"
  },
  {
    name: "Legal",
    width: 816, // 8.5 inches * 96 dpi
    height: 1344, // 14 inches * 96 dpi
    description: "US Legal (8.5\" × 14\")",
    standard: "ANSI",
    orientation: "portrait"
  },
  {
    name: "Tabloid",
    width: 1056, // 11 inches * 96 dpi
    height: 1632, // 17 inches * 96 dpi
    description: "Tabloid (11\" × 17\")",
    standard: "ANSI",
    orientation: "portrait"
  }
];

/**
 * Combined paper sizes from all standards
 */
export const ALL_PAPER_SIZES: PaperSize[] = [
  ...ISO_A_SIZES,
  ...ISO_B_SIZES,
  ...ANSI_SIZES
];

/**
 * Default paper size (US Letter)
 */
export const DEFAULT_PAPER_SIZE: PaperSize = ANSI_SIZES.find(size => size.name === "Letter") || ANSI_SIZES[0];

/**
 * Map of paper standards to their respective paper size collections
 */
export const PAPER_COLLECTIONS: Record<PaperStandard, PaperSize[]> = {
  'ISO': [...ISO_A_SIZES, ...ISO_B_SIZES],
  'ANSI': ANSI_SIZES,
  'Other': []
};
