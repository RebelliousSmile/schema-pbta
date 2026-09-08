---
status: done
---

# Instruction: Schéma de livret

## Architecture projection

```txt
.
├── src/
│   └── zod/
│       ├── playbook.ts           ✅ schéma d'un livret de personnage
│       ├── move.ts               ✏️ moveEntry, partagé avec les phases 5 et 6
│       └── constants.ts          ✏️ cible playbook pour masks
├── examples/
│   └── masks/
│       └── playbook/
│           └── the-ember.toml    ✅ livret original, référence et move inline
├── schemas/
│   └── masks/
│       └── playbook.schema.json  ✅ généré
└── CHANGELOG.md                  ✏️ une ligne sous `## [Unreleased]`
```

## Tasks to do

### `1)` Identité et valeurs de départ

> Ce qu'un livret fixe avant toute personnalisation.

1. Créer `src/zod/playbook.ts`.
2. Champs d'identité : `slug`, `name`, `game`, `actorType` facultatif, `description`, `playbookImage` facultatif.
3. Bloc `stats` : enregistrement de clé de stat vers valeur de départ entière. Les clés doivent exister dans la définition du jeu, vérification repoussée en phase 4.
4. Champ `statsDetail` facultatif : la ligne de texte qui accompagne la répartition, présente dans le modèle amont.
5. Bloc `attributes` facultatif : valeurs initiales d'attributs, en enregistrement de clé vers valeur.

### `2)` Moves du livret

> Trancher entre référence et texte sur place, comme décidé au brainstorm.

1. Définir `moveEntry` dans `src/zod/move.ts` et non dans `playbook.ts` : les phases 5 et 6 le réutilisent, et rien en lui n'est propre au livret. Une union de deux objets stricts : soit `{ ref }` portant un slug de move, soit un move écrit sur place réutilisant le schéma de la phase 2 privé de ses champs `game` et `slug`. La strictesse est ce qui fait rejeter un objet hybride ; sans elle l'union laisse passer un `ref` accompagné d'un corps.
   Exporter les deux branches sous leurs propres noms en plus de leur union : `moveEntry` est une `z.union`, et une union Zod ne porte pas `.extend()`. La tâche 3 en a besoin séparément.
   Retirer `slug` de la branche inline est ce qui rend un move inline non adressable : aucun `ref` ne peut le viser, et il n'entre ni dans le contrôle de référence ni dans le contrôle d'unicité de la phase 4. Un move destiné à être cité ailleurs s'écrit dans `examples/<jeu>/move/`.
2. Définir `moves` en tableau de `moveEntry`.
3. Ajouter un champ `startingMoves` facultatif : les slugs accordés d'office à la création, distincts de la liste des moves disponibles.

### `3)` Choix de création et avancement

> Porter ce que Foundry appelle `choiceSets`.

1. Définir `choiceSets` en tableau de `{ title, description, type, repeatable, grantOn, choices }`.
2. `type` vaut `single` ou `multi`.
3. Chaque choix porte `ref` ou un contenu inline, plus `granted` et `advancement` entiers positifs. Bâtir le choix en union des deux branches exportées par la tâche 2, chacune étendue de ces deux champs, plutôt que de redécrire l'alternative : l'exclusion entre référence et corps sur place n'est exécutoire que si les deux branches sont des objets stricts, et la redécrire ici la perdrait. Remplacer l'`uuid` du modèle amont par un slug, et noter l'équivalence en commentaire : c'est la correspondance que l'adaptateur d'import devra rétablir.
4. Ajouter un bloc `advancement` facultatif : liste d'options d'évolution en texte.

### `4)` Questions de création et équipement

1. Bloc `creation` facultatif : tableau de `{ label, options }` pour les questions posées à la création (apparence, nom, relations).
2. Bloc `gear` facultatif : tableau de `{ name, equipmentType, description, quantity, tags }`, dont seul `name` est obligatoire. Une pièce d'équipement se cite souvent sans quantité ni catégorie.

### `5)` Cible, génération et exemple

1. Ajouter la cible `playbook` pour `masks`, lancer `npm.cmd run gen`.
2. Écrire un livret entièrement original dans `examples/masks/playbook/` — nom et texte absents du jeu publié — citant par slug l'un des moves de la phase 2 et déclarant l'autre sur place, afin que les deux branches de l'union soient exercées.
3. Ajouter une ligne sous le `### Added` de la section `## [Unreleased]` du `CHANGELOG.md`.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Un livret sans `attributes` est accepté ; un livret sans `stats` est refusé.                                                       |
| 2    | Une entrée de `moves` portant à la fois `ref` et un corps de move inline est refusée par Ajv, les deux branches de l'union étant strictes. |
| 3    | Un `choiceSets` dont `type` vaut autre chose que `single` ou `multi` est refusé ; un choix portant à la fois `ref` et un corps inline l'est aussi, par la même strictesse que les entrées de `moves`. |
| 4    | Une entrée de `gear` sans `quantity` est acceptée.                                                                                 |
| 5    | `npm.cmd run check` valide le livret d'exemple, qui contient bien une référence par slug et un move inline.                        |
