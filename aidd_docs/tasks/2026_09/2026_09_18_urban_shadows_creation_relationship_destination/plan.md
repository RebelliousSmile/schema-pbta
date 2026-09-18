---
objective: "Issue #7 is traceable to an immutable v5.0.0 release that exposes the complete Urban Shadows mortal-relationship creation destination without a Lantern fallback."
status: implemented
---

# Plan: Réconcilier la destination de création Urban Shadows

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Vérifier la livraison v5 déjà présente, rattacher la preuve à l’issue #7 et la clôturer sans introduire de nouveau contrat. |
| **Source** | [GitHub issue #7](https://github.com/RebelliousSmile/schema-pbta/issues/7) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Vérifier le contrat publié et clôturer l’issue | [phase-1.md](./phase-1.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| https://github.com/RebelliousSmile/schema-pbta/issues/7 | Les données demandées sont une définition Urban Shadows, un témoin spécialisé, une question structurée et une couverture de round-trip. |
| https://github.com/RebelliousSmile/schema-pbta/releases/tag/v5.0.0 | La version immuable v5.0.0 publie l’archive versionnée et sa somme SHA-256. |

## Decisions

| Decision | Why |
| -------- | --- |
| Ne pas modifier le contrat v5. | Le dépôt contient déjà l’attribut `mortalRelationships`, les trois options stables, les bornes `3..3`, le témoin TOML et les validations qui les couvrent ; ajouter une variante créerait une seconde source de vérité. |
