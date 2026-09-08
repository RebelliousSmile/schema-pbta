---
objective: "Le dépôt publie des schémas JSON canoniques pour le contenu PbtA — définition de jeu, move, livret, PNJ, front — validés sur des exemples Masks puis éprouvés sur Monster of the Week."
status: in-progress
---

# Plan: Schémas PbtA pour une Lantern multi-systèmes

## Overview

| Field      | Value                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**   | Décrire le contenu PbtA en schémas JSON lisibles et éditables à la main, dérivés du vocabulaire du système Foundry `pbta` sans en être le miroir. |
| **Source** | Brainstorm de session du 2026-09-08, non persisté ailleurs.                                                                              |

## Conventions

Elles valent pour toutes les phases et ne sont pas répétées dans chacune.

- **Le champ `game` d'un fichier de contenu porte le `folder` de l'entrée de `GAMES`, pas sa clé ni son `abbr`.** Les trois diffèrent : `constants.ts` déclare `motw: { folder: "monster-of-the-week", abbr: "motw" }`. Le `folder` est retenu parce que c'est déjà lui qui nomme les dossiers de `examples/` et de `schemas/` : un fichier de contenu et le chemin qui le porte disent alors la même chose. Partout où les phases écrivent `<jeu>`, lire le `folder`.
- **Un seul fichier de définition par jeu**, nommé d'après le dossier du jeu : `examples/<jeu>/game-definition/<jeu>.toml`. Le valideur croisé s'appuie sur cette règle ; un second fichier dans ce dossier est une erreur.
- **Aucun exemple ne reprend de contenu publié.** Ni texte, ni titre de move, ni nom de livret existant. Les noms de fichiers d'exemple donnés dans les phases sont indicatifs et doivent rester originaux.
- **Appeler `npm.cmd`, pas `npm`.** Sur cette machine `npm` ne se résout pas sous Bash ; `npm.cmd run gen`, `npm.cmd run check`. Sous PowerShell, `npm` fonctionne normalement.
- **Un `M` sur un schéma régénéré ne prouve pas une dérive.** Trancher avec `git hash-object --path <f> <f>` comparé à `git rev-parse HEAD:<f>`.
- **Le champ `version` d'une définition de jeu suit la définition elle-même**, pas la version du dépôt ni celle du jeu : il s'incrémente quand les stats, attributs ou vocabulaires du fichier changent.
- **Ce que le schéma ne peut pas exprimer revient au valideur croisé.** Une contrainte entre deux champs — une horloge dont le remplissage dépasse ses segments, une entrée portant à la fois une référence et un corps inline — ne survit pas à la conversion en JSON Schema. Le schéma dit la forme, la passe croisée dit la cohérence.
- **Deux jeux implémentés, cinq déclarés.** Le plan écrit les exemples de Masks puis de Monster of the Week. Monsterhearts, Urban Shadows et The Sprawl entrent dans `GAMES` sans cible : l'entrée est inerte, elle ne crée ni dossier ni schéma, et elle marque la file d'attente.
- **Hors périmètre : l'import depuis Foundry.** La décision d'un format canonique le suppose possible et le plan en préserve les conditions — équivalences documentées phase par phase — mais aucune phase ne construit d'adaptateur. Il fera l'objet d'un plan distinct, une fois les cinq schémas stabilisés sur deux jeux.

## Phases

| #   | Phase                             | File                         |
| --- | --------------------------------- | ---------------------------- |
| 1   | Définition de jeu et amorce Masks | [`phase-1.md`](./phase-1.md) |
| 2   | Schéma de move                    | [`phase-2.md`](./phase-2.md) |
| 3   | Schéma de livret                  | [`phase-3.md`](./phase-3.md) |
| 4   | Valideur croisé                   | [`phase-4.md`](./phase-4.md) |
| 5   | Schéma de PNJ                     | [`phase-5.md`](./phase-5.md) |
| 6   | Front générique                   | [`phase-6.md`](./phase-6.md) |
| 7   | Monster of the Week               | [`phase-7.md`](./phase-7.md) |

## Resources

