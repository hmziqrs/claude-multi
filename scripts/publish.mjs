import { execSync } from "child_process";

const args = process.argv.slice(2);
const version = JSON.parse(execSync("node -p 'JSON.stringify(require(\"./package.json\").version)'")).toString().trim();
const noTag = args.includes("--no-tag");

let cmd = `gh workflow run publish.yml -f version=${version}`;
if (noTag) cmd += " -f create_tag=false";

console.log(`Publishing v${version}${noTag ? " (no tag)" : ""}...`);
execSync(cmd, { stdio: "inherit" });
