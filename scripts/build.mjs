import { build } from "esbuild";
import { copyFile, mkdir, readdir, unlink } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceDirectory = join(projectRoot, "src");
const outputDirectory = join(projectRoot, "dist");
const sourceFiles = [];

for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith(".js")) {
    sourceFiles.push(join(sourceDirectory, entry.name));
  }
}

const generatedFiles = new Set();

await mkdir(outputDirectory, { recursive: true });

for (const sourceFile of sourceFiles) {
  const filename = basename(sourceFile);
  const classic = filename === "aellux.js" || filename === "aellux.legacy.js";
  const full = filename === "aellux.full.esm.js";

  for (const minify of [false, true]) {
    const outputFilename = minify ? filename.replace(/\.js$/, ".min.js") : filename;
    await build({
      absWorkingDir: projectRoot,
      entryPoints: [sourceFile],
      outfile: join(outputDirectory, outputFilename),
      bundle: full,
      platform: "browser",
      format: classic ? "iife" : "esm",
      target: classic ? "es5" : "es2022",
      minify,
      sourcemap: true,
      legalComments: "none"
    });
    generatedFiles.add(outputFilename);
    generatedFiles.add(outputFilename + ".map");
  }
}

for (const entry of await readdir(outputDirectory, { withFileTypes: true })) {
  if (entry.isFile() && /^aellux(?:\.[\w-]+)*\.js(?:\.map)?$/.test(entry.name) &&
      !generatedFiles.has(entry.name)) {
    await unlink(join(outputDirectory, entry.name));
    console.log(`Removed obsolete build artifact: ${entry.name}`);
  }
}

await copyFile(join(projectRoot, "README.md"), join(outputDirectory, "README.md"));
console.log(`Build complete: ${sourceFiles.length * 2} JavaScript files and source maps in dist/.`);
