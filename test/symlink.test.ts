import { symlink, readFile, mkdir, unlink } from "node:fs/promises";
import { existsSync, readlinkSync, lstatSync, rmSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const testDir = "/tmp/symlink-test";
const originDir = join(testDir, "origin");
const targetDir = join(testDir, "target");
const linkedDir = join(testDir, "linked-dir");

async function runTest() {
  // Clean up first
  if (existsSync(testDir)) {
    rmSync(testDir, { force: true, recursive: true });
  }
  await mkdir(testDir, { recursive: true });

  console.log("=== Test 1: Relative Symlink ===\n");

  console.log("1. Setting up test environment...");
  await mkdir(originDir, { recursive: true });
  await Bun.write(join(originDir, "file.txt"), "Hello from origin!");
  console.log(`   Created: ${originDir}/file.txt`);

  console.log("\n2. Creating relative directory symlink...");
  await symlink("origin", linkedDir, "dir");
  console.log(`   Symlinked: ${linkedDir} -> origin`);

  console.log("\n3. Reading file through symlink...");
  const content1 = await readFile(join(linkedDir, "file.txt"), "utf-8");
  console.log(`   File content: "${content1}"`);
  console.log("\n✅ Relative symlink test passed!\n");

  // Clean up for next test
  await unlink(linkedDir);

  console.log("=== Test 2: Absolute Symlink (Like the fix) ===\n");
  console.log("This simulates: ~/.claude-instances/instance/skills -> ~/.claude/skills");

  console.log("\n1. Creating absolute directory symlink...");
  const absolutePath = join(testDir, "origin");
  await symlink(absolutePath, linkedDir, "dir");
  console.log(`   Symlinked: ${linkedDir}`);
  console.log(`   -> ${absolutePath}`);

  console.log("\n2. Reading file through absolute symlink...");
  const content2 = await readFile(join(linkedDir, "file.txt"), "utf-8");
  console.log(`   File content: "${content2}"`);
  console.log("\n✅ Absolute symlink test passed!\n");

  await unlink(linkedDir);

  console.log("=== Test 3: Absolute Symlink from Nested Directory ===\n");
  console.log("This simulates: ~/.claude-tester/skills -> /Users/hmziq/.claude/skills");

  const nestedInstanceDir = join(homedir(), ".claude-test-instance");
  const nestedSkillsLink = join(nestedInstanceDir, "skills");
  const homeSkillsDir = join(homedir(), ".claude", "skills");

  await mkdir(nestedInstanceDir, { recursive: true });

  console.log(`1. Instance dir: ${nestedInstanceDir}`);
  console.log(`2. Target dir: ${homeSkillsDir}`);

  console.log("\n3. Creating absolute symlink...");
  await symlink(homeSkillsDir, nestedSkillsLink, "dir");
  console.log(`   Symlinked: ${nestedSkillsLink}`);
  console.log(`   -> ${homeSkillsDir}`);

  console.log("\n4. Checking if symlink is valid...");
  const isSymlink = lstatSync(nestedSkillsLink).isSymbolicLink();
  console.log(`   Is symlink: ${isSymlink}`);
  console.log(`   Points to: ${readlinkSync(nestedSkillsLink)}`);

  console.log("\n5. Checking if target exists...");
  const targetExists = existsSync(homeSkillsDir);
  console.log(`   Target exists: ${targetExists}`);

  if (targetExists) {
    console.log("\n✅ Test passed! Absolute symlink works regardless of instance location.");
  } else {
    console.log("\n⚠️  Target ~/.claude/skills doesn't exist (but symlink is correct)");
  }

  // Cleanup
  try {
    await unlink(nestedSkillsLink);
  } catch {}
  try {
    rmSync(nestedInstanceDir, { force: true, recursive: true });
  } catch {}
  rmSync(testDir, { force: true, recursive: true });
}

runTest().catch(console.error);
