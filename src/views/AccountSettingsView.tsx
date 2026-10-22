import React, { useState } from 'react';
import {
  Settings,
  Shield,
  KeyRound,
  Database,
  Download,
  RotateCcw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Server,
  Eye,
  EyeOff,
  User,
  Calendar,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, systemApi } from '../services/api';

export const AccountSettingsView: React.FC = () => {
  const {
    user,
    profile,
    logout,
    changePassword,
    backendMode,
    setBackendMode,
    backendStatus,
    checkBackendStatus,
  } = useAuth();

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Backend test status
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess(null);
    setPwdError(null);

    if (newPassword.length < 6) {
      setPwdError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('A confirmação de senha não confere com a nova senha.');
      return;
    }

    setPwdLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwdSuccess('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(null), 4000);
    } catch (err: any) {
      setPwdError(err.message || 'Erro ao alterar a senha.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handlePing = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const res = await systemApi.pingBackend();
      setPingResult(
        res.online
          ? `Sucesso: Backend Java Spring Boot online em ${res.url}`
          : `Aviso: ${res.message}. Quando você rodar o Spring Boot localmente (mvn spring-boot:run na pasta backend), a integração conectará instantaneamente!`
      );
      await checkBackendStatus();
    } finally {
      setPinging(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user,
      profile,
      exportedAt: new Date().toISOString(),
      platform: 'Atlas Skills Professional Platform',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas_skills_perfil_${user?.id || 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Title */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F4F8] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#BC9EFD]" />
            Configurações da Conta
          </h2>
          <p className="text-xs text-[#A7A5B4] mt-1">
            Gerencie sua segurança, parâmetros de integração com a API Spring Boot e privacidade dos dados.
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-semibold text-xs border border-rose-900/50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Encerrar Sessão</span>
        </button>
      </div>

      {/* Card 1: Dados do Usuário */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#F5F4F8] font-bold text-base border-b border-[#2D2D40] pb-3">
          <User className="w-5 h-5 text-[#BC9EFD]" />
          <span>Informações da Conta Autenticada</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#2D2D40]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A7A5B4] block">
              Nome Cadastrado
            </span>
            <span className="text-sm font-semibold text-[#F5F4F8] mt-0.5 block truncate">
              {user?.name}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#2D2D40]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A7A5B4] block">
              E-mail de Acesso
            </span>
            <span className="text-sm font-semibold text-[#F5F4F8] mt-0.5 block truncate font-mono">
              {user?.email}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#2D2D40]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A7A5B4] block">
              ID do Usuário
            </span>
            <span className="text-sm font-semibold text-[#BC9EFD] mt-0.5 block font-mono">
              #{user?.id}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Alteração de Senha */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#F5F4F8] font-bold text-base border-b border-[#2D2D40] pb-3">
          <KeyRound className="w-5 h-5 text-[#BC9EFD]" />
          <span>Segurança & Alteração de Senha</span>
        </div>

        {pwdSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        {pwdError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
              Senha Atual <span className="text-rose-400">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
              Nova Senha (Mínimo 6 caracteres) <span className="text-rose-400">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
              Confirmar Nova Senha <span className="text-rose-400">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-[#A7A5B4] hover:text-[#F5F4F8] flex items-center gap-1.5 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Ocultar caracteres' : 'Exibir caracteres'}</span>
            </button>

            <button
              type="submit"
              disabled={pwdLoading}
              className="px-4 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              {pwdLoading ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 3: Backend & Conectividade Spring Boot */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#F5F4F8] font-bold text-base border-b border-[#2D2D40] pb-3">
          <Server className="w-5 h-5 text-[#BC9EFD]" />
          <span>Integração de Back-end & API REST</span>
        </div>

        <p className="text-xs text-[#A7A5B4] leading-relaxed">
          O Atlas Skills possui arquitetura desacoplada. Ele suporta tanto conexão direta à API Java 17 Spring Boot rodando localmente na porta <code className="text-[#BC9EFD] font-mono">8080</code> com H2/MySQL, quanto o <strong>Motor Integrado Atlas</strong> para uso imediato no navegador.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setBackendMode('mock')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              backendMode === 'mock'
                ? 'border-[#BC9EFD] bg-[#BC9EFD]/20 text-[#F5F4F8]'
                : 'border-[#2D2D40] bg-[#1A1A24] text-[#A7A5B4] hover:border-[#8B6BD9]'
            }`}
          >
            <div className="text-xs font-bold text-[#F5F4F8] mb-1">Motor Integrado Atlas</div>
            <p className="text-[11px] text-[#A7A5B4]">
              Executa no navegador com persistência local e dados completos.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setBackendMode('spring')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              backendMode === 'spring'
                ? 'border-[#BC9EFD] bg-[#BC9EFD]/20 text-[#F5F4F8]'
                : 'border-[#2D2D40] bg-[#1A1A24] text-[#A7A5B4] hover:border-[#8B6BD9]'
            }`}
          >
            <div className="text-xs font-bold text-[#F5F4F8] mb-1">Spring Boot Estrito (8080)</div>
            <p className="text-[11px] text-[#A7A5B4]">
              Envia 100% das chamadas HTTP REST para <code className="text-[#BC9EFD]">localhost:8080</code>.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setBackendMode('auto')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              backendMode === 'auto'
                ? 'border-[#BC9EFD] bg-[#BC9EFD]/20 text-[#F5F4F8]'
                : 'border-[#2D2D40] bg-[#1A1A24] text-[#A7A5B4] hover:border-[#8B6BD9]'
            }`}
          >
            <div className="text-xs font-bold text-[#F5F4F8] mb-1">Híbrido Inteligente</div>
            <p className="text-[11px] text-[#A7A5B4]">
              Tenta o Spring Boot primeiro; se indisponível, usa o motor local.
            </p>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#2D2D40] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[#A7A5B4]">URL Base da API: </span>
            <code className="text-[#BC9EFD] font-mono font-semibold">{getApiBaseUrl()}</code>
          </div>
          <button
            onClick={handlePing}
            disabled={pinging}
            className="px-3.5 py-1.5 rounded-lg bg-[#222230] hover:bg-[#1A1A24] text-[#F5F4F8] font-semibold transition-colors border border-[#2D2D40] hover:border-[#8B6BD9] shrink-0 cursor-pointer"
          >
            {pinging ? 'Testando Conexão...' : 'Testar Conexão com Spring Boot'}
          </button>
        </div>

        {pingResult && (
          <div className="p-3 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-xs text-[#A7A5B4]">
            {pingResult}
          </div>
        )}
      </div>

      {/* Card 4: Backup & Restauração */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#F5F4F8] font-bold text-base border-b border-[#2D2D40] pb-3">
          <Database className="w-5 h-5 text-[#BC9EFD]" />
          <span>Portabilidade & Gerenciamento de Dados</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1A1A24] hover:border-[#8B6BD9] text-[#F5F4F8] text-xs font-semibold border border-[#2D2D40] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#BC9EFD]" />
            <span>Exportar Perfil em JSON</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja resetar o banco local para os dados padrão de demonstração?')) {
                systemApi.resetDemoData();
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1A1A24] hover:border-amber-500/60 text-[#F5F4F8] text-xs font-semibold border border-[#2D2D40] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restaurar Dados Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
