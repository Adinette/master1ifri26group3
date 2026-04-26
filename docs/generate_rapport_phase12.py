"""Generateur du Rapport de Projet - Phase 12.

Phase 12 : refonte UI/UX du portail (dark mode utilisateur, dashboard analytics,
audit de coherence frontend, restauration du menu microservices).

Convention : pas d accents pour rester compatible avec tous les terminaux et
les versions Word anciennes. Les chaines longues sont decoupees pour la lisibilite.
"""

from datetime import datetime
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'docs' / 'Rapport_Projet_TWM_Phase12.docx'

PHASE12_BRANCH = 'phase-12-ui-theme-dashboard'
PHASE12_BASE = 'phase-11-inventory-fix'


PHASE12_KPIS = [
    ['Fichiers modifies (UI/theme)', '17'],
    ['Nouveaux fichiers (theme + toggle)', '2'],
    ['Pages dashboard auditees', '12/12'],
    ['Bugs critiques corriges', '1 (sidebar overlap)'],
    ['Modes de theme disponibles', '3 (light / dark / system)'],
    ['Graphes ajoutes au dashboard', '2 (histogramme + camembert)'],
    ['Dependance graphique ajoutee', '0 (SVG natif)'],
]


PHASE12_DELIVERABLES = [
    ['app/lib/theme.tsx', 'Nouveau',
     'ThemeProvider + hook useTheme avec persistance localStorage et suivi prefers-color-scheme.'],
    ['app/components/ThemeToggle.tsx', 'Nouveau',
     'Composant dropdown accessible (3 options) reutilisable navbar publique et dashboard.'],
    ['app/globals.css', 'Mise a jour',
     '@custom-variant dark Tailwind v4 + variables CSS dark pour bascule par classe.'],
    ['app/layout.tsx', 'Mise a jour',
     'Script inline anti-FOUC dans <head> + suppressHydrationWarning sur <html>.'],
    ['app/providers.tsx', 'Mise a jour',
     'Wrapper ThemeProvider autour de SessionProvider.'],
    ['app/dashboard/page.tsx', 'Refonte',
     'Vrai dashboard analytics : KPIs, histogramme, camembert, recents, etat infra.'],
    ['app/dashboard/settings/page.tsx', 'Refonte',
     'Selecteur de theme interactif + carte etat microservices live + tech info.'],
    ['app/components/DashboardSidebar.tsx', 'Mise a jour',
     'Section Systeme avec entree Microservices + corrections dark mode.'],
    ['app/components/DashboardNavbar.tsx', 'Mise a jour',
     'Integration ThemeToggle + dark mode aligne sur le reste.'],
    ['app/components/Navbar.tsx', 'Mise a jour',
     'Suppression complete des inline styles, conversion Tailwind + dark mode.'],
    ['app/dashboard/layout.tsx', 'Fix critique',
     'Ajout lg:ml-64 pour eviter le chevauchement contenu/sidebar fixe en desktop.'],
    ['app/dashboard/profile/page.tsx', 'Mise a jour',
     'Badge En attente avec variantes dark.'],
    ['app/dashboard/services/page.tsx', 'Mise a jour',
     'Palette unifiee zinc + dark mode.'],
    ['app/dashboard/reporting/page.tsx', 'Mise a jour',
     'Badge filtre dark mode aligne.'],
    ['app/front/auth/login/page.tsx', 'Mise a jour',
     'Suppression styles inline, ajout variantes dark sur les fonds et inputs.'],
]


AUDIT_ROWS = [
    ['Sidebar fixe vs contenu', 'Contenu sous la sidebar 256px sur desktop',
     'Ajout lg:ml-64 sur le wrapper principal du layout dashboard'],
    ['Inline styles Navbar publique', 'Hardcoded white, aucun support dark',
     'Conversion 100% Tailwind avec variantes dark'],
    ['Logo mobile sidebar', 'Texte SFMC en text-lg dans h-8 w-8 (overflow)',
     'Reduction a text-[8px] pour tenir dans la pastille'],
    ['Brand sidebar dark', 'dark:text-zinc-400 quasi invisible',
     'Passage a dark:text-white'],
    ['Palette incoherente', 'Mix slate-500 / zinc-500 / gray-*',
     'Standardisation sur zinc-* avec variantes dark'],
    ['Cartes accueil dashboard', 'bg-orange-50 etc. sans variantes dark',
     'Ajout dark:bg-*-900/10 sur toutes les cartes quick action'],
    ['Badge profile En attente', 'bg-yellow-100 sans dark',
     'Ajout dark:bg-yellow-900/30 + dark:text-yellow-400'],
]


