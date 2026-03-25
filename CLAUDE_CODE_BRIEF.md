# BRIEF D'INTÉGRATION QUINEO — CLAUDE CODE
# Version 1.0 — À lire intégralement avant toute action

---

## 0. CONSIGNE GÉNÉRALE

Lis ce fichier en entier avant de coder quoi que ce soit.
Après lecture, liste tout ce que tu vas créer/modifier, dans l'ordre,
et attends ma validation avant de commencer.

Ne réinvente jamais le design — les mockups font foi.
Ne crée pas de composant UI externe (pas de shadcn, pas de MUI, pas de Radix).
Si tu as un doute sur un composant, demande avant de coder.

---

## 1. STACK TECHNIQUE

- Framework    : Next.js 14+ (App Router)
- Runtime      : Node.js 20 LTS
- Language     : TypeScript strict
- Style        : Tailwind CSS 3 + CSS variables dans globals.css
- Icônes       : @heroicons/react — solid UNIQUEMENT (pas outline)
- Polices      : Poppins (corps) + Bebas Neue (display/chiffres)
- ORM          : Sequelize 6+ + PostgreSQL 16
- Temps réel   : Socket.io 4+
- Auth         : JWT + bcrypt
- Email        : Resend
- PDF          : React-PDF

---

## 2. INSTALLATION DES DÉPENDANCES

```bash
npm install @heroicons/react
npm install @fontsource/poppins
npm install @fontsource/bebas-neue
```

Dans next.config.ts, rien de spécial à ajouter pour les icônes.
Les polices sont chargées via @fontsource dans globals.css.

---

## 3. STRUCTURE DES FICHIERS À CRÉER

```
/quineo
├── /app
│   ├── globals.css                          ← variables CSS + polices
│   ├── layout.tsx                           ← RootLayout
│   ├── /dashboard
│   │   └── page.tsx                         ← Dashboard admin
│   ├── /sessions
│   │   ├── page.tsx                         ← Liste des sessions
│   │   └── /new
│   │       └── page.tsx                     ← Création de session
│   ├── /lots
│   │   └── page.tsx                         ← Lots & tirages
│   ├── /cartons
│   │   └── page.tsx                         ← Gestion des cartons
│   ├── /caisse
│   │   └── page.tsx                         ← Interface caisse animateur
│   ├── /tirage
│   │   └── page.tsx                         ← Écran de tirage (diffusion)
│   └── /s
│       └── /[slug]
│           └── page.tsx                     ← Page publique achat cartons
├── /components
│   ├── /layout
│   │   ├── AppShell.tsx                     ← wrapper sidebar + main
│   │   ├── Sidebar.tsx                      ← navigation latérale
│   │   ├── Topbar.tsx                       ← barre du haut
│   │   └── PageContent.tsx                  ← zone scrollable
│   ├── /ui
│   │   ├── Icon.tsx                         ← wrapper Heroicons solid
│   │   ├── Badge.tsx                        ← badges statuts (quine/actif/etc.)
│   │   ├── Toggle.tsx                       ← switch on/off accessible
│   │   ├── Stepper.tsx                      ← compteur +/- (quantité forfaits)
│   │   ├── ProgressBar.tsx                  ← barre de progression quota
│   │   ├── Card.tsx                         ← carte surface blanche
│   │   ├── Button.tsx                       ← bouton primaire/secondaire/ghost
│   │   ├── Input.tsx                        ← champ texte standardisé
│   │   ├── Select.tsx                       ← select standardisé
│   │   └── Toast.tsx                        ← notification flash
│   ├── /dashboard
│   │   ├── MetricCard.tsx
│   │   ├── SessionTable.tsx
│   │   ├── LotsPanel.tsx
│   │   └── ActivityFeed.tsx
│   ├── /session
│   │   ├── SessionFormTabs.tsx              ← 4 onglets création session
│   │   ├── SessionSummaryPanel.tsx          ← panneau récap collant
│   │   ├── ProviderGrid.tsx                 ← modes de paiement
│   │   ├── RulesTable.tsx                   ← règles ex-aequo
│   │   └── PartnerSlots.tsx                 ← logos partenaires
│   ├── /tirage
│   │   ├── HeroBall.tsx                     ← boule héro animée
│   │   ├── Grid90.tsx                       ← tableau 1-90
│   │   ├── HistoryBalls.tsx                 ← derniers numéros
│   │   ├── LotPanel.tsx                     ← lot en jeu
│   │   ├── WinnerOverlay.tsx                ← overlay gagnant
│   │   └── ThemeToggle.tsx                  ← switch jour/nuit
│   ├── /caisse
│   │   ├── ParticipantSearch.tsx
│   │   ├── ForfaitList.tsx
│   │   ├── QuotaBar.tsx
│   │   ├── PaymentMode.tsx
│   │   └── SuccessModal.tsx
│   └── /public
│       ├── SessionFinder.tsx                ← recherche par code
│       ├── PackGrid.tsx                     ← grille forfaits
│       └── CheckoutSummary.tsx
└── /lib
    ├── tokens.ts                            ← export des design tokens
    └── cn.ts                                ← helper classNames
```

