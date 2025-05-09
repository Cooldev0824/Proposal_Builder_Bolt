<template>
  <div class="element-layer-controls" v-show="true">
    <div class="layer-info">
      <div class="layer-badge">
        <div class="layer-number">{{ layerIndex + 1 }}</div>
      </div>
      <div class="layer-details">
        <div class="layer-type">
          <v-icon
            size="small"
            :icon="getElementIcon(element.type)"
            class="type-icon"
          ></v-icon>
        </div>
        <div class="layer-name">{{ getElementName(element) }}</div>
      </div>
    </div>

    <div class="layer-actions">
      <v-tooltip location="top" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="action-btn"
            :class="{ disabled: isTopLayer }"
            :disabled="isTopLayer"
            @click.stop="$emit('move-to-top', element)"
            aria-label="Bring to Front"
          >
            <v-icon size="small">mdi-arrow-collapse-up</v-icon>
          </button>
        </template>
        <span>Bring to Front</span>
      </v-tooltip>

      <v-tooltip location="top" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="action-btn"
            :class="{ disabled: isTopLayer }"
            :disabled="isTopLayer"
            @click.stop="$emit('move-up', element)"
            aria-label="Move Up"
          >
            <v-icon size="small">mdi-arrow-up</v-icon>
          </button>
        </template>
        <span>Move Up</span>
      </v-tooltip>

      <v-tooltip location="top" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="action-btn"
            :class="{ disabled: isBottomLayer }"
            :disabled="isBottomLayer"
            @click.stop="$emit('move-down', element)"
            aria-label="Move Down"
          >
            <v-icon size="small">mdi-arrow-down</v-icon>
          </button>
        </template>
        <span>Move Down</span>
      </v-tooltip>

      <v-tooltip location="top" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="action-btn"
            :class="{ disabled: isBottomLayer }"
            :disabled="isBottomLayer"
            @click.stop="$emit('move-to-bottom', element)"
            aria-label="Send to Back"
          >
            <v-icon size="small">mdi-arrow-collapse-down</v-icon>
          </button>
        </template>
        <span>Send to Back</span>
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
}>();

defineEmits<{
  (e: "move-up", element: DocumentElement): void;
  (e: "move-down", element: DocumentElement): void;
  (e: "move-to-top", element: DocumentElement): void;
  (e: "move-to-bottom", element: DocumentElement): void;
}>();

const isTopLayer = computed(() => props.layerIndex === props.totalLayers - 1);
const isBottomLayer = computed(() => props.layerIndex === 0);

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
.element-layer-controls {
  position: absolute;
  top: -44px;
  left: 0;
  right: 0;
  height: 44px;
  background-color: rgba(255, 255, 255, 0.98);
  border: none;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 2000;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  font-size: 14px;
  pointer-events: all;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
  animation: slideDown 0.3s ease-out;

  &:hover {
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
  }
}

.layer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.layer-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

.layer-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background-color: var(--primary);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(12, 132, 254, 0.2);
}

.layer-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.layer-type {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: rgba(12, 132, 254, 0.1);
  border-radius: 6px;

  .type-icon {
    color: var(--primary);
  }
}

.layer-name {
  font-weight: 500;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--text-primary);
}

.layer-actions {
  display: flex;
  gap: 4px;
  background-color: rgba(245, 247, 250, 0.8);
  border-radius: 6px;
  padding: 2px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.15s ease;
  padding: 0;

  &:hover {
    background-color: rgba(12, 132, 254, 0.1);
  }

  &:active {
    background-color: rgba(12, 132, 254, 0.2);
    transform: scale(0.95);
  }

  &.disabled {
    color: var(--text-disabled);
    cursor: not-allowed;

    &:hover {
      background-color: transparent;
    }

    &:active {
      transform: none;
    }
  }
}

.layer-tooltip {
  font-size: 12px;
  padding: 4px 8px;
  background-color: rgba(30, 30, 30, 0.9);
  color: white;
  border-radius: 4px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
