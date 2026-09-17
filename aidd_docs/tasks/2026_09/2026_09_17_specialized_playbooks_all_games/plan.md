---
objective: "Chaque jeu PbtA publié possède un livret spécialisé, canonique et monobloc, lisible par Handbook et Lantern."
status: in-progress
---

# Plan: Livrets spécialisés pour tous les jeux

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Étendre le modèle de livret spécialisé à Masks, Monster of the Week et The Sprawl, puis aligner Urban Shadows et Monsterhearts sur la même frontière canonique. |
| **Source** | Cadrage validé dans cette conversation. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Contrat v4 et types spécialisés | [phase-1.md](./phase-1.md) |
| 2 | Fixtures, corpus et surfaces Lantern | [phase-2.md](./phase-2.md) |
| 3 | Références canoniques et retrait des doublons | [phase-3.md](./phase-3.md) |
| 4 | Aperçus Handbook et paquet v4 | [phase-4.md](./phase-4.md) |
| 5 | Intégration Lantern et publication | [phase-5.md](./phase-5.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Un type `*-playbook` par jeu dérive de `playbook`. | Les mécaniques éditoriales et jouables restent structurées sans gonfler le socle transversal. |
| `playbook` générique reste interopérable mais non canonique. | Chaque livret n’a qu’une seule source de vérité. |
| Une référence `move.playbook` résout le type spécialisé du jeu. | Les mouvements conservent leur champ portable `playbook` tout en refusant un repli silencieux vers une fixture générique. |
| La nouvelle forme est v4. | v3.0.0 est publié et ses schémas sont immuables. |