---

## 4. FICHIERS CSS — globals.css (COMPLET)

```css
/* globals.css */

@import '@fontsource/poppins/400.css';
@import '@fontsource/poppins/700.css';
@import '@fontsource/bebas-neue/400.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* ── COULEURS QUINEO ── */
  --color-navy:           #0b1220;
  --color-navy-light:     #111c31;
  --color-navy-mid:       #1a2e4a;
  --color-navy-deep:      #0d1929;

  --color-bg:             #f4f5f9;
  --color-card:           #ffffff;

  --color-amber:          #EF9F27;
  --color-amber-dark:     #2C1500;
  --color-amber-deep:     #633806;
  --color-amber-bg:       #FFF8EE;
  --color-amber-border:   rgba(239,159,39,.3);

  --color-blue:           #185FA5;
  --color-blue-light:     #378ADD;
  --color-blue-bg:        #EEF4FC;
  --color-blue-text:      #0C447C;
  --color-blue-border:    rgba(24,95,165,.2);

  --color-green:          #3B6D11;
  --color-green-mid:      #639922;
  --color-green-bg:       #EAF3DE;
  --color-green-text:     #27500A;
  --color-green-live:     #48BB78;

  --color-red:            #A32D2D;
  --color-red-bg:         #FCEBEB;
  --color-red-text:       #501313;

  --color-orange:         #854F0B;
  --color-orange-bg:      #FAEEDA;

  --color-purple:         #534AB7;
  --color-purple-bg:      #EEEDFE;
  --color-purple-text:    #26215C;

  /* ── TEXTE ── */
  --color-text-primary:   #0b1220;
  --color-text-secondary: #4a5568;
  --color-text-muted:     #8a95a3;
  --color-text-hint:      #b0bcc8;

  /* ── BORDURES ── */
  --color-border:         rgba(0,0,0,.09);
  --color-border-light:   rgba(0,0,0,.06);
  --color-sep:            rgba(0,0,0,.06);

  /* ── TYPOGRAPHIE ── */
  --font-body:            'Poppins', 'Segoe UI', sans-serif;
  --font-display:         'Bebas Neue', sans-serif;

  /* ── LAYOUT ── */
  --sidebar-width:        180px;
  --topbar-height:        49px;
  --radius-sm:            6px;
  --radius-md:            8px;
  --radius-lg:            12px;
  --radius-xl:            14px;

  /* ── ANIMATIONS ── */
  --transition-fast:      150ms ease;
  --transition-base:      200ms ease;
}

/* MODE SOMBRE — écran de tirage uniquement */
[data-theme="dark"] {
  --color-bg:             #0b1220;
  --color-card:           #111c31;
  --color-border:         rgba(255,255,255,.07);
  --color-border-light:   rgba(255,255,255,.05);
  --color-sep:            rgba(255,255,255,.05);
  --color-text-primary:   #ffffff;
  --color-text-secondary: rgba(255,255,255,.7);
  --color-text-muted:     rgba(255,255,255,.4);
  --color-text-hint:      rgba(255,255,255,.2);
}

/* ── BASE ── */
* { box-sizing: border-box; }

body {
  font-family: var(--font-body);
  color: var(--color-text-primary);
  background: var(--color-bg);
}

/* ── UTILITAIRES CSS CUSTOM ── */
.font-display { font-family: var(--font-display); }
.font-body    { font-family: var(--font-body); }
```

