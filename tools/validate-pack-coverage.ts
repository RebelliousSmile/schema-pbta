import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { PBTA_DOCUMENT_CODECS, type PbtaDocumentTarget } from "../src/codecs/toml.js";
import { packManifestSchema } from "../src/pack-manifest.js";

/* Targets every PbtA game shares: anything else is specialised and belongs to exactly one pack. */
const GENERIC_TARGETS = new Set<PbtaDocumentTarget>(["game-definition", "move", "playbook", "npc", "front"]);

/**
 * Specialised targets whose schema accepts the portable playbook unchanged. A consumer cannot resolve
 * them from a document alone, so they read as a generic `playbook`: Lantern groups exactly these under
 * its Apocalypse World pack, where the game is carried by the `game` field and not by the schema.
 *
 * Pinned rather than tolerated: a sixth pack that ships an indistinguishable target fails here, and
 * removing one of these codecs fails here too, so the list cannot outlive the anomaly it records.
 */
const KNOWN_ALIAS_TARGETS = new Set<PbtaDocumentTarget>(["salvage-run-playbook"]);

type Provider = { providerVersion?: unknown; packManifest?: unknown };

const root = process.cwd();
const provider = JSON.parse(fs.readFileSync(path.join(root, "cross-tool-provider.json"), "utf8")) as Provider;
assert.equal(provider.providerVersion, 1, "unsupported cross-tool provider");

/* The descriptor owns the layout, so this accounting and the per-pack loop read the same manifests. */
const declared = provider.packManifest;
assert.ok(typeof declared === "string", "provider declares no packManifest");
const [directory, manifestName, ...rest] = declared.split("/*/");
assert.ok(directory && manifestName && rest.length === 0, `packManifest must read <directory>/*/<file>: ${declared}`);

/* Which packs claim each target, so a target claimed twice names both claimants in the failure. */
const claims = new Map<PbtaDocumentTarget, string[]>();
let packs = 0;
for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifestPath = path.join(root, directory, entry.name, manifestName);
  if (!fs.existsSync(manifestPath)) continue;
  const manifest = packManifestSchema.parse(JSON.parse(fs.readFileSync(manifestPath, "utf8")));
  /* A pack whose directory and declared id disagree would be invisible to the ownership rule below. */
  assert.equal(manifest.pack.id, entry.name, `${directory}/${entry.name} declares pack id ${manifest.pack.id}`);
  packs += 1;
  for (const document of manifest.documents) {
    claims.set(document.target, [...(claims.get(document.target) ?? []), manifest.pack.id]);
  }
}
assert.ok(packs > 0, `packManifest ${declared} matched no manifest`);

const targets = Object.keys(PBTA_DOCUMENT_CODECS) as PbtaDocumentTarget[];
const specialised = targets.filter((target) => !GENERIC_TARGETS.has(target));

/* GENERIC_TARGETS is hand-written: a codec dropped from it silently would turn a specialised target generic. */
for (const target of GENERIC_TARGETS) {
  assert.ok(targets.includes(target), `GENERIC_TARGETS names an unknown codec target: ${target}`);
}

for (const target of specialised) {
  const owners = claims.get(target) ?? [];
  /* A specialised codec nobody documents ships without a witness the hosts can round-trip. */
  assert.ok(owners.length > 0, `no pack documents the specialised target ${target}`);
  assert.equal(owners.length, 1, `${target} is documented by ${owners.length} packs: ${owners.join(", ")}`);
  /* Ownership is read off the target name, so a pack cannot document another game's codec. */
  assert.ok(target.startsWith(`${owners[0]}-`), `${owners[0]} documents ${target}, which belongs to another pack`);
}

/* Whether a specialised target is distinguishable is measured, not declared: the portable playbook's own
   accepted witness is fed to each specialised codec, and one that accepts it cannot be resolved downstream. */
type ContractCase = { path: string; target: PbtaDocumentTarget; expect: "accept" | "reject" };
const corpus = path.resolve(root, "corpus", "contract");
const contract = JSON.parse(fs.readFileSync(path.join(corpus, "cases.json"), "utf8")) as { cases: ContractCase[] };
const portable = contract.cases
  .filter((entry) => entry.target === "playbook" && entry.expect === "accept")
  .map((entry) => fs.readFileSync(path.resolve(corpus, entry.path), "utf8"));
assert.ok(portable.length > 0, "the contract corpus carries no accepted portable playbook");

const aliases: PbtaDocumentTarget[] = [];
for (const target of specialised) {
  const codec = PBTA_DOCUMENT_CODECS[target];
  const claimsPortable = portable.some((source) => {
    try {
      codec.parseToml(source);
      return true;
    } catch {
      return false;
    }
  });
  if (claimsPortable) aliases.push(target);
  assert.equal(
    claimsPortable,
    KNOWN_ALIAS_TARGETS.has(target),
    claimsPortable
      ? `${target} accepts the portable playbook: a consumer reads it as a generic playbook, so it is not a specialised target`
      : `${target} is distinguishable from the portable playbook and must leave KNOWN_ALIAS_TARGETS`,
  );
}

/* Generic targets are shared, so no pack owns them; an undocumented one is a gap to report, not a contract breach. */
const uncovered = [...GENERIC_TARGETS].filter((target) => (claims.get(target) ?? []).length === 0);

/* Every codec must fall on one side of the split, or the accounting below is quietly incomplete. */
assert.equal(specialised.length + GENERIC_TARGETS.size, targets.length, "codec targets are not fully accounted for");

console.log(`✓ ${packs} packs own ${specialised.length} specialised target${specialised.length === 1 ? "" : "s"}; ${GENERIC_TARGETS.size} generic targets are shared.`);
if (aliases.length > 0) console.log(`  read as a portable playbook, so generic downstream: ${aliases.join(", ")}`);
if (uncovered.length > 0) console.log(`  generic targets no pack documents yet: ${uncovered.join(", ")}`);
