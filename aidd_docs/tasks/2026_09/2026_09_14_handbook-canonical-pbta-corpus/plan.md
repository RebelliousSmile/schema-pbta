---
objective: "Vérifier puis clôturer l’issue #5 sur l’intégration Handbook déjà livrée, sans dupliquer le contrat PbtA."
status: implemented
---

# Plan: Vérification du corpus PbtA canonique dans Handbook

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Prouver l’intégration déjà livrée, corriger uniquement un écart observable et clôturer factuellement l’issue. |
| **Source** | [Issue GitHub RebelliousSmile/schema-pbta#5](https://github.com/RebelliousSmile/schema-pbta/issues/5) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Réconciliation contrat-projection | [`phase-1.md`](./phase-1.md) |
| 2 | Validation figée et clôture | [`phase-2.md`](./phase-2.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/obsidian-handbook/commit/722290e47274caeb679d671d6bd8c160b2a9a646 | Le lecteur et le harnais de corpus consomment les cas PbtA portables. |
| https://github.com/RebelliousSmile/obsidian-handbook/commit/814c4f7 | Le dump, la documentation et le retrait des témoins sont livrés. |

## Decisions

| Decision | Why |
| --- | --- |
| Les refus canoniques restent contrôlés par `assert:pbta-contract`. | Aucun verdict de projection Handbook ne leur est attribué ; leur rendre `null` créerait un contrat hôte inédit. |
| Seuls les cas acceptés `move` et `playbook` alimentent rendu et dump. | Ce sont les capacités portables rendues par Handbook. |
