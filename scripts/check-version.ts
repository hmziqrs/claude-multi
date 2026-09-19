/**
 * Gates the release workflow via the `should_publish` GITHUB_OUTPUT, not the exit code —
 * exits 0 for both publish and skip so a "nothing to publish" run keeps CI green.
 */

import { readFileSync, appendFileSync } from "fs";
import { join } from "path";

interface PackageJson {
  name: string;
  version: string;
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

async function getNpmVersion(packageName: string): Promise<string> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`,
    );

    if (response.status === 404) {
      console.log(
        "📦 Package not found on npm registry. This will be the first publish.",
      );
      return "0.0.0";
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.version;
  } catch (error) {
    console.log("⚠️  Could not fetch npm version. Assuming first publish.");
    console.log(`   Error: ${error}`);
    return "0.0.0";
  }
}

function getPackageInfo(): PackageJson {
  const packageJsonPath = join(process.cwd(), "package.json");
  const content = readFileSync(packageJsonPath, "utf-8");
  return JSON.parse(content);
}

async function main() {
  console.log("🔍 Checking version...\n");

  const pkg = getPackageInfo();
  console.log(`📦 Package: ${pkg.name}`);
  console.log(`📄 package.json version: ${pkg.version}`);

  const npmVersion = await getNpmVersion(pkg.name);
  console.log(`📡 npm registry version: ${npmVersion}`);

  const comparison = compareVersions(pkg.version, npmVersion);

  console.log("\n" + "=".repeat(50));

  const shouldPublish = comparison > 0;

  if (comparison > 0) {
    console.log("✅ SHOULD PUBLISH");
    console.log(`   ${pkg.version} > ${npmVersion}`);
  } else if (comparison === 0) {
    console.log("⏭️  SKIP PUBLISH");
    console.log(`   Versions are equal: ${pkg.version}`);
  } else {
    console.log("❌ SKIP PUBLISH");
    console.log(`   package.json version is OLDER than npm`);
    console.log(`   ${pkg.version} < ${npmVersion}`);
  }
  console.log("=".repeat(50));

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `should_publish=${shouldPublish}\n` +
        `package_version=${pkg.version}\n` +
        `npm_version=${npmVersion}\n`,
    );
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
