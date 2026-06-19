---
name: Precision Utility
colors:
  surface: '#f7f9ff'
  surface-dim: '#d7dadf'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f9'
  surface-container: '#ebeef3'
  surface-container-high: '#e5e8ee'
  surface-container-highest: '#e0e3e8'
  on-surface: '#181c20'
  on-surface-variant: '#3f4941'
  inverse-surface: '#2d3135'
  inverse-on-surface: '#eef1f6'
  outline: '#6f7a70'
  outline-variant: '#bfc9be'
  surface-tint: '#176c40'
  primary: '#005931'
  on-primary: '#ffffff'
  primary-container: '#217346'
  on-primary-container: '#a4f5bd'
  inverse-primary: '#88d8a1'
  secondary: '#006d42'
  on-secondary: '#ffffff'
  secondary-container: '#74fcb3'
  on-secondary-container: '#007347'
  tertiary: '#80343e'
  on-tertiary: '#ffffff'
  tertiary-container: '#9e4b55'
  on-tertiary-container: '#ffdadc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f4bc'
  primary-fixed-dim: '#88d8a1'
  on-primary-fixed: '#00210f'
  on-primary-fixed-variant: '#00522d'
  secondary-fixed: '#74fcb3'
  secondary-fixed-dim: '#54de99'
  on-secondary-fixed: '#002111'
  on-secondary-fixed-variant: '#005231'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b8'
  on-tertiary-fixed: '#3f0210'
  on-tertiary-fixed-variant: '#782e38'
  background: '#f7f9ff'
  on-background: '#181c20'
  surface-variant: '#e0e3e8'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
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
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 16px
  gutter-mobile: 12px
---

## Brand & Style

This design system is built for high-utility, task-oriented mobile applications. The brand personality is professional, efficient, and reliable, aiming to evoke a sense of digital craftsmanship and accuracy. The target audience includes professionals, students, and administrative workers who require a tool that feels like a trusted office companion.

The design style is **Corporate Modern**, prioritizing clarity and speed of interaction. It utilizes a refined balance of generous whitespace (Minimalism) with subtle physical cues (Soft Elevation) to ensure that the user feels grounded in a stable environment. The interface avoids unnecessary flourishes, focusing instead on clear affordances and a high-contrast functional hierarchy.

## Colors

The palette is anchored by a professional "Excel Green," used strategically for primary actions and brand presence. 

- **Primary (#217346):** Used for the main "Convert" action, active states, and critical success indicators.
- **Secondary (#33C481):** A lighter tint used for soft accents, progress bars, or hover/pressed states on dark backgrounds.
- **Neutral/Text (#212529):** Deep charcoal ensures maximum legibility and high contrast against white surfaces.
- **Background (#F8F9FA):** A soft grey that reduces screen glare and provides a distinct contrast against the pure white surface elements.
- **Surface (#FFFFFF):** Reserved for interactive cards, input fields, and modal containers to create a "layered" effect.

## Typography

This design system utilizes **Inter** for its exceptional legibility and systematic feel. The type scale is designed to be functional and scan-friendly.

- **Headlines:** Use Bold (700) or Semi-Bold (600) weights with slight negative letter-spacing to feel tight and authoritative. 
- **Body Text:** Standardized at 16px for primary reading to ensure accessibility on mobile devices.
- **Labels:** Small, uppercase labels with increased letter-spacing are used for categorization and non-interactive metadata.

## Layout & Spacing

The design system follows a **4px baseline grid** to ensure mathematical harmony. On mobile, the layout adheres to a fluid grid with 16px outer margins.

- **Stacking:** Use `lg` (24px) spacing between distinct content sections and `md` (16px) for elements within a group.
- **Touch Targets:** All interactive elements must maintain a minimum height of 48px, even if the visual container is smaller.
- **Alignment:** Content should primarily be left-aligned to mirror the reading pattern of spreadsheets and data tables.

## Elevation & Depth

Depth is achieved through a combination of **Tonal Layering** and **Ambient Shadows**. 

- **Level 0 (Background):** The neutral grey base.
- **Level 1 (Cards):** Pure white surfaces with a soft, 10% opacity black shadow (4px blur, 2px offset). Used for content containers.
- **Level 2 (Buttons/Modals):** Floating elements or primary buttons use a slightly more pronounced shadow (8px blur, 4px offset) to suggest interactability.
- **Outlines:** In addition to shadows, a subtle 1px border (#E9ECEF) is used on input fields to provide definition without adding visual weight.

## Shapes

The shape language is defined by **Rounded (0.5rem / 8px)** corners for standard components and **Rounded-LG (1rem / 16px)** for primary layout containers like cards. 

- Input fields and buttons use the standard 8px radius to maintain a professional, structured look.
- Large cards and bottom sheets use the 16px radius to feel modern and friendly.
- Icon containers may use circular (pill) shapes to differentiate them from actionable buttons.

## Components

### Buttons
- **Primary (Convert):** Full-width, #217346 background, white text, bold weight. This is the highest hierarchy element.
- **Secondary (Camera/Gallery):** White background, #217346 border and text. Used for supporting actions.
- **Ghost:** No background or border, used for "Cancel" or "Edit" actions to reduce visual noise.

### Inputs & Cards
- **Image Preview Card:** 16px corner radius, subtle shadow, featuring a "Remove" icon in the top right.
- **Text Fields:** 8px corner radius, #F8F9FA background when inactive, white background with primary color border when focused.

### Icons
- Use **Linear/Outlined icons** with a 2px stroke width for 'Camera', 'Gallery', and 'Share'. 
- Icons should be paired with text labels in most utility contexts to ensure no ambiguity for the user.

### Lists
- For recently converted files, use a clean list with a leading "Excel" file icon, a title (Filename), a subtitle (Date/Size), and a trailing "Share" or "More" icon.