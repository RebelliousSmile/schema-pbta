import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export type CrossToolConfig = {
  providers: string[];
  lantern: string;
  handbook: string;
};

/**
 * One checkout the contract needs. `repository` and `ref` are absent for the provider under test,
 * which CI checks out at the commit being validated; every other participant is pinned so the same
 * configuration reproduces the same five checkouts on any machine.
 */
export type CrossToolParticipant = {
  role: "provider" | "lantern" | "handbook";
  path: string;
  repository?: string;
  ref?: string;
};

/* The configuration is hand-written, so a bare path stays legal for a local checkout with no pin. */
function readEntry(value: unknown, role: CrossToolParticipant["role"], label: string): CrossToolParticipant {
  if (typeof value === "string") return { role, path: value };
  assert.ok(value && typeof value === "object" && !Array.isArray(value), `${label} must be a path or a checkout object`);
  const entry = value as Record<string, unknown>;
  assert.equal(typeof entry.path, "string", `${label} must declare a path`);
  const participant: CrossToolParticipant = { role, path: entry.path as string };
  if (entry.repository !== undefined) {
    assert.equal(typeof entry.repository, "string", `${label} repository must be a URL`);
    participant.repository = entry.repository as string;
  }
  if (entry.ref !== undefined) {
    assert.equal(typeof entry.ref, "string", `${label} ref must be a string`);
    participant.ref = entry.ref as string;
  }
  return participant;
}

export function readCrossToolParticipants(source: string | undefined): CrossToolParticipant[] {
  const root = process.cwd();
  if (!source) {
    return [
      { role: "provider", path: "." },
      { role: "provider", path: "../schema-in-the-mist" },
      { role: "provider", path: "../schema-adrenaline" },
      { role: "lantern", path: "../lantern" },
      { role: "handbook", path: "../handbook" },
    ];
  }
  const raw = JSON.parse(fs.readFileSync(path.resolve(root, source), "utf8")) as Record<string, unknown>;
  assert.ok(Array.isArray(raw.providers), "providers must be a list of checkouts");
  return [
    ...raw.providers.map((value, index) => readEntry(value, "provider", `providers[${index}]`)),
    readEntry(raw.lantern, "lantern", "lantern"),
    readEntry(raw.handbook, "handbook", "handbook"),
  ];
}

export function readCrossToolConfig(source: string | undefined): CrossToolConfig {
  const root = process.cwd();
  const participants = readCrossToolParticipants(source);
  const resolve = (participant: CrossToolParticipant) => path.resolve(root, participant.path);
  return {
    providers: participants.filter((participant) => participant.role === "provider").map(resolve),
    lantern: resolve(participants.find((participant) => participant.role === "lantern")!),
    handbook: resolve(participants.find((participant) => participant.role === "handbook")!),
  };
}
