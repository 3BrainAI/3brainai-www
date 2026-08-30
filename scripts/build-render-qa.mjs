import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "dist");
const publicEntries = [
  ".nojekyll",
  "4c359192cfa68f4af5c6a8dd38964897.txt",
  "CNAME",
  "about",
  "assets",
  "contact",
  "cri",
  "cs",
  "de",
  "evidence-packs",
  "governance-layer",
  "how-it-works",
  "imprint",
  "index.html",
  "investors",
  "llms.txt",
  "mis",
  "pilots",
  "privacy",
  "product",
  "robots.txt",
  "security",
  "sitemap.xml",
  "use-cases",
  "validation"
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of publicEntries) {
  await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
}

await mkdir(resolve(output, "qa"), { recursive: true });
await cp(
  resolve(root, "artifacts/g4-responsive.html"),
  resolve(output, "qa/g4-responsive.html")
);
