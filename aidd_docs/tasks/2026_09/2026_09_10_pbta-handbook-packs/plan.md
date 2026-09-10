---
objective: "Les cinq jeux PbtA publient des données canoniques compatibles avec Lantern et des aperçus Handbook visuellement distincts, sans dupliquer ni le modèle ni le contenu entre les deux."
status: implemented
---

# Plan: Corpus PbtA et packs visuels Handbook

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Étendre le corpus structuré aux cinq jeux, puis produire un aperçu HTML/CSS et des assets originaux par jeu à partir de ces mêmes données. |
| **Source** | Brainstorm de session du 2026-09-10 et [`shadow report`](../2026_09_10_handbook-packs-shadow-areas-report.md). |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Contrat canonique et actions de MC | [`phase-1.md`](./phase-1.md) |
| 2 | Définitions de jeu des trois corpus en attente | [`phase-2.md`](./phase-2.md) |
| 3 | Moves et livrets structurés | [`phase-3.md`](./phase-3.md) |
| 4 | Aperçu Handbook sémantique commun | [`phase-4.md`](./phase-4.md) |
| 5 | Thèmes, assets et variantes visuelles | [`phase-5.md`](./phase-5.md) |
| 6 | Vérification des packs et documentation | [`phase-6.md`](./phase-6.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Les schémas et exemples sont la seule source de contenu pour Lantern et les aperçus Handbook. | Un pack ne peut pas devenir un modèle concurrent de moves ou de livrets. |
| Un thème ne peut modifier ni structure, ni données ; une variante est seulement un delta visuel. | Les mêmes objets doivent rester interchangeables entre Lantern, Handbook et leurs variantes. |
| Les contenus sous droit ne sont pas copiés depuis les PDF locaux sans droit de redistribution documenté. | Le dépôt publie code et schémas sous MIT ; les sources privées servent à vérifier la structure et le vocabulaire. |
| Les sources de jeu servent à relever des vocabulaires et des formes ; les fichiers d’exemple publiés restent des fixtures originales. | Le dépôt peut éprouver les schémas sans republier la prose, les mises en page ou les livrets des ouvrages. |
| Le contrat installable de Handbook reste différé. | Handbook est en cours d’évolution ; l’aperçu local et son arborescence constituent une référence révisable plutôt qu’un faux contrat stable. |
| Les trois jeux en attente activent d’abord les cibles `game-definition`, `move` et `playbook`. | Ce sont les objets requis pour les règles, actions de MC et livrets ; PNJ et fronts peuvent être ajoutés quand leurs sources et besoins sont établis. |
| Chaque aperçu choisit ses documents avec un descripteur de références, jamais par découverte implicite. | Le HTML régénéré reste déterministe quand le corpus s’agrandit. |
| Les défauts inter-fichiers sont testés dans un harness temporaire, distinct de `corpus/refus/`. | Ajv ne connaît pas les vocabulaires déclarés dans un autre fichier ; le corpus de refus reste réservé aux erreurs de forme. |
