import React from 'react';
import { Cloud, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { HybridStorageService } from '../services/hybridStorage';

interface StorageStatusProps {
  className?: string;
}

const StorageStatus: React.FC<StorageStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = React.useState(() => HybridStorageService.getStorageStatus());

  React.useEffect(() => {
    // Update status every 5 seconds
    const interval = setInterval(() => {
      setStatus(HybridStorageService.getStorageStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!status.isFirebaseEnabled && !status.isLocalStorageAvailable) {
    return null; // Don't show anything if neither storage is available
  }

  return (
    <div className={`flex items-center space-x-2 text-xs ${className}`}>
      {status.isFirebaseEnabled ? (
        <>
          <Cloud className="w-3 h-3 text-green-500" />
          <Wifi className="w-3 h-3 text-green-500" />
          <span className="text-green-700">Cloud Sync</span>
        </>
      ) : (
        <>
          <HardDrive className="w-3 h-3 text-blue-500" />
          <WifiOff className="w-3 h-3 text-blue-500" />
          <span className="text-blue-700">Local Only</span>
        </>
      )}
    </div>
  );
};

export default StorageStatus; 