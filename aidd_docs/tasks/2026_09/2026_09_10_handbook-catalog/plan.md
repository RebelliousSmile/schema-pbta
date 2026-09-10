---
objective: "schema-pbta publie depuis une source unique cinq packs de présentation v1 fermés et compatibles avec Handbook 2.7.1, sans contenu exécutable."
status: in-progress
---

# Plan: Catalogue Handbook multi-pack de schema-pbta

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Publier et valider un catalogue racine contenant cinq packs visuels PbtA compatibles avec le contrat actuel de Handbook. |
| **Source** | [Issue GitHub RebelliousSmile/schema-pbta#2](https://github.com/RebelliousSmile/schema-pbta/issues/2) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Catalogue et manifests installables | [`phase-1.md`](./phase-1.md) |
| 2 | Validation du catalogue et du payload | [`phase-2.md`](./phase-2.md) |
| 3 | Documentation et publication | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/2 | La source doit annoncer ses packs, leurs versions, capacités et assets, sans distribuer de code exécutable. |
| https://github.com/RebelliousSmile/obsidian-handbook/blob/1206f6f/src/games/repositoryManifest.ts | `handbook.json` v1 accepte un dépôt et une liste stricte d’entrées `id`, `version`, `path`, `label`, `description`. |
| https://github.com/RebelliousSmile/obsidian-handbook/blob/1206f6f/src/games/pluginManifest.ts | Le seul format accepté est `pack.json` v1 avec SemVer, version Handbook minimale, capacités, variantes et pack déclaratif. |
| https://github.com/RebelliousSmile/obsidian-handbook/blob/1206f6f/src/games/sourceInstaller.ts | L’installateur prépare tous les manifests et assets avant de remplacer la source entière ; une erreur tardive ne promeut aucun pack. |
| https://github.com/RebelliousSmile/obsidian-handbook/blob/1206f6f/src/games/capabilities.ts | Handbook 2.7.1 ne publie aucune capacité PbtA ; `requires: []` est la seule déclaration honnête et compatible aujourd’hui. |
| https://github.com/RebelliousSmile/schema-in-the-mist/blob/9535e94/handbook.json | Un dépôt multi-pack réel confirme le catalogue v1, les chemins explicites et les versions de pack indépendantes. |
| https://github.com/RebelliousSmile/schema-adrenaline/blob/main/handbook.json | Le catalogue Adrenaline public confirme que la première source du kit double est désormais installable. |

## Decisions

| Decision | Why |
| --- | --- |
| Publier exactement les cinq jeux présents dans `GAMES`, chacun en version initiale `0.1.0`. | Le catalogue doit être déterministe et couvrir tout le corpus visuel déjà validé, sans découverte implicite de dossiers. |
| Utiliser `manifestVersion: 1`, `minimumHandbookVersion: 2.7.1` et `requires: []`. | Handbook 2.7.1 est le premier host dont le téléchargement `requestUrl` fonctionne ; aucune capacité PbtA spécifique n’existe encore. |
| Produire un effet visible avec les variables Obsidian natives du pack, sans ajouter de renderer PbtA dans cette issue. | Le starter kit devient démontrable immédiatement tout en gardant la publication des blocs PbtA comme évolution indépendante. |
| Déclarer seulement les SVG originaux utiles comme assets ; ne distribuer ni CSS, HTML, TypeScript, JavaScript, TOML de preview, ni police placeholder. | L’installateur ne doit matérialiser que les manifests et ressources binaires nécessaires au pack. |
| Garder les `pack.json` comme source de vérité installable et les previews existantes comme outil de conception local. | Le payload Handbook reste stable et fermé sans faire de son CSS de preview un contrat runtime. |
| Vérifier l’intégration avec le vrai lecteur et le vrai installateur dans un plan autonome appartenant au dépôt Handbook. | Le code du harnais et son statut de phase peuvent ainsi être commités ensemble sans créer de dépendance CI circulaire. |
| Retirer avant la phase 1 les modifications suivies non commitées du plan PbtA 2.8.0 abandonné, puis conserver uniquement ce dossier de plan. | Elles modifient le contrat canonique hors du périmètre de l’issue #2 et empêcheraient un commit de phase isolé. |
| Garder les trois phases de ce plan dans `schema-pbta` et suivre le harnais dans `handbook/aidd_docs/tasks/2026_09/2026_09_10_pbta-source-integration/`. | Chaque plan possède ses statuts et son code dans un seul dépôt, donc chaque phase peut produire exactement un commit local. |
