# The audit corpus

These documents prove both sides of every generated schema. A series of
rejections alone proves nothing—a schema that rejects every document would pass
it—while witnesses alone do not exercise the constraints.

## Layout

- `temoins/<game>/<target>/` contains complete, legitimate JSON documents that
  the target schema must accept.
- `refus/<game>/<target>/` contains malformed JSON documents that the target
  schema must reject.

The game and target together identify one entry of `src/zod/constants.ts`.
Files are flat inside each target directory. Every rejection file carries one
intentional defect and is named after that defect rather than by a number.

Run the corpus together with the structural schema checks:

```bash
npm run audit
```

## Portable TOML contract

`contract/cases.json` is the machine-readable suite shared with Handbook and
Lantern. Each entry names a TOML file, one of the five public document targets,
and whether the canonical codec must accept or reject it. Consumers must read
the manifest rather than infer cases from filenames.

The accepted cases are compared as normalized values after
`parse -> stringify -> parse`; their TOML is also parsed independently with
`smol-toml` and `@iarna/toml`. Formatting differences are allowed, value
differences are not. Run the portable suite with:

```bash
npm run validate:contract
```

An installed consumer loads the same files through the package exports:

```js
const manifestUrl = import.meta.resolve("schema-pbta/corpus/cases.json");
```

For every case, resolve `schema-pbta/corpus/${testCase.path}`, select
`PBTA_DOCUMENT_CODECS[testCase.target]`, require accepted documents to survive
`parse -> stringify -> parse`, and require rejected documents to throw. This is
the minimum consumer conformance command; Handbook adds an esbuild proof and
Lantern adds a Vite proof in their own repositories.