---

## 5. TAILWIND CONFIG (tailwind.config.ts)

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#0b1220', light: '#111c31', mid: '#1a2e4a' },
        amber:  { DEFAULT: '#EF9F27', dark: '#2C1500', bg: '#FFF8EE' },
        qblue:  { DEFAULT: '#185FA5', bg: '#EEF4FC', text: '#0C447C' },
        qgreen: { DEFAULT: '#3B6D11', bg: '#EAF3DE', text: '#27500A' },
        qred:   { DEFAULT: '#A32D2D', bg: '#FCEBEB' },
        bg:     '#f4f5f9',
      },
      fontFamily: {
        body:    ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      width: {
        sidebar: 'var(--sidebar-width)',
      },
      height: {
        topbar: 'var(--topbar-height)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      transitionDuration: {
        fast: '150ms',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 6. COMPOSANT ICÔNES — Icon.tsx

```tsx
// components/ui/Icon.tsx
// Wrapper unique pour Heroicons solid — ne jamais importer heroicons directement ailleurs

import { type ComponentType, type SVGProps } from 'react'

type HeroIconComponent = ComponentType<SVGProps<SVGSVGElement> & { title?: string }>

interface IconProps {
  icon: HeroIconComponent
  size?: number
  className?: string
  label?: string        // aria-label pour accessibilité
  decorative?: boolean  // true = aria-hidden, pas de label requis
}

export function Icon({
  icon: IconComponent,
  size = 16,
  className = '',
  label,
  decorative = false,
}: IconProps) {
  return (
    <IconComponent
      style={{ width: size, height: size, flexShrink: 0 }}
      className={className}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={!decorative ? label : undefined}
      role={!decorative ? 'img' : undefined}
    />
  )
}
```

**Règles d'usage des icônes :**
- Toujours `@heroicons/react/24/solid` — jamais outline
- Taille sidebar : `size={14}`
- Taille actions/boutons : `size={16}`
- Taille hero/grande : `size={20}` ou `size={24}`
- Icône seule (sans texte) : fournir `label="Description de l'action"`
- Icône décorative (texte à côté) : `decorative={true}`
- Ne JAMAIS laisser une icône sans attribut aria

---

## 7. LAYOUT — AppShell.tsx

```tsx
// components/layout/AppShell.tsx
// Layout principal : sidebar fixe + zone main scrollable

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  )
}
```

**Règles layout :**
- `AppShell` = wrapper racine de toutes les pages admin/animateur
- `Sidebar` = `w-[180px]` fixe, `flex-shrink-0`, `h-screen`, `overflow-y-auto`
- `Topbar` = `h-[49px]` fixe, `flex-shrink-0`
- `PageContent` = `flex-1`, `overflow-y-auto`, `min-h-0`
- Jamais de `position: fixed` dans les composants — tout est en flow normal
- La page publique `/s/[slug]` n'utilise PAS AppShell

---

## 8. MOCKUPS DE RÉFÉRENCE

Tous les fichiers sont dans `/mockups/`. Respecte-les pixel pour pixel.

| Fichier mockup                        | Page cible                      | Composants principaux               |
|---------------------------------------|---------------------------------|-------------------------------------|
| quineo_admin_dashboard.html           | /dashboard                      | MetricCard, SessionTable, LotsPanel, ActivityFeed |
| quineo_session_creation.html          | /sessions/new                   | SessionFormTabs (4 onglets), SessionSummaryPanel |
| quineo_lots_tirages_v2.html           | /lots                           | DrawList, ForfaitForm, LotPicker, AutoGenModal |
| quineo_ecran_tirage.html              | /tirage                         | HeroBall, Grid90, HistoryBalls, WinnerOverlay, ThemeToggle |
| quineo_caisse_animateur_v2.html       | /caisse                         | ParticipantSearch, ForfaitList, QuotaBar, PaymentMode |
| quineo_public_achat_v2.html           | /s/[slug]                       | SessionFinder, PackGrid, CheckoutSummary |

**Ordre d'intégration recommandé :**
1. globals.css + tailwind.config → AppShell + Sidebar + Topbar
2. Dashboard (page la plus représentative du design system)
3. Création de session (formulaire complexe avec onglets)
4. Lots & tirages
5. Caisse animateur
6. Écran de tirage (mode dark)
7. Page publique (sans AppShell)

---

## 9. RÈGLES CSS STRICTES

```
✅ Couleurs   → toujours via var(--color-*) ou classes Tailwind étendues
✅ Layout     → Tailwind utilitaires (flex, grid, gap, p, m, w, h)
✅ Typo       → var(--font-display) pour Bebas Neue, var(--font-body) pour Poppins
✅ Borders    → toujours .5px solid var(--color-border) — jamais border-gray-200
✅ Radius     → var(--radius-md) pour éléments, var(--radius-lg) pour cartes
✅ Transition → var(--transition-fast) ou var(--transition-base)

❌ Jamais de couleur hardcodée dans un composant (#333, rgb(...))
❌ Jamais de tailwind couleur standard (bg-gray-100, text-gray-700)
   → utiliser les couleurs étendues (bg-bg, text-navy, etc.)
❌ Jamais d'outline icons heroicons
❌ Jamais de margin arbitraire hors du composant (pas de mt-8 sur un Card)
❌ Jamais de position:fixed
```

---

## 10. ACCESSIBILITÉ — RÈGLES OBLIGATOIRES

Ces règles sont non-négociables — Quineo est utilisé par des associations
avec des participants malvoyants.

```
✅ Icônes seules    → aria-label obligatoire
✅ Icônes décoratives → aria-hidden="true"
✅ Boutons          → texte visible OU aria-label si icône seule
✅ Badges statuts   → ne pas reposer uniquement sur la couleur
                      → toujours un texte lisible (ex: "Tiré" pas juste un fond amber)
✅ Inputs           → toujours un <label> associé via htmlFor/id
✅ Modales/overlays → focus-trap + Escape pour fermer + aria-modal
✅ Contrastes       → respecter WCAG AA minimum (4.5:1 texte normal, 3:1 grand texte)
✅ Tableau 1-90     → chaque cellule avec aria-label="N tiré" ou "N non tiré"
✅ Écran tirage     → le numéro hero a un aria-live="polite" pour annonce screen reader
✅ Formulaires      → erreurs associées via aria-describedby
```

Pour l'écran de tirage spécifiquement :
```tsx
// Le numéro tiré doit être annoncé aux lecteurs d'écran
<div aria-live="polite" aria-atomic="true" className="sr-only">
  Numéro {currentNumber} tiré
</div>
```

---

## 11. COMPOSANTS UI RÉUTILISABLES — SPEC RAPIDE

### Badge.tsx
```tsx
// Variantes : quine | dquine | carton | active | draft | closed | won | pending
// Toujours avec texte lisible + couleur de fond
<Badge variant="quine">Quine</Badge>
```

### Toggle.tsx
```tsx
// Accessible : role="switch", aria-checked, label associé
<Toggle checked={isActive} onChange={setActive} label="Ventes en ligne" />
```

### Stepper.tsx
```tsx
// Pour les quantités de forfaits et limites
// Boutons − et + avec aria-label explicites
<Stepper value={qty} min={0} max={maxAllowed} onChange={setQty}
         label="Nombre de forfaits" />
```

### QuotaBar.tsx
```tsx
// 3 états visuels ET textuels : ok / warn / block
// Ne jamais indiquer l'état uniquement par la couleur
<QuotaBar used={14} max={30} />
// → affiche "14 / 30 cartons · 16 disponibles" en texte + barre colorée
```

### Button.tsx
```tsx
// Variantes : primary | secondary | ghost | danger
// Toujours un texte visible ou aria-label
// Primary → fond amber, texte navy-dark
// Loading state avec spinner et texte "Chargement…"
```

---

## 12. GESTION DE L'ÉTAT

- **Local** : `useState` / `useReducer` pour les formulaires et UI
- **Serveur** : Server Components Next.js pour les données initiales
- **Temps réel** : Socket.io via un Context `useTirage()` pour l'écran de diffusion
- **Formulaires** : pas de lib externe — state local + validation maison
- **Pas de Redux, pas de Zustand, pas de React Query** en v1

---

## 13. NOMMAGE DES FICHIERS

- Composants    : PascalCase (`SessionFormTabs.tsx`)
- Pages         : `page.tsx` (convention App Router)
- Helpers/lib   : camelCase (`cn.ts`, `tokens.ts`)
- Types         : `types.ts` par domaine (ex: `/types/session.ts`)
- Hooks         : `use` prefix (`useTirage.ts`, `useQuota.ts`)

---

## 14. HELPER cn.ts

```ts
// lib/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Installe : `npm install clsx tailwind-merge`

---

## 15. TYPES PRINCIPAUX

```ts
// types/session.ts
export type SessionStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED'
export type TirageType    = 'QUINE' | 'DOUBLE_QUINE' | 'CARTON_PLEIN'
export type MultiRule     = 'SUDDEN_DEATH' | 'SHARE_LOT' | 'EACH_WINS' | 'REDRAW'
export type PaymentMethod = 'CASH' | 'EXTERNAL_TERMINAL' | 'ONLINE' | 'FREE'
export type LotStatus     = 'PENDING' | 'IN_DRAW' | 'WON' | 'CANCELLED'
export type CartonStatus  = 'AVAILABLE' | 'RESERVED' | 'SOLD'

export interface Session {
  id: string
  name: string
  slug: string
  eventDate: string
  eventTime: string
  venue: string
  maxCartons: number
  status: SessionStatus
  saleEndsAtOnline?: string
  saleEndsAtOnsite?: string
  maxCartonsPerPerson: number
  maxFreeCartons: number
  drawInterval: number         // secondes, défaut 2.2
  multiWinnerRules: {
    quine: MultiRule
    doubleQuine: MultiRule
    cartonPlein: MultiRule
  }
  enabledPaymentMethods: PaymentMethod[]
  primaryColor: string
  secondaryColor: string
}
```

---

## 16. ORDRE D'ACTIONS POUR CLAUDE CODE

1. Lis tous les fichiers du dossier `/mockups/`
2. Lis ce fichier brief.md en entier
3. Liste ce que tu vas créer, dans quel ordre, avec quels composants
4. Attends ma validation
5. Commence par globals.css + tailwind.config (aucun composant avant)
6. Crée AppShell + Sidebar + Topbar (vérifie avec moi avant la suite)
7. Intègre les pages dans l'ordre du tableau section 8
8. Ne passe jamais à la page suivante sans que la précédente soit validée

---

## 17. CE QUE CLAUDE CODE NE DOIT PAS FAIRE

- Inventer des composants non présents dans les mockups
- Utiliser une librairie UI tierce (shadcn, MUI, Radix, Ant Design)
- Utiliser des icônes outline de heroicons
- Hardcoder des couleurs dans les composants
- Créer un design system différent des mockups
- Passer à l'étape suivante sans validation
- Installer des dépendances non listées ici sans demande explicite
- Utiliser `position: fixed`
- Oublier les attributs aria sur les icônes et éléments interactifs
