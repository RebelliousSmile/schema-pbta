---
objective: "schema-pbta publie cinq packs de présentation v1 qu’Handbook 2.7.1 peut installer et mettre à jour ensemble depuis une source unique, sans télécharger de contenu exécutable."
status: implemented
---

# Plan: Catalogue Handbook multi-pack de schema-pbta

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Publier un catalogue racine et cinq packs visuels PbtA compatibles avec l’installateur actuel de Handbook, puis prouver leur installation transactionnelle. |
| **Source** | [Issue GitHub RebelliousSmile/schema-pbta#2](https://github.com/RebelliousSmile/schema-pbta/issues/2) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Catalogue et manifests installables | [`phase-1.md`](./phase-1.md) |
| 2 | Validation autonome du payload | [`phase-2.md`](./phase-2.md) |
| 3 | Preuve par le vrai installateur Handbook | [`phase-3.md`](./phase-3.md) |
| 4 | Documentation et publication | [`phase-4.md`](./phase-4.md) |

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
| https://github.com/RebelliousSmile/schema-adrenaline/blob/main/tools/validate-handbook-install.ts | Un harnais versionné importe déjà le vrai `sourceInstaller.ts`, simule l’adapter Obsidian en mémoire et prouve promotion, mise à jour et rollback atomique contre Handbook 2.7.1. |

## Decisions

| Decision | Why |
| --- | --- |
| Publier exactement les cinq jeux présents dans `GAMES`, chacun en version initiale `0.1.0`. | Le catalogue doit être déterministe et couvrir tout le corpus visuel déjà validé, sans découverte implicite de dossiers. |
| Utiliser `manifestVersion: 1`, `minimumHandbookVersion: 2.7.1` et `requires: []`. | Handbook 2.7.1 est le premier host dont le téléchargement `requestUrl` fonctionne ; aucune capacité PbtA spécifique n’existe encore. |
| Produire un effet visible avec les variables Obsidian natives du pack, sans ajouter de renderer PbtA dans cette issue. | Le starter kit devient démontrable immédiatement tout en gardant la publication des blocs PbtA comme évolution indépendante. |
| Déclarer seulement les SVG originaux utiles comme assets ; ne distribuer ni CSS, HTML, TypeScript, JavaScript, TOML de preview, ni police placeholder. | L’installateur ne doit matérialiser que les manifests et ressources binaires nécessaires au pack. |
| Garder les `pack.json` comme source de vérité installable et les previews existantes comme outil de conception local. | Le payload Handbook reste stable et fermé sans faire de son CSS de preview un contrat runtime. |
| Vérifier l’intégration avec le vrai installateur Handbook depuis un harnais optionnel appartenant à `schema-pbta`, qui localise le host par `HANDBOOK_ROOT` ou checkout frère. | Cela prouve la compatibilité et l’atomicité sans modifier Handbook ni créer de dépendance CI circulaire entre les dépôts. |
| Retirer avant la phase 1 les modifications suivies non commitées du plan PbtA 2.8.0 abandonné, puis conserver uniquement ce dossier de plan. | Elles modifient le contrat canonique hors du périmètre de l’issue #2 et empêcheraient un commit de phase isolé. |
| Affecter les quatre phases à `schema-pbta` et traiter Handbook comme une dépendance de test externe en lecture seule. | Le code et le statut de chaque phase peuvent ainsi être livrés dans un même commit, sans changement à coordonner dans un second dépôt. |
