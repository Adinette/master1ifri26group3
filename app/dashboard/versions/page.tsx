'use client'

import { useState } from 'react'
import { collaborationChecklist, phase9Highlights, releaseTracks } from '@/app/lib/release-hub'
import { serviceDefinitions } from '@/app/lib/service-monitoring'

export default function VersionsPage() {
  const [copiedTrack, setCopiedTrack] = useState<string | null>(null)

  const copyCommands = async (trackId: string, commands: string[]) => {
    await navigator.clipboard.writeText(commands.join('\n'))
    setCopiedTrack(trackId)
    window.setTimeout(() => setCopiedTrack(null), 1800)
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <section className="relative overflow-hidden rounded-4xl bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-950/10 lg:px-8 lg:py-10">
        <div className="absolute inset-0">
          <div className="absolute -left-8 top-0 h-44 w-44 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />
        </div>
        <div className="relative grid gap-8 xl:grid-cols-[1.2fr,0.9fr]">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-sky-100/80">
              Phase 9 · Livraison collaborative
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight lg:text-5xl">Centre de versions</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300 lg:text-lg">
              Cette page donne aux collaborateurs un point unique pour recuperer la bonne branche, ouvrir la bonne PR et repartir sur la derniere version sans ambiguite.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Branches</p>
              <p className="mt-2 text-3xl font-semibold">{releaseTracks.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">PR ouvertes</p>
              <p className="mt-2 text-3xl font-semibold">{releaseTracks.filter((track) => track.prUrl).length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Services couverts</p>
              <p className="mt-2 text-3xl font-semibold">{serviceDefinitions.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.95fr]">
        <div className="space-y-6">
          {releaseTracks.map((track) => (
            <article key={track.id} className="rounded-[28px] border border-white/70 bg-(--surface) p-6 shadow-sm backdrop-blur dark:border-white/10">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-600 dark:bg-slate-800 dark:text-zinc-300">
                      {track.badge}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                      {track.status}
                    </span>
                    {track.recommended && (
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                        Recommandee pour la reprise partagee
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-zinc-950 dark:text-white">{track.title}</h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{track.summary}</p>
                </div>

                <a
                  href={track.prUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-slate-900 dark:text-zinc-100 dark:hover:bg-slate-800"
                >
                  Voir la PR #{track.prNumber}
                </a>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl border border-zinc-200/80 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-slate-900/70">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Branche</p>
                  <p className="mt-2 font-mono text-sm text-zinc-800 dark:text-zinc-100">{track.branch}</p>
                </div>
                <div className="rounded-3xl border border-zinc-200/80 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-slate-900/70">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Base</p>
                  <p className="mt-2 font-mono text-sm text-zinc-800 dark:text-zinc-100">{track.baseBranch}</p>
                </div>
                <div className="rounded-3xl border border-zinc-200/80 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-slate-900/70">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Derniere mise a jour</p>
                  <p className="mt-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">{track.updatedAt}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Pour qui ?</p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{track.audience}</p>

                  <p className="mt-5 text-xs uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Ce que la version apporte</p>
                  <div className="mt-3 space-y-3">
                    {track.highlights.map((highlight, index) => (
                      <div key={highlight} className="flex gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-slate-900/70">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                          {index + 1}
                        </span>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Commandes de recuperation</p>
                    <button
                      onClick={() => copyCommands(track.id, track.commands)}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-slate-900 dark:text-zinc-200 dark:hover:bg-slate-800"
                    >
                      {copiedTrack === track.id ? 'Copiee' : 'Copier'}
                    </button>
                  </div>
                  <pre className="mt-3 overflow-x-auto rounded-3xl bg-slate-950 px-4 py-5 text-sm text-slate-100">
                    <code>{track.commands.join('\n')}</code>
                  </pre>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/70 bg-(--surface) p-6 shadow-sm backdrop-blur dark:border-white/10">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-500">Mode operatoire</p>
            <h2 className="mt-2 text-xl font-semibold">Reprise rapide pour un collaborateur</h2>
            <div className="mt-5 space-y-3">
              {collaborationChecklist.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-slate-900/70">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                    {index + 1}
                  </span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-(--surface) p-6 shadow-sm backdrop-blur dark:border-white/10">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-500">Ameliorations phase 9</p>
            <div className="mt-5 space-y-3">
              {phase9Highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-slate-900/70 dark:text-zinc-300">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}