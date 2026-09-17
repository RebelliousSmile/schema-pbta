---
objective: "Les moves et progressions d’un playbook v5 portent un état coché persisté et rendu par Lantern."
status: in-progress
---

# Plan: Cases à cocher des playbooks

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Persister l’acquisition des moves et progressions dans le même TOML de playbook. |
| **Source** | Conversation utilisateur du 2026-09-17. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Contrat v5 et corpus | [phase-1.md](./phase-1.md) |
| 2 | Édition et rendu Lantern | [phase-2.md](./phase-2.md) |

## Decisions

| Decision | Why |
| --- | --- |
| `checked` est optionnel et absent signifie non coché. | Les TOML existants de la baseline v5 restent lisibles sans valeur inventée. |
| Seuls les moves embarqués dans un playbook portent `checked`. | Un move autonome est une définition réutilisable, pas l’état d’un personnage. |
| Une progression devient `{ label, checked }`. | Une chaîne seule ne peut pas identifier son état d’achat. |
