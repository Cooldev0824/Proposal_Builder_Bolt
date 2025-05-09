<template>
  <div class="element-toolbar" :style="toolbarStyle">
    <div class="toolbar-section element-info">
      <div class="element-type">
        <v-icon
          size="small"
          :icon="getElementIcon(element.type)"
          class="mr-1"
        ></v-icon>
        <span>{{ getElementName(element) }}</span>
      </div>
      <div class="layer-number">Layer {{ layerIndex + 1 }}</div>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-section layer-controls">
      <v-tooltip location="bottom" content-class="toolbar-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="toolbar-btn"
            :class="{ disabled: isBottomLayer }"
            :disabled="isBottomLayer"
            @click.stop="$emit('move-to-bottom', element)"
            aria-label="Send to Back"
          >
            <v-icon>mdi-arrow-collapse-down</v-icon>
          </button>
        </template>
        <span>Send to Back</span>
      </v-tooltip>

      <v-tooltip location="bottom" content-class="toolbar-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="toolbar-btn"
            :class="{ disabled: isBottomLayer }"
            :disabled="isBottomLayer"
            @click.stop="$emit('move-down', element)"
            aria-label="Move Down"
          >
            <v-icon>mdi-arrow-down</v-icon>
          </button>
        </template>
        <span>Move Down</span>
      </v-tooltip>

      <v-tooltip location="bottom" content-class="toolbar-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="toolbar-btn"
            :class="{ disabled: isTopLayer }"
            :disabled="isTopLayer"
            @click.stop="$emit('move-up', element)"
            aria-label="Move Up"
          >
            <v-icon>mdi-arrow-up</v-icon>
          </button>
        </template>
        <span>Move Up</span>
      </v-tooltip>

      <v-tooltip location="bottom" content-class="toolbar-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="toolbar-btn"
            :class="{ disabled: isTopLayer }"
            :disabled="isTopLayer"
            @click.stop="$emit('move-to-top', element)"
            aria-label="Bring to Front"
          >
            <v-icon>mdi-arrow-collapse-up</v-icon>
          </button>
        </template>
        <span>Bring to Front</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DocumentElement } from "../../types/document";

const props = defineProps<{
  element: DocumentElement;
  elements: DocumentElement[];
  layerIndex: number;
  totalLayers: number;
  elementPosition?: { top: number; left: number; width: number };
}>();

defineEmits<{
  (e: "move-up", element: DocumentElement): void;
  (e: "move-down", element: DocumentElement): void;
  (e: "move-to-top", element: DocumentElement): void;
  (e: "move-to-bottom", element: DocumentElement): void;
}>();

// Compute whether the element is at the top or bottom of the stack
const isTopLayer = computed(() => props.layerIndex === props.totalLayers - 1);
const isBottomLayer = computed(() => props.layerIndex === 0);

// Calculate toolbar position based on element position
const toolbarStyle = computed(() => {
  if (!props.elementPosition) return {};

  // Calculate width with min/max constraints
  const width = Math.min(Math.max(props.elementPosition.width, 250), 400);

  // Calculate left position to center the toolbar
  const left = Math.max(
    0,
    props.elementPosition.left + (props.elementPosition.width - width) / 2
  );

  // Calculate top position, ensuring it's not negative
  const top = Math.max(10, props.elementPosition.top - 50);

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`, // Min width 250px, max 400px
  };
});

function getElementIcon(type: string): string {
  switch (type) {
    case "text":
      return "mdi-format-text";
    case "image":
      return "mdi-image";
    case "shape":
      return "mdi-shape";
    case "table":
      return "mdi-table";
    case "signature":
      return "mdi-draw";
    case "form":
      return "mdi-form-select";
    case "grid":
      return "mdi-grid";
    default:
      return "mdi-shape-outline";
  }
}

function getElementName(element: DocumentElement): string {
  // Create a user-friendly name based on element type and content
  const prefix = element.type.charAt(0).toUpperCase() + element.type.slice(1);

  switch (element.type) {
    case "text":
      // For text elements, use the first few words
      const text =
        typeof element.content === "string"
          ? element.content.replace(/<[^>]*>/g, "") // Remove HTML tags
          : "";
      const shortText = text.length > 15 ? text.substring(0, 15) + "..." : text;
      return shortText || `${prefix}`;

    case "shape":
      // For shapes, include the shape type
      return `${prefix}: ${element.content || "Rectangle"}`;

    case "image":
      return `${prefix}`;

    default:
      return `${prefix}`;
  }
}
</script>

<style scoped lang="scss">
.element-toolbar {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.98);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 8px 12px;
  z-index: 3000;
  backdrop-filter: blur(8px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 3px solid var(--primary);
  min-width: 250px;
  margin-top: 10px; /* Add space to avoid overlapping with the ruler */

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  }
}

.toolbar-section {
  display: flex;
  align-items: center;
}

.element-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.element-type {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--text-primary);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-number {
  font-size: 12px;
  color: var(--text-secondary);
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 12px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border);
  margin: 0 12px;
}

.layer-controls {
  display: flex;
  gap: 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;

  &:hover {
    background-color: rgba(12, 132, 254, 0.1);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.95);
  }

  &.disabled {
    color: var(--text-disabled);
    cursor: not-allowed;

    &:hover {
      background-color: transparent;
      transform: none;
    }

    &:active {
      transform: none;
    }
  }
}

.toolbar-tooltip {
  font-size: 12px;
  padding: 4px 8px;
  background-color: rgba(30, 30, 30, 0.85);
  color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
