import { z } from "zod";

/**
 * A printed label published in both languages. The consumer picks the one that follows its own
 * interface language; it never mixes the two on one sheet and never keeps a label of its own.
 */
export const localizedLabelSchema = z.strictObject({ fr: z.string().min(1), en: z.string().min(1) });

export type PbtaLocalizedLabel = z.infer<typeof localizedLabelSchema>;
