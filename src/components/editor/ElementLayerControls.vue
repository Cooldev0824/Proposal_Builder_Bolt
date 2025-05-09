<template>
  <div class="element-layer-controls">
    <div class="layer-info">
      <!-- Hidden in this layout -->
    </div>

    <div class="layer-actions">
      <v-tooltip location="left" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="action-btn"
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

      <v-tooltip location="left" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="action-btn"
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

      <v-tooltip location="left" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="action-btn"
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

      <v-tooltip location="left" content-class="layer-tooltip">
        <template v-slot:activator="{ props }">
          <button
            v-bind="props"
            class="action-btn"
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

// Compute whether the element is at the top or bottom of the stack
const isTopLayer = computed(() => props.layerIndex === props.totalLayers - 1);
const isBottomLayer = computed(() => props.layerIndex === 0);
</script>

<style scoped lang="scss">
.element-layer-controls {
  position: absolute;
  top: 0;
  right: -60px; /* Position to the right of the element */
  width: 50px;
  background-color: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 12px;
  display: flex;
  flex-direction: column; /* Stack buttons vertically */
  align-items: center;
  justify-content: center;
  padding: 10px 5px;
  z-index: 3000; /* Ensure it's above the ruler (z-index: 1000) */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  pointer-events: all;
  backdrop-filter: blur(8px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity; /* Optimize animations */
  border-left: 3px solid var(--primary);

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
    transform: translateX(-2px);
  }
}

.layer-info {
  display: none; /* Hide the layer info in this compact layout */
}

.layer-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  margin: 2px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--primary);
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: 10px;
    z-index: -1;
  }

  &:hover {
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(12, 132, 254, 0.2);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.95) translateY(0);
    box-shadow: 0 2px 8px rgba(12, 132, 254, 0.1);
  }

  &.disabled {
    color: var(--text-disabled);
    cursor: not-allowed;
    background-color: rgba(245, 247, 250, 0.5);
    box-shadow: none;

    &:hover {
      transform: none;
      color: var(--text-disabled);
      background-color: rgba(245, 247, 250, 0.5);
      box-shadow: none;

      &::before {
        opacity: 0;
      }
    }

    &:active {
      transform: none;
    }
  }
}

.layer-tooltip {
  font-size: 12px;
  padding: 6px 10px;
  background-color: rgba(30, 30, 30, 0.85);
  color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  font-weight: 500;
  letter-spacing: 0.3px;
  border-left: 2px solid var(--primary);
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateX(15px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
