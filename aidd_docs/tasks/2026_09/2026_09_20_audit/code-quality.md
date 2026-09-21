---
name: audit
description: Codebase audit report - code-quality pillar, schema-pbta
argument-hint: N/A
---

# Codebase Audit: schema-pbta / code-quality

Le code publié est propre et discipliné : 1 393 lignes en `strict`, zéro `as any`, zéro `console.`, zéro TODO. Le déséquilibre est ailleurs : l'outillage pèse 3 837 lignes, soit 2,75 fois la bibliothèque qu'il valide, et rien ne formate ce dépôt.

- **Date**: 2026-09-20
- **Scope**: schema-pbta / code-quality
- **Health**: good
- **Findings**: 0 critical, 3 warning, 2 minor

## Findings

| Sev | Category     | Location                             | Issue                                                                                                                                                                                                                                                                       | Suggested fix                                                                                                                                                  | Effort |
| --- | ------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 🟡  | code-quality | `tools/validate-references.ts:1`     | Ce fichier fait **604 lignes**, et `tools/` en totalise **3 837** sur 25 fichiers dont 19 `validate-*`, contre **1 393** pour `src/` sur 21 fichiers : le harnais est 2,75 fois plus gros que la bibliothèque publiée. Quatre fichiers passent 300 lignes (`render-handbook-preview.ts` 442, `validate-handbook-packs.ts` 431, `validate-handbook-install.ts` 330) | Extraire ce que les validateurs partagent (lecture du corpus, résolution des chemins, format de rapport) dans un module commun, puis découper les quatre gros fichiers par responsabilité | L      |
| 🟡  | code-quality | `package.json:82`                    | **Aucun formateur** : pas de `prettier` en `devDependencies`, pas de `.prettierrc`, pas de script `format`. La seule contrainte de style est le `strict` de TypeScript. Le dépôt frère `schema-adrenaline` a `format` et `format:check` ; celui-ci n'a rien, donc le style dépend de qui a tapé le fichier | Installer Prettier, ajouter `format` et `format:check`, mettre `format:check` dans `check` comme le fait `schema-adrenaline`                                       | S      |
| 🟡  | code-quality | `tools/render-handbook-preview.ts:87` | Les six pages de prévisualisation sont produites par concaténation de littéraux de gabarit sur 442 lignes. L'échappement est réellement fait — **48 appels** à `escapeHtml`, et aucune valeur du corpus non échappée n'a été trouvée — mais rien n'oblige le 49e : ajouter un champ, c'est se souvenir d'appeler la fonction | Faire passer chaque valeur par un constructeur d'élément qui échappe par construction, plutôt que par un appel que l'auteur doit penser à écrire                  | M      |
| 🟢  | code-quality | `src/contract-version.ts:4`          | Commentaire périmé de trois majeures : « Immutable Git tag that owns the canonical JSON Schema identifiers **for v2** » au-dessus de `PBTA_CONTRACT_SCHEMA_TAG = "v5.0.0"`                                                                                                     | Corriger le commentaire, ou mieux, le formuler sans numéro pour qu'il ne périme plus                                                                             | S      |
| 🟢  | code-quality | `package.json:17`                    | `check` enchaîne **17 étapes** en `&&` : la première rouge masque les seize suivantes, donc une session de correction se fait étape par étape sans jamais voir l'ensemble des écarts                                                                                             | Séparer les étapes qui n'ont pas de dépendance d'ordre pour qu'elles rapportent toutes, et garder le `&&` seulement là où l'étape suivante lit la sortie de la précédente | M      |

Vérifié sain, et solide :

- **0 `as any`**, **0 `@ts-ignore`**, **0 `@ts-expect-error`** sur `src/` et `tools/` réunis.
- **0 `console.`** dans `src/` : la bibliothèque n'écrit jamais sur la sortie, seuls les outils le font.
- **0 TODO / FIXME** dans le code.
- `strict: true` avec `ES2022` (`tsconfig.json:6`), et surtout `"include": ["src", "tools"]` (`:12`) — contrairement à `lantern`, **le typecheck couvre aussi l'outillage**, donc les 3 837 lignes de harnais sont réellement vérifiées par `npm run typecheck`.
- Les fichiers de `src/` restent petits : le plus gros est `src/zod/game-definition.ts` à 242 lignes, et six fichiers de jeu tiennent en moins de 50.

## Top actions

1. **Installer Prettier** (`package.json:82`) : effort `S`, et c'est le seul des trois dépôts de schémas à ne pas en avoir, donc l'écart de style entre frères est gratuit.
2. **Factoriser les validateurs** (`tools/`) : 19 fichiers `validate-*` pour 3 837 lignes, avec une lecture de corpus et un format de rapport répétés. Effort `L`, à planifier plutôt qu'à improviser. → `plan`.
3. **Rendre l'échappement structurel** (`tools/render-handbook-preview.ts`) : la dette est une convention tenue à la main sur 48 sites.

## Coverage

- **Scanned**: code-quality (taille des fichiers et répartition `src` / `tools`, duplication entre validateurs, `any` et suppressions de type, code mort, commentaires périmés, outillage de formatage, portée du typecheck, lisibilité du générateur de HTML)
- **Skipped**: none
