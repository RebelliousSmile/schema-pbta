# Polices

Le thème embarque trois familles libres, pour évoquer l'esthétique cyberpunk du jeu imprimé sans prétendre être ses polices officielles :

- **Michroma** (400) pour les titres larges ;
- **Jura** (300 à 700) pour les intertitres et les libellés ;
- **Exo 2** (100 à 900, droite et italique) pour le corps du texte.

Les fichiers viennent des paquets Fontsource (`@fontsource/michroma`, `@fontsource/jura` et `@fontsource/exo-2` 5.3.0), sous-ensemble latin, au format WOFF2 : un fichier statique par graisse, non modifié, car une police variable arrive dans un export PDF de Chromium sous forme de glyphes Type3, que les imprimantes refusent. La graisse 400 est déclarée dans `assets.fonts`, les autres dans `faces.css`. La licence de chaque famille accompagne ses fichiers :

- [`OFL-Michroma.txt`](./OFL-Michroma.txt)
- [`OFL-Jura.txt`](./OFL-Jura.txt)
- [`OFL-Exo2.txt`](./OFL-Exo2.txt)

Les trois familles sont distribuées sous SIL Open Font License 1.1.
