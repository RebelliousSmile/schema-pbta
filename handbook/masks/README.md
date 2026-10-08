# Masks

Thème éditorial « nouvelle génération » : papier clair, titres condensés bleu marine, intertitres dorés, puces étoile, tableaux à filets dorés et corps serif. Staatliches, Josefin Sans, Crimson Pro et Comic Neue sont des alternatives libres choisies pour évoquer la maquette imprimée de Masks ; elles ne sont pas présentées comme ses polices officielles. Les illustrations (`hero-burst.svg`, `star-bullet.svg`, `skyline-band.svg`) ont été créées pour ce dépôt.

Les polices, leurs licences et les provenances des illustrations sont détaillées dans [`assets/fonts/README.md`](./assets/fonts/README.md) et dans [`LICENSES/HANDBOOK-ASSETS.md`](../../LICENSES/HANDBOOK-ASSETS.md).

## Feuilles de style

- `callouts.css` : les callouts PbtA et les sept callouts du pack, `masks-read-aloud`, `masks-sidebar`, `masks-move`, `masks-crisis`, `masks-caption`, `masks-portrait` et `masks-chapter` ;
- `page.css` : puces étoile, tableaux rayés, termes de jeu ;
- `layout.css` : géométrie du livret (deux faces, deux colonnes) et de la carte de PNJ, écrite sur les accroches `data-face`, `data-column`, `data-row`, `data-region` et `data-primitive` que publient les deux contrats de présentation du paquet npm (`presentation-contract.json` et `npc-presentation-contract.json`). Une version de Handbook qui n’émet pas encore ces accroches la laisse sans effet ;
- `headings.css` : pas de barre de marge devant un titre.

## Callouts

Les callouts du pack s’écrivent `> [!masks-read-aloud]`, `> [!masks-sidebar]`, `> [!masks-move]`, `> [!masks-crisis]`, `> [!masks-caption]`, `> [!masks-portrait]` et `> [!masks-chapter]`. Le portrait et le cartouche de chapitre reçoivent l’image que la note intègre dans leur corps ; sans image, ils restent lisibles avec leur titre et leur texte. Les callouts `pbta-*` gardent un cadre simple bleu marine. Leur contenu reste du Markdown libre.
