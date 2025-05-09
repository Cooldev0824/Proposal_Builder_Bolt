<template>
  <div
    class="group-element element"
    :class="{ selected: isSelected }"
    :style="elementStyle"
    @mousedown.stop="handleMouseDown"
    @click="handleClick"
    @keydown="handleKeyDown"
    tabindex="0"
  >
    <!-- Group border and background -->
    <div class="group-container" :style="groupContainerStyle" @click.stop="handleClick">
      <!-- Render child elements -->
      <component
        v-for="childElement in props.element.children"
        :key="childElement.id"
        :is="getElementComponent(childElement.type)"
        :element="childElement"
        :isSelected="false"
        :isPreview="true"
        :style="getChildStyle(childElement)"
        class="group-child-element"
      />
    </div>

    <!-- Resize handles -->
    <ResizeHandles
      v-if="isSelected"
      :elementSize="props.element.size"
      :elementPosition="props.element.position"
      :minWidth="50"
      :minHeight="50"
      :gridSize="10"
      @resize="handleResize"
    />

    <!-- Rotation handle -->
    <div
      v-if="isSelected"
      class="rotate-handle"
      @mousedown.stop="startRotate"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { DocumentElement, Size, Position } from "../../../types/document";
import ResizeHandles from "../../editor/ResizeHandles.vue";

const props = defineProps<{
  element: DocumentElement;
  isSelected: boolean;
  isPreview?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:element", element: DocumentElement): void;
  (e: "click", element: DocumentElement): void;
}>();

// Dynamically import element components
const TextElement = defineAsyncComponent(
  () => import("./TextElement.vue")
);
const ImageElement = defineAsyncComponent(
  () => import("./ImageElement.vue")
);
const ShapeElement = defineAsyncComponent(
  () => import("./ShapeElement.vue")
);
const TableElement = defineAsyncComponent(
  () => import("./SimpleTableElement.vue")
);
const SignatureElement = defineAsyncComponent(
  () => import("./SignatureElement.vue")
);
const FormElement = defineAsyncComponent(
  () => import("./FormElement.vue")
);

// Get the appropriate component for each element type
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
    default:
      return null;
  }
}

// Get rotation value
const rotation = computed(() => props.element.style?.rotation || 0);

// Compute the style for the group element
const elementStyle = computed(() => {
  return {
    left: `${props.element.position.x}px`,
    top: `${props.element.position.y}px`,
    width: `${props.element.size.width}px`,
    height: `${props.element.size.height}px`,
    position: "absolute",
    zIndex: props.element.zIndex || 0,
    transform: `rotate(${rotation.value}deg)`,
    transformOrigin: 'center center',
  };
});

// Compute the style for the group container
const groupContainerStyle = computed(() => {
  const style = props.element.style || {};
  return {
    width: "100%",
    height: "100%",
    border: style.borderWidth ? `${style.borderWidth}px ${style.borderStyle || 'dashed'} ${style.borderColor || '#666'}` : "1px dashed #666",
    backgroundColor: style.backgroundColor || "transparent",
    opacity: style.opacity !== undefined ? style.opacity : 1,
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  };
});

// Calculate the style for child elements (position relative to group)
function getChildStyle(childElement: DocumentElement) {
  return {
    position: "absolute",
    left: `${childElement.position.x}px`,
    top: `${childElement.position.y}px`,
    width: `${childElement.size.width}px`,
    height: `${childElement.size.height}px`,
    zIndex: childElement.zIndex || 0,
  };
}

// Drag functionality
let isDragging = false;
let startX = 0;
let startY = 0;
let startLeft = 0;
let startTop = 0;

// Rotation functionality
let isRotating = false;
let startAngle = 0;

