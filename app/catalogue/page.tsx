'use client'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'

/* ─── Types ─── */
interface Product {
  id: number
  ref: string
  name: string
  category: string
  subcategory: string
  unit: string
  price: number
  inStock: boolean
  popular: boolean
  desc: string
  specs: Record<string, string>
  tags: string[]
}

const CATEGORIES = [
  { key: 'Tous', label: 'Tout le catalogue', emoji: '📦', count: 18 },
  { key: 'Ciment', label: 'Ciment Portland', emoji: '🏗️', count: 4 },
  { key: 'Fer', label: 'Fer à béton', emoji: '⚙️', count: 6 },
  { key: 'Briques', label: 'Briques & Blocs', emoji: '🧱', count: 4 },
  { key: 'Granulats', label: 'Granulats & Sables', emoji: '🪨', count: 4 },
]

const CATEGORY_EMOJI: Record<string, string> = {
  Ciment: '🏗️',
  Fer: '⚙️',
  Briques: '🧱',
  Granulats: '🪨',
}

/* ─── Carte produit détaillée ─── */
function ProductCard({ p }: { p: Product }) {
  const [open, setOpen] = useState(false)

  return (
    <article
      style={{
        backgroundColor: 'white',
        border: open ? '1.5px solid #2563EB' : '1px solid #E7E5E4',
        borderRadius: '0.875rem',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: open ? '0 4px 24px rgba(37,99,235,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* En-tête produit */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          {/* Emoji catégorie */}
          <div
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              borderRadius: '0.6rem',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            {CATEGORY_EMOJI[p.category] ?? '📦'}
          </div>
          {/* Infos principales */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#1D4ED8',
                  backgroundColor: '#EFF6FF',
                  padding: '0.1rem 0.55rem',
                  borderRadius: '999px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {p.category}
              </span>
              {p.popular && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    color: 'white',
                    backgroundColor: '#2563EB',
                    padding: '0.1rem 0.55rem',
                    borderRadius: '999px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  ★ Populaire
                </span>
              )}
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: p.inStock ? '#166534' : '#991B1B',
                  backgroundColor: p.inStock ? '#DCFCE7' : '#FEE2E2',
                  padding: '0.1rem 0.55rem',
                  borderRadius: '999px',
                  letterSpacing: '0.04em',
                  marginLeft: 'auto',
                }}
              >
                {p.inStock ? '✓ En stock' : '✗ Rupture'}
              </span>
            </div>
            <h2
              style={{
                fontWeight: 800,
                fontSize: '0.97rem',
                color: '#0F172A',
                marginBottom: '0.2rem',
                lineHeight: 1.3,
              }}
            >
              {p.name}
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
              Réf. {p.ref}
            </p>
          </div>
        </div>

        {/* Description courte */}
        <p
          style={{
            color: '#475569',
            fontSize: '0.83rem',
            lineHeight: 1.7,
            marginTop: '0.85rem',
          }}
        >
          {p.desc}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {p.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#64748B',
                backgroundColor: '#F5F5F4',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Specs (dépliable) */}
      {open && (
        <div
          style={{
            borderTop: '1px solid #F5F0E8',
            padding: '1rem 1.5rem',
            backgroundColor: '#F8FAFC',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.6rem 1.5rem',
          }}
        >
          {Object.entries(p.specs).map(([k, v]) => (
            <div key={k}>
              <p style={{ fontSize: '0.67rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</p>
              <p style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 700, marginTop: '0.1rem' }}>{v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pied — prix + actions */}
      <div
        style={{
          borderTop: '1px solid #F5F0E8',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#2563EB', lineHeight: 1 }}>
            {p.price.toLocaleString('fr-FR')}
          </span>
          <span style={{ color: '#64748B', fontSize: '0.75rem', marginLeft: '0.3rem' }}>FCFA / {p.unit}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#64748B',
              border: '1px solid #E7E5E4',
              backgroundColor: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            {open ? 'Réduire ↑' : 'Fiche technique ↓'}
          </button>
          <Link
            href="/front/auth/login"
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'white',
              backgroundColor: p.inStock ? '#2563EB' : '#D4D0CA',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              pointerEvents: p.inStock ? 'auto' : 'none',
            }}
          >
            {p.inStock ? 'Commander' : 'Indisponible'}
          </Link>
        </div>
      </div>
    </article>
  )
}

/* ─── PAGE ─── */
export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name')

  useEffect(() => {
    fetch('/api/catalogue')
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = products
    .filter((p) => activeCategory === 'Tous' || p.category === activeCategory)
    .filter((p) =>
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ref.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      return a.name.localeCompare(b.name)
    })

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  return (
    <main style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingTop: '5rem' }}>

      {/* ── En-tête ── */}
      <section style={{ backgroundColor: '#0F172A', padding: '3.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', marginBottom: '1.25rem' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Accueil</Link>
            <span style={{ color: '#475569' }}>/</span>
            <span style={{ color: '#2563EB', fontWeight: 600 }}>Catalogue</span>
          </nav>
          <h1
            style={{
              color: 'white',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              marginBottom: '0.75rem',
            }}
          >
            Catalogue <span style={{ color: '#2563EB', fontStyle: 'italic' }}>SFMC Bénin</span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '560px', lineHeight: 1.6 }}>
            18 références en stock · Ciment, fer, briques, granulats.
            Fiches techniques complètes — prix en FCFA, livrés sur votre chantier.
          </p>
        </div>
      </section>

      {/* ── Corps principal : sidebar + liste ── */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2.5rem 2rem',
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '2.5rem',
          alignItems: 'start',
        }}
        className="max-lg:block"
      >

        {/* ── SIDEBAR ── */}
        <aside>
          {/* Filtres catégories */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #E7E5E4',
              borderRadius: '0.875rem',
              overflow: 'hidden',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #F5F5F4',
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Catégories
            </div>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: active ? '#F8FAFC' : 'transparent',
                    borderLeft: active ? '3px solid #2563EB' : '3px solid transparent',
                    borderBottom: 'none',
                    borderRight: 'none',
                    borderTop: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: '0.83rem',
                      fontWeight: active ? 800 : 600,
                      color: active ? '#0F172A' : '#475569',
                    }}
                  >
                    {cat.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: active ? '#2563EB' : '#94A3B8',
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Encart devis */}
          <div
            style={{
              backgroundColor: '#0F172A',
              borderRadius: '0.875rem',
              padding: '1.25rem',
            }}
          >
            <p style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Besoin d&apos;un devis ?
            </p>
            <p style={{ color: '#64748B', fontSize: '0.77rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Grande quantité ou commande spéciale ? On établit un devis en 2h.
            </p>
            <a
              href="https://wa.me/22900000000?text=Bonjour+SFMC%2C+je+voudrais+un+devis"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                backgroundColor: '#2563EB',
                color: 'white',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.6rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              WhatsApp →
            </a>
          </div>
        </aside>

        {/* ── LISTE PRODUITS ── */}
        <section>
          {/* Barre outils */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {/* Recherche */}
            <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
              <svg
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Rechercher une référence, un nom…"
                value={search}
                onChange={handleSearch}
                style={{
                  width: '100%',
                  paddingLeft: '2.25rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.6rem',
                  paddingBottom: '0.6rem',
                  fontSize: '0.83rem',
                  border: '1px solid #E7E5E4',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  outline: 'none',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              style={{
                padding: '0.6rem 0.85rem',
                fontSize: '0.8rem',
                border: '1px solid #E7E5E4',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                color: '#0F172A',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="name">Nom A→Z</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
            {/* Compteur */}
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* États */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94A3B8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Chargement du catalogue…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>Aucun produit trouvé</p>
              <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
                Essayez un autre mot-clé ou{' '}
                <button
                  onClick={() => { setSearch(''); setActiveCategory('Tous') }}
                  style={{ color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  réinitialisez les filtres
                </button>
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}

          {/* Info livraison bas de page */}
          {!loading && filtered.length > 0 && (
            <div
              style={{
                marginTop: '2rem',
                backgroundColor: '#EFF6FF',
                border: '1px solid #93C5FD',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>🚚</span>
              <div>
                <p style={{ fontWeight: 800, color: '#1D4ED8', fontSize: '0.85rem' }}>
                  Livraison sur Cotonou et Abomey-Calavi en 24h
                </p>
                <p style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                  Intérieur du pays 48–72h · Devis livraison inclus à la commande
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
