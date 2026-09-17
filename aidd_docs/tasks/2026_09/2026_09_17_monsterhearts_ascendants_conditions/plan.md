---
objective: "Les playbooks Monsterhearts v5 portent des Ascendants et Conditions libres, éditables et rendus par Lantern depuis le même TOML."
status: in-progress
---

# Plan: Ascendants et Conditions Monsterhearts

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Ajouter l’état éditable des Ascendants et Conditions à un playbook Monsterhearts, sans figer leurs noms, puis le rendre dans Lantern. |
| **Source** | Conversation utilisateur du 2026-09-17. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Contrat v5 et corpus Monsterhearts | [phase-1.md](./phase-1.md) |
| 2 | Artefacts v5 et préparation de publication | [phase-2.md](./phase-2.md) |
| 3 | Édition et rendu Lantern | [phase-3.md](./phase-3.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/lantern/blob/main/src/templates/monsterhearts/playbook/model.ts | Lantern utilise directement le type publié et possède déjà des sections distinctes pour `strings` et `conditions`. |
| https://github.com/RebelliousSmile/lantern/blob/main/src/templates/monsterhearts/playbook/preview/MonsterheartsPlaybookPreview.tsx | Le rendu actuel sérialise les données en JSON brut ; le panneau de la fiche doit devenir une région structurée. |

## Decisions

| Decision | Why |
| --- | --- |
| Publier cette évolution en contrat v5. | Un champ de données nouvellement accepté modifie la forme publique ; v4.0.0 publié doit rester immuable. |
| Conserver `strings` pour la configuration d’économie et ajouter `ascendants` pour les valeurs inscrites. | `max` et `starting` décrivent le livret, tandis que chaque entrée nommée et sa valeur décrit l’état visible sur la fiche. |
| Garder les noms d’Ascendants et de Conditions libres. | Le contrat structure les entrées sans imposer le contenu narratif créé dans le TOML. |