// Handle mousedown event - this will both select the group and start dragging
function handleMouseDown(event: MouseEvent) {
  // Don't do anything if we're in preview mode
  if (props.isPreview) return;

  console.log("Group mousedown:", props.element.id);

  // Force focus on this group element
  const groupElement = event.currentTarget as HTMLElement;
  if (groupElement) {
    // Focus the element
    groupElement.focus();

    // Add a visual feedback
    groupElement.classList.add('click-feedback');

    // Remove it after the animation completes
    setTimeout(() => {
      groupElement.classList.remove('click-feedback');
    }, 300);
  }

  // First, emit a click event to ensure the group is selected
  // Use a small timeout to ensure it happens before dragging starts
  setTimeout(() => {
    console.log("Emitting click event for group from mousedown:", props.element.id);
    emit("click", props.element);

    // Then start the drag operation
    startDrag(event);
  }, 0);
}

function startDrag(event: MouseEvent) {
  // Don't start drag if we're in preview mode
  if (props.isPreview) return;

  isDragging = true;
  startX = event.clientX;
  startY = event.clientY;
  startLeft = props.element.position.x;
  startTop = props.element.position.y;

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}

function onDrag(event: MouseEvent) {
  if (!isDragging) return;

  const dx = event.clientX - startX;
  const dy = event.clientY - startY;

  // Calculate new position with grid snapping
  const gridSize = 10;
  const newLeft = Math.round((startLeft + dx) / gridSize) * gridSize;
  const newTop = Math.round((startTop + dy) / gridSize) * gridSize;

  // Update element position
  const updatedElement = {
    ...props.element,
    position: {
      x: newLeft,
      y: newTop,
    },
    // No need to update children positions as they are relative to the group
    // and will move automatically with the group
  };

  console.log("Moving group to:", newLeft, newTop);
  emit("update:element", updatedElement);
}

function stopDrag() {
  isDragging = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
}

// Handle resize
function handleResize(newSize: Size, newPosition: Position) {
  // Calculate the scale factors for child elements
  const scaleX = newSize.width / props.element.size.width;
  const scaleY = newSize.height / props.element.size.height;

  // Calculate position offset
  const offsetX = newPosition.x - props.element.position.x;
  const offsetY = newPosition.y - props.element.position.y;

  // Update children positions and sizes proportionally
  const updatedChildren = props.element.children?.map(child => {
    // Calculate new relative position
    const relativeX = child.position.x - props.element.position.x;
    const relativeY = child.position.y - props.element.position.y;

    // Scale the position and add the offset
    const newX = newPosition.x + (relativeX * scaleX);
    const newY = newPosition.y + (relativeY * scaleY);

    // Scale the size
    const newWidth = child.size.width * scaleX;
    const newHeight = child.size.height * scaleY;

    return {
      ...child,
      position: { x: newX, y: newY },
      size: { width: newWidth, height: newHeight }
    };
  });

  // Update the group element
  const updatedElement = {
    ...props.element,
    position: newPosition,
    size: newSize,
    children: updatedChildren
  };

  emit("update:element", updatedElement);
}

// Rotation functions
function startRotate(event: MouseEvent) {
  isRotating = true;
  const rect = (event.target as HTMLElement)
    .closest(".group-element")
    ?.getBoundingClientRect();
  if (!rect) return;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);

  document.addEventListener("mousemove", onRotate);
  document.addEventListener("mouseup", stopRotate);
}

function onRotate(event: MouseEvent) {
  if (!isRotating) return;

  const rect = (event.target as HTMLElement)
    .closest(".group-element")
    ?.getBoundingClientRect();
  if (!rect) return;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);

  let newRotation =
    ((angle - startAngle) * (180 / Math.PI) +
      (props.element.style?.rotation || 0)) %
    360;
  if (newRotation < 0) newRotation += 360;

  const updatedElement = {
    ...props.element,
    style: {
      ...props.element.style,
      rotation: newRotation,
    },
  };

  emit("update:element", updatedElement);
}

function stopRotate() {
  isRotating = false;
  document.removeEventListener("mousemove", onRotate);
  document.removeEventListener("mouseup", stopRotate);
}

