/**
 * Version Comparison Script
 * Compares package.json version with the published npm version
 * Exits with code 0 if should publish, code 1 if should skip
 */

import { readFileSync } from "fs";
import { join } from "path";

interface PackageJson {
  name: string;
  version: string;
}

/**
 * Compare two semver versions
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
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

/**
 * Fetch the latest version from npm registry
 */
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

/**
 * Read package.json
 */
function getPackageInfo(): PackageJson {
  const packageJsonPath = join(process.cwd(), "package.json");
  const content = readFileSync(packageJsonPath, "utf-8");
  return JSON.parse(content);
}

/**
 * Main execution
 */
async function main() {
  console.log("🔍 Checking version...\n");

  const pkg = getPackageInfo();
  console.log(`📦 Package: ${pkg.name}`);
  console.log(`📄 package.json version: ${pkg.version}`);

  const npmVersion = await getNpmVersion(pkg.name);
  console.log(`📡 npm registry version: ${npmVersion}`);

  const comparison = compareVersions(pkg.version, npmVersion);

  console.log("\n" + "=".repeat(50));

  if (comparison > 0) {
    console.log("✅ SHOULD PUBLISH");
    console.log(`   ${pkg.version} > ${npmVersion}`);
    console.log("=".repeat(50));

    // Set GitHub Actions output if running in CI
    if (process.env.GITHUB_OUTPUT) {
      const fs = require("fs");
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `should_publish=true\n` +
          `package_version=${pkg.version}\n` +
          `npm_version=${npmVersion}\n`,
      );
    }

    process.exit(0);
  } else if (comparison === 0) {
    console.log("⏭️  SKIP PUBLISH");
    console.log(`   Versions are equal: ${pkg.version}`);
    console.log("=".repeat(50));

    if (process.env.GITHUB_OUTPUT) {
      const fs = require("fs");
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `should_publish=false\n` +
          `package_version=${pkg.version}\n` +
          `npm_version=${npmVersion}\n`,
      );
    }

    process.exit(1);
  } else {
    console.log("❌ SKIP PUBLISH");
    console.log(`   package.json version is OLDER than npm`);
    console.log(`   ${pkg.version} < ${npmVersion}`);
    console.log("=".repeat(50));

    if (process.env.GITHUB_OUTPUT) {
      const fs = require("fs");
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `should_publish=false\n` +
          `package_version=${pkg.version}\n` +
          `npm_version=${npmVersion}\n`,
      );
    }

    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
