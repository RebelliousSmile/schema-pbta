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

