# Packs visuels Handbook

Ce répertoire contient les cinq packs visuels publiés par le catalogue racine
`handbook.json`. Handbook 2.7.1 ou supérieur les installe ensemble depuis la
source GitHub `RebelliousSmile/schema-pbta`.

## Séparation des responsabilités

- `handbook/<game>/pack.json` est le manifeste installable et déclaratif du jeu.
- `handbook/<game>/assets/` contient uniquement les images que ce manifeste peut déclarer.
- `examples/<game>/` contient les données canoniques consommables par Lantern et les previews.
- `handbook/<game>/preview/preview.toml` sélectionne des documents canoniques par slug ; il ne contient aucune règle.
- `handbook/<game>/preview/index.html` est régénéré par `npm run handbook:render`.
- `handbook/<game>/styles/base.css` définit l’identité du jeu.
- `styles/variants/<slug>.css` et `assets/variants/<slug>/` forment un delta purement visuel.
- `handbook/shared/` contient la structure et les tokens communs, pas de contenu de jeu.

Les HTML, CSS et TOML de preview restent locaux : ils ne sont référencés ni par
`handbook.json` ni par les manifests installables. Le payload distant se limite
au catalogue, aux cinq `pack.json` et à leurs six SVG déclarés. Aucun script,
aucune feuille CSS externe et aucune police placeholder ne sont distribués.

Le sélecteur de variante de la preview modifie `html[data-variant]` sans
remplacer le HTML. Dans Handbook, le choix équivalent apparaît en temps réel
après sélection de Monsterhearts 2 : `base` (*Gothique sage*) est la valeur par
défaut et `drowned-lake` son unique alternative. Les deux mécanismes restent
purement visuels. Le détail des régions stables se trouve dans
`shared/preview-contract.md`.

## Commandes

```sh
npm run handbook:render
npm run handbook:validate
npm run handbook:fixtures
npm run handbook:install # optionnel, avec HANDBOOK_ROOT ou ../handbook
```

La validation autonome exige un pack pour chaque jeu déclaré, ferme le payload
sur ses seuls manifests et images, puis exerce les refus attendus. La dernière
commande traverse en plus le véritable installateur Handbook sans modifier son
dépôt. La provenance et la licence de chaque SVG sont consignées dans
[`../LICENSES/HANDBOOK-ASSETS.md`](../LICENSES/HANDBOOK-ASSETS.md).
