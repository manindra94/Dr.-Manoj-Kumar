import React from 'react';
import { Home, User, FileText, BookOpen, Image, Activity, Settings, Lock } from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuth } from '../lib/AuthContext';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user && !user.isAnonymous && user.uid !== 'guest-anon';

  const protectedTabIds = ['papers', 'blog', 'gallery', 'analytics'];

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, isProtected: false },
    { id: 'about', label: 'About', icon: User, isProtected: false },
    { id: 'papers', label: 'Papers', icon: FileText, isProtected: true },
    { id: 'blog', label: 'Blog', icon: BookOpen, isProtected: true },
    { id: 'gallery', label: 'Gallery', icon: Image, isProtected: true },
    { id: 'analytics', label: 'Analytics', icon: Activity, isProtected: true },
    { id: 'settings', label: 'Settings', icon: Settings, isProtected: false }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#051424]/95 backdrop-blur-md border-t border-[#1c2b3c] py-1.5 px-2">
      <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLocked = tab.isProtected && !isAuthenticated;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 sm:px-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#1c2b3c] text-[#ffc640] border border-[#ffc640]/40 font-semibold shadow-inner'
                  : 'text-[#c6c6cd] hover:text-[#d4e4fa] hover:bg-[#122131]'
              }`}
              title={isLocked ? `${tab.label} (Researcher Login Required)` : tab.label}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#ffc640]' : 'text-[#c6c6cd]'}`} />
                {isLocked && (
                  <span className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-amber-500/90 border border-[#051424] flex items-center justify-center">
                    <Lock className="w-1.5 h-1.5 text-[#051424]" />
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono tracking-tight leading-none flex items-center gap-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