| Source                                                                     | Verified                                                                                                                                                        |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `https://raw.githubusercontent.com/wiki/asacolips-projects/pbta/Attribute-Types.md` | Onze types d'attribut et leurs propriétés : Number, Text, LongText, Resource, Clock, Xp, Checkbox, ListOne, ListMany, Roll, Track. `ListMany` n'accepte pas `default`. |
| `https://raw.githubusercontent.com/wiki/asacolips-projects/pbta/Sheet-Presets.md`   | Presets TOML pour Apocalypse World, Masks, Rovers, One Shot World, The Sprawl, Monster of the Week, Brindlewood Bay. Ni Urban Shadows ni Monsterhearts n'y figurent : leur configuration vient de modules tiers. Le preset Masks est publié sous CC BY 4.0. |
| `https://github.com/philote/urban-shadows-pbta`, fichier `module/helpers/pbta-config.mjs` | Urban Shadows 2E a bien une configuration de feuille, écrite en JavaScript et non en TOML : `game.pbta.sheetConfig` sous Apache-2.0. Elle introduit `statClock` et des stats portant `steps { value, max }`, absents des presets TOML. |
| `https://github.com/YanKlInnomme/FoundryVTT-monsterhearts`, fichier `monsterhearts.js` | Monsterhearts a lui aussi une configuration de feuille en JavaScript, sous GPL-3.0, construite dynamiquement : stats issues d'une liste, attribut `darkestSelf`, `moveTypes` calculés. |
| `https://raw.githubusercontent.com/asacolips-projects/pbta/main/src/module/settings.js` | Le TOML par défaut du système emploie `attributesTop` et `attributesLeft` là où les presets récents emploient `attributes` avec `position` ; il écrit `statToggle = false` et admet `range = false` pour désactiver un palier. |
| `https://raw.githubusercontent.com/wiki/asacolips-projects/pbta/Playbooks.md`       | Un livret est un type d'item, et la clé `playbook` d'un attribut restreint sa visibilité par nom ou par slug.                                                     |
| `https://raw.githubusercontent.com/asacolips-projects/pbta/main/src/module/data/item/playbook.js` | Forme réelle du livret : `slug` validé, `actorType`, `stats`, `statsDetail`, `attributes`, `choiceSets[]` avec `grantOn`, `advancement`, `granted`, choix par `uuid`. |
| `https://raw.githubusercontent.com/asacolips-projects/pbta/main/src/module/data/shared.js` | `createMoveData()` donne `moveType`, `rollFormula`, `moveResults` (mapping `key`/`label`/`value` HTML). `createItemResources()` ajoute `uses`.                     |
| `https://raw.githubusercontent.com/asacolips-projects/pbta/main/src/module/data/item/move.js` | Le move ajoute `rollType`, `rollMod`, `actorType`, `choices` (HTML) au socle partagé, et hérite de `description` (HTML).                                          |
| `https://raw.githubusercontent.com/asacolips-projects/pbta/main/src/module/data/actor/templates/actor.js` | Un acteur porte `stats`, `attributes`, `details` en objets libres : la structure vient de la configuration du monde, pas du modèle.                               |

## Decisions

| Decision                                                                        | Why                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format canonique, adaptateur d'import remis à plus tard                          | Le format Foundry est orienté interface : clés d'attributs arbitraires, HTML brut, références par `uuid`. Un livret écrit à la main et rendu en page imprimable ne le tolère pas. |
| Une définition de jeu par jeu, partageant un seul schéma                         | Les stats et les types d'attributs sont définis une fois par jeu dans le TOML du monde. Les répéter dans chaque livret garantit la dérive.                    |
| Front générique paramétré par la définition de jeu                               | Aucun modèle de front n'existe côté Foundry. Les horloges du Sprawl et les countdowns de Monster of the Week sont deux vocabulaires d'une même forme.        |
| Un valideur croisé en plus d'Ajv                                                  | JSON Schema ne sait pas vérifier qu'un livret n'emploie que des stats déclarées ni que ses slugs de move existent. Sans cette passe, la référence par slug ne vaut rien. |
| Exemples entièrement inventés                                                     | Aucun des cinq jeux déclarés n'a de SRD ouvert. Seule la configuration de feuille de Masks est sous CC BY, pas le contenu des livrets.                        |
| Le slug de jeu n'est pas un énuméré                                               | Restreindre le slug aux jeux déclarés ferait dépendre le JSON de chaque jeu de la liste entière : ajouter un jeu modifierait tous les schémas. L'appartenance se vérifie dans la passe croisée, sur le `folder` de l'entrée de `GAMES`. |
| `visibleFor` plutôt que `playbook` pour la visibilité d'un attribut               | Le mot `playbook` désigne déjà un type de contenu. Garder l'homonymie du système amont dans un format destiné à l'écriture manuelle installe une confusion durable. |
| Cinq jeux déclarés : Masks, Monster of the Week, Monsterhearts, Urban Shadows, The Sprawl | Chacun a une configuration de feuille exploitable en amont, preset TOML du wiki ou module tiers. Apocalypse World et Dungeon World sortent de la liste : rien ne les vise et personne ne les réclame. |
| Une seule forme retenue quand l'amont en porte plusieurs                          | `range` ou `start`/`end`, `attributes` + `position` ou `attributesTop`/`attributesLeft`, `statToggle = false` ou champ absent : un format destiné à l'écriture manuelle n'a pas à offrir deux façons d'écrire la même chose. Les équivalences sont notées en commentaire pour l'adaptateur d'import. |
