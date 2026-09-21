---
name: audit
description: Codebase audit report - tests pillar, schema-pbta
argument-hint: N/A
---

# Codebase Audit: schema-pbta / tests

Le dépôt n'a pas de tests unitaires et n'en a pas besoin de la même façon : il a 30 cas de conformité sur 11 cibles, dont 17 rejets, enchaînés par un `check` de 17 étapes que la CI passe en 40 secondes. Ce qui manque, ce sont deux validateurs que rien ne lance et une branche de rendu que rien n'exerce.

- **Date**: 2026-09-20
- **Scope**: schema-pbta / tests
- **Health**: good
- **Findings**: 0 critical, 4 warning, 0 minor

## Findings

| Sev | Category | Location                              | Issue                                                                                                                                                                                                                                                                                       | Suggested fix                                                                                                                                              | Effort |
| --- | -------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 🟡  | tests    | `package.json:17`                     | **Deux validateurs ne sont dans aucune chaîne** : `handbook:validate:install` (330 lignes, `tools/validate-handbook-install.ts`) et `validate:pack` (77 lignes, `tools/validate-pack-manifest.ts`) n'apparaissent ni dans les 17 étapes de `check`, ni dans `ci.yml`. 407 lignes de garde que rien ne déclenche, donc que rien ne protège contre sa propre pourriture | Les mettre dans `check`, ou les supprimer : un validateur jamais lancé cesse d'être vrai sans que personne l'apprenne                                        | S      |
| 🟡  | tests    | `.github/workflows/ci.yml:25`         | Le job `contract` matérialise les participants depuis `cross-tool.config.json`, dont les références sont des **commits épinglés** (`lantern` `e2f1ce7`, `handbook` `51951f5`, plus les deux dépôts de schémas frères). Un passage vert prouve donc le contrat contre ces commits-là, pas contre le `main` courant des consommateurs : leur dérive est invisible ici | Ajouter un passage périodique contre le `main` des consommateurs, en le laissant échouer sans bloquer les PR — l'épingle protège la PR, le passage périodique détecte la dérive | M      |
| 🟡  | tests    | `tools/render-handbook-preview.ts:136` | La branche booléenne du rendu d'attribut (`<span class="handbook-check" data-checked aria-label>`) n'est **exercée par aucune** des six prévisualisations : `handbook-check` apparaît 0 fois dans les pages générées. Le code existe, la CI le compile et le typecheck le couvre, mais aucune sortie ne le montre | Ajouter un attribut booléen au corpus d'un jeu de prévisualisation, ou retirer la branche si aucun jeu n'en déclare                                          | S      |
| 🟡  | tests    | `package.json:1`                      | Aucun lanceur de tests, aucun fichier `.test.` ou `.spec.`, aucun script `test`. C'est cohérent avec la nature du dépôt — la conformité au contrat *est* la suite de tests — mais les **3 837 lignes de `tools/`** n'ont alors aucune assertion sur elles-mêmes : un validateur qui cesse de détecter passe au vert. `tools/validate-reference-fixtures.ts` (310 lignes) est la seule pièce qui teste un validateur, et elle ne couvre que celui des références | Ajouter des fixtures négatives pour les validateurs structurants, sur le modèle déjà posé par `validate-reference-fixtures.ts` et `handbook:validate:fixtures` | M      |

Ce qui existe et couvre réellement :

- **30 cas de conformité** dans `corpus/contract/cases.json`, dont **13 acceptations et 17 rejets** sur **11 cibles** : la moitié négative est là, ce qui est exactement ce qui manque d'habitude. Un schéma qui accepte tout échoue.
- **33 exemples** sous `examples/`, validés par `validate` (`tools/validate-examples.ts`).
- **17 étapes** dans `check` (`package.json:17`), du typecheck jusqu'aux épingles inter-outils, plus `git diff --exit-code` en CI (`ci.yml:24`) qui interdit qu'un artefact généré diverge de sa source.
- **Le typecheck couvre l'outillage** : `tsconfig.json:12` inclut `tools`, donc les 25 fichiers du harnais sont vérifiés par le compilateur même s'ils ne sont pas assertés.
- **Le job `contract` est un vrai test d'intégration** : il clone quatre dépôts, les installe avec le bon gestionnaire pour chacun (la ligne `ci.yml:42-52` préfère `pnpm@10 --frozen-lockfile` quand un `pnpm-lock.yaml` existe, avec le commentaire qui explique pourquoi le `package-lock.json` du handbook est périmé) et fait tourner `validate:cross-tool` contre l'ensemble.
- **La CI est verte et rapide** : les six derniers passages sur `main` réussissent en 36 à 44 secondes.

Mode dégradé : **no coverage tool, static inspection only** — aucun outil de couverture n'est installé, donc les affirmations ci-dessus portent sur le nombre de cas, de cibles et de rejets du corpus, et sur ce que le code des validateurs parcourt, pas sur un pourcentage de lignes.

## Top actions

1. **Brancher ou supprimer les deux validateurs orphelins** (`handbook:validate:install`, `validate:pack`) : effort `S`, 407 lignes qui ne prouvent rien tant qu'elles ne tournent pas.
2. **Détecter la dérive des consommateurs** (`ci.yml:25`) : les épingles rendent la CI stable, et aveugle au `main` des deux outils qui consomment ce contrat.
3. **Exercer la branche booléenne du rendu** (`tools/render-handbook-preview.ts:136`).

## Coverage

- **Scanned**: tests (présence d'un lanceur et de fichiers de test, contenu et équilibre du corpus de conformité — acceptations contre rejets, nombre de cibles —, enchaînement réel des validateurs, scripts jamais déclenchés, portée du typecheck sur l'outillage, ce que prouve le job d'intégration, durée et état de la CI)
- **Skipped**: none, mais le pilier a tourné en mode dégradé — no coverage tool, static inspection only
