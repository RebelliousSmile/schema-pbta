import fs from "node:fs";
import path from "node:path";
import { PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION } from "../src/presentation/monsterhearts-playbook.js";

const destination = path.join("packs", "monsterhearts", "presentation-contract.json");
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION, null, 2)}\n`);
console.log("Wrote", destination);
