import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading your relationships..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="glass-effect rounded-2xl p-8 max-w-md mx-auto card-shadow text-center">
        <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Inner Orbit</h3>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 