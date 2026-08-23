import React from 'react';
import { Home, User, FileText, BookOpen, Image, Activity, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'papers', label: 'Papers', icon: FileText },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#051424]/95 backdrop-blur-md border-t border-[#1c2b3c] py-1.5 px-2">
      <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#1c2b3c] text-[#ffc640] border border-[#ffc640]/40 font-semibold shadow-inner'
                  : 'text-[#c6c6cd] hover:text-[#d4e4fa] hover:bg-[#122131]'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#ffc640]' : 'text-[#c6c6cd]'}`} />
              <span className="text-[10px] font-mono tracking-tight leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
