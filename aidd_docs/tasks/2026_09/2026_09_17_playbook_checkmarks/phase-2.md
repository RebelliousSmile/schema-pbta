---
status: pending
---

# Instruction: Édition et rendu Lantern

## Architecture projection

```txt
Lantern package.json, package-lock.json ✏️ Épinglent le tarball v5 publié.
Lantern templates de playbook ✏️ Rendent et éditent les cases des moves et progressions.
Lantern tests de contrat et navigateur ✏️ Vérifient persistance et export TOML.
```

## User Journey

```mermaid
flowchart TD
  A[Move ou progression] --> B[Case dans Lantern]
  B --> C[Etat du document]
  C --> D[Export TOML]
  D --> E[Réimport avec même case]
```

## Test Scope

```mermaid
journey
  section Setup
    Ouvrir un playbook v5 => cases disponibles: 5: browser
  section Happy path
    Cocher puis exporter et réimporter => mêmes éléments cochés: 5: browser
  section Edge case - non coché
    Laisser une entrée non cochée => état absent ou false rendu non coché: 5: browser
```

## Wireframe

```txt
┌──────────────────────────────────────┐
│ (1) Moves                             │
│  [ ] entrée de move                   │
├──────────────────────────────────────┤
│ (2) Progressions                      │
│  [x] progression acquise              │
└──────────────────────────────────────┘
```

1. Chaque move affiche son état persistant.
2. Chaque progression affiche son état d’achat.

## Tasks to do

### `1)` Rendre l’état coché

> L’interface édite les deux listes structurées sans perdre le TOML canonique.

1. Mettre à jour les modèles, éditeurs et previews concernés.
2. Prouver le round-trip navigateur des états cochés et non cochés.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | Une case modifiée dans Lantern est visible, persistée et retrouvée après réimport. |
