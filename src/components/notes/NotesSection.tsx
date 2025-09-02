import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus, Edit2, Trash2, Save, X, Loader } from 'lucide-react';
import QuillEditor from '../QuillEditor';
import type { Note } from '../../lib/database';
import NoteEditor from './NoteEditor';
import NoteItem from './NoteItem';

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
              <NoteEditor
                note={editingNote}
                onSave={handleSave}
                onCancel={() => {
                  setIsEditing(false);
                  setEditingNote({});
                }}
                onChange={(field, value) => setEditingNote({ ...editingNote, [field]: value })}
                isSaving={isSaving}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onEdit={() => handleEdit(note)}
                onDelete={() => handleDelete(note.id)}
              />
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