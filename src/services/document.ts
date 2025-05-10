/**
 * Document Service
 * 
 * This service handles document-related operations.
 * It provides methods for document manipulation, element management, and export.
 */

import { Document, DocumentElement, DocumentSection, Position, Size } from '../types/document';
import { v4 as uuidv4 } from 'uuid';
import apiService from './api';
import { getPaperSizeByName, getLandscapeSize } from '../utils/paperSizes';

/**
 * Document Service class
 */
class DocumentService {
  /**
   * Create a new empty document
   * 
   * @param {string} title - Document title
   * @param {string} paperSize - Paper size name
   * @param {boolean} landscape - Whether the document is in landscape orientation
   * @returns {Document} New document
   */
  createEmptyDocument(
    title: string = 'Untitled Document',
    paperSize: string = 'Letter',
    landscape: boolean = false
  ): Document {
    // Get paper size
    let size = getPaperSizeByName(paperSize);
    
    // Apply landscape orientation if needed
    if (landscape) {
      size = getLandscapeSize(size);
    }
    
    // Create document
    const document: Document = {
      id: uuidv4(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paperSize: size.name,
      orientation: landscape ? 'landscape' : 'portrait',
      sections: [
        {
          id: uuidv4(),
          title: 'Section 1',
          elements: []
        }
      ],
      metadata: {
        author: '',
        description: '',
        tags: []
      }
    };
    
    return document;
  }
  
  /**
   * Create a new document element
   * 
   * @param {string} type - Element type
   * @param {Position} position - Element position
   * @param {Size} size - Element size
   * @param {any} style - Element style
   * @returns {DocumentElement} New document element
   */
  createDocumentElement(
    type: string,
    position: Position = { x: 100, y: 100 },
    size: Size = { width: 200, height: 100 },
    style: any = {}
  ): DocumentElement {
    return {
      id: uuidv4(),
      type,
      position,
      size,
      style,
      content: this.getDefaultContentForType(type)
    };
  }
  
  /**
   * Get default content for an element type
   * 
   * @param {string} type - Element type
   * @returns {any} Default content
   */
  private getDefaultContentForType(type: string): any {
    switch (type) {
      case 'text':
        return 'Enter text here';
      case 'image':
        return {
          src: '',
          alt: 'Image'
        };
      case 'shape':
        return {
          shapeType: 'rectangle'
        };
      case 'table':
        return {
          rows: 3,
          columns: 3,
          data: Array(3).fill(0).map(() => Array(3).fill(''))
        };
      case 'signature':
        return {
          name: '',
          date: ''
        };
      case 'form':
        return {
          fields: []
        };
      default:
        return {};
    }
  }
  
  /**
   * Add an element to a document section
   * 
   * @param {Document} document - Document
   * @param {string} sectionId - Section ID
   * @param {DocumentElement} element - Element to add
   * @returns {Document} Updated document
   */
  addElementToSection(
    document: Document,
    sectionId: string,
    element: DocumentElement
  ): Document {
    // Create a deep copy of the document
    const updatedDocument = JSON.parse(JSON.stringify(document)) as Document;
    
    // Find the section
    const sectionIndex = updatedDocument.sections.findIndex(section => section.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error(`Section with ID ${sectionId} not found`);
    }
    
    // Add the element to the section
    updatedDocument.sections[sectionIndex].elements.push(element);
    
    // Update the document's updatedAt timestamp
    updatedDocument.updatedAt = new Date().toISOString();
    
    return updatedDocument;
  }
  
  /**
   * Update an element in a document section
   * 
   * @param {Document} document - Document
   * @param {string} sectionId - Section ID
   * @param {string} elementId - Element ID
   * @param {Partial<DocumentElement>} updates - Element updates
   * @returns {Document} Updated document
   */
  updateElementInSection(
    document: Document,
    sectionId: string,
    elementId: string,
    updates: Partial<DocumentElement>
  ): Document {
    // Create a deep copy of the document
    const updatedDocument = JSON.parse(JSON.stringify(document)) as Document;
    
    // Find the section
    const sectionIndex = updatedDocument.sections.findIndex(section => section.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error(`Section with ID ${sectionId} not found`);
    }
    
    // Find the element
    const elementIndex = updatedDocument.sections[sectionIndex].elements.findIndex(
      element => element.id === elementId
    );
    if (elementIndex === -1) {
      throw new Error(`Element with ID ${elementId} not found in section ${sectionId}`);
    }
    
    // Update the element
    updatedDocument.sections[sectionIndex].elements[elementIndex] = {
      ...updatedDocument.sections[sectionIndex].elements[elementIndex],
      ...updates
    };
    
    // Update the document's updatedAt timestamp
    updatedDocument.updatedAt = new Date().toISOString();
    
    return updatedDocument;
  }
  
  /**
   * Remove an element from a document section
   * 
   * @param {Document} document - Document
   * @param {string} sectionId - Section ID
   * @param {string} elementId - Element ID
   * @returns {Document} Updated document
   */
  removeElementFromSection(
    document: Document,
    sectionId: string,
    elementId: string
  ): Document {
    // Create a deep copy of the document
    const updatedDocument = JSON.parse(JSON.stringify(document)) as Document;
    
    // Find the section
    const sectionIndex = updatedDocument.sections.findIndex(section => section.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error(`Section with ID ${sectionId} not found`);
    }
    
    // Remove the element from the section
    updatedDocument.sections[sectionIndex].elements = updatedDocument.sections[sectionIndex].elements.filter(
      element => element.id !== elementId
    );
    
    // Update the document's updatedAt timestamp
    updatedDocument.updatedAt = new Date().toISOString();
    
    return updatedDocument;
  }
  
  /**
   * Add a new section to a document
   * 
   * @param {Document} document - Document
   * @param {string} title - Section title
   * @returns {Document} Updated document
   */
  addSectionToDocument(
    document: Document,
    title: string = 'New Section'
  ): Document {
    // Create a deep copy of the document
    const updatedDocument = JSON.parse(JSON.stringify(document)) as Document;
    
    // Create a new section
    const newSection: DocumentSection = {
      id: uuidv4(),
      title,
      elements: []
    };
    
    // Add the section to the document
    updatedDocument.sections.push(newSection);
    
    // Update the document's updatedAt timestamp
    updatedDocument.updatedAt = new Date().toISOString();
    
    return updatedDocument;
  }
  
  /**
   * Remove a section from a document
   * 
   * @param {Document} document - Document
   * @param {string} sectionId - Section ID
   * @returns {Document} Updated document
   */
  removeSectionFromDocument(
    document: Document,
    sectionId: string
  ): Document {
    // Create a deep copy of the document
    const updatedDocument = JSON.parse(JSON.stringify(document)) as Document;
    
    // Remove the section from the document
    updatedDocument.sections = updatedDocument.sections.filter(
      section => section.id !== sectionId
    );
    
    // Update the document's updatedAt timestamp
    updatedDocument.updatedAt = new Date().toISOString();
    
    return updatedDocument;
  }
  
  /**
   * Export a document to PDF
   * 
   * @param {string} documentId - Document ID
   * @returns {Promise<Blob>} PDF blob
   */
  async exportToPdf(documentId: string): Promise<Blob> {
    try {
      return await apiService.exportDocumentToPdf(documentId);
    } catch (error) {
      console.error(`Error exporting document ${documentId} to PDF:`, error);
      throw error;
    }
  }
  
  /**
   * Save a document to the server
   * 
   * @param {Document} document - Document to save
   * @returns {Promise<Document>} Saved document
   */
  async saveDocument(document: Document): Promise<Document> {
    try {
      // Update the document's updatedAt timestamp
      const updatedDocument = {
        ...document,
        updatedAt: new Date().toISOString()
      };
      
      // Save the document
      if (document.id) {
        return await apiService.updateDocument(document.id, updatedDocument);
      } else {
        return await apiService.createDocument(updatedDocument);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const documentService = new DocumentService();

// Export default for convenience
export default documentService;
