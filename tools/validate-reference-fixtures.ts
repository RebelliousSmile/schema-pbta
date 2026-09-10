import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { validateReferences } from "./validate-references";

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "schema-pbta-references-"));

try {
  fs.cpSync("examples", path.join(temporaryRoot, "examples"), { recursive: true });
  const moveDirectory = path.join(
    temporaryRoot,
    "examples",
    "monster-of-the-week",
    "move",
  );

  fs.writeFileSync(
    path.join(moveDirectory, "fixture-unknown-mc-type.toml"),
    `slug = "fixture-unknown-mc-type"
name = "Unknown MC Type"
game = "monster-of-the-week"
moveType = "unknown-keeper-type"
audience = "mc"
description = "Fixture for reference validation."
`,
  );
  fs.writeFileSync(
    path.join(moveDirectory, "fixture-mc-audience-missing.toml"),
    `slug = "fixture-mc-audience-missing"
name = "MC Audience Missing"
game = "monster-of-the-week"
moveType = "keeper"
description = "Fixture for reference validation."
`,
  );

  const diagnostics = validateReferences(temporaryRoot);
  assert.ok(
    diagnostics.some(
      (diagnostic) =>
        diagnostic.file.endsWith("fixture-unknown-mc-type.toml") &&
        diagnostic.key === "moveType" &&
        diagnostic.severity === "error",
    ),
    "an unknown MC move type must produce a moveType error",
  );
  assert.ok(
    diagnostics.some(
      (diagnostic) =>
        diagnostic.file.endsWith("fixture-mc-audience-missing.toml") &&
        diagnostic.key === "audience" &&
        diagnostic.severity === "error",
    ),
    "a reserved MC type without audience mc must produce an audience error",
  );
  console.log("✅ Reference fixture checks passed.");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
