import { supabase } from './supabaseClient';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export const getNotes = async (userId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return data || [];
};

export const saveNote = async (userId: string, note: Partial<Note>): Promise<Note> => {
  const noteData = {
    user_id: userId,
    title: note.title || '',
    content: note.content || '',
    category: note.category || 'general',
    ...(note.id && { id: note.id })
  };

  const { data, error } = await supabase
    .from('notes')
    .upsert([noteData])
    .select()
    .single();

  if (error) {
    console.error('Error saving note:', error);
    throw error;
  }

  if (!data) {
    throw new Error('No data returned from save operation');
  }

  return data;
};

export const deleteNote = async (userId: string, noteId: string): Promise<void> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .match({ user_id: userId, id: noteId });

  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};