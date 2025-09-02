import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus, Edit2, Trash2, Save, X, Loader } from 'lucide-react';
import QuillEditor from './QuillEditor';
import type { Note } from '../lib/database';

interface NotesSectionProps {
  notes: Note[];
  onSaveNote: (note: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  isLoading: boolean;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, onSaveNote, onDeleteNote, isLoading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editingNote.title || !editingNote.content) return;
    
    setIsSaving(true);
    try {
      await onSaveNote(editingNote);
      setIsEditing(false);
      setEditingNote({});
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await onDeleteNote(id);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Book className="mr-2" />
          Notes
        </h2>
        {!isEditing && (
          <button
            onClick={() => {
              setEditingNote({});
              setIsEditing(true);
            }}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Note
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading notes...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-4 mb-4"
              >
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingNote.title || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                    placeholder="Note Title"
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700"
                  />
                  <QuillEditor
                    value={editingNote.content || ''}
                    onChange={(content) => setEditingNote({ ...editingNote, content })}
                    placeholder="Write your note here..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingNote({});
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !editingNote.title || !editingNote.content}
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
            )}
          </AnimatePresence>

          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{note.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
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
            ))}
          </AnimatePresence>

          {!isEditing && notes.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No notes yet. Click "Add Note" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesSection;