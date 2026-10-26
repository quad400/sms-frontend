---
name: Academic Companion
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#44474d'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#515f7a'
  primary: '#000412'
  on-primary: '#ffffff'
  primary-container: '#0f1e36'
  on-primary-container: '#7886a3'
  inverse-primary: '#b8c7e6'
  secondary: '#006b54'
  on-secondary: '#ffffff'
  secondary-container: '#93f5d4'
  on-secondary-container: '#00725a'
  tertiary: '#0b0300'
  on-tertiary: '#ffffff'
  tertiary-container: '#321700'
  on-tertiary-container: '#ca6e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#b8c7e6'
  on-primary-fixed: '#0c1b33'
  on-primary-fixed-variant: '#394761'
  secondary-fixed: '#93f5d4'
  secondary-fixed-dim: '#77d8b9'
  on-secondary-fixed: '#002118'
  on-secondary-fixed-variant: '#00513f'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  score-display:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  score-sm:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system establishes a focused, supportive student shell environment (`/student`). It discards both the sterile complexity of enterprise ERPs and the condescending gamification of juvenile software. Instead, it embodies the calm, trustworthy utility of a personal academic ledger. The student experience centers on clarity, self-efficacy, and reduced cognitive load during high-stress academic milestones.

### Design Movement: Modern Tactile Editorial
The interface blends structured Swiss grid alignment with warm, humanist typography and subtle physical cues:
- **Calm Authority**: Grounded in deep navy and rich slate foundations that convey institutional reliability.
- **Supportive Accents**: Crisp emerald/teal accents celebrate achievement and momentum, paired with warm golden tones that guide attention without triggering alarmist reactions.
- **Empathetic & Dignified Feedback**: Sensitive academic states—such as overdue fee balances or withheld term reports—are rendered with quiet institutional dignity rather than punitive warning red. Information remains clear, accessible, and structured for rapid comprehension on handheld devices.

## Colors

The palette establishes high chromatic discipline, achieving WCAG 2.2 AA (minimum 4.5:1 for standard text, 3:1 for large graphical elements and focus indicators).

### Core Palettes & Color Modes

#### Light Mode (Default)
- **Canvas (`surface-ground`)**: `#F8FAFC`
- **Surface Elevation 1 (`surface-card`)**: `#FFFFFF`
- **Surface Elevation 2 (`surface-overlay`)**: `#F1F5F9`
- **Primary / Slate-Navy Foundation**: `#0F1E36` (Headlines, prominent containers, deep navigation elements)
- **Secondary / Academic Emerald**: `#0D8267` (Primary actions, completed milestones, verified presence)
- **Tertiary / Amber-Gold**: `#D97706` (Upcoming deadlines, attention tokens, pending balances)
- **Neutral Primary (`text-primary`)**: `#0F172A`
- **Neutral Muted (`text-secondary`)**: `#475569`
- **Neutral Subtle (`text-tertiary`)**: `#64748B`
- **Border / Outline Subtle**: `#E2E8F0`
- **Border / Outline Emphasized**: `#CBD5E1`

#### Dark Mode
- **Canvas (`surface-ground`)**: `#0B1120`
- **Surface Elevation 1 (`surface-card`)**: `#111C30`
- **Surface Elevation 2 (`surface-overlay`)**: `#1E2C48`
- **Primary Foundation**: `#E2E8F0` (Headings, primary text)
- **Secondary / Academic Emerald**: `#2DD4BF` (Calibrated for dark mode contrast)
- **Tertiary / Amber-Gold**: `#FBBF24` (Calibrated for dark mode contrast)
- **Neutral Primary (`text-primary`)**: `#F8FAFC`
- **Neutral Muted (`text-secondary`)**: `#94A3B8`
- **Neutral Subtle (`text-tertiary`)**: `#64748B`
- **Border / Outline Subtle**: `#1E293B`
- **Border / Outline Emphasized**: `#334155`

### Semantic Academic Status System
Every status state must combine an icon with a color token; color is never the single source of truth.

- **Present**: Emerald `#0D8267` (Dark: `#2DD4BF`), Background `#E6F4F0` (Dark: `#0B2822`), Icon `CheckCircle`
- **Late**: Amber `#B45309` (Dark: `#FBBF24`), Background `#FEF3C7` (Dark: `#2D2106`), Icon `ClockAlert`
- **Excused**: Slate Blue `#3B82F6` (Dark: `#60A5FA`), Background `#EFF6FF` (Dark: `#0C203E`), Icon `ShieldCheck`
- **Absent**: Crimson `#BE123C` (Dark: `#FB7185`), Background `#FFE4E6` (Dark: `#310D15`), Icon `XCircle`

### Sensitive Status Handling
- **Non-Payment & Tuition Hold**: Subdued Charcoal Slate (`#334155` on light, `#3B4252` on dark). Avoid aggressive red warning banners; use neutral status flags paired with a lock indicator and a direct, matter-of-fact path to resolve with student accounts.
- **Withheld Assessment Results**: Muted Indigo-Slate card with diagonal hatching or frosted shield watermark, paired with an `AlertCircle` and neutral guidance text ("Official ledger clearance required to release grade sheet").

## Typography

The type system pairs structural character with legibility:
- **Headings (`Space Grotesk`)**: Provides geometric energy, collegiate confidence, and distinct structural identity without technical sterility.
- **Body & Controls (`Plus Jakarta Sans`)**: Delivers friendly, open-aperture humanist letterforms that remain crisp across small handheld devices and long reading sessions.
- **Numerical Data, Scores, & Timetables (`JetBrains Mono`)**: Strict tabular numerals (`tnum`) ensure academic scores (e.g., `94.5 / 100`), grade points, class periods (e.g., `08:30 — 09:45`), and student ID strings line up with monospaced stability across vertical ledgers.

### Typography Rules
1. All scoreboards, Grade Point Averages (GPA), currency amounts, timetable intervals, and attendance counts must use either `score-display`, `score-sm`, or the `label-mono` token with CSS `font-variant-numeric: tabular-nums`.
2. Do not use uppercase strings longer than 3 words; reserved solely for micro-badges and metadata tags using `label-mono`.
3. Never drop body font size below 12px (`body-xs`) on mobile viewport devices.

## Layout & Spacing

The portal adopts a **Phone-First Adaptive Layout** model:
- **Mobile (< 768px)**: Single-column flow with persistent thumb-accessible bottom app navigation bar. Canvas margins are fixed at `margin` (`1rem`). Grid column count is 4 with `1rem` gutters.
- **Tablet (768px - 1023px)**: 8-column layout with `1.5rem` gutters. Collapsible side navigation rail. Canvas margins expand to `margin-md` (`1.5rem`).
- **Desktop (>= 1024px)**: 12-column layout with fixed left navigation dock (`280px`), maximum content area constrained to `1280px` centered, gutters at `1.5rem`, outer margins at `margin-lg` (`2.5rem`).

### Spacing Cadence
A base unit of `4px / 0.25rem` dictates internal component padding and element separation:
- Dense cards (e.g., timetable chips, attendance markers) use `space-xs` (8px) and `space-sm` (12px).
- Standard card interiors leverage `space-md` (16px) on mobile and scale to `space-lg` (24px) on desktop.
- Structural card separation uses `space-md` (16px) on mobile viewports to preserve screen efficiency, expanding to `space-lg` (24px) on larger displays.

## Elevation & Depth

Visual hierarchy relies on crisp, tonal layering, refined outlines, and subtle ambient shadows:

### Layering Model
1. **Canvas Level (0dp)**: Background foundation (`surface-ground`).
2. **Resting Cards (1dp)**: `surface-card` with an intentional dual treatment:
   - A single-pixel stroke (`border-subtle` in light mode, `border-emphasized` in dark mode).
   - An ambient drop shadow: `0 1px 3px 0 rgba(15, 30, 54, 0.04), 0 1px 2px -1px rgba(15, 30, 54, 0.02)`.
3. **Interactive & Hover Cards (2dp)**:
   - Subtle vertical translation (-1px).
   - Shadow: `0 4px 12px -2px rgba(15, 30, 54, 0.08), 0 2px 6px -1px rgba(15, 30, 54, 0.04)`.
   - Border shift to emerald or primary depending on interaction context.
4. **Modals, Drawers, and Bottom Sheets (3dp)**:
   - Deep diffused shadow: `0 20px 25px -5px rgba(15, 30, 54, 0.15), 0 8px 10px -6px rgba(15, 30, 54, 0.1)`.
   - Backing scrim uses `rgba(15, 23, 42, 0.5)` with `backdrop-filter: blur(4px)`.

## Shapes

The design system employs a roundedness factor of `2` (Moderate Rounded), balancing friendly approachability with structural composure:

- **Base Radius (`rounded-md`, 0.5rem / 8px)**: Inputs, buttons, segmented controls, status tags, table cell clusters.
- **Large Radius (`rounded-lg`, 1rem / 16px)**: Primary cards, grade report groups, schedule tiles, modal dialogs.
- **Extra Large Radius (`rounded-xl`, 1.5rem / 24px)**: Mobile bottom sheets, focal summary widgets, floating action blocks.
- **Full Pill (`rounded-full`)**: Solely utilized for round user avatars, numerical notification badges, and single-indicator state chips.

## Components

### Buttons
- **Primary**: Deep Slate/Navy background with white text, or Emerald Accent background with white text for positive triggers (e.g., "Submit Assignment", "Download Timetable"). Height: `44px` on mobile (touch target), `40px` on desktop. Border radius `8px`. Active state downscaled to `scale(0.98)`.
- **Secondary**: Transparent background, 1.5px solid border in Slate-Navy or subtle border with text matching primary ink.
- **Ghost**: Zero-border, tinted hover state using `surface-overlay`.

### Chips & Status Badges
- Compact padding (`0.25rem 0.625rem`), border radius `8px`.
- Composed of an icon (`14px`), followed by text (`label-mono`, uppercase, letter spacing `0.05em`).
- **Attendance States**:
  - *Present*: Emerald background (12% opacity), emerald text/icon.
  - *Late*: Amber background (12% opacity), amber text/icon.
  - *Absent*: Crimson background (12% opacity), crimson text/icon.
  - *Excused*: Slate Blue background (12% opacity), blue text/icon.

### Inputs & Select Fields
- Label positioned atop input using `label-md`.
- Height: `44px`. Border: 1px solid `border-emphasized`. Background: `surface-card`.
- Focus state: 2px ring in Emerald (`#0D8267`) with zero outline offset.
- Helper text in `body-xs`, switching to crimson with clear micro-copy upon validation failure.

### Academic Result & Grade Cards
- Display subject name in `headline-sm`, teacher/term details in `body-xs`.
- Score block displays the numerical mark in `score-display` alongside the letter grade pill.
- **Withheld Results Card**:
  - Background: Muted cross-hatch or slate neutral wash.
  - Grade space replaced by a locked badge icon with the label "WITHHELD".
  - Body text: "Record pending administrative ledger clearance. Reach out to the bursar or registrar office." No alarming error colors; phrased neutrally.

### Financial / Fee Ledger Card
- Strictly avoids high-alert punitive styling.
- Layout: Structured summary row showing "Total Assessed", "Amount Cleared", and "Current Due".
- When an outstanding balance is present: Warm Amber highlight (`#D97706`), not red. Shows clear action button: "View Ledger Details" or "Submit Proof of Payment".

### Schedule / Timetable Row
- Left rail: Start and end times rendered in `JetBrains Mono` (`score-sm`) stacked vertically.
- Center: Course code in `label-mono`, course title in `body-md` (bold), room/building badge.
- Right: Attendance chip or current ongoing indicator.