import React from 'react';
import { motion } from 'framer-motion';
import { Save, X, Loader } from 'lucide-react';
import QuillEditor from '../QuillEditor';
import type { Note } from '../../lib/database';

interface NoteEditorProps {
  note: Partial<Note>;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onChange: (field: keyof Note, value: string) => void;
  isSaving: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onCancel,
  onChange,
  isSaving
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border rounded-lg p-4 mb-4"
    >
      <div className="space-y-4">
        <input
          type="text"
          value={note.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Note Title"
          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700"
        />
        <QuillEditor
          value={note.content || ''}
          onChange={(content) => onChange('content', content)}
          placeholder="Write your note here..."
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader className="animate-spin mr-2" size={18} />
            ) : (
              <Save className="mr-2" size={18} />
            )}
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteEditor;