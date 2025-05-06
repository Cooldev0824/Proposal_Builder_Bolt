<template>
  <div class="property-group">
    <div class="property-group-title">Text Properties</div>

    <v-select
      v-model="textStyle"
      label="Text Style"
      :items="['Paragraph', 'Heading 1']"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateTextStyle"
    ></v-select>

    <v-select
      v-model="fontFamily"
      label="Font Family"
      :items="['Roboto', 'Arial', 'Times New Roman', 'Georgia']"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @blur="updateFontFamily"
      @change="updateFontFamily"
    ></v-select>

    <v-text-field
      v-model.number="fontSize"
      label="Font Size"
      type="number"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @blur="updateFontSize"
      @keydown.enter="updateFontSize"
    ></v-text-field>

    <div class="property-row">
      <v-btn
        :color="bold ? 'primary' : undefined"
        icon
        size="small"
        @click="toggleBoldStyle"
      >
        <v-icon>mdi-format-bold</v-icon>
      </v-btn>

      <v-btn
        :color="italic ? 'primary' : undefined"
        icon
        size="small"
        @click="toggleItalicStyle"
      >
        <v-icon>mdi-format-italic</v-icon>
      </v-btn>

      <v-btn
        :color="underline ? 'primary' : undefined"
        icon
        size="small"
        @click="toggleUnderlineStyle"
      >
        <v-icon>mdi-format-underline</v-icon>
      </v-btn>
    </div>

    <div class="property-row mt-4">
      <v-btn
        :color="textAlign === 'left' ? 'primary' : undefined"
        icon
        size="small"
        @click="setTextAlign('left')"
      >
        <v-icon>mdi-format-align-left</v-icon>
      </v-btn>

      <v-btn
        :color="textAlign === 'center' ? 'primary' : undefined"
        icon
        size="small"
        @click="setTextAlign('center')"
      >
        <v-icon>mdi-format-align-center</v-icon>
      </v-btn>

      <v-btn
        :color="textAlign === 'right' ? 'primary' : undefined"
        icon
        size="small"
        @click="setTextAlign('right')"
      >
        <v-icon>mdi-format-align-right</v-icon>
      </v-btn>

      <v-btn
        :color="textAlign === 'justify' ? 'primary' : undefined"
        icon
        size="small"
        @click="setTextAlign('justify')"
      >
        <v-icon>mdi-format-align-justify</v-icon>
      </v-btn>
    </div>

    <v-divider class="my-4"></v-divider>

    <div class="colors-section">
      <div class="property-group-subtitle mb-2">Colors</div>

      <div class="color-row mb-2">
        <div class="color-input-group">
          <label class="color-label">Text Color</label>
          <div class="color-input-wrapper">
            <div
              class="color-preview"
              :style="{ backgroundColor: textColor }"
              @click="showTextColorPicker = !showTextColorPicker"
            ></div>
            <v-text-field
              v-model="textColor"
              type="color"
              density="compact"
              variant="outlined"
              hide-details
              class="color-input"
              @blur="updateTextColor"
              @change="updateTextColor"
            ></v-text-field>
          </div>
        </div>

        <div class="color-input-group">
          <label class="color-label">Background</label>
          <div class="color-input-wrapper">
            <div
              class="color-preview"
              :style="{ backgroundColor: backgroundColor }"
              @click="showBgColorPicker = !showBgColorPicker"
            ></div>
            <v-text-field
              v-model="backgroundColor"
              type="color"
              density="compact"
              variant="outlined"
              hide-details
              class="color-input"
              @blur="updateBackgroundColor"
              @change="updateBackgroundColor"
            ></v-text-field>
          </div>
        </div>
      </div>

      <div class="property-row mb-2">
        <v-switch
          v-model="blockBackground"
          label="Block Background"
          density="compact"
          hide-details
          @change="toggleBlockBackground"
        ></v-switch>
      </div>

      <div v-if="blockBackground" class="color-row mb-2">
        <div class="color-input-group">
          <label class="color-label">Block Background Color</label>
          <div class="color-input-wrapper">
            <div
              class="color-preview"
              :style="{ backgroundColor: blockBackgroundColor }"
              @click="showBlockBgColorPicker = !showBlockBgColorPicker"
            ></div>
            <v-text-field
              v-model="blockBackgroundColor"
              type="color"
              density="compact"
              variant="outlined"
              hide-details
              class="color-input"
              @blur="updateBlockBackgroundColor"
              @change="updateBlockBackgroundColor"
            ></v-text-field>
          </div>
        </div>
      </div>

      <div v-if="blockBackground" class="color-presets mb-2">
        <div class="property-group-subtitle mb-1">Block Background Presets</div>
        <div class="color-preset-grid">
          <div
            v-for="color in blockColorPresets"
            :key="color"
            class="color-preset"
            :style="{ backgroundColor: color }"
            @click="selectBlockBackgroundColor(color)"
          ></div>
        </div>
      </div>

      <div class="property-row mb-2">
        <v-btn
          color="primary"
          size="small"
          @click="applyAllColors"
          class="apply-all-btn"
        >
          Apply All Colors
        </v-btn>
      </div>

      <div class="color-presets mb-2">
        <div class="property-group-subtitle mb-1">Text Color Presets</div>
        <div class="color-preset-grid">
          <div
            v-for="color in colorPresets"
            :key="color"
            class="color-preset"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          ></div>
        </div>
      </div>

      <div class="color-presets">
        <div class="property-group-subtitle mb-1">Background Color Presets</div>
        <div class="color-preset-grid">
          <div
            v-for="color in colorPresets"
            :key="color"
            class="color-preset"
            :style="{ backgroundColor: color }"
            @click="selectBackgroundColor(color)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DocumentElement } from '../../../types/document'
