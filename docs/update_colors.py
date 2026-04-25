"""
Migration de palette : Ochre Industriel → Bleu Ardoise (SFMC Bénin)
Dashboard target: sky-500/blue-600/slate-900
"""
from pathlib import Path
import re

ROOT = Path(__file__).parent.parent

# ────────────────────────────────────────────────────────────────────────────
# Mapping de couleurs  (ordre : du plus spécifique au moins spécifique)
# ────────────────────────────────────────────────────────────────────────────
REPLACEMENTS = [
    # ─── Fonds / backgrounds ───────────────────────────────────────────────
    # Fond chaud presque blanc → slate-50
    ("#FFFBF5",                "rgba(255,251,245,", "#F8FAFC",                "rgba(248,250,252,"),
    # ─── Surfaces sombres ───────────────────────────────────────────────────
    # #1C1917 (warm-black) → #0F172A (slate-900)
    ("#1C1917",                "rgba(28,25,23,",    "#0F172A",                "rgba(15,23,42,"),
    # #292524 (warm-dark)  → #1E293B (slate-800)
    ("#292524",                None,                 "#1E293B",                None),
    # ─── Muted textes ───────────────────────────────────────────────────────
    ("#78716C",                None,                 "#64748B",                None),  # slate-500
    ("#57534E",                None,                 "#475569",                None),  # slate-600
    ("#44403C",                None,                 "#334155",                None),  # slate-700
    ("#A8A29E",                None,                 "#94A3B8",                None),  # slate-400
    # ─── Accent principal ambre → bleu ──────────────────────────────────────
    # D97706 (amber-600) → 2563EB (blue-600)
    ("#D97706",                "rgba(217, 119, 6,", "#2563EB",                "rgba(37, 99, 235,"),
    # F59E0B (amber-400) → 3B82F6 (blue-500)
    ("#F59E0B",                "rgba(245,158,11,",  "#3B82F6",                "rgba(59,130,246,"),
    # 92400E (amber-900 foncé) → 1D4ED8 (blue-700)
    ("#92400E",                "rgba(146,64,14,",   "#1D4ED8",                "rgba(29,78,216,"),
    # ─── Surfaces légères ambre → bleu ─────────────────────────────────────
    ("#FEF3C7",                None,                 "#EFF6FF",                None),  # blue-50
    ("#FCD34D",                None,                 "#93C5FD",                None),  # blue-300
    ("#FBBF24",                None,                 "#60A5FA",                None),  # blue-400
]

# Variantes compact (sans espace après virgule)
RGBA_COMPACT = [
    ("rgba(217, 119, 6,", "rgba(37, 99, 235,"),
    ("rgba(217,119,6,",   "rgba(37,99,235,"),
    ("rgba(245,158,11,",  "rgba(59,130,246,"),
    ("rgba(146,64,14,",   "rgba(29,78,216,"),
    ("rgba(28,25,23,",    "rgba(15,23,42,"),
    ("rgba(255,251,245,", "rgba(248,250,252,"),
]

# ────────────────────────────────────────────────────────────────────────────
# Fichiers à traiter
# ────────────────────────────────────────────────────────────────────────────
FILES = [
    ROOT / "app" / "globals.css",
    ROOT / "app" / "page.tsx",
    ROOT / "app" / "catalogue" / "page.tsx",
    ROOT / "app" / "components" / "Navbar.tsx",
    ROOT / "app" / "components" / "Footer.tsx",
    ROOT / "app" / "front" / "auth" / "login" / "page.tsx",
]


def migrate_file(path: Path) -> int:
    if not path.exists():
        print(f"  [SKIP] {path.name} — fichier introuvable")
        return 0

    text = path.read_text(encoding="utf-8")
    original = text
    total = 0

    # Appliquer les remplacements hex (case-insensitive pour les hex)
    for row in REPLACEMENTS:
        old_hex, old_rgba, new_hex, new_rgba = row

        # Hex (les deux casses)
        n_before = text.count(old_hex) + text.count(old_hex.lower())
        text = text.replace(old_hex, new_hex)
        text = text.replace(old_hex.lower(), new_hex)
        n_after = text.count(old_hex) + text.count(old_hex.lower())
        count = n_before - n_after
        if count > 0:
            total += count

        # rgba si fourni
        if old_rgba and new_rgba:
            n = text.count(old_rgba)
            text = text.replace(old_rgba, new_rgba)
            total += n

    # Variantes rgba compactes supplémentaires
    for old_r, new_r in RGBA_COMPACT:
        n = text.count(old_r)
        text = text.replace(old_r, new_r)
        total += n

    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"  [OK] {path.name} — {total} remplacements")
    else:
        print(f"  [—]  {path.name} — aucune modification")

    return total


