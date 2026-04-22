import Link from "next/link";
import { releaseTracks } from "./lib/release-hub";
import { serviceDefinitions } from "./lib/service-monitoring";

export default function Home() {
  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid items-center gap-8 xl:grid-cols-[1.15fr,0.85fr]">
          <div>
            <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">
              Phase 9 · UI/UX & livraison
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-zinc-950 lg:text-7xl dark:text-white">
              TWM devient plus lisible pour l equipe comme pour les livraisons.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Plateforme microservices pour SFMC Benin avec front modernise, supervision coherente et centre de versions pour reprendre la bonne branche sans confusion.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/front/auth/register"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Demarrer sur le projet
              </Link>
              <Link
                href="/front/auth/login"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white/80 px-6 py-3 text-base font-semibold text-zinc-800 transition hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-zinc-100 dark:hover:bg-slate-900"
              >
                Se connecter
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-(--surface-strong) p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-(--surface)">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Microservices</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">{serviceDefinitions.length}</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-(--surface-strong) p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-(--surface)">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Branches diffusees</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">{releaseTracks.length}</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-(--surface-strong) p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-(--surface)">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">PR actives</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">{releaseTracks.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-4xl border border-white/60 bg-(--surface) p-6 shadow-xl backdrop-blur dark:border-white/10">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-500">Dernieres versions</p>
            <div className="mt-5 space-y-4">
              {releaseTracks.map((track) => (
                <article key={track.id} className="rounded-3xl border border-zinc-200/80 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/70">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-600 dark:bg-slate-800 dark:text-zinc-300">
                      {track.badge}
                    </span>
                    <a href={track.prUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200">
                      PR #{track.prNumber}
                    </a>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-white">{track.title}</h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{track.summary}</p>
                  <p className="mt-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">{track.branch}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/60 bg-white/60 backdrop-blur dark:border-white/10 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/70 bg-(--surface) p-6 shadow-sm dark:border-white/10">
              <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">Authentification robuste</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                Credentials et Google OAuth, middleware de protection et parcours d acces plus clairs.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-(--surface) p-6 shadow-sm dark:border-white/10">
              <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">Microservices visibles</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                Services, reporting, billing, order et notifications sont exposes de facon plus lisible dans le dashboard.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-(--surface) p-6 shadow-sm dark:border-white/10">
              <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">Centre de livraison</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                Les collaborateurs savent quelle branche recuperer et quelle PR consulter pour repartir sur la bonne version.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="rounded-4xl bg-slate-950 px-6 py-10 text-white lg:px-8">
          <div className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">Collaboration</p>
              <h2 className="mt-3 text-3xl font-semibold">Reprendre proprement la derniere version</h2>
              <p className="mt-4 max-w-2xl text-base text-slate-300">
                La phase 9 met l accent sur la recuperation des bonnes branches, la lecture des PR et la reduction des ambiguities entre Phase 7 partagee et consolidation Phase 8.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
              <Link href="/front/auth/login" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Acceder au dashboard
              </Link>
              <a href={releaseTracks[0]?.prUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Ouvrir la PR phase 7
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
