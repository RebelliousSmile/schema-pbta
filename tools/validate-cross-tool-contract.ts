import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { readCrossToolConfig } from "./cross-tool-config.js";
import { crossToolProviderSchema } from "../src/cross-tool-provider.js";

/*
 * Deviations this gate tolerates today, each one filed as an issue at the repository
 * that owns it. The list is not a waiver: an unlisted deviation fails, and so does a
 * listed one that has been repaired without being removed from here. It therefore
 * cannot outlive the anomalies it records — the same idiom as KNOWN_ALIAS_TARGETS in
 * tools/validate-pack-coverage.ts.
 */
const KNOWN_DEVIATIONS = new Map<string, string>([
  ["schema-adrenaline:corpus", "RebelliousSmile/schema-adrenaline#10"],
  ["schema-adrenaline:contractVersion", "RebelliousSmile/schema-adrenaline#10"],
  ["schema-in-the-mist:contractVersion", "RebelliousSmile/schema-in-the-mist#14"],
]);

const config = readCrossToolConfig(process.argv[2]);
for (const root of [...config.providers, config.lantern, config.handbook]) assert.ok(fs.existsSync(path.join(root, "package.json")), `checkout is missing package.json: ${root}`);
const run = (cwd: string, ...args: string[]) => execFileSync("npm", args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
const runCommand = (cwd: string, command: string[]) => execFileSync(command[0], command.slice(1), { cwd, stdio: "inherit", shell: process.platform === "win32" });

const observed = new Set<string>();
const visited = new Set<string>();
const tolerated: string[] = [];

for (const root of config.providers) {
  /* The shape is the schema's business now; what stays here is what only a checkout can answer. */
  const parsed = crossToolProviderSchema.safeParse(
    JSON.parse(fs.readFileSync(path.join(root, "cross-tool-provider.json"), "utf8")),
  );
  assert.ok(parsed.success, `${root}: cross-tool-provider.json does not match the descriptor schema\n${parsed.error?.message}`);
  const provider = parsed.data;
  visited.add(provider.provider);

  /* A corpus manifest nobody resolves is how a dead path survives a green gate. */
  const corpus = path.join(root, provider.corpus);
  if (!fs.existsSync(corpus) || !fs.statSync(corpus).isFile()) observed.add(`${provider.provider}:corpus`);
  /* Optional in the shared schema because two providers do not carry it — which is the deviation. */
  if (provider.contractVersion === undefined) observed.add(`${provider.provider}:contractVersion`);

  const version = provider.contractVersion === undefined ? "unversioned" : `contract ${provider.contractVersion}`;
  const [directory, manifestName] = provider.packManifest.split("/*/");
  let validated = 0;
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifest = path.join(directory, entry.name, manifestName);
    if (!fs.existsSync(path.join(root, manifest))) continue;
    runCommand(root, [...provider.commands.validatePack, manifest]);
    validated += 1;
  }
  /* A provider whose manifests all went missing would otherwise pass silently. */
  assert.ok(validated > 0, `${provider.provider}: packManifest ${provider.packManifest} matched no manifest`);
  console.log(`✓ ${provider.provider} (${version}): ${validated} pack manifests validated.`);
}

for (const deviation of observed) {
  assert.ok(
    KNOWN_DEVIATIONS.has(deviation),
    `${deviation}: undeclared deviation from the provider descriptor contract. Fix it, or record it in KNOWN_DEVIATIONS with the issue that tracks it.`,
  );
  tolerated.push(`${deviation} (${KNOWN_DEVIATIONS.get(deviation)})`);
}

/* The half that keeps the list from becoming a graveyard: a repaired deviation must be removed. */
for (const [deviation, issue] of KNOWN_DEVIATIONS) {
  const [provider] = deviation.split(":");
  /* Only providers this run actually visited can be judged; the pins validator guarantees all three are present in CI. */
  if (!visited.has(provider)) continue;
  assert.ok(
    observed.has(deviation),
    `${deviation}: recorded as a known deviation but no longer present — ${issue} is fixed, so remove the entry from KNOWN_DEVIATIONS.`,
  );
}

for (const entry of tolerated.sort()) console.log(`  tolerated deviation: ${entry}`);

run(config.lantern, "run", "assert:contracts");
execFileSync(process.execPath, ["tools/assert-pbta-contract.mjs"], { cwd: config.handbook, stdio: "inherit" });
console.log(`✅ Cross-tool contract passed with ${tolerated.length} tolerated deviations.`);