# ─── Corrections spécifiques dans globals.css ────────────────────────────────
def patch_globals_css():
    p = ROOT / "app" / "globals.css"
    if not p.exists():
        return
    text = p.read_text(encoding="utf-8")

    # Renommer le commentaire de palette
    text = text.replace(
        "/* ─── Palette Ochre Industriel SFMC Bénin ─── */",
        "/* ─── Palette Bleu Ardoise SFMC Bénin (dashboard-aligned) ─── */"
    )
    # Mettre à jour la variable CSS --accent-gold → --accent-sky
    text = text.replace(
        "  --accent-gold: #3B82F6;",
        "  --accent-sky: #0EA5E9;"
    )
    # Renommer les commentaires des boutons
    text = text.replace(
        "/* Bouton primaire ambre */",
        "/* Bouton primaire bleu */"
    )
    text = text.replace(
        "/* Bouton outline ambre */",
        "/* Bouton outline bleu */"
    )
    # Mettre à jour la variable --surface-muted si elle manque
    if "--surface-muted: #EFF6FF;" in text:
        pass  # déjà correct
    elif "--surface-muted:" in text:
        text = re.sub(r"--surface-muted:\s*#[0-9A-Fa-f]{6};", "--surface-muted: #EFF6FF;", text)

    p.write_text(text, encoding="utf-8")
    print("  [patch] globals.css — noms de commentaires mis à jour")


# ─── Corrections spécifiques pour la page login ──────────────────────────────
def patch_login():
    p = ROOT / "app" / "front" / "auth" / "login" / "page.tsx"
    if not p.exists():
        return
    text = p.read_text(encoding="utf-8")

    # Le message sessionReason utilise amber-100/amber-800 en classes Tailwind
    text = text.replace("bg-amber-100 text-amber-800", "bg-blue-100 text-blue-800")
    # Conserver bg-green et bg-red (succès / erreur)

    p.write_text(text, encoding="utf-8")
    print("  [patch] login/page.tsx — classes Tailwind amber → blue")


# ─── Corrections spécifiques pour la page principale (ticker + sections) ─────
def patch_page():
    p = ROOT / "app" / "page.tsx"
    if not p.exists():
        return
    text = p.read_text(encoding="utf-8")

    # Ticker fond qui peut être inline
    # Fond du ticker  '#D97706' → déjà traité par le remplacement global
    # Fond du featured product (#0F172A, #1E293B) → OK car on garde ces valeurs

    # Classe Tailwind amber dans le JSX (au cas où)
    text = text.replace("bg-amber-400", "bg-blue-400")
    text = text.replace("bg-amber-500", "bg-blue-500")
    text = text.replace("bg-amber-600", "bg-blue-600")
    text = text.replace("text-amber-400", "text-blue-400")
    text = text.replace("text-amber-500", "text-blue-500")
    text = text.replace("text-amber-600", "text-blue-600")
    text = text.replace("text-amber-700", "text-blue-700")
    text = text.replace("text-amber-800", "text-blue-800")
    text = text.replace("border-amber-400", "border-blue-400")
    text = text.replace("border-amber-500", "border-blue-500")
    text = text.replace("border-amber-600", "border-blue-600")
    text = text.replace("ring-amber-400", "ring-blue-400")
    text = text.replace("ring-amber-500", "ring-blue-500")
    text = text.replace("from-amber-", "from-blue-")
    text = text.replace("to-amber-", "to-blue-")
    text = text.replace("via-amber-", "via-blue-")

    p.write_text(text, encoding="utf-8")
    print("  [patch] page.tsx — classes Tailwind amber → blue")


# ─── Corrections spécifiques catalogue ───────────────────────────────────────
def patch_catalogue():
    p = ROOT / "app" / "catalogue" / "page.tsx"
    if not p.exists():
        return
    text = p.read_text(encoding="utf-8")

    # Classes Tailwind amber dans le catalogue
    for old, new in [
        ("bg-amber-400", "bg-blue-400"),
        ("bg-amber-500", "bg-blue-500"),
        ("bg-amber-600", "bg-blue-600"),
        ("bg-amber-50",  "bg-blue-50"),
        ("bg-amber-100", "bg-blue-100"),
        ("text-amber-600", "text-blue-600"),
        ("text-amber-700", "text-blue-700"),
        ("text-amber-800", "text-blue-800"),
        ("border-amber-200", "border-blue-200"),
        ("border-amber-300", "border-blue-300"),
        ("border-amber-500", "border-blue-500"),
        ("hover:text-amber-", "hover:text-blue-"),
        ("hover:bg-amber-",   "hover:bg-blue-"),
    ]:
        text = text.replace(old, new)

    p.write_text(text, encoding="utf-8")
    print("  [patch] catalogue/page.tsx — classes Tailwind amber → blue")


# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("Migration palette Ochre → Bleu Ardoise")
    print("=" * 60)

    grand_total = 0
    for f in FILES:
        grand_total += migrate_file(f)

    patch_globals_css()
    patch_login()
    patch_page()
    patch_catalogue()

    print("=" * 60)
    print(f"Total remplacements hex/rgba : {grand_total}")
    print("Vérifiez avec : npm run build")
    print("=" * 60)
