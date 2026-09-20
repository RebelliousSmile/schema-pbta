# Vérification par mutation

Chaque règle ajoutée est prouvée par une mutation qui la viole : N mutations, N échecs
distincts. Une règle non éprouvée est une intention.

## Phase 1 — `tools/validate-cross-tool-provider.ts`

Sept mutations de `cross-tool-provider.json`, sept échecs, chacun nommant son champ.

| Mutation | Échec |
| --- | --- |
| `providerVersion: 2` | `ZodError`, chemin `providerVersion` |
| `contractVersion: 4` | `contractVersion 4 does not match PBTA_CONTRACT_VERSION 5` |
| `contractVersion` retiré | `this repo must declare its contractVersion, even though the shared schema allows its absence` |
| `corpus: "corpus/contract/nope.json"` | `corpus corpus/contract/nope.json resolves to no file` |
| `packManifest: "packs/pack-contract.json"` | `ZodError`, chemin `packManifest` |
| `commands.validatePack: []` | `ZodError`, chemin `commands` |
| `capabilities.lantern: []` | `ZodError`, chemin `capabilities.lantern` |

Les deux mutations sur `contractVersion` sont la paire décisive : le schéma partagé
admet l'absence du champ — sans quoi il rejetterait mist et adrenaline, les deux
descripteurs qu'il existe pour valider — tandis que l'auto-validateur l'exige de ce
dépôt-ci. Une seule des deux mutations ne prouverait pas la divergence.

## Phase 3 — `tools/validate-cross-tool-contract.ts`

Six mutations, six échecs, chacun nommant le fournisseur fautif. Les quatre premières
portent sur un descripteur, les deux dernières sur la liste `KNOWN_DEVIATIONS`
elle-même.

| Mutation | Échec |
| --- | --- |
| `corpus` mort chez `schema-pbta`, fournisseur non inscrit | `schema-pbta:corpus: undeclared deviation from the provider descriptor contract` |
| `packManifest` sans segment générique | descripteur rejeté par le schéma, chemin `packManifest` |
| `providerVersion: 2` | descripteur rejeté par le schéma, chemin `providerVersion` |
| `commands.validatePack: []` | descripteur rejeté par le schéma, chemin `commands` |
| entrée `schema-in-the-mist:contractVersion` retirée alors que l'écart subsiste | `schema-in-the-mist:contractVersion: undeclared deviation…` |
| entrée `schema-pbta:contractVersion` ajoutée pour un écart déjà réparé | `schema-pbta:contractVersion: recorded as a known deviation but no longer present — … is fixed, so remove the entry` |

Les deux dernières sont ce qui empêche la liste de devenir un cimetière : elle échoue
quand un écart nouveau apparaît **et** quand un écart inscrit disparaît sans être
retiré. Elle ne peut donc pas survivre aux anomalies qu'elle enregistre.

## État de la porte aux pins actuels

```
✓ schema-pbta (contract 5): 6 pack manifests validated.
✓ schema-in-the-mist (unversioned): 3 pack manifests validated.
✓ schema-adrenaline (unversioned): 1 pack manifests validated.
  tolerated deviation: schema-adrenaline:contractVersion (RebelliousSmile/schema-adrenaline#10)
  tolerated deviation: schema-adrenaline:corpus (RebelliousSmile/schema-adrenaline#10)
  tolerated deviation: schema-in-the-mist:contractVersion (RebelliousSmile/schema-in-the-mist#14)
✅ Cross-tool contract passed with 3 tolerated deviations.
```

## Note d'environnement

`npm run check` échoue à l'étape `validate:release` lorsqu'il est lancé depuis l'outil
Bash de cette machine : le `tar` de Git Bash lit le `C:\…` d'un chemin Windows comme un
hôte distant (`tar (child): Cannot connect to C: resolve failed`). Sous PowerShell, la
chaîne passe entièrement. Ce n'est pas une régression du code.

Réparé après coup : `canonicalContents` extrait depuis le dossier de destination et
nomme le tarball relativement, en séparateurs POSIX, donc sans `:` dans l'argument.
`npm run check` sort 0 sous les deux shells. `--force-local` était écarté : il répare
GNU tar et casse le bsdtar que PowerShell utilise.