THEME_FEATURES = [
    'Trois modes selectionnables : Clair, Sombre, Systeme.',
    'Persistance du choix utilisateur via localStorage (cle theme).',
    'Suivi reactif de prefers-color-scheme quand le mode Systeme est actif.',
    'Script anti-FOUC inline dans <head> qui applique .dark avant l hydratation React.',
    'suppressHydrationWarning sur <html> pour eviter l avertissement de mismatch.',
    'Dropdown accessible : aria-haspopup, aria-expanded, role menuitemradio.',
    'Fermeture par clic exterieur et touche Escape.',
    'Toggle present dans la navbar publique (desktop + mobile) et la navbar dashboard.',
]


DASHBOARD_FEATURES = [
    'Hero compact avec salutation utilisateur et CTA actions rapides.',
    'Cinq cartes KPI : Commandes, Stock, Factures, Production, Revenus FCFA.',
    'Histogramme SVG natif des commandes par statut (en attente / validees / expediees / annulees).',
    'Camembert SVG natif des factures (payees vs en attente) avec legende et pourcentages.',
    'Quatre listes recents : commandes, factures, notifications, stock critique.',
    'Widget infrastructure : pastilles live de Kong, RabbitMQ et microservices.',
    'Loader, gestion d erreur, et badge donnees partielles si un service repond 503.',
    'Aucune dependance ajoutee : tous les graphes sont en SVG natif.',
]


SETTINGS_SECTIONS = [
    ['Apparence', 'Trois cartes cliquables (Clair / Sombre / Systeme).',
     'Indique le mode applique ; carte active mise en evidence.'],
    ['General', 'Langue, devise (FCFA / EUR).',
     'Placeholder coherent prepare pour internationalisation.'],
    ['Etat du systeme', 'Statut live Kong + RabbitMQ + microservices.',
     'Bouton Actualiser et lien vers la page de detail.'],
    ['Informations techniques', 'Versions des stacks principales.',
     'Next.js, React, Prisma, NextAuth, PostgreSQL, Tailwind.'],
]


SIDEBAR_CHANGES = [
    'Nouvelle section Systeme dans la sidebar.',
    'Entree Microservices avec icone satellite vers /dashboard/services.',
    'Acces aux statuts d infrastructure depuis n importe quelle page du dashboard.',
    'Correctifs visuels : palette zinc, dark mode, logo mobile redimensionne.',
]


VALIDATION_ROWS = [
    ['Compilation Next.js', 'Lancement npm run dev', 'Ready en 1.2 s sans erreur'],
    ['Page dashboard', 'GET http://localhost:3000/dashboard', '200 OK (compile + hydratation)'],
    ['Page settings', 'GET http://localhost:3000/dashboard/settings', '200 OK avec toggle interactif'],
    ['Page login', 'GET http://localhost:3000/front/auth/login', '200 OK en clair et sombre'],
    ['Theme persistance', 'localStorage.theme entre rafraichissements', 'Choix conserve'],
    ['Anti-FOUC', 'Rechargement en mode sombre', 'Aucun flash blanc visible'],
    ['Reactivite Systeme', 'Bascule OS clair vers sombre', 'Interface bascule sans rechargement'],
]


PROBLEM_ROWS = [
    ['Chevauchement sidebar/contenu sur desktop',
     'Sidebar fixed sans marge gauche sur le wrapper',
     'Ajout lg:ml-64 sur le conteneur flex principal'],
    ['Flash blanc au chargement en mode sombre',
     'Classe .dark appliquee apres l hydratation React',
     'Script inline synchrone dans <head> avant tout rendu'],
    ['Avertissement React hydration mismatch',
     'Mutation du <html> par le script avant rendu',
     'Ajout suppressHydrationWarning sur la balise html'],
    ['Lien client_fetch_error sur le toggle',
     'useTheme appele hors du provider',
     'Wrapper ThemeProvider dans app/providers.tsx'],
    ['Tailwind v4 et dark mode par classe',
     'Par defaut Tailwind v4 utilise prefers-color-scheme',
     '@custom-variant dark (&:where(.dark, .dark *)) dans globals.css'],
]


