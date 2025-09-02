import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as db from '../lib/database';
import type { Note } from '../lib/database';

export const useNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedNotes = await db.getNotes(user.id);
      setNotes(loadedNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNote = async (note: Partial<Note>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const savedNote = await db.saveNote(user.id, note);
      await loadNotes(); // Reload notes after saving
      return savedNote;
    } catch (err) {
      console.error('Error saving note:', err);
      throw err;
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await db.deleteNote(user.id, noteId);
      await loadNotes(); // Reload notes after deleting
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  };

  return {
    notes,
    isLoading,
    error,
    saveNote,
    deleteNote,
    refresh: loadNotes
  };
};