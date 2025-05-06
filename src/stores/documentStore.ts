import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Document } from '../types/document'

export const useDocumentStore = defineStore('documents', () => {
  const documents = ref<Document[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Mock data loading - in a real app, this would fetch from an API
  async function loadDocuments() {
    isLoading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data
      documents.value = [
        {
          id: '1',
          title: 'Business Proposal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sections: [
            {
              id: 'cover',
              title: 'Cover',
              elements: []
            },
            {
              id: 'introduction',
              title: 'Introduction',
              elements: []
            }
          ]
        },
        {
          id: '2',
          title: 'Marketing Plan',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sections: []
        }
      ]
    } catch (err) {
      error.value = 'Failed to load documents'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function getDocument(id: string): Promise<Document | undefined> {
    if (documents.value.length === 0) {
      await loadDocuments()
    }
    
    return documents.value.find(doc => doc.id === id)
  }

  async function saveDocument(document: Document) {
    isLoading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = documents.value.findIndex(doc => doc.id === document.id)
      const updatedDocument = {
        ...document,
        updatedAt: new Date().toISOString()
      }
      
      if (index >= 0) {
        // Update existing document
        documents.value[index] = updatedDocument
      } else {
        // Add new document
        updatedDocument.createdAt = updatedDocument.updatedAt
        documents.value.push(updatedDocument)
      }
      
      return updatedDocument
    } catch (err) {
      error.value = 'Failed to save document'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteDocument(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      documents.value = documents.value.filter(doc => doc.id !== id)
    } catch (err) {
      error.value = 'Failed to delete document'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    documents,
    isLoading,
    error,
    loadDocuments,
    getDocument,
    saveDocument,
    deleteDocument
  }
})