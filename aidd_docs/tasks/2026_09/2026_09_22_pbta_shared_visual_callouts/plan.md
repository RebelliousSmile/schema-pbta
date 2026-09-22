---
objective: "Every PbtA pack exposes the same optional visual callouts for clocks, moves, NPC reactions, and playbook changes, while each pack controls their appearance without changing game data."
status: implemented
---

# Plan: Callouts visuels PbtA communs

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Ajouter quatre callouts facultatifs utilisables avec les six packs PbtA et donner à chaque pack son propre rendu, y compris pour les callouts PbtA existants. |
| **Source** | Demande et clarification de l'utilisateur dans cette conversation, 2026-09-22. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Publier la sémantique de présentation et accepter les feuilles des packs | [`phase-1.md`](./phase-1.md) |
| 2 | Ajouter les callouts au catalogue et au rendu Handbook | [`phase-2.md`](./phase-2.md) |
| 3 | Définir et vérifier le design de chaque pack | [`phase-3.md`](./phase-3.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Les identifiants `pbta-clock`, `pbta-move`, `pbta-npc-reaction` et `pbta-playbook-change` désignent une intention visuelle commune ; progression et liens sont des contenus du dernier type. | Une même note reste portable entre packs, sans multiplier les identifiants par jeu. |
| Le contenu des callouts reste du Markdown Obsidian, sans lien exécutable avec les documents `front`, `npc`, `move` ou `playbook`. | La demande porte sur la mise en page et ne doit ni créer ni modifier d'état de jeu. |
| Le catalogue sémantique est versionné dans `schema-pbta` ; Handbook fournit les menus et le rendu ; les packs fournissent les variations CSS. | Respecte la frontière entre contrat, consommateur et apparence propre au pack. |
| Les feuilles CSS déclarées par les packs servent aux différences de composition, tandis que des tokens peuvent régler les détails simples. | Le chargeur Handbook prend déjà en charge `assets.stylesheets` et vérifie que les sélecteurs restent dans le jeu actif. |
| Une horloge peut être montrée dans Monsterhearts comme aide de MC, sans la qualifier de règle du jeu. | Tous les jeux peuvent utiliser l'encart même si leurs règles ne le prévoient pas. |
