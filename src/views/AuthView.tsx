import React, { useState } from 'react';
import { LogIn, UserPlus, Shield, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthView: React.FC = () => {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes('@')) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (!isLoginTab) {
      if (!name.trim()) {
        setError('Por favor, informe o seu nome completo.');
        return;
      }
      if (password !== confirmPassword) {
        setError('A confirmação de senha não confere com a senha digitada.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await register(name, email, password);
        setSuccess('Conta criada com sucesso! Redirecionando...');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar sua requisição.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('eduarda.andrade@atlasskills.com');
    setPassword('password123');
    setIsLoginTab(true);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#1A1A24] flex flex-col justify-center items-center px-4 py-12 relative">
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex flex-col items-center gap-2.5 mb-3">
            <img
              src="/assets/aistudio/image_8d2327fe.png"
              alt="AtlasSkills"
              className="h-20 w-auto object-contain shrink-0 drop-shadow-md"
            />
            <span className="text-3xl sm:text-4xl tracking-tight leading-none select-none">
              <strong className="font-extrabold text-[#F5F4F8]">Atlas</strong>
              <span className="text-[#BC9EFD] font-semibold">Skills</span>
            </span>
          </div>
          <p className="text-sm text-[#A7A5B4] font-medium">
            Plataforma de Desenvolvimento Profissional
          </p>
        </div>

        {/* Minimalist Card */}
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex rounded-xl bg-[#1A1A24] p-1 mb-6 border border-[#2A2A3B]">
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(true);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                isLoginTab
                  ? 'bg-[#8B6BD9] text-[#F5F4F8]'
                  : 'text-[#A7A5B4] hover:text-[#F5F4F8]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Acessar Conta</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(false);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                !isLoginTab
                  ? 'bg-[#8B6BD9] text-[#F5F4F8]'
                  : 'text-[#A7A5B4] hover:text-[#F5F4F8]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Conta</span>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginTab && (
              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5">
                  Nome Completo <span className="text-[#BC9EFD]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 focus:outline-none focus:border-[#BC9EFD] text-sm transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5">
                E-mail Profissional <span className="text-[#BC9EFD]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 focus:outline-none focus:border-[#BC9EFD] text-sm transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider">
                  Senha de Acesso <span className="text-[#BC9EFD]">*</span>
                </label>
                <span className="text-[11px] text-[#A7A5B4]/70">Mínimo 6 caracteres</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 focus:outline-none focus:border-[#BC9EFD] text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7A5B4] hover:text-[#F5F4F8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLoginTab && (
              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5">
                  Confirmar Senha <span className="text-[#BC9EFD]">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 focus:outline-none focus:border-[#BC9EFD] text-sm transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-[#1A1A24] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLoginTab ? 'Entrar na Plataforma' : 'Finalizar Cadastro'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Helper */}
          <div className="mt-6 pt-5 border-t border-[#2D2D40] text-center">
            <p className="text-xs text-[#A7A5B4] mb-2.5">Quer explorar o perfil de demonstração?</p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A1A24] hover:bg-[#28283A] text-[#BC9EFD] text-xs font-semibold transition-colors border border-[#2D2D40]"
            >
              Preencher com Perfil Demo (Eduarda Andrade)
            </button>
          </div>
        </div>

        {/* Security Footer note */}
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-[#A7A5B4]/80">
          <Shield className="w-3.5 h-3.5 text-[#BC9EFD]" />
          <span>Autenticação protegida por JWT & Senhas criptografadas com BCrypt</span>
        </div>
      </div>
    </div>
  );
};
