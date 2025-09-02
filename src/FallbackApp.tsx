import React from 'react';

function FallbackApp() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-4">CareerQuestAI</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Welcome to the Resume Builder application. We're experiencing some technical difficulties with the full version.
        </p>
        <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Application Status</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The application is currently in maintenance mode. Some features may be temporarily unavailable.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
}

export default FallbackApp;