LOCAL_UPDATE_STEPS = [
    'Recuperer la branche : git fetch origin puis git checkout phase-12-ui-theme-dashboard.',
    'Installer les dependances : npm install.',
    'Demarrer l infrastructure : npm run dev:infra.',
    'Demarrer le frontend et les microservices : npm run dev:full.',
    'Ouvrir http://localhost:3000/dashboard et tester le toggle dans la navbar.',
]


CLONE_STEPS = [
    'Cloner le depot puis se placer dans tp_twm.',
    'Checkout la branche phase-12-ui-theme-dashboard.',
    'Installer les dependances racine et services.',
    'Generer les Prisma clients.',
    'Demarrer l infra puis l ensemble des services.',
    'Verifier les pages cles : /, /catalogue, /dashboard, /dashboard/settings.',
]


doc = Document()


def setup_styles() -> None:
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(11)
    style.paragraph_format.space_after = Pt(6)

    for level in range(1, 4):
        heading = doc.styles[f'Heading {level}']
        heading.font.name = 'Calibri'
        heading.font.color.rgb = RGBColor(0x1A, 0x56, 0xDB)


def add_title_page() -> None:
    for _ in range(5):
        doc.add_paragraph()

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run('Rapport de Projet - Phase 12')
    run.bold = True
    run.font.size = Pt(26)
    run.font.color.rgb = RGBColor(0x1A, 0x56, 0xDB)

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub = subtitle.add_run(
        'Theme utilisateur, dashboard analytics et audit de coherence UI'
    )
    sub.font.size = Pt(15)
    sub.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

    doc.add_paragraph()

    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta.add_run('Projet : ').bold = True
    meta.add_run('tp_twm | SFMC Benin | Groupe 5\n')
    meta.add_run('Depot GitHub : ').bold = True
    meta.add_run('github.com/Adinette/tp_twm\n')
    meta.add_run('Branche active : ').bold = True
    meta.add_run(f'{PHASE12_BRANCH}\n')
    meta.add_run('Base technique : ').bold = True
    meta.add_run(f'{PHASE12_BASE}\n')
    meta.add_run('Date : ').bold = True
    meta.add_run(datetime.now().strftime('%d/%m/%Y'))

    doc.add_page_break()


def add_table(headers: list[str], rows: list[list[str]]) -> None:
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Light Grid Accent 1'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    for index, header in enumerate(headers):
        cell = table.rows[0].cells[index]
        cell.text = header
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.bold = True
                run.font.size = Pt(10)

    for row_index, row in enumerate(rows, start=1):
        for col_index, value in enumerate(row):
            table.rows[row_index].cells[col_index].text = value


def add_bullet(text: str) -> None:
    doc.add_paragraph(text, style='List Bullet')


def add_code(text: str) -> None:
    paragraph = doc.add_paragraph()
    run = paragraph.add_run(text)
    run.font.name = 'Consolas'
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(0x2D, 0x2D, 0x2D)


