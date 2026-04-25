'use client'
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

/* ─── Hook scroll reveal ─── */
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(28px)'
    el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return ref as React.RefObject<HTMLElement>
}

/* ─── Bande défilante ticker ─── */
function Ticker() {
  const items = [
    'Ciment CEM I 42.5N · 35 000 FCFA/sac',
    'Fer HA Ø12 · 2 500 FCFA/ml',
    'Bloc creux 15 cm · 450 FCFA/unité',
    'Gravier 15/25 · 18 000 FCFA/m³',
    'Sable de mer lavé · 22 000 FCFA/m³',
    'Fer HA Ø8 · 1 400 FCFA/ml',
    'Brique pleine rouge · 150 FCFA/unité',
    'Ciment CEM II 32.5R · 30 000 FCFA/sac',
  ]
  const repeated = [...items, ...items]
  return (
    <div
      style={{
        background: '#2563EB',
        overflow: 'hidden',
        padding: '10px 0',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          gap: '3rem',
          animation: 'sfmc-ticker 32s linear infinite',
          paddingRight: '3rem',
        }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            style={{
              color: 'white',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            ▸ {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Témoignage card ─── */
function TemoignageCard({
  nom, titre, ville, texte, offset = false
}: {
  nom: string; titre: string; ville: string; texte: string; offset?: boolean
}) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #E7E5E4',
        borderRadius: '1rem',
        padding: '1.75rem',
        marginTop: offset ? '2rem' : '0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <p style={{ color: '#0F172A', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>
        &laquo;&thinsp;{texte}&thinsp;&raquo;
      </p>
      <div style={{ borderTop: '1px solid #F5F0E8', paddingTop: '1rem' }}>
        <p style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{nom}</p>
        <p style={{ color: '#2563EB', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{titre} — {ville}</p>
      </div>
    </div>
  )
}

/* ─── Catégorie bento ─── */
function BentoCell({
  label, count, emoji, span2 = false, dark = false
}: {
  label: string; count: number; emoji: string; span2?: boolean; dark?: boolean
}) {
  return (
    <Link
      href="/catalogue"
      style={{
        gridColumn: span2 ? 'span 2' : 'span 1',
        backgroundColor: dark ? '#0F172A' : 'white',
        border: dark ? 'none' : '1px solid #E7E5E4',
        borderRadius: '1rem',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '160px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.transform = 'translateY(-3px)'
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      <div style={{ fontSize: '2.4rem' }}>{emoji}</div>
      <div>
        <p style={{ fontWeight: 900, fontSize: '1.15rem', color: dark ? 'white' : '#0F172A', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ fontSize: '0.8rem', color: dark ? '#94A3B8' : '#64748B', fontWeight: 600 }}>{count} références</p>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', marginTop: '0.5rem', letterSpacing: '0.04em' }}>
          VOIR &rarr;
        </p>
      </div>
    </Link>
  )
}

/* ─── PAGE ─── */
export default function HomePage() {
  const [whatsappHover, setWhatsappHover] = useState(false)
  const secAbout = useFadeIn(0) as React.RefObject<HTMLDivElement>
  const secBento = useFadeIn(100) as React.RefObject<HTMLDivElement>
  const secFeatured = useFadeIn(0) as React.RefObject<HTMLDivElement>
  const secZones = useFadeIn(0) as React.RefObject<HTMLDivElement>
  const secTemoignages = useFadeIn(0) as React.RefObject<HTMLDivElement>

  return (
    <main style={{ backgroundColor: '#F8FAFC', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════
          HERO — deux colonnes, typographie forte
      ══════════════════════════════════════════ */}
      <section
        style={{
          minHeight: '100vh',
          paddingTop: '5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          overflow: 'hidden',
        }}
        className="max-lg:block"
      >
        {/* Colonne gauche — texte */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '3rem 2.5rem 3rem 4rem',
            gap: '1.5rem',
          }}
          className="max-lg:p-8"
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#EFF6FF',
              border: '1px solid #93C5FD',
              borderRadius: '999px',
              padding: '0.25rem 0.85rem',
              width: 'fit-content',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#1D4ED8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ color: '#2563EB' }}>●</span> Cotonou — Abomey-Calavi — Parakou
          </div>

          <h1
            style={{
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: '-0.025em',
              color: '#0F172A',
            }}
            className="text-5xl md:text-6xl lg:text-7xl"
          >
            VOS CHANTIERS,<br />
            <span style={{ color: '#2563EB', fontStyle: 'italic' }}>NOTRE FIERTÉ.</span>
          </h1>

          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '480px' }}>
            Depuis 2009, SFMC Bénin approvisionne les bâtisseurs du pays —
            des fondations d&apos;Akpakpa aux toits de Parakou.
            Ciment, fer, blocs, granulats : tout ce qu&apos;il faut, là où il faut.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/catalogue"
              style={{
                backgroundColor: '#2563EB',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.82rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0.85rem 1.75rem',
                borderRadius: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              Voir le catalogue
            </Link>
            <a
              href="https://wa.me/22900000000?text=Bonjour+SFMC+Bénin%2C+je+voudrais+un+devis"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setWhatsappHover(true)}
              onMouseLeave={() => setWhatsappHover(false)}
              style={{
                backgroundColor: whatsappHover ? '#16A34A' : 'white',
                color: whatsappHover ? 'white' : '#16A34A',
                border: '2px solid #16A34A',
                fontWeight: 800,
                fontSize: '0.82rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0.85rem 1.75rem',
                borderRadius: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.523 5.847L0 24l6.335-1.506A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.573-.5-5.063-1.37L2.5 21.5l.893-4.302A9.938 9.938 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Devis WhatsApp
            </a>
          </div>

          {/* 3 métriques horizontales — sans cartes */}
          <div
            style={{
              display: 'flex',
              gap: '2.5rem',
              marginTop: '0.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #E7E5E4',
            }}
          >
            {[
              { val: '400+', label: 'Chantiers actifs' },
              { val: '3', label: 'Dépôts à Cotonou' },
              { val: '500+', label: 'Références en stock' },
            ].map((m, i) => (
              <div key={i}>
                <p style={{ fontWeight: 900, fontSize: '1.6rem', color: '#2563EB', lineHeight: 1 }}>{m.val}</p>
                <p style={{ fontSize: '0.73rem', color: '#64748B', fontWeight: 600, marginTop: '0.2rem' }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite — fond ambre + grille béton stylisée */}
        <div
          style={{
            backgroundColor: '#0F172A',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '500px',
          }}
        >
          {/* Grille "ferraillage" SVG en filigrane */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563EB" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* Gros accent ambre en arrière-plan */}
          <div
            style={{
              position: 'absolute',
              right: '-80px',
              bottom: '-80px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(37,99,235,0.28) 0%, transparent 70%)',
            }}
          />
          {/* Contenu central */}
          <div style={{ position: 'relative', textAlign: 'center', padding: '2rem' }}>
            <div
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
              }}
            >
              🏗️
            </div>
            <p style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Matériaux de qualité
            </p>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Certifiés &amp; disponibles
            </p>
            {/* Badge flottant */}
            <div
              style={{
                backgroundColor: '#2563EB',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                display: 'inline-block',
                marginTop: '1.5rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              ⚡ Livraison 24h · Cotonou
            </div>
            {/* Citation */}
            <blockquote
              style={{
                color: '#64748B',
                fontSize: '0.82rem',
                fontStyle: 'italic',
                marginTop: '2rem',
                borderLeft: '3px solid #2563EB',
                paddingLeft: '1rem',
                textAlign: 'left',
              }}
            >
              &laquo; Le béton tient parce que le fer est droit,<br />
              le fer est droit parce qu&apos;on choisit SFMC. &raquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <Ticker />

      {/* ══════════════════════════════════════════
          QUI SOMMES-NOUS — 2 colonnes éditoriales
      ══════════════════════════════════════════ */}
      <section
        ref={secAbout}
        style={{ padding: '5rem 0', backgroundColor: 'white' }}
        id="about"
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5rem',
            alignItems: 'center',
          }}
          className="max-lg:grid-cols-1 max-lg:gap-10"
        >
          {/* Gauche : chiffres éditoriaux */}
          <div>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 800,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                marginBottom: '1.25rem',
              }}
            >
              Notre histoire
            </div>
            <h2
              style={{
                fontWeight: 900,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#0F172A',
                lineHeight: 1.1,
                marginBottom: '1.5rem',
              }}
            >
              Fondée à Cotonou.<br />
              <span style={{ color: '#2563EB' }}>Présente partout.</span>
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              En 2009, SFMC Bénin a ouvert son premier dépôt au quartier de Fidjrossè. Le projet était
              simple : offrir aux maçons, architectes et promoteurs béninois des matériaux de construction
              fiables, à prix juste, sans attente.
            </p>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.8 }}>
              Aujourd&apos;hui, nos trois dépôts couvrent Cotonou, Abomey-Calavi et les livraisons
              atteignent Parakou, Abomey, Bohicon. Nos camions sillonnent les chantiers chaque matin.
            </p>
            <div
              style={{
                marginTop: '2.5rem',
                borderLeft: '4px solid #2563EB',
                paddingLeft: '1.25rem',
              }}
            >
              <p style={{ fontStyle: 'italic', color: '#0F172A', fontSize: '1rem', fontWeight: 600, lineHeight: 1.6 }}>
                &laquo; Le Bénin construit vite. Il faut des partenaires qui suivent le rythme. &raquo;
              </p>
              <p style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.8rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Direction SFMC Bénin, 2009
              </p>
            </div>
          </div>

          {/* Droite : grille de chiffres clés */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            {[
              { val: '2009', label: "Année de création", sub: 'à Fidjrossè, Cotonou' },
              { val: '3', label: 'Dépôts actifs', sub: 'Cotonou · Abomey-Calavi' },
              { val: '500+', label: 'Références produits', sub: 'Ciment, fer, blocs, granulats' },
              { val: '24h', label: 'Délai de livraison', sub: 'Sur grand Cotonou' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: i % 2 === 0 ? '#F8FAFC' : 'white',
                  border: '1px solid #E7E5E4',
                  borderRadius: '0.875rem',
                  padding: '1.5rem',
                }}
              >
                <p style={{ fontWeight: 900, fontSize: '2rem', color: '#2563EB', lineHeight: 1 }}>{item.val}</p>
                <p style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem', marginTop: '0.4rem' }}>{item.label}</p>
                <p style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.2rem' }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATALOGUE BENTO — grille asymétrique
      ══════════════════════════════════════════ */}
      <section
        ref={secBento}
        style={{ padding: '5rem 0', backgroundColor: '#F8FAFC' }}
        id="catalogue"
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2
              style={{
                fontWeight: 900,
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                color: '#0F172A',
                letterSpacing: '-0.02em',
              }}
            >
              Ce que nous livrons
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Tout pour monter des murs, couler des dalles, finir les sols.
            </p>
          </div>

          {/* Bento grid 3×2 avec une grande cellule */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
            }}
            className="max-md:grid-cols-1"
          >
            {/* Grande cellule span 2 */}
            <BentoCell label="Ciment Portland" count={15} emoji="🏗️" span2 dark />
            <BentoCell label="Granulats" count={6} emoji="🪨" />
            <BentoCell label="Fer à béton" count={12} emoji="⚙️" />
            <BentoCell label="Briques & Blocs" count={14} emoji="🧱" span2 />
            <BentoCell label="Sable & Gravier" count={8} emoji="🏖️" />
          </div>

          <div style={{ marginTop: '1.75rem', textAlign: 'right' }}>
            <Link
              href="/catalogue"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#2563EB',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Tout le catalogue → {' '}
              <span style={{ fontSize: '0.7rem', backgroundColor: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: '999px', color: '#1D4ED8' }}>
                55 ref.
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRODUIT VEDETTE — pleine largeur éditorial
      ══════════════════════════════════════════ */}
      <section
        ref={secFeatured}
        style={{ backgroundColor: '#0F172A', padding: '5rem 0' }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
          }}
          className="max-lg:grid-cols-1 max-lg:gap-8"
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#2563EB',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.3rem 0.85rem',
                borderRadius: '999px',
                marginBottom: '1.25rem',
              }}
            >
              ★ Référence phare du mois
            </div>
            <h2
              style={{
                color: 'white',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                lineHeight: 1.1,
                marginBottom: '1rem',
              }}
            >
              Ciment Portland<br />
              <span style={{ color: '#3B82F6' }}>CEM I 42.5N</span>
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Le ciment de référence sur tous les grands chantiers du Bénin.
              Résistance nominale de 42,5 MPa à 28 jours — homologué CEBENOR,
              utilisé de la Villa Talon à Cotonou jusqu&apos;aux infrastructures routières
              de Natitingou.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '2rem',
              }}
            >
              {['CEBENOR homologué', 'Prise normale', 'Hautes résistances initiales', 'Sac 50 kg'].map((tag, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: 'rgba(37,99,235,0.15)',
                    color: '#3B82F6',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem' }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: '2.5rem', lineHeight: 1 }}>
                35 000
              </span>
              <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>FCFA / sac de 50 kg</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href="/front/auth/login"
                style={{
                  backgroundColor: '#2563EB',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Commander en ligne
              </Link>
              <Link
                href="/catalogue"
                style={{
                  border: '2px solid rgba(255,255,255,0.15)',
                  color: '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Voir les variantes
              </Link>
            </div>
          </div>
          {/* Droite : représentation visuelle produit */}
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '1rem',
              padding: '3rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ fontSize: '6rem', lineHeight: 1 }}>🏗️</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#3B82F6', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                CEM I 42.5N
              </p>
              <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Production : Lomé / Cotonou
              </p>
            </div>
            {/* Mini fiche technique */}
            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Résistance 28j', val: '42.5 MPa' },
                { label: 'Classe', val: 'CEM I · R' },
                { label: 'Poids sac', val: '50 kg net' },
                { label: 'Disponibilité', val: '✓ En stock · 3 dépôts' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748B' }}>{row.label}</span>
                  <span style={{ color: 'white', fontWeight: 700 }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ZONES DESSERVIES — no-carousel, editorial
      ══════════════════════════════════════════ */}
      <section
        ref={secZones}
        style={{ padding: '5rem 0', backgroundColor: 'white' }}
        id="zones"
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '4rem',
              alignItems: 'start',
            }}
            className="max-lg:grid-cols-1 max-lg:gap-8"
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  marginBottom: '1.25rem',
                }}
              >
                Livraison
              </div>
              <h2
                style={{
                  fontWeight: 900,
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  color: '#0F172A',
                  lineHeight: 1.15,
                  marginBottom: '1rem',
                }}
              >
                Nous livrons<br />
                <span style={{ color: '#2563EB' }}>tout le Bénin.</span>
              </h2>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.8 }}>
                Grand Cotonou en 24h. Intérieur du pays en 48h.
                Nos camions roulent 6j/7 — même pendant la saison des pluies.
              </p>
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1rem 1.25rem',
                  backgroundColor: '#DCFCE7',
                  borderRadius: '0.75rem',
                  border: '1px solid #86EFAC',
                }}
              >
                <p style={{ color: '#166534', fontWeight: 700, fontSize: '0.85rem' }}>
                  📞 Pour une livraison urgente :
                </p>
                <p style={{ color: '#166534', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  +229 XX XX XX XX &nbsp;·&nbsp; 24h/7j
                </p>
              </div>
            </div>

            {/* Grille des villes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
              }}
              className="max-sm:grid-cols-2"
            >
              {[
                { ville: 'Cotonou', delai: '< 24h', badge: 'Express', couleur: '#2563EB' },
                { ville: 'Abomey-Calavi', delai: '< 24h', badge: 'Express', couleur: '#2563EB' },
                { ville: 'Porto-Novo', delai: '24–36h', badge: 'Rapide', couleur: '#2563EB' },
                { ville: 'Bohicon', delai: '36–48h', badge: 'Standard', couleur: '#475569' },
                { ville: 'Abomey', delai: '36–48h', badge: 'Standard', couleur: '#475569' },
                { ville: 'Parakou', delai: '48–72h', badge: 'Planifié', couleur: '#64748B' },
                { ville: 'Natitingou', delai: '72h+', badge: 'Sur devis', couleur: '#94A3B8' },
                { ville: 'Kandi', delai: '72h+', badge: 'Sur devis', couleur: '#94A3B8' },
                { ville: 'Lokossa', delai: '36–48h', badge: 'Standard', couleur: '#475569' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E7E5E4',
                    borderRadius: '0.75rem',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <p style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                    📍 {item.ville}
                  </p>
                  <p style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.2rem' }}>{item.delai}</p>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: item.couleur,
                      marginTop: '0.35rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES — strip horizontal sans icônes génériques
      ══════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#EFF6FF', padding: '4rem 0' }} id="services">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: '1px solid rgba(37,99,235,0.25)',
            }}
            className="max-lg:grid-cols-2 max-sm:grid-cols-1"
          >
            {[
              {
                titre: 'Conseil technique',
                desc: "Un technicien SFMC vous aide à choisir la bonne classe de ciment, le bon diamètre d'armature, le bon dosage — gratuit, sans engagement.",
                num: '01',
              },
              {
                titre: 'Livraison chantier',
                desc: 'Commandez le soir, livré le lendemain matin sur votre chantier. Camion-grue disponible pour les grandes quantités.',
                num: '02',
              },
              {
                titre: 'Commande en ligne',
                desc: 'Passez commande depuis votre téléphone à 2h du matin si besoin. Paiement Mobile Money ou virement.',
                num: '03',
              },
              {
                titre: 'Compte pro fidélité',
                desc: 'Les maçons et promoteurs qui commandent régulièrement bénéficient de tarifs préférentiels et de crédits chantier.',
                num: '04',
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'white',
                  padding: '2rem 1.5rem',
                  borderRight: i < 3 ? '1px solid rgba(37,99,235,0.15)' : 'none',
                  borderBottom: 'none',
                }}
              >
                <p
                  style={{
                    fontWeight: 900,
                    fontSize: '0.68rem',
                    color: '#2563EB',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  {s.num}
                </p>
                <h3 style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                  {s.titre}
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.82rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TÉMOIGNAGES — grille staggerée, pas de carousel
      ══════════════════════════════════════════ */}
      <section
        ref={secTemoignages}
        style={{ padding: '5rem 0', backgroundColor: '#F8FAFC' }}
        id="avis"
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2
              style={{
                fontWeight: 900,
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                color: '#0F172A',
              }}
            >
              Ils bâtissent avec nous.
            </h2>
            <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              Promoteurs, maçons, architectes — ils nous font confiance depuis des années.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.25rem',
              alignItems: 'start',
            }}
            className="max-lg:grid-cols-1"
          >
            <TemoignageCard
              nom="Togbé Hounwanou"
              titre="Maître d'ouvrage"
              ville="Abomey-Calavi"
              texte="J'ai construit 3 villas à Godomey avec du ciment SFMC. Jamais eu de mauvaise surprise : la résistance est là, la livraison est là. Je ne change plus de fournisseur."
            />
            <TemoignageCard
              nom="Fafavi Dossou-Yovo"
              titre="Promotrice immobilière"
              ville="Fidjrossè-Kpota"
              texte="On gère 4 chantiers simultanément à Cotonou. SFMC nous envoie nos commandes par tranches — pas de stock inutile sur site, pas de rupture. C'est ça le vrai service."
              offset
            />
            <TemoignageCard
              nom="BTP Akpodji & Frères"
              titre="Entreprise de construction"
              ville="Porto-Novo"
              texte="Le fer HA Ø12 est notre référence pour toutes nos dalles. À 2 500 FCFA le mètre livré à Porto-Novo, c'est le meilleur rapport qualité-prix de la région."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL — sobre, direct
      ══════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: '#2563EB',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
        id="contact"
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2
            style={{
              color: 'white',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            Prêt à commander ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            Créez votre compte en 2 minutes et accédez aux prix pro,<br />
            aux devis en ligne et au suivi de vos commandes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/front/auth/register"
              style={{
                backgroundColor: 'white',
                color: '#2563EB',
                fontWeight: 900,
                fontSize: '0.85rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0.9rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
              }}
            >
              Créer un compte
            </Link>
            <a
              href="https://wa.me/22900000000?text=Bonjour+SFMC+Bénin%2C+je+voudrais+commander"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0.9rem 2rem',
                borderRadius: '0.5rem',
                border: '2px solid rgba(255,255,255,0.4)',
                textDecoration: 'none',
              }}
            >
              WhatsApp direct
            </a>
          </div>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.78rem',
              marginTop: '1.5rem',
              letterSpacing: '0.04em',
            }}
          >
            📍 Dépôt principal : Fidjrossè, Cotonou &nbsp;·&nbsp; +229 XX XX XX XX &nbsp;·&nbsp; contact@sfmc-benin.bj
          </p>
        </div>
      </section>

    </main>
  )
}
