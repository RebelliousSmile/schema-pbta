import fs from "node:fs";
import path from "node:path";
import { PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION } from "../src/presentation/monsterhearts-playbook.js";
import { PBTA_MONSTERHEARTS_APPEARANCE } from "../src/presentation/monsterhearts-appearance.js";

for (const [name, source] of [
  ["presentation-contract.json", PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION],
  ["appearance-contract.json", PBTA_MONSTERHEARTS_APPEARANCE],
] as const) {
  const destination = path.join("packs", "monsterhearts", name);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(source, null, 2)}\n`);
  console.log("Wrote", destination);
}
