import fs from "node:fs";
import { z } from "zod";
import { PBTA_CONTRACT_VERSION } from "../src/contract-version";
import { TARGETS } from "../src/zod/constants";

const CONTRACT_MAJOR = PBTA_CONTRACT_VERSION;

for (const t of TARGETS) {
  const json = z.toJSONSchema(t.zod, { target: "draft-7" }) as Record<
    string,
    unknown
  >;
  json.$id = `https://raw.githubusercontent.com/RebelliousSmile/schema-pbta/v${CONTRACT_MAJOR}/schemas/v${CONTRACT_MAJOR}/${t.game.folder}/${t.name}.schema.json`;
  const serialized = JSON.stringify(json, null, 2);
  const destinations = [
    `schemas/v${CONTRACT_MAJOR}/${t.game.folder}/${t.name}.schema.json`,
    `schemas/${t.game.folder}/${t.name}.schema.json`,
  ];
  for (const destination of destinations) {
    fs.mkdirSync(destination.slice(0, destination.lastIndexOf("/")), { recursive: true });
    fs.writeFileSync(destination, serialized);
    console.log("Wrote", destination);
  }
}
