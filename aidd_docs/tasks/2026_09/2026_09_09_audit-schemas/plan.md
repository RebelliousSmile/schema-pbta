---
objective: "Chaque schéma PbtA généré est audité automatiquement sur sa validité, son identité, sa documentation, ses bornes numériques et son comportement face à un corpus positif et négatif."
status: implemented
---

# Plan: Porter l’audit des schémas

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Porter l’audit de `schema-adrenaline` et l’adapter à toutes les entrées de `TARGETS`, soit les dix cibles jeu/type actuelles. |
| **Source** | [Issue GitHub #1](https://github.com/RebelliousSmile/schema-pbta/issues/1) |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1   | Rendre les schémas mesurables | [`phase-1.md`](./phase-1.md) |
| 2   | Porter l’auditeur et constituer le corpus | [`phase-2.md`](./phase-2.md) |
| 3   | Bloquer les régressions dans le pipeline | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [Issue #1](https://github.com/RebelliousSmile/schema-pbta/issues/1) | Demande cinq contrôles bloquants par schéma, puis des cas de refus et des témoins. |
| [`schema-adrenaline/tools/audit-schemas.ts`](https://github.com/RebelliousSmile/schema-adrenaline/blob/main/tools/audit-schemas.ts) | Fournit l’algorithme de référence pour le contrôle des sources, le méta-schéma draft-7, Ajv, les `$id`, les descriptions, les bornes et le corpus. |
| [`schema-adrenaline/corpus/README.md`](https://github.com/RebelliousSmile/schema-adrenaline/blob/main/corpus/README.md) | Établit la convention `corpus/refus` + `corpus/temoins`, avec un fichier par défaut réel et au moins un témoin par cible. |

## Decisions

| Decision | Why |
| -------- | --- |
| Injecter le `$id` dans `gen-schemas.ts` à partir du jeu et du type de cible. | Un même objet Zod génère les schémas de Masks et de Monster of the Week ; une métadonnée statique dans le schéma source ne pourrait donc pas donner une identité propre à chaque fichier publié. |
| Ranger le corpus sous `<camp>/<jeu>/<cible>/`. | `TARGETS` contient deux fois chacun des cinq noms de cible ; le jeu fait partie de l’identité d’un schéma et ce rangement reste correct si leurs formes divergent plus tard. |
| Porter les cinq contrôles demandés, le contrôle des sources et le corpus, sans le contrôle de gels versionnés `3b`. | L’issue demande explicitement cinq contrôles par schéma et le dépôt ne produit actuellement aucun instantané sous `schemas/<jeu>/<version>/`; introduire ce système de publication serait un changement distinct. |
| Distinguer bornes de règle et plafond de transport. | Une limite publiée ou structurelle devient la borne du domaine ; un nombre volontairement générique reste libre dans la plage signée 32 bits (`-2147483648` à `2147483647`, ou `0` à `2147483647` pour un compte), afin de satisfaire l’audit sans inventer une règle PbtA. |
| Détecter les appels interdits avec l’API compilateur TypeScript. | `typescript` est déjà une dépendance de développement ; parcourir les `CallExpression` exclut naturellement commentaires et chaînes tout en localisant les vrais appels `.refine()` et `.default()`. |
