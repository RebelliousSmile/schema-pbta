import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

type StoredValue = string | ArrayBuffer;

interface ResolvedSource {
  revision: string;
  readText(file: string): Promise<string>;
  readBinary(file: string): Promise<ArrayBuffer>;
}

interface SourceInstallerModule {
  installResolvedSchemaSource(
    plugin: unknown,
    source: unknown,
    resolved: ResolvedSource,
  ): Promise<void>;
}

interface CatalogueEntry {
  id: string;
  version: string;
  path: string;
}

interface Catalogue {
  packs: CatalogueEntry[];
}

interface AssetFace {
  file: string;
}

interface PackManifest {
  version: string;
  defaultVariantId?: string;
  variants?: Array<{ id: string }>;
  pack: {
    id: string;
    assets?: {
      root?: string;
      images?: Record<string, string>;
      fonts?: Record<string, string | AssetFace>;
    };
  };
}

interface ExpectedAsset {
  source: string;
  installed: string;
}

const projectRoot = process.cwd();
const cataloguePath = path.join(projectRoot, "handbook.json");
if (!fs.existsSync(cataloguePath)) {
  throw new Error(`schema-pbta handbook.json not found from working directory "${projectRoot}"`);
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function resolveHandbookRoot(): string {
  const configured = process.env.HANDBOOK_ROOT;
  const explicit = configured !== undefined;
  const candidate = explicit
    ? path.resolve(configured)
    : path.resolve(projectRoot, "..", "handbook");
  const packageFile = path.join(candidate, "package.json");
  const installerFile = path.join(candidate, "src", "games", "sourceInstaller.ts");

  if (!fs.existsSync(packageFile) || !fs.existsSync(installerFile)) {
    const origin = explicit ? `HANDBOOK_ROOT="${configured}"` : "the sibling checkout ../handbook";
    throw new Error(
      `Handbook sourceInstaller.ts not found via ${origin}; set HANDBOOK_ROOT to a Handbook checkout`,
    );
  }

  return candidate;
}

const handbookRoot = resolveHandbookRoot();
const handbookPackage = readJson<{ version?: unknown }>(path.join(handbookRoot, "package.json"));
if (typeof handbookPackage.version !== "string") {
  throw new Error(`Handbook package at "${handbookRoot}" has no string version`);
}

const sourceInstallerUrl = pathToFileURL(
  path.join(handbookRoot, "src", "games", "sourceInstaller.ts"),
).href;
const { installResolvedSchemaSource } = (await import(sourceInstallerUrl)) as SourceInstallerModule;

function localPath(relative: string): string {
  const resolved = path.resolve(projectRoot, relative);
  const relation = path.relative(projectRoot, resolved);
  if (relation.startsWith("..") || path.isAbsolute(relation)) {
    throw new Error(`source path escapes schema-pbta: ${relative}`);
  }
  return resolved;
}

function markedBuffer(buffer: Buffer, marker: number): ArrayBuffer {
  const bytes = new Uint8Array(buffer.byteLength + 1);
  bytes.set(buffer);
  bytes[bytes.length - 1] = marker;
  return bytes.buffer;
}

function resolvedSource(
  revision: string,
  marker: number,
  invalidManifestPath?: string,
): ResolvedSource {
  return {
    revision,
    readText: async (file) => {
      const raw = fs.readFileSync(localPath(file), "utf8");
      if (file !== invalidManifestPath) return raw;
      return JSON.stringify({ ...JSON.parse(raw) as Record<string, unknown>, version: "broken" });
    },
    readBinary: async (file) => markedBuffer(fs.readFileSync(localPath(file)), marker),
  };
}

function createMemoryStorage(): {
  files: Map<string, StoredValue>;
  folders: Set<string>;
  adapter: object;
} {
  const files = new Map<string, StoredValue>();
  const folders = new Set<string>([".obsidian/handbook/sources"]);
  const adapter = {
    exists: async (candidate: string) => files.has(candidate) || folders.has(candidate),
    mkdir: async (candidate: string) => {
      folders.add(candidate);
    },
    rmdir: async (candidate: string) => {
      for (const file of [...files.keys()]) {
        if (file === candidate || file.startsWith(`${candidate}/`)) files.delete(file);
      }
      for (const folder of [...folders]) {
        if (folder === candidate || folder.startsWith(`${candidate}/`)) folders.delete(folder);
      }
    },
    rename: async (from: string, to: string) => {
      for (const [file, value] of [...files]) {
        if (file === from || file.startsWith(`${from}/`)) {
          files.delete(file);
          files.set(`${to}${file.slice(from.length)}`, value);
        }
      }
      for (const folder of [...folders]) {
        if (folder === from || folder.startsWith(`${from}/`)) {
          folders.delete(folder);
          folders.add(`${to}${folder.slice(from.length)}`);
        }
      }
    },
    write: async (file: string, value: string) => {
      files.set(file, value);
    },
    writeBinary: async (file: string, value: ArrayBuffer) => {
      files.set(file, value);
    },
  };
  return { files, folders, adapter };
}

function plugin(version: string, adapter: object): unknown {
  return {
    manifest: { version },
    app: { vault: { configDir: ".obsidian", adapter } },
  };
}

function assetFiles(entry: CatalogueEntry, manifest: PackManifest): ExpectedAsset[] {
  const manifestRoot = entry.path.slice(0, entry.path.lastIndexOf("/"));
  const assetRoot = manifest.pack.assets?.root ?? "assets";
  const imageFiles = Object.values(manifest.pack.assets?.images ?? {});
  const fontFiles = Object.values(manifest.pack.assets?.fonts ?? {}).map((face) =>
    typeof face === "string" ? face : face.file,
  );
  return [...imageFiles, ...fontFiles].map((file) => ({
    source: `${manifestRoot}/${assetRoot}/${file}`,
    installed: `packs/${entry.id}/${assetRoot}/${file}`,
  }));
}

function storageSnapshot(
  files: Map<string, StoredValue>,
  folders: Set<string>,
): { files: Array<[string, string]>; folders: string[] } {
  return {
    files: [...files]
      .map(([file, value]): [string, string] => [
        file,
        typeof value === "string" ? `text:${value}` : `binary:${Buffer.from(value).toString("base64")}`,
      ])
      .sort(([left], [right]) => left.localeCompare(right)),
    folders: [...folders].sort(),
  };
}

const catalogue = readJson<Catalogue>(cataloguePath);
assert.equal(catalogue.packs.length, 5, "the catalogue must contain exactly five packs");
const lastEntry = catalogue.packs.at(-1);
assert.equal(lastEntry?.id, "the-sprawl", "the late-failure fixture must target the fifth pack");

const manifests = new Map<string, PackManifest>();
const expectedAssets: ExpectedAsset[] = [];
for (const entry of catalogue.packs) {
  const manifest = readJson<PackManifest>(localPath(entry.path));
  manifests.set(entry.id, manifest);
  expectedAssets.push(...assetFiles(entry, manifest));
}
assert.equal(expectedAssets.length, 8, "the five packs must declare exactly eight assets");

const source = {
  id: "rebellioussmile--schema-pbta",
  repository: "RebelliousSmile/schema-pbta",
  reference: { kind: "branch", value: "main" },
};
const installationRoot = `.obsidian/handbook/sources/${source.id}`;

const oldHostStorage = createMemoryStorage();
await assert.rejects(
  installResolvedSchemaSource(
    plugin("2.7.0", oldHostStorage.adapter),
    source,
    resolvedSource("0".repeat(40), 0),
  ),
  /requires Handbook 2\.7\.1 or newer/,
);

const storage = createMemoryStorage();
const currentPlugin = plugin(handbookPackage.version, storage.adapter);
await installResolvedSchemaSource(
  currentPlugin,
  source,
  resolvedSource("a".repeat(40), 1),
);

assert.ok(storage.files.has(`${installationRoot}/handbook.json`), "catalogue was not installed");
for (const entry of catalogue.packs) {
  const installedManifest = storage.files.get(`${installationRoot}/packs/${entry.id}/pack.json`);
  assert.equal(typeof installedManifest, "string", `${entry.id} manifest was not installed`);
  assert.deepEqual(JSON.parse(installedManifest as string), manifests.get(entry.id));
}
for (const asset of expectedAssets) {
  assert.ok(
    storage.files.has(`${installationRoot}/${asset.installed}`),
    `${asset.source} was not installed`,
  );
}

const monsterhearts = manifests.get("monsterhearts");
assert.equal(monsterhearts?.defaultVariantId, "base");
assert.deepEqual(monsterhearts?.variants?.map(({ id }) => id), ["base", "drowned-lake"]);

await installResolvedSchemaSource(
  currentPlugin,
  source,
  resolvedSource("b".repeat(40), 2),
);
for (const asset of expectedAssets) {
  const installed = storage.files.get(`${installationRoot}/${asset.installed}`);
  assert.ok(installed instanceof ArrayBuffer, `${asset.source} is not installed as binary`);
  assert.equal(new Uint8Array(installed).at(-1), 2, `${asset.source} was not updated`);
}
const installedSource = storage.files.get(`${installationRoot}/source.json`);
assert.equal(typeof installedSource, "string", "installed source metadata is missing");
assert.equal(JSON.parse(installedSource as string).revision, "b".repeat(40));

const snapshot = storageSnapshot(storage.files, storage.folders);
await assert.rejects(
  installResolvedSchemaSource(
    currentPlugin,
    source,
    resolvedSource("c".repeat(40), 3, lastEntry?.path),
  ),
  /the-sprawl\/pack\.json: "version" is not valid SemVer/,
);
assert.deepEqual(
  storageSnapshot(storage.files, storage.folders),
  snapshot,
  "a failed late update changed the installed source",
);

console.log(
  `✅ Handbook ${handbookPackage.version} source install passed (5 packs, ${expectedAssets.length} assets, atomic rollback).`,
);
