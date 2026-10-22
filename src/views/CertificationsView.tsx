import React, { useEffect, useState } from 'react';
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Calendar,
  Building,
  KeyRound
} from 'lucide-react';
import { certificationApi } from '../services/api';
import { Certification } from '../types';

export const CertificationsView: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [name, setName] = useState('');
  const [issuingOrganization, setIssuingOrganization] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');

  // Alerts
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCertifications = async () => {
    try {
      const data = await certificationApi.getAll();
      setCertifications(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar certificações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const openCreateModal = () => {
    setEditingCert(null);
    setName('');
    setIssuingOrganization('');
    setIssueDate('');
    setExpirationDate('');
    setCredentialId('');
    setCredentialUrl('');
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (cert: Certification) => {
    setEditingCert(cert);
    setName(cert.name);
    setIssuingOrganization(cert.issuingOrganization);
    setIssueDate(cert.issueDate);
    setExpirationDate(cert.expirationDate || '');
    setCredentialId(cert.credentialId || '');
    setCredentialUrl(cert.credentialUrl || '');
    setIsModalOpen(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !issuingOrganization.trim() || !issueDate) {
      setError('Nome da certificação, órgão emissor e data de emissão são obrigatórios.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      if (editingCert) {
        await certificationApi.update(editingCert.id, {
          name,
          issuingOrganization,
          issueDate,
          expirationDate: expirationDate || undefined,
          credentialId: credentialId || undefined,
          credentialUrl: credentialUrl || undefined,
        });
        setSuccess(`Certificação "${name}" atualizada!`);
      } else {
        await certificationApi.create({
          name,
          issuingOrganization,
          issueDate,
          expirationDate: expirationDate || undefined,
          credentialId: credentialId || undefined,
          credentialUrl: credentialUrl || undefined,
        });
        setSuccess(`Certificação "${name}" cadastrada!`);
      }
      setIsModalOpen(false);
      await fetchCertifications();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar certificação.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cert: Certification) => {
    if (!confirm(`Deseja remover a certificação "${cert.name}"?`)) return;
    try {
      await certificationApi.delete(cert.id);
      setSuccess(`Certificação "${cert.name}" removida.`);
      await fetchCertifications();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover certificação.');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Top action header */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#F5F4F8] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#BC9EFD]" />
            Certificações Oficiais ({certifications.length})
          </h2>
          <p className="text-xs text-[#A7A5B4] mt-1">
            Certificações validadas emitidas por provedores de nuvem, tecnologia e entidades técnicas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-bold text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Certificação</span>
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-6 h-6 border-2 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#A7A5B4]">Carregando certificações...</p>
        </div>
      ) : certifications.length === 0 ? (
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#1A1A24] border border-[#2D2D40] flex items-center justify-center mx-auto text-[#A7A5B4]">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#F5F4F8]">Nenhuma certificação cadastrada</h3>
          <p className="text-xs text-[#A7A5B4] max-w-md mx-auto">
            Certificações como AWS, Oracle, Google Cloud ou Microsoft aumentam a pontuação do perfil.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeira Certificação
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="rounded-2xl bg-[#222230] border border-[#2D2D40] p-5 hover:border-[#383850] transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#BC9EFD]">
                  <Building className="w-3.5 h-3.5 text-[#A7A5B4]" />
                  <span>{cert.issuingOrganization}</span>
                </div>

                <h3 className="text-base font-bold text-[#F5F4F8]">
                  {cert.name}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A7A5B4] pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#A7A5B4]" />
                    Emitido: {new Date(cert.issueDate).toLocaleDateString('pt-BR')}
                  </span>
                  {cert.expirationDate && (
                    <span className="flex items-center gap-1">
                      Expira: {new Date(cert.expirationDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>

                {cert.credentialId && (
                  <p className="text-xs text-[#A7A5B4] flex items-center gap-1.5 font-mono bg-[#1A1A24] px-2.5 py-1.5 rounded-lg border border-[#2D2D40]">
                    <KeyRound className="w-3.5 h-3.5 text-[#BC9EFD]" />
                    <span>ID: {cert.credentialId}</span>
                  </p>
                )}

                {cert.credentialUrl && (
                  <div className="pt-1">
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#BC9EFD] hover:underline font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Verificar Autenticidade da Credencial
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-1 pt-4 mt-3 border-t border-[#2D2D40]">
                <button
                  onClick={() => openEditModal(cert)}
                  className="p-1.5 rounded-lg text-[#A7A5B4] hover:text-[#BC9EFD] hover:bg-[#1A1A24] transition-colors cursor-pointer"
                  title="Editar certificação"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cert)}
                  className="p-1.5 rounded-lg text-[#A7A5B4] hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                  title="Excluir certificação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-[#2D2D40] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#F5F4F8] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#BC9EFD]" />
                {editingCert ? 'Editar Certificação' : 'Cadastrar Certificação'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#A7A5B4] hover:text-[#F5F4F8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Título da Certificação <span className="text-[#BC9EFD]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: AWS Certified Solutions Architect – Associate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Instituição Emissora <span className="text-[#BC9EFD]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amazon Web Services, Oracle, Microsoft, Scrum.org"
                  value={issuingOrganization}
                  onChange={(e) => setIssuingOrganization(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Data de Emissão <span className="text-[#BC9EFD]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Data de Expiração (se houver)
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Código / ID da Credencial
                </label>
                <input
                  type="text"
                  placeholder="Ex: AWS-SAA-839219"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  URL de Validação Pública
                </label>
                <input
                  type="url"
                  placeholder="https://credly.com/your-badge"
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2D2D40]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#A7A5B4] hover:text-[#F5F4F8] text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-bold text-sm shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Salvando...' : 'Salvar Certificação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
