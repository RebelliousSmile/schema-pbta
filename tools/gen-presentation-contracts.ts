import fs from "node:fs";
import path from "node:path";
import { PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION } from "../src/presentation/monsterhearts-playbook.js";
import { PBTA_MONSTERHEARTS_APPEARANCE } from "../src/presentation/monsterhearts-appearance.js";
import { PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION } from "../src/presentation/urban-shadows-playbook.js";
import { PBTA_URBAN_SHADOWS_APPEARANCE } from "../src/presentation/urban-shadows-appearance.js";

for (const [pack, name, source] of [
  ["monsterhearts", "presentation-contract.json", PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION],
  ["monsterhearts", "appearance-contract.json", PBTA_MONSTERHEARTS_APPEARANCE],
  ["urban-shadows", "presentation-contract.json", PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION],
  ["urban-shadows", "appearance-contract.json", PBTA_URBAN_SHADOWS_APPEARANCE],
] as const) {
  const destination = path.join("packs", pack, name);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(source, null, 2)}\n`);
  console.log("Wrote", destination);
}
