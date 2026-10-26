import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActiveTab, Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthView } from './views/AuthView';
import { ProfileHubView } from './views/ProfileHubView';
import { CoursesAndTracksView } from './views/CoursesAndTracksView';
import { JobsView } from './views/JobsView';
import { AccountSettingsView } from './views/AccountSettingsView';
import { AiRoadmapView } from './views/AiRoadmapView';
import { profileApi } from './services/api';
import { DashboardSummary } from './types';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const fetchSummary = async () => {
    try {
      const data = await profileApi.getSummary();
      setSummary(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSummary();
      const handler = () => fetchSummary();
      window.addEventListener('atlas_data_changed', handler);
      return () => window.removeEventListener('atlas_data_changed', handler);
    }
  }, [isAuthenticated]);

  const completedStepsCount = summary?.completedStepsCount ?? 8;
  const isCoursesUnlocked = completedStepsCount >= 8;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A24] flex flex-col items-center justify-center text-[#F5F4F8] p-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 mb-5">
          <img
            src="/assets/aistudio/image_8d2327fe.png"
            alt="AtlasSkills"
            className="h-20 w-auto object-contain animate-pulse drop-shadow-lg"
          />
          <span className="text-3xl tracking-tight leading-none select-none">
            <strong className="font-extrabold text-[#F5F4F8]">Atlas</strong>
            <span className="text-[#BC9EFD] font-semibold">Skills</span>
          </span>
        </div>
        <div className="w-6 h-6 border-2 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-[#A7A5B4] font-medium tracking-wide">Iniciando plataforma...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-[#1A1A24] text-[#F5F4F8] flex">
      {/* Sidebar Navigation: Perfil Profissional, Cursos e Trilhas, Vagas */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          activeTab={activeTab}
          onOpenMobile={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'profile' && (
            <ProfileHubView onNavigateToCourses={() => setActiveTab('courses-tracks')} />
          )}
          {activeTab === 'courses-tracks' && <CoursesAndTracksView />}
          {activeTab === 'ai-roadmap' && <AiRoadmapView />}
          {activeTab === 'jobs' && (
            <JobsView onNavigateToCourses={() => setActiveTab('courses-tracks')} />
          )}
          {activeTab === 'settings' && <AccountSettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
