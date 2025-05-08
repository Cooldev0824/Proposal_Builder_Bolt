<template>
  <div class="document-page" :class="{ active: isActive }" :style="pageStyle">
    <GridOverlay
      :visible="showGrid"
      :width="pageWidth"
      :height="pageHeight"
      :grid-size="gridSize"
      @toggle-grid="toggleGrid"
    />
    <div class="page-content" ref="pageContent">
      <Suspense v-if="section?.elements && Array.isArray(section.elements)">
        <template #default>
          <div class="elements-container">
            <div
              v-for="(element, index) in sortedElements"
              :key="element.id"
              class="element-wrapper"
              :style="{ zIndex: element.zIndex || 0 }"
              @mouseenter="hoveredElement = element"
              @mouseleave="hoveredElement = null"
            >
              <ElementLayerControls
                v-if="
                  showLayerControls &&
                  (hoveredElement?.id === element.id ||
                    selectedElement?.id === element.id)
                "
                :element="element"
                :elements="section.elements"
                :layer-index="index"
                :total-layers="sortedElements.length"
                @move-up="moveElementUp"
                @move-down="moveElementDown"
                @move-to-top="moveElementToTop"
                @move-to-bottom="moveElementToBottom"
              />

              <component
                :is="getElementComponent(element.type)"
                :element="element"
                :isSelected="selectedElement?.id === element.id"
                @click.stop="selectElement(element)"
                @update:element="updateElement"
                ref="elementRefs"
              />
            </div>
          </div>
        </template>
        <template #fallback>
          <div class="loading">Loading elements...</div>
        </template>
      </Suspense>

      <div
        v-if="
          !section ||
          !section?.elements ||
          !Array.isArray(section.elements) ||
          !section.elements?.length
        "
        class="empty-page"
      >
        <p>This section is empty. Add elements from the toolbar above.</p>
      </div>

      <!-- Drawing rectangle for creating elements -->
      <div
        v-if="isDrawing"
        class="drawing-rectangle"
        :style="{
          left: drawingRectStyle?.left,
          top: drawingRectStyle?.top,
          width: drawingRectStyle?.width,
          height: drawingRectStyle?.height,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  defineAsyncComponent,
  onErrorCaptured,
  watch,
} from "vue";
import { Section, DocumentElement } from "../../types/document";
import ElementLayerControls from "./ElementLayerControls.vue";
import GridOverlay from "./GridOverlay.vue";
import {
  getPaperSizeByName,
  DEFAULT_PAPER_SIZE,
  getLandscapeSize,
} from "../../utils/paperSizes";

// Lazy-loaded element components with error handling
const TextElement = defineAsyncComponent({
  loader: () => import("./elements/TextElement.vue"),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading text element</div>',
  },
});

const ImageElement = defineAsyncComponent({
  loader: () => import("./elements/ImageElement.vue"),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading image element</div>',
  },
});

const ShapeElement = defineAsyncComponent({
  loader: () => import("./elements/ShapeElement.vue"),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading shape element</div>',
  },
});

const TableElement = defineAsyncComponent({
  loader: () => import("./elements/SimpleTableElement.vue"),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading table element</div>',
  },
});

const SignatureElement = defineAsyncComponent({
  loader: () => import("./elements/SignatureElement.vue"),
  timeout: 3000,
  errorComponent: {
    template:
      '<div class="error-loading">Error loading signature element</div>',
  },
});

const FormElement = defineAsyncComponent({
  loader: () => import("./elements/FormElement.vue"),
  timeout: 3000,
  errorComponent: {
    template: '<div class="error-loading">Error loading form element</div>',
  },
});

const GridBlockElement = defineAsyncComponent({
  loader: () => import("./elements/GridBlockElement.vue"),
  timeout: 3000,
  errorComponent: {
    template:
      '<div class="error-loading">Error loading grid block element</div>',
  },
});

const props = defineProps<{
  section: Section;
  isActive: boolean;
  showGrid?: boolean;
  isDrawing?: boolean;
  paperSize?: string;
  orientation?: "portrait" | "landscape";
  drawingRectStyle?: {
    left: string;
    top: string;
    width: string;
    height: string;
  };
}>();

const { section, isActive } = props;

const emit = defineEmits<{
  (e: "element-selected", element: DocumentElement | null): void;
  (e: "element-updated", element: DocumentElement): void;
  (e: "move-element-up", element: DocumentElement): void;
  (e: "move-element-down", element: DocumentElement): void;
  (e: "move-element-to-top", element: DocumentElement): void;
  (e: "move-element-to-bottom", element: DocumentElement): void;
  (e: "toggle-grid", visible: boolean): void;
}>();

const pageContent = ref<HTMLElement | null>(null);
const selectedElement = ref<DocumentElement | null>(null);
const hoveredElement = ref<DocumentElement | null>(null);
const elementRefs = ref<any[]>([]);
const showLayerControls = ref(true); // Always show layer controls
const showGrid = ref(true); // Default to true, will be updated when props change
const gridSize = ref(10); // Grid size in pixels (each small square is 10px)

