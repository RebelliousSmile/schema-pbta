---
name: audit
description: Codebase audit report - performance pillar, schema-pbta
argument-hint: N/A
---

# Codebase Audit: schema-pbta / performance

Rien de chaud à l'exécution : la bibliothèque valide un document et s'arrête. Le coût est dans ce qui est expédié — 2,78 Mo de JSON généré dans le tarball, cinq majeures conservées en entier — et dans un `check` de 17 étapes qui reconstruit tout à chaque passage.

- **Date**: 2026-09-20
- **Scope**: schema-pbta / performance
- **Health**: good
- **Findings**: 0 critical, 2 warning, 1 minor

## Findings

| Sev | Category    | Location              | Issue                                                                                                                                                                                                                                                                                                                | Suggested fix                                                                                                                                                                       | Effort |
| --- | ----------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 🟡  | performance | `package.json:68`     | `files` publie **les cinq majeures** de schémas : v1 462 271 o (19 fichiers), v2 504 065 o (21), v3 524 264 o (21), v4 578 646 o (24), v5 708 695 o (27) — soit **2 777 941 octets** de JSON généré, pour une bibliothèque dont `src/` fait 1 393 lignes. Chaque consommateur télécharge les quatre majeures qu'il n'utilise pas | Ne publier que la majeure courante, et servir les précédentes par leur tag Git — les `$id` pointent déjà sur `raw.githubusercontent.com` (`tools/gen-schemas.ts:17`), donc les anciennes majeures sont déjà accessibles sans être dans le tarball | M      |
| 🟡  | performance | `package.json:17`     | `check` enchaîne 17 étapes dont `build`, `gen` **et** `handbook:render` : chaque passage recompile, régénère les 141 fichiers de schémas et réécrit les six pages de prévisualisation, puis la CI vérifie par `git diff --exit-code` (`ci.yml:24`) que rien n'a bougé. Utile comme garde, coûteux comme boucle locale : aucune étape n'est incrémentale | Séparer un `check:fast` (typecheck + validations) du `check` complet qui régénère, pour que la boucle de développement n'ait pas à réécrire 3,5 Mo de JSON à chaque itération            | M      |
| 🟢  | performance | `schemas/masks`       | Le miroir non versionné ajoute **727 226 octets** à l'arborescence de travail et à chaque `git clone`, sans être publié (voir `architecture.md`) — un `clone` porte donc 3,5 Mo de JSON généré au lieu de 2,78                                                                                                            | Supprimé avec le miroir, cette ligne disparaît d'elle-même                                                                                                                            | S      |

Vérifié, et rien à corriger là :

- **La CI est rapide** : les six derniers passages de `Check` sur `main` tiennent en **36 à 44 secondes**, les deux jobs (`check` et `contract`) compris. Le job `contract` clone et installe quatre dépôts et reste dans cette fenêtre.
- **Aucun chemin chaud dans la bibliothèque.** `src/codecs/toml.ts` fait un `parse`, un `safeParse` Zod et un `stringify` par document ; aucune boucle imbriquée sur les collections, aucun `JSON.parse` répété, aucun cache à invalider. `src/presentation/collections.ts` (99 lignes) est la plus grosse pièce de transformation et reste linéaire.
- **Les prévisualisations sont légères** : six pages de **6 101 à 9 200 octets**, la feuille partagée `handbook/shared/preview.css` à 9 129 octets, **zéro image**, et un script en ligne par page. Une prévisualisation complète pèse moins qu'un seul des schémas qu'elle illustre.
- **Le paquet ne publie ni `handbook/`, ni `aidd_docs/`, ni `examples/`** : la partie lourde du dépôt (104 fichiers `aidd_docs`, 95 de corpus, 61 de handbook) reste hors tarball. Le poids publié est celui des schémas, pas celui du dépôt.

Mode dégradé : **no profiler, static heuristics only** — les chiffres ci-dessus sont des tailles mesurées sur l'arborescence et des durées lues dans l'historique de la CI, pas des mesures de temps d'exécution instrumentées.

## Top actions

1. **Réduire ce que `files` publie** (`package.json:68-81`) : 2,78 Mo dont 2,07 Mo de majeures obsolètes, alors que les `$id` rendent déjà les anciennes lisibles par tag.
2. **Scinder `check`** (`package.json:17`) : la boucle locale n'a pas besoin de régénérer 3,5 Mo pour vérifier une modification de schéma.

## Coverage

- **Scanned**: performance (poids publié par `files`, taille des artefacts générés, coût de la chaîne `check` et durée réelle de la CI, chemins de validation et de codec, poids des pages de prévisualisation)
- **Skipped**: none, mais le pilier a tourné en mode dégradé — no profiler, static heuristics only
