---
objective: "schema-pbta publie un contrat PbtA v1 unique que Handbook et Lantern peuvent importer et vérifier avec les mêmes TOML sans perte de valeur normalisée."
status: implemented
---

# Plan: Contrat PbtA canonique pour Handbook et Lantern

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Achever la surface publique, le corpus de conformité, les capacités Handbook et la publication du package canonique. |
| **Source** | [Issue GitHub RebelliousSmile/schema-pbta#3](https://github.com/RebelliousSmile/schema-pbta/issues/3) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Surface publique et artefact installable | [`phase-1.md`](./phase-1.md) |
| 2 | Corpus TOML multi-document | [`phase-2.md`](./phase-2.md) |
| 3 | Compatibilité, CI et préparation de la release | [`phase-3.md`](./phase-3.md) |
| 4 | Publication immuable du contrat | [`phase-4.md`](./phase-4.md) |
| 5 | Capacités portables des packs Handbook | [`phase-5.md`](./phase-5.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/3 | Le package, et non Handbook ou Lantern, possède les schémas, types et codecs du contrat PbtA. |
| https://docs.npmjs.com/cli/v11/configuring-npm/package-json/ | `files` ferme le contenu publié et `exports` définit explicitement la surface importable du package. |
| https://docs.npmjs.com/cli/v10/configuring-npm/package-json/#urls-as-dependencies | Un tarball HTTPS peut être déclaré directement comme dépendance, sans résolution par un registre. |
| https://docs.npmjs.com/files/package-lock.json/ | Le lockfile conserve l'URL complète d'un tarball distant et son intégrité SRI résolue. |
| https://semver.org/ | Une API publique déclarée doit réserver les ruptures au changement de version majeure et distinguer ajouts compatibles et corrections. |
| https://toml.io/en/v1.0.0 | TOML 1.0.0 impose notamment un document UTF-8 ; cette version devient la référence syntaxique annoncée du contrat. |
| https://docs.github.com/en/repositories/releasing-projects-on-github | Une GitHub Release peut distribuer le tarball construit comme asset téléchargeable sans publication sur un registre. |
| https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases | Une release immuable verrouille son tag et ses assets ; tous les artefacts doivent être joints au brouillon avant publication. |
| https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/verify-release-integrity | Un consommateur peut vérifier l'asset local contre l'attestation de la release avec GitHub CLI. |
| https://docs.github.com/en/rest/repos/repos#check-if-immutable-releases-are-enabled-for-a-repository | L'API du dépôt permet de lire puis d'activer l'immutabilité avec les droits d'administration requis. |
| https://github.com/RebelliousSmile/obsidian-handbook/issues/27 | Handbook doit activer les primitives portables depuis `installation.requires`, sans liste d’identifiants de jeux. |
| https://github.com/RebelliousSmile/lantern/issues/2 | Lantern doit importer le même package et exécuter le même corpus via un registre de types de documents. |

## Decisions

| Decision | Why |
| --- | --- |
| Conserver Zod comme source unique et générer tous les autres artefacts. | Une seconde définition manuelle recréerait précisément la divergence que l’issue doit éliminer. |
| Traiter les cinq types `game-definition`, `move`, `playbook`, `npc` et `front` par un registre public commun. | Les consommateurs peuvent sélectionner un type sans recopier un branchement ou oublier un codec. |
| Publier une surface ESM unique et laisser chaque consumer vérifier son propre bundler. | Handbook utilise esbuild et Lantern Vite ; le contrat ne doit pas entretenir deux formats de modules ni simuler leurs builds. |
| Comparer les valeurs normalisées, jamais le texte TOML ni le DOM. | Les sérialiseurs et renderers peuvent formater différemment sans modifier le sens du document. |
| Geler chaque majeure sous `schemas/v<major>` mais faire pointer son `$id` vers le tag de release exact `v<major>.0.0`. | Le chemin classe le contrat par majeure tandis que l'URL canonique résout toujours un tag de release immuable et existant. |
| Faire de `1.0.0` la première release stable du package pour le contrat de schéma v1. | La version du tarball et la majeure du contrat public deviennent lisibles et suivent la politique SemVer annoncée. |
| Distribuer le `.tgz` comme asset d'une GitHub Release immuable plutôt que sur le registre npm. | Handbook et Lantern peuvent installer exactement le même artefact par URL, sans compte de publication ni copie locale. |
| Faire pointer `v1.0.0` sur le commit de préparation de release, puis consigner la publication dans le commit de phase suivant. | Le tag désigne un commit déjà validé et la discipline d'un commit unique par phase reste respectée. |
| Publier un manifeste de cas de conformité avec les TOML du corpus. | Handbook et Lantern exécutent la même matrice sans dépendre de conventions de noms implicites. |
| Garder les identifiants de jeux dans les packs et les capacités PbtA dans le host. | Un nouveau jeu réutilisant le contrat s’installe par données, sans modification de Handbook ou Lantern. |
| Attendre une release Handbook fournissant les capacités PbtA avant de les annoncer dans les packs. | Un pack ne doit jamais réclamer une capacité absente de sa version minimale du host. |
| Publier l'asset GitHub avant la release Handbook, puis activer les packs après cette release. | Handbook doit pouvoir remplacer son lien local par l'URL immuable du tarball `v1.0.0` avant de devenir le host minimal réclamé par les packs. |
| Faire de ce dossier l’autorité de l’issue #3 pour le producteur schema-pbta. | Le plan cross-tool voisin conserve les consumers ; son commit de fondation existant est audité et complété ici, jamais réimplémenté. |
| Fermer cette issue lorsque le tarball est vérifié et que les issues consommateurs peuvent épingler sa version. | Le producteur garantit le contrat et son kit de conformité ; chaque consumer prouve ensuite son intégration dans sa propre CI afin d’éviter une dépendance circulaire. |
| Publier un SHA-256 avec l'asset mais laisser chaque gestionnaire de paquets enregistrer sa propre intégrité SRI dans le lockfile. | Le checksum de release sert à la vérification indépendante ; le lockfile reste la preuve réellement appliquée lors de l'installation consumer. |
