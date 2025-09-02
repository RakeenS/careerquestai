import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Undo, Redo } from 'lucide-react';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const QuillEditor = React.forwardRef<ReactQuill, QuillEditorProps>(({ value, onChange, placeholder }, ref) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      ['clean']
    ],
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    }
  };

  const handleUndo = () => {
    const quill = (ref as React.RefObject<ReactQuill>)?.current?.getEditor();
    if (quill) {
      quill.history.undo();
    }
  };

  const handleRedo = () => {
    const quill = (ref as React.RefObject<ReactQuill>)?.current?.getEditor();
    if (quill) {
      quill.history.redo();
    }
  };

  return (
    <div className="quill-editor-container">
      <ReactQuill
        ref={ref}
        value={value}
        onChange={onChange}
        theme="snow"
        placeholder={placeholder}
        modules={modules}
        preserveWhitespace
      />
      <div className="flex mt-2">
        <button 
          onClick={handleUndo} 
          className="mr-2 p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          type="button"
        >
          <Undo size={16} />
        </button>
        <button 
          onClick={handleRedo} 
          className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          type="button"
        >
          <Redo size={16} />
        </button>
      </div>
    </div>
  );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;