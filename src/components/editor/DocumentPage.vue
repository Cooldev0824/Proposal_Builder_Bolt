<template>
  <div class="document-page-container">
    <!-- Actual document page -->
    <div class="document-page" :class="{ active: isActive }" :style="pageStyle">
      <div class="page-content" ref="pageContent">
        <!-- Element toolbar positioned at the top of the page content -->
        <ElementToolbar
          v-if="selectedElement && selectedElementPosition"
          :element="selectedElement"
          :elements="section?.elements || []"
          :layer-index="getElementIndex(selectedElement)"
          :total-layers="sortedElements.length"
          :element-position="selectedElementPosition"
          @move-up="moveElementUp"
          @move-down="moveElementDown"
          @move-to-top="moveElementToTop"
          @move-to-bottom="moveElementToBottom"
        />

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
                <component
                  :is="getElementComponent(element.type)"
                  :element="element"
                  :isSelected="selectedElement?.id === element.id"
                  @click.stop="selectElement(element)"
                  @update:element="updateElement"
                  ref="elementRefs"
                  :data-element-id="element.id"
                  :class="`element-${element.id}`"
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
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  defineAsyncComponent,
  onErrorCaptured,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { Section, DocumentElement } from "../../types/document";
import ElementToolbar from "./ElementToolbar.vue";
import { getPaperSizeByName, getLandscapeSize } from "../../utils/paperSizes";

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
}>();

const pageContent = ref<HTMLElement | null>(null);
const selectedElement = ref<DocumentElement | null>(null);
const hoveredElement = ref<DocumentElement | null>(null);
const elementRefs = ref<any[]>([]);
const showGrid = ref(true); // Default to true, will be updated when props change
const selectedElementPosition = ref<{
  top: number;
  left: number;
  width: number;
} | null>(null);

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

// Watch for changes to the selected element to update its position
watch(
  () => selectedElement.value,
  () => {
    // Use nextTick to ensure the DOM has updated
    nextTick(() => {
      calculateSelectedElementPosition();
    });
  }
);

const pageStyle = computed(() => {
  return {
    width: `${pageWidth.value}px`,
    height: `${pageHeight.value}px`, // Use fixed height instead of minHeight
    position: "relative",
    overflow: "hidden", // Hide content that goes outside the document boundaries
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
  console.log("Element selected:", element.id, element.type);

  // Calculate the element position for the toolbar
  calculateSelectedElementPosition();

  emit("element-selected", element);
}

// Calculate the position of the selected element for the toolbar
function calculateSelectedElementPosition() {
  if (!selectedElement.value || !pageContent.value) return;

  // Find the element in the DOM
  const elementId = selectedElement.value.id;

  // Try to find the element by data-element-id attribute first
  let elementDom = pageContent.value.querySelector(
    `[data-element-id="${elementId}"]`
  );

  // If not found, try to find the element wrapper that contains this element
  if (!elementDom) {
    // Find all element wrappers
    const elementWrappers =
      pageContent.value.querySelectorAll(".element-wrapper");

    // Loop through wrappers to find the one with our element
    for (const wrapper of elementWrappers) {
      // Check if this wrapper contains our element
      const component = wrapper.querySelector(".element");
      if (
        component &&
        component.classList.contains(`element-${selectedElement.value.id}`)
      ) {
        elementDom = component;
        break;
      }
    }

    // If still not found, use the element's position directly
    if (!elementDom && selectedElement.value) {
      selectedElementPosition.value = {
        top: selectedElement.value.position.y,
        left: selectedElement.value.position.x,
        width: selectedElement.value.size.width,
      };
      return;
    }
  }

  if (elementDom) {
    const rect = elementDom.getBoundingClientRect();
    const pageRect = pageContent.value.getBoundingClientRect();

    // Calculate position relative to the page content
    selectedElementPosition.value = {
      top: rect.top - pageRect.top,
      left: rect.left - pageRect.left,
      width: rect.width,
    };
  }
}

// Get the index of an element in the sortedElements array
function getElementIndex(element: DocumentElement): number {
  if (!element || !sortedElements.value) return 0;

  return sortedElements.value.findIndex((el) => el.id === element.id);
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

// Grid functions are removed

// Function to snap position to grid (commented out as currently unused)
// function snapToGrid(position: { x: number; y: number }) {
//   return {
//     x: Math.round(position.x / gridSize.value) * gridSize.value,
//     y: Math.round(position.y / gridSize.value) * gridSize.value,
//   };
// }

// Text selection is now handled by the global selection manager

// Expose methods to parent components
defineExpose({
  // No special methods needed anymore
});

// Function to handle window resize
const handleResize = () => {
  if (selectedElement.value) {
    calculateSelectedElementPosition();
  }
};

// Add window resize listener to recalculate element position
onMounted(() => {
  window.addEventListener("resize", handleResize);
});

// Clean up event listeners
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

// Global error handler for async components
onErrorCaptured((error, instance, info) => {
  console.error("Component error:", error, instance, info);
  return false; // prevent error from propagating
});
</script>

<style scoped lang="scss">
.document-page-container {
  position: relative;
  margin: 16px auto;
}

.document-page {
  background-color: var(--background);
  box-shadow: var(--shadow-md);
  transition: transform 0.2s ease;
  position: relative;

  &.active {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.page-content {
  position: relative;
  height: 100%; /* Use fixed height instead of min-height */
  //padding: 24px;
  background-color: white;
  box-sizing: border-box;
  overflow: hidden; /* Hide content that goes outside the document boundaries */
}

.elements-container {
  position: relative;
  height: 100%; /* Use fixed height instead of min-height */
  width: 100%;
  overflow: hidden; /* Hide content that goes outside the document boundaries */
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
