import { z } from "zod";

/**
 * The shape every schema provider writes by hand in its `cross-tool-provider.json`.
 *
 * Unlike `packManifestSchema`, this one is provider-agnostic: the same file exists in
 * schema-in-the-mist and schema-adrenaline, and a schema that pinned `provider` or
 * `contractVersion` to PbtA values would reject two of the three descriptors it exists
 * to validate.
 */

/* A path the provider resolves against its own checkout: relative, POSIX, no traversal. */
const relativePath = z
  .string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9._*/-]*$/, "must be a relative POSIX path")
  .refine((value) => !value.split("/").includes(".."), "must not traverse out of the checkout");

const token = z.string().regex(/^[a-z0-9]+(?:[-:][a-z0-9]+)*$/);

export const crossToolProviderSchema = z.strictObject({
  providerVersion: z.literal(1),
  provider: z.string().min(1),
  /* Optional: mist and adrenaline do not carry it yet. Each provider's own validator
     may still require it of itself, and the orchestrator records the gap. */
  contractVersion: z.int().positive().optional(),
  corpus: relativePath,
  /* The orchestrator splits this around its wildcard segment to walk pack directories,
     part of the contract rather than an assertion buried in the tool. */
  packManifest: z
    .string()
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9._-]+)*\/\*\/[A-Za-z0-9][A-Za-z0-9._-]*$/,
      "must read <directory>/*/<file>",
    ),
  /* No host publishes its capability vocabulary yet, so the tokens stay unconstrained:
     restricting them here would invent a vocabulary instead of verifying one. */
  capabilities: z.record(z.string().min(1), z.array(token).min(1)),
  commands: z.strictObject({
    validatePack: z.array(z.string().min(1)).min(1),
  }),
});

export type CrossToolProvider = z.infer<typeof crossToolProviderSchema>;
