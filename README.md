# Schema PbtA

Open, versioned data schemas for **Powered by the Apocalypse** games (Apocalypse World, Dungeon World, Monster of the Week, Masks, Monsterhearts, and others) so VTTs, builders, and other digital
tools can **share the same data**.

The aim is an ecosystem of interoperable digital tools where they can exchange
structured JSON/TOML, validate it via schemas (e.g., using Zod), and leverage it
for their specific needs.

## Status

Early. `src/zod/constants.ts` declares no schema target yet, so `schemas/` and
`examples/` are empty and `npm run check` passes trivially. The toolchain is in
place and ready for the first schema.

## What's in here

- `src/zod/` contains the source Zod v4 definitions
- `schemas/` contains the generated JSON Schemas
- `examples/` contains JSON/TOML examples per schema
- `tools/` provides generation and validation scripts

## Using the schemas in your tool

### Use Zod directly (TS apps)

If you use TypeScript and Zod parsing, you can copy/paste the provided Zod schemas:

```ts
import { ApocalypseWorldExampleSchema } from "./src/zod/apocalypse-world/example";
const parsed = ApocalypseWorldExampleSchema.parse(userInputJson);
```

### Validate data (language-agnostic)

Use any JSON Schema validator (AJV, Python jsonschema, Rust jsonschema). Example with AJV:

```ts
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const schema = JSON.parse(
  fs.readFileSync("schemas/apocalypse-world/example.schema.json", "utf8")
);

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const data = JSON.parse(fs.readFileSync("path/to/data.json", "utf8"));
if (!validate(data)) console.error(validate.errors);
```

### Editor autocomplete for JSON and TOML

Configure the schema in your editor's settings (`json.schemas` in VS Code,
`evenBetterToml.schema.associations` for TOML), matched on a file glob.

Do **not** add a `"$schema"` key inside a data file that lives in `examples/`:
the generated schemas carry `"additionalProperties": false` at the root, so that
key makes `npm run validate` fail on the file.

## Two validation passes

`npm run validate` checks each example file against its JSON Schema, one file at
a time. That is all Ajv can do: a schema knows nothing of the game a file claims
to belong to, nor of the other files beside it.

`npm run validate:refs` is the second pass. It reads the corpus instead of the
schemas, and checks what the first pass cannot see: that a stat or attribute key
of a playbook exists in the game definition, that every `moveType` and
`equipmentType` is declared, that a `ref` resolves to a real file of the right
kind, that slugs are unique per game and per content type, that a `game` field
matches the folder the file sits in, and that two fields of the same document
agree — a move with no roll carrying no results, a clock not filled past its
segments. A move naming a result outside the game's tiers is a warning, not an
error.

`npm run check` runs generation and then both passes; either one failing fails
the chain.

## Derived work

This repository is derived from
[4rtamis/schema-in-the-mist](https://github.com/4rtamis/schema-in-the-mist),
whose tooling (`tools/`, generation and validation pipeline) it reuses under the
MIT licence. The schemas here are its own; nothing from the Mist Engine schemas
was copied.

## License

- **Code & Schemas:** MIT (see [LICENSE](./LICENSE)). The notice carries two
  copyright lines: the original author of the build tooling, and this
  repository's own author.

- **Docs:** CC BY 4.0 (see [here](./LICENSES/DOCS-LICENSE.md))

- **Masks game definition:** `examples/masks/game-definition/masks.toml` is
  derived from the Masks sheet preset published by Asacolips for the Foundry
  `pbta` system, available under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). *Masks: A New
  Generation* is by Brendan Conway, published by Magpie Games; the game itself
  is neither reproduced nor licensed here, only the mechanical vocabulary a tool
  needs to render a sheet.

- **Monster of the Week game definition:**
  `examples/monster-of-the-week/game-definition/monster-of-the-week.toml`
  transcribes the Monster of the Week sheet preset published by Asacolips on the
  `pbta` system wiki, which is itself based on the rules written by Michael
  Sands and published by Evil Hat Productions. Its `fronts` block has no
  upstream counterpart: the countdown steps and the threat vocabularies are read
  off the publisher's freely distributed mystery worksheet and Keeper reference
  sheets. The game itself is neither reproduced nor licensed here.

- **Trademark / community content notice:** to be written once the games this
  repository covers are settled. Apocalypse World is published under its own
  terms and several PbtA games carry their own licences; none of them is covered
  by a notice copied from another project.
