import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { Document, DocumentElement } from "../types/document";
import { apiService, documentService } from "../services";

export const useDocumentStore = defineStore("documents", () => {
  const documents = ref<Document[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Current document
  const currentDocument = ref<Document | null>(null);
  const currentSectionId = ref<string | null>(null);
  const selectedElementId = ref<string | null>(null);

  // Computed properties
  const currentSection = computed(() => {
    if (!currentDocument.value || !currentSectionId.value) return null;
    return currentDocument.value.sections.find(section => section.id === currentSectionId.value) || null;
  });

  const selectedElement = computed(() => {
    if (!currentSection.value || !selectedElementId.value) return null;
    return currentSection.value.elements.find(element => element.id === selectedElementId.value) || null;
  });

  // Load documents from the server
  async function loadDocuments() {
    isLoading.value = true;
    error.value = null;

    try {
      // Get documents from the server
      documents.value = await apiService.getDocuments();
      console.log("Loaded documents from server:", documents.value.length);
    } catch (err) {
      error.value = "Failed to load documents from server";
      console.error("Error loading documents:", err);

      // Initialize with empty array if server request fails
      documents.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  // Get a specific document by ID
  async function getDocument(id: string): Promise<Document | undefined> {
    isLoading.value = true;
    error.value = null;

    try {
      // Get document from the server
      const document = await apiService.getDocument(id);
      console.log(`Retrieved document ${id} from server`);
      return document;
    } catch (err) {
      error.value = `Failed to get document ${id} from server`;
      console.error(`Error getting document ${id}:`, err);
      return undefined;
    } finally {
      isLoading.value = false;
    }
  }

  // Save a document (create or update)
  async function saveDocument(document: Document) {
    isLoading.value = true;
    error.value = null;

    try {
      // Save document to the server
      const savedDocument = await documentService.saveDocument(document);

      // Update local cache
      const index = documents.value.findIndex(
        (doc) => doc.id === savedDocument.id
      );
      if (index >= 0) {
        // Update existing document in cache
        documents.value[index] = savedDocument;
      } else {
        // Add new document to cache
        documents.value.push(savedDocument);
      }

      // Update current document if it's the one being saved
      if (currentDocument.value && currentDocument.value.id === savedDocument.id) {
        currentDocument.value = savedDocument;
      }

      console.log(`Document saved to server: ${savedDocument.id}`);
      return savedDocument;
    } catch (err) {
      error.value = "Failed to save document to server";
      console.error("Error saving document:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Delete a document by ID
  async function deleteDocument(id: string) {
    isLoading.value = true;
    error.value = null;

    try {
      // Delete document from the server
      await apiService.deleteDocument(id);

      // Update local cache
      documents.value = documents.value.filter((doc) => doc.id !== id);

      // Clear current document if it's the one being deleted
      if (currentDocument.value && currentDocument.value.id === id) {
        currentDocument.value = null;
        currentSectionId.value = null;
        selectedElementId.value = null;
      }

      console.log(`Deleted document ${id} from server`);
      return true;
    } catch (err) {
      error.value = `Failed to delete document ${id} from server`;
      console.error(`Error deleting document ${id}:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Set the current document
  function setCurrentDocument(document: Document | null) {
    currentDocument.value = document;

    // Set the first section as the current section if available
    if (document && document.sections.length > 0) {
      currentSectionId.value = document.sections[0].id;
    } else {
      currentSectionId.value = null;
    }

    // Clear selected element
    selectedElementId.value = null;
  }

  // Set the current section
  function setCurrentSection(sectionId: string | null) {
    currentSectionId.value = sectionId;
    selectedElementId.value = null;
  }

  // Select an element
  function selectElement(elementId: string | null) {
    selectedElementId.value = elementId;
  }

  // Add an element to the current section
  function addElement(element: DocumentElement) {
    if (!currentDocument.value || !currentSectionId.value) return;

    // Add the element to the document
    currentDocument.value = documentService.addElementToSection(
      currentDocument.value,
      currentSectionId.value,
      element
    );

    // Select the new element
    selectedElementId.value = element.id;
  }

  // Update an element in the current section
  function updateElement(elementId: string, updates: Partial<DocumentElement>) {
    if (!currentDocument.value || !currentSectionId.value) return;

    // Update the element in the document
    currentDocument.value = documentService.updateElementInSection(
      currentDocument.value,
      currentSectionId.value,
      elementId,
      updates
    );
  }

  // Remove an element from the current section
  function removeElement(elementId: string) {
    if (!currentDocument.value || !currentSectionId.value) return;

    // Remove the element from the document
    currentDocument.value = documentService.removeElementFromSection(
      currentDocument.value,
      currentSectionId.value,
      elementId
    );

    // Clear selected element if it's the one being removed
    if (selectedElementId.value === elementId) {
      selectedElementId.value = null;
    }
  }

  // Get the maximum z-index of elements in the current section
  function getMaxZIndex(): number {
    if (!currentSection.value) return 0;

    const elements = currentSection.value.elements;
    if (!elements || elements.length === 0) return 0;

    return Math.max(...elements.map(element => element.zIndex || 0));
  }

  // Get the minimum z-index of elements in the current section
  function getMinZIndex(): number {
    if (!currentSection.value) return 0;

    const elements = currentSection.value.elements;
    if (!elements || elements.length === 0) return 0;

    return Math.min(...elements.map(element => element.zIndex || 0));
  }

  // Create a new document
  function createDocument(
    title: string = 'Untitled Document',
    paperSize: string = 'Letter',
    landscape: boolean = false
  ): Document {
    return documentService.createEmptyDocument(title, paperSize, landscape);
  }

  // Create a new element
  function createElement(
    type: string,
    position = { x: 100, y: 100 },
    size = { width: 200, height: 100 },
    style = {}
  ): DocumentElement {
    return documentService.createDocumentElement(type, position, size, style);
  }

  // Export all documents (for backup)
  async function exportDocuments(): Promise<string> {
    try {
      // Load all documents first to ensure we have the latest data
      await loadDocuments();
      return JSON.stringify(documents.value);
    } catch (err) {
      console.error("Error exporting documents:", err);
      error.value = "Failed to export documents";
      return "";
    }
  }

  // Import documents from JSON string (for restore)
  async function importDocuments(jsonData: string): Promise<boolean> {
    try {
      const importedDocs = JSON.parse(jsonData) as Document[];

      // Save each document to the server
      for (const doc of importedDocs) {
        await saveDocument(doc);
      }

      console.log(`Imported ${importedDocs.length} documents to server`);
      return true;
    } catch (err) {
      console.error("Error importing documents:", err);
      error.value = "Failed to import documents";
      return false;
    }
  }

  // Clear all documents from storage
  async function clearDocuments(): Promise<boolean> {
    try {
      // Delete each document from the server
      for (const doc of documents.value) {
        await deleteDocument(doc.id);
      }

      // Clear local cache
      documents.value = [];
      currentDocument.value = null;
      currentSectionId.value = null;
      selectedElementId.value = null;

      console.log("Cleared all documents from server");
      return true;
    } catch (err) {
      console.error("Error clearing documents:", err);
      error.value = "Failed to clear documents";
      return false;
    }
  }

  return {
    // State
    documents,
    isLoading,
    error,
    currentDocument,
    currentSectionId,
    selectedElementId,

    // Computed
    currentSection,
    selectedElement,

    // Document methods
    loadDocuments,
    getDocument,
    saveDocument,
    deleteDocument,
    createDocument,
    exportDocuments,
    importDocuments,
    clearDocuments,

    // Current document methods
    setCurrentDocument,
    setCurrentSection,

    // Element methods
    createElement,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    getMaxZIndex,
    getMinZIndex
  };
});
