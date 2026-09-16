---
objective: "Urban Shadows playbooks round-trip as one TOML document through a dedicated schema-pbta contract and a specialized Lantern sheet."
status: in-progress
---

# Plan: Playbook Urban Shadows spécialisé

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Conserver un livret Urban Shadows entier dans un TOML atomique, puis le rendre et l'éditer dans Lantern avec ses mécaniques propres. |
| **Source** | Décision de conception issue de la conversation : socle PbTA commun, variante Urban Shadows structurée et rendu Lantern spécialisé. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Contrat Urban Shadows atomique | [phase-1.md](./phase-1.md) |
| 2 | Fiche Lantern Urban Shadows | [phase-2.md](./phase-2.md) |
| 3 | Livraison du contrat et preuves inter-dépôts | [phase-3.md](./phase-3.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Un playbook reste un seul document TOML. | L'import/export est atomique et ne dépend pas de fichiers frères. |
| Urban Shadows reçoit une variante structurée plutôt que des champs facultatifs universels. | Relations mortelles, corruption, Cercles, Statuts, dégâts, cicatrices et mouvement de fin ne sont pas communs aux autres PbtA. |
| Lantern fournit un template et un rendu Urban Shadows dédiés. | La fidélité de la feuille imprimée et l'édition des mécaniques propres ne peuvent pas reposer sur le formulaire générique. |
| La cible publiée est `pbta/urban-shadows-playbook`. | La clé est stable, explicite dans le registre de codecs et n'altère pas `pbta/playbook`. |
| Lantern dépend d'une release de schema-pbta qui contient cette cible. | Un package épinglé à une archive antérieure ne peut pas résoudre le nouveau contrat au chargement. |
| Les fixtures et le rendu sont originaux. | Les règles de contribution interdisent de recopier le texte, les images ou la mise en page publiés. |
