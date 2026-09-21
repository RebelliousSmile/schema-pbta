---
name: audit
description: Codebase audit report - dependencies pillar, schema-pbta
argument-hint: N/A
---

# Codebase Audit: schema-pbta / dependencies

Deux dépendances d'exécution, six de développement, deux avis de sécurité tous deux corrigeables et confinés au développement. Le vrai défaut du pilier est en aval : le tag `v5.6.0` existe, aucun workflow ne peut en faire une release, et les deux consommateurs installent des tarballs de release.

- **Date**: 2026-09-20
- **Scope**: schema-pbta / dependencies
- **Health**: fair
- **Findings**: 1 critical, 3 warning, 1 minor

## Findings

| Sev | Category     | Location                       | Issue                                                                                                                                                                                                                                                                                                                                                  | Suggested fix                                                                                                                                                       | Effort |
| --- | ------------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 🔴  | dependencies | `.github/workflows/ci.yml:1`   | **Il n'y a pas de workflow de release** : `.github/workflows/` ne contient que `ci.yml`. Le tag `v5.6.0` existe, la dernière release publiée est **v5.5.0**, et `package.json:3` dit `5.6.0`. Or `lantern` et `handbook` installent ce paquet depuis le **tarball de release**, donc poser un tag ici ne livre rien : la version courante est inatteignable pour ses deux consommateurs. Les deux dépôts frères ont un `release.yml` ; celui-ci ne l'a jamais eu | Ajouter un `release.yml` déclenché sur tag, idempotent comme celui de `schema-in-the-mist` (qui adopte une release existante au lieu d'échouer), avec la vérification tag/version — mais sans reproduire le piège de `schema-adrenaline`, où cette vérification échoue sur deux tags | M      |
| 🟡  | dependencies | `package.json:85`              | `fast-uri` **high**, sept avis (confusion d'hôte par antislash littéral, par introducteur d'antislash, par délimiteur d'autorité encodé, traversée de chemin par segments encodés, SSRF par normalisation IPv6 malformée, confusion par normalisation de schéma encodée, canonicalisation IDN échouée) sur la plage `3.0.0 - 3.1.5`, atteint via `ajv`. `fixAvailable: true` | `npm audit fix`, puis relancer `npm run check` : `ajv` n'est utilisé que par l'outillage, donc le risque est borné au poste de développement et à la CI, pas au paquet publié | S      |
| 🟡  | dependencies | `package.json:86`              | `esbuild` **low** sur `0.27.3 - 0.28.0` (lecture de fichier arbitraire quand le serveur de développement tourne sous Windows), atteint via `tsx`. `fixAvailable: true`. Le dépôt est développé sous Windows, donc la plateforme concernée est bien celle-ci — mais aucun serveur de développement n'est lancé ici, `tsx` ne sert qu'à exécuter les outils | Corriger dans la même passe que `fast-uri`                                                                                                                            | S      |
| 🟡  | dependencies | `tools/validate-contract.ts:2` | **Deux analyseurs TOML cohabitent** : `smol-toml` est la dépendance d'exécution et le seul analyseur du codec publié (`src/codecs/toml.ts:1`), tandis que `@iarna/toml` est une dépendance de développement utilisée par trois outils, dont le validateur de contrat. Le témoin est donc relu par un analyseur **autre** que celui livré : une divergence de comportement entre les deux passerait la barrière sans être vue | Faire lire les témoins par `smol-toml`, celui que les consommateurs exécuteront, et retirer `@iarna/toml` — ou documenter la double lecture comme un test de conformité voulu   | M      |
| 🟢  | dependencies | `package.json:82-88`           | Surface minuscule et à jour : **2** dépendances d'exécution (`smol-toml ^1.8.0`, `zod ^4.1.11`) et **6** de développement. Aucune dépendance inutilisée détectée, licence `MIT` déclarée                                                                                                                                                                  | Rien à faire, c'est la bonne base                                                                                                                                     | S      |

L'état des épingles croisées, vérifié plutôt que supposé :

| Consommateur | Version installée | Version source | Release la plus récente |
| ------------ | ----------------- | -------------- | ----------------------- |
| `handbook`   | v5.5.0            | 5.6.0 (taguée) | v5.5.0                  |
| `lantern`    | v5.5.0            | 5.6.0 (taguée) | v5.5.0                  |

Les deux épingles à v5.5.0 sont **délibérées** et documentées (`aidd_docs/tasks/2026_09/2026_09_20_schema-pbta-v5-5-pin/`) : ce n'est pas une dérive. Ce qui l'est, c'est qu'aucune mise à jour vers 5.6.0 ne soit *possible* aujourd'hui, faute de tarball.

## Top actions

1. **Ajouter le workflow de release** (`.github/workflows/`) : sans lui, chaque tag est une promesse que rien ne tient, et les consommateurs restent gelés. Effort `M`, plus haut rapport du pilier.
2. **Passer `npm audit fix`** : deux avis, deux corrections disponibles, aucun impact sur le paquet publié.
3. **Unifier l'analyseur TOML** (`tools/validate-contract.ts:2`) : la barrière de contrat doit exercer le code livré, pas un substitut.

## Coverage

- **Scanned**: dependencies (avis `npm audit` avec sévérité, plage et disponibilité de correctif, dépendances d'exécution contre développement, doublons fonctionnels, licence, chaîne d'approvisionnement en aval — tags, releases et épingles des deux consommateurs)
- **Skipped**: none
