---
status: done
---

# Instruction: Schéma de PNJ

## Architecture projection

```txt
.
├── src/
│   └── zod/
│       ├── npc.ts                ✅ fiche d'adversaire
│       └── constants.ts          ✏️ cible npc pour masks
├── examples/
│   └── masks/
│       └── npc/
│           └── the-glasswright.toml  ✅ PNJ original
├── schemas/
│   └── masks/
│       └── npc.schema.json       ✅ généré
└── CHANGELOG.md                  ✏️ une ligne sous `## [Unreleased]`
```

## Tasks to do

### `1)` Modèle de PNJ

1. Créer `src/zod/npc.ts`.
2. Champs d'identité : `slug`, `name`, `game`, `description` obligatoires, `tags` en tableau de chaînes facultatif. Un adversaire sans étiquette reste un adversaire ; un adversaire sans description ne se rend pas.
3. Bloc `attributes` facultatif : enregistrement de clé vers valeur, les clés devant exister dans `npc.attributes` de la définition du jeu. Facultatif parce qu'un adversaire décrit en deux lignes n'en porte aucun.
4. Bloc `moves` : réutiliser le `moveEntry` défini en phase 3 dans `src/zod/move.ts`, référence par slug ou move inline. Un move de PNJ n'a pas de bloc de jet obligatoire.
5. Champ `drive` facultatif : l'impulsion ou la motivation, nommée différemment selon les jeux, donc générique ici.

### `2)` Cible, génération et exemple

1. Ajouter la cible `npc` pour `masks`, lancer `npm.cmd run gen`.
2. Écrire un adversaire entièrement original dans `examples/masks/npc/`, avec au moins un move inline et un move cité par slug.
3. Vérifier que `validate:refs` accepte ses clés d'attributs, par la règle 1 de la phase 4 appliquée au bloc `npc.attributes`.
4. Ajouter une ligne sous le `### Added` de la section `## [Unreleased]` du `CHANGELOG.md`.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                     |
| ---- | --------------------------------------------------------------------------------------------------------- |
| 1    | Un PNJ sans `attributes` ni `tags` est accepté ; un PNJ sans `name` est refusé.                          |
| 2    | `npm.cmd run check` valide le PNJ d'exemple, la passe croisée comprise.                                   |
