import React from 'react';
import { Menu } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  onOpenMobile: () => void;
  activeTab: ActiveTab;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  profile: {
    title: 'Perfil Profissional',
    subtitle: 'Gestão de competências técnicas e comportamentais, cursos, certificações, projetos e experiências',
  },
  'courses-tracks': {
    title: 'Cursos e Trilhas',
    subtitle: 'Escolha uma trilha para desenvolver suas competências',
  },
  jobs: {
    title: 'Vagas & Oportunidades Profissionais',
    subtitle: 'Oportunidades profissionais e compatibilidade de competências',
  },
  settings: {
    title: 'Configurações da Conta',
    subtitle: 'Segurança e credenciais de acesso',
  },
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobile, activeTab }) => {
  const info = TAB_TITLES[activeTab] || { title: 'Atlas Skills', subtitle: 'Desenvolvimento Profissional' };

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 bg-[#1A1A24]/95 backdrop-blur-md border-b border-[#2A2A3B] px-3.5 sm:px-8 flex items-center justify-between gap-3">
      {/* Left: Mobile trigger & Titles */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 -ml-1 rounded-xl text-[#A7A5B4] hover:text-[#F5F4F8] hover:bg-[#222230] focus:outline-none transition-colors shrink-0 cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Discreet Mobile Logo icon (no wide brand text collision) */}
        <div className="flex items-center lg:hidden shrink-0">
          <img
            src="/assets/aistudio/image_8d2327fe.png"
            alt="AtlasSkills"
            className="h-8 w-auto object-contain shrink-0 drop-shadow-sm"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-[#F5F4F8] tracking-tight truncate leading-tight">
            {info.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#A7A5B4] hidden sm:block truncate mt-0.5">
            {info.subtitle}
          </p>
        </div>
      </div>
    </header>
  );
};
