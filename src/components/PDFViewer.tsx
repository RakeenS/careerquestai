import { useState, useEffect } from 'react';

interface PDFViewerProps {
  fileUrl: string;
  height?: string;
  width?: string;
}

export default function PDFViewer({ fileUrl, height = "100%", width = "100%" }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when a new fileUrl is provided
    setLoading(true);
    setError(null);
    
    // Check if there's a valid URL
    if (!fileUrl) {
      setError('No PDF URL provided');
      setLoading(false);
      return;
    }
    
    // Simulate loading time and check if file exists
    const timer = setTimeout(() => {
      // Could add fetch request here to verify file exists
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <iframe
        src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
        className="w-full h-full"
        style={{ height, width }}
        title="PDF Viewer"
        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  );
}
