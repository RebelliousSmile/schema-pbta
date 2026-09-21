---
name: audit
description: Codebase audit report - ui pillar, schema-pbta
argument-hint: N/A
---

# Codebase Audit: schema-pbta / ui

Six prévisualisations générées, une feuille partagée propre, et un jeu qui n'est pas stylé du tout : la feuille de Salvage Run cible une classe qui n'existe nulle part. Le reste du pilier est une dérive de système de conception, chaque jeu réintroduisant ses couleurs en dur.

- **Date**: 2026-09-20
- **Scope**: schema-pbta / ui
- **Health**: fair
- **Findings**: 1 critical, 2 warning, 1 minor

## Findings

| Sev | Category | Location                                     | Issue                                                                                                                                                                                                                                                                                                                                                                | Suggested fix                                                                                                                                                       | Effort |
| --- | -------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 🔴  | ui       | `handbook/salvage-run/styles/base.css:1`     | La feuille de style ne s'applique à rien. Son contenu entier est `.handbook-preview { --salvage-accent: #e99b42; }`, or la classe `handbook-preview` a **0 occurrence** dans tout `handbook/` : le générateur émet `<main class="handbook-sheet" data-handbook-preview>` (`tools/render-handbook-preview.ts`), donc `handbook-preview` n'est qu'un **nom d'attribut**, pas une classe. Les cinq autres jeux ciblent correctement `html[data-game="<jeu>"]`. Salvage Run s'affiche donc avec la seule feuille partagée, sans son accent, et sa feuille de 50 octets ne le signale pas | Réécrire le sélecteur en `html[data-game="salvage-run"]`, comme les cinq autres feuilles, et vérifier que la variable est bien consommée par `handbook/shared/preview.css` | S      |
| 🟡  | ui       | `handbook/monsterhearts/styles/base.css:1`   | **Dérive du système de conception** : la feuille partagée expose **34 propriétés personnalisées** et **0 couleur en dur**, mais chaque feuille par jeu réintroduit la sienne — monsterhearts 12 valeurs hexadécimales (4 486 o), the-sprawl 12 (1 554 o), masks 9 (1 399 o), motw 9 (1 557 o), urban-shadows 8 (4 111 o), et la variante `monsterhearts/styles/variants/drowned-lake.css` 19 de plus (2 366 o). Les jetons partagés ne sont donc pas la source de vérité : ils sont un point de départ que chaque jeu contourne | Faire passer chaque couleur par une propriété personnalisée déclarée dans la feuille partagée, pour qu'une feuille de jeu ne fasse que réaffecter des jetons          | M      |
| 🟡  | ui       | `handbook/masks/index.html:84`               | Le changement de variante ne fonctionne **que** si JavaScript tourne : la feuille de variante est liée `disabled` (`<link data-variant-stylesheet rel="stylesheet" disabled>`) et seul le script en ligne de chaque page la réactive (généré par `tools/render-handbook-preview.ts:330,342,389,416` ; présent aux lignes `:84` masks, `:82` motw, `:48` monsterhearts, `:78` salvage-run, `:76` the-sprawl, `:92` urban-shadows). Sans script, le sélecteur reste affiché et sans effet : le contrôle ment sur son état. Aucun `<noscript>` n'accompagne le sélecteur | Rendre la variante lisible sans script — lier la feuille de base par défaut et n'utiliser le script que pour *changer* —, ou masquer le sélecteur par défaut et le révéler depuis le script | M      |
| 🟢  | ui       | `handbook/shared/preview.css:47`             | La gestion du focus tient à **une seule règle** `:focus-visible`, dans la feuille partagée, et il y en a **0 dans les sept feuilles par jeu** — qui sont précisément celles qui redéfinissent les couleurs. Un jeu peut donc dégrader le contraste de l'anneau de focus sans que rien ne le rattrape, et le seul contrôle interactif de la page est le `<select>` de variante | Déclarer la couleur de l'anneau de focus comme jeton partagé consommé par la règle, pour qu'un changement de palette l'emmène avec lui                                | S      |

Vérifié bon, et à préserver :

- **Le socle des documents est correct** : `<!doctype html>`, `lang="fr"`, `data-game` et `data-variant` sur `<html>`, méta `viewport` présente sur les six pages.
- **La hiérarchie visuelle tient** : exactement **un `<h1>`** par page, puis 8 à 14 `<h2>` et 3 à 6 `<h3>`, sans saut de niveau. C'est ce qui rend ces feuilles de personnage parcourables au clavier et au lecteur d'écran malgré leur densité.
- **Les décorations sont masquées aux lecteurs d'écran, et leur valeur est dite en texte** : les pistes de pastilles portent `aria-hidden="true"` (`tools/render-handbook-preview.ts:87`, `:257`) tandis que le conteneur porte `aria-label="<valeur> sur <max>"` (`:134`) — l'information passe, l'ornement non. Même traitement pour les compteurs d'usage (`:222`) et les listes d'étiquettes (`:79`).
- **Le contrôle de variante est étiqueté par englobement** : `<label class="handbook-variant">Variante<select data-variant-picker>` — pas de `for` orphelin possible.
- **Le responsive est réellement traité** : trois points de rupture dans la feuille partagée (`:29` 980 px, `:32` 700 px, `:101` 420 px) plus un `@media print` (`:107`), ce qui est le bon réflexe pour un document destiné à être imprimé autant que lu.
- **Zéro image** dans les six pages : rien à charger, rien à décrire, aucun texte alternatif manquant possible.

Ce que le pilier ne couvre pas ici : il n'y a **ni états de chargement, ni états d'erreur, ni états vides** à auditer, et ce n'est pas un manque — ce sont des documents statiques générés à la compilation, sans récupération de données.

Mode dégradé : **no url provided, runtime a11y pass skipped, static inspection only** — aucune adresse n'a été fournie, donc pas de passage d'accessibilité à l'exécution, pas de mesure de contraste calculée, pas de parcours au clavier réel. Les constats ci-dessus viennent du HTML généré, du générateur et des feuilles de style.

## Top actions

1. **Corriger le sélecteur de la feuille Salvage Run** (`handbook/salvage-run/styles/base.css:1`) : effort `S`, et c'est le jeu le plus récent qui s'affiche aujourd'hui sans son identité visuelle.
2. **Ramener les couleurs des jeux sur les jetons partagés** (`handbook/*/styles/base.css`) : 50 valeurs en dur réparties sur sept feuilles, contre 34 jetons prévus pour ça.
3. **Rendre la variante honnête sans JavaScript** (`tools/render-handbook-preview.ts:330`).

## Coverage

- **Scanned**: ui (structure des documents générés, hiérarchie des titres, marquage d'accessibilité et sites `aria-*` du générateur, étiquetage des contrôles, dérive par rapport aux jetons du système de conception, application réelle des feuilles par jeu, points de rupture et impression, gestion du focus, poids et images)
- **Skipped**: none, mais le pilier a tourné en mode dégradé — no url provided, runtime a11y pass skipped, static inspection only
