import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import ts from "typescript";
import { TARGETS } from "../src/zod/constants";

type DescriptionCount = { total: number; described: number; missing: string[] };

const MAX_SAFE = Number.MAX_SAFE_INTEGER;

function resolveRoot(): string {
  const rootIndex = process.argv.indexOf("--root");
  if (rootIndex === -1) return process.cwd();
  const value = process.argv[rootIndex + 1];
  if (!value) throw new Error("--root requires a directory path");
  return path.resolve(value);
}

function sourceViolations(root: string): string[] {
  const violations: string[] = [];
  const sourceRoot = path.join(root, "src", "zod");

  const visitDirectory = (directory: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visitDirectory(filePath);
        continue;
      }
      if (!entry.name.endsWith(".ts")) continue;

      const sourceText = fs.readFileSync(filePath, "utf-8");
      const sourceFile = ts.createSourceFile(
        filePath,
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const visitNode = (node: ts.Node): void => {
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          (node.expression.name.text === "refine" || node.expression.name.text === "default")
        ) {
          const location = sourceFile.getLineAndCharacterOfPosition(node.expression.name.getStart(sourceFile));
          violations.push(
            `${path.relative(root, filePath)}:${location.line + 1}:${location.character + 1} .${node.expression.name.text}()`,
          );
        }
        ts.forEachChild(node, visitNode);
      };
      visitNode(sourceFile);
    }
  };

  visitDirectory(sourceRoot);
  return violations;
}

function countDescriptions(node: unknown, location: string, count: DescriptionCount): void {
  if (node === null || typeof node !== "object") return;
  const schema = node as Record<string, unknown>;

  if (schema.properties && typeof schema.properties === "object") {
    for (const [name, child] of Object.entries(schema.properties as Record<string, unknown>)) {
      count.total++;
      const property = child as Record<string, unknown>;
      if (typeof property.description === "string" && property.description.length > 0) {
        count.described++;
      } else {
        count.missing.push(`${location}.${name}`);
      }
      countDescriptions(child, `${location}.${name}`, count);
    }
  }

  if (schema.items) countDescriptions(schema.items, `${location}[]`, count);
  for (const keyword of ["allOf", "anyOf", "oneOf"]) {
    const branches = schema[keyword];
    if (Array.isArray(branches)) {
      branches.forEach((branch, index) =>
        countDescriptions(branch, `${location}.${keyword}[${index}]`, count),
      );
    }
  }
}

function findUnboundedNumbers(node: unknown, location: string, found: string[]): void {
  if (node === null || typeof node !== "object") return;
  const schema = node as Record<string, unknown>;

  if (schema.type === "integer" || schema.type === "number") {
    if (schema.maximum === undefined || schema.maximum === MAX_SAFE) found.push(location);
  }

  for (const [keyword, child] of Object.entries(schema)) {
    if (child && typeof child === "object") {
      findUnboundedNumbers(child, `${location}.${keyword}`, found);
    }
  }
}

function jsonFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .map((name) => path.join(directory, name))
    .filter((filePath) => fs.statSync(filePath).isFile() && filePath.toLowerCase().endsWith(".json"));
}

function expectedId(gameFolder: string, targetName: string): string {
  return `https://raw.githubusercontent.com/RebelliousSmile/schema-pbta/main/schemas/${gameFolder}/${targetName}.schema.json`;
}

