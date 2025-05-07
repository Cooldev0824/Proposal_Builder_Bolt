const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Create documents directory if it doesn't exist
const DOCUMENTS_DIR = path.join(__dirname, 'documents');
if (!fs.existsSync(DOCUMENTS_DIR)) {
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Helper function to process images in document
function processDocumentImages(document) {
  if (document.sections) {
    document.sections.forEach(section => {
      if (section.elements) {
        section.elements.forEach(element => {
          // For image elements, only store the path/URL, not the full image data
          if (element.type === 'image' && element.content) {
            // If the content is a data URL, save it as a file and replace with the path
            if (element.content.startsWith('data:image')) {
              const imageId = uuidv4();
              const imageExt = element.content.split(';')[0].split('/')[1];
              const imagePath = `/images/${imageId}.${imageExt}`;
              
              // Save the image to disk
              const imageData = element.content.split(',')[1];
              const imageBuffer = Buffer.from(imageData, 'base64');
              
              // Create images directory if it doesn't exist
              const imagesDir = path.join(__dirname, 'public', 'images');
              if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
              }
              
              fs.writeFileSync(path.join(__dirname, 'public', imagePath), imageBuffer);
              
              // Replace the data URL with the file path
              element.content = imagePath;
            }
          }
        });
      }
    });
  }
  return document;
}

// Routes
// Get all documents (metadata only)
app.get('/api/documents', (req, res) => {
  try {
    const files = fs.readdirSync(DOCUMENTS_DIR);
    const documents = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const content = fs.readFileSync(path.join(DOCUMENTS_DIR, file), 'utf8');
        const document = JSON.parse(content);
        // Return only metadata, not the full document
        return {
          id: document.id,
          title: document.title,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt
        };
      });
    
    res.json(documents);
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

// Get a specific document by ID
app.get('/api/documents/:id', (req, res) => {
  try {
    const filePath = path.join(DOCUMENTS_DIR, `${req.params.id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const document = JSON.parse(content);
    
    res.json(document);
  } catch (error) {
    console.error(`Error getting document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

// Create or update a document
app.post('/api/documents', (req, res) => {
  try {
    let document = req.body;
    
    // Ensure document has an ID
    if (!document.id || document.id.startsWith('new-doc-')) {
      document.id = uuidv4();
    }
    
    // Set timestamps
    document.updatedAt = new Date().toISOString();
    if (!document.createdAt) {
      document.createdAt = document.updatedAt;
    }
    
    // Process images in the document
    document = processDocumentImages(document);
    
    // Save document as JSON file
    const filePath = path.join(DOCUMENTS_DIR, `${document.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(document, null, 2));
    
    res.json(document);
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Failed to save document' });
  }
});

// Delete a document
app.delete('/api/documents/:id', (req, res) => {
  try {
    const filePath = path.join(DOCUMENTS_DIR, `${req.params.id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    fs.unlinkSync(filePath);
    
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error(`Error deleting document ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
