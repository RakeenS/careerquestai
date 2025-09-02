import React from 'react';
import { AlertCircle, Clock, Crown } from 'lucide-react';
import { ApiUsage, formatApiUsage } from '../lib/apiUsage';

interface ApiUsageAlertProps {
  usage: ApiUsage;
}

const ApiUsageAlert: React.FC<ApiUsageAlertProps> = ({ usage }) => {
  const { used, remaining, limit, resetTime, percentageUsed, isAdmin } = formatApiUsage(usage);

  if (isAdmin) {
    return (
      <div className="rounded-lg p-4 mb-4 flex items-start bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
        <Crown className="flex-shrink-0 mr-3 mt-0.5" size={20} />
        <div>
          <p className="font-medium">Admin Account</p>
          <p className="text-sm mt-1">
            You have unlimited API access. Total calls made: {used}
          </p>
        </div>
      </div>
    );
  }

  if (percentageUsed < 75) return null;

  const getAlertStyle = () => {
    if (percentageUsed >= 90) return 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    return 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
  };

  return (
    <div className={`rounded-lg p-4 mb-4 flex items-start ${getAlertStyle()}`}>
      <AlertCircle className="flex-shrink-0 mr-3 mt-0.5" size={20} />
      <div>
        <p className="font-medium">API Usage Alert</p>
        <p className="text-sm mt-1">
          You've used {used} out of {limit} daily API calls ({remaining} remaining).
        </p>
        <p className="text-sm mt-1 flex items-center">
          <Clock className="mr-1" size={14} />
          Resets at: {resetTime}
        </p>
      </div>
    </div>
  );
};

export default ApiUsageAlert;