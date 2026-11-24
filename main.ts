// Developer Excuses entry: one funny single-line excuse a developer gives
// when code breaks in production, at most 200 characters. The program writes
// the line to $MAKEFUN_OUTPUT_DIR/entry.txt with no trailing newline, so the
// gate reads exactly the line and nothing else.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "The rollback failed because the rollback script was in the broken deploy.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outDir) {
  throw new Error("MAKEFUN_OUTPUT_DIR is not set");
}
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE, "utf8");

// Read-back self-check: the gate requires UTF-8 text of 1-200 characters,
// not only whitespace, with no trailing newline. The entry is a single line,
// so any newline anywhere (not just at the end) is a defect. Also confirm the
// file is valid UTF-8 by round-tripping through a Buffer. Fail loudly.
const written = readFileSync(outPath, "utf8");
if (Buffer.from(written, "utf8").toString("utf8") !== written) {
  throw new Error("entry.txt is not valid UTF-8");
}
if (written !== LINE) throw new Error("entry.txt content mismatch");
if (written.length < 1 || written.length > 200) {
  throw new Error(`entry.txt length ${written.length} outside 1-200 chars`);
}
if (written.trim().length === 0) throw new Error("entry.txt is only whitespace");
if (written.includes("\n")) throw new Error("entry.txt contains a newline");
