import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

export const Header: React.FC = () => {
  const { business } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="bg-bg-primary border-b border-border px-4 py-3 lg:px-6 lg:py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-text-secondary hover:text-text-primary p-2 -ml-2 rounded-md hover:bg-bg-secondary transition-colors"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Welcome back!
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Manage your AI WhatsApp assistant
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-md transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>

          {/* User profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-text-primary">
                {business?.name || 'Business'}
              </p>
              <p className="text-xs text-text-secondary">
                {business?.phone_number || ''}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
