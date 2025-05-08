import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { Document } from "../types/document";
import { getPaperSizeByName, getLandscapeSize } from "../utils/paperSizes";

export interface PdfExportOptions {
  filename?: string;
  includeBackground?: boolean;
  quality?: number; // 1-3, where 3 is highest quality
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

const defaultOptions: PdfExportOptions = {
  filename: "document.pdf",
  includeBackground: true,
  quality: 2,
  margins: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
};

/**
 * Export a document to PDF
 * @param docData The document data to export
 * @param container The HTML container element that contains the document content
 * @param options PDF export options
 * @returns Promise that resolves when the PDF has been generated and downloaded
 */
export async function exportToPdf(
  docData: Document,
  container: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };
  mergedOptions.margins = { ...defaultOptions.margins, ...options.margins };

  // Get paper size and orientation from document data
  const paperSizeName = docData.paperSize || "A4";
  const orientation = docData.orientation || "portrait";

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

  // Get all pages from the container
  const pages = container.querySelectorAll(".preview-page");
  if (pages.length === 0) {
    console.warn("No .preview-page elements found, trying to find any content");
    // If no specific page elements are found, try to use the container itself
    return exportSinglePage(docData, container, pdf, mergedOptions);
  }

  // Process each page
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i] as HTMLElement;

    // Clone the page to avoid modifying the original
    const pageClone = page.cloneNode(true) as HTMLElement;

    // Process the clone to ensure proper rendering
    processPageForExport(pageClone, mergedOptions);

    // Create a temporary container for the cloned page
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.appendChild(pageClone);
    document.body.appendChild(tempContainer);

    try {
      // Process SVG elements to ensure they render correctly
      const svgElements = pageClone.querySelectorAll("svg");
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

      // Render the page to canvas with settings that match the preview
      const canvas = await html2canvas(pageClone, {
        scale: mergedOptions.quality || 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: mergedOptions.includeBackground ? "white" : null,
        imageTimeout: 0,
        width: paperSize.width,
        height: paperSize.height,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: paperSize.width + 50,
        windowHeight: paperSize.height + 50,
        foreignObjectRendering: false,
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
            if (el instanceof HTMLElement) {
              el.style.visibility = "visible";
              el.style.display = "block";
            }
          });
        },
        ignoreElements: (element) => {
          // Ignore UI controls
          return (
            element.tagName === "BUTTON" ||
            element.classList.contains("resize-handle") ||
            element.classList.contains("scroll-control") ||
            element.classList.contains("v-btn--icon") ||
            element.classList.contains("handle") ||
            element.getAttribute("role") === "button"
          );
        },
      });

      // Add a new page for each page after the first
      if (i > 0) {
        pdf.addPage();
      }

      // Get the PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate margins
      const margins = mergedOptions.margins || {};
      const marginTop = margins.top || 0;
      const marginRight = margins.right || 0;
      const marginBottom = margins.bottom || 0;
      const marginLeft = margins.left || 0;

      // Calculate available space after margins
      const availableWidth = pdfWidth - marginLeft - marginRight;
      const availableHeight = pdfHeight - marginTop - marginBottom;

      // Calculate the scaling factor to fit the canvas to the available space
      const canvasAspectRatio = canvas.width / canvas.height;
      const availableAspectRatio = availableWidth / availableHeight;

      let scaledWidth, scaledHeight, offsetX, offsetY;

      if (canvasAspectRatio > availableAspectRatio) {
        // Canvas is wider than available space
        scaledWidth = availableWidth;
        scaledHeight = availableWidth / canvasAspectRatio;
        offsetX = marginLeft;
        offsetY = marginTop + (availableHeight - scaledHeight) / 2;
      } else {
        // Canvas is taller than available space
        scaledHeight = availableHeight;
        scaledWidth = availableHeight * canvasAspectRatio;
        offsetX = marginLeft + (availableWidth - scaledWidth) / 2;
        offsetY = marginTop;
      }

      // Add the image to the PDF
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        offsetX,
        offsetY,
        scaledWidth,
        scaledHeight
      );
    } finally {
      // Clean up the temporary container
      document.body.removeChild(tempContainer);
    }
  }

  // Save the PDF
  pdf.save(mergedOptions.filename || "document.pdf");
}

