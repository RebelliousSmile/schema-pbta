---
status: done
---

# Instruction: Fixtures, corpus et surfaces Lantern

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
examples/masks, examples/monster-of-the-week, examples/the-sprawl, examples/urban-shadows ✏️ Ajoutent un livret spécialisé canonique par jeu.
corpus/contract/** ✏️ Témoins acceptés et refusés pour chaque nouvelle cible.
corpus/temoins et corpus/refus ✏️ Audit JSON correspondant.
```

## User Journey

```mermaid
flowchart TD
  A[Fixture specialisee] --> B[Schema et codec]
  B --> C[Round trip]
  D[Region ou mecanique invalide] --> B
  B --> E[Refus]
```

## Test Scope

```mermaid
journey
  section Setup
    preparer une fixture par jeu => TOML specialises disponibles: 5: cli
  section Happy path
    valider examples et corpus => chaque livret passe le round trip: 5: cli
  section Edge case - champ inconnu
    ajouter une donnee non declaree => schema refuse le livret: 5: cli
```

## Tasks to do

### `1)` Migrer les sources canoniques

> Donner à chaque livret une unique fixture spécialisée complète.

1. Ajouter les exemples originaux spécialisés, avec leur contenu éditorial complet.
2. Ajouter cas positifs et négatifs par cible.
3. Vérifier les codecs et le corpus d'audit.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | Handbook et Lantern peuvent charger un TOML spécialisé complet pour chaque jeu. |
