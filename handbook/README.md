# Packs visuels Handbook

Ce répertoire contient à la fois les packs déclaratifs installables par Handbook
2.7.1 ou supérieur et leurs outils locaux de conception. Le catalogue racine
`handbook.json` est la liste exhaustive des cinq packs distribués par cette
source.

## Séparation des responsabilités

- `examples/<game>/` contient les données canoniques consommables par Lantern et Handbook.
- `handbook/<game>/pack.json` est le manifeste installable et la source de vérité de sa version.
- Les seuls fichiers copiés avec le manifeste sont les images qu’il déclare sous son `assets.root`.
- `handbook/<game>/preview/preview.toml` sélectionne des documents canoniques par slug ; il ne contient aucune règle.
- `handbook/<game>/preview/index.html` est régénéré par `npm run handbook:render`.
- `handbook/<game>/styles/base.css` définit l’identité du jeu.
- `styles/variants/<slug>.css` et `assets/variants/<slug>/` forment un delta purement visuel.
- `handbook/shared/` contient la structure et les tokens communs, pas de contenu de jeu.

Le sélecteur de variante modifie `html[data-variant]` et charge la feuille correspondante en temps réel. Il ne remplace jamais le HTML. Le détail des régions stables se trouve dans `shared/preview-contract.md`.

Les HTML, CSS et TOML de preview ne sont jamais installés. Les packs v1 règlent
uniquement les variables natives d’Obsidian : ils ne livrent encore ni fences,
ni callouts PbtA, ni code exécutable. Monsterhearts utilise `base` par défaut et
propose également `drowned-lake` à chaud. Les répertoires de polices ne
contiennent que des indications de design et aucune police distribuée.

Toute modification installable impose le même bump `0.1.x` dans le `pack.json`
concerné et dans son entrée de `handbook.json`. La provenance des SVG distribués
est centralisée dans `../LICENSES/HANDBOOK-ASSETS.md`.

## Commandes

```sh
npm run handbook:render
npm run handbook:validate
npm run handbook:validate:fixtures
npm run check
```

La validation exige un pack pour chaque jeu déclaré, résout les références
locales, refuse les payloads exécutables et contrôle la surface mécanique
minimale destinée aux formulaires Lantern. Depuis un checkout Handbook frère,
`SCHEMA_PBTA_ROOT=/chemin/vers/schema-pbta npm run assert:pbta-source` vérifie
l’installation groupée et l’atomicité avec le véritable installateur.
