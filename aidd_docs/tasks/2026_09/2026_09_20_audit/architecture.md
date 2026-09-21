---
name: audit
description: Codebase audit report - architecture pillar, schema-pbta
argument-hint: N/A
---

# Codebase Audit: schema-pbta / architecture

La frontière du paquet est la surface à surveiller, et elle a un défaut net : l'alias d'import sans version sert **v2** alors que le contrat est en v5. Le dépôt porte par ailleurs la couche de présentation d'un autre produit, ce qui lui fait franchir sa propre limite.

- **Date**: 2026-09-20
- **Scope**: schema-pbta / architecture
- **Health**: fair
- **Findings**: 1 critical, 2 warning, 0 minor

## Findings

| Sev | Category     | Location                  | Issue                                                                                                                                                                                                                                                                                                                                                                       | Suggested fix                                                                                                                                                                       | Effort |
| --- | ------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 🔴  | architecture | `package.json:62`         | `"./schemas/*": "./schemas/v2/*"` : l'alias **sans version** pointe sur v2 alors que `src/contract-version.ts:2` déclare `PBTA_CONTRACT_VERSION = 5`. Un consommateur qui écrit `schema-pbta/schemas/monsterhearts/monsterhearts-playbook.schema.json` reçoit **le fichier v2**, vérifié différent du v5 (`diff` non vide), sans aucune erreur. Et pour `salvage-run`, le jeu le plus récent, `schemas/v2/` n'existe pas : la même résolution échoue. L'alias est donc soit silencieusement périmé, soit cassé, selon le jeu demandé | Faire pointer l'alias sur la majeure courante, ou mieux, le supprimer : les cinq alias versionnés (`:57-61`) sont explicites et un consommateur doit choisir sa majeure sciemment       | S      |
| 🟡  | architecture | `tools/gen-schemas.ts:19` | Le générateur écrit **chaque schéma deux fois** (`:19-21`) : dans `schemas/v5/<jeu>/` et dans un miroir non versionné `schemas/<jeu>/`. Ce miroir fait **727 226 octets** pour 47 fichiers, il est commité, il est vérifié par le `git diff --exit-code` de la CI — et il n'est **dans aucun** des chemins de `files` (`:68-81`), donc il n'est jamais publié. Son `$id` annonce pourtant l'URL `v5.0.0/schemas/v5/…`, c'est-à-dire l'emplacement de l'autre copie | Supprimer la seconde destination du générateur et le miroir, ou le déclarer dans `files` s'il a un lecteur — mais aujourd'hui personne ne peut le lire depuis le paquet                | S      |
| 🟡  | architecture | `tools/render-handbook-preview.ts:1` | Un dépôt de **schémas** contient et génère la couche de présentation d'un autre produit : `handbook/` porte 61 fichiers, dont six pages HTML, sept feuilles de style et un dossier `shared/`, produits par ce fichier de 442 lignes et gardés par la CI. Le paquet ne publie rien de tout cela (`files` ne nomme pas `handbook/`) : c'est une maquette du greffon Obsidian hébergée dans le fournisseur, donc un changement de look de l'hôte devient un commit ici | Trancher : soit ces prévisualisations appartiennent au greffon et déménagent, soit elles sont l'épreuve visuelle du contrat et doivent être nommées comme telles (et alors le CSS par jeu n'y a pas sa place — voir `ui.md`) | L      |

Vérifié sain, et c'est ce qui fait tenir la construction :

- **La surface publique est étroite et explicite** : un seul point d'entrée typé (`package.json:53-56` → `dist/index.d.ts` / `dist/index.js`), et tout le reste passe par des alias nommés. Rien n'est atteignable par chemin profond faute de `"./*"` fourre-tout.
- **Le contrat est une donnée, pas du code** : `src/contract-version.ts` porte la majeure, le tag de schéma et la version TOML en trois constantes, et `tools/gen-schemas.ts:17` construit les `$id` depuis elles. Changer de majeure est un changement de constante, pas une reprise de 141 fichiers à la main.
- **La séparation `src/zod` / `src/codecs` / `src/presentation` tient** : les schémas ne connaissent pas le TOML, le codec (`src/codecs/toml.ts`) est le seul à importer `smol-toml`, et la présentation (`src/presentation/collections.ts`) ne valide rien.
- **Les cinq majeures cohabitent sans branche conditionnelle** : `schemas/v1` à `v5` sont des arborescences figées, toutes publiées (`files:70-74`), et aucune n'est lue par le code — elles sont là pour les consommateurs, pas pour la bibliothèque.
- **Le contrat inter-outils est déclaré, pas deviné** : `cross-tool-provider.json` est publié (`files:78`) et validé par `tools/validate-cross-tool-provider.ts`.

## Top actions

1. **Corriger ou supprimer l'alias `./schemas/*`** (`package.json:62`) : effort `S`, et c'est le seul défaut du pilier qui livre du faux à un consommateur sans rien dire. Le jeu le plus récent, Salvage Run, est déjà cassé par ce chemin.
2. **Supprimer le miroir non versionné** (`tools/gen-schemas.ts:19-21`) : 727 Ko générés, commités, gardés par la CI et publiés nulle part.
3. **Trancher sur `handbook/`** (`tools/render-handbook-preview.ts`) : effort `L`, à instruire avant de coder. → `plan`.

## Coverage

- **Scanned**: architecture (surface publique et carte d'exports, cohérence des alias avec la version du contrat, couches internes `zod` / `codecs` / `presentation`, cohabitation des majeures, artefacts générés et leur publication, frontière avec les produits consommateurs)
- **Skipped**: none
