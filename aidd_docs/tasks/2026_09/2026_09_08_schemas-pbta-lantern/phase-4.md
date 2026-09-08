---
status: pending
---

# Instruction: Valideur croisé

## Architecture projection

```txt
.
├── tools/
│   └── validate-references.ts    ✅ vérifie ce qu'Ajv ne peut pas voir
├── package.json                  ✏️ script validate:refs, chaîné dans check
├── README.md                     ✏️ la chaîne de validation compte deux passes
├── CONTRIBUTING.md               ✏️ idem pour le contributeur
└── CHANGELOG.md                  ✏️ une ligne sous `## [Unreleased]`
```

## Tasks to do

### `1)` Charger le corpus

> Une passe qui lit les exemples, pas les schémas.

1. Créer `tools/validate-references.ts`.
2. Pour chaque jeu de `GAMES` visé par au moins une cible, charger `examples/<jeu>/game-definition/<jeu>.toml`, le nom du fichier suivant celui du dossier du jeu comme le fixent les conventions du plan. Absence de définition : avertir et passer au jeu suivant, sans échec. Un second fichier dans ce dossier est une erreur et non un avertissement : deux définitions concurrentes rendent indécidable tout ce qui suit.
3. Charger tous les fichiers de contenu du jeu, en réutilisant la lecture TOML et JSON déjà écrite dans `tools/validate-examples.ts` plutôt que de la dupliquer.

### `2)` Règles de cohérence

> Ce que JSON Schema laisse passer. Écrire les neuf règles maintenant, pour tous les types de contenu, y compris ceux que les phases 5 et 6 n'ont pas encore introduits : une règle dont le corpus ne porte pas encore la matière ne fait rien et ne risque rien, et l'écrire ici évite de rouvrir le fichier à chaque phase suivante.

1. Toute clé de `stats` d'un livret existe dans `character.stats` de la définition du jeu, et toute clé d'`attributes` existe dans le bloc d'attributs correspondant au type de contenu : `character.attributes` pour un livret, `npc.attributes` pour un PNJ.
2. Tout `moveType` d'un move existe dans les `moveTypes` du jeu, côté personnage ou côté PNJ. Descendre aussi dans les moves inline : la branche inline de `moveEntry` ne perd que `game` et `slug`, elle garde `moveType`, et un move écrit sur place dans un livret ou un PNJ doit donc citer un type déclaré. Trois règles descendent ainsi dans les moves inline : celle-ci, la 7 et la 8. La 3 porte sur le `gear` d'un livret et non sur un move ; les 4 et 5 reposent sur un `slug`, qu'un move inline n'a pas.
3. Tout `equipmentType` cité existe dans les `equipmentTypes` du jeu.
4. Tout slug de référence pointe sur un fichier existant du même jeu et du type attendu. Traiter tous les champs de référence de la même façon plutôt qu'au cas par cas : `ref` d'un move de livret, `ref` d'un choix de `choiceSets`, `startingMoves`, `playbook` d'un move, `ref` d'une entrée de `cast`. Les deux derniers pointent respectivement sur un livret et sur un PNJ, pas sur un move.
5. Les slugs sont uniques par jeu et par type de contenu. Ne compter que les fichiers de contenu : un move inline n'a pas de `slug`, il ne participe ni à cette règle ni à la précédente.
6. Le champ `game` d'un fichier de contenu vaut le `folder` d'une entrée de `GAMES`, et ce `folder` est celui du dossier qui porte le fichier. Comparer au `folder` et non à la clé du dictionnaire : les deux diffèrent dès que l'entrée porte une abréviation, `motw` contre `monster-of-the-week`. C'est la contrepartie du choix de ne pas énumérer les jeux dans le schéma : sans cette règle, une faute de frappe sur `game` traverse les deux passes sans un mot.
7. Toute clé de `results` d'un move existe dans les `rollResults` du jeu. Signaler en avertissement plutôt qu'en erreur : un move peut légitimement nommer un résultat hors barème.
8. Un move sans bloc de jet ne porte pas de `results` : contrainte entre deux champs, donc invisible pour Ajv.
9. Une horloge dont `filled` dépasse son nombre de segments, preset résolu compris, est une erreur.

Neuf règles, et non toutes : la phase 6 en ajoute trois, sur les `threatTypes`, les `impulses` et les `clockPresets`. Elles ne s'écrivent pas ici parce que le bloc `fronts` de la définition de jeu n'existe pas encore — une règle peut devancer un contenu, pas un vocabulaire dont elle tire la liste des valeurs licites.

### `3)` Sortie et intégration

1. Grouper les messages par fichier, citer la clé fautive et la valeur attendue. Sortir en code 1 dès une erreur, 0 sur avertissements seuls.
2. Ajouter le script `validate:refs` à `package.json` et le chaîner dans `check`, après `validate`.
3. Documenter la deuxième passe dans le README et dans `CONTRIBUTING.md`.
4. Ajouter une ligne sous le `### Added` de la section `## [Unreleased]` du `CHANGELOG.md`.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Sur un jeu visé par une cible mais dont le fichier de définition manque, la commande avertit et sort en succès. Le provoquer en renommant temporairement `examples/masks/game-definition/masks.toml` : un jeu simplement déclaré dans `GAMES` sans cible n'est jamais visité par la passe, l'avertissement ne peut donc pas venir de là. |
| 1    | Déposer un second fichier dans `examples/masks/game-definition/` fait échouer la passe, les deux fichiers nommés.                         |
| 2    | Remplacer une clé de stat d'un livret par un nom inexistant fait échouer la passe, avec le fichier et la clé nommés.                      |
| 2    | Remplacer le `game` d'un fichier de contenu par un slug absent de `GAMES` fait échouer la passe.                                          |
| 2    | Sur un corpus sans horloge, la règle des horloges ne produit ni erreur ni avertissement ; son effet se mesure en phase 6.                 |
| 2    | Un move dont le `moveType` n'existe dans aucun des deux blocs du jeu fait échouer la passe ; un `equipmentType` absent des vocabulaires du jeu aussi. |
| 2    | Deux fichiers de move du même jeu portant le même `slug` font échouer la passe ; le même nom porté par un move inline ne la fait pas échouer, un move inline n'ayant pas de `slug`. |
| 2    | Une clé de `results` absente des `rollResults` du jeu produit un avertissement et laisse le code de sortie à 0 ; un move sans bloc de jet mais portant `results` fait échouer la passe. |
| 3    | Remplacer un `ref` de move par un slug inexistant fait échouer la passe ; `npm.cmd run check` échoue alors aussi, alors qu'Ajv seul passait. |
