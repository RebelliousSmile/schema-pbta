---
objective: "A patch schema-pbta archive keeps browser asset URL construction behind an opt-in export and is promoted unchanged only after Lantern's Vite artifact and Handbook's Obsidian-loadable CommonJS plugin prove the candidate bytes."
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
| 2 | Define artifact gates and stage the patch candidate | [`phase-2.md`](./phase-2.md) |
| 3 | Move Lantern to the opt-in browser entry point | [`phase-3.md`](./phase-3.md) |
| 4 | Make Handbook's built-plugin load part of release evidence | [`phase-4.md`](./phase-4.md) |
| 5 | Prove and promote the byte-identical patch | [`phase-5.md`](./phase-5.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-pbta/issues/41 | Requires a side-effect-safe root, packed Vite and CommonJS execution fixtures, explicit host-artifact evidence, and byte-identical candidate/final archives. |
| https://github.com/RebelliousSmile/schema-pbta/issues/40 | Owns protocol-1 provider generalization; #41 may share Handbook's host-artifact gate without taking over provider recognition or the Adrenaline adoption train. |

## Decisions

| Decision | Why |
| --- | --- |
| Keep `monsterhearts-appearance-assets` as a browser-only module exported from an explicit package subpath, and remove it from both aggregate indexes. | Removing only the root named export is insufficient if another aggregate loaded by the root still links and evaluates the browser module. |
| Exercise one ordinary root symbol through an esbuild Node/CommonJS bundle made from the packed archive, while the Vite fixture imports the browser subpath explicitly. | The two fixtures prove the intended environment boundary at the same artifact boundary consumers use. |
| Require `vite-build` and `monsterhearts-four-assets` for Lantern, plus `commonjs-plugin-build` and `obsidian-1.13.7-plugin-load` for Handbook. | Fixed role-specific identifiers let the provider distinguish runnable host artifacts from a non-empty list of source-level assertions without interpreting consumer commands. |
| Run the focused Handbook load journey in the shared consumer-proof envelope, independently of the candidate provider. | The runnable artifact contains every installed schema dependency, so a PbtA root regression must also fail a train initiated for another provider; provider acceptance itself remains #40's scope. |
| Keep the Handbook release-train CLI fail-closed on the real host journey while testing its orchestration through injected process dependencies. | Ordinary repository checks remain hermetic, but the production evidence command has no environment flag that can skip Obsidian. |
| Promote the downloaded candidate archive and verify the final release digest after publication; never rebuild for the final tag. | Lantern and Handbook must prove the exact bytes that become the stable release. |
