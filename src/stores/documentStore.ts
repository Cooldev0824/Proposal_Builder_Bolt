import { defineStore } from "pinia";
import { ref } from "vue";
import { Document } from "../types/document";

// Storage key for documents in localStorage
const STORAGE_KEY = "document-editor-documents";

export const useDocumentStore = defineStore("documents", () => {
  const documents = ref<Document[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Load documents from localStorage
  async function loadDocuments() {
    isLoading.value = true;
    error.value = null;

    try {
      // Get documents from localStorage
      const storedDocuments = localStorage.getItem(STORAGE_KEY);

      if (storedDocuments) {
        documents.value = JSON.parse(storedDocuments);
        console.log(
          "Loaded documents from localStorage:",
          documents.value.length
        );
      } else {
        // Initialize with sample documents if storage is empty
        documents.value = [
          {
            id: "1",
            title: "Business Proposal",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sections: [
              {
                id: "cover",
                title: "Cover",
                elements: [],
              },
              {
                id: "introduction",
                title: "Introduction",
                elements: [],
              },
            ],
          },
          {
            id: "2",
            title: "Marketing Plan",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sections: [],
          },
        ];

        // Save initial documents to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents.value));
        console.log("Initialized localStorage with sample documents");
      }
    } catch (err) {
      error.value = "Failed to load documents from localStorage";
      console.error("Error loading documents:", err);
    } finally {
      isLoading.value = false;
    }
  }

  // Get a specific document by ID
  async function getDocument(id: string): Promise<Document | undefined> {
    if (documents.value.length === 0) {
      await loadDocuments();
    }

    const document = documents.value.find((doc) => doc.id === id);
    console.log(`Retrieved document ${id}:`, document ? "found" : "not found");
    return document;
  }

  // Save a document (create or update)
  async function saveDocument(document: Document) {
    isLoading.value = true;
    error.value = null;

    try {
      // Add a small delay to simulate API call (can be removed in production)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Ensure document has required fields
      const updatedDocument = {
        ...document,
        updatedAt: new Date().toISOString(),
      };

      const index = documents.value.findIndex((doc) => doc.id === document.id);

      if (index >= 0) {
        // Update existing document
        console.log(`Updating existing document: ${document.id}`);
        documents.value[index] = updatedDocument;
      } else {
        // Add new document with a proper ID
        if (document.id.startsWith("new-doc-")) {
          updatedDocument.id = `doc-${Date.now()}`;
          console.log(`Generated new ID for document: ${updatedDocument.id}`);
        }

        // Set creation date for new documents
        updatedDocument.createdAt =
          updatedDocument.createdAt || updatedDocument.updatedAt;

        console.log(`Adding new document: ${updatedDocument.id}`);
        documents.value.push(updatedDocument);
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents.value));
      console.log(
        "Saved documents to localStorage, count:",
        documents.value.length
      );

      return updatedDocument;
    } catch (err) {
      error.value = "Failed to save document to localStorage";
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
      // Add a small delay to simulate API call (can be removed in production)
      await new Promise((resolve) => setTimeout(resolve, 300));

      const initialCount = documents.value.length;
      documents.value = documents.value.filter((doc) => doc.id !== id);

      if (documents.value.length < initialCount) {
        // Save updated list to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents.value));
        console.log(
          `Deleted document ${id}, new count:`,
          documents.value.length
        );
        return true;
      } else {
        console.log(`Document ${id} not found for deletion`);
        return false;
      }
    } catch (err) {
      error.value = "Failed to delete document from localStorage";
      console.error("Error deleting document:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Export all documents (for backup)
  function exportDocuments(): string {
    try {
      return JSON.stringify(documents.value);
    } catch (err) {
      console.error("Error exporting documents:", err);
      error.value = "Failed to export documents";
      return "";
    }
  }

  // Import documents from JSON string (for restore)
  function importDocuments(jsonData: string): boolean {
    try {
      const importedDocs = JSON.parse(jsonData) as Document[];
      documents.value = importedDocs;
      localStorage.setItem(STORAGE_KEY, jsonData);
      console.log(
        "Imported documents to localStorage, count:",
        importedDocs.length
      );
      return true;
    } catch (err) {
      console.error("Error importing documents:", err);
      error.value = "Failed to import documents";
      return false;
    }
  }

  // Clear all documents from storage
  function clearDocuments(): boolean {
    try {
      documents.value = [];
      localStorage.removeItem(STORAGE_KEY);
      console.log("Cleared all documents from localStorage");
      return true;
    } catch (err) {
      console.error("Error clearing documents:", err);
      error.value = "Failed to clear documents";
      return false;
    }
  }

  return {
    documents,
    isLoading,
    error,
    loadDocuments,
    getDocument,
    saveDocument,
    deleteDocument,
    exportDocuments,
    importDocuments,
    clearDocuments,
  };
});
