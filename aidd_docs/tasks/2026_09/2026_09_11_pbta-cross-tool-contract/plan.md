---
objective: "Un même TOML PbtA versionné est validé par schema-pbta, édité sans perte par Lantern et rendu par les outils runtime de Handbook, selon un workflow réutilisable pour chaque nouveau jeu."
status: in-progress
---

# Plan: Contrat PbtA commun à Schema, Lantern et Handbook

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Publier un contrat PbtA unique et rendre ses livrets réellement utilisables dans Lantern et Handbook. |
| **Source** | Demande utilisateur de la session du 11 septembre 2026. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Package de contrat canonique | [`phase-1.md`](./phase-1.md) |
| 2 | Capacités PbtA runtime dans Handbook | [`phase-2.md`](./phase-2.md) |
| 3 | Consommateur PbtA dans Lantern | [`phase-3.md`](./phase-3.md) |
| 4 | Activation des packs et preuve inter-dépôts | [`phase-4.md`](./phase-4.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://zod.dev/json-schema | Zod 4 génère du JSON Schema mais documente les constructions qui ne peuvent pas être représentées. |
| https://json-schema.org/specification | JSON Schema fournit le contrat portable indépendant du renderer et du langage consommateur. |
| https://github.com/json-schema-org/JSON-Schema-Test-Suite | Le format officiel de tests positifs et négatifs peut être réutilisé comme kit de conformité consommateur. |
| https://toml.io/en/ | La compatibilité TOML doit être déclarée séparément de la version du schéma métier. |
| https://semver.org/ | Les versions du package de contrat distinguent corrections, ajouts compatibles et ruptures. |

## Decisions

| Decision | Why |
| --- | --- |
| `schema-pbta` exporte le Zod canonique, ses types, ses codecs et ses JSON Schemas générés. | Lantern et Handbook ne doivent plus posséder de schéma PbtA concurrent. |
| La compatibilité compare les objets normalisés, jamais les octets TOML ou le DOM. | Les trois outils peuvent formater différemment sans perdre ni changer une valeur. |
| Handbook fournit des capacités génériques `pbta-*` activables par plusieurs ids de jeu. | Un nouveau jeu ne doit pas entraîner une copie du parser et du renderer. |
| Les callouts sont des projections de champs canoniques, pas de nouvelles clés TOML. | La présentation reste distincte du contrat d'échange. |
| La livraison suit contrat, host Handbook, consommateur Lantern, puis manifests. | Un pack ne peut pas annoncer une capacité absente de la version Handbook minimale. |
| Le workflow durable vit dans `aidd_docs/recipes/add-a-cross-tool-pbta-game.md`. | Les mêmes contrôles deviennent obligatoires pour chaque jeu suivant. |
