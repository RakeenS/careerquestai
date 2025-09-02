import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') return;
    
    setIsDeleting(true);
    setError(null);

    try {
      // Delete user data from all tables
      const { error: deleteError } = await supabase
        .rpc('delete_user_data', {
          user_id: user?.id
        });

      if (deleteError) throw deleteError;

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user?.id || ''
      );

      if (authError) throw authError;

      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-600 flex items-center">
              <AlertTriangle className="mr-2" />
              Delete Account
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg mb-4">
              <p className="text-red-800 dark:text-red-200 font-medium">Warning:</p>
              <ul className="list-disc list-inside text-red-700 dark:text-red-300 text-sm space-y-1">
                <li>This action cannot be undone</li>
                <li>All your data will be permanently deleted</li>
                <li>You will lose access to all saved resumes and applications</li>
              </ul>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To confirm deletion, please type "DELETE" in the field below:
            </p>

            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 mb-4"
              placeholder="Type DELETE to confirm"
            />

            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmation !== 'DELETE' || isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isDeleting ? (
                <>
                  <Loader className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteAccountModal;