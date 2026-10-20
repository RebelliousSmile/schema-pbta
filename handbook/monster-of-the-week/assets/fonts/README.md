# Polices

Trois familles libres (SIL Open Font License 1.1), livrées au format WOFF2, chacune avec sa licence à côté :

- **Londrina Solid** (Black, converti en WOFF2 sans autre modification) — titres, le plus proche libre de 3rd Man (`OFL-LondrinaSolid.txt`).
- **Barlow Condensed** — sous-titres et étiquettes, en capitales (`OFL-BarlowCondensed.txt`). La famille `Barlow Condensed` est la graisse 600 ; `Barlow Condensed Regular` et `Barlow Condensed Italic` portent la graisse 400.
- **Crimson Pro** — texte courant, romain et italique de 200 à 900, un fichier statique par graisse (`@fontsource/crimson-pro` 5.3.0, sous-ensemble latin, non modifié ; `OFL-CrimsonPro.txt`). Une police variable arrive dans un export PDF de Chromium sous forme de glyphes Type3, que les imprimantes refusent : la graisse 400 est déclarée dans `assets.fonts`, les autres dans `faces.css`.

Le choix des familles est provisoire : il se tranche à l'œil, au coffre.
