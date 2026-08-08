# Claymorphism Style Guide

This document outlines the Claymorphism design system implemented in the ToDo App.

## Philosophy
Claymorphism is a modern, light-themed design aesthetic characterized by a soft, 3D "clay-like" appearance. It achieves depth not through borders, but through a combination of multiple drop shadows (both inner and outer conceptually, though adapted for React Native).

The design emphasizes:
1.  **Light Mode Only**: A clean, white canvas (`#FFFFFF` background).
2.  **No Borders**: Cards and components float softly.
3.  **Pastel Accents**: Soft, harmonious colors for categories and states.
4.  **Puffy Shadows**: Soft, diffused shadows that give elements a tactile, puffy feel.

## Color Palette

### Core Colors
- **Background**: `#F9FAFB` (Very light gray, nearly white, providing slight contrast against white cards).
- **Cards/Surface**: `#FFFFFF` (Pure white).
- **Accent**: `#3B82F6` (Vibrant Blue - used for primary actions, active states, and general branding).

### Pastel Category Colors
To keep the UI from being monotonous (just blue and white), we use a selaras (harmonious) pastel palette for different categories:
- **Physical**: Mint (`#10B981`)
- **Intelligence**: Purple (`#8B5CF6`)
- **Creativity**: Coral (`#F43F5E`)
- **Discipline**: Amber (`#F59E0B`)
- **Social**: Cyan (`#06B6D4`)
- **Productivity**: Accent Blue (`#3B82F6`)

## Shadows (`ClayShadow`)
Since React Native does not natively support `inset` shadows, we simulate the puffy clay effect using carefully tuned outer shadows and subtle colored backgrounds.

- **`ClayShadow.card`**: Used for main task cards, budget cards, and statistic cards. Soft and diffuse.
- **`ClayShadow.cardHover`**: A slightly more elevated shadow for bottom sheets or modals.
- **`ClayShadow.button`**: A tighter shadow for interactive primary buttons.
- **`ClayShadow.soft`**: Very light shadow used for chips, secondary buttons, and inner rings.
- **`ClayShadow.navBar`**: Used exclusively for the bottom floating navigation bar.

## Typography
- **Font Family**: Poppins (replaces system fonts).
- **Hierarchy**: Follows `Typography` presets in `design.ts`.

## Implementation Rules
1. **Never use `borderWidth`** for structural components (cards, buttons, inputs). Rely entirely on `ClayShadow`.
2. **Use translucent backgrounds** for active states or chips (e.g., `catColor + '18'` which adds roughly 10% opacity).
3. **Keep padding generous** (Whitespace is crucial in Claymorphism to let the shadows breathe).

---
*Created as part of the Claymorphism redesign phase.*
