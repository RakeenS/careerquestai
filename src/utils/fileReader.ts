/**
 * File Reader Utility
 * Provides functions to read and extract content from various file types
 */

/**
 * Reads a file and returns its contents as a string
 * Uses the appropriate method based on file type
 */
export const readFileContent = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No file provided');
  }

  // For PDF files, we need to use a specialized approach
  if (file.type === 'application/pdf') {
    return await readPdfContent(file);
  }

  // For text-based files, we can use the FileReader API
  if (file.type.startsWith('text/')) {
    return await readTextFile(file);
  }

  // For unsupported file types, provide a message
  return `File type '${file.type}' is not supported for content extraction.`;
};

/**
 * Reads the content of a PDF file
 * In a production app, we would use PDF.js or a similar library
 * This is a simple implementation for demo purposes
 */
const readPdfContent = async (file: File): Promise<string> => {
  // This is a simplified reader that won't actually parse PDF structure
  // Instead, we'll read the file as text and attempt to extract what we can
  try {
    // Convert the PDF to a text blob
    const arrayBuffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder('utf-8');
    let content = textDecoder.decode(arrayBuffer);
    
    // Clean up the content to make it more readable
    // Remove control characters, multiple spaces, etc.
    content = content
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ')                  // Normalize whitespace
      .replace(/\0/g, ' ');                  // Replace null bytes
      
    // Extract readable text (anything that looks like text)
    // This is a simplified approach - in a real app we'd use PDF.js
    const textParts: string[] = [];
    
    // Extract text between markers that often appear in PDFs
    const textMarkers = [
      /\/Text\s*<<(.*?)>>/g,        // PDF text objects
      /\[(.*?)\]\s*TJ/g,            // Text showing operators
      /\((.*?)\)\s*Tj/g,            // More text operators
      /\/Contents\s*\[(.*?)\]/g      // Content streams
    ];
    
    textMarkers.forEach(marker => {
      const matches = content.matchAll(marker);
      for (const match of matches) {
        if (match[1] && typeof match[1] === 'string') {
          // Decode the text (simplified)
          let text = match[1]
            .replace(/\\\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
            .replace(/\\[()\\]/g, m => m.charAt(1));
            
          // Only add if it contains readable text (at least some letters and reasonable length)
          if (/[a-zA-Z]{3,}/.test(text) && text.length > 5) {
            textParts.push(text);
          }
        }
      }
    });
    
    // If we couldn't extract anything meaningful using markers,
    // try to find any text that looks reasonable
    if (textParts.length === 0) {
      const words = content.match(/[a-zA-Z]{3,}[a-zA-Z\s,\.:;-]{5,}/g);
      if (words) {
        textParts.push(...words);
      }
    }
    
    // If we still have nothing, use a fallback message
    if (textParts.length === 0) {
      return "We couldn't extract readable text from this PDF. Please try opening it in the Resume Builder to edit manually.";
    }
    
    // Join extracted parts with newlines for readability
    return textParts.join("\n\n");
    
  } catch (error) {
    console.error("Error reading PDF:", error);
    return "Error extracting text from PDF. Please try opening it in the Resume Builder to edit manually.";
  }
};

/**
 * Reads a text file using the FileReader API
 */
const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};
