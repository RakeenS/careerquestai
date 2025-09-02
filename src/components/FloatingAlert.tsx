import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

interface FloatingAlertProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const FloatingAlert: React.FC<FloatingAlertProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  autoClose = true,
  autoCloseTime = 5000,
  position = 'top-right'
}) => {
  // Auto-close effect
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseTime, onClose]);

  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  // Get color scheme based on alert type
  const getColorScheme = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  // Get icon based on alert type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  // Animations
  const variants = {
    hidden: { 
      opacity: 0,
      y: position.includes('top') ? -20 : 20,
      x: position.includes('center') ? 0 : position.includes('left') ? -20 : 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: position.includes('center') ? 0 : 0,
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 24
      }
    },
    exit: { 
      opacity: 0,
      y: position.includes('top') ? -10 : 10,
      scale: 0.95,
      transition: { 
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-50 max-w-md ${getPositionStyles()}`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
        >
          <div className={`flex items-start p-4 rounded-xl shadow-lg border ${getColorScheme()}`}>
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                className="inline-flex rounded-md focus:outline-none opacity-75 hover:opacity-100 transition-opacity"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <X className={`h-4 w-4 ${
                  type === 'success' ? 'text-green-500 dark:text-green-400' :
                  type === 'error' ? 'text-red-500 dark:text-red-400' :
                  type === 'warning' ? 'text-amber-500 dark:text-amber-400' :
                  'text-blue-500 dark:text-blue-400'
                }`} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingAlert; 