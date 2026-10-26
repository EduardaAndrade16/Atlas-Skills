import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Cpu,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import { aiApi, getBackendMode } from '../services/api';
import { GapAnalysisResponse } from '../types';

export const AiRoadmapView: React.FC = () => {
  const [analysis, setAnalysis] = useState<GapAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await aiApi.generateGapAnalysis();
      setAnalysis(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível gerar a análise.');
    } finally {
      setIsLoading(false);
    }
  };

  const backendMode = getBackendMode();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Gemini · análise personalizada
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Seu próximo passo profissional
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Gere uma estimativa de aderência ao seu objetivo, identifique lacunas de competências e receba um plano
            de aprendizagem baseado no seu perfil cadastrado.
          </p>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-400">
            Ao gerar, sua área, objetivo, competências, certificações e tecnologias dos projetos serão enviados ao
            Google Gemini. Nome, e-mail, telefone e links pessoais não são enviados.
          </p>
          <button
            type="button"
            onClick={generateAnalysis}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : analysis ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {isLoading ? 'Analisando perfil...' : analysis ? 'Gerar novamente' : 'Gerar meu roadmap'}
          </button>
        </div>
      </section>

      {backendMode === 'mock' && (
        <div className="flex gap-3 rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-4 text-xs text-indigo-200">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <p>
            A geração por Gemini não está disponível no modo simulado. Use o backend ativo e configure
            <code className="mx-1 rounded bg-black/30 px-1 font-mono text-cyan-300">GEMINI_API_KEY</code>
            no servidor para gerar uma análise real.
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="flex gap-3 rounded-xl border border-rose-800/70 bg-rose-950/30 p-4 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {analysis && (
        <>
          <section className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Target className="h-4 w-4 text-cyan-300" />
                Aderência estimada
              </div>
              <p className="mt-3 text-5xl font-black text-white">{analysis.readinessScore}<span className="text-xl text-slate-400">%</span></p>
              <p className="mt-2 text-xs text-slate-400">Estimativa gerada por IA, não é uma avaliação profissional.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <h3 className="mb-2 flex items-center gap-2 font-bold text-white">
                <Cpu className="h-4 w-4 text-indigo-300" />
                Resumo da análise
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">{analysis.summary}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
              <Target className="h-5 w-5 text-amber-300" />
              Competências para desenvolver
            </h3>
            {analysis.identifiedGaps.length === 0 ? (
              <p className="text-sm text-slate-400">A análise não identificou lacunas específicas com os dados atuais.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {analysis.identifiedGaps.map((gap, index) => (
                  <article key={`${gap.skill}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-white">{gap.skill}</h4>
                      <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-200">
                        {gap.currentLevel} <ArrowRight className="inline h-3 w-3" /> {gap.targetLevel}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{gap.impact}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-white">
              <BookOpen className="h-5 w-5 text-cyan-300" />
              Plano de aprendizagem
            </h3>
            {analysis.recommendedTracks.map((track, index) => (
              <article key={`${track.title}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white">{track.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{track.description}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-indigo-800 bg-indigo-950/70 px-3 py-1.5 text-xs font-semibold text-indigo-200">
                    <Clock3 className="h-3.5 w-3.5" />
                    {track.estimatedHours} horas
                  </span>
                </div>
                <ol className="mt-4 space-y-3">
                  {track.steps.map((step, stepIndex) => (
                    <li key={`${step}-${stepIndex}`} className="flex gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {step}
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </section>

          <p className="text-xs leading-relaxed text-slate-500">
            Esta análise usa somente dados profissionais do perfil e pode conter imprecisões. As recomendações são
            sugestões de estudo; cursos, vagas e links não são pesquisados nem verificados pelo Gemini.
          </p>
        </>
      )}
    </div>
  );
};
