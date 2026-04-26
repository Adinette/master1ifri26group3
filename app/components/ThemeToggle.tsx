'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme, type Theme } from '../lib/theme'

// Note : pendant SSR / 1ère hydratation, useTheme renvoie 'system'/'light'.
// Après le 1er useEffect de ThemeProvider, l'état réel s'applique.
// On évite donc tout drapeau `mounted` ici.

type ThemeToggleProps = {
  /** Style: 'icon' (icone seule) ou 'compact' (icone + label) */
  variant?: 'icon' | 'compact'
  /** Couleur de fond / bordure du bouton */
  tone?: 'public' | 'dashboard'
}

const OPTIONS: Array<{ value: Theme; label: string; icon: string }> = [
  { value: 'light', label: 'Clair', icon: '☀️' },
  { value: 'dark', label: 'Sombre', icon: '🌙' },
  { value: 'system', label: 'Système', icon: '🖥️' },
]

export default function ThemeToggle({ variant = 'icon', tone = 'dashboard' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fermer au clic extérieur ou Escape
  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const currentIcon =
    theme === 'system' ? '🖥️' : resolvedTheme === 'dark' ? '🌙' : '☀️'
  const currentLabel = OPTIONS.find((o) => o.value === theme)?.label ?? 'Système'

  const triggerBase =
    tone === 'public'
      ? 'border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
      : 'border-blue-100 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-zinc-700 text-blue-700 dark:text-zinc-200'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Changer de thème"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${triggerBase}`}
      >
        <span className="text-base leading-none" aria-hidden>{currentIcon}</span>
        {variant === 'compact' && <span className="hidden sm:inline">{currentLabel}</span>}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-40 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg p-1 z-50"
        >
          {OPTIONS.map((opt) => {
            const active = theme === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(opt.value)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span aria-hidden>{opt.icon}</span>
                <span className="flex-1">{opt.label}</span>
                {active && <span aria-hidden className="text-blue-600 dark:text-blue-400">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
