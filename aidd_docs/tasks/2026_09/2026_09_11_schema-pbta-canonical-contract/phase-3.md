---
status: pending
---

# Instruction: Compatibilité, CI et publication du contrat

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
schema-pbta/
├── .github/workflows/ci.yml        ✏️ génération reproductible, tags complets et tarball
├── README.md                       ✏️ installation, API et politique de versions
├── corpus/README.md                ✏️ procédure de conformité consumer
├── docs/
│   └── compatibility.md            ✅ matrice package schéma TOML et hosts
├── package.json                    ✏️ publication publique et commandes finales
└── tools/
    ├── validate-package.ts         ✏️ inspection finale du contenu publié
    └── validate-version-compat.ts  ✅ comparaison avec la majeure publiée

Aucune suppression.
```

## User Journey

```mermaid
flowchart TD
  A[Mainteneur propose schema-pbta 1.0.0] --> B[CI régénère et valide]
  B --> C[CI teste le tarball]
  C --> D[Publier package et tag v1 immuable]
  D --> E[Handbook et Lantern épinglent 1.0.0]
  E --> F[Chaque consumer exécute le corpus commun]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Partir d’un clone complet avec npm ci => dépendances et tags disponibles: 5: cli
  section Happy path
    Exécuter check puis inspecter le tarball => contrat v1 reproductible et publiable: 5: cli
  section Edge case - artefact généré périmé
    Modifier une source sans régénérer => CI détecte le diff produit: 1: cli
  section Edge case - rupture sous mauvaise version
    Changer une forme v1 déjà publiée => contrôle exige une nouvelle majeure: 1: cli
  section Edge case - premier tag
    Valider avant l’existence du tag v1 => artefacts committés servent de baseline: 1: cli
  section Edge case - nom npm occupé
    Revérifier schema-pbta avant publication => release arrêtée avant création du tag: 1: cli
  section Teardown
    Supprimer les installations temporaires => arbre Git propre: 5: system
```

## Tasks to do

### `1)` Documenter le contrat importable

> Remplacer les instructions de copie par l’utilisation du package canonique.

1. Donner les exemples d’installation et d’import ESM des schémas, types, codecs et versions.
2. Décrire `cases.json` et la commande minimale qu’un consumer doit exécuter.
3. Expliquer la frontière entre schéma, formulaire Lantern, renderer Handbook et pack de jeu.

### `2)` Fixer la politique de compatibilité

> Dire précisément ce qui déclenche patch, minor ou nouvelle majeure de schéma.

1. Publier la matrice version npm, majeure de schéma, TOML 1.0.0 et hosts compatibles.
2. Classer comme rupture tout changement faisant rejeter ou perdre une valeur v1 auparavant acceptée.
3. Avant la première release, vérifier la reproductibilité de `schemas/v1`, puis créer le tag v1 sur le commit de `schema-pbta@1.0.0`.
4. Après cette release, comparer les schémas générés au tag immuable v1 et exiger `schemas/v2` dès qu’une forme diverge.
5. Interdire le déplacement ou la réécriture d’un `$id` déjà publié.

### `3)` Fermer la CI sur l’artefact publié

> Faire échouer une release inutilisable par les consommateurs.

1. Configurer le checkout CI avec l’historique et les tags complets nécessaires à la comparaison de version.
2. Exécuter génération, validations structurelles, références et corpus depuis `npm ci`.
3. Vérifier que la génération ne laisse aucun diff et que le tarball passe son installation isolée.
4. Vérifier la compatibilité contre la majeure publiée, puis la présence de `cases.json` et de tous ses fichiers dans le tarball.

### `4)` Publier et transmettre le contrat

> Livrer le package avant que Handbook ne publie les capacités qui en dépendent.

1. Déclarer la publication publique et revérifier le nom npm immédiatement avant la release.
2. Arrêter sans tag si l’identité ou l’autorisation npm n’est pas disponible.
3. Préparer localement le tag v1 sur le commit validé, publier `schema-pbta@1.0.0`, puis pousser ce tag seulement après confirmation du registre npm.
4. Supprimer uniquement le tag local non poussé si la publication npm échoue ; ne jamais déplacer un tag distant.
5. Communiquer version et intégrité du tarball à `obsidian-handbook#27` et `lantern#2`.
6. Faire vérifier `cases.json` par chaque consumer dans sa propre CI, avec esbuild pour Handbook et Vite pour Lantern.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | La documentation n’invite plus à copier les schémas et montre les imports ESM depuis `schema-pbta`. |
| 2 | La matrice associe package, schéma, TOML et hosts ; chaque classe SemVer est illustrée. |
| 2 | La première release crée sa baseline sans tag préalable ; les exécutions suivantes utilisent uniquement le tag v1 immuable. |
| 2 | Modifier une forme publiée sous v1 échoue tant que le contrat ne crée pas une nouvelle majeure. |
| 3 | La CI échoue sur génération périmée, entrée publique manquante, corpus incomplet ou tarball non installable. |
| 3 | Le tarball contient le code compilé, les schémas v1 et tous les cas référencés, sans module interne accidentel. |
| 4 | La publication s’arrête avant tout tag si le nom npm ou l’autorisation de publication est indisponible. |
| 4 | `schema-pbta@1.0.0` et le tag immuable v1 désignent le même commit et la même forme de contrat. |
| 4 | Un échec de publication ne laisse aucun tag v1 distant ; après succès npm, le tag distant n’est jamais déplacé. |
| 4 | Handbook et Lantern peuvent épingler exactement `1.0.0` et lancer la même matrice dans leurs propres CI. |
| 4 | L’import ESM passe le bundle esbuild de Handbook et le bundle Vite de Lantern sans adaptateur local. |
