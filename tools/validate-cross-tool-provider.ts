import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { crossToolProviderSchema } from "../src/cross-tool-provider.js";
import { PBTA_CONTRACT_VERSION } from "../src/contract-version.js";

const DESCRIPTOR = "cross-tool-provider.json";
const root = process.cwd();

/*
 * The two neighbouring providers write the same descriptor without `contractVersion`.
 * Frozen here as literals so the schema's acceptance of them is proved by this repo's
 * own CI: reading their checkouts would make the proof depend on sibling clones that
 * exist on one machine and in one CI job only.
 */
const FOREIGN_WITNESSES = [
  {
    providerVersion: 1,
    provider: "schema-in-the-mist",
    corpus: "corpus/contract/cases.json",
    packManifest: "handbook/*/pack.json",
    capabilities: { lantern: ["edit:mist"], handbook: ["render:mist"] },
    commands: { validatePack: ["npm", "run", "validate:handbook-packs", "--"] },
  },
  {
    providerVersion: 1,
    provider: "schema-adrenaline",
    corpus: "corpus/contract/cases.json",
    packManifest: "handbook/*/pack.json",
    capabilities: { lantern: ["edit:adrenaline"], handbook: ["render:adrenaline"] },
    commands: { validatePack: ["npm", "run", "validate:pack", "--"] },
  },
];

for (const witness of FOREIGN_WITNESSES) {
  const parsed = crossToolProviderSchema.safeParse(witness);
  assert.ok(
    parsed.success,
    `the shared schema rejects ${witness.provider}, which it exists to validate: ${parsed.error?.message}`,
  );
  assert.equal(
    parsed.data?.contractVersion,
    undefined,
    `${witness.provider}: the witness must keep the missing contractVersion it is frozen to record`,
  );
}

const descriptor = crossToolProviderSchema.parse(
  JSON.parse(fs.readFileSync(path.join(root, DESCRIPTOR), "utf8")),
);

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
  name: string;
};
assert.equal(
  descriptor.provider,
  packageJson.name,
  `${DESCRIPTOR}: provider ${descriptor.provider} is not this package, ${packageJson.name}`,
);

/* Optional in the shared schema, required of this repo: a provider may be strict with itself. */
assert.notEqual(
  descriptor.contractVersion,
  undefined,
  `${DESCRIPTOR}: this repo must declare its contractVersion, even though the shared schema allows its absence`,
);
assert.equal(
  descriptor.contractVersion,
  PBTA_CONTRACT_VERSION,
  `${DESCRIPTOR}: contractVersion ${descriptor.contractVersion} does not match PBTA_CONTRACT_VERSION ${PBTA_CONTRACT_VERSION}`,
);

/* A corpus manifest nobody resolves is how a dead path survives a green gate. */
const corpus = path.join(root, descriptor.corpus);
assert.ok(
  fs.existsSync(corpus) && fs.statSync(corpus).isFile(),
  `${DESCRIPTOR}: corpus ${descriptor.corpus} resolves to no file`,
);

const [directory, manifestName] = descriptor.packManifest.split("/*/");
const packRoot = path.join(root, directory);
assert.ok(
  fs.existsSync(packRoot) && fs.statSync(packRoot).isDirectory(),
  `${DESCRIPTOR}: packManifest directory ${directory} does not exist`,
);
const matched = fs
  .readdirSync(packRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => fs.existsSync(path.join(packRoot, entry.name, manifestName)));
assert.ok(
  matched.length > 0,
  `${DESCRIPTOR}: packManifest ${descriptor.packManifest} matched no manifest`,
);

console.log(
  `✓ ${DESCRIPTOR} declares contract ${descriptor.contractVersion}, a live corpus and ${matched.length} pack manifests; the shared schema accepts ${FOREIGN_WITNESSES.length} foreign descriptors.`,
);
