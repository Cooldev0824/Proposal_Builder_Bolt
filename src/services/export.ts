/**
 * Export Service
 * 
 * This service handles document export operations.
 * It provides methods for exporting documents to various formats.
 */

import { Document } from '../types/document';
import apiService from './api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { getPaperSizeByName, convertPaperSizeToUnit } from '../utils/paperSizes';

/**
 * Export Service class
 */
class ExportService {
  /**
   * Export a document to PDF using the server
   * 
   * @param {string} documentId - Document ID
   * @returns {Promise<Blob>} PDF blob
   */
  async exportToPdfServer(documentId: string): Promise<Blob> {
    try {
      return await apiService.exportDocumentToPdf(documentId);
    } catch (error) {
      console.error(`Error exporting document ${documentId} to PDF:`, error);
      throw error;
    }
  }
  
  /**
   * Export a document to PDF using client-side rendering
   * 
   * @param {Document} document - Document to export
   * @param {HTMLElement} element - Element containing the document
   * @returns {Promise<Blob>} PDF blob
   */
  async exportToPdfClient(document: Document, element: HTMLElement): Promise<Blob> {
    try {
      // Get paper size
      const paperSize = getPaperSizeByName(document.paperSize);
      const paperSizeInMm = convertPaperSizeToUnit(paperSize, 'mm');
      
      // Create PDF document
      const pdf = new jsPDF({
        orientation: document.orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [paperSizeInMm.width, paperSizeInMm.height]
      });
      
      // Process each section
      for (let i = 0; i < document.sections.length; i++) {
        // Add a new page for each section except the first one
        if (i > 0) {
          pdf.addPage();
        }
        
        // Get the section element
        const sectionElement = element.querySelector(`[data-section-id="${document.sections[i].id}"]`);
        if (!sectionElement) {
          console.warn(`Section element with ID ${document.sections[i].id} not found`);
          continue;
        }
        
        // Convert section to canvas
        const canvas = await html2canvas(sectionElement as HTMLElement, {
          scale: 2, // Higher scale for better quality
          useCORS: true, // Allow loading cross-origin images
          logging: false, // Disable logging
          allowTaint: true, // Allow tainted canvas
          backgroundColor: '#ffffff' // White background
        });
        
        // Add canvas to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(
          imgData,
          'PNG',
          0,
          0,
          paperSizeInMm.width,
          paperSizeInMm.height,
          '',
          'FAST'
        );
      }
      
      // Return PDF as blob
      return pdf.output('blob');
    } catch (error) {
      console.error('Error exporting document to PDF:', error);
      throw error;
    }
  }
  
  /**
   * Export a document to PNG
   * 
   * @param {Document} document - Document to export
   * @param {HTMLElement} element - Element containing the document
   * @returns {Promise<Blob[]>} Array of PNG blobs (one per section)
   */
  async exportToPng(document: Document, element: HTMLElement): Promise<Blob[]> {
    try {
      const pngBlobs: Blob[] = [];
      
      // Process each section
      for (const section of document.sections) {
        // Get the section element
        const sectionElement = element.querySelector(`[data-section-id="${section.id}"]`);
        if (!sectionElement) {
          console.warn(`Section element with ID ${section.id} not found`);
          continue;
        }
        
        // Convert section to canvas
        const canvas = await html2canvas(sectionElement as HTMLElement, {
          scale: 2, // Higher scale for better quality
          useCORS: true, // Allow loading cross-origin images
          logging: false, // Disable logging
          allowTaint: true, // Allow tainted canvas
          backgroundColor: '#ffffff' // White background
        });
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/png');
        });
        
        pngBlobs.push(blob);
      }
      
      return pngBlobs;
    } catch (error) {
      console.error('Error exporting document to PNG:', error);
      throw error;
    }
  }
  
  /**
   * Export a document to JPEG
   * 
   * @param {Document} document - Document to export
   * @param {HTMLElement} element - Element containing the document
   * @param {number} quality - JPEG quality (0-1)
   * @returns {Promise<Blob[]>} Array of JPEG blobs (one per section)
   */
  async exportToJpeg(document: Document, element: HTMLElement, quality: number = 0.9): Promise<Blob[]> {
    try {
      const jpegBlobs: Blob[] = [];
      
      // Process each section
      for (const section of document.sections) {
        // Get the section element
        const sectionElement = element.querySelector(`[data-section-id="${section.id}"]`);
        if (!sectionElement) {
          console.warn(`Section element with ID ${section.id} not found`);
          continue;
        }
        
        // Convert section to canvas
        const canvas = await html2canvas(sectionElement as HTMLElement, {
          scale: 2, // Higher scale for better quality
          useCORS: true, // Allow loading cross-origin images
          logging: false, // Disable logging
          allowTaint: true, // Allow tainted canvas
          backgroundColor: '#ffffff' // White background
        });
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/jpeg', quality);
        });
        
        jpegBlobs.push(blob);
      }
      
      return jpegBlobs;
    } catch (error) {
      console.error('Error exporting document to JPEG:', error);
      throw error;
    }
  }
  
  /**
   * Download a blob as a file
   * 
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Filename
   */
  downloadBlob(blob: Blob, filename: string): void {
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append the link to the document
    document.body.appendChild(link);
    
    // Click the link
    link.click();
    
    // Remove the link
    document.body.removeChild(link);
    
    // Revoke the URL
    URL.revokeObjectURL(url);
  }
  
  /**
   * Download multiple blobs as files
   * 
   * @param {Blob[]} blobs - Blobs to download
   * @param {string} filenamePrefix - Filename prefix
   * @param {string} extension - File extension
   */
  downloadBlobs(blobs: Blob[], filenamePrefix: string, extension: string): void {
    // Download each blob
    blobs.forEach((blob, index) => {
      this.downloadBlob(blob, `${filenamePrefix}-${index + 1}.${extension}`);
    });
  }
}

// Create and export a singleton instance
export const exportService = new ExportService();

// Export default for convenience
export default exportService;
