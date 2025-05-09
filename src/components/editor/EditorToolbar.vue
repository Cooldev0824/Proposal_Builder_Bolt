<template>
  <div class="editor-toolbar">
    <div class="toolbar-group">
      <v-btn @click="$emit('navigate-to-dashboard')" class="mr-2">
        <v-icon left>mdi-arrow-left</v-icon>
        Dashboard
      </v-btn>

      <div class="document-title">
        {{ documentTitle || "Untitled Document" }}
      </div>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <v-btn icon @click="$emit('tool-clicked', 'add-page')" size="small">
        <v-icon>mdi-file-plus</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Page</v-tooltip>
      </v-btn>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <v-btn
        icon
        @click="$emit('tool-clicked', 'text')"
        size="small"
        :color="isActive('text') ? 'primary' : ''"
      >
        <v-icon>mdi-format-text</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Text</v-tooltip>
      </v-btn>
      <v-btn
        icon
        @click="$emit('tool-clicked', 'image')"
        size="small"
        :color="isActive('image') ? 'primary' : ''"
      >
        <v-icon>mdi-image</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Image</v-tooltip>
      </v-btn>
      <v-menu>
        <template v-slot:activator="{ props: menuProps }">
          <v-btn
            icon
            v-bind="menuProps"
            size="small"
            :color="isActive('shape') ? 'primary' : ''"
          >
            <v-icon>mdi-shape</v-icon>
            <v-tooltip activator="parent" location="bottom"
              >Add Shape</v-tooltip
            >
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="$emit('tool-clicked', 'shape', 'rectangle')">
            <v-list-item-title>Rectangle</v-list-item-title>
            <template v-slot:prepend>
              <v-icon>mdi-rectangle</v-icon>
            </template>
          </v-list-item>
          <v-list-item @click="$emit('tool-clicked', 'shape', 'circle')">
            <v-list-item-title>Circle</v-list-item-title>
            <template v-slot:prepend>
              <v-icon>mdi-circle</v-icon>
            </template>
          </v-list-item>
          <v-list-item @click="$emit('tool-clicked', 'shape', 'triangle')">
            <v-list-item-title>Triangle</v-list-item-title>
            <template v-slot:prepend>
              <v-icon>mdi-triangle</v-icon>
            </template>
          </v-list-item>
          <v-list-item @click="$emit('tool-clicked', 'shape', 'arrow')">
            <v-list-item-title>Arrow</v-list-item-title>
            <template v-slot:prepend>
              <v-icon>mdi-arrow-right</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        icon
        @click="$emit('tool-clicked', 'line')"
        size="small"
        :color="isActive('line') ? 'primary' : ''"
      >
        <v-icon>mdi-minus</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Line</v-tooltip>
      </v-btn>
      <v-btn
        icon
        @click="$emit('tool-clicked', 'table')"
        size="small"
        :color="isActive('table') ? 'primary' : ''"
      >
        <v-icon>mdi-table</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Table</v-tooltip>
      </v-btn>
      <v-btn
        icon
        @click="$emit('tool-clicked', 'signature')"
        size="small"
        :color="isActive('signature') ? 'primary' : ''"
      >
        <v-icon>mdi-draw</v-icon>
        <v-tooltip activator="parent" location="bottom"
          >Add Signature</v-tooltip
        >
      </v-btn>
      <v-btn
        icon
        @click="$emit('tool-clicked', 'form')"
        size="small"
        :color="isActive('form') ? 'primary' : ''"
      >
        <v-icon>mdi-form-select</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Form</v-tooltip>
      </v-btn>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <!-- Document size button -->
      <v-btn
        @click="openDocumentSizeDialog"
        size="small"
        variant="outlined"
        class="document-size-btn"
      >
        <v-icon class="mr-1">mdi-file-document-outline</v-icon>
        <span>{{ selectedPaperSize.name }} ({{ selectedOrientation }})</span>
      </v-btn>
    </div>

    <div class="toolbar-divider"></div>

    <v-spacer></v-spacer>

    <div class="toolbar-group">
      <v-btn icon @click="$emit('tool-clicked', 'zoom-in')" size="small">
        <v-icon>mdi-magnify-plus</v-icon>
        <v-tooltip activator="parent" location="bottom">Zoom In</v-tooltip>
      </v-btn>
      <v-btn icon @click="$emit('tool-clicked', 'zoom-out')" size="small">
        <v-icon>mdi-magnify-minus</v-icon>
        <v-tooltip activator="parent" location="bottom">Zoom Out</v-tooltip>
      </v-btn>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <v-btn
        color="primary"
        @click="$emit('save')"
        :loading="isSaving"
        :disabled="isSaving"
      >
        <v-icon left>mdi-content-save</v-icon>
        Save
      </v-btn>

      <!-- Save status indicator -->
      <div class="save-status" v-if="saveMessage">
        <v-icon v-if="saveSuccess" color="success" size="small">
          mdi-check-circle
        </v-icon>
        <v-icon v-if="saveError" color="error" size="small">
          mdi-alert-circle
        </v-icon>
        <span
          :class="{
            'text-success': saveSuccess,
            'text-error': saveError,
          }"
        >
          {{ saveMessage }}
        </span>
      </div>

      <v-btn @click="$emit('tool-clicked', 'preview')">
        <v-icon left>mdi-eye</v-icon>
        Preview
      </v-btn>

      <v-btn
        @click="$emit('tool-clicked', 'export-pdf')"
        color="success"
        :loading="isExportingPdf"
        :disabled="isExportingPdf"
      >
        <v-icon left>mdi-file-pdf-box</v-icon>
        Export PDF
      </v-btn>

      <!-- Only show delete button if this is an existing document (has an ID that doesn't start with 'new-doc') -->
      <v-btn
        v-if="documentId && !documentId.startsWith('new-doc')"
        color="error"
        @click="$emit('delete-document')"
        class="ml-2"
      >
        <v-icon left>mdi-delete</v-icon>
        Delete
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useHistoryStore } from "../../stores/historyStore";
import { PAPER_SIZES } from "../../utils/paperSizes";

