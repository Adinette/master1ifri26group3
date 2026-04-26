/**
 * Format un montant en F CFA avec separateurs francais.
 * @example formatFCFA(35000) -> "35 000 F CFA"
 * @example formatFCFA(0) -> "0 F CFA"
 */
export function formatFCFA(amount: number | null | undefined, opts?: { decimals?: number }): string {
  const value = Number(amount ?? 0)
  const decimals = opts?.decimals ?? 0
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} F CFA`
}

/**
 * Traduit un statut technique en libelle utilisateur francais.
 * Couvre les statuts metiers (commandes, factures, lots, paiements).
 */
export function translateStatus(status: string | null | undefined): string {
  if (!status) return '—'
  const s = status.toString().toLowerCase().trim()
  const map: Record<string, string> = {
    // Commandes
    pending: 'En attente',
    validated: 'Validée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    canceled: 'Annulée',
    failed: 'Échouée',
    rejected: 'Rejetée',
    // Factures / paiements
    paid: 'Payée',
    unpaid: 'Impayée',
    partial: 'Partielle',
    refunded: 'Remboursée',
    overdue: 'En retard',
    issued: 'Émise',
    // Production / lots
    planned: 'Planifié',
    'in_progress': 'En cours',
    'in-progress': 'En cours',
    inprogress: 'En cours',
    running: 'En cours',
    completed: 'Terminé',
    paused: 'En pause',
    // Stock
    available: 'Disponible',
    low: 'Stock faible',
    out: 'Rupture',
    // Generique
    active: 'Actif',
    inactive: 'Inactif',
    archived: 'Archivé',
  }
  return map[s] ?? capitalize(s)
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
