# Packs visuels Handbook

Ce répertoire est une référence locale en attendant la stabilisation du format installable de Handbook. Chaque jeu possède un pack autonome avec son aperçu généré, son thème, ses images et la provenance de ses assets.

## Séparation des responsabilités

- `examples/<game>/` contient les données canoniques consommables par Lantern et Handbook.
- `handbook/<game>/preview/preview.toml` sélectionne des documents canoniques par slug ; il ne contient aucune règle.
- `handbook/<game>/preview/index.html` est régénéré par `npm run handbook:render`.
- `handbook/<game>/styles/base.css` définit l’identité du jeu.
- `styles/variants/<slug>.css` et `assets/variants/<slug>/` forment un delta purement visuel.
- `handbook/shared/` contient la structure et les tokens communs, pas de contenu de jeu.

Le sélecteur de variante modifie `html[data-variant]` et charge la feuille correspondante en temps réel. Il ne remplace jamais le HTML. Le détail des régions stables se trouve dans `shared/preview-contract.md`.

## Commandes

```sh
npm run handbook:render
npm run handbook:validate
```

La validation exige un pack pour chaque jeu déclaré, résout les références locales et contrôle la surface mécanique minimale destinée aux formulaires Lantern.
