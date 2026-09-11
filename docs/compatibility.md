# Compatibility policy

`schema-pbta` is the canonical executable contract shared by Handbook and
Lantern. It is distributed as an immutable GitHub Release asset, not through the
npm registry.

## Compatibility matrix

| Package | Schema path | Canonical schema tag | TOML | Handbook | Lantern |
| --- | --- | --- | --- | --- | --- |
| `1.0.x` | `schemas/v1` | `v1.0.0` | `1.0.0` | `2.8.0+` | pending consumer issue #2 |

The schema path groups compatible artifacts by contract major. Every `$id`
uses the exact `v1.0.0` tag so it never depends on a movable `v1` alias.

## SemVer

- Patch: implementation or documentation corrections that accept, normalize
  and emit exactly the same v1 values.
- Minor: additive public helpers or corpus cases that do not change any v1
  document shape or normalized value.
- Major: any change that rejects a previously accepted value, accepts a value
  with different meaning, invents or loses a value during normalization, or
  otherwise changes a published JSON Schema. A new major creates
  `schemas/v2` and a new immutable baseline tag `v2.0.0`; it never edits v1.

After `v1.0.0` exists, `npm run validate:version` compares every committed file
under `schemas/v1` byte-for-byte with that tag. A divergent v1 artifact fails
instead of silently moving its `$id`.

## Release and consumer integrity

`npm run release:prepare -- --output <directory>` creates the `.tgz` and a
SHA-256 sidecar. Release `v1.0.0` must target the validated commit, contain both
assets and be published only while immutable releases are enabled for the
repository. Published tags and assets are never moved or replaced.

Consumers pin the complete HTTPS asset URL in `package.json` and commit their
lockfile. The release SHA-256 is an independent published checksum; the
lockfile's SRI value is the integrity actually enforced by the package manager.
Handbook proves esbuild compatibility in its issue #27 and Lantern proves Vite
compatibility in its issue #2, avoiding a circular producer release.
