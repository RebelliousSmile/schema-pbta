---
status: done
---

# Instruction: Front générique

## Architecture projection

```txt
.
├── src/
│   └── zod/
│       ├── front.ts              ✅ front, menaces, horloges, présages
│       ├── game-definition.ts    ✏️ bloc fronts, vocabulaires du jeu
│       └── constants.ts          ✏️ cible front pour masks
├── examples/
│   └── masks/
│       ├── game-definition/
│       │   └── masks.toml        ✏️ vocabulaires de menaces
│       └── front/
│           └── the-quiet-syndicate.toml  ✅ front original
├── schemas/
│   └── masks/
│       ├── front.schema.json            ✅ généré
│       └── game-definition.schema.json  ✏️ régénéré
└── CHANGELOG.md                  ✏️ une ligne sous `## [Unreleased]`
```

## Tasks to do

### `1)` Vocabulaires dans la définition de jeu

> Le front est générique ; ce qui varie d'un jeu à l'autre vit dans la définition.

1. Ajouter à `src/zod/game-definition.ts` un bloc `fronts` facultatif.
2. Y déclarer `threatTypes` : enregistrement de clé vers libellé, l'équivalent des catégories de menace propres à chaque jeu.
3. Y déclarer `impulses` : enregistrement de clé vers libellé.
4. Y déclarer `clockPresets` : tableau de `{ key, label, segments }`, où `segments` est un tableau de libellés ordonnés. C'est ce qui accueillera le countdown de Monster of the Week sans que le schéma de front change.
5. Renseigner ces vocabulaires dans `examples/masks/game-definition/masks.toml`, puis régénérer le schéma.

### `2)` Schéma de front

1. Créer `src/zod/front.ts`.
2. Champs d'identité : `slug`, `name`, `game`, `concept`, `description` facultative.
3. Bloc `stakes` facultatif : tableau de questions ouvertes en texte.
4. Bloc `cast` facultatif : tableau de `{ name, role, ref }`, où `ref` cite facultativement un PNJ par slug.
5. Bloc `threats` : tableau de `{ name, type, impulse, description, moves, clock }`. `type` et `impulse` citent les vocabulaires du jeu ; `moves` réutilise le `moveEntry` de `src/zod/move.ts`.
6. Définir une `clock` réutilisable : `{ label, preset, segments, filled }`. Soit `preset` cite un `clockPresets` du jeu, soit `segments` liste des libellés sur place ; `filled` est le nombre de segments cochés. L'exclusion entre `preset` et `segments` s'écrit en union de deux objets stricts ; le rapport entre `filled` et le nombre de segments ne s'exprime pas en JSON Schema et revient à la passe croisée de la phase 4.
7. Bloc `portents` facultatif : tableau de `{ text, done }`, l'équivalent des présages.
8. Champ `doom` : le texte de ce qui advient si rien n'arrête le front. Obligatoire, comme `threats` : un front sans menace ni échéance ne décrit rien. Les quatre autres blocs sont facultatifs, un front s'écrivant souvent par étapes.

### `3)` Cible, génération et exemple

1. Ajouter la cible `front` pour `masks`, lancer `npm.cmd run gen`.
2. Écrire un front entièrement original dans `examples/masks/front/`, avec deux menaces, une horloge par preset et une horloge à segments écrits sur place.
3. Étendre `tools/validate-references.ts` : `type` et `impulse` d'une menace, ainsi que le `preset` d'une horloge, doivent exister dans le bloc `fronts` du jeu. La règle d'horloge posée en phase 4 trouve ici son premier corpus.
4. Ajouter une ligne sous le `### Added` de la section `## [Unreleased]` du `CHANGELOG.md`.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Une définition de jeu sans bloc `fronts` reste valide ; les exemples des phases précédentes passent toujours.                 |
| 2    | Une horloge portant à la fois `preset` et `segments` est refusée par Ajv ; une horloge dont `filled` dépasse le nombre de segments passe Ajv et fait échouer la passe croisée. |
| 2    | Un front sans `stakes`, sans `cast` et sans `portents` est accepté ; un front sans `threats` ou sans `doom` est refusé. |
| 3    | Une menace citant un `impulse` absent du vocabulaire du jeu fait échouer la passe croisée, pas Ajv ; il en va de même d'un `type` de menace inconnu et d'une horloge citant un `preset` absent des `clockPresets` du jeu. |