export function audit(root = resolveRoot()): number {
  let failures = 0;
  let totalProperties = 0;
  let totalDescribed = 0;

  console.log("-- sources --");
  const violations = sourceViolations(root);
  if (violations.length === 0) {
    console.log("  ✓ no executable .refine() or .default() in src/zod/");
  } else {
    for (const violation of violations) console.error(`  ✗ ${violation}`);
    failures += violations.length;
  }

  for (const target of TARGETS) {
    const targetLabel = `${target.game.folder}/${target.name}`;
    const schemaPath = path.join(root, "schemas", target.game.folder, `${target.name}.schema.json`);
    console.log(`\n-- ${targetLabel} --`);

    if (!fs.existsSync(schemaPath)) {
      console.error(`  ✗ missing schema: ${path.relative(root, schemaPath)}`);
      failures++;
      continue;
    }

    let schema: Record<string, unknown>;
    try {
      schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8")) as Record<string, unknown>;
    } catch (error) {
      console.error(`  ✗ unreadable schema: ${(error as Error).message}`);
      failures++;
      continue;
    }

    const metaAjv = new Ajv({ allErrors: true, strict: false });
    addFormats(metaAjv);
    if (metaAjv.validateSchema(schema)) {
      console.log("  ✓ valid draft-7 schema");
    } else {
      console.error("  ✗ invalid draft-7 schema", metaAjv.errors);
      failures++;
    }

    let validate: ReturnType<Ajv["compile"]> | null = null;
    try {
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      validate = ajv.compile(schema);
      console.log("  ✓ compiled by Ajv");
    } catch (error) {
      console.error(`  ✗ Ajv compilation failed: ${(error as Error).message}`);
      failures++;
    }

    const id = expectedId(target.game.folder, target.name);
    if (schema.$id === id) {
      console.log("  ✓ canonical $id");
    } else {
      console.error(`  ✗ expected $id ${id}, found ${String(schema.$id)}`);
      failures++;
    }

    const descriptions: DescriptionCount = { total: 0, described: 0, missing: [] };
    countDescriptions(schema, targetLabel, descriptions);
    totalProperties += descriptions.total;
    totalDescribed += descriptions.described;
    if (descriptions.missing.length === 0) {
      console.log(`  ✓ descriptions ${descriptions.described}/${descriptions.total}`);
    } else {
      console.error(`  ✗ descriptions ${descriptions.described}/${descriptions.total}`);
      for (const missing of descriptions.missing.slice(0, 20)) {
        console.error(`      missing description: ${missing}`);
      }
      if (descriptions.missing.length > 20) {
        console.error(`      … and ${descriptions.missing.length - 20} more`);
      }
      failures++;
    }

    const unbounded: string[] = [];
    findUnboundedNumbers(schema, targetLabel, unbounded);
    if (unbounded.length === 0) {
      console.log("  ✓ every numeric value has a finite upper bound");
    } else {
      console.error(`  ✗ ${unbounded.length} numeric value(s) have no real upper bound`);
      for (const location of unbounded.slice(0, 20)) console.error(`      ${location}`);
      failures++;
    }

    if (!validate) continue;

    const witnesses = jsonFiles(
      path.join(root, "corpus", "temoins", target.game.folder, target.name),
    );
    if (witnesses.length === 0) {
      console.error(`  ✗ no witness for ${targetLabel}`);
      failures++;
    }
    for (const filePath of witnesses) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (validate(data)) {
        console.log(`  ✓ witness accepted: ${path.basename(filePath)}`);
      } else {
        console.error(`  ✗ witness rejected: ${path.basename(filePath)}`, validate.errors);
        failures++;
      }
    }

    const rejections = jsonFiles(
      path.join(root, "corpus", "refus", target.game.folder, target.name),
    );
    if (rejections.length === 0) {
      console.error(`  ✗ no rejection case for ${targetLabel}`);
      failures++;
    }
    for (const filePath of rejections) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (validate(data)) {
        console.error(`  ✗ incorrectly accepted: ${path.basename(filePath)}`);
        failures++;
      } else {
        console.log(`  ✓ rejected as expected: ${path.basename(filePath)}`);
      }
    }
  }

  const percentage = totalProperties === 0 ? 100 : Math.round((totalDescribed / totalProperties) * 100);
  console.log(`\nDescription coverage: ${totalDescribed}/${totalProperties} (${percentage}%)`);

  if (failures > 0) {
    console.error(`\n❌ Audit failed: ${failures} check(s) failed.`);
    return 1;
  }
  console.log("\n✅ Audit passed.");
  return 0;
}

process.exitCode = audit();
