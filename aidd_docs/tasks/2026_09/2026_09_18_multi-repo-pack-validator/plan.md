---
objective: "Un manifeste de pack validé par son contrat de schéma transforme les règles inter-dépôts existantes en contrôles mécaniques et crée un socle de pack vérifiable."
status: in-progress
---

# Plan: Validateur multi-dépôts et manifeste de pack

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Prouver mécaniquement le flux PbtA complet, puis étendre le même protocole explicitement configuré à chaque fournisseur de schéma. |
| **Source** | Brainstorm de cette conversation du 18 septembre 2026. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Contrat déclaratif et corpus de conformité | [phase-1.md](./phase-1.md) |
| 2 | Preuves mécaniques dans Lantern et Handbook | [phase-2.md](./phase-2.md) |
| 3 | Orchestrateur multi-dépôts et intégration continue | [phase-3.md](./phase-3.md) |
| 4 | Génération guidée d’un nouveau pack | [phase-4.md](./phase-4.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Chaque fournisseur publie à sa racine un descripteur versionné ; seul celui de `schema-pbta` est livré d’abord. | Tout schéma présent ou futur rejoint le contrôle avec son manifeste, son corpus et ses commandes de preuve, sans modifier Lantern, Handbook ni le cœur. |
| Le validateur traduit les règles existantes en invariants et compose les assertions déjà présentes dans les hôtes. | Il réduit la dépendance au jugement d’un LLM et évite de recréer une logique métier ou visuelle concurrente. |
| Le manifeste JSON de chaque pack est stocké et versionné dans le dépôt de son schéma, comme les données consommées par Foundry. | Le validateur externe le lit sans en devenir propriétaire ; une proposition LLM reste contrôlée par le schéma. |
