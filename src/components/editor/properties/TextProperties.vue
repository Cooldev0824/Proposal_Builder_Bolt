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
        <v-text-field
          v-model="textColor"
          label="Text Color"
          type="color"
          density="compact"
          variant="outlined"
          hide-details
          class="color-input"
          @blur="updateTextColor"
          @change="updateTextColor"
        ></v-text-field>

        <v-text-field
          v-model="backgroundColor"
          label="Background"
          type="color"
          density="compact"
          variant="outlined"
          hide-details
          class="color-input"
          @blur="updateBackgroundColor"
          @change="updateBackgroundColor"
        ></v-text-field>
      </div>

      <div class="color-presets">
        <div
          v-for="color in colorPresets"
          :key="color"
          class="color-preset"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        ></div>
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
  applyTextAlignment
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

const colorPresets = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#C0C0C0'
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

  // Check if there's a text selection
  const hasSelection = hasSavedSelection()
  console.log('Has saved selection:', hasSelection)

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
  console.log('TextProperties: updateTextColor')
  if (hasSavedSelection()) {
    applyTextColor(textColor.value)
  } else {
    updateElement({ color: textColor.value })
  }
}

function updateBackgroundColor() {
  console.log('TextProperties: updateBackgroundColor')
  if (hasSavedSelection()) {
    applyBackgroundColor(backgroundColor.value)
  } else {
    updateElement({ backgroundColor: backgroundColor.value })
  }
}

function selectColor(color: string) {
  textColor.value = color
  updateTextColor()
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

  .color-input {
    flex: 1;
  }
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 8px;
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
</style>