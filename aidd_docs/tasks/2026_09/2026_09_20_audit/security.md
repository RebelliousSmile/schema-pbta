---
name: audit
description: Codebase audit report - security pillar, schema-pbta
argument-hint: N/A
---

# Codebase Audit: schema-pbta / security

Aucun secret, aucune injection de commande, un échappement HTML réellement appliqué sur ses 48 sites. Le seul écart est une fuite de confidentialité : un chemin absolu de la machine de l'auteur, commité dans un dépôt public.

- **Date**: 2026-09-20
- **Scope**: schema-pbta / security
- **Health**: good
- **Findings**: 0 critical, 1 warning, 1 minor

## Findings

| Sev | Category | Location                                                                 | Issue                                                                                                                                                                                                                                                                              | Suggested fix                                                                                                                                       | Effort |
| --- | -------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 🟡  | security | `aidd_docs/tasks/2026_09/2026_09_17_salvage_run_published_game/plan.md:13` | Un chemin absolu de la machine de l'auteur est commité dans un dépôt **public**. Le chemin personnel a été masqué de ce rapport afin de ne pas le republier. | Réécrire la référence en chemin relatif au frère (`../lantern/src/templates/pbta/{game-definition,playbook}/sample.ts`), la convention que `cross-tool.config.json:18` applique déjà partout ailleurs | S      |
| 🟢  | security | `.github/workflows/ci.yml:35`                                            | Le job `contract` clone quatre dépôts externes et lance `npm ci` / `pnpm install` dans chacun, donc exécute les scripts d'installation de quatre bases de code dans le runner. Les références sont épinglées au commit (`cross-tool.config.json`), ce qui est la bonne défense, mais aucun `--ignore-scripts` ne borne ce qui tourne | Ajouter `--ignore-scripts` aux installations des participants si aucune n'a besoin d'un script de post-installation                                   | S      |

Vérifié sain :

- **Aucun secret** : la recherche de `api_key`, `secret`, `token`, `password` en position d'affectation ne ramène que trois expressions régulières de validation de jetons de capacité (`src/cross-tool-provider.ts:18`, `src/pack-manifest.ts:7`, `tools/validate-handbook-packs.ts:16`). Aucune valeur, aucun fichier `.env`, aucune clé.
- **Pas d'injection de commande.** Les quatre sites `child_process` (`tools/checkout-cross-tool.mjs:7,23`, `tools/prepare-release.ts:6,29`, `tools/validate-cross-tool-contract.ts:2`, `tools/validate-package.ts:5`) passent par `spawnSync` avec un **tableau** d'arguments, jamais par un shell : `spawnSync("git", args, { cwd, encoding: "utf8", … })` (`checkout-cross-tool.mjs:23`), et l'échec lève avec la sortie plutôt que de continuer (`:24-26`).
- **L'échappement HTML est correct et appliqué.** `escapeHtml` (`tools/render-handbook-preview.ts:57-63`) couvre les cinq caractères (`&`, `<`, `>`, `"`, `'`) et est appelé **48 fois**. La relecture des interpolations non échappées montre uniquement des messages d'erreur, des noms de classes littéraux et des nombres bornés par un `typeof … === "number"` (par exemple `:288-289`) : aucune valeur du corpus n'atteint le HTML sans passer par la fonction. Les données interpolées venant des exemples TOML (`:196`, `:200`, `:298`) sont toutes échappées.
- **`permissions: contents: read`** est déclaré au niveau du workflow (`ci.yml:6`), donc le jeton de la CI ne peut pas écrire dans le dépôt.
- **Pas de validation contournable** : la bibliothèque ne fait que valider — les schémas Zod sont l'unique porte d'entrée, `src/codecs/toml.ts:167` passe tout par un `ZodType`, et aucun chemin ne construit un document sans le valider.
- **Licence MIT déclarée** (`package.json`), cohérente avec le fichier `LICENSE` publié (`files:80`).

## Top actions

1. **Remplacer le chemin absolu** (`plan.md:13`) : effort `S`, dépôt public, aucune raison de publier une arborescence de machine.
2. **Borner l'installation des participants** (`ci.yml:35-46`) : les commits sont épinglés, mais quatre `npm ci` exécutent des scripts tiers dans le runner.

## Coverage

- **Scanned**: security (secrets en dur, injection de commande sur les sites `child_process`, échappement des sorties HTML générées, permissions du workflow, points d'entrée de validation, fuite d'information dans les fichiers commités, licence)
- **Skipped**: none
