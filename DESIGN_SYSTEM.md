# CareNexus Design System

This document outlines the core design tokens, typography, and color palettes used across the CareNexus multi-tenant healthcare platform.

## 1. Typography

**Primary Font (UI & Body):** `Inter`  
**Secondary Font (Headings):** `Plus Jakarta Sans`

- **Display**: Plus Jakarta Sans, Extra Bold, tightly tracked
- **H1**: Plus Jakarta Sans, Bold
- **H2-H4**: Plus Jakarta Sans, SemiBold
- **Body**: Inter, Regular / Medium
- **Labels / Captions**: Inter, SemiBold, uppercase, widely tracked

## 2. Color Palette (Light Mode)

- **Primary**: `#005EB8` (NHS Blue - Trust, Security)
- **Secondary**: `#0891B2` (Deep Cyan - Modern Medical)
- **Accent**: `#3B82F6` (Vibrant Blue - Interactive Elements)
- **Success**: `#10B981` (Emerald - Positive Outcomes)
- **Warning**: `#F59E0B` (Amber - Alerts)
- **Danger**: `#EF4444` (Red - Destructive Actions)
- **Background**: `#F8FAFC` (Slate 50 - Premium Clean Workspace)
- **Surface/Cards**: `#FFFFFF` (Crisp White)

## 3. Shadows & Depth

CareNexus uses soft, modern SaaS shadows to elevate interactive elements without overwhelming the user.
- **Card Shadow**: `shadow-xl shadow-slate-200/50`
- **Button Hover**: Soft glow matching the button color (e.g., `shadow-lg shadow-[#005EB8]/25`)
- **Glassmorphism**: Used sparingly for overlays, sidebars, and premium branding panels (`bg-white/80 backdrop-blur-xl`).

## 4. Components

- **Buttons**: Rounded corners (`rounded-xl`), smooth hover states (`hover:-translate-y-0.5`), and clear focus rings.
- **Inputs**: Large touch targets (`h-12`), very subtle border (`border-slate-200`), distinct focus state (`focus-visible:ring-[#005EB8]/20`).
- **Cards**: Large padding (`p-6` to `p-8`), rounded corners (`rounded-2xl`), subtle borders (`border-slate-100`).

## 5. Spacing

Follows standard Tailwind 4pt grid system.
- Ensure liberal use of whitespace to reduce cognitive load on clinical dashboards.
