import React from "react";
import { renderToString, Box, Text } from "ink";
import { Header } from "../src/ink/components/Header.js";
import { Footer } from "../src/ink/components/Footer.js";
import { WarningBanner } from "../src/ink/components/WarningBanner.js";
import { InstanceCard } from "../src/ink/components/InstanceCard.js";
import { StatusBar } from "../src/ink/components/StatusBar.js";
import { StepIndicator } from "../src/ink/components/StepIndicator.js";
import { writeFileSync, mkdirSync } from "node:fs";

// Ensure static renders (skip animations)
process.env.CAPTURE_MODE = "1";

const SCREENSHOTS_DIR = "./screenshots";
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const testInstances = [
  { name: "glm", configDir: "/Users/hmziq/.claude-glm", binaryPath: "/Users/hmziq/.local/bin/claude-glm", createdAt: "2025-01-01T00:00:00.000Z", autoSync: true },
  { name: "mm", configDir: "/Users/hmziq/.claude-mm", binaryPath: "/Users/hmziq/.local/bin/claude-mm", createdAt: "2025-02-15T00:00:00.000Z", autoSync: true },
  { name: "g2", configDir: "/Users/hmziq/.claude-g2", binaryPath: "/Users/hmziq/.local/bin/claude-g2", createdAt: "2025-06-01T00:00:00.000Z", autoSync: false },
];

const COLS = 120;

