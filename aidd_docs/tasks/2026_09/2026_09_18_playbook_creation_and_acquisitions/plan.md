---
objective: "Chaque donnée interactive de playbook est soit un résultat de création structuré, soit une acquisition cochable, sans dénaturer les ressources éditables."
status: in-progress
---

# Plan: Création et acquisitions des playbooks

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Normaliser les progrès acquis et les résultats de création que la revue a trouvés encore implicites ou uniquement textuels. |
| **Source** | Revue transversale des packs de playbooks, conversation utilisateur du 2026-09-18. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Progressions spécialisées cochables | [phase-1.md](./phase-1.md) |
| 2 | Résultats texte et listes de création | [phase-2.md](./phase-2.md) |
| 3 | Répartition de stats à la création | [phase-3.md](./phase-3.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Toute progression choisie réutilise l’entrée `{ label, checked }`. | Un avancement est une acquisition persistante, quel que soit son pack. |
| Les moves proposés restent dans `choiceSets`; seuls les moves effectivement ajoutés au playbook portent `checked`. | Une proposition et une acquisition sont deux états distincts. |
| Une question de création cible soit un champ texte libre, soit un attribut `ListMany` avec une cardinalité explicite. | Le TOML porte les options ; la fiche conserve seulement la valeur ou la liste choisie, qui reste ensuite éditable. |
| Une option de création peut séparer sa valeur stable de son libellé ; une chaîne existante reste le raccourci valeur-libellé. | Une liste persistée doit survivre au changement d un libellé et doit pouvoir pointer vers une description éditoriale riche. |
| Les relations mortelles deviennent un catalogue identifié, distinct de la liste de relations choisies. | La sélection ne doit pas effacer la description fictionnelle associée à chaque relation proposée. |
| Les compteurs, ressources, dégâts et statuts ne deviennent pas des cases à cocher. | Leur état est numérique ou textuel et évolue pendant le jeu. |
| Les répartitions de stats sont modélisées séparément des questions textuelles. | Leur résultat modifie plusieurs valeurs numériques et ne peut pas être réduit à une option texte. |
| Un profil de stats est une table explicite du TOML, jamais une règle déduite de `statsDetail`. | Les consommateurs ne doivent pas interpréter la prose ; Salvage Run peut définir ses profils originaux de façon finie. |
