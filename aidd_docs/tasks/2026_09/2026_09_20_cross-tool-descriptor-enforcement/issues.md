# Issues ouvertes chez les dépôts voisins

Aucun de ces dépôts n'a reçu de commit : le constat est mesuré depuis `schema-pbta`,
la correction appartient à son propriétaire.

| Dépôt | Issue | Constat | Écart enregistré que sa fermeture oblige à retirer |
| --- | --- | --- | --- |
| `schema-adrenaline` | [#10](https://github.com/RebelliousSmile/schema-adrenaline/issues/10) · `bug` | `corpus` désigne `corpus/contract/cases.json`, absent ; le manifeste est à `corpus/cases.json`. Plus : `contractVersion` absent, `files` ne publie ni `handbook/` ni le descripteur. | `schema-adrenaline:corpus` et `schema-adrenaline:contractVersion` |
| `schema-in-the-mist` | [#14](https://github.com/RebelliousSmile/schema-in-the-mist/issues/14) · `enhancement` | `contractVersion` absent ; `files` ne publie ni `handbook/` ni le descripteur ; deux `.tgz` suivis par git. | `schema-in-the-mist:contractVersion` |
| `lantern` | [#10](https://github.com/RebelliousSmile/lantern/issues/10) · `enhancement` | Les trois fournisseurs déclarent `capabilities.lantern` (`edit:pbta`, `edit:mist`, `edit:adrenaline`) ; aucune de ces chaînes n'existe dans `src/` ni `tools/`. | Aucun — `capabilities` reste hors de la liste, faute de surface à confronter. |
| `obsidian-handbook` | [#37](https://github.com/RebelliousSmile/obsidian-handbook/issues/37) · `enhancement` | `capabilities.handbook` est le seul champ de capacité confrontable à une surface réelle (`src/games/capabilities.ts`), et personne ne le confronte. Distincte de #36, qui porte le bump v5.5.0. | Aucun — même raison. |

Les deux dernières n'alimentent pas la liste d'écarts enregistrés : `capabilities` n'est
pas vérifié par ce plan, donc rien n'y est inscrit à retirer.

## État au 2026-09-20

Les quatre issues sont **ouvertes**, aucune fermée. Les trois écarts qu'elles suivent
sont inscrits dans `KNOWN_DEVIATIONS` (`tools/validate-cross-tool-contract.ts`) et
imprimés à chaque exécution de `validate:cross-tool`.

La fermeture d'une issue ne se contente pas d'autoriser le retrait de son écart : elle
l'**impose**. Dès que le correctif est atteint par un pin avancé dans
`cross-tool.config.json`, l'entrée correspondante fait échouer la porte tant qu'elle
n'est pas retirée — prouvé par mutation, voir `verification.md`.
