---
objective: "Confronter les schémas livrés aux fiches de personnage publiées des cinq jeux déclarés, et mesurer ce qui ne s'écrit pas."
status: findings
---

# Vérification sur fiches imprimées

Neuf pages fournies : *L'Enthousiaste* (Masks), *The Chosen* (Monster of the Week),
*The Wizard* (Urban Shadows), *Le Fantôme* (Monsterhearts), *Le Fixeur* (The Sprawl).

Méthode : transcription fidèle de la fiche en TOML, puis Ajv contre le schéma
généré. Les transcriptions sont restées dans le scratchpad et n'entrent pas dans
`examples/` — c'est du contenu publié, et le plan a tranché pour du contenu
inventé. `schemas/masks/playbook.schema.json` et celui de MotW sont identiques
octet pour octet (`diff` muet), donc les constats livret valent pour les cinq jeux.

## Ce qui tient

Les définitions de jeu. Pour Masks, la fiche confirme les cinq étiquettes, les
quatre `moveTypes` (`basic` / `playbook` / `team` / `adult`), Potentiel en
`Xp max 5`, les cinq états émotionnels en `ListMany condition = true`, Moment de
Vérité, Influence, Look. Pour Monster of the Week, la définition transcrite en
phase 7 ne bouge pas.

Côté contenu : les moves et leurs trois paliers de résultat, les listes de
création fermées, le gear et ses tags, les horloges de front à segments nommés.

## Ce qui ne s'écrit pas

### Masks — cinq rejets Ajv sur le livret

```
/                          must NOT have additional properties   ← sections
/choiceSets/0              must NOT have additional properties   ← pick
/choiceSets/1/choices/0    must be object                        ← « Choisis deux éléments »
/advancement/0             must be string                        ← les deux paliers
/creation/0                must have required property 'options' ← « Comment as-tu obtenu tes pouvoirs ? »
```

Les cinq questions d'HISTOIRE sont ouvertes, sans liste de réponses, et
`creationQuestionSchema` exige `options` avec au moins une entrée. Une fiche
Masks ne s'écrit donc pas complètement.

Deux trous dans la définition : aucun attribut pour NOM CIVIL (seul `heroName`
existe), et la pénalité de chaque condition — « Effrayé (-2 pour affronter
directement une menace) » — n'a pas de champ, `options` n'acceptant que des
chaînes plates.

### Monster of the Week

« RATINGS, PICK ONE LINE » donne cinq lignes de stats complètes ; `stats` est un
`record` unique, donc `statLines` est rejeté et `stats` réclamé.
`examples/monster-of-the-week/playbook/the-lightkeeper.toml` invente un écart
fixe, ce qu'aucun livret MotW n'imprime. L'arme spéciale (Form ×1 + Business-end
×3 + Material ×1, chaque option ajoutant un tag) ne passe pas : un choix ne peut
être qu'une manœuvre.

### The Sprawl

`statPool = [2, 1, 1, 0, 0, -1]` rejeté. L'horloge de Blessure aux heures nommées
(15h00 → 24h00) rejetée : `Clock` n'a que `max`. Les segments nommés existent
déjà dans `fronts.clockPresets`, mais un attribut de personnage n'y a pas accès.
S'ajoutent Cred, Liens, Contacts, et des avancements à coût (« coût : 10 Cred »).

### Urban Shadows et Monsterhearts

Les Circles (quatre entrées portant chacune une valeur et un compteur de Status
0–3) et l'échelle Faint 1 / Serious 2 / Critical 2 ne passent qu'en `type =
"Track"` — vérifié : elles passent alors, mais `Track` est le `looseObject` du
schéma, donc rien n'est contrôlé. Même famille pour les Ascendants et Conditions
de Monsterhearts, relationnels par cible. Les colonnes de caractéristiques du
Fantôme sont le même problème que les lignes MotW.

## Les quatre causes

1. `stats` n'a qu'une forme. Trois existent : écart fixe (Masks), lignes
   alternatives (MotW, Monsterhearts), pool à assigner (The Sprawl).
2. Un choix ne peut être qu'une manœuvre. Les fiches choisissent des tags, des
   objets, des énoncés, des composants d'arme.
3. `type: "single" | "multi"` ne compte pas. « Choisis-en deux », « coche quatre
   pulsions », « choisis trois étiquettes » sont inexprimables. Un `pick`
   numérique rendrait `type` redondant.
4. `advancement: string[]` est plat, alors que les cinq fiches montrent deux
   paliers, avec cases, effets bornés (`max +2`) et parfois coût.

Deux ajouts secondaires : des blocs narratifs (Moment de Vérité, Démon intérieur,
Action sexuelle, END MOVE, Directives) et des segments nommés côté attribut.

## Deux constats collatéraux

`schemas/masks/playbook.schema.json` ne porte qu'un seul `minItems`, celui de
`creation.options` : un `choiceSets[].choices` vide et un `moves` vide valident
tous les deux.

`tools/validate-references.ts` ligne 265 itère `keysOf(data.stats)` — la règle 1
est écrite contre la forme objet.

## Terminologie française, relevée sur les fiches

Vérifiée sur les fiches fournies, non traduite par moi. Urban Shadows et Monster
of the Week n'en fournissent pas : les pages reçues pour ces deux jeux sont en
anglais.

| Notion | Masks | The Sprawl | Monsterhearts |
| --- | --- | --- | --- |
| `moves` | Manœuvres | Manœuvres | Actions |
| `playbook` | Livret | Livret | Mue |
| `stats` | Étiquettes | Stats | Caractéristiques |
| conditions | États émotionnels | — | Conditions |
| `xp` | Potentiel | XP | Progressions |
| avancement | Progression | Avancement | Progressions |
| `gear` | — | Équipement | — |
| dégâts | — | Blessure | Dégâts |

Les trois éditions ne partagent donc pas un vocabulaire commun : une manœuvre est
une action chez Monsterhearts, un livret est une mue, et une caractéristique se
dit étiquette chez Masks.

Le concept, lui, est unique : l'amont anglais dit `move` partout, et les éditeurs
français tranchent entre le littéral (« manœuvre ») et le fonctionnel
(« action »). La divergence est donc éditoriale, pas conceptuelle : elle ne
touche que les libellés d'affichage, jamais la clé ni la forme du schéma.

« Étiquette » entre même en collision d'un jeu à l'autre : chez Masks il nomme
les caractéristiques (DANGEREUX, DIFFÉRENT, SAUVEUR, SUPÉRIEUR, NORMAL), chez
The Sprawl il nomme les tags (`+voyant`, `+douloureux`, `+crypté`).

Conséquence pour ce dépôt : les termes français employés dans les documents de
travail sont des termes du dépôt, pas ceux d'un jeu, et les schémas restent
désignés par leurs identifiants de code.
