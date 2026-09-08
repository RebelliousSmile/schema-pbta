---
source: aidd_docs/tasks/2026_09/2026_09_08_schemas-pbta-lantern/sheet-verification.md
generated_at: 2026-09-08
---

# Rapport de zones d'ombre

Source : `aidd_docs/tasks/2026_09/2026_09_08_schemas-pbta-lantern/sheet-verification.md`
Généré : `2026-09-08`

Total : 19 | Bloquant : 4 | Majeur : 12 | Mineur : 3

---

## Avertissements

- Les catégories et les sévérités sont rendues en français. Correspondance avec
  les valeurs verrouillées de `locked-sets.json`, pour qu'un passage ultérieur
  puisse encore apparier les zones : hypothèse tacite = `unstated assumption`,
  terme ambigu = `ambiguous term`, cas limite manquant = `missing edge case`,
  acteur manquant = `missing actor`, mode de défaillance manquant = `missing
  failure mode`, critère d'acceptation manquant = `missing acceptance
  criterion`, dépendance manquante = `missing dependency` ; bloquant =
  `blocker`, majeur = `major`, mineur = `minor`.
- Les termes de jeu employés ici ont été relevés sur les fiches françaises
  fournies, pas traduits : Manœuvre et Livret (Masks, The Sprawl), Action et Mue
  (Monsterhearts), Étiquette (Masks) contre Caractéristique (Monsterhearts). Les
  trois éditions ne partagent pas un vocabulaire commun, donc les notions
  transverses restent désignées par leur identifiant de code (`moves`,
  `choiceSets`, `stats`, `advancement`) plutôt que par le mot d'un seul jeu.

---

## Zones d'ombre par catégorie

### hypothèse tacite

**[bloquant]** Quelle langue portent les valeurs de `labelDictionary` quand un jeu est publié en plusieurs ?
> Neuf pages fournies : *L'Enthousiaste* (Masks), *The Chosen* (Monster of the Week), *The Wizard* (Urban Shadows), *Le Fantôme* (Monsterhearts), *Le Fixeur* (The Sprawl).

**[bloquant]** Un fichier livret décrit-il une fiche vierge ou un personnage déjà rempli ?
> « Choisis-en deux », « coche quatre pulsions », « choisis trois étiquettes » sont inexprimables.

**[majeur]** Le contenu d'exemple inventé doit-il suivre les conventions des fiches imprimées ?
> `examples/monster-of-the-week/playbook/the-lightkeeper.toml` invente un écart fixe, ce qu'aucun livret MotW n'imprime.

**[mineur]** Le format porte-t-il le regroupement visuel imprimé sur la fiche, ou seulement la structure mécanique ?
> Les Circles (quatre entrées portant chacune une valeur et un compteur de Status 0–3)

---

### terme ambigu

**[majeur]** Un `pick` numérique signifie-t-il exactement ce nombre, au moins ce nombre, ou ce nombre par liste ?
> Un `pick` numérique rendrait `type` redondant.

**[majeur]** Quel prédicat ouvre le second palier d'avancement dans les cinq jeux ?
> les cinq fiches montrent deux paliers, avec cases, effets bornés (`max +2`) et parfois coût.

**[majeur]** Lesquels des blocs narratifs relèvent de `moves`, lesquels de `choiceSets`, lesquels du texte libre ?
> des blocs narratifs (Moment de Vérité, Démon intérieur, Action sexuelle, END MOVE, Directives)

**[majeur]** « Étiquette » désigne-t-il une caractéristique de Masks ou un tag de The Sprawl ?
> chez Masks il nomme les caractéristiques (DANGEREUX, DIFFÉRENT, SAUVEUR, SUPÉRIEUR, NORMAL), chez The Sprawl il nomme les tags (`+voyant`, `+douloureux`, `+crypté`).

---

### cas limite manquant

**[majeur]** Un tableau `choices` vide et un tableau `moves` vide doivent-ils être rejetés ?
> un `choiceSets[].choices` vide et un `moves` vide valident tous les deux.

**[mineur]** Une liste de lignes de caractéristiques à une seule entrée équivaut-elle à une répartition fixe ?
> Trois existent : écart fixe (Masks), lignes alternatives (MotW, Monsterhearts), pool à assigner (The Sprawl).

**[mineur]** Que vaut une liste de scores à répartir comptant moins d'entrées que le jeu n'a de caractéristiques ?
> `statPool = [2, 1, 1, 0, 0, -1]` rejeté.

---

### acteur manquant

**[majeur]** Qui remplit les nouveaux champs, puisque le preset Foundry n'en porte aucun équivalent ?
> Un choix ne peut être qu'une manœuvre. Les fiches choisissent des tags, des objets, des énoncés, des composants d'arme.

**[majeur]** Quelle passe vérifie que les sélections d'un ensemble de choix respectent son compte, la passe de références ou le rendu Lantern ?
> `type: "single" | "multi"` ne compte pas.

---

### mode de défaillance manquant

**[majeur]** Comment la règle 1 signale-t-elle une clé de stat quand `stats` porte une liste de lignes plutôt qu'un objet ?
> `tools/validate-references.ts` ligne 265 itère `keysOf(data.stats)` — la règle 1 est écrite contre la forme objet.

**[majeur]** Que voit un consommateur lisant déjà `stats` comme un objet, une fois le champ devenu une union ?
> `stats` n'a qu'une forme.

---

### critère d'acceptation manquant

**[bloquant]** Quelle condition rend le schéma livret assez bon pour s'arrêter, une fois les cinq fiches transcriptibles ?
> Méthode : transcription fidèle de la fiche en TOML, puis Ajv contre le schéma généré.

**[majeur]** L'échappatoire `Track` doit-elle rester permissive, ou être resserrée jusqu'à contrôler les Circles et les échelles de dégâts ?
> `Track` est le `looseObject` du schéma, donc rien n'est contrôlé.

---

### dépendance manquante

**[bloquant]** Quelles conditions de licence autorisent le texte d'une fiche publiée à entrer dans `examples/` ?
> Les transcriptions sont restées dans le scratchpad et n'entrent pas dans `examples/`

**[majeur]** Quand les définitions de jeu d'Urban Shadows, Monsterhearts et The Sprawl sont-elles écrites, relativement aux corrections du livret ?
> Les colonnes de caractéristiques du Fantôme sont le même problème que les lignes MotW.
