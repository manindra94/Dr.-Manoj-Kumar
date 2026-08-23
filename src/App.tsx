import React, { useState } from 'react';
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

import { ContactModal } from './components/modals/ContactModal';
import { PaperModal } from './components/modals/PaperModal';
import { TaskReminderModal } from './components/modals/TaskReminderModal';
import { AuthModal } from './components/modals/AuthModal';

import { EditProfileModal } from './components/modals/EditProfileModal';
import { PublicationModal } from './components/modals/PublicationModal';
import { BlogPostModal } from './components/modals/BlogPostModal';
import { GalleryItemModal } from './components/modals/GalleryItemModal';
import { ResearcherSubmissionModal } from './components/modals/ResearcherSubmissionModal';

import { ActiveTab, Publication, BlogPost, GalleryItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    isOpen: boolean;
    initialRole?: 'admin' | 'user';
    initialMode?: 'login' | 'signup';
  }>({ isOpen: false, initialRole: 'user', initialMode: 'login' });
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);

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
            setActiveTab={setActiveTab}
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
        return (
          <PapersView
            onSelectPaper={(pub) => setSelectedPublication(pub)}
            onOpenAddPaperModal={() => setPubModalState({ isOpen: true, pubToEdit: null })}
            onOpenEditPaperModal={(pub) => setPubModalState({ isOpen: true, pubToEdit: pub })}
          />
        );
      case 'blog':
        return (
          <BlogView
            onOpenAddPostModal={() => setBlogModalState({ isOpen: true, postToEdit: null })}
            onOpenEditPostModal={(post) => setBlogModalState({ isOpen: true, postToEdit: post })}
          />
        );
      case 'gallery':
        return (
          <GalleryView
            onOpenAddGalleryModal={() => setGalleryModalState({ isOpen: true, itemToEdit: null })}
            onOpenEditGalleryModal={(item) => setGalleryModalState({ isOpen: true, itemToEdit: item })}
          />
        );
      case 'settings':
        return (
          <SettingsView
            setActiveTab={setActiveTab}
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
        return <AnalyticsDashboard />;
      default:
        return (
          <HomeView
            setActiveTab={setActiveTab}
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
          setActiveTab={setActiveTab}
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          onOpenTaskModal={() => setIsTaskModalOpen(true)}
          onOpenAuthModal={(role, mode) =>
            setAuthModalConfig({
              isOpen: true,
              initialRole: role || 'user',
              initialMode: mode || 'login'
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
          setActiveTab={setActiveTab}
          onOpenAuthModal={(role, mode) =>
            setAuthModalConfig({
              isOpen: true,
              initialRole: role || 'admin',
              initialMode: mode || 'login'
            })
          }
          onOpenSubmissionModal={(type) =>
            setSubmissionModalState({ isOpen: true, initialType: type || 'publication' })
          }
        />

        {/* Navigation Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
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
        onClose={() => setAuthModalConfig(prev => ({ ...prev, isOpen: false }))}
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

