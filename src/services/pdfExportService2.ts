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
  paperSize?: string; // Paper size (A4, Letter, etc.)
  orientation?: string; // Portrait or landscape
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
  paperSize: "A4",
  orientation: "portrait",
};

/**
 * Export a document to PDF using the preview content
 * @param docData The document data to export
 * @param previewContent The HTML element containing the preview content
 * @param options PDF export options
 * @returns Promise that resolves when the PDF has been generated and downloaded
 */
export async function exportToPdf(
  docData: Document,
  previewContent: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };
  mergedOptions.margins = { ...defaultOptions.margins, ...options.margins };

  // Get paper size and orientation from options or document data
  const paperSizeName = mergedOptions.paperSize || docData.paperSize || "A4";
  const orientation =
    mergedOptions.orientation || docData.orientation || "portrait";

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

  // Get all pages from the preview content
  const pages = previewContent.querySelectorAll(".preview-page");
  if (pages.length === 0) {
    throw new Error("No pages found in the preview content");
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
          const width = svg.getAttribute("width");
          if (width) {
            svg.style.width = width.endsWith("px") ? width : `${width}px`;
          } else {
            svg.style.width = "100%";
          }
        }

        if (svg.style.height === "") {
          const height = svg.getAttribute("height");
          if (height) {
            svg.style.height = height.endsWith("px") ? height : `${height}px`;
          } else {
            svg.style.height = "100%";
          }
        }

        // Force SVG to be visible during capture
        svg.style.display = "block";
        svg.style.visibility = "visible";

        // Ensure all SVG child elements have proper attributes
        const svgChildren = svg.querySelectorAll("*");
        svgChildren.forEach((child) => {
          if (child instanceof SVGElement) {
            // Make sure all elements are visible
            child.style.visibility = "visible";

            // Ensure stroke attributes are properly set
            if (
              child.getAttribute("stroke") &&
              !child.getAttribute("stroke-width")
            ) {
              child.setAttribute("stroke-width", "1");
            }
          }
        });
      });

      // Render the page to canvas
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

            // Make sure SVG has proper dimensions
            if (svg.style.width === "") {
              const width = svg.getAttribute("width");
              if (width) {
                svg.style.width = width.endsWith("px") ? width : `${width}px`;
              } else {
                svg.style.width = "100%";
              }
            }

            if (svg.style.height === "") {
              const height = svg.getAttribute("height");
              if (height) {
                svg.style.height = height.endsWith("px")
                  ? height
                  : `${height}px`;
              } else {
                svg.style.height = "100%";
              }
            }

            // Make sure SVG is visible
            svg.style.display = "block";
            svg.style.visibility = "visible";

            // Process all SVG child elements
            const svgChildren = svg.querySelectorAll("*");
            svgChildren.forEach((child) => {
              if (child instanceof SVGElement) {
                // Make sure all elements are visible
                child.style.visibility = "visible";

                // Ensure stroke attributes are properly set
                if (
                  child.getAttribute("stroke") &&
                  !child.getAttribute("stroke-width")
                ) {
                  child.setAttribute("stroke-width", "1");
                }

                // Ensure fill is never undefined
                if (!child.hasAttribute("fill")) {
                  child.setAttribute("fill", "none");
                }
              }
            });
          });

          // Make sure all elements are visible
          const elements = clonedDoc.querySelectorAll(".elements-container *");
          elements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.visibility = "visible";
            }
          });
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
 * Export a document to PDF directly without requiring a dialog
 * @param docData The document data to export
 * @param options PDF export options
 * @returns Promise that resolves when the PDF has been generated and downloaded
 */