/**
 * Export a single page to PDF when no specific page elements are found
 * @param docData The document data to export
 * @param container The HTML container element
 * @param pdf The jsPDF instance
 * @param options PDF export options
 * @returns Promise that resolves when the PDF has been generated and saved
 */
async function exportSinglePage(
  docData: Document,
  container: HTMLElement,
  pdf: jsPDF,
  options: PdfExportOptions
): Promise<void> {
  console.log("Attempting to export single page from container:", container);

  // Clone the container to avoid modifying the original
  const containerClone = container.cloneNode(true) as HTMLElement;

  // Process the clone to ensure proper rendering
  processPageForExport(containerClone, options);

  // Create a temporary container for the cloned content
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.top = "-9999px";
  tempContainer.appendChild(containerClone);
  document.body.appendChild(tempContainer);

  try {
    // Get the PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Set container dimensions to match PDF size
    containerClone.style.width = `${pdfWidth}pt`;
    containerClone.style.minHeight = `${pdfHeight}pt`;
    containerClone.style.backgroundColor = "white";
    containerClone.style.position = "relative";
    containerClone.style.overflow = "hidden";

    // Render the container to canvas
    const canvas = await html2canvas(containerClone, {
      scale: options.quality || 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: options.includeBackground ? "white" : null,
      width: pdfWidth,
      height: pdfHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: pdfWidth + 50,
      windowHeight: pdfHeight + 50,
      foreignObjectRendering: false,
      ignoreElements: (element) => {
        // Ignore UI controls
        return (
          element.tagName === "BUTTON" ||
          element.classList.contains("resize-handle") ||
          element.classList.contains("scroll-control") ||
          element.classList.contains("v-btn--icon") ||
          element.classList.contains("handle") ||
          element.getAttribute("role") === "button"
        );
      },
    });

    // Calculate margins
    const margins = options.margins || {};
    const marginTop = margins.top || 0;
    const marginRight = margins.right || 0;
    const marginBottom = margins.bottom || 0;
    const marginLeft = margins.left || 0;

    // Calculate available space after margins
    const availableWidth = pdfWidth - marginLeft - marginRight;
    const availableHeight = pdfHeight - marginTop - marginBottom;

    // Add the image to the PDF
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      marginLeft,
      marginTop,
      availableWidth,
      availableHeight
    );

    // Save the PDF
    pdf.save(options.filename || "document.pdf");
  } finally {
    // Clean up the temporary container
    document.body.removeChild(tempContainer);
  }
}

/**
 * Process a page element for export
 * @param pageElement The page element to process
 * @param options PDF export options
 */
function processPageForExport(
  pageElement: HTMLElement,
  options: PdfExportOptions
): void {
  // Hide UI controls that shouldn't appear in the PDF
  const uiElements = pageElement.querySelectorAll(
    ".resize-handle, .scroll-control, .v-navigation-drawer, " +
      ".v-overlay, .v-menu, .v-btn--icon, button, " +
      "[role='button'], .control-button, .handle, " +
      ".v-slider, .v-input__control"
  );

  uiElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.style.display = "none";
      el.style.visibility = "hidden";
      el.style.opacity = "0";
    }
  });

  // Make sure all other elements are visible
  const allElements = pageElement.querySelectorAll("*");
  allElements.forEach((el) => {
    if (
      el instanceof HTMLElement &&
      !el.classList.contains("resize-handle") &&
      !el.classList.contains("scroll-control") &&
      !el.classList.contains("control-button") &&
      !el.classList.contains("handle") &&
      el.tagName !== "BUTTON" &&
      el.getAttribute("role") !== "button"
    ) {
      el.style.visibility = "visible";
      el.style.opacity = "1";

      // Ensure proper positioning for absolute elements
      if (el.style.position === "absolute") {
        const left = parseFloat(el.style.left || "0");
        const top = parseFloat(el.style.top || "0");
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
      }
    }
  });

  // Process SVG elements
  const svgElements = pageElement.querySelectorAll("svg");
  svgElements.forEach((svg) => {
    // Ensure SVG has proper namespace
    if (!svg.getAttribute("xmlns")) {
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    // Make sure SVG is visible
    svg.style.display = "block";
    svg.style.visibility = "visible";
  });
}
