import React from 'react';
import { Plus, ArrowLeft, Orbit, LogOut, User, Users, Network } from 'lucide-react';
import StorageStatus from './StorageStatus';
import { AuthUser } from '../services/authService';

interface HeaderProps {
  title: string;
  currentView: 'list' | 'detail' | 'network';
  onViewChange: (view: 'list' | 'detail' | 'network') => void;
  onAddContact?: () => void;
  onBackToList?: () => void;
  onSignOut?: () => void;
  user?: AuthUser;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  currentView, 
  onViewChange, 
  onAddContact, 
  onBackToList, 
  onSignOut, 
  user 
}) => {
  return (
    <header className="glass-effect border-b border-white/20 bg-slate-800/95 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBackToList && (
              <button
                onClick={onBackToList}
                className="p-2 rounded-full bg-white/40 hover:bg-white/50 transition-colors duration-200 shadow-lg"
                aria-label="Back to list"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <Orbit className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>
            <StorageStatus className="text-white/80" />
          </div>

          {/* Navigation Tabs */}
          {!onBackToList && (
            <div className="flex items-center space-x-1 bg-white/20 rounded-lg p-1">
              <button
                onClick={() => onViewChange('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                  currentView === 'list'
                    ? 'bg-white text-slate-800 font-medium'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Contacts</span>
              </button>
              <button
                onClick={() => onViewChange('network')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                  currentView === 'network'
                    ? 'bg-white text-slate-800 font-medium'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Network className="w-4 h-4" />
                <span className="text-sm">Network</span>
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            {onAddContact && (
              <button
                onClick={onAddContact}
                className="flex items-center space-x-2 px-4 py-2 bg-white/30 hover:bg-white/40 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Contact</span>
              </button>
            )}
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/20 rounded-lg">
                  <User className="w-4 h-4 text-white/80" />
                  <span className="text-white/90 text-sm">{user.email}</span>
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="flex items-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 