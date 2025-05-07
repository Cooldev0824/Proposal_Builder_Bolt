<template>
  <div class="property-group">
    <div class="property-group-title">Table Properties</div>

    <!-- Table Structure -->
    <div class="section-title">Structure</div>
    <div class="property-row">
      <v-btn block @click="addColumn">
        <v-icon left>mdi-table-column-plus-after</v-icon>
        Add Column
      </v-btn>
    </div>
    <div class="property-row">
      <v-btn block @click="addRow">
        <v-icon left>mdi-table-row-plus-after</v-icon>
        Add Row
      </v-btn>
    </div>

    <!-- Border Style -->
    <div class="section-title mt-4">Border Style</div>
    <v-select
      v-model="borderStyle"
      label="Border Style"
      :items="['solid', 'dashed', 'dotted']"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateBorderStyle"
    ></v-select>

    <v-text-field
      v-model.number="borderWidth"
      label="Border Width"
      type="number"
      min="0"
      max="5"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateBorderWidth"
    ></v-text-field>

    <v-text-field
      v-model="borderColor"
      label="Border Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateBorderColor"
    ></v-text-field>

    <!-- Header Style -->
    <div class="section-title mt-4">Header Style</div>
    <v-text-field
      v-model="headerBackgroundColor"
      label="Background Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateHeaderBackgroundColor"
    ></v-text-field>

    <v-text-field
      v-model="headerTextColor"
      label="Text Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateHeaderTextColor"
    ></v-text-field>

    <!-- Cell Style -->
    <div class="section-title mt-4">Cell Style</div>
    <v-text-field
      v-model="cellBackgroundColor"
      label="Background Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateCellBackgroundColor"
    ></v-text-field>

    <v-text-field
      v-model="cellTextColor"
      label="Text Color"
      type="color"
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      @update:model-value="updateCellTextColor"
    ></v-text-field>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { DocumentElement } from "../../../types/document";

const props = defineProps<{
  element: DocumentElement;
}>();

const emit = defineEmits<{
  (e: "update:element", element: DocumentElement): void;
}>();

const borderStyle = ref(props.element.style?.borderStyle || "solid");
const borderWidth = ref(props.element.style?.borderWidth || 1);
const borderColor = ref(props.element.style?.borderColor || "#E2E8F0");
const headerBackgroundColor = ref(
  props.element.style?.headerBackgroundColor || "#F8F9FA"
);
const headerTextColor = ref(props.element.style?.headerTextColor || "#000000");
const cellBackgroundColor = ref(
  props.element.style?.cellBackgroundColor || "#FFFFFF"
);
const cellTextColor = ref(props.element.style?.cellTextColor || "#000000");

watch(
  () => props.element,
  (newValue) => {
    borderStyle.value = newValue.style?.borderStyle || "solid";
    borderWidth.value = newValue.style?.borderWidth || 1;
    borderColor.value = newValue.style?.borderColor || "#E2E8F0";
    headerBackgroundColor.value =
      newValue.style?.headerBackgroundColor || "#F8F9FA";
    headerTextColor.value = newValue.style?.headerTextColor || "#000000";
    cellBackgroundColor.value =
      newValue.style?.cellBackgroundColor || "#FFFFFF";
    cellTextColor.value = newValue.style?.cellTextColor || "#000000";
  },
  { deep: true }
);

function updateElement(updates: Partial<typeof props.element.style>) {
  emit("update:element", {
    ...props.element,
    style: {
      ...props.element.style,
      ...updates,
    },
  });
}

// Function to update all table properties at once
function updateAllProperties() {
  const updates: Partial<typeof props.element.style> = {
    borderStyle: borderStyle.value,
    borderWidth: borderWidth.value,
    borderColor: borderColor.value,
    headerBackgroundColor: headerBackgroundColor.value,
    headerTextColor: headerTextColor.value,
    cellBackgroundColor: cellBackgroundColor.value,
    cellTextColor: cellTextColor.value,
  };

  updateElement(updates);
}

function addColumn() {
  const updatedElement = {
    ...props.element,
    content: {
      headers: [...props.element.content.headers, "New Column"],
      rows: props.element.content.rows.map((row) => [...row, ""]),
    },
    // Preserve all style properties when adding a column
    style: {
      ...props.element.style,
      borderStyle: borderStyle.value,
      borderWidth: borderWidth.value,
      borderColor: borderColor.value,
      headerBackgroundColor: headerBackgroundColor.value,
      headerTextColor: headerTextColor.value,
      cellBackgroundColor: cellBackgroundColor.value,
      cellTextColor: cellTextColor.value,
    },
  };
  emit("update:element", updatedElement);
}

function addRow() {
  const newRow = new Array(props.element.content.headers.length).fill("");
  const updatedElement = {
    ...props.element,
    content: {
      ...props.element.content,
      rows: [...props.element.content.rows, newRow],
    },
    // Preserve all style properties when adding a row
    style: {
      ...props.element.style,
      borderStyle: borderStyle.value,
      borderWidth: borderWidth.value,
      borderColor: borderColor.value,
      headerBackgroundColor: headerBackgroundColor.value,
      headerTextColor: headerTextColor.value,
      cellBackgroundColor: cellBackgroundColor.value,
      cellTextColor: cellTextColor.value,
    },
  };
  emit("update:element", updatedElement);
}

// Use this single function for all property updates
function updateBorderStyle() {
  updateAllProperties();
}

function updateBorderWidth() {
  updateAllProperties();
}

function updateBorderColor() {
  updateAllProperties();
}

function updateHeaderBackgroundColor() {
  updateAllProperties();
}

function updateHeaderTextColor() {
  updateAllProperties();
}

function updateCellBackgroundColor() {
  updateAllProperties();
}

function updateCellTextColor() {
  updateAllProperties();
}
</script>

<style scoped lang="scss">
.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.property-row {
  margin-bottom: 8px;
}
</style>
