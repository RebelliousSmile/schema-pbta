---
objective: "Les choix de création d’un playbook peuvent initialiser un attribut texte libre sans imposer durablement leurs options."
status: in-progress
---

# Plan: Lier les choix de création aux attributs libres

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Exprimer dans le contrat le lien facultatif entre une question de création et l’attribut qu’elle initialise. |
| **Source** | Brainstorm de la conversation utilisateur du 2026-09-17. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Contrat v5 et validation de références | [phase-1.md](./phase-1.md) |
| 2 | Présentation Handbook et intégration Lantern | [phase-2.md](./phase-2.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Une entrée `creation` porte un identifiant d’attribut facultatif. | Certaines questions restent purement éditoriales ; les autres doivent initialiser une valeur persistée. |
| La cible doit être un attribut `Text` ou `LongText` déclaré par le jeu. | Une proposition initialise un texte libre qui peut évoluer, non une liste fermée ou une valeur mécanique. |
| Les options restent dans le TOML du playbook et ne deviennent jamais une contrainte de la valeur persistée. | Les données éditoriales restent côté contenu ; le joueur peut ensuite modifier le champ libre. |
| Le contrôle inter-fichiers appartient à `validate:refs`. | Le JSON Schema ne peut pas vérifier le type et l’existence d’un attribut défini dans un autre document. |
| Une cible soumise à `visibleFor` doit inclure le playbook qui la lie. | Un formulaire ne doit pas initialiser un champ que sa définition de jeu masque pour ce playbook. |
