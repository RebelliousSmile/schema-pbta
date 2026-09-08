---
status: done
---

# Instruction: Schéma de move

## Architecture projection

```txt
.
├── src/
│   └── zod/
│       ├── move.ts               ✅ schéma d'un move autonome
│       └── constants.ts          ✏️ cible move pour masks
├── examples/
│   └── masks/
│       └── move/
│           ├── hold-the-line.toml    ✅ move de base original, avec jet
│           └── borrowed-nerve.toml   ✅ move de livret original, sans jet
├── schemas/
│   └── masks/
│       └── move.schema.json      ✅ généré
└── CHANGELOG.md                  ✏️ une ligne sous `## [Unreleased]`
```

## Tasks to do

### `1)` Modèle canonique du move

> Reprendre ce que porte le move Foundry, en texte lisible plutôt qu'en HTML.

1. Créer `src/zod/move.ts`.
2. Champs d'identité : `slug` (réutiliser `slugSchema`), `name`, `game`, `moveType` (clé devant exister dans les `moveTypes` du jeu), `playbook` facultatif en slug.
3. Champ `description` en texte long. Ne pas accepter de HTML : la source Foundry est un `HTMLField`, la conversion est du ressort de l'adaptateur d'import, planifié à part.
4. Champ `trigger` facultatif : la phrase de déclenchement, que Foundry noie dans la description mais qu'un rendu imprimé isole.
5. Bloc de jet facultatif : `rollFormula`, `rollType` (stat, formule, ou aucun), `rollMod` entier.
6. Bloc `results` : enregistrement de clés libres vers `{ label, text }`, aligné sur `moveResults` du modèle amont, dont le champ `value` en HTML devient ici `text`. Les clés attendues suivent les `rollResults` du jeu, la vérification est repoussée en phase 4.
7. Champs facultatifs restants : `uses` entier, `choices` en texte long, `tags` en tableau de chaînes.

### `2)` Déclarer la cible et générer

1. Ajouter la cible `move` pour `masks` dans `TARGETS`.
2. Lancer `npm.cmd run gen`.

### `3)` Exemples inventés

> Prouver la forme sans reprendre le texte publié.

1. Écrire deux moves entièrement originaux, mécaniquement crédibles pour Masks mais dont ni le nom ni le texte n'existent dans le jeu publié : un move à jet sur une stat avec trois résultats, un move sans jet.
2. Poser chaque fichier à plat dans `examples/masks/move/`, sans clé `$schema`.
3. Employer des `\n\n` dans les chaînes basiques pour les sauts de paragraphe, afin que la conversion TOML vers JSON reste fidèle à l'octet.
4. Ajouter une ligne sous le `### Added` de la section `## [Unreleased]` du `CHANGELOG.md`.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                  |
| ---- | ---------------------------------------------------------------------------------------------------------------------- |
| 1    | Un move sans bloc de jet est accepté ; un move dont `slug` n'est pas en kebab-case est refusé.                        |
| 2    | `schemas/masks/move.schema.json` existe et décrit `results` en objet de clés libres.                                   |
| 3    | `npm.cmd run check` valide les deux fichiers d'exemple et sort en succès ; ni leurs noms ni leurs textes ne reprennent le jeu publié. |
