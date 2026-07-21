# DESIGN SYSTEM REPORT

**Date:** 2026-06-09  
**Status:** ✅ COMPLETE

---

## Overview

CareNexus uses a unified design system based on:
- **shadcn/ui** component library (Radix primitives + Tailwind)
- **CSS custom properties** for theming
- **Inter font** from Google Fonts
- **CareNexus Blue** as primary brand color

---

## Color Palette

### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| CareNexus Blue Dark | `#003f9e` | Gradient start, dark buttons |
| CareNexus Blue | `#0066ff` | Gradient end, primary |
| CareNexus Blue Light | `#60a5fa` | Light accents on dark bg |

### Semantic Tokens (CSS Variables)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `0 0% 100%` | `222.2 84% 4.9%` | Page background |
| `--card` | `0 0% 100%` | `222.2 84% 4.9%` | Card background |
| `--foreground` | `222.2 84% 4.9%` | `210 40% 98%` | Primary text |
| `--muted` | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Muted fills |
| `--muted-foreground` | `215.4 16.3% 46.9%` | `215 20.2% 65.1%` | Secondary text |
| `--primary` | `213 100% 31%` | `213 100% 61%` | CareNexus Blue |
| `--border` | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` | Borders |

### Status Colors
| Status | Color |
|--------|-------|
| Active / Success | Emerald (`#10b981`) |
| Warning / Scheduled | Amber (`#f59e0b`) |
| Error / Destructive | Red (`#ef4444`) |
| Inactive / Cancelled | Slate (`#64748b`) |
| Info / Primary | Blue (`#3b82f6`) |
| PSI / Mental Health | Purple (`#8b5cf6`) |

---

## Typography

| Element | Style |
|---------|-------|
| Font family | Inter (Google Fonts) |
| Page headings (`h1`) | `text-2xl md:text-3xl font-bold tracking-tight` |
| Card titles | `text-lg font-semibold` |
| Body text | `text-sm text-foreground` |
| Muted labels | `text-xs text-muted-foreground` |
| Column headers | `text-xs font-semibold uppercase tracking-wide` |
| Monospace (NHS#) | `font-mono` |

---

## Component Variants

### Buttons
| Variant | Usage |
|---------|-------|
| `default` | Primary CTA actions |
| `outline` | Secondary/cancel |
| `ghost` | Icon buttons, nav items |
| `destructive` | Delete/dangerous actions |

### Badges
| Variant | Usage |
|---------|-------|
| `default` | Active/primary states |
| `secondary` | Neutral counts |
| `outline` | Status indicators (with custom colors) |
| `destructive` | Error states |

### Cards
All cards use:
- `bg-card border border-border rounded-xl shadow-sm`
- Hover state: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`

---

## Spacing Scale
- Page content: `p-8` (32px)
- Card content: `px-5 py-4` or `p-6`
- Form fields: `space-y-4`
- Section gaps: `space-y-6`
- Inline gaps: `gap-3`

---

## Animation
| Animation | Class | Usage |
|-----------|-------|-------|
| Spin | `animate-spin` | Loaders |
| Pulse | `animate-pulse` | Live indicators |
| Hover lift | `hover:-translate-y-0.5` | Cards |
| Hover scale | `group-hover:scale-110` | Feature icons |
| Color transition | `transition-colors` | Buttons, badges |
| All | `transition-all duration-200` | Cards |

---

## Logo System

The CareNexus logo is a medical cross (plus symbol) in white on a blue gradient background:

```svg
<svg viewBox="0 0 32 32">
  <rect x="13" y="4" width="6" height="24" rx="2" fill="white" />
  <rect x="4" y="13" width="24" height="6" rx="2" fill="white" />
</svg>
```

Background: `linear-gradient(135deg, #003f9e 0%, #0066ff 100%)`

Used at sizes: `w-8 h-8` (sidebar), `w-10 h-10` (auth), `w-16 h-16` (landing hero)
