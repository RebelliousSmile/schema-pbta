# Urban Shadows

Thème éditorial urbain : papier presque blanc, encre noire, violet `#682865`,
titres condensés en capitales et corps serif dense. League Gothic, Source
Serif 4 et Caveat Brush sont des alternatives libres choisies pour évoquer
cette grammaire sans distribuer les polices du livre. Les trois dessins de
`assets/images/` sont des créations propres au dépôt.

Provenance et licence : [`LICENSES/HANDBOOK-ASSETS.md`](../../LICENSES/HANDBOOK-ASSETS.md).

## Section de nuit

Le pack n’a qu’une polarité, claire. Il publie en plus une couche
`style.section` : une section de note marquée `alternate` passe sur fond de
nuit `#2f1a53`, encre claire, titres au pinceau, avec le motif
`section-texture`. Un Handbook qui ne connaît pas cette couche l’ignore et
affiche la section sur le papier clair. Rien de cette couche ne s’imprime.

| Feuille | Rôle |
| --- | --- |
| `styles/callouts.css` | encadrés partagés `pbta-*` et encadrés du pack |
| `styles/page.css` | page claire : titres, puces en losange, termes de jeu (gras italique) |
| `styles/section.css` | ce qu’un jeton ne dit pas dans la section de nuit |
| `styles/layout.css` | géométrie du livret : faces, rangées, colonnes, marques, cases ; ordre canonique en volet étroit, une face par page à l’impression |

## Encadrés

Les encadrés partagés `> [!pbta-clock]`, `> [!pbta-move]`,
`> [!pbta-npc-reaction]` et `> [!pbta-playbook-change]` gardent leur filet
violet et leur titre condensé. Le pack publie six encadrés qui lui sont
propres ; leur contenu reste du Markdown libre.

| Encadré | Rendu |
| --- | --- |
| `> [!urban-shadows-move]` | panneau gris tenu entre deux filets violets |
| `> [!urban-shadows-choice]` | panneau lavande, filet à gauche, listes à cases carrées |
| `> [!urban-shadows-aside]` | aparté sans fond, un filet de chaque côté |
| `> [!urban-shadows-solid]` | fond de nuit, titre au pinceau |
| `> [!urban-shadows-archetype]` | bandeau de titre violet sur corps lavande |
| `> [!urban-shadows-example]` | exemple de jeu, italique violet sans cadre |
