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

  const monsterheartsDefinition = path.join(
    temporaryRoot,
    "examples",
    "monsterhearts",
    "game-definition",
    "monsterhearts.toml",
  );
  fs.writeFileSync(
    monsterheartsDefinition,
    fs.readFileSync(monsterheartsDefinition, "utf-8").replace(
      /label = "Identité"\r?\nposition = "left"/,
      'label = "Identité"\nposition = "left"\nvisibleFor = "la-selkie"',
    ),
  );
  const monsterheartsPlaybookDirectory = path.join(
    temporaryRoot,
    "examples",
    "monsterhearts",
    "monsterhearts-playbook",
  );
  fs.writeFileSync(
    path.join(monsterheartsPlaybookDirectory, "fixture-creation-unknown-attribute.toml"),
    `slug = "fixture-creation-unknown-attribute"
name = "Unknown Creation Attribute"
game = "monsterhearts"
description = "Fixture for reference validation."
stats = { hot = 0 }
moves = []
creation = [{ label = "Choose an identity", options = ["A", "B"], attribute = "unknown" }]

[strings]
max = 1
`,
  );
  fs.writeFileSync(
    path.join(monsterheartsPlaybookDirectory, "fixture-creation-non-text-attribute.toml"),
    `slug = "fixture-creation-non-text-attribute"
name = "Non-text Creation Attribute"
game = "monsterhearts"
description = "Fixture for reference validation."
stats = { hot = 0 }
moves = []
creation = [{ label = "Choose an identity", options = ["A", "B"], attribute = "harm" }]

[strings]
max = 1
`,
  );
  fs.writeFileSync(
    path.join(monsterheartsPlaybookDirectory, "fixture-creation-hidden-attribute.toml"),
    `slug = "fixture-creation-hidden-attribute"
name = "Hidden Creation Attribute"
game = "monsterhearts"
description = "Fixture for reference validation."
stats = { hot = 0 }
moves = []
creation = [{ label = "Choose an identity", options = ["A", "B"], attribute = "look" }]

[strings]
max = 1
`,
  );

  const creationDiagnostics = validateReferences(temporaryRoot);
  for (const [fileName, message] of [
    ["fixture-creation-unknown-attribute.toml", "unknown character attribute"],
    ["fixture-creation-non-text-attribute.toml", "must be Text or LongText"],
    ["fixture-creation-hidden-attribute.toml", "is not visible for playbook"],
  ]) {
    assert.ok(
      creationDiagnostics.some(
        (diagnostic) =>
          diagnostic.file.endsWith(fileName) &&
          diagnostic.key === "creation[0].attribute" &&
          diagnostic.message.includes(message) &&
          diagnostic.severity === "error",
      ),
      `${fileName} must produce a creation attribute error`,
    );
  }

  const specialisedPlaybook = path.join(
    temporaryRoot,
    "examples",
    "monster-of-the-week",
    "monster-of-the-week-playbook",
    "the-lightkeeper.toml",
  );
  const genericDirectory = path.join(
    temporaryRoot,
    "examples",
    "monster-of-the-week",
    "playbook",
  );
  fs.mkdirSync(genericDirectory, { recursive: true });
  fs.copyFileSync(specialisedPlaybook, path.join(genericDirectory, "the-lightkeeper.toml"));
  fs.rmSync(specialisedPlaybook);

  const noFallbackDiagnostics = validateReferences(temporaryRoot);
  assert.ok(
    noFallbackDiagnostics.some(
      (diagnostic) =>
        diagnostic.file.endsWith("read-the-water.toml") &&
        diagnostic.key === "playbook" &&
        diagnostic.message.includes("monster-of-the-week-playbook") &&
        diagnostic.severity === "error",
    ),
    "a generic playbook homonym must not satisfy a move reference",
  );
  console.log("✅ Reference fixture checks passed.");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
