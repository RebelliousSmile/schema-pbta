---
objective: "The schema-pbta patch is promoted unchanged after this repository consumes immutable Lantern and Handbook evidence produced by their own tracked work."
status: in-progress
---

# Plan: Make browser assets opt-in and prove runnable consumer artifacts

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Repair the unsafe package root and close the release-train gap that allowed an unloadable Handbook plugin to pass. |
| **Source** | GitHub issue `RebelliousSmile/schema-pbta#41` |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Isolate browser assets and prove both package formats | [`phase-1.md`](./phase-1.md) |
| 2 | Define artifact gates and freeze the provider commit | [`phase-2.md`](./phase-2.md) |
| 3 | Record the staging manifest | [`phase-3.md`](./phase-3.md) |
| 4 | Publish the immutable patch candidate | [`phase-4.md`](./phase-4.md) |
| 5 | Freeze externally delivered consumer proofs | [`phase-5.md`](./phase-5.md) |
| 6 | Prove and promote the byte-identical patch | [`phase-6.md`](./phase-6.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/41 | Requires a side-effect-safe root, packed Vite and CommonJS execution fixtures, explicit host-artifact evidence, and byte-identical candidate/final archives. |
| https://github.com/RebelliousSmile/schema-pbta/issues/40 | Owns protocol-1 provider generalization; #41 may share Handbook's host-artifact gate without taking over provider recognition or the Adrenaline adoption train. |
| https://github.com/RebelliousSmile/lantern/issues/47 | Owns Lantern's browser-subpath adoption, candidate locks, four-asset Vite proof, and immutable consumer commit. |
| https://github.com/RebelliousSmile/obsidian-handbook/issues/63 | Owns Handbook's CommonJS build, real Obsidian 1.13.7 load gate, candidate pin, and immutable consumer commit. |
| https://github.com/RebelliousSmile/lantern/issues/46 | Owns Lantern-wide release identity and convergence from temporary candidate pins to promoted final provider URLs. |

## Decisions

| Decision | Why |
| --- | --- |
| Keep `monsterhearts-appearance-assets` as a browser-only module exported from an explicit package subpath, and remove it from both aggregate indexes. | Removing only the root named export is insufficient if another aggregate loaded by the root still links and evaluates the browser module. |
| Exercise one ordinary root symbol through an esbuild Node/CommonJS bundle made from the packed archive, while the Vite fixture imports the browser subpath explicitly. | The two fixtures prove the intended environment boundary at the same artifact boundary consumers use. |
| Require `vite-build` and `monsterhearts-four-assets` for Lantern, plus `commonjs-plugin-build` and `obsidian-1.13.7-plugin-load` for Handbook. | Fixed role-specific identifiers let the provider distinguish runnable host artifacts from a non-empty list of source-level assertions without interpreting consumer commands. |
| Treat Lantern #47 and Handbook #63 as external delivery dependencies, and reference only their immutable commits from this repository. | Consumer implementation belongs to the repository that owns its runtime, while `schema-pbta` remains responsible for validating and orchestrating the combined evidence. |
| Promote the downloaded candidate archive and verify the final release digest after publication; never rebuild for the final tag. | Lantern and Handbook must prove the exact bytes that become the stable release. |
