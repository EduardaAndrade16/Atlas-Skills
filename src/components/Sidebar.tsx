import React from 'react';
import {
  UserCheck,
  BookOpen,
  Sparkles,
  Briefcase,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab =
  | 'profile'
  | 'courses-tracks'
  | 'ai-roadmap'
  | 'jobs'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onCloseMobile,
}) => {
  const { user, profile, logout } = useAuth();

  const navItems = [
    {
      id: 'profile' as ActiveTab,
      label: 'Perfil Profissional',
      icon: UserCheck,
    },
    {
      id: 'courses-tracks' as ActiveTab,
      label: 'Cursos e Trilhas',
      icon: BookOpen,
    },
    {
      id: 'ai-roadmap' as ActiveTab,
      label: 'Roadmap com IA',
      icon: Sparkles,
    },
    {
      id: 'jobs' as ActiveTab,
      label: 'Vagas',
      icon: Briefcase,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#1E1E2A] border-r border-[#2A2A3B] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header - Balanced Logo Size */}
        <div className="h-20 px-6 border-b border-[#2A2A3B] flex items-center gap-3">
          <img
            src="/assets/aistudio/image_8d2327fe.png"
            alt="AtlasSkills Logo"
            className="h-14 w-auto object-contain shrink-0 drop-shadow-md"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xl tracking-tight leading-none select-none">
              <strong className="font-extrabold text-[#F5F4F8]">Atlas</strong>
              <span className="text-[#BC9EFD] font-semibold">Skills</span>
            </span>
            <span className="text-[11px] text-[#A7A5B4] mt-1 tracking-wide font-medium">
              Trilhas & Carreira
            </span>
          </div>
        </div>

        {/* User Card Mini */}
        {user && (
          <div className="p-3.5 mx-4 my-4 rounded-xl bg-[#242434] border border-[#2F2F42] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8B6BD9]/25 border border-[#BC9EFD]/40 flex items-center justify-center text-[#BC9EFD] font-bold text-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#F5F4F8] truncate">{user.name}</p>
              <p className="text-xs text-[#BC9EFD] truncate font-medium">
                {profile?.headline || 'Perfil Profissional'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <div className="px-4 pt-2 pb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A7A5B4]">
            Menu Principal
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#8B6BD9] text-[#F5F4F8] shadow-sm'
                    : 'text-[#A7A5B4] hover:text-[#F5F4F8] hover:bg-[#252536]'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/20 text-[#F5F4F8]'
                      : 'text-[#A7A5B4] group-hover:text-[#BC9EFD]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="flex-1 text-left font-semibold text-sm leading-tight truncate">
                  {item.label}
                </span>
                {isActive && <ChevronRight className="w-4 h-4 text-white/90 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions without backend telemetry */}
        <div className="p-3 border-t border-[#2A2A3B] space-y-1">
          <button
            onClick={() => {
              setActiveTab('settings');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-[#272738] text-[#F5F4F8] border border-[#37374D]'
                : 'text-[#A7A5B4] hover:text-[#F5F4F8] hover:bg-[#252536]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#A7A5B4]" />
            <span>Configurações da Conta</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#A7A5B4] hover:text-rose-300 hover:bg-rose-950/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
};
