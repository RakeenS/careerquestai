import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import type { Note } from '../../lib/database';

interface NoteItemProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border rounded-lg p-4"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{note.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div 
        className="prose dark:prose-invert max-w-none" 
        dangerouslySetInnerHTML={{ __html: note.content }} 
      />
      <div className="mt-2 text-sm text-gray-500">
        Last updated: {new Date(note.updated_at).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export default NoteItem;