# Audit des `game-definition` — Monsterhearts, Urban Shadows, The Sprawl

Réalisé le 2026-11-20, à la demande « rédige le game-definition pour les 4 jeux ».
**Conclusion : aucun fichier de définition n'a été modifié.** Ce document consigne
ce que les sources attestent, pour qu'un ajout futur ne refasse pas la recherche.

## Décisions

- Règle retenue : **n'écrire que ce qu'une source atteste**, et seulement quand un
  contenu du dépôt en a besoin.
- Une définition peut omettre `npc`, `mc`, `fronts`, `equipmentTypes` (optionnels
  dans `src/zod/game-definition.ts`). Elle peut aussi déclarer plus que ce que les
  documents emploient. La contrainte ne joue que dans un sens : un livret ou un move
  ne peut citer qu'une clé que la définition déclare (`tools/validate-references.ts`,
  règle 1 et suivantes : stats, attributs, `moveType`, `equipmentType`, presets
  d'horloge, types de menace, impulsions).
- Les `fronts` de Masks sont **conservés**. Leur commentaire en tête de section dit
  qu'ils sont inventés pour ce dépôt : c'est un écart assumé à la règle ci-dessus,
  retenu parce qu'un exemple les cite.

## État des quatre définitions

| Jeu | Lignes | `npc` | `fronts` | `equipmentTypes` |
| --- | --- | --- | --- | --- |
| Masks | 148 | oui | oui (inventés) | oui |
| The Sprawl | 77 | non | non | oui |
| Urban Shadows | 73 | non | non | non |
| Monsterhearts | 67 | non | non | non |

## Ce que les sources attestent et que les fichiers n'ont pas

Rien de ceci n'est écrit. À reprendre le jour où un contenu le réclame.

### Monsterhearts

Source : `YanKlInnomme/FoundryVTT-monsterhearts` (`monsterhearts.js`, `lang/fr.json`),
licence GPL-3.0, adaptation du système `pbta` d'Asacolips.

- Types de moves : `bargains` (« Pactes »), `hexes` (« Malédictions »). Leurs `moves`
  et `skinmoves` recoupent nos `basic` et `skin` sans s'y confondre.
- Types d'équipement : `strings` (« Ascendants »), `sympatheticTokens` (« Fétiches »).
- Attributs : `eyes`, `origin`, `advancement`. Les libellés de `eyes` et `origin`
  n'ont pas été relus.
- `npc` : bloc vide chez eux. Pas de fronts.
- Écart déjà présent : le fichier modélise les Ascendants comme un attribut
  `ListMany`, la source comme un type d'équipement. Ses types de moves
  (`moves`, `skinmoves`, `bargains`, `hexes`) ne recoupent pas les nôtres.

### Urban Shadows

Source : `philote/urban-shadows-pbta` (`module/helpers/pbta-config.mjs`). Le code est
sous Apache-2.0, mais `LICENSING-GUIDE.md` interdit d'extraire et de redistribuer le
contenu du jeu (licence de collaboration de fans avec Magpie Games). **Reprendre des
noms d'attributs et de types est jugé sûr ; reprendre des listes d'options ou des
textes de règles ne l'est pas.**

- Types de moves : `hub`, `spells`. Type d'équipement : `gear`.
- Bloc `npc` : `harm` (Resource, max 1), `status` (Clock, max 3), `circle` (quatre
  cercles), `faction` (Text), `drives`, `resistances`, `vulnerabilities` (LongText).
- `statToggle` : modificateur −1.
- Acteurs `faction` et `city hub` : le schéma ne sait pas les représenter
  (`character`, `npc`, `mc`, `fronts` seulement).
- Pas de fronts.
- Divergences laissées telles quelles : chez eux `harm` et `advancement` sont des
  `ListMany` à options ; chez nous une `Clock` de 5 et un `Xp`. `corruption` (Clock 5)
  et les huit stats concordent.

### The Sprawl

Aucune config Foundry publique trouvée (recherches GitHub vides). La seule source est
les fiches transcrites (`sheet-verification.md`).

- Rien d'attesté de plus que le contenu actuel (types d'équipement déjà présents).
- « Liens » et « Contacts » n'apparaissent que dans une remarque de
  `sheet-verification.md`, aucun exemple ne les utilise : non ajoutés.
- Ni `npc` ni fronts : le jeu a ses propres cibles (menace, corporation, mission).

## Reprise

Pour ajouter un élément : déclarer la clé dans la définition **avec sa source**,
l'employer dans un document, puis `npm run check`. Ne pas ajouter par symétrie avec
Masks.
