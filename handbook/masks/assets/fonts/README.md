# Polices

Le thème embarque quatre familles libres, pour évoquer la maquette imprimée de Masks sans prétendre être ses polices officielles :

- **Staatliches** (400) pour les grands titres condensés ;
- **Josefin Sans** (100 à 700, un fichier statique par graisse) pour les intertitres et les libellés ;
- **Crimson Pro** (200 à 900, droite et italique, un fichier statique par graisse) pour le corps du texte ;
- **Comic Neue** (400 et 700) pour les textes à lire à voix haute et les boîtes de moves.

Staatliches et Comic Neue viennent du dépôt `google/fonts` (`ofl/staatliches`, `ofl/comicneue`) et sont seulement convertis en WOFF2, sans sous-ensemblage. Josefin Sans et Crimson Pro sont les instances statiques des paquets Fontsource 5.3.0 (`@fontsource/josefin-sans`, `@fontsource/crimson-pro`), sous-ensemble latin, non modifiées : une police variable arrive dans un export PDF de Chromium sous forme de glyphes Type3, que les imprimantes refusent. La graisse 400 est déclarée dans `assets.fonts`, les autres dans `faces.css`. La licence de chaque famille accompagne ses fichiers :

- [`OFL-Staatliches.txt`](./OFL-Staatliches.txt)
- [`OFL-JosefinSans.txt`](./OFL-JosefinSans.txt)
- [`OFL-CrimsonPro.txt`](./OFL-CrimsonPro.txt)
- [`OFL-ComicNeue.txt`](./OFL-ComicNeue.txt)

Les quatre familles sont distribuées sous SIL Open Font License 1.1.
