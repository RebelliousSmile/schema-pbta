---
objective: "Le descripteur inter-dépôts est un contrat vérifié et non plus déclaratif : schema-pbta le valide, le publie et le fait respecter, et les défauts des dépôts voisins sont ouverts en issues plutôt que corrigés sur place."
status: implemented
---

<!-- Fill or omit these sections; never add, rename, or reorder one. -->

# Plan: Faire respecter le descripteur inter-dépôts

## Overview

| Field      | Value                   |
| ---------- | ----------------------- |
| **Goal**   | `cross-tool-provider.json` cesse d'être décoratif : ses champs sont typés, vérifiés et publiés, et un chemin mort échoue au lieu de passer. |
| **Source** | Comparaison des trois dépôts de schéma (session du 2026-09-20), vérifiée aux HEAD `4c67bad` / `e1dc0d5` / `48f247e`. |

## Phases

| #   | Phase        | File                         |
| --- | ------------ | ---------------------------- |
| 1   | Typer et publier le descripteur | [`phase-1.md`](./phase-1.md) |
| 2   | Ouvrir les issues chez les voisins | [`phase-2.md`](./phase-2.md) |
| 3   | Faire respecter le descripteur chez tous les fournisseurs | [`phase-3.md`](./phase-3.md) |

Les phases 2 et 3 sont indépendantes : la fermeture d'une issue oblige à retirer un écart enregistré, elle ne conditionne pas le durcissement.

## Resources

| Source | Verified          |
| ------ | ----------------- |
| `../../../../tools/validate-cross-tool-contract.ts` | L'orchestrateur ne lit que `providerVersion`, `packManifest` et `commands.validatePack` ; `corpus` et `capabilities` sont déclarés par les trois fournisseurs et consommés par personne. |
| `../../../../../schema-adrenaline/cross-tool-provider.json` | Déclare `corpus: "corpus/contract/cases.json"`, fichier absent : le manifeste est à `corpus/cases.json`. La porte reste verte. |
| `../../../../../handbook/src/games/capabilities.ts` | Handbook publie son vocabulaire de capacités (`GAME_PLUGIN_SUPPORT`, `PORTABLE_GAME_PLUGIN_SUPPORT`) : une vérification de `capabilities.handbook` est possible, mais depuis Handbook. |
| `grep -rn "edit:" lantern/src lantern/tools` | Aucune correspondance : Lantern ne publie aucune surface de capacité, donc `capabilities.lantern` n'est vérifiable contre rien aujourd'hui. |
| `../../../../src/pack-manifest.ts` | Le patron d'un schéma de manifeste publié existe déjà (Zod strict, export public, consommé par un outil et par le contrôle consommateur). |
| `../../../../tools/validate-package.ts` | Le script consommateur importe et applique déjà `packManifestSchema` depuis le tarball installé : valider un descripteur de la même façon est une extension d'un mécanisme éprouvé, pas une inconnue de résolution. |
| `../../../../tools/validate-pack-coverage.ts` | `KNOWN_ALIAS_TARGETS` fournit l'idiome d'écart enregistré retenu en phase 3 : la liste échoue si un écart nouveau apparaît et échoue aussi si un écart inscrit est réparé sans être retiré. |

## Decisions

| Decision   | Why   |
| ---------- | ----- |
| Le schéma du descripteur est agnostique du fournisseur, contrairement à `packManifestSchema`. | `packManifestSchema` épingle `provider: z.literal("schema-pbta")` et `contractVersion: z.literal(5)` parce qu'il ne décrit que des packs PbtA. Le descripteur, lui, doit valider mist et adrenaline : `provider` est une chaîne libre et `contractVersion` un entier positif facultatif. |
| L'orchestrateur durcit tout de suite, en enregistrant les écarts des voisins plutôt qu'en attendant leur correctif. | Rendre `corpus` et `contractVersion` bloquants ferait immédiatement échouer deux fournisseurs que ce dépôt n'a pas le droit de corriger, et une phase dont la première tâche est « attendre un tiers » n'est pas exécutable. `validate-pack-coverage.ts` a déjà tranché ce problème ici : il épingle son anomalie dans une liste qui échoue aussi bien si un écart nouveau apparaît que si un écart inscrit disparaît sans être retiré. |
| `contractVersion` reste optionnel dans le schéma partagé. | Mist et adrenaline ne le portent pas : l'exiger ferait rejeter deux descripteurs sur trois par l'outil même censé les valider. Le champ est exigé de pbta par son auto-validateur, et son absence chez les voisins est un écart enregistré, pas une tolérance muette. |
| La phase 1 ajoute un export public, donc le cycle se clôt sur un incrément mineur. | `crossToolProviderSchema` entre dans `src/index.ts` : la surface publique grandit sans rien casser. `validate-version-compat.ts` exige seulement que le major reste égal à `PBTA_CONTRACT_VERSION`, soit 5 — un mineur passe, un majeur imposerait un nouveau dossier de schémas. |
| Aucune vérification de `capabilities` dans ce plan. | Les valeurs `edit:*` ne correspondent à rien de publié par Lantern : les vérifier reviendrait à inventer un vocabulaire. La phase 2 ouvre l'issue ; la vérification attend que l'hôte publie sa surface. |
| Les dépôts voisins reçoivent des issues, jamais un commit. | Contrainte explicite de la demande ; elle vaut aussi pour Lantern et Handbook, qui ne sont pas des dépôts de schéma mais subissent les mêmes constats. Les quatre reçoivent chacun une issue dédiée : greffer le volet capacités sur handbook#36, qui porte un bump de dépendance, traiterait Handbook autrement que Lantern pour un constat identique. |
