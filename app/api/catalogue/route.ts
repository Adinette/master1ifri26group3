import { NextResponse } from 'next/server'

const MOCK_PRODUCTS = [
  // ── CIMENT ──────────────────────────────────────────────────────────────
  {
    id: 1, ref: 'CIM-CEM1-425', name: 'Ciment Portland CEM I 42.5N', category: 'Ciment',
    subcategory: 'Portland', unit: 'sac 50 kg', price: 35000, inStock: true, popular: true,
    desc: 'Ciment de haute résistance, idéal pour dalles, poteaux et fondations. Résistance nominale 42,5 MPa à 28 jours. Homologué CEBENOR.',
    specs: { Résistance: '42.5 MPa / 28j', Classe: 'CEM I · N', Poids: '50 kg net', Prise: 'Normale' },
    tags: ['Fondations', 'Dalles', 'Structures'],
  },
  {
    id: 2, ref: 'CIM-CEM2-325', name: 'Ciment Portland CEM II 32.5R', category: 'Ciment',
    subcategory: 'Portland', unit: 'sac 50 kg', price: 30000, inStock: true, popular: false,
    desc: 'Ciment polyvalent à prise rapide. Convient aux maçonneries, enduits et travaux courants. Rapport qualité-prix idéal pour les chantiers résidentiels.',
    specs: { Résistance: '32.5 MPa / 28j', Classe: 'CEM II · R', Poids: '50 kg net', Prise: 'Rapide' },
    tags: ['Maçonnerie', 'Enduits', 'Résidentiel'],
  },
  {
    id: 3, ref: 'CIM-BLC-325', name: 'Ciment Blanc CEM II 32.5', category: 'Ciment',
    subcategory: 'Blanc', unit: 'sac 25 kg', price: 22000, inStock: true, popular: false,
    desc: 'Ciment blanc fin pour joints de carrelage, ragréages décoratifs et enduits de finition intérieure. Couleur homogène garantie.',
    specs: { Résistance: '32.5 MPa / 28j', Couleur: 'Blanc pur', Poids: '25 kg net', Usage: 'Finitions' },
    tags: ['Finitions', 'Joints', 'Décoration'],
  },
  {
    id: 4, ref: 'CIM-CEM1-525', name: 'Ciment Portland CEM I 52.5R', category: 'Ciment',
    subcategory: 'Portland', unit: 'sac 50 kg', price: 42000, inStock: true, popular: false,
    desc: 'Ciment très haute résistance pour ouvrages d\'art, infrastructures et bétons précontraints. Résistance initiale élevée dès 2 jours.',
    specs: { Résistance: '52.5 MPa / 28j', Classe: 'CEM I · R', Poids: '50 kg net', Prise: 'Très rapide' },
    tags: ['Ouvrages d\'art', 'Infrastructure', 'Béton armé'],
  },

  // ── FER ─────────────────────────────────────────────────────────────────
  {
    id: 5, ref: 'FER-HA6-6M', name: 'Fer HA Ø6 mm — barre 6 m', category: 'Fer',
    subcategory: 'Armatures', unit: 'ml', price: 800, inStock: true, popular: false,
    desc: 'Armature en acier haute adhérence Ø6 mm. Utilisée pour les ceintures, cadres et ligatures dans les structures en béton armé léger.',
    specs: { Diamètre: 'Ø 6 mm', Longueur: '6 m / barre', Nuance: 'Fe500', Norme: 'NF EN 10080' },
    tags: ['Ligatures', 'Cadres', 'Ceintures'],
  },
  {
    id: 6, ref: 'FER-HA8-6M', name: 'Fer HA Ø8 mm — barre 6 m', category: 'Fer',
    subcategory: 'Armatures', unit: 'ml', price: 1400, inStock: true, popular: false,
    desc: 'Armature Ø8 mm pour dalles légères, chaînages horizontaux et structures de maisons individuelles.',
    specs: { Diamètre: 'Ø 8 mm', Longueur: '6 m / barre', Nuance: 'Fe500', Norme: 'NF EN 10080' },
    tags: ['Dalles', 'Chaînages', 'Maisons'],
  },
  {
    id: 7, ref: 'FER-HA10-6M', name: 'Fer HA Ø10 mm — barre 6 m', category: 'Fer',
    subcategory: 'Armatures', unit: 'ml', price: 1800, inStock: true, popular: false,
    desc: 'Armature Ø10 mm polyvalente. Standard pour dalles de plancher et poteaux de petites sections dans l\'habitat résidentiel.',
    specs: { Diamètre: 'Ø 10 mm', Longueur: '6 m / barre', Nuance: 'Fe500', Norme: 'NF EN 10080' },
    tags: ['Planchers', 'Poteaux', 'Résidentiel'],
  },
  {
    id: 8, ref: 'FER-HA12-6M', name: 'Fer HA Ø12 mm — barre 6 m', category: 'Fer',
    subcategory: 'Armatures', unit: 'ml', price: 2500, inStock: true, popular: true,
    desc: 'Notre référence la plus commandée. Armature Ø12 mm pour poteaux porteurs, semelles filantes et dalles à forte charge. Incontournable sur tous les chantiers béninois.',
    specs: { Diamètre: 'Ø 12 mm', Longueur: '6 m / barre', Nuance: 'Fe500', Norme: 'NF EN 10080' },
    tags: ['Poteaux', 'Semelles', 'Dalles'],
  },
  {
    id: 9, ref: 'FER-HA14-6M', name: 'Fer HA Ø14 mm — barre 6 m', category: 'Fer',
    subcategory: 'Armatures', unit: 'ml', price: 3400, inStock: true, popular: false,
    desc: 'Armature Ø14 mm pour structures de R+2 et plus, dalles épaisses et voiles en béton armé.',
    specs: { Diamètre: 'Ø 14 mm', Longueur: '6 m / barre', Nuance: 'Fe500', Norme: 'NF EN 10080' },
    tags: ['R+2 et plus', 'Voiles', 'Structures lourdes'],
  },
  {
    id: 10, ref: 'FER-HA16-6M', name: 'Fer HA Ø16 mm — barre 6 m', category: 'Fer',
    subcategory: 'Armatures', unit: 'ml', price: 4200, inStock: false, popular: false,
    desc: 'Armature lourde Ø16 mm pour poteaux de grande section, structures industrielles et travaux d\'infrastructure.',
    specs: { Diamètre: 'Ø 16 mm', Longueur: '6 m / barre', Nuance: 'Fe500', Norme: 'NF EN 10080' },
    tags: ['Industrie', 'Infrastructure', 'Gros œuvre'],
  },

  // ── BRIQUES & BLOCS ─────────────────────────────────────────────────────
  {
    id: 11, ref: 'BRQ-RGS-22', name: 'Brique rouge standard 22×10×7 cm', category: 'Briques',
    subcategory: 'Briques cuites', unit: 'unité', price: 150, inStock: true, popular: true,
    desc: 'Brique pleine en terre cuite fabriquée localement selon les traditions béninoises. Excellente régulation thermique — idéale pour murs porteurs en climat tropical.',
    specs: { Dimensions: '22 × 10 × 7 cm', Type: 'Pleine cuite', Résistance: '> 10 MPa', Usage: 'Murs porteurs' },
    tags: ['Murs porteurs', 'Thermique', 'Local'],
  },
  {
    id: 12, ref: 'BLQ-CRX15', name: 'Bloc creux béton 15 cm', category: 'Briques',
    subcategory: 'Blocs béton', unit: 'unité', price: 450, inStock: true, popular: false,
    desc: 'Bloc creux en béton vibré 15×20×40 cm. Standard pour cloisons intérieures et murs de façade non porteurs. Coupe rapide, pose aisée.',
    specs: { Dimensions: '15 × 20 × 40 cm', Type: 'Creux vibré', Poids: '10.5 kg', Usage: 'Cloisons' },
    tags: ['Cloisons', 'Façades', 'Non porteur'],
  },
  {
    id: 13, ref: 'BLQ-CRX20', name: 'Bloc creux béton 20 cm', category: 'Briques',
    subcategory: 'Blocs béton', unit: 'unité', price: 600, inStock: true, popular: false,
    desc: 'Bloc creux 20 cm pour murs extérieurs et murs de séparation avec isolation thermique intégrée. Réduit les ponts thermiques en façade.',
    specs: { Dimensions: '20 × 20 × 40 cm', Type: 'Creux vibré', Poids: '14 kg', Usage: 'Murs extérieurs' },
    tags: ['Extérieur', 'Isolation', 'Murs'],
  },
  {
    id: 14, ref: 'BLQ-PLN10', name: 'Bloc plein béton 10 cm', category: 'Briques',
    subcategory: 'Blocs béton', unit: 'unité', price: 350, inStock: true, popular: false,
    desc: 'Bloc plein haute densité pour soubassements, murets et clôtures. Excellente résistance à la compression et à l\'humidité du sol.',
    specs: { Dimensions: '10 × 20 × 40 cm', Type: 'Plein vibré', Poids: '12 kg', Usage: 'Soubassements' },
    tags: ['Soubassements', 'Clôtures', 'Murets'],
  },

  // ── GRANULATS ────────────────────────────────────────────────────────────
  {
    id: 15, ref: 'GRN-SBL-RIV', name: 'Sable de rivière lavé', category: 'Granulats',
    subcategory: 'Sables', unit: 'm³', price: 22000, inStock: true, popular: false,
    desc: 'Sable fin 0/4 mm extrait et lavé en carrière. Idéal pour bétons courants, mortiers de maçonnerie et enduits. Faible teneur en argile.',
    specs: { Granulométrie: '0/4 mm', Origine: 'Rivière lavée', Propreté: '> 80 ESV', Usage: 'Béton / Mortier' },
    tags: ['Béton', 'Mortier', 'Enduits'],
  },
  {
    id: 16, ref: 'GRN-SBL-MER', name: 'Sable de mer traité', category: 'Granulats',
    subcategory: 'Sables', unit: 'm³', price: 18000, inStock: true, popular: false,
    desc: 'Sable de mer dessalé et lavé, adapté aux travaux de remblayage, sous-couches et dressage de terrain. Non adapté aux bétons armés.',
    specs: { Granulométrie: '0/2 mm', Origine: 'Côte atlantique', Traitement: 'Dessalé', Usage: 'Remblai / Sous-couche' },
    tags: ['Remblayage', 'Sous-couche', 'Terrain'],
  },
  {
    id: 17, ref: 'GRN-GRV-1525', name: 'Gravier concassé 15/25 mm', category: 'Granulats',
    subcategory: 'Gravillons', unit: 'm³', price: 35000, inStock: true, popular: true,
    desc: 'Gravier concassé en granite 15/25 mm pour bétons de structure. Anguleux, excellente accroche dans les bétons. Calibré et testé LNBTP.',
    specs: { Granulométrie: '15/25 mm', Origine: 'Granite concassé', Calibre: 'Anguleux', Norme: 'LNBTP' },
    tags: ['Béton armé', 'Structures', 'Dalles'],
  },
  {
    id: 18, ref: 'GRN-GRV-0315', name: 'Gravillons 0/31.5 mm', category: 'Granulats',
    subcategory: 'Gravillons', unit: 'm³', price: 28000, inStock: true, popular: false,
    desc: 'Tout-venant concassé 0/31.5 mm pour sous-fondations, couches de base routière et remblais compactés.',
    specs: { Granulométrie: '0/31.5 mm', Type: 'Tout-venant', Usage: 'Sous-fondation / Route', Compactage: 'Requis' },
    tags: ['Route', 'Sous-fondation', 'Remblai'],
  },
]

export async function GET() {
  const serviceUrl = process.env.PRODUCT_SERVICE_URL
  if (serviceUrl) {
    try {
      const res = await fetch(`${serviceUrl}/api/products`, { next: { revalidate: 60 } })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {
      // Service indisponible — fallback sur les données mock
    }
  }
  return NextResponse.json(MOCK_PRODUCTS)
}
