---
objective: "Chaque livret Monsterhearts est un document TOML v3 autonome qui contient ses mécaniques et ses textes éditoriaux, et l’aperçu conserve la composition de référence de La Selkie."
status: implemented
---

# Plan: Livrets Monsterhearts complets en un document

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Faire du livret Monsterhearts un document spécialisé complet et rendre ses régions éditoriales sans changer la composition de référence. |
| **Source** | Cadrage validé dans cette conversation : tous les livrets Monsterhearts partagent un modèle monobloc ; l’image de La Selkie fixe le rendu à préserver. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Contrat Monsterhearts v3 complet | [phase-1.md](./phase-1.md) |
| 2 | Fixtures canoniques et conformité | [phase-2.md](./phase-2.md) |
| 3 | Aperçu de livret spécialisé | [phase-3.md](./phase-3.md) |
| 4 | Documentation et vérification de livraison | [phase-4.md](./phase-4.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Publier la forme enrichie dans le contrat v3, sans altérer v1/v2. | Les schémas v2 sont associés au tag immuable `v2.0.0` et la compatibilité les vérifie octet par octet. |
| Conserver un seul modèle `monsterhearts-playbook` pour chaque mue. | Les sections et leur prose appartiennent au livret, même lorsqu’une section est optionnelle pour une mue donnée. |
| Garder le HTML généré comme dérivé des TOML. | L’aperçu ne doit pas devenir une seconde source des règles ou des textes. |
| Employer La Selkie comme fixture de mise en page de référence. | Ses régions rendent visibles toutes les sections éditoriales que le modèle doit porter. |
