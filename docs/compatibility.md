# Compatibility policy

`schema-pbta` is the canonical executable contract shared by Handbook and
Lantern. It is distributed as an immutable GitHub Release asset, not through the
npm registry.

## Compatibility matrix

| Package | Schema path | Canonical schema tag | TOML | Handbook | Lantern |
| --- | --- | --- | --- | --- | --- |
| `1.0.x` | `schemas/v1` | `v1.0.0` | `1.0.0` | `2.8.0+` | pending consumer issue #2 |
| `2.0.x` | `schemas/v2` | `v2.0.0` | `1.0.0` | `2.8.0+` | pending specialized-playbook issue |
| `3.0.x` candidate | `schemas/v3` | `v3.0.0` (not yet published) | `1.0.0` | `2.8.0+` | pending consumer upgrade |
| `4.0.x` | `schemas/v4` | `v4.0.0` | `1.0.0` | `2.8.0+` | consumer integration tracked in Lantern #5 |
| `5.2.0` | `schemas/v5` | `v5.0.0` | `1.0.0` | `2.8.0+` | pin this release before integrating collection presentation metadata |
| `6.0.x` candidate | `schemas/v6` | `v6.0.0` (not yet published) | `1.0.0` | requires consumer upgrade | requires consumer upgrade |

The schema path groups compatible artifacts by contract major. Every `$id`
uses its exact immutable release tag so it never depends on a movable major alias.

## SemVer

- Patch: implementation or documentation corrections that accept, normalize
  and emit exactly the same values for the current contract major.
- Minor: additive public helpers or corpus cases that do not change a published
  document shape or normalized value.
- Major: any change that rejects a previously accepted value, accepts a value
  with different meaning, invents or loses a value during normalization, or
  otherwise changes a published JSON Schema. A new major creates a new
  `schemas/v<major>` directory and an immutable `v<major>.0.0` baseline; it
  never edits older schema lines.

`npm run validate:version` compares every schema line with its immutable release
tag as a Git blob, so a Windows CRLF checkout does not create a false contract
diff. A divergent artifact fails instead of silently moving its `$id`.

## Specialized playbooks v4

Every published game has one canonical `*-playbook` type in v4. It includes its
structured mechanics and the editorial regions rendered on the sheet. A single
TOML document is the only canonical source for a character sheet. The portable
`playbook` type remains available for cross-game interchange, but cannot satisfy
a movement's `playbook` reference in the canonical corpus.

## Release and consumer integrity

`npm run release:prepare -- --output <directory>` creates the `.tgz` and a
SHA-256 sidecar. Each release must target the validated commit, contain both
assets and be published only while immutable releases are enabled for the
repository. Published tags and assets are never moved or replaced.

Consumers pin the complete HTTPS asset URL in `package.json` and commit their
lockfile. The release SHA-256 is an independent published checksum; the
lockfile's SRI value is the integrity actually enforced by the package manager.
Handbook proves esbuild compatibility in its issue #27 and Lantern proves Vite
compatibility in its issue #2, avoiding a circular producer release.

## Cross-repository release train

The daily `cross-tool.config.json` gate is a fixed regression baseline; it is
not evidence that a new archive can be promoted. A release candidate instead
uses a committed `protocol: 1` release-train manifest with the staged asset URL, its SHA-256,
its npm SHA-512 SRI,
the provider commit, and one canonical GitHub identity plus full commit SHA for
each consumer. The staged asset
has the final package version but lives under an `-rc.N` tag.

`npm run validate:release-train -- <manifest>` rejects mutable refs, arbitrary
commands, missing consumer roles, or an asset whose URL does not identify the
staged final-version archive. The only permitted consumer interface is `npm run
release-train:assert -- <manifest>`. The runner installs the verified archive in
isolated Lantern and Handbook workspaces using the consumer's frozen active
lockfile; it never overlays the candidate with a no-save install. It accepts
only structured evidence that repeats the configured URL, SHA-256, SRI,
repository and commit.
The runner derives the HTTPS clone URL from that identity; the evidence never
depends on a transport-specific clone URL.

### Consumer candidate adoption

The producer supplies a staged archive URL, SHA-256 and npm SHA-512 SRI. Each
consumer then owns one short-lived candidate-adoption branch: it writes the URL
to `package.json`, regenerates its active lockfile until the stable release URL
and SRI are recorded, verifies its own application proof, and commits the result.
The train manifest names the resulting full commit SHA, never the branch name.

The branch must make the whole frozen dependency graph installable in a clean
store. A consumer with other direct schema release archives therefore normalizes
their existing-version lock entries to stable URLs and SRI in the same commit.
This is lock provenance repair, not a coordinated version upgrade: changing a
peer provider version belongs to that provider's separate release work.

For Lantern, the consumer-owned generator accepts an explicit URL/SRI pair for
each of `schema-pbta`, `schema-in-the-mist`, and `schema-adrenaline`. It may
rewrite only those three direct archive entries and their importer records; it
must reject a version change or any transitive-lock rewrite before the clean
frozen install, Vite build and evidence run.

Each evidence file repeats the complete candidate, its resolved consumer package, its committed lock URL/SRI, and a passed opaque journey. The central runner compares these fields strictly and does not interpret provider-specific commands. It does not edit that ref, its package manifest, or its lockfile.
It only creates a disposable detached checkout, runs the package manager with the
frozen committed lock, writes the ephemeral proof manifest/evidence there, and
executes the consumer-owned assertion. This preserves consumer ownership while
making the promoted graph reproducible.

Promotion downloads those candidate bytes and attaches the SHA-verified asset to
the final immutable tag without invoking `npm pack` again. A missing consumer,
wrong SHA, or a rebuild blocks promotion.

This is a provider-neutral delivery rule. `schema-pbta` hosts its first
implementation; `schema-in-the-mist` and `schema-adrenaline` must implement the
same protocol for their own candidate archives, tracked respectively in
[Mist #23](https://github.com/RebelliousSmile/schema-in-the-mist/issues/23) and
[Adrenaline #21](https://github.com/RebelliousSmile/schema-adrenaline/issues/21).
They remain peer providers in the daily shared cross-tool gate, not consumers of
the `schema-pbta` tarball.
