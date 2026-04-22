'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"
import { collaborationChecklist, releaseTracks } from "@/app/lib/release-hub"
import { serviceDefinitions } from "@/app/lib/service-monitoring"

export default function DashboardPage() {
  const { data: session } = useSession()
  const recommendedTrack = releaseTracks.find((track) => track.recommended) ?? releaseTracks[0]

  const statCards = [
    {
      label: 'Microservices suivis',
      value: String(serviceDefinitions.length),
      detail: 'du coeur auth au reporting global',
    },
    {
      label: 'Versions partagees',
      value: String(releaseTracks.length),
      detail: 'branches pretes pour synchronisation',
    },
    {
      label: 'PR ouvertes',
      value: String(releaseTracks.filter((track) => track.prUrl).length),
      detail: 'revue phase 7 et consolidation phase 8',
    },
    {
      label: 'Objectif phase 9',
      value: 'UX',
      detail: 'rendre la reprise collaborative plus lisible',
    },
  ]

  const quickLinks = [
    {
      href: '/dashboard/versions',
      title: 'Centre de livraison',
      description: 'Recupere les branches partagees, les PR ouvertes et les commandes Git associees.',
      tone: 'from-amber-500 to-orange-500',
    },
    {
      href: '/dashboard/services',
      title: 'Supervision services',
      description: 'Controle Kong, RabbitMQ et les endpoints reels des 9 microservices.',
      tone: 'from-emerald-500 to-teal-600',
    },
    {
      href: '/dashboard/reporting',
      title: 'Reporting resilient',
      description: 'Analyse les donnees disponibles meme si une dependance aval ne repond pas.',
      tone: 'from-sky-500 to-indigo-600',
    },
    {
      href: '/dashboard/orders',
      title: 'Flux metier',
      description: 'Rejoue la chaine commandes, facturation, notifications et supervision.',
      tone: 'from-fuchsia-500 to-rose-500',
    },
  ]

  return (
    <div className="p-6 lg:p-10">
      <section className="relative overflow-hidden rounded-4xl bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-950/10 lg:px-8 lg:py-10">
        <div className="absolute inset-0">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        </div>
        <div className="relative grid gap-8 xl:grid-cols-[1.25fr,0.95fr]">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-sky-100/80">
              Phase 9 · Collaboration
            </p>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight lg:text-5xl">
              Bienvenue, {session?.user?.name || 'equipe'}.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300 lg:text-lg">
              Le dashboard devient un point d entree de livraison: il oriente vers les modules utiles, les PR actives et la bonne branche a recuperer selon le contexte collaboratif.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/versions" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Ouvrir le centre de livraison
              </Link>
              <Link href="/dashboard/reporting" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Voir le reporting resilient
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Version recommandee</p>
            <h2 className="mt-3 text-2xl font-semibold">{recommendedTrack.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{recommendedTrack.summary}</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Branche</p>
                <p className="mt-1 font-medium">{recommendedTrack.branch}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Cible</p>
                <p className="mt-1 font-medium">{recommendedTrack.baseBranch}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Public</p>
                <p className="mt-1">{recommendedTrack.audience}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-[26px] border border-white/70 bg-(--surface-strong) p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-(--surface)">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">{card.value}</p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr,0.95fr]">
        <section className="rounded-[28px] border border-white/70 bg-(--surface) p-6 shadow-sm backdrop-blur dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-500">Livraisons</p>
              <h2 className="mt-2 text-2xl font-semibold">Versions a diffuser a l equipe</h2>
            </div>
            <Link href="/dashboard/versions" className="text-sm font-medium text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200">
              Voir le detail
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {releaseTracks.map((track) => (
              <article key={track.id} className="rounded-3xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-600 dark:bg-slate-800 dark:text-zinc-300">
                    {track.badge}
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {track.status}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">{track.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{track.summary}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Branche</p>
                <p className="mt-1 font-mono text-sm text-zinc-800 dark:text-zinc-200">{track.branch}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Usage</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{track.audience}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/70 bg-(--surface) p-6 shadow-sm backdrop-blur dark:border-white/10">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-500">Acces rapide</p>
            <div className="mt-5 grid gap-3">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="group flex items-start gap-4 rounded-3xl border border-zinc-200/80 bg-white/80 px-4 py-4 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:hover:border-white/15">
                  <span className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${link.tone} text-sm font-semibold text-white`}>
                    +
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-zinc-950 dark:text-white">{link.title}</span>
                    <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">{link.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-(--surface) p-6 shadow-sm backdrop-blur dark:border-white/10">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-500">Cadence equipe</p>
            <h2 className="mt-2 text-xl font-semibold">Checklist de reprise</h2>
            <div className="mt-5 space-y-3">
              {collaborationChecklist.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-slate-900/70">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                    {index + 1}
                  </span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}