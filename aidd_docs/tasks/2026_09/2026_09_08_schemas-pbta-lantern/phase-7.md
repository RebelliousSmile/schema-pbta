---
status: pending
---

# Instruction: Monster of the Week

## Architecture projection

```txt
.
├── src/
│   └── zod/
│       ├── constants.ts          ✏️ cinq cibles pour monster-of-the-week
│       ├── game-definition.ts    ✏️ seulement si le second jeu révèle un manque
│       └── front.ts              ✏️ idem
├── examples/
│   └── monster-of-the-week/
│       ├── game-definition/monster-of-the-week.toml  ✅ dérivée du preset amont
│       ├── move/                 ✅ deux moves originaux
│       ├── playbook/             ✅ un livret original
│       ├── npc/                  ✅ un monstre original
│       └── front/                ✅ un mystère à countdown
├── schemas/
│   └── monster-of-the-week/      ✅ cinq schémas générés
└── CHANGELOG.md                  ✏️ une ligne sous `## [Unreleased]`
```

## Tasks to do

### `1)` Définition de jeu

> Deuxième passage de la chaîne, sur un preset que personne n'a écrit pour ce dépôt.

1. Ajouter les cinq cibles pour `monster-of-the-week` dans `TARGETS`, puis lancer `npm.cmd run gen`.
2. Écrire `examples/monster-of-the-week/game-definition/monster-of-the-week.toml` à partir du preset amont : attributs `harm` en Clock, `luck` en Clock, `unstable` en Checkbox, `armour` en Number, `xp` en Xp, et les blocs de texte long.
3. Le bloc PNJ du preset emploie `harm` en Resource là où le personnage emploie Clock : vérifier que l'union d'attributs accepte ce mélange sans retouche.

### `2)` Le mystère comme front

> L'épreuve de vérité du modèle générique.

1. Déclarer dans `fronts.clockPresets` le countdown du jeu, en segments ordonnés du jour à minuit. Relever le nombre exact de segments sur la source avant d'écrire plutôt que de le supposer.
2. Déclarer les `threatTypes` du jeu et leurs impulsions.
3. Écrire un mystère original dans `examples/monster-of-the-week/front/`, employant ce preset d'horloge.
4. Si le vocabulaire du jeu ne rentre pas, corriger `src/zod/front.ts` plutôt que de tordre l'exemple, puis revalider les exemples Masks pour garantir l'absence de régression.

### `3)` Contenu restant

1. Écrire deux moves, un livret et un monstre entièrement originaux pour le jeu.
2. Lancer `npm.cmd run check` sur l'ensemble des deux jeux.
3. Ajouter la dernière ligne sous le `### Added` de `## [Unreleased]`. Laisser la section ouverte : couper une version est un acte de publication, hors de ce plan.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `npm.cmd run gen` écrit cinq fichiers sous `schemas/monster-of-the-week/`, et la définition du jeu passe la validation sans modifier le schéma d'attribut. |
| 2    | Le mystère d'exemple valide, son horloge citant le preset de countdown par sa clé.                                                        |
| 3    | `npm.cmd run check` passe sur les deux jeux, exemples Masks compris, passe croisée comprise.                                                |
