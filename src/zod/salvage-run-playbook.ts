import { playbookSchema } from "./playbook.js";

/** Salvage Run's original Lantern playbook uses the complete portable form. */
export const salvageRunPlaybookSchema = playbookSchema.meta({
  title: "Salvage Run playbook",
  description: "Portable single-document representation of a Salvage Run playbook.",
});
