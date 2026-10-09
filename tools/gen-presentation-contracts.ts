import fs from "node:fs";
import path from "node:path";
import { PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION } from "../src/presentation/monsterhearts-playbook.js";
import { PBTA_MONSTERHEARTS_APPEARANCE } from "../src/presentation/monsterhearts-appearance.js";
import { PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION } from "../src/presentation/urban-shadows-playbook.js";
import { PBTA_URBAN_SHADOWS_APPEARANCE } from "../src/presentation/urban-shadows-appearance.js";
import { PBTA_MASKS_PLAYBOOK_PRESENTATION } from "../src/presentation/masks-playbook.js";
import { PBTA_MASKS_NPC_PRESENTATION } from "../src/presentation/masks-npc.js";
import { PBTA_MASKS_APPEARANCE } from "../src/presentation/masks-appearance.js";
import { PBTA_MONSTER_OF_THE_WEEK_PLAYBOOK_PRESENTATION } from "../src/presentation/monster-of-the-week-playbook.js";
import { PBTA_MONSTER_OF_THE_WEEK_TEAM_PRESENTATION } from "../src/presentation/monster-of-the-week-team.js";
import { PBTA_MONSTER_OF_THE_WEEK_MONSTER_PRESENTATION } from "../src/presentation/monster-of-the-week-monster.js";
import { PBTA_MONSTER_OF_THE_WEEK_THREAT_PRESENTATION } from "../src/presentation/monster-of-the-week-threat.js";
import { PBTA_MONSTER_OF_THE_WEEK_APPEARANCE } from "../src/presentation/monster-of-the-week-appearance.js";
import { PBTA_THE_SPRAWL_PLAYBOOK_PRESENTATION } from "../src/presentation/the-sprawl-playbook.js";
import { PBTA_THE_SPRAWL_MATRIX_PRESENTATION } from "../src/presentation/the-sprawl-matrix.js";
import { PBTA_THE_SPRAWL_MISSION_PRESENTATION } from "../src/presentation/the-sprawl-mission.js";
import { PBTA_THE_SPRAWL_THREAT_PRESENTATION } from "../src/presentation/the-sprawl-threat.js";
import { PBTA_THE_SPRAWL_CORPORATION_PRESENTATION } from "../src/presentation/the-sprawl-corporation.js";
import { PBTA_THE_SPRAWL_RESOURCE_PRESENTATION } from "../src/presentation/the-sprawl-resource.js";
import { PBTA_THE_SPRAWL_APPEARANCE } from "../src/presentation/the-sprawl-appearance.js";

for (const [pack, name, source] of [
  ["monsterhearts", "presentation-contract.json", PBTA_MONSTERHEARTS_PLAYBOOK_PRESENTATION],
  ["monsterhearts", "appearance-contract.json", PBTA_MONSTERHEARTS_APPEARANCE],
  ["urban-shadows", "presentation-contract.json", PBTA_URBAN_SHADOWS_PLAYBOOK_PRESENTATION],
  ["urban-shadows", "appearance-contract.json", PBTA_URBAN_SHADOWS_APPEARANCE],
  ["masks", "presentation-contract.json", PBTA_MASKS_PLAYBOOK_PRESENTATION],
  ["masks", "npc-presentation-contract.json", PBTA_MASKS_NPC_PRESENTATION],
  ["masks", "appearance-contract.json", PBTA_MASKS_APPEARANCE],
  ["monster-of-the-week", "presentation-contract.json", PBTA_MONSTER_OF_THE_WEEK_PLAYBOOK_PRESENTATION],
  ["monster-of-the-week", "team-presentation-contract.json", PBTA_MONSTER_OF_THE_WEEK_TEAM_PRESENTATION],
  ["monster-of-the-week", "monster-presentation-contract.json", PBTA_MONSTER_OF_THE_WEEK_MONSTER_PRESENTATION],
  ["monster-of-the-week", "threat-presentation-contract.json", PBTA_MONSTER_OF_THE_WEEK_THREAT_PRESENTATION],
  ["monster-of-the-week", "appearance-contract.json", PBTA_MONSTER_OF_THE_WEEK_APPEARANCE],
  ["the-sprawl", "presentation-contract.json", PBTA_THE_SPRAWL_PLAYBOOK_PRESENTATION],
  ["the-sprawl", "matrix-presentation-contract.json", PBTA_THE_SPRAWL_MATRIX_PRESENTATION],
  ["the-sprawl", "mission-presentation-contract.json", PBTA_THE_SPRAWL_MISSION_PRESENTATION],
  ["the-sprawl", "threat-presentation-contract.json", PBTA_THE_SPRAWL_THREAT_PRESENTATION],
  ["the-sprawl", "corporation-presentation-contract.json", PBTA_THE_SPRAWL_CORPORATION_PRESENTATION],
  ["the-sprawl", "resource-presentation-contract.json", PBTA_THE_SPRAWL_RESOURCE_PRESENTATION],
  ["the-sprawl", "appearance-contract.json", PBTA_THE_SPRAWL_APPEARANCE],
] as const) {
  const destination = path.join("packs", pack, name);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(source, null, 2)}\n`);
  console.log("Wrote", destination);
}
