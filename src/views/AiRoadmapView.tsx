import React from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  ArrowRight,
  Target,
  BookOpen,
  Briefcase,
  GitBranch,
  CheckCircle,
  Database,
  Code
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AiRoadmapView: React.FC = () => {
  const { profile } = useAuth();

  const pipelineSteps = [
    {
      step: '01',
      title: 'Mapeamento de Entrada',
      desc: 'Ingestão dos dados de Perfil (Área, Objetivo), Hard Skills (níveis e anos), Soft Skills, Certificações e Projetos.',
      status: 'Pronto na v1.0',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    },
    {
      step: '02',
      title: 'Geração de Embeddings & Taxonomia',
      desc: 'Conversão das competências em vetores semânticos baseados na taxonomia global de tecnologia (O*NET / ESCO / TechRadar).',
      status: 'Pronto para Integração',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    },
    {
      step: '03',
      title: 'Motor de Gap Analysis',
      desc: 'Comparação da distância euclidiana/cosseno entre o estado atual do candidato e os requisitos do objetivo profissional almejado.',
      status: 'Contrato Arquitetado',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    },
    {
      step: '04',
      title: 'Recomendação de Cursos & Vagas',
      desc: 'Ranqueamento preditivo das capacitações com maior retorno sobre o tempo de estudo e vagas com score de fit acima de 80%.',
      status: 'Próxima Release (v2.0)',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Arquitetura de Expansão
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Preparação para o Motor de IA, Cursos & Vagas
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Conforme especificado nos requisitos, esta versão entrega a base sólida de persistência, autenticação e gerenciamento de perfil, com arquitetura 100% pronta para plugar o motor de Inteligência Artificial.
          </p>
        </div>
      </div>

      {/* Pipeline Visualizer */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          Pipeline de Processamento & Análise de Lacunas (Gap Analysis)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {pipelineSteps.map((s) => (
            <div
              key={s.step}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-black text-indigo-400">{s.step}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badgeColor}`}>
                    {s.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Data Model Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Profile Payload */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Contrato de Entrada (Perfil Atual)
            </h4>
            <span className="text-[11px] font-mono text-slate-400">JSON Payload</span>
          </div>
          <p className="text-xs text-slate-400">
            Estrutura gerada pelas entidades atuais do Spring Boot que alimenta o serviço de recomendação:
          </p>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-cyan-300 font-mono overflow-x-auto">
{`{
  "userId": 1,
  "careerGoal": "${profile?.careerGoal || 'Tech Lead'}",
  "primaryArea": "${profile?.primaryArea || 'Backend'}",
  "hardSkills": [
    { "name": "Java", "level": "AVANCADO", "years": 4 },
    { "name": "Spring Boot", "level": "AVANCADO", "years": 4 },
    { "name": "Docker", "level": "INTERMEDIARIO", "years": 2 }
  ],
  "softSkills": ["Comunicação Assertiva", "Liderança"],
  "certifications": ["AWS Solutions Architect"]
}`}
          </pre>
        </div>

        {/* Future Output Payload */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Contrato de Saída Planejado (IA)
            </h4>
            <span className="text-[11px] font-mono text-slate-400">/api/v1/ai/gap-analysis</span>
          </div>
          <p className="text-xs text-slate-400">
            Resposta padronizada que a API fornecerá ao acionar o módulo de inteligência artificial:
          </p>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-purple-300 font-mono overflow-x-auto">
{`{
  "readinessScore": 84,
  "identifiedGaps": [
    { "skill": "Kubernetes", "requiredLevel": "AVANCADO", "current": "AUSENTE" },
    { "skill": "Micro-Frontends", "requiredLevel": "INTERMEDIARIO", "current": "BASICO" }
  ],
  "recommendedTracks": [
    { "id": 101, "title": "Arquitetura Cloud Nativa com K8s", "estimatedHours": 30 },
    { "id": 102, "title": "Liderança Técnica e Gestão de Pessoas", "estimatedHours": 20 }
  ],
  "matchedJobsCount": 14
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};
