# Polices

Le thème embarque trois alternatives libres aux familles utilisées dans la
maquette imprimée d’Urban Shadows :

- **League Gothic** pour les grands titres condensés ;
- **Source Serif 4** pour le corps, les sous-titres et les textes mécaniques ;
- **Protest Revolution** pour les titres au pinceau (statistiques, cercles, blessures, « Let it out » en capitales, et section de nuit).

League Gothic, Source Serif 4 et Protest Revolution proviennent des paquets Fontsource 5.3.0
([`OFL-1.1.txt`](./OFL-1.1.txt)). Source Serif 4 est publiée en instances
statiques de 200 à 900, une par graisse (la 400 dans `assets.fonts`, les autres
dans `faces.css`) : une police variable arrive dans un export PDF de Chromium
sous forme de glyphes Type3, que les imprimantes refusent. Protest Revolution
(`@fontsource/protest-revolution@5.3.0`, instance statique, sous-ensemble latin, non modifiée) conserve sa
licence dans [`OFL-ProtestRevolution.txt`](./OFL-ProtestRevolution.txt). Les trois familles sont
distribuées sous SIL Open Font License 1.1 et ne sont pas présentées comme les
polices officielles du jeu.