import {
  hasSavedSelection,
  applyBold,
  applyItalic,
  applyUnderline,
  applyFontFamily,
  applyFontSize,
  applyTextColor,
  applyBackgroundColor,
  applyTextAlignment,
  applyTextAndBackgroundColor
} from '../../../utils/selectionManager'

const props = defineProps<{
  element: DocumentElement
}>()

const emit = defineEmits<{
  (e: 'update:element', element: DocumentElement): void
}>()

const textStyle = ref(props.element.style?.textStyle || 'Paragraph')
const fontFamily = ref(props.element.style?.fontFamily || 'Roboto')
const fontSize = ref(props.element.style?.fontSize || 16)
const bold = ref(props.element.style?.bold || false)
const italic = ref(props.element.style?.italic || false)
const underline = ref(props.element.style?.underline || false)
const textAlign = ref(props.element.style?.align || 'left')
const textColor = ref(props.element.style?.color || '#000000')
const backgroundColor = ref(props.element.style?.backgroundColor || 'transparent')
const blockBackground = ref(props.element.style?.blockBackground || false)
const blockBackgroundColor = ref(props.element.style?.blockBackgroundColor || '#f5f5f5')

// Color picker visibility
const showTextColorPicker = ref(false)
const showBgColorPicker = ref(false)
const showBlockBgColorPicker = ref(false)

const colorPresets = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#C0C0C0'
]

const blockColorPresets = [
  '#f5f5f5', '#e0e0e0', '#f0f8ff', '#f0fff0', '#fff0f0',
  '#fffacd', '#e6e6fa', '#f0ffff', '#f5f5dc', '#faebd7'
]

watch(() => props.element, (newValue) => {
  textStyle.value = newValue.style?.textStyle || 'Paragraph'
  fontFamily.value = newValue.style?.fontFamily || 'Roboto'
  fontSize.value = newValue.style?.fontSize || 16
  bold.value = newValue.style?.bold || false
  italic.value = newValue.style?.italic || false
  underline.value = newValue.style?.underline || false
  textAlign.value = newValue.style?.align || 'left'
  textColor.value = newValue.style?.color || '#000000'
  backgroundColor.value = newValue.style?.backgroundColor || 'transparent'
  blockBackground.value = newValue.style?.blockBackground || false
  blockBackgroundColor.value = newValue.style?.blockBackgroundColor || '#f5f5f5'
}, { deep: true })

function updateElement(updates: Partial<typeof props.element.style>) {
  emit('update:element', {
    ...props.element,
    style: {
      ...props.element.style,
      ...updates
    }
  })
}

// Use the hasTextSelection prop to determine if text is selected