const historyStore = useHistoryStore();

const props = defineProps<{
  activeTools: string[];
  showGrid?: boolean;
  isSaving?: boolean;
  saveSuccess?: boolean;
  saveError?: boolean;
  saveMessage?: string;
  documentTitle?: string;
  documentId?: string;
  paperSize?: string;
  orientation?: "portrait" | "landscape";
  isExportingPdf?: boolean;
}>();

const emit = defineEmits<{
  (e: "tool-clicked", tool: string, value?: any): void;
  (e: "save"): void;
  (e: "navigate-to-dashboard"): void;
  (e: "delete-document"): void;
}>();

const canUndo = computed(() => historyStore.canUndo());
const canRedo = computed(() => historyStore.canRedo());

// Text formatting state
const textFormat = ref("Paragraph");
const fontFamily = ref("Roboto");
const isBold = ref(false);
const isItalic = ref(false);
const isUnderline = ref(false);
const textAlign = ref("left");

// UI state
const showGrid = ref(true); // Default to true

// Paper size state
const paperSizes = PAPER_SIZES;
const selectedPaperSize = ref(
  paperSizes.find((size) => size.name === props.paperSize) ||
    paperSizes.find((size) => size.name === "Letter") ||
    paperSizes[0]
);
const selectedOrientation = ref(props.orientation || "portrait");

// Watch for changes to the paperSize prop
watch(
  () => props.paperSize,
  (newValue) => {
    if (newValue) {
      const paperSize = paperSizes.find((size) => size.name === newValue);
      if (paperSize) {
        selectedPaperSize.value = paperSize;
      }
    }
  },
  { immediate: true }
);

// Watch for changes to the orientation prop
watch(
  () => props.orientation,
  (newValue) => {
    if (newValue) {
      selectedOrientation.value = newValue;
    }
  },
  { immediate: true }
);

// Watch for changes to the showGrid prop
watch(
  () => props.showGrid,
  (newValue) => {
    if (newValue !== undefined) {
      showGrid.value = newValue;
      console.log("Grid visibility updated in toolbar:", showGrid.value);
    }
  },
  { immediate: true }
);

function isActive(tool: string) {
  return props.activeTools.includes(tool);
}

function toggleBold() {
  isBold.value = !isBold.value;
  emit("tool-clicked", "format-bold", isBold.value);
}

function toggleItalic() {
  isItalic.value = !isItalic.value;
  emit("tool-clicked", "format-italic", isItalic.value);
}

function toggleUnderline() {
  isUnderline.value = !isUnderline.value;
  emit("tool-clicked", "format-underline", isUnderline.value);
}

function setTextAlign(align: string) {
  textAlign.value = align;
  emit("tool-clicked", "text-align", align);
}

// Ruler functionality removed

function toggleGrid() {
  // Toggle the grid visibility locally
  showGrid.value = !showGrid.value;
  console.log("Grid toggled in toolbar:", showGrid.value);

  // Emit the event to notify parent components
  emit("tool-clicked", "grid", showGrid.value);
}

// Paper size functions
function openDocumentSizeDialog() {
  emit("tool-clicked", "document-size");
}
</script>

<style scoped lang="scss">
.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--background);
  border-bottom: 1px solid var(--border);
  z-index: 10;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;

  &.text-formatting {
    gap: 8px;
  }
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border);
  margin: 0 12px;
}

.font-select {
  width: 140px;
}

.document-size-btn {
  min-width: 150px;
}

@media (max-width: 1200px) {
  .toolbar-group {
    &.text-formatting {
      .font-select {
        width: 120px;
      }
    }
  }
}

@media (max-width: 768px) {
  .editor-toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }

  .toolbar-divider {
    display: none;
  }
}

.save-status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  font-size: 14px;

  .text-success {
    color: var(--success);
  }

  .text-error {
    color: var(--error);
  }
}

.document-title {
  font-size: 16px;
  font-weight: 500;
  margin-left: 16px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}
</style>
