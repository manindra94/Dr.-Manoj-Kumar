import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/views/HomeView';
import { AboutView } from './components/views/AboutView';
import { PapersView } from './components/views/PapersView';
import { BlogView } from './components/views/BlogView';
import { GalleryView } from './components/views/GalleryView';
import { SettingsView } from './components/views/SettingsView';
import { AnalyticsDashboard } from './components/views/AnalyticsDashboard';
import { RestrictedAccessGate } from './components/RestrictedAccessGate';

import { ContactModal } from './components/modals/ContactModal';
import { PaperModal } from './components/modals/PaperModal';
import { TaskReminderModal } from './components/modals/TaskReminderModal';
import { AuthModal } from './components/modals/AuthModal';

import { EditProfileModal } from './components/modals/EditProfileModal';
import { PublicationModal } from './components/modals/PublicationModal';
import { BlogPostModal } from './components/modals/BlogPostModal';
import { GalleryItemModal } from './components/modals/GalleryItemModal';
import { ResearcherSubmissionModal } from './components/modals/ResearcherSubmissionModal';

import { useAuth } from './lib/AuthContext';
import { ActiveTab, Publication, BlogPost, GalleryItem } from './types';

const PROTECTED_TABS: ActiveTab[] = ['papers', 'blog', 'gallery', 'analytics'];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [pendingRedirectTab, setPendingRedirectTab] = useState<ActiveTab | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  const { user } = useAuth();
  const isAuthenticated = !!user && !user.isAnonymous && user.uid !== 'guest-anon';

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    isOpen: boolean;
    initialRole?: 'admin' | 'user';
    initialMode?: 'login' | 'signup';
    targetTab?: ActiveTab | null;
  }>({ isOpen: false, initialRole: 'user', initialMode: 'login', targetTab: null });
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);

  // Auto-redirect if user just signed in and was waiting for a protected tab
  useEffect(() => {
    if (isAuthenticated && pendingRedirectTab) {
      setActiveTab(pendingRedirectTab);
      setPendingRedirectTab(null);
    }
  }, [isAuthenticated, pendingRedirectTab]);

  // Intercept navigation requests to protected tabs when unauthenticated
  const handleTabNavigation = (target: ActiveTab) => {
    if (PROTECTED_TABS.includes(target) && !isAuthenticated) {
      setPendingRedirectTab(target);
      setAuthModalConfig({
        isOpen: true,
        initialRole: 'user',
        initialMode: 'login',
        targetTab: target
      });
      setActiveTab(target);
      return;
    }
    setActiveTab(target);
  };

  const handleAuthSuccess = (_role: 'admin' | 'user') => {
    if (pendingRedirectTab) {
      setActiveTab(pendingRedirectTab);
      setPendingRedirectTab(null);
    }
  };

  // Researcher Submissions Modal
  const [submissionModalState, setSubmissionModalState] = useState<{
    isOpen: boolean;
    initialType?: 'publication' | 'blog' | 'gallery' | 'collaboration';
  }>({ isOpen: false, initialType: 'publication' });

  // Dynamic Content Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [pubModalState, setPubModalState] = useState<{
    isOpen: boolean;
    pubToEdit: Publication | null;
  }>({ isOpen: false, pubToEdit: null });

  const [blogModalState, setBlogModalState] = useState<{
    isOpen: boolean;
    postToEdit: BlogPost | null;
  }>({ isOpen: false, postToEdit: null });

  const [galleryModalState, setGalleryModalState] = useState<{
    isOpen: boolean;
    itemToEdit: GalleryItem | null;
  }>({ isOpen: false, itemToEdit: null });

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            setActiveTab={handleTabNavigation}
            onOpenContactModal={() => setIsContactModalOpen(true)}
            onOpenEditProfileModal={() => setIsEditProfileOpen(true)}
            onOpenAddPaperModal={() => setPubModalState({ isOpen: true, pubToEdit: null })}
            onOpenEditPaperModal={(pub) => setPubModalState({ isOpen: true, pubToEdit: pub })}
          />
        );
      case 'about':
        return (
          <AboutView
            onOpenContactModal={() => setIsContactModalOpen(true)}
            onOpenEditProfileModal={() => setIsEditProfileOpen(true)}
          />
        );
      case 'papers':
        if (!isAuthenticated) {
          return (
            <RestrictedAccessGate
              targetTab="papers"
              onOpenAuthModal={(role, mode) =>
                setAuthModalConfig({
                  isOpen: true,
                  initialRole: role || 'user',
                  initialMode: mode || 'login',
                  targetTab: 'papers'
                })
              }
              onGoHome={() => setActiveTab('home')}
            />
          );
        }
        return (
          <PapersView
            onSelectPaper={(pub) => setSelectedPublication(pub)}
            onOpenAddPaperModal={() => setPubModalState({ isOpen: true, pubToEdit: null })}
            onOpenEditPaperModal={(pub) => setPubModalState({ isOpen: true, pubToEdit: pub })}
          />
        );
      case 'blog':
        if (!isAuthenticated) {
          return (
            <RestrictedAccessGate
              targetTab="blog"
              onOpenAuthModal={(role, mode) =>
                setAuthModalConfig({
                  isOpen: true,
                  initialRole: role || 'user',
                  initialMode: mode || 'login',
                  targetTab: 'blog'
                })
              }
              onGoHome={() => setActiveTab('home')}
            />
          );
        }
        return (
          <BlogView
            onOpenAddPostModal={() => setBlogModalState({ isOpen: true, postToEdit: null })}
            onOpenEditPostModal={(post) => setBlogModalState({ isOpen: true, postToEdit: post })}
          />
        );
      case 'gallery':
        if (!isAuthenticated) {
          return (
            <RestrictedAccessGate
              targetTab="gallery"
              onOpenAuthModal={(role, mode) =>
                setAuthModalConfig({
                  isOpen: true,
                  initialRole: role || 'user',
                  initialMode: mode || 'login',
                  targetTab: 'gallery'
                })
              }
              onGoHome={() => setActiveTab('home')}
            />
          );
        }
        return (
          <GalleryView
            onOpenAddGalleryModal={() => setGalleryModalState({ isOpen: true, itemToEdit: null })}
            onOpenEditGalleryModal={(item) => setGalleryModalState({ isOpen: true, itemToEdit: item })}
          />
        );
      case 'settings':
        return (
          <SettingsView
            setActiveTab={handleTabNavigation}
            onOpenEditProfileModal={() => setIsEditProfileOpen(true)}
            onOpenAddPaperModal={() => setPubModalState({ isOpen: true, pubToEdit: null })}
            onOpenAddPostModal={() => setBlogModalState({ isOpen: true, postToEdit: null })}
            onOpenAddGalleryModal={() => setGalleryModalState({ isOpen: true, itemToEdit: null })}
            onOpenResearcherSubmissionModal={(type) =>
              setSubmissionModalState({ isOpen: true, initialType: type || 'publication' })
            }
          />
        );
      case 'analytics':
        if (!isAuthenticated) {
          return (
            <RestrictedAccessGate
              targetTab="analytics"
              onOpenAuthModal={(role, mode) =>
                setAuthModalConfig({
                  isOpen: true,
                  initialRole: role || 'user',
                  initialMode: mode || 'login',
                  targetTab: 'analytics'
                })
              }
              onGoHome={() => setActiveTab('home')}
            />
          );
        }
        return <AnalyticsDashboard />;
      default:
        return (
          <HomeView
            setActiveTab={handleTabNavigation}
            onOpenContactModal={() => setIsContactModalOpen(true)}
            onOpenEditProfileModal={() => setIsEditProfileOpen(true)}
            onOpenAddPaperModal={() => setPubModalState({ isOpen: true, pubToEdit: null })}
            onOpenEditPaperModal={(pub) => setPubModalState({ isOpen: true, pubToEdit: pub })}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] font-sans flex flex-col items-center">
      {/* Container wrapper adjusting for Mobile Frame toggle or Full Responsive View */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[420px] my-4 sm:my-8 rounded-[40px] border-[10px] border-[#1c2b3c] shadow-2xl overflow-hidden bg-[#051424] min-h-[840px] relative'
            : 'max-w-6xl px-3 sm:px-6'
        }`}
      >
        {/* Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={handleTabNavigation}
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          onOpenTaskModal={() => setIsTaskModalOpen(true)}
          onOpenAuthModal={(role, mode) =>
            setAuthModalConfig({
              isOpen: true,
              initialRole: role || 'user',
              initialMode: mode || 'login',
              targetTab: null
            })
          }
          onOpenSubmissionModal={(type) =>
            setSubmissionModalState({ isOpen: true, initialType: type || 'publication' })
          }
        />

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 min-h-[calc(100vh-140px)]">
          {renderCurrentView()}
        </main>

        {/* Global Footer with Admin Login & Portal */}
        <Footer
          setActiveTab={handleTabNavigation}
          onOpenAuthModal={(role, mode) =>
            setAuthModalConfig({
              isOpen: true,
              initialRole: role || 'admin',
              initialMode: mode || 'login',
              targetTab: null
            })
          }
          onOpenSubmissionModal={(type) =>
            setSubmissionModalState({ isOpen: true, initialType: type || 'publication' })
          }
        />

        {/* Navigation Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={handleTabNavigation} />
      </div>

      {/* Global Interactive Modals */}
      <ResearcherSubmissionModal
        isOpen={submissionModalState.isOpen}
        initialType={submissionModalState.initialType}
        onClose={() => setSubmissionModalState({ isOpen: false })}
        onSubmissionSuccess={() => {
          // If in settings or other tabs, notify
        }}
      />

      <AuthModal
        isOpen={authModalConfig.isOpen}
        initialRole={authModalConfig.initialRole}
        initialMode={authModalConfig.initialMode}
        targetTab={authModalConfig.targetTab}
        onSuccess={handleAuthSuccess}
        onClose={() => setAuthModalConfig(prev => ({ ...prev, isOpen: false, targetTab: null }))}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <PaperModal
        publication={selectedPublication}
        onClose={() => setSelectedPublication(null)}
      />

      <TaskReminderModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      {/* Dynamic Data CRUD Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      <PublicationModal
        isOpen={pubModalState.isOpen}
        publicationToEdit={pubModalState.pubToEdit}
        onClose={() => setPubModalState({ isOpen: false, pubToEdit: null })}
      />

      <BlogPostModal
        isOpen={blogModalState.isOpen}
        postToEdit={blogModalState.postToEdit}
        onClose={() => setBlogModalState({ isOpen: false, postToEdit: null })}
      />

      <GalleryItemModal
        isOpen={galleryModalState.isOpen}
        itemToEdit={galleryModalState.itemToEdit}
        onClose={() => setGalleryModalState({ isOpen: false, itemToEdit: null })}
      />
    </div>
  );
}

