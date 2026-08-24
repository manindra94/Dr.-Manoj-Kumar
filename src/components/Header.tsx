import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Smartphone,
  Monitor,
  CheckCheck,
  ShieldCheck,
  LogOut,
  Mail,
  ChevronDown,
  X
} from 'lucide-react';
import { localDB, StorageState } from '../lib/db';
import { notificationsEngine, InAppNotification } from '../lib/notifications';
import { useAuth } from '../lib/AuthContext';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onOpenTaskModal: () => void;
  onOpenAuthModal?: () => void;
  onOpenSubmissionModal?: (type?: 'publication' | 'blog' | 'gallery' | 'collaboration') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMobileFrame,
  setIsMobileFrame,
  onOpenTaskModal: _onOpenTaskModal
}) => {
  const [dbState, setDbState] = useState<StorageState>(localDB.getState());
  const [notifications, setNotifications] = useState<InAppNotification[]>(notificationsEngine.getNotifications());
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    const unsubDB = localDB.subscribe(setDbState);
    const unsubNotif = notificationsEngine.subscribe(setNotifications);
    return () => {
      unsubDB();
      unsubNotif();
    };
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const unreadMessagesCount = dbState.messages ? dbState.messages.filter((m) => m.status === 'UNREAD').length : 0;

  return (
    <header className="sticky top-0 z-40 bg-[#051424]/95 backdrop-blur-md border-b border-[#1c2b3c] px-3 sm:px-6 py-2.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Scientist Identity */}
        <div 
          onClick={() => setActiveTab('about')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative">
            <img
              src={dbState.profile.avatarUrl}
              alt={dbState.profile.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-[#ffc640] group-hover:scale-105 transition-transform shadow-md"
            />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#051424] ${
              dbState.isOnline ? 'bg-emerald-400' : 'bg-amber-500'
            }`} title={dbState.isOnline ? 'Status: Online' : 'Status: Local'} />
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[#d4e4fa] tracking-tight group-hover:text-[#ffc640] transition-colors font-serif">
                {dbState.profile.name}
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-[#c6c6cd] uppercase tracking-wider flex items-center gap-1">
              {dbState.profile.title}
            </p>
          </div>
        </div>

        {/* Right: Controls, User Auth, Notifications & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Admin Auth Status Dropdown (only visible when authenticated) */}
          {user && !user.isAnonymous && (
            <div className="relative flex items-center gap-1.5">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg border transition-all ${
                  isAdmin
                    ? 'bg-[#ffc640]/10 border-[#ffc640]/40 text-[#ffc640] hover:bg-[#ffc640]/20'
                    : 'bg-[#2fd9f4]/10 border-[#2fd9f4]/40 text-[#2fd9f4] hover:bg-[#2fd9f4]/20'
                }`}
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ffc640]" />
                )}
                <span className="font-bold hidden sm:inline">
                  {isAdmin ? 'ADMIN CMS' : 'AUTHENTICATED'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Auth Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#122131] border border-[#273647] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 font-mono text-xs space-y-2.5">
                  <div className="pb-2 border-b border-[#273647]">
                    <div className="font-bold text-[#d4e4fa] font-serif text-sm truncate">
                      {user?.displayName || 'Admin Account'}
                    </div>
                    <div className="text-[11px] text-[#c6c6cd] truncate">{user?.email || 'Active session'}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#1c2b3c] text-[#ffc640]">
                      Status: {isAdmin ? 'CMS ADMINISTRATOR' : 'LOGGED IN'}
                    </div>
                  </div>

                  {/* Main Options */}
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab('settings');
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg bg-[#ffc640]/15 hover:bg-[#ffc640]/25 text-[#ffc640] border border-[#ffc640]/40 flex items-center justify-between transition-colors font-bold"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        CMS Management Hub
                      </span>
                      <ChevronDown className="w-3 h-3 -rotate-90" />
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab('home');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] text-white flex items-center justify-between transition-colors text-[11px]"
                    >
                      <span>View Public Website</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#273647] flex justify-end items-center text-[11px]">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="text-red-400 hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Viewport Frame Switcher */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className={`hidden lg:flex items-center gap-1.5 text-xs font-mono px-2 py-1.5 rounded-lg border border-[#273647] transition-all ${
              isMobileFrame
                ? 'bg-[#ffc640] text-[#051424] font-semibold border-[#ffc640]'
                : 'bg-[#122131] text-[#d4e4fa] hover:bg-[#1c2b3c]'
            }`}
            title="Toggle Mobile Screen Frame Simulation"
          >
            {isMobileFrame ? (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#2fd9f4]" />
                <span>Web</span>
              </>
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="p-2 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] text-[#d4e4fa] border border-[#273647] transition-all relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#ffc640]" />
              {(unreadNotifCount > 0 || unreadMessagesCount > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifCount + unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Notification & Messages Drawer */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#122131] border border-[#273647] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#273647] mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#ffc640]" />
                    <h3 className="font-serif text-sm font-bold text-[#d4e4fa]">
                      Firebase Activity & Alerts
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowNotifDrawer(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {unreadMessagesCount > 0 && (
                    <div className="p-2.5 rounded-lg bg-[#ffc640]/10 border border-[#ffc640]/40 text-xs">
                      <div className="flex items-center justify-between font-mono text-[10px] text-[#ffc640] mb-1">
                        <span className="uppercase font-bold flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {unreadMessagesCount} NEW CONTACT INQUIRY
                        </span>
                      </div>
                      <p className="text-[11px] text-[#d4e4fa]">
                        New research collaboration inquiry received in Firestore.
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowNotifDrawer(false);
                        }}
                        className="mt-1 text-[10px] font-mono text-[#ffc640] underline font-bold"
                      >
                        View in Settings CMS →
                      </button>
                    </div>
                  )}

                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No active system alerts</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg border text-xs transition-all ${
                          n.read
                            ? 'bg-[#051424]/60 border-[#1c2b3c] text-slate-300'
                            : 'bg-[#1c2b3c] border-[#2fd9f4]/40 text-[#d4e4fa] shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#2fd9f4] mb-1">
                          <span className="uppercase tracking-wider">[{n.type}]</span>
                          <span>{n.timestamp}</span>
                        </div>
                        <h4 className="font-semibold text-xs text-[#ffc640] mb-0.5">{n.title}</h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{n.body}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-[#273647] flex justify-between items-center text-xs font-mono">
                  <button
                    onClick={() => notificationsEngine.markAllAsRead()}
                    className="text-[#2fd9f4] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                  </button>
                  <button
                    onClick={() => notificationsEngine.triggerPushAlert('Firebase Sync Triggered', 'All collections synchronized with remote Firestore cloud database.')}
                    className="text-[#ffc640] hover:underline"
                  >
                    Test Sync Alert
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings Hub Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-lg border transition-all ${
              activeTab === 'settings'
                ? 'bg-[#ffc640] text-[#051424] border-[#ffc640]'
                : 'bg-[#122131] hover:bg-[#1c2b3c] text-[#d4e4fa] border-[#273647]'
            }`}
            aria-label="Settings"
            title="System Settings & Firebase CMS"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
