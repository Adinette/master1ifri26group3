export type ReleaseTrack = {
  id: string
  title: string
  branch: string
  baseBranch: string
  prNumber: number
  prUrl: string
  status: string
  audience: string
  summary: string
  badge: string
  updatedAt: string
  recommended: boolean
  highlights: string[]
  commands: string[]
}

export const releaseTracks: ReleaseTrack[] = [
  {
    id: 'phase7-shared-fix',
    title: 'Correctif partage Phase 7',
    branch: 'fix/phase7-reporting-resilience',
    baseBranch: 'feature/phase7-microservices-advanced',
    prNumber: 4,
    prUrl: 'https://github.com/Adinette/tp_twm/pull/4',
    status: 'En revue',
    audience: 'Equipe qui doit rester alignee sur la branche Phase 7 deja partagee.',
    summary: 'Stabilise le reporting et la supervision sans reecrire la ligne de travail Phase 7.',
    badge: 'Phase 7',
    updatedAt: '22/04/2026',
    recommended: true,
    highlights: [
      'Le dashboard Reporting reste exploitable meme si un service aval est indisponible.',
      'La route BFF /api/reporting/dashboard est remise en place sur la ligne Phase 7.',
      'La page Services et la route /api/services-status pointent sur les vrais endpoints monitorés.',
    ],
    commands: [
      'git fetch origin',
      'git switch fix/phase7-reporting-resilience',
      'git pull origin fix/phase7-reporting-resilience',
    ],
  },
  {
    id: 'phase8-consolidation',
    title: 'Consolidation complete Phase 8',
    branch: 'feature/phase8-infra-cleanup',
    baseBranch: 'feature/phase8-front-reporting-deployment-prep',
    prNumber: 5,
    prUrl: 'https://github.com/Adinette/tp_twm/pull/5',
    status: 'En revue',
    audience: 'Collaborateurs qui veulent reprendre la derniere ligne front, reporting, order et infra.',
    summary: 'Regroupe les correctifs order, reporting, services et les Dockerfiles restants.',
    badge: 'Phase 8',
    updatedAt: '22/04/2026',
    recommended: false,
    highlights: [
      'Service Order aligne sur Next 16 pour les params dynamiques et sur PrismaConfig courant.',
      'Le reporting supporte les dependances partielles tout en affichant l etat reel des services.',
      'Les Dockerfiles manquants pour Inventory, Order et Product sont ajoutes.',
    ],
    commands: [
      'git fetch origin',
      'git switch feature/phase8-infra-cleanup',
      'git pull origin feature/phase8-infra-cleanup',
    ],
  },
]

export const collaborationChecklist = [
  'Recuperer d abord les refs distantes avec git fetch origin.',
  'Choisir la bonne ligne: Phase 7 pour la correction partagee, Phase 8 pour la consolidation complete.',
  'Executer git switch puis git pull sur la branche cible avant toute modification locale.',
  'Relancer ensuite les services utiles en priorite avec Webpack quand Turbopack est instable sur Windows.',
]

export const phase9Highlights = [
  'Refonte du dashboard pour mieux orienter les collaborateurs vers les modules actifs et les branches a recuperer.',
  'Ajout d un centre de livraison avec PR, branches, commandes Git et consignes de synchronisation.',
  'Amelioration visuelle globale du shell dashboard et de la page d accueil pour rendre les points d entree plus lisibles.',
]