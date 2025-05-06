<template>
  <div class="dashboard">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="mb-6">
            <v-card-text>
              <h1 class="text-h4 mb-4">Your Documents</h1>
              <p class="text-subtitle-1">Create or edit your proposals and documents</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-card @click="createNewDocument" class="new-document-card" height="200" hover>
            <v-card-text class="d-flex flex-column align-center justify-center h-100">
              <v-icon size="48" color="primary">mdi-plus</v-icon>
              <span class="text-h6 mt-2">New Document</span>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col v-for="doc in recentDocuments" :key="doc.id" cols="12" sm="6" md="4" lg="3">
          <v-card @click="openDocument(doc.id)" height="200" hover class="document-card">
            <v-card-text class="pa-0 position-relative h-100">
              <div class="document-preview">
                <img :src="doc.thumbnail" alt="Document preview" />
              </div>
              <div class="document-overlay pa-4">
                <h3 class="text-h6">{{ doc.title }}</h3>
                <p class="text-caption">Last edited: {{ doc.lastEdited }}</p>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn icon size="small" color="primary" @click.stop="openDocument(doc.id)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon size="small" @click.stop="duplicateDocument(doc.id)">
                <v-icon>mdi-content-duplicate</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn icon size="small" color="error" @click.stop="confirmDelete(doc.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Document</v-card-title>
        <v-card-text>Are you sure you want to delete this document? This action cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteDocument">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const deleteDialog = ref(false)
const documentToDelete = ref<string | null>(null)

const recentDocuments = ref([
  {
    id: '1',
    title: 'Business Proposal',
    lastEdited: 'Today, 2:30 PM',
    thumbnail: 'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  },
  {
    id: '2',
    title: 'Marketing Plan',
    lastEdited: 'Yesterday, 10:15 AM',
    thumbnail: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  },
  {
    id: '3',
    title: 'Web Design Quote',
    lastEdited: 'Jan 15, 2025',
    thumbnail: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  }
])

function createNewDocument() {
  router.push('/editor')
}

function openDocument(id: string) {
  router.push(`/editor/${id}`)
}

function duplicateDocument(id: string) {
  // Clone document logic would go here
  console.log('Duplicate document:', id)
}

function confirmDelete(id: string) {
  documentToDelete.value = id
  deleteDialog.value = true
}

function deleteDocument() {
  if (documentToDelete.value) {
    // Delete document logic would go here
    console.log('Delete document:', documentToDelete.value)
    // Remove from list
    recentDocuments.value = recentDocuments.value.filter(doc => doc.id !== documentToDelete.value)
    deleteDialog.value = false
    documentToDelete.value = null
  }
}
</script>

<style scoped lang="scss">
.dashboard {
  padding: 24px;
  background-color: var(--surface);
  min-height: 100vh;
}

.new-document-card {
  border: 2px dashed var(--border);
  background-color: rgba(12, 132, 254, 0.03);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary);
    background-color: rgba(12, 132, 254, 0.08);
    transform: translateY(-4px);
  }
}

.document-card {
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  .document-preview {
    height: 140px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .document-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%);
    color: white;
  }
}
</style>