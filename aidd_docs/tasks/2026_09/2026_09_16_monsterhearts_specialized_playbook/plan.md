---
objective: "Monsterhearts playbooks round-trip as one TOML document through a dedicated schema-pbta contract and a Lantern template tracked by a Lantern issue."
status: in-progress
---

# Plan: Playbook Monsterhearts spécialisé

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Représenter un livret Monsterhearts entier dans un TOML atomique et préparer son rendu Lantern spécialisé. |
| **Source** | Demande utilisateur : appliquer à Monsterhearts le modèle retenu pour Urban Shadows. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Contrat Monsterhearts atomique | [phase-1.md](./phase-1.md) |
| 2 | Issue et livraison inter-projets | [phase-2.md](./phase-2.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Un playbook Monsterhearts est un seul TOML. | L'import/export ne dépend d'aucun fichier associé. |
| La cible est `pbta/monsterhearts-playbook`. | Elle préserve `pbta/playbook` pour le socle portable. |
| Les mécaniques Monsterhearts sont structurées dans la variante. | Elles ne doivent pas être masquées dans des champs narratifs génériques. |
| Lantern est hors du périmètre de ce plan. | Ce dépôt livre le contrat et une issue ; seul le projet Lantern réalise son propre travail. |
