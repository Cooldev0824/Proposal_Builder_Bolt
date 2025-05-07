<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="closePreview">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Preview</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="downloadPDF">
          <v-icon>mdi-download</v-icon>
        </v-btn>
      </v-toolbar>

      <v-container fluid>
        <div class="preview-pages" ref="previewContent">
          <div
            v-for="(section, index) in document.sections"
            :key="section.id"
            class="preview-page"
            :style="pageStyle"
          >
            <div class="page-content">
              <div class="elements-container">
                <component
                  v-for="element in getSortedElements(section.elements)"
                  :key="element.id"
                  :is="getElementComponent(element.type)"
                  :element="element"
                  :isSelected="false"
                  :isPreview="true"
                  :style="{ zIndex: element.zIndex || 0 }"
                />
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, watch, computed } from "vue";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { Document } from "../../types/document";
import { getPaperSizeByName, getLandscapeSize } from "../../utils/paperSizes";

const props = defineProps<{
  modelValue: boolean;
  document: Document;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const dialog = ref(props.modelValue);
const previewContent = ref<HTMLElement | null>(null);

// Page dimensions based on paper size
const pageWidth = computed(() => {
  const paperSizeName = props.document.paperSize || "Letter";
  const orientation = props.document.orientation || "portrait";

  let paperSize = getPaperSizeByName(paperSizeName);

  // Apply orientation
  if (orientation === "landscape") {
    paperSize = getLandscapeSize(paperSize);
  }

  return paperSize.width; // Return raw pixel value
});

const pageHeight = computed(() => {
  const paperSizeName = props.document.paperSize || "Letter";
  const orientation = props.document.orientation || "portrait";

  let paperSize = getPaperSizeByName(paperSizeName);

  // Apply orientation
  if (orientation === "landscape") {
    paperSize = getLandscapeSize(paperSize);
  }

  return paperSize.height; // Return raw pixel value
});

// Computed style for the page
const pageStyle = computed(() => {
  return {
    width: `${pageWidth.value}px`,
    minHeight: `${pageHeight.value}px`,
  };
});

watch(
  () => props.modelValue,
  (value) => {
    dialog.value = value;
  }
);

watch(
  () => dialog.value,
  (value) => {
    emit("update:modelValue", value);
  }
);

const TextElement = defineAsyncComponent(
  () => import("./elements/TextElement.vue")
);
const ImageElement = defineAsyncComponent(
  () => import("./elements/ImageElement.vue")
);
const ShapeElement = defineAsyncComponent(
  () => import("./elements/ShapeElement.vue")
);
const TableElement = defineAsyncComponent(
  () => import("./elements/TableElement.vue")
);
const SignatureElement = defineAsyncComponent(
  () => import("./elements/SignatureElement.vue")
);
const FormElement = defineAsyncComponent(
  () => import("./elements/FormElement.vue")
);

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

// Sort elements by zIndex for proper layering
function getSortedElements(elements: any[]) {
  if (!elements || !Array.isArray(elements)) return [];

  // Make a copy of the elements array to avoid modifying the original
  return [...elements].sort((a, b) => {
    // Default zIndex to 0 if not set
    const zIndexA = a.zIndex ?? 0;
    const zIndexB = b.zIndex ?? 0;
    return zIndexA - zIndexB;
  });
}

function closePreview() {
  dialog.value = false;
}

async function downloadPDF() {
  if (!previewContent.value) return;

  // Get paper size and orientation from document
  const paperSizeName = props.document.paperSize || "Letter";
  const orientation = props.document.orientation || "portrait";

  // Get the paper size dimensions
  let paperSize = getPaperSizeByName(paperSizeName);
  if (orientation === "landscape") {
    paperSize = getLandscapeSize(paperSize);
  }

  // Create PDF with the correct paper size and orientation
  const pdfOrientation = orientation === "landscape" ? "l" : "p";
  const pdf = new jsPDF({
    orientation: pdfOrientation,
    unit: "pt",
    format: paperSizeName.toLowerCase(),
    hotfixes: ["px_scaling"],
  });
  const pages = previewContent.value.querySelectorAll(".preview-page");

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i] as HTMLElement;

    // Process SVG elements to ensure they render correctly
    const svgElements = page.querySelectorAll("svg");
    svgElements.forEach((svg) => {
      // Add XML namespace if missing
      if (!svg.getAttribute("xmlns")) {
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }

      // Ensure SVG has explicit dimensions
      if (svg.style.width === "") {
        svg.style.width = svg.getAttribute("width") + "px";
      }
      if (svg.style.height === "") {
        svg.style.height = svg.getAttribute("height") + "px";
      }

      // Force SVG to be visible during capture
      svg.style.display = "block";
      svg.style.visibility = "visible";
    });

    // Use higher scale for better quality and ensure exact match with preview
    const canvas = await html2canvas(page, {
      scale: 2, // Reduced scale for better performance while maintaining quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "white",
      imageTimeout: 0,
      width: pageWidth.value, // Use exact page width
      height: pageHeight.value, // Use exact page height
      x: 0, // Start from the left edge
      y: 0, // Start from the top edge
      scrollX: 0, // Prevent scrolling issues
      scrollY: 0, // Prevent scrolling issues
      windowWidth: pageWidth.value + 50, // Add some margin
      windowHeight: pageHeight.value + 50, // Add some margin
      foreignObjectRendering: false, // Set to false for better SVG support
      onclone: (clonedDoc) => {
        // Process SVG elements in the cloned document
        const clonedSvgs = clonedDoc.querySelectorAll("svg");
        clonedSvgs.forEach((svg) => {
          // Ensure SVG has proper namespace
          if (!svg.getAttribute("xmlns")) {
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          }

          // Make sure SVG is visible
          svg.style.display = "block";
          svg.style.visibility = "visible";
        });

        // Make sure all elements are visible
        const elements = clonedDoc.querySelectorAll(".elements-container *");
        elements.forEach((el) => {
          (el as HTMLElement).style.visibility = "visible";
          (el as HTMLElement).style.display = "block";
        });
      },
    });

    if (i > 0) {
      pdf.addPage();
    }

    // Get the PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate the scaling factor to fit the canvas to the PDF
    const canvasAspectRatio = canvas.width / canvas.height;
    const pdfAspectRatio = pdfWidth / pdfHeight;

    let scaledWidth,
      scaledHeight,
      offsetX = 0,
      offsetY = 0;

    if (canvasAspectRatio > pdfAspectRatio) {
      // Canvas is wider than PDF
      scaledWidth = pdfWidth;
      scaledHeight = pdfWidth / canvasAspectRatio;
      offsetY = (pdfHeight - scaledHeight) / 2;
    } else {
      // Canvas is taller than PDF
      scaledHeight = pdfHeight;
      scaledWidth = pdfHeight * canvasAspectRatio;
      offsetX = (pdfWidth - scaledWidth) / 2;
    }

    // Add the image with exact dimensions to match the preview
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    );
  }

  pdf.save("document.pdf");
}
</script>

<style scoped lang="scss">
.preview-pages {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background-color: var(--surface);
}

.preview-page {
  background-color: var(--background);
  box-shadow: var(--shadow-md);
  margin: 16px auto;
  position: relative;
  box-sizing: border-box;

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
}
</style>