function updateTextStyle() {
  const updates = {
    textStyle: textStyle.value,
    fontSize: fontSize.value,
    bold: bold.value,
    italic: italic.value,
    underline: underline.value
  }
  updateElement(updates)
}

function updateFontFamily() {
  console.log('TextProperties: updateFontFamily')
  if (hasSavedSelection()) {
    applyFontFamily(fontFamily.value)
  } else {
    updateElement({ fontFamily: fontFamily.value })
  }
}

function updateFontSize() {
  console.log('TextProperties: updateFontSize', fontSize.value)

  // Force a small delay to ensure any selection is properly saved
  setTimeout(() => {
    // Check if there's a text selection
    const hasSelection = hasSavedSelection()
    console.log('Has saved selection for font size:', hasSelection)

    if (hasSelection) {
      // Apply font size to selected text only
      const success = applyFontSize(Number(fontSize.value))
      console.log('Applied font size to selection:', success)

      // The content will be updated by the TextElement component's mutation observer
      // No need to manually update the element here
    } else {
      // Apply font size to the whole element
      console.log('Applying font size to whole element:', fontSize.value)
      updateElement({ fontSize: fontSize.value })
    }
  }, 0)
}

function toggleBoldStyle() {
  bold.value = !bold.value
  console.log('TextProperties: toggleBold')
  if (hasSavedSelection()) {
    applyBold()
  } else {
    updateElement({ bold: bold.value })
  }
}

function toggleItalicStyle() {
  italic.value = !italic.value
  console.log('TextProperties: toggleItalic')
  if (hasSavedSelection()) {
    applyItalic()
  } else {
    updateElement({ italic: italic.value })
  }
}

function toggleUnderlineStyle() {
  underline.value = !underline.value
  console.log('TextProperties: toggleUnderline')
  if (hasSavedSelection()) {
    applyUnderline()
  } else {
    updateElement({ underline: underline.value })
  }
}

function setTextAlign(align: string) {
  textAlign.value = align
  console.log('TextProperties: setTextAlign')
  if (hasSavedSelection()) {
    applyTextAlignment(align as 'left' | 'center' | 'right' | 'justify')
  } else {
    updateElement({ align })
  }
}

function updateTextColor() {
  console.log('TextProperties: updateTextColor', textColor.value)

  // Force a small delay to ensure any selection is properly saved
  setTimeout(() => {
    // Check if there's a text selection
    const hasSelection = hasSavedSelection()
    console.log('Has saved selection for text color:', hasSelection)

    if (hasSelection) {
      // Apply text color to selected text only
      const success = applyTextColor(textColor.value)
      console.log('Applied text color to selection:', success)

      // The content will be updated by the TextElement component's mutation observer
      // No need to manually update the element here
    } else {
      // Apply text color to the whole element
      console.log('Applying text color to whole element:', textColor.value)
      updateElement({ color: textColor.value })
    }
  }, 0)
}

function updateBackgroundColor() {
  console.log('TextProperties: updateBackgroundColor', backgroundColor.value)

  // Force a small delay to ensure any selection is properly saved
  setTimeout(() => {
    // Check if there's a text selection
    const hasSelection = hasSavedSelection()
    console.log('Has saved selection for background color:', hasSelection)

    if (hasSelection && !blockBackground.value) {
      // Apply background color to selected text only
      const success = applyBackgroundColor(backgroundColor.value)
      console.log('Applied background color to selection:', success)

      // The content will be updated by the TextElement component's mutation observer
      // No need to manually update the element here
    } else {
      // Apply background color to the whole element
      console.log('Applying background color to whole element:', backgroundColor.value)
      updateElement({
        backgroundColor: backgroundColor.value,
        // If blockBackground is enabled, make sure it stays enabled
        blockBackground: blockBackground.value
      })
    }
  }, 0)
}

function selectColor(color: string) {
  textColor.value = color
  // Force a small delay to ensure any selection is properly saved
  setTimeout(() => {
    updateTextColor()
  }, 0)
}

