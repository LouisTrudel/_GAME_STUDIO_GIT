# Visual Style Guide & Asset Specification

This document defines the core visual identity for our Three.js project, focusing on a clean, performant, and stylized low-poly aesthetic.

## 1. Core Visual Style: "Modern Low-Poly"
The visual direction balances simplicity with deliberate lighting to create depth.
*   **Geometry:** Strictly low-poly (flat shaded, visible vertices). Avoid high-density meshes.
*   **Textures:** Minimal. Use vertex colors or simple solid colors rather than complex UV-mapped textures where possible.
*   **Lighting:** Sharp, directional shadows. Emphasize warm light sources vs cool ambient shadows.

## 2. Color Palette (Sci-Fi/Synthwave Inspired)
Designed for high-contrast, readability, and a modern "Tech" feel.

| Role | Color | Hex |
| :--- | :--- | :--- |
| **Primary** | Electric Blue | `#00d4ff` |
| **Secondary** | Deep Violet | `#4b0082` |
| **Accent** | Neon Pink | `#ff00ff` |
| **Background**| Void Black | `#0a0a0c` |
| **Text** | Off-White | `#f0f0f0` |

## 3. Lighting Setup (Three.js)
To achieve the desired look:
*   **AmbientLight:** High-intensity, low-color, cool grey (`#1a1a2e`).
*   **DirectionalLight:** Strong warm white (`#fffdf5`), cast shadows enabled.
*   **Shadows:** Use `PCFSoftShadowMap` for cleaner, less jagged edges.

## 4. UI Design Tokens
*   **Font Family:** 'Inter' or any clean sans-serif.
*   **Spacing:** 8px grid system.
*   **Border Radius:** 4px (small), 12px (containers).
*   **Buttons:** 44px min-height, solid fill with subtle hover scale effect.
*   **Feedback:** Active state highlights in `#ff00ff`.

## 5. Asset Specifications
*   **Format:** `.glb` (GLTF binary).
*   **Budget:** < 1000 triangles per environmental prop; < 5000 per character.
*   **Dimensions:** Standard scale: 1 unit = 1 meter.
*   **Naming:** `prop-name-lowpoly.glb`
