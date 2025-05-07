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
      <v-btn
        icon
        @click="$emit('tool-clicked', 'shape')"
        size="small"
        :color="isActive('shape') ? 'primary' : ''"
      >
        <v-icon>mdi-shape</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Shape</v-tooltip>
      </v-btn>
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
      <!-- Paper size selector -->
      <v-select
        v-model="selectedPaperSize"
        :items="paperSizes"
        item-title="description"
        item-value="name"
        label="Paper Size"
        density="compact"
        class="paper-size-select"
        @update:model-value="changePaperSize"
        return-object
      ></v-select>

      <!-- Orientation selector -->
      <v-btn-toggle
        v-model="selectedOrientation"
        mandatory
        @update:model-value="changeOrientation"
      >
        <v-btn value="portrait" size="small">
          <v-icon>mdi-page-layout-header</v-icon>
          <v-tooltip activator="parent" location="bottom">Portrait</v-tooltip>
        </v-btn>
        <v-btn value="landscape" size="small">
          <v-icon>mdi-page-layout-sidebar-right</v-icon>
          <v-tooltip activator="parent" location="bottom">Landscape</v-tooltip>
        </v-btn>
      </v-btn-toggle>
    </div>

    <div class="toolbar-divider"></div>

    <v-spacer></v-spacer>

    <div class="toolbar-group">
      <v-btn
        icon
        @click="toggleRuler"
        size="small"
        :color="showRuler ? 'primary' : ''"
      >
        <v-icon>mdi-ruler</v-icon>
        <v-tooltip activator="parent" location="bottom">Toggle Ruler</v-tooltip>
      </v-btn>
      <v-btn
        icon
        @click="toggleGrid"
        size="small"
        :color="showGrid ? 'primary' : ''"
      >
        <v-icon>mdi-grid</v-icon>
        <v-tooltip activator="parent" location="bottom">Toggle Grid</v-tooltip>
      </v-btn>
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
  paperSize?: string;
  orientation?: "portrait" | "landscape";
}>();

const emit = defineEmits<{
  (e: "tool-clicked", tool: string, value?: any): void;
  (e: "save"): void;
  (e: "navigate-to-dashboard"): void;
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
const showRuler = ref(false);
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

function toggleRuler() {
  showRuler.value = !showRuler.value;
  emit("tool-clicked", "ruler", showRuler.value);
}

function toggleGrid() {
  // Toggle the grid visibility locally
  showGrid.value = !showGrid.value;
  console.log("Grid toggled in toolbar:", showGrid.value);

  // Emit the event to notify parent components
  emit("tool-clicked", "grid", showGrid.value);
}

// Paper size functions
function changePaperSize(size: PaperSize) {
  console.log("Paper size changed to:", size.name);
  emit("tool-clicked", "paper-size", size.name);
}

function changeOrientation(orientation: string) {
  console.log("Orientation changed to:", orientation);
  emit("tool-clicked", "orientation", orientation);
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

.paper-size-select {
  width: 180px;
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