function toggleBlockBackground() {
  console.log('TextProperties: toggleBlockBackground', blockBackground.value)

  // Force immediate update of the element with the new blockBackground value
  const updates: Partial<typeof props.element.style> = {
    blockBackground: blockBackground.value
  }

  // If block background is enabled, make sure to set the blockBackgroundColor
  if (blockBackground.value) {
    updates.blockBackgroundColor = blockBackgroundColor.value
  }

  // Apply the updates
  updateElement(updates)

  // Force a re-render by updating the element again after a short delay
  setTimeout(() => {
    if (blockBackground.value) {
      console.log('Forcing block background color update:', blockBackgroundColor.value)
      updateElement({
        blockBackground: true,
        blockBackgroundColor: blockBackgroundColor.value
      })
    }
  }, 50)
}

function updateBlockBackgroundColor() {
  console.log('TextProperties: updateBlockBackgroundColor', blockBackgroundColor.value)

  // Make sure block background is enabled and update the element with the new blockBackgroundColor value
  updateElement({
    blockBackground: true,
    blockBackgroundColor: blockBackgroundColor.value
  })

  // Force a re-render by updating the element again after a short delay
  setTimeout(() => {
    console.log('Forcing block background color update:', blockBackgroundColor.value)
    updateElement({
      blockBackground: true,
      blockBackgroundColor: blockBackgroundColor.value
    })
  }, 50)
}

function selectBackgroundColor(color: string) {
  backgroundColor.value = color
  // Force a small delay to ensure any selection is properly saved
  setTimeout(() => {
    updateBackgroundColor()
  }, 0)
}

function selectBlockBackgroundColor(color: string) {
  blockBackgroundColor.value = color

  // Make sure block background is enabled and update the element with the new blockBackgroundColor value
  updateElement({
    blockBackground: true,
    blockBackgroundColor: color
  })

  // Force a re-render by updating the element again after a short delay
  setTimeout(() => {
    console.log('Forcing block background color update from preset:', color)
    updateElement({
      blockBackground: true,
      blockBackgroundColor: color
    })
  }, 50)
}

function applyAllColors() {
  console.log('TextProperties: applyAllColors', {
    textColor: textColor.value,
    backgroundColor: backgroundColor.value,
    blockBackground: blockBackground.value,
    blockBackgroundColor: blockBackgroundColor.value
  })

  // Force a small delay to ensure any selection is properly saved
  setTimeout(() => {
    // Check if there's a text selection
    const hasSelection = hasSavedSelection()
    console.log('Has saved selection for applying all colors:', hasSelection)

    if (hasSelection) {
      // Apply colors to selected text
      applyColorsToSelection()
    } else {
      // Apply colors to the whole element
      applyColorsToElement()
    }
  }, 0)
}

function applyColorsToSelection() {
  // Apply text color to selection
  const textColorSuccess = applyTextColor(textColor.value)
  console.log('Applied text color to selection:', textColorSuccess)

  if (!blockBackground.value) {
    // Apply text background color to selection
    const bgColorSuccess = applyBackgroundColor(backgroundColor.value)
    console.log('Applied text background color to selection:', bgColorSuccess)
  } else {
    // Apply text background color to selection
    const bgColorSuccess = applyBackgroundColor(backgroundColor.value)
    console.log('Applied text background color to selection:', bgColorSuccess)

    // Update the element's block background
    updateElement({
      blockBackground: true,
      blockBackgroundColor: blockBackgroundColor.value
    })
  }
}

function applyColorsToElement() {
  // Apply all colors to the whole element
  const updates: Partial<typeof props.element.style> = {
    color: textColor.value,
    backgroundColor: backgroundColor.value
  };

  if (blockBackground.value) {
    updates.blockBackground = true;
    updates.blockBackgroundColor = blockBackgroundColor.value;
  } else {
    updates.blockBackground = false;
  }

  updateElement(updates);
  console.log('Applied all colors to whole element');
}
</script>

<style scoped lang="scss">
.property-row {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.property-group-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.color-row {
  display: flex;
  gap: 8px;
}

.color-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.color-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--border);
  cursor: pointer;
}

.color-input {
  flex: 1;
}

.color-presets {
  margin-top: 8px;
}

.color-preset-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 4px;
}

.color-preset {
  aspect-ratio: 1;
  border-radius: 4px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.apply-all-btn {
  width: 100%;
  margin-top: 4px;
}
</style>