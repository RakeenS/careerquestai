import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as db from '../lib/database';
import { ResumeContent } from '../types';

export const useUserContent = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeContent[]>([]);
  const [coverLetters, setCoverLetters] = useState<string[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserContent();
    }
  }, [user]);

  const loadUserContent = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const [loadedResumes, loadedCoverLetters, loadedEmailTemplates] = await Promise.all([
        db.getResumes(user.id),
        db.getCoverLetters(user.id),
        db.getEmailTemplates(user.id)
      ]);

      setResumes(loadedResumes);
      setCoverLetters(loadedCoverLetters);
      setEmailTemplates(loadedEmailTemplates);
    } catch (err) {
      console.error('Error loading user content:', err);
      setError('Failed to load your content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveResume = async (resume: ResumeContent) => {
    if (!user) return;
    try {
      await db.saveResume(user.id, resume);
      await loadUserContent(); // Reload content after saving
    } catch (err) {
      console.error('Error saving resume:', err);
      throw err;
    }
  };

  const saveCoverLetter = async (content: string) => {
    if (!user) return;
    try {
      await db.saveCoverLetter(user.id, content);
      await loadUserContent();
    } catch (err) {
      console.error('Error saving cover letter:', err);
      throw err;
    }
  };

  const saveEmailTemplate = async (content: string) => {
    if (!user) return;
    try {
      await db.saveEmailTemplate(user.id, content);
      await loadUserContent();
    } catch (err) {
      console.error('Error saving email template:', err);
      throw err;
    }
  };

  return {
    resumes,
    coverLetters,
    emailTemplates,
    isLoading,
    error,
    saveResume,
    saveCoverLetter,
    saveEmailTemplate,
    refresh: loadUserContent
  };
};