// Handle click on the group
function handleClick(event: MouseEvent) {
  // Stop propagation to prevent document click from deselecting
  event.stopPropagation();

  console.log("Group clicked:", props.element.id);

  // Force focus on this group element
  const groupElement = event.currentTarget as HTMLElement;
  if (groupElement) {
    // Focus the element
    groupElement.focus();

    // Add a visual feedback that the group was clicked
    groupElement.classList.add('click-feedback');

    // Remove it after the animation completes
    setTimeout(() => {
      groupElement.classList.remove('click-feedback');
    }, 300);
  }

  // Emit the click event to select this group
  // Use a small timeout to ensure it happens after any other selection events
  setTimeout(() => {
    console.log("Emitting click event for group:", props.element.id);
    emit("click", props.element);
  }, 0);

  // If this is a mousedown event, prevent default to ensure we get focus
  if (event.type === 'mousedown') {
    event.preventDefault();
  }
}

// Handle keyboard events
function handleKeyDown(event: KeyboardEvent) {
  // Handle Enter or Space to select the group
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    console.log("Group selected via keyboard:", props.element.id);

    // Force focus on this group element
    const groupElement = event.currentTarget as HTMLElement;
    if (groupElement) {
      // Focus the element
      groupElement.focus();

      // Add visual feedback
      groupElement.classList.add('click-feedback');
      setTimeout(() => {
        groupElement.classList.remove('click-feedback');
      }, 300);
    }

    // Emit the click event to select this group
    // Use a small timeout to ensure it happens after any other selection events
    setTimeout(() => {
      console.log("Emitting click event for group from keyboard:", props.element.id);
      emit("click", props.element);
    }, 0);
  }
}

// Update a child element
function updateChildElement(updatedChild: DocumentElement) {
  if (!props.element.children) return;

  const updatedChildren = props.element.children.map(child =>
    child.id === updatedChild.id ? updatedChild : child
  );

  const updatedElement = {
    ...props.element,
    children: updatedChildren
  };

  emit("update:element", updatedElement);
}
</script>

<style scoped lang="scss">
.group-element {
  cursor: move;
  user-select: none;

  // Add a click feedback animation
  &.click-feedback {
    animation: click-pulse 0.3s ease-out;
  }

  @keyframes click-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }

  &.selected {
    outline: 3px solid var(--primary, #0c84fe);

    // Show a semi-transparent overlay when selected
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(12, 132, 254, 0.1);
      pointer-events: none;
    }

    // Make the folder icon more visible when selected
    .group-container::before {
      opacity: 1;
    }

    // Make the group container more visible when selected
    .group-container {
      border: 2px solid #0c84fe !important;
      background-color: rgba(12, 132, 254, 0.05);
      box-shadow: 0 0 10px rgba(12, 132, 254, 0.2);
    }
  }

  .group-container {
    border-radius: 2px;
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;

    // Add a more visible border and background to make it easier to select
    border: 2px dashed #666 !important;
    background-color: rgba(240, 240, 240, 0.1);

    // Add a subtle drop shadow to indicate it's a group
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);

    // Add a folder icon to indicate it's a group
    &::before {
      content: '';
      position: absolute;
      top: -15px;
      left: 0;
      width: 20px;
      height: 15px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23666" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>');
      background-repeat: no-repeat;
      background-size: contain;
      opacity: 0.9;
      pointer-events: none;
    }

    // Add a stronger hover effect to make it clear it's selectable
    &:hover {
      box-shadow: 0 0 10px rgba(12, 132, 254, 0.3);
      border-color: #0c84fe !important;
      background-color: rgba(12, 132, 254, 0.05);
    }
  }

  // Make child elements non-interactive
  .group-child-element {
    pointer-events: none !important; // Prevent any mouse events
    user-select: none !important;
    cursor: default !important;

    // Add a slight opacity to indicate they're part of a group
    opacity: 0.95;

    // Disable all interactive elements inside child components
    input, textarea, button, select, a {
      pointer-events: none !important;
      user-select: none !important;
    }
  }

  // Rotation handle
  .rotate-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: var(--primary, #0c84fe);
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 50%;
    cursor: grab;
    z-index: 1;

    &:active {
      cursor: grabbing;
    }
  }
}
</style>
