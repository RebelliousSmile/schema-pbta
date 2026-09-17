---
status: pending
---

# Instruction: Aperçus Handbook et livraison

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
tools/render-handbook-preview.ts ✏️ Charge le type spécialisé choisi par chaque aperçu.
handbook/*/preview/preview.toml ✏️ Référence le livret spécialisé de son jeu.
handbook/*/preview/index.html ✏️ Dérivé régénéré.
handbook/*/styles/base.css ✏️ Dispose les régions propres au jeu.
tools/validate-handbook-packs.ts ✏️ Vérifie les régions spécialisées.
README.md, docs/compatibility.md, package.json ✏️ Documentent et distribuent v4.
```

## User Journey

```mermaid
flowchart TD
  A[TOML specialise] --> B[Generateur Handbook]
  B --> C[Apercu du livret]
  A --> D[Schema Lantern]
```

## Test Scope

```mermaid
journey
  section Setup
    selectionner une fixture specialisee par jeu => apercus configurés: 5: cli
  section Happy path
    regenerer les apercus => regions de chaque jeu visibles: 5: cli
    executer la verification complete => package et packs valides: 5: cli
```

## Wireframe

```txt
┌─────────────────────────────────────────┐
│ (1) Identité et accroche                 │
├───────────────┬─────────────────────────┤
│ (2) Choix     │ (3) Actions et règles   │
├───────────────┼─────────────────────────┤
│ (4) État      │ (5) Progression          │
└───────────────┴─────────────────────────┘
```

## Tasks to do

### `1)` Rendre et livrer les livrets

> Faire consommer le même TOML spécialisé par les deux hôtes.

1. Adapter le générateur et les descripteurs d’aperçu.
2. Préserver les styles et ajouter les régions spécifiques.
3. Vérifier le package candidat et documenter v4 sans publication externe.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | Chaque aperçu est généré depuis un TOML spécialisé et la chaîne complète passe. |