// Page dimensions based on paper size
const pageWidth = computed(() => {
  const paperSizeName = props.paperSize || "Letter";
  const orientation = props.orientation || "portrait";

  let paperSize = getPaperSizeByName(paperSizeName);

  // Apply orientation
  if (orientation === "landscape") {
    paperSize = getLandscapeSize(paperSize);
  }

  return paperSize.width;
});

const pageHeight = computed(() => {
  const paperSizeName = props.paperSize || "Letter";
  const orientation = props.orientation || "portrait";

  let paperSize = getPaperSizeByName(paperSizeName);

  // Apply orientation
  if (orientation === "landscape") {
    paperSize = getLandscapeSize(paperSize);
  }

  return paperSize.height;
});

// Watch for changes to the showGrid prop
watch(
  () => props.showGrid,
  (newValue) => {
    if (newValue !== undefined) {
      showGrid.value = newValue;
      console.log("Grid visibility updated from prop:", showGrid.value);
    }
  },
  { immediate: true }
);

const pageStyle = computed(() => {
  return {
    width: `${pageWidth.value}px`,
    minHeight: `${pageHeight.value}px`,
    position: "relative",
  };
});

// Sort elements by zIndex for proper layering
const sortedElements = computed(() => {
  if (!section?.elements) return [];

  // Make a copy of the elements array to avoid modifying the original
  return [...section.elements].sort((a, b) => {
    // Default zIndex to 0 if not set
    const zIndexA = a.zIndex ?? 0;
    const zIndexB = b.zIndex ?? 0;
    return zIndexA - zIndexB;
  });
});

function getElementComponent(type: string) {
  switch (type) {
    case "text":
      return TextElement;
    case "image":
      return ImageElement;
    case "shape":
      return ShapeElement;
    case "table":
      return TableElement;
    case "signature":
      return SignatureElement;
    case "form":
      return FormElement;
    case "grid":
      return GridBlockElement;
    default:
      console.warn(`Unknown element type: ${type}`);
      return null;
  }
}

function selectElement(element: DocumentElement) {
  selectedElement.value = element;
  emit("element-selected", element);
}

function updateElement(element: DocumentElement) {
  emit("element-updated", element);
}

// Layer control functions
function moveElementUp(element: DocumentElement) {
  emit("move-element-up", element);
}

function moveElementDown(element: DocumentElement) {
  emit("move-element-down", element);
}

function moveElementToTop(element: DocumentElement) {
  emit("move-element-to-top", element);
}

function moveElementToBottom(element: DocumentElement) {
  emit("move-element-to-bottom", element);
}

// Grid functions
function toggleGrid() {
  // Toggle the grid visibility
  showGrid.value = !showGrid.value;
  console.log("Grid toggled in DocumentPage:", showGrid.value);

  // Emit the event to notify parent components
  emit("toggle-grid", showGrid.value);
}

// Function to snap position to grid
function snapToGrid(position: { x: number; y: number }) {
  return {
    x: Math.round(position.x / gridSize.value) * gridSize.value,
    y: Math.round(position.y / gridSize.value) * gridSize.value,
  };
}

// Text selection is now handled by the global selection manager

// Expose methods to parent components
defineExpose({
  // No special methods needed anymore
});

// Global error handler for async components
onErrorCaptured((error, instance, info) => {
  console.error("Component error:", error, instance, info);
  return false; // prevent error from propagating
});
</script>

<style scoped lang="scss">
.document-page {
  background-color: var(--background);
  box-shadow: var(--shadow-md);
  margin: 16px auto;
  transition: transform 0.2s ease;
  position: relative;
  padding-top: 30px; /* Space for horizontal ruler */
  padding-left: 30px; /* Space for vertical ruler */

  &.active {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.page-content {
  position: relative;
  min-height: 100%;
  padding: 24px;
  background-color: white;
  box-sizing: border-box;
}

.elements-container {
  position: relative;
  min-height: inherit;
}

.element-wrapper {
  position: relative;

  // We no longer force z-index on hover to maintain proper layer ordering
  // Layer controls will be visible due to their own z-index
}

.empty-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: var(--text-secondary);
  border: 2px dashed var(--border);
  border-radius: 8px;

  p {
    font-size: 16px;
    text-align: center;
    max-width: 300px;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: var(--text-secondary);
}

.error-loading {
  padding: 8px;
  color: var(--error);
  background-color: var(--error-bg);
  border-radius: 4px;
  margin: 8px 0;
}

.drawing-rectangle {
  position: absolute;
  border: 2px dashed var(--primary, #0c84fe);
  background-color: rgba(12, 132, 254, 0.1);
  pointer-events: none;
  z-index: 9999;
}
</style>
