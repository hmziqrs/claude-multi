import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "ink-testing-library";
import React from "react";
import { Box, Text } from "ink";
import { Header } from "../../../src/ink/components/Header.js";
import { InstanceCard } from "../../../src/ink/components/InstanceCard.js";

describe("Ink Visual Snapshot Tests", () => {
  afterEach(() => cleanup());

  it("renders Header with border", () => {
    const { lastFrame } = render(<Header title="🤖 Claude Multi" />);
    const output = lastFrame();
    expect(output).toContain("🤖 Claude Multi");
    // Should have border characters
    expect(output).toMatch(/[│┌┐└┘─]/);
  });

  it("renders full instance listing", () => {
    const instances = [
      {
        name: "glm",
        configDir: "/home/.claude-glm",
        binaryPath: "/home/.local/bin/claude-glm",
        createdAt: "2025-01-01T00:00:00.000Z",
        autoSync: true,
      },
      {
        name: "g2",
        configDir: "/home/.claude-g2",
        binaryPath: "/home/.local/bin/claude-g2",
        createdAt: "2025-06-01T00:00:00.000Z",
        autoSync: false,
      },
    ];

    const { lastFrame } = render(
      <Box flexDirection="column" gap={1}>
        <Header title="📋 All Instances" />
        <Text bold>Found 2 instance(s):</Text>
        {instances.map((inst) => (
          <InstanceCard key={inst.name} instance={inst} />
        ))}
      </Box>,
    );

    const output = lastFrame();
    expect(output).toContain("glm");
    expect(output).toContain("g2");
    expect(output).toContain("synced");
    expect(output).toContain("manual");
    expect(output).toContain("2 instance");
  });

  it("renders add instance form header", () => {
    const { lastFrame } = render(<Header title="➕ Add New Instance" />);
    expect(lastFrame()).toContain("Add New Instance");
  });

  it("renders empty state", () => {
    const { lastFrame } = render(
      <Box flexDirection="column">
        <Header title="📋 All Instances" />
        <Text color="yellow">No instances found.</Text>
        <Text dimColor>Choose 'Add new instance' to create one.</Text>
      </Box>,
    );
    expect(lastFrame()).toContain("No instances found");
  });

  it("renders instance detail view", () => {
    const instance = {
      name: "glm",
      configDir: "/home/.claude-glm",
      binaryPath: "/home/.local/bin/claude-glm",
      createdAt: "2025-01-01T00:00:00.000Z",
      autoSync: true,
    };

    const { lastFrame } = render(
      <Box flexDirection="column" gap={1}>
        <Header title="ℹ️ Instance Details" />
        <Text bold>
          Instance: <Text color="cyan">{instance.name}</Text>
        </Text>
        <Text dimColor>Binary:    {instance.binaryPath}</Text>
        <Text dimColor>Config:    {instance.configDir}</Text>
        <Text dimColor>
          Auto-sync:{" "}
          <Text color="green">✓ Enabled</Text>
        </Text>
      </Box>,
    );

    const output = lastFrame();
    expect(output).toContain("glm");
    expect(output).toContain("/home/.local/bin/claude-glm");
    expect(output).toContain("✓ Enabled");
  });

  it("renders MCP server details", () => {
    const { lastFrame } = render(
      <Box flexDirection="column" gap={1}>
        <Header title="⚙️ Manage MCP Servers" />
        <Text dimColor>  • context7: http</Text>
        <Text dimColor>    URL: https://api.context7.com</Text>
        <Text color="green">    ✓ Configuration looks valid</Text>
        <Text dimColor>  • playwright: stdio</Text>
        <Text dimColor>    Command: npx @playwright/mcp</Text>
        <Text color="green">    ✓ Configuration looks valid</Text>
      </Box>,
    );

    const output = lastFrame();
    expect(output).toContain("context7");
    expect(output).toContain("playwright");
    expect(output).toContain("✓ Configuration looks valid");
  });

  it("renders symlink fix results", () => {
    const results = [
      { name: "glm", broken: ["plugins"], all: ["plugins", "skills"], fixed: true },
      { name: "g2", broken: [], all: ["plugins", "skills"], fixed: true },
    ];

    const { lastFrame } = render(
      <Box flexDirection="column" gap={1}>
        <Header title="🔄 Re-sync Symlinks" />
        {results.map((r) => (
          <Box key={r.name} flexDirection="column">
            <Text bold>🔍 {r.name}</Text>
            {r.broken.length > 0 ? (
              <Text color="green">  ✅ Fixed: {r.broken.join(", ")}</Text>
            ) : (
              <Text color="green">  ✅ All symlinks OK: {r.all.join(", ")}</Text>
            )}
          </Box>
        ))}
        <Text bold>✨ Done!</Text>
      </Box>,
    );

    const output = lastFrame();
    expect(output).toContain("✅ Fixed: plugins");
    expect(output).toContain("✅ All symlinks OK");
    expect(output).toContain("✨ Done!");
  });
});