export async function directExportToPdf(
  docData: Document,
  options: PdfExportOptions = {}
): Promise<void> {
  try {
    // Create a temporary container for the preview
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "fixed";
    tempContainer.style.top = "-9999px";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = "100%";
    tempContainer.style.height = "100%";
    tempContainer.style.zIndex = "-1";
    tempContainer.style.opacity = "0";
    document.body.appendChild(tempContainer);

    // Create the preview content container
    const previewContent = document.createElement("div");
    previewContent.className = "preview-pages";
    previewContent.style.display = "flex";
    previewContent.style.flexDirection = "column";
    previewContent.style.alignItems = "center";
    previewContent.style.gap = "24px";
    previewContent.style.padding = "24px";
    previewContent.style.backgroundColor = "var(--surface, #f5f5f5)";
    tempContainer.appendChild(previewContent);

    // Get paper size and orientation from options or document data
    const paperSizeName = options.paperSize || docData.paperSize || "A4";
    const orientation =
      options.orientation || docData.orientation || "portrait";

    // Get the paper size dimensions
    let paperSizeObj = getPaperSizeByName(paperSizeName);
    if (orientation === "landscape") {
      paperSizeObj = getLandscapeSize(paperSizeObj);
    }

    // Create a preview page for each section
    for (const section of docData.sections) {
      // Create the page container
      const pageDiv = document.createElement("div");
      pageDiv.className = "preview-page";
      pageDiv.style.width = `${paperSizeObj.width}px`;
      pageDiv.style.height = `${paperSizeObj.height}px`; // Fixed height instead of minHeight
      pageDiv.style.backgroundColor = "white";
      pageDiv.style.position = "relative";
      pageDiv.style.boxSizing = "border-box";
      pageDiv.style.margin = "16px auto";
      pageDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
      pageDiv.style.overflow = "hidden"; // Ensure content doesn't exceed the page

      // Create the page content container
      const contentDiv = document.createElement("div");
      contentDiv.className = "page-content";
      contentDiv.style.position = "relative";
      contentDiv.style.height = `${paperSizeObj.height}px`;
      // contentDiv.style.padding = "24px";
      contentDiv.style.backgroundColor = "white";
      contentDiv.style.boxSizing = "border-box";
      contentDiv.style.overflow = "hidden"; // Ensure content doesn't exceed the page

      // Create the elements container
      const elementsDiv = document.createElement("div");
      elementsDiv.className = "elements-container";
      elementsDiv.style.position = "relative";
      elementsDiv.style.height = "100%";
      elementsDiv.style.width = "100%";
      elementsDiv.style.overflow = "hidden"; // Ensure elements don't overflow

      // Sort elements by zIndex
      const sortedElements = [...section.elements].sort((a, b) => {
        const zIndexA = a.zIndex ?? 0;
        const zIndexB = b.zIndex ?? 0;
        return zIndexA - zIndexB;
      });

      // Add each element to the page
      for (const element of sortedElements) {
        // Create a container for the element
        const elementContainer = document.createElement("div");
        elementContainer.style.position = "absolute";
        elementContainer.style.left = `${element.position.x}px`;
        elementContainer.style.top = `${element.position.y}px`;
        elementContainer.style.width = `${element.size.width}px`;
        elementContainer.style.height = `${element.size.height}px`;
        elementContainer.style.zIndex = `${element.zIndex || 0}`;

        // Add content based on element type
        if (element.type === "text") {
          elementContainer.innerHTML = element.content || "";

          // Apply text styles
          if (element.style) {
            // First, handle block background if it exists
            if (element.style.blockBackground) {
              elementContainer.style.backgroundColor =
                element.style.blockBackgroundColor || "#f5f5f5";
              elementContainer.style.padding = "8px";
              elementContainer.style.borderRadius = "4px";
            }

            Object.entries(element.style).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                switch (key) {
                  case "fontFamily":
                    elementContainer.style.fontFamily = value as string;
                    break;
                  case "fontSize":
                    elementContainer.style.fontSize = `${value}px`;
                    break;
                  case "bold":
                    if (value) elementContainer.style.fontWeight = "bold";
                    break;
                  case "italic":
                    if (value) elementContainer.style.fontStyle = "italic";
                    break;
                  case "underline":
                    if (value)
                      elementContainer.style.textDecoration = "underline";
                    break;
                  case "color":
                    elementContainer.style.color = value as string;
                    break;
                  case "backgroundColor":
                    // Only apply backgroundColor if blockBackground is not enabled
                    if (!element.style.blockBackground) {
                      elementContainer.style.backgroundColor = value as string;
                    }
                    break;
                  case "textAlign":
                    elementContainer.style.textAlign = value as string;
                    break;
                  case "lineHeight":
                    elementContainer.style.lineHeight = value as string;
                    break;
                  case "letterSpacing":
                    elementContainer.style.letterSpacing = `${value}px`;
                    break;
                  case "textIndent":
                    elementContainer.style.textIndent = `${value}px`;
                    break;
                  case "paragraphIndent":
                    elementContainer.style.marginLeft = `${value}px`;
                    break;
                  case "listType":
                    if (value === "bullet") {
                      elementContainer.style.listStyleType = "disc";
                      elementContainer.style.listStylePosition = "inside";
                      elementContainer.style.display = "list-item";
                      elementContainer.style.paddingLeft = "20px";
                    } else if (value === "number") {
                      elementContainer.style.listStyleType = "decimal";
                      elementContainer.style.listStylePosition = "inside";
                      elementContainer.style.display = "list-item";
                      elementContainer.style.paddingLeft = "20px";
                    }
                    break;
                }
              }
            });
          }
        } else if (element.type === "image") {
          const img = document.createElement("img");
          img.src = element.content || "";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = element.style?.objectFit || "contain";
          elementContainer.appendChild(img);
        } else if (element.type === "shape") {
          // Create an SVG element for the shape
          const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "100%");
          svg.setAttribute(
            "viewBox",
            `0 0 ${element.size.width} ${element.size.height}`
          );
          svg.style.display = "block";

          // Get shape properties
          const width = element.size.width;
          const height = element.size.height;
          const fill = element.style?.fill || "#E2E8F0";
          const stroke = element.style?.stroke || "#CBD5E1";
          const strokeWidth = element.style?.strokeWidth || 1;
          const shapeType = element.content || "rectangle";
          const rotation = element.style?.rotation || 0;

          // Create the appropriate shape
          let shapeElement;

          switch (shapeType) {
            case "rectangle":
              shapeElement = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
              );
              shapeElement.setAttribute("x", "0");
              shapeElement.setAttribute("y", "0");
              shapeElement.setAttribute("width", width.toString());
              shapeElement.setAttribute("height", height.toString());
              shapeElement.setAttribute(
                "rx",
                (element.style?.borderRadius || 0).toString()
              );
              break;

            case "circle":
              shapeElement = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "ellipse"
              );
              shapeElement.setAttribute("cx", (width / 2).toString());
              shapeElement.setAttribute("cy", (height / 2).toString());
              shapeElement.setAttribute("rx", (width / 2).toString());
              shapeElement.setAttribute("ry", (height / 2).toString());
              break;

            case "triangle":
              shapeElement = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "polygon"
              );
              const points = `${width / 2},0 ${width},${height} 0,${height}`;
              shapeElement.setAttribute("points", points);
              break;

            case "line":
              shapeElement = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
              );
              shapeElement.setAttribute("x1", "0");
              shapeElement.setAttribute("y1", (height / 2).toString());
              shapeElement.setAttribute("x2", width.toString());
              shapeElement.setAttribute("y2", (height / 2).toString());
              break;

            case "arrow":
              shapeElement = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
              );
              const arrowPath = `M0,${height / 2} L${width - 10},${
                height / 2
              } L${width - 15},${height / 4} L${width},${height / 2} L${
                width - 15
              },${(3 * height) / 4} L${width - 10},${height / 2}`;
              shapeElement.setAttribute("d", arrowPath);
              break;

            default:
              shapeElement = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
              );
              shapeElement.setAttribute("x", "0");
              shapeElement.setAttribute("y", "0");
              shapeElement.setAttribute("width", width.toString());
              shapeElement.setAttribute("height", height.toString());
              break;
          }

          // Apply styles to the shape
          shapeElement.setAttribute("fill", fill);
          shapeElement.setAttribute("stroke", stroke);
          shapeElement.setAttribute("stroke-width", strokeWidth.toString());

          // Apply line style if applicable
          if (shapeType === "line" && element.style?.lineStyle) {
            switch (element.style.lineStyle) {
              case "dashed":
                shapeElement.setAttribute("stroke-dasharray", "8,4");
                break;
              case "dotted":
                shapeElement.setAttribute("stroke-dasharray", "2,2");
                break;
              default:
                shapeElement.setAttribute("stroke-dasharray", "none");
            }
          }

          // Apply rotation if needed
          if (rotation !== 0) {
            const g = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "g"
            );
            g.setAttribute(
              "transform",
              `rotate(${rotation} ${width / 2} ${height / 2})`
            );
            g.appendChild(shapeElement);
            svg.appendChild(g);
          } else {
            svg.appendChild(shapeElement);
          }

          // Add the SVG to the element container
          elementContainer.appendChild(svg);
        } else if (element.type === "table") {
          elementContainer.innerHTML = element.content || "";
        } else if (element.type === "signature") {
          if (element.content) {
            const img = document.createElement("img");
            img.src = element.content;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "contain";
            elementContainer.appendChild(img);
          } else {
            elementContainer.style.border = "1px dashed #999";
          }
        } else if (element.type === "form") {
          elementContainer.style.border = "1px solid #ddd";
          elementContainer.style.borderRadius = "4px";
          elementContainer.style.backgroundColor = "#f9f9f9";

          if (element.formType === "textfield") {
            const input = document.createElement("input");
            input.type = "text";
            input.style.width = "100%";
            input.style.height = "100%";
            input.style.boxSizing = "border-box";
            input.style.border = "none";
            input.style.backgroundColor = "transparent";
            input.value = element.value || "";
            input.disabled = true;
            elementContainer.appendChild(input);
          } else if (element.formType === "checkbox") {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.style.width = "20px";
            checkbox.style.height = "20px";
            checkbox.style.margin = "auto";
            checkbox.style.position = "absolute";
            checkbox.style.top = "50%";
            checkbox.style.left = "50%";
            checkbox.style.transform = "translate(-50%, -50%)";
            checkbox.checked = element.checked || false;
            checkbox.disabled = true;
            elementContainer.appendChild(checkbox);
          }
        }

        // Add the element to the page
        elementsDiv.appendChild(elementContainer);
      }

      // Add the elements container to the page content
      contentDiv.appendChild(elementsDiv);

      // Add the page content to the page
      pageDiv.appendChild(contentDiv);

      // Add the page to the preview content
      previewContent.appendChild(pageDiv);
    }

    // Set default options
    const mergedOptions: PdfExportOptions = {
      ...defaultOptions,
      ...options,
      filename: options.filename || `${docData.title || "document"}.pdf`,
    };
    mergedOptions.margins = { ...defaultOptions.margins, ...options.margins };

    // Export the document to PDF
    await exportToPdf(docData, previewContent, mergedOptions);

    // Clean up the temporary container
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw error;
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
    }
  });
}
