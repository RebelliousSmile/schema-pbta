---
objective: "Le thème light Monsterhearts devient fidèle à la maquette, puis Drowned Lake en dérive un collage froid, découpé et lisible."
status: in-progress
---

# Plan: Thème light Monsterhearts puis variante Drowned Lake

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Établir dans le pack `schema-pbta` la maquette light comme référence, puis en dériver Drowned Lake sans changer les données, capacités ou contrôles PbtA. |
| **Source** | Brainstorm visuel Drowned Lake du 15 septembre 2026 |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Thème light fidèle à la maquette | [`phase-1.md`](./phase-1.md) |
| 2 | Drowned Lake dérivé : palette et collage | [`phase-2.md`](./phase-2.md) |
| 3 | Validation responsive et visuelle | [`phase-3.md`](./phase-3.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Gris et bleu clair structurent la feuille ; rouge = accent rare. | Préserver l’atmosphère noyée sans transformer la surface en aplat rouge. |
| Les rejets, données et capacités restent inchangés. | La variante est purement visuelle. |
| Le thème light précède toute variation Drowned Lake. | Il est la référence typographique, symbolique et structurelle à dériver. |
| Drowned Lake est une variante du light, non un thème concurrent. | Il hérite de ses polices, de sa grille et de ses composants, puis ne change que les tokens, surfaces et traitements décoratifs nécessaires. |
| Collage abstrait original, sans personnages tiers. | Respecter les assets autorisés du pack. |
| Les styles restent dans `schema-pbta/handbook/monsterhearts`. | Handbook consomme le pack installé et ne doit pas en maintenir une seconde copie. |
