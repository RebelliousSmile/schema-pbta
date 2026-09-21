import { z } from "zod";
import { PBTA_CONTRACT_VERSION } from "./contract-version.js";
import { PBTA_DOCUMENT_CODECS } from "./codecs/toml.js";

export const PBTA_PACK_PROVIDER = "schema-pbta" as const;

const token = z.string().regex(/^[a-z0-9]+(?:[-:][a-z0-9]+)*$/);
const relativeFixture = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*\.toml$/);
const relativePresentation = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*\.json$/);

export const packDocumentSchema = z.strictObject({
  target: z.enum(Object.keys(PBTA_DOCUMENT_CODECS) as [keyof typeof PBTA_DOCUMENT_CODECS, ...Array<keyof typeof PBTA_DOCUMENT_CODECS>]),
  fixture: relativeFixture,
  mutation: token,
});

export const packManifestSchema = z.strictObject({
  manifestVersion: z.literal(1),
  provider: z.literal(PBTA_PACK_PROVIDER),
  contractVersion: z.literal(PBTA_CONTRACT_VERSION),
  pack: z.strictObject({ id: token, label: z.string().min(1) }),
  documents: z.array(packDocumentSchema).min(1),
  requirements: z.strictObject({
    lantern: z.array(token),
    handbook: z.array(token),
  }),
  presentation: z.strictObject({
    target: z.literal("monsterhearts-playbook"),
    artifact: relativePresentation,
  }).optional(),
});

export type PackManifest = z.infer<typeof packManifestSchema>;