def build_document() -> None:
    doc.add_heading('Table des matieres', level=1)
    toc_items = [
        '1. Objectif de la phase 12',
        '2. Ce qui change par rapport a la phase 11',
        '3. Ce qui a ete livre',
        '4. Fichiers livres',
        '5. Audit de coherence UI',
        '6. Validation effectuee',
        '7. Problemes rencontres et solutions',
        '8. Parametrage et mode operatoire',
        '9. Suite recommandee',
    ]
    for item in toc_items:
        doc.add_paragraph(item)

    doc.add_page_break()

    # 1. Objectif
    doc.add_heading('1. Objectif de la phase 12', level=1)
    doc.add_paragraph(
        'La phase 12 apporte une refonte UI ciblee du portail SFMC Benin. '
        'Trois axes : permettre a l utilisateur de choisir son theme '
        '(clair, sombre, systeme), transformer le tableau de bord en page '
        'd analyse avec graphes et indicateurs, et restaurer dans le menu '
        'l acces direct au monitoring des microservices.'
    )
    add_bullet('Donner le controle du theme a l utilisateur final, sans rechargement.')
    add_bullet('Rendre le dashboard exploitable pour la prise de decision.')
    add_bullet('Standardiser la coherence visuelle (palette, dark mode, responsivite).')
    add_bullet('Remettre le suivi infrastructure dans le menu de navigation.')

    # 2. Comparaison
    doc.add_paragraph()
    doc.add_heading('2. Ce qui change par rapport a la phase 11', level=1)
    add_table(
        ['Sujet', 'Phase 11', 'Phase 12'],
        [
            ['Perimetre principal',
             'Fiabilite Inventory et flux event-driven',
             'Refonte UI : theme, dashboard analytics, audit'],
            ['Theme',
             'Suivi automatique du systeme via media query',
             'Choix utilisateur explicite + persistance localStorage'],
            ['Tableau de bord',
             'Page d accueil avec liens d acces rapide',
             'Stats consolidees, histogramme, camembert, recents'],
            ['Menu lateral',
             'Pas d acces direct aux microservices',
             'Section Systeme avec entree Microservices'],
            ['Graphes',
             'Aucun',
             'Histogramme + camembert en SVG natif'],
            ['Dependances ajoutees',
             'Aucune',
             'Aucune (pas de chart.js, pas de recharts)'],
        ],
    )

    doc.add_paragraph('Indicateurs quantifies de la phase 12 :')
    add_table(['Indicateur', 'Valeur'], PHASE12_KPIS)

    # 3. Livraison
    doc.add_paragraph()
    doc.add_heading('3. Ce qui a ete livre', level=1)

    doc.add_heading('3.1 Theme utilisateur (light / dark / system)', level=2)
    for item in THEME_FEATURES:
        add_bullet(item)
    doc.add_paragraph('Bascule Tailwind v4 vers le mode classe :')
    add_code(
        '/* app/globals.css */\n'
        '@custom-variant dark (&:where(.dark, .dark *));\n\n'
        '.dark {\n'
        '  --background: #09090B;       /* zinc-950 */\n'
        '  --foreground: #FAFAFA;       /* zinc-50 */\n'
        '  --surface: #18181B;          /* zinc-900 */\n'
        '  --surface-muted: #27272A;    /* zinc-800 */\n'
        '}'
    )
    doc.add_paragraph('Script anti-FOUC inline dans <head> :')
    add_code(
        '(function(){\n'
        "  try {\n"
        "    var s = localStorage.getItem('theme');\n"
        "    var t = (s==='dark'||s==='light'||s==='system') ? s : 'system';\n"
        "    var d = t==='dark' ||\n"
        "      (t==='system' && window.matchMedia('(prefers-color-scheme: dark)').matches);\n"
        "    if (d) document.documentElement.classList.add('dark');\n"
        '  } catch(e) {}\n'
        '})();'
    )

    doc.add_heading('3.2 Tableau de bord analytics', level=2)
    for item in DASHBOARD_FEATURES:
        add_bullet(item)
    doc.add_paragraph('Sources de donnees consommees :')
    add_code(
        'GET /api/reporting/dashboard   -> KPIs et listes recentes\n'
        'GET /api/kong-status            -> statut Kong + RabbitMQ\n'
        'GET /api/services-status        -> statut individuel des microservices'
    )

    doc.add_heading('3.3 Page Parametres refondue', level=2)
    add_table(
        ['Section', 'Contenu', 'Detail'],
        SETTINGS_SECTIONS,
    )

    doc.add_heading('3.4 Sidebar et menu Microservices', level=2)
    for item in SIDEBAR_CHANGES:
        add_bullet(item)

    # 4. Fichiers
    doc.add_paragraph()
    doc.add_heading('4. Fichiers livres', level=1)
    add_table(['Fichier', 'Type', 'Apport'], PHASE12_DELIVERABLES)

    # 5. Audit
    doc.add_paragraph()
    doc.add_heading('5. Audit de coherence UI', level=1)
    doc.add_paragraph(
        'Une passe systematique a ete realisee sur l ensemble des pages du portail '
        'pour detecter les incoherences de palette, les manques de variantes dark '
        'et les bugs responsives. Les principaux ecarts trouves et corriges :'
    )
    add_table(['Anomalie', 'Diagnostic', 'Correction'], AUDIT_ROWS)

    # 6. Validation
    doc.add_paragraph()
    doc.add_heading('6. Validation effectuee', level=1)
    add_table(['Controle', 'Execution', 'Resultat'], VALIDATION_ROWS)

    doc.add_paragraph('Commandes representatives utilisees pendant la verification :')
    add_code(
        'npm run dev\n'
        'Invoke-WebRequest -Uri http://localhost:3000/dashboard -UseBasicParsing\n'
        'Invoke-WebRequest -Uri http://localhost:3000/dashboard/settings -UseBasicParsing'
    )

    # 7. Problemes
    doc.add_paragraph()
    doc.add_heading('7. Problemes rencontres et solutions', level=1)
    add_table(['Incident', 'Cause', 'Resolution'], PROBLEM_ROWS)

    # 8. Mode operatoire
    doc.add_paragraph()
    doc.add_heading('8. Parametrage et mode operatoire', level=1)

    doc.add_heading('8.1 Si le projet est deja present en local', level=2)
    for item in LOCAL_UPDATE_STEPS:
        add_bullet(item)
    doc.add_paragraph('Commandes de base :')
    add_code(
        'git fetch origin\n'
        'git checkout phase-12-ui-theme-dashboard\n'
        'npm install\n'
        'npm run dev:infra\n'
        'npm run dev:full'
    )

    doc.add_heading('8.2 Si le projet est un nouveau clone', level=2)
    for item in CLONE_STEPS:
        add_bullet(item)
    doc.add_paragraph('Commandes de base :')
    add_code(
        'git clone https://github.com/Adinette/tp_twm.git\n'
        'cd tp_twm\n'
        'git checkout phase-12-ui-theme-dashboard\n'
        'npm install\n'
        'npm run dev:infra\n'
        'npm run dev:full'
    )

    doc.add_heading('8.3 Verifications apres demarrage', level=2)
    add_bullet('Ouvrir http://localhost:3000 et basculer le theme depuis la navbar.')
    add_bullet('Ouvrir /dashboard et verifier l affichage des graphes (histogramme et camembert).')
    add_bullet('Ouvrir /dashboard/settings et tester les trois modes (Clair, Sombre, Systeme).')
    add_bullet('Ouvrir /dashboard/services et confirmer la disponibilite Kong, RabbitMQ et microservices.')
    add_bullet('Verifier la persistance du choix : recharger la page, le theme reste applique.')

    # 9. Suite
    doc.add_paragraph()
    doc.add_heading('9. Suite recommandee', level=1)
    add_bullet('Internationalisation des libelles (FR/EN) sur le selecteur de theme et le dashboard.')
    add_bullet('Ajout de filtres temporels sur le dashboard (jour / semaine / mois).')
    add_bullet('Sauvegarde du theme cote serveur dans le profil utilisateur (table users).')
    add_bullet('Tests Playwright pour la persistance du theme et le rendu des graphes.')
    add_bullet('Extension des graphes : courbe d evolution des commandes, repartition stock par entrepot.')
    add_bullet('Mode haute densite pour le dashboard (compact / detaille).')

    # Conclusion
    doc.add_paragraph()
    doc.add_heading('Conclusion', level=1)
    doc.add_paragraph(
        'La phase 12 livre une experience utilisateur plus riche et plus controlee : '
        'le portail respecte le choix de theme de chacun, le tableau de bord donne '
        'enfin une vue exploitable des donnees consolidees, et la coherence visuelle '
        'globale a ete restauree. Aucune dependance n a ete ajoutee : tous les graphes '
        'et le moteur de theme sont implementes en code natif React + SVG, ce qui '
        'preserve la legerete du bundle et la maintenabilite du projet.'
    )


def main() -> None:
    setup_styles()
    add_title_page()
    build_document()
    doc.save(OUTPUT)
    print(f'Rapport genere : {OUTPUT}')


if __name__ == '__main__':
    main()