const screens: Record<string, React.ReactElement> = {
  "01-main-menu": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🤖 Claude Multi" subtitle="Interactive Mode" />
      <Box marginBottom={1}>
        <Text dimColor>3 instance(s): glm, mm, g2</Text>
      </Box>
      <Text>What would you like to do?</Text>
      <Box marginTop={1}>
        <Text color="green">❯ </Text>
        <Text>➕ Add new instance</Text>
      </Box>
      <Box><Text>   </Text><Text>📋 List all instances</Text></Box>
      <Box><Text>   </Text><Text>ℹ️  Instance details</Text></Box>
      <Box><Text>   </Text><Text>🔌 Manage plugins</Text></Box>
      <Box><Text>   </Text><Text>🔄 Toggle auto-sync</Text></Box>
      <Box><Text>   </Text><Text>🔗 Re-sync symlinks</Text></Box>
      <Box><Text>   </Text><Text>🗑️  Remove instance</Text></Box>
      <Box><Text>   </Text><Text>⚙️  MCP servers</Text></Box>
      <Box><Text>   </Text><Text>🚪 Exit</Text></Box>
      <Footer />
    </Box>
  ),

  "01b-main-menu-warnings": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🤖 Claude Multi" subtitle="Interactive Mode" />
      <WarningBanner issueCount={2} errorCount={1} warningCount={1} />
      <Box marginBottom={1}>
        <Text dimColor>3 instance(s): glm, mm, g2</Text>
      </Box>
      <Text>What would you like to do?</Text>
      <Box marginTop={1}>
        <Text color="green">❯ </Text>
        <Text>➕ Add new instance</Text>
      </Box>
      <Box><Text>   </Text><Text>📋 List all instances</Text></Box>
      <Box><Text>   </Text><Text>🚪 Exit</Text></Box>
      <Footer showHealthHint={true} />
    </Box>
  ),

  "02-list-instances": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="📋 All Instances" />
      <Text bold>Found 3 instance(s):</Text>
      <Box flexDirection="column">
        <InstanceCard instance={testInstances[0]} />
        <InstanceCard instance={testInstances[1]} />
        <InstanceCard instance={testInstances[2]} />
      </Box>
      <Box marginTop={1}>
        <Text dimColor>ESC to go back</Text>
      </Box>
    </Box>
  ),

  "03-instance-detail": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="ℹ️ Instance Details" />
      <Box flexDirection="column" gap={0}>
        <Box gap={1}>
          <Text color="cyan">●</Text>
          <Text bold color="cyan">glm</Text>
        </Box>
        <Box marginLeft={2} flexDirection="column">
          <Box gap={1}><Text dimColor>├─</Text><Text dimColor bold>Binary:</Text><Text>/Users/hmziq/.local/bin/claude-glm</Text></Box>
          <Box gap={1}><Text dimColor>├─</Text><Text dimColor bold>Config:</Text><Text>/Users/hmziq/.claude-glm</Text></Box>
          <Box gap={1}><Text dimColor>├─</Text><Text dimColor bold>Created:</Text><Text>1/1/2025, 12:00:00 AM</Text></Box>
          <Box gap={1}><Text dimColor>├─</Text><Text dimColor bold>Auto-sync:</Text><Text color="green">✓ Enabled</Text></Box>
          <Box gap={1}><Text dimColor>├─</Text><Text dimColor bold>Plugins:</Text><Text>12 installed, 8 enabled</Text></Box>
          <Box gap={1}><Text dimColor>└─</Text><Text dimColor bold>MCP Servers:</Text><Text>6 total (5 from plugins, 1 custom)</Text></Box>
        </Box>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "04-add-instance-name": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="➕ Add New Instance" />
      <StepIndicator current={1} total={3} label="Instance Name" />
      <Box flexDirection="column" gap={1}>
        <Text>Instance name:</Text>
        <Text dimColor>Letters, numbers, hyphens, underscores only</Text>
        <Text>my-instance_</Text>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "04-add-instance-provider": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="➕ Add New Instance" />
      <StepIndicator current={2} total={3} label="Provider Template" />
      <Box flexDirection="column" gap={1}>
        <Text>Select a provider:</Text>
        <Box>
          <Text color="green">❯ </Text><Text>GLM (智谱AI) — GLM-5.1 via z.ai</Text>
        </Box>
        <Box><Text>   </Text><Text>MiniMax — MiniMax-M2.7 via minimax.io</Text></Box>
        <Box><Text>   </Text><Text>DeepSeek — DeepSeek-V4 via deepseek.com</Text></Box>
        <Box><Text>   </Text><Text dimColor>None / Custom</Text></Box>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "04c-add-copy-options": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="➕ Add New Instance" />
      <StepIndicator current={3} total={3} label="Copy Options" />
      <Box flexDirection="column" gap={1}>
        <Text>Found existing Claude config at ~/.claude</Text>
        <Text>What to copy?</Text>
        <Box>
          <Text color="green">❯ </Text><Text>Select plugins to install</Text>
        </Box>
        <Box><Text>   </Text><Text>Nothing — start fresh</Text></Box>
        <Box><Text>   </Text><Text>Only settings.json</Text></Box>
        <Box><Text>   </Text><Text>All files (settings, CLAUDE.md, plugins, etc.)</Text></Box>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "04d-add-select-plugins": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="➕ Add New Instance" />
      <StepIndicator current={3} total={3} label="Select Plugins" />
      <Box flexDirection="column" gap={1}>
        <Text>Select plugins to install:</Text>
        <Text dimColor>50 available · space to toggle · enter to confirm</Text>
        <Box flexDirection="column">
          <Box gap={1}>
            <Text color="green">❯</Text>
            <Text color="green">✓</Text>
            <Text>context7 (MCP) [ext]</Text>
          </Box>
          <Box gap={1}>
            <Text> </Text>
            <Text dimColor>◯</Text>
            <Text>playwright (MCP) [ext]</Text>
          </Box>
          <Box gap={1}>
            <Text> </Text>
            <Text color="green">✓</Text>
            <Text>github (MCP) [ext]</Text>
          </Box>
          <Box gap={1}>
            <Text> </Text>
            <Text dimColor>◯</Text>
            <Text>discord (MCP) [ext]</Text>
          </Box>
          <Box gap={1}>
            <Text> </Text>
            <Text dimColor>◯</Text>
            <Text>feature-dev</Text>
          </Box>
        </Box>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "05-remove-confirm": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🗑️ Remove Instance" />
      <Box flexDirection="column" gap={1}>
        <Box gap={1}>
          <Text bold color="red">⚠ About to remove</Text>
          <Text bold color="red">'g2'</Text>
        </Box>
        <Box marginLeft={2} flexDirection="column">
          <Box gap={1}><Text dimColor>├─</Text><Text dimColor bold>Binary:</Text><Text dimColor>/Users/hmziq/.local/bin/claude-g2</Text></Box>
          <Box gap={1}><Text dimColor>└─</Text><Text dimColor bold>Config:</Text><Text dimColor>/Users/hmziq/.claude-g2</Text></Box>
        </Box>
        <Text dimColor>Config directory will NOT be deleted automatically.</Text>
        <Text>Confirm removal?</Text>
        <Box>
          <Text>y/N </Text>
          <Text color="green">❯</Text>
        </Box>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "06-autosync-toggle": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🔄 Toggle Auto-Sync" />
      <Box flexDirection="column" gap={1}>
        <Box>
          <Text>Auto-sync for <Text bold color="cyan">g2</Text> is currently <Text bold color="red">OFF</Text></Text>
        </Box>
        <Text>What would you like to do?</Text>
        <Box marginTop={1}>
          <Text color="green">❯ </Text><Text>Turn on (use symlinks)</Text>
        </Box>
        <Box><Text>   </Text><Text>Cancel</Text></Box>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "07-mcp-details": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="⚙️ Manage MCP Servers" />
      <StatusBar message="3 MCP server(s) found" type="success" />
      <Box marginLeft={2} flexDirection="column">
        <Box gap={1}>
          <Text bold color="cyan">context7</Text>
          <Text color="green">✓</Text>
          <Text dimColor>[context7]</Text>
        </Box>
        <Box marginLeft={2} flexDirection="column">
          <Box gap={1}><Text dimColor>├─</Text><Text dimColor bold>Type:</Text><Text>stdio</Text></Box>
          <Box gap={1}><Text dimColor>└─</Text><Text dimColor bold>Command:</Text><Text>npx -y @upstash/context7-mcp</Text></Box>
        </Box>
      </Box>
      <Box marginLeft={2} flexDirection="column" marginTop={1}>
        <Box gap={1}>
          <Text bold color="cyan">playwright</Text>
          <Text color="green">✓</Text>
          <Text dimColor>[playwright]</Text>
        </Box>
        <Box marginLeft={2} flexDirection="column">
          <Box gap={1}><Text dimColor>├─</Text><Text dimColor bold>Type:</Text><Text>stdio</Text></Box>
          <Box gap={1}><Text dimColor>└─</Text><Text dimColor bold>Command:</Text><Text>npx @playwright/mcp</Text></Box>
        </Box>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "07b-manage-plugins": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🔌 Manage Plugins" />
      <Box flexDirection="column" gap={1}>
        <Text>What would you like to do?</Text>
        <Box>
          <Text color="green">❯ </Text><Text>📥 Install plugins from default</Text>
        </Box>
        <Box><Text>   </Text><Text>🗑️  Remove installed plugins</Text></Box>
        <Box><Text>   </Text><Text>✅ Enable plugins</Text></Box>
        <Box><Text>   </Text><Text>❌ Disable plugins</Text></Box>
        <Box><Text>   </Text><Text>📋 List installed plugins</Text></Box>
        <Box><Text>   </Text><Text>Cancel</Text></Box>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "07c-plugin-list": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🔌 Manage Plugins" />
      <Box flexDirection="column" gap={1}>
        <Text bold>12 plugin(s) installed in 'glm':</Text>
        <Box gap={1} marginLeft={2}>
          <Text color="green">✓</Text>
          <Text bold>context7</Text>
          <Text color="cyan" dimColor>(MCP)</Text>
          <Text dimColor>[ext]</Text>
        </Box>
        <Box gap={1} marginLeft={2}>
          <Text color="green">✓</Text>
          <Text bold>playwright</Text>
          <Text color="cyan" dimColor>(MCP)</Text>
          <Text dimColor>[ext]</Text>
        </Box>
        <Box gap={1} marginLeft={2}>
          <Text color="green">✓</Text>
          <Text bold>feature-dev</Text>
        </Box>
        <Box gap={1} marginLeft={2}>
          <Text color="red">✗</Text>
          <Text>github</Text>
          <Text color="cyan" dimColor>(MCP)</Text>
          <Text dimColor>[ext]</Text>
        </Box>
        <Box gap={1} marginLeft={2}>
          <Text color="red">✗</Text>
          <Text>code-review</Text>
        </Box>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "08-add-success": (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="➕ Add New Instance" />
      <StepIndicator current={3} total={3} label="Complete" />
      <Box flexDirection="column" gap={1}>
        <StatusBar message="Instance 'deepseek' created successfully!" type="success" />
        <Box marginLeft={2} flexDirection="column">
          <Box gap={1}><Text dimColor>├─</Text><Text dimColor bold>Binary:</Text><Text>/Users/hmziq/.local/bin/claude-deepseek</Text></Box>
          <Box gap={1}><Text dimColor>└─</Text><Text dimColor bold>Config:</Text><Text>/Users/hmziq/.claude-deepseek</Text></Box>
        </Box>
      </Box>
      <Box marginTop={1}><Text dimColor>ESC back │ q quit</Text></Box>
    </Box>
  ),

  "09-goodbye": (
    <Box paddingX={2} paddingY={1}>
      <Text dimColor>👋 Goodbye!</Text>
    </Box>
  ),
};

// 256-color palette (Catppuccin Mocha theme)
const COLOR_256: string[] = Array.from({ length: 256 });
const palette16 = [
  "#555","#e06c75","#98c379","#e5c07b","#61afef","#c678dd","#56b6c2","#abb2bf",
  "#636d83","#e06c75","#98c379","#e5c07b","#61afef","#c678dd","#56b6c2","#cdd6f4",
];
for (let i = 0; i < 16; i++) COLOR_256[i] = palette16[i];
for (let i = 16; i < 232; i++) {
  const c = i - 16;
  const b = c % 36;
  const g = Math.floor(c / 36) % 6;
  const r = Math.floor(c / 216);
  const toHex = (v: number) => v > 0 ? 55 + 40 * v : 0;
  COLOR_256[i] = `rgb(${toHex(r)},${toHex(g)},${toHex(b)})`;
}
for (let i = 232; i < 256; i++) {
  const v = 8 + 10 * (i - 232);
  COLOR_256[i] = `rgb(${v},${v},${v})`;
}

function ansiToHtml(text: string): string {
  let html = text;
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const fgMap: Record<string, string> = {
    "30": "#555", "31": "#e06c75", "32": "#98c379", "33": "#e5c07b",
    "34": "#61afef", "35": "#c678dd", "36": "#56b6c2", "37": "#abb2bf",
    "90": "#636d83", "91": "#e06c75", "92": "#98c379", "93": "#e5c07b",
    "94": "#61afef", "95": "#c678dd", "96": "#56b6c2", "97": "#cdd6f4",
  };
  const bgMap: Record<string, string> = {
    "40": "#555", "41": "#e06c75", "42": "#98c379", "43": "#e5c07b",
    "44": "#61afef", "45": "#c678dd", "46": "#56b6c2", "47": "#abb2bf",
    "100": "#636d83", "101": "#e06c75", "102": "#98c379", "103": "#e5c07b",
    "104": "#61afef", "105": "#c678dd", "106": "#56b6c2", "107": "#cdd6f4",
  };

  html = html.replace(/\x1b\[([0-9;]*)m/g, (_match, codes: string) => {
    const parts = codes.split(";").map(Number);
    const styles: string[] = [];
    let i = 0;

    while (i < parts.length) {
      const code = parts[i];
      if (code === 0) return "</span>";
      if (code === 1) styles.push("font-weight:bold");
      else if (code === 2) styles.push("opacity:0.6");
      else if (code === 3) styles.push("font-style:italic");
      else if (code === 4) styles.push("text-decoration:underline");
      else if (code === 9) styles.push("text-decoration:line-through");
      else if (code === 22) styles.push("font-weight:normal");
      else if (code === 39) styles.push("color:inherit");
      else if (code === 49) styles.push("background-color:inherit");
      else if (code === 38 && parts[i + 1] === 5 && parts[i + 2] != null) {
        styles.push(`color:${COLOR_256[parts[i + 2]] ?? "#cdd6f4"}`);
        i += 2;
      } else if (code === 38 && parts[i + 1] === 2 && parts[i + 4] != null) {
        styles.push(`color:rgb(${parts[i + 2]},${parts[i + 3]},${parts[i + 4]})`);
        i += 4;
      } else if (code === 48 && parts[i + 1] === 5 && parts[i + 2] != null) {
        styles.push(`background-color:${COLOR_256[parts[i + 2]] ?? "#1e1e2e"}`);
        i += 2;
      } else if (code === 48 && parts[i + 1] === 2 && parts[i + 4] != null) {
        styles.push(`background-color:rgb(${parts[i + 2]},${parts[i + 3]},${parts[i + 4]})`);
        i += 4;
      } else if (fgMap[String(code)]) {
        styles.push(`color:${fgMap[String(code)]}`);
      } else if (bgMap[String(code)]) {
        styles.push(`background-color:${bgMap[String(code)]}`);
      }
      i++;
    }

    return styles.length > 0 ? `<span style="${styles.join(";")}">` : "</span>";
  });

  html = html.replace(/\x1b\[[^m]*m/g, "");
  html = html.replace(/\x1b\].*?\x07/g, "");

  return html;
}

for (const [name, component] of Object.entries(screens)) {
  const ansiOutput = renderToString(component, { columns: COLS });
  const htmlContent = ansiToHtml(ansiOutput);

  const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${name}</title>
<style>
  body { margin: 0; padding: 20px; background: #1e1e2e; display: flex; justify-content: center; }
  .terminal {
    font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace;
    font-size: 14px; line-height: 1.5; color: #cdd6f4;
    background: #1e1e2e; border: 2px solid #313244;
    border-radius: 8px; padding: 16px; max-width: ${COLS}ch;
    white-space: pre; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
</style></head>
<body><div class="terminal">${htmlContent}</div></body></html>`;

  writeFileSync(`${SCREENSHOTS_DIR}/${name}.html`, fullHtml);
  console.log(`Captured: ${name}`);
}

console.log(`\nAll screens captured to ${SCREENSHOTS_DIR}/`);
