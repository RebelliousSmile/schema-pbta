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
  fs.writeFileSync(
    path.join(monsterheartsPlaybookDirectory, "fixture-creation-text-multiple.toml"),
    `slug = "fixture-creation-text-multiple"
name = "Text Multiple Creation"
game = "monsterhearts"
description = "Fixture for reference validation."
stats = { hot = 0 }
moves = []
creation = [{ label = "Choose identities", options = ["A", "B"], selection = { min = 1, max = 2 }, attribute = "look" }]

[strings]
max = 1
`,
  );
  fs.writeFileSync(
    path.join(monsterheartsPlaybookDirectory, "fixture-creation-invalid-bounds.toml"),
    `slug = "fixture-creation-invalid-bounds"
name = "Invalid Creation Bounds"
game = "monsterhearts"
description = "Fixture for reference validation."
stats = { hot = 0 }
moves = []
creation = [{ label = "Choose identities", options = ["A", "B"], selection = { min = 2, max = 1 }, attribute = "look" }]

[strings]
max = 1
`,
  );
  fs.writeFileSync(
    path.join(monsterheartsPlaybookDirectory, "fixture-creation-duplicate-values.toml"),
    `slug = "fixture-creation-duplicate-values"
name = "Duplicate Creation Values"
game = "monsterhearts"
description = "Fixture for reference validation."
stats = { hot = 0 }
moves = []
creation = [{ label = "Choose an identity", options = [{ value = "same", label = "First" }, { value = "same", label = "Second" }], attribute = "look" }]

[strings]
max = 1
`,
  );
  fs.writeFileSync(
    path.join(monsterheartsPlaybookDirectory, "fixture-stat-profile-unknown-stat.toml"),
    `slug = "fixture-stat-profile-unknown-stat"
name = "Unknown Stat Profile"
game = "monsterhearts"
description = "Fixture for reference validation."
stats = { hot = 0 }
moves = []
statProfiles = [{ key = "invalid", label = "Invalid", stats = { hot = 0, cold = 0, volatile = 0, dark = 0, impossible = 1 } }]

[strings]
max = 1
`,
  );
  fs.writeFileSync(
    path.join(monsterheartsPlaybookDirectory, "fixture-stat-profile-incomplete.toml"),
    `slug = "fixture-stat-profile-incomplete"
name = "Incomplete Stat Profile"
game = "monsterhearts"
description = "Fixture for reference validation."
stats = { hot = 0 }
moves = []
statProfiles = [{ key = "incomplete", label = "Incomplete", stats = { hot = 0, cold = 0 } }]

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
  for (const [fileName, key, message] of [
    ["fixture-creation-text-multiple.toml", "creation[0].attribute", "must be ListMany"],
    ["fixture-creation-invalid-bounds.toml", "creation[0].selection", "min must not exceed max"],
    ["fixture-creation-duplicate-values.toml", "creation[0].options", "values must be unique"],
  ]) {
    assert.ok(
      creationDiagnostics.some(
        (diagnostic) =>
          diagnostic.file.endsWith(fileName) &&
          diagnostic.key === key &&
          diagnostic.message.includes(message) &&
          diagnostic.severity === "error",
      ),
      `${fileName} must produce its creation cardinality error`,
    );
  }
  for (const fileName of ["fixture-stat-profile-unknown-stat.toml", "fixture-stat-profile-incomplete.toml"]) {
    assert.ok(
      creationDiagnostics.some(
        (diagnostic) =>
          diagnostic.file.endsWith(fileName) &&
          diagnostic.key === "statProfiles[0].stats" &&
          diagnostic.message.includes("must declare exactly the game stats") &&
          diagnostic.severity === "error",
      ),
      `${fileName} must reject an incompatible stat profile`,
    );
  }

  const urbanShadowsPlaybookDirectory = path.join(
    temporaryRoot,
    "examples",
    "urban-shadows",
    "urban-shadows-playbook",
  );
  const awareFixture = fs.readFileSync(
    path.join(urbanShadowsPlaybookDirectory, "the-aware.toml"),
    "utf-8",
  );
  fs.writeFileSync(
    path.join(urbanShadowsPlaybookDirectory, "fixture-relationship-value.toml"),
    awareFixture.replace(
      'value = "younger-sibling"',
      'value = "unknown-mortal"',
    ),
  );
  fs.writeFileSync(
    path.join(urbanShadowsPlaybookDirectory, "fixture-relationship-label.toml"),
    awareFixture.replace(
      'value = "younger-sibling", label = "Younger sibling"',
      'value = "younger-sibling", label = "Unknown mortal"',
    ),
  );

  const relationshipDiagnostics = validateReferences(temporaryRoot);
  for (const [fileName, message] of [
    ["fixture-relationship-value.toml", "option values must match the editorial relationship keys"],
    ["fixture-relationship-label.toml", "option labels must match the editorial relationship labels"],
  ]) {
    assert.ok(
      relationshipDiagnostics.some(
        (diagnostic) =>
          diagnostic.file.endsWith(fileName) &&
          diagnostic.key === "creation[0].options" &&
          diagnostic.message.includes(message) &&
          diagnostic.severity === "error",
      ),
      `${fileName} must reject relationship creation data that diverges from the canonical source`,
    );
  }

  fs.writeFileSync(
    path.join(urbanShadowsPlaybookDirectory, "fixture-unknown-circle.toml"),
    awareFixture.replace(
      'advancementCircles = ["mortalis", "night", "power", "wild"]',
      'advancementCircles = ["mortalis", "dusk"]',
    ),
  );
  fs.writeFileSync(
    path.join(urbanShadowsPlaybookDirectory, "fixture-duplicate-frame.toml"),
    awareFixture.replace('key = "day-job"', 'key = "notebook"'),
  );

  const frameDiagnostics = validateReferences(temporaryRoot);
  for (const [fileName, key, message] of [
    ["fixture-unknown-circle.toml", "advancementCircles[1]", 'unknown Circle "dusk"'],
    ["fixture-duplicate-frame.toml", "extras[1].key", 'duplicate frame key "notebook"'],
  ]) {
    assert.ok(
      frameDiagnostics.some(
        (diagnostic) =>
          diagnostic.file.endsWith(fileName) &&
          diagnostic.key === key &&
          diagnostic.message.includes(message) &&
          diagnostic.severity === "error",
      ),
      `${fileName} must reject a playbook key the playbook does not declare once`,
    );
  }

  const masksPlaybookDirectory = path.join(temporaryRoot, "examples", "masks", "masks-playbook");
  const emberFixture = fs.readFileSync(path.join(masksPlaybookDirectory, "the-ember.toml"), "utf-8");
  const masksNpcDirectory = path.join(temporaryRoot, "examples", "masks", "masks-npc");
  const cartographerFixture = fs.readFileSync(path.join(masksNpcDirectory, "the-cartographer.toml"), "utf-8");
  for (const [directory, fileName, source, from, to] of [
    [masksPlaybookDirectory, "fixture-potential-over-max.toml", emberFixture, "potential = 2", "potential = 9"],
    [masksPlaybookDirectory, "fixture-unknown-condition.toml", emberFixture, 'name = "Afraid"', 'name = "Dazed"'],
    [masksPlaybookDirectory, "fixture-unknown-label-range.toml", emberFixture, "statRanges = { danger", "statRanges = { mystery = { min = -2, max = 3 }, danger"],
    [masksNpcDirectory, "fixture-self-out-of-track.toml", cartographerFixture, "value = 1", "value = 5"],
    [masksNpcDirectory, "fixture-self-inverted-track.toml", cartographerFixture, "min = -2", "min = 4"],
    [masksNpcDirectory, "fixture-unknown-npc-condition.toml", cartographerFixture, '"Guilty"', '"Dazed"'],
  ] as const) {
    assert.ok(source.includes(from), `${fileName}: the example no longer carries ${from}`);
    fs.writeFileSync(
      path.join(directory, fileName),
      source.replace(from, to).replace(/^slug = ".*"/m, `slug = "${fileName.replace(".toml", "")}"`),
    );
  }

  const masksDiagnostics = validateReferences(temporaryRoot);
  for (const [fileName, key, message] of [
    ["fixture-potential-over-max.toml", "potential", "exceeds potentialMax"],
    ["fixture-unknown-condition.toml", "conditions[0].name", 'unknown condition "Dazed"'],
    ["fixture-unknown-label-range.toml", "statRanges.mystery", 'unknown stat "mystery"'],
    ["fixture-self-out-of-track.toml", "self.value", "outside the track"],
    ["fixture-self-inverted-track.toml", "self.min", "exceeds self.max"],
    ["fixture-unknown-npc-condition.toml", "conditions[1]", 'unknown condition "Dazed"'],
  ]) {
    assert.ok(
      masksDiagnostics.some(
        (diagnostic) =>
          diagnostic.file.endsWith(fileName) &&
          diagnostic.key === key &&
          diagnostic.message.includes(message) &&
          diagnostic.severity === "error",
      ),
      `${fileName} must be rejected for a Masks rule`,
    );
  }
  assert.ok(
    !masksDiagnostics.some((diagnostic) => diagnostic.file.endsWith("the-cartographer.toml") || diagnostic.file.endsWith("the-ember.toml")),
    "the Masks examples raise no diagnostic",
  );

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
