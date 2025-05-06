<template>
  <div class="document-editor">
    <EditorToolbar 
      :activeTools="activeTools" 
      @tool-clicked="handleToolClick" 
      @save="saveDocument"
    />
    
    <div class="editor-container">
      <SidebarNavigation 
        :sections="document.sections" 
        :currentSection="currentSection"
        @section-selected="selectSection"
        @section-added="addSection"
        @section-updated="updateSection"
      />
      
      <div class="main-editor" ref="editorContainer">
        <Ruler :visible="showRuler" :zoom="zoom" />
        
        <div class="editor-content" :style="editorContentStyle">
          <template v-if="showGrid">
            <GridLayout ref="gridLayout" />
          </template>
          <template v-else>
            <DocumentPage 
              v-for="(section, index) in document.sections" 
              :key="section.id"
              :section="section"
              :isActive="currentSection === index"
              @element-selected="selectElement"
              @element-updated="updateElement"
            />
          </template>
        </div>
      </div>
      
      <PropertiesPanel 
        v-if="selectedElement"
        :selectedElement="selectedElement"
        @update:element="updateElement"
        @delete-element="deleteElement"
        @duplicate-element="duplicateElement"
        @close="selectedElement = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// ... rest of the script remains unchanged ...
</script>

<style scoped lang="scss">
// ... existing styles remain unchanged ...
</style>