import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "ink-testing-library";
import React from "react";
import { Box, Text } from "ink";
import { Header } from "@/ink/components/Header";
import { Footer } from "@/ink/components/Footer";
import { InstanceCard } from "@/ink/components/InstanceCard";
import { StatusBar } from "@/ink/components/StatusBar";
import { StepIndicator } from "@/ink/components/StepIndicator";

describe("Ink Rendered Frame Tests", () => {
  afterEach(() => cleanup());

  it("renders main menu with instances", () => {
    const instances = [
      { name: "glm", configDir: "/home/.claude-glm", binaryPath: "/home/.local/bin/claude-glm", createdAt: "2025-01-01T00:00:00.000Z", autoSync: true },
      { name: "g2", configDir: "/home/.claude-g2", binaryPath: "/home/.local/bin/claude-g2", createdAt: "2025-06-01T00:00:00.000Z", autoSync: false },
    ];

    const { lastFrame } = render(
      <Box flexDirection="column" padding={1}>
        <Header title="🤖 Claude Multi" subtitle="Interactive Mode" />
        <Box marginBottom={1}>
          <Text dimColor>{instances.length} instance(s): {instances.map((i) => i.name).join(", ")}</Text>
        </Box>
        <Footer />
      </Box>,
    );

    const frame = lastFrame();
    expect(frame).toContain("Claude Multi");
    expect(frame).toContain("2 instance(s): glm, g2");
  });

  it("renders instance listing with cards", () => {
    const instances = [
      { name: "glm", configDir: "/home/.claude-glm", binaryPath: "/home/.local/bin/claude-glm", createdAt: "2025-01-01T00:00:00.000Z", autoSync: true },
    ];

    const { lastFrame } = render(
      <Box flexDirection="column" padding={1}>
        <Header title="📋 All Instances" />
        <Text bold>Found {instances.length} instance(s):</Text>
        {instances.map((inst) => (
          <InstanceCard key={inst.name} instance={inst} />
        ))}
      </Box>,
    );

    const frame = lastFrame();
    expect(frame).toContain("glm");
    expect(frame).toContain("synced");
    expect(frame).toMatch(/[╭╮╰╯│─]/);
  });

  it("renders instance detail with bordered info", () => {
    const instance = {
      name: "glm",
      configDir: "/home/.claude-glm",
      binaryPath: "/home/.local/bin/claude-glm",
      createdAt: "2025-01-01T00:00:00.000Z",
      autoSync: true,
    };

    const { lastFrame } = render(
      <Box flexDirection="column" padding={1}>
        <Header title="ℹ️ Instance Details" />
        <Box borderStyle="round" borderColor="cyan" paddingX={1}>
          <Text bold color="cyan">{instance.name}</Text>
        </Box>
        <Box borderStyle="single" borderColor="gray" paddingX={1} flexDirection="column">
          <Box gap={2}><Text dimColor bold>Binary:</Text><Text>{instance.binaryPath}</Text></Box>
          <Box gap={2}><Text dimColor bold>Config:</Text><Text>{instance.configDir}</Text></Box>
          <Box gap={2}><Text dimColor bold>Auto-sync:</Text><Text color="green">✓ Enabled</Text></Box>
        </Box>
      </Box>,
    );

    const frame = lastFrame();
    expect(frame).toContain("glm");
    expect(frame).toContain("✓ Enabled");
    expect(frame).toMatch(/[╭╮╰╯│─]/);
  });

  it("renders remove confirmation with warning border", () => {
    const { lastFrame } = render(
      <Box flexDirection="column" padding={1}>
        <Header title="🗑️ Remove Instance" />
        <Box borderStyle="round" borderColor="red" paddingX={1} flexDirection="column">
          <Text bold color="red">⚠ About to remove 'glm'</Text>
        </Box>
        <Box borderStyle="single" borderColor="gray" paddingX={1} flexDirection="column">
          <Box gap={2}><Text dimColor bold>Binary:</Text><Text dimColor>/home/.local/bin/claude-glm</Text></Box>
          <Box gap={2}><Text dimColor bold>Config:</Text><Text dimColor>/home/.claude-glm</Text></Box>
        </Box>
      </Box>,
    );

    const frame = lastFrame();
    expect(frame).toContain("About to remove");
    expect(frame).toContain("glm");
  });

  it("renders success status with border", () => {
    const { lastFrame } = render(
      <Box flexDirection="column" gap={1}>
        <StatusBar message="Instance 'test' created successfully!" type="success" />
        <Box borderStyle="single" borderColor="gray" paddingX={1} flexDirection="column">
          <Box gap={2}><Text dimColor bold>Binary:</Text><Text>/home/.local/bin/claude-test</Text></Box>
          <Box gap={2}><Text dimColor bold>Config:</Text><Text>/home/.claude-test</Text></Box>
        </Box>
      </Box>,
    );

    const frame = lastFrame();
    expect(frame).toContain("✓");
    expect(frame).toContain("created successfully");
  });

  it("renders footer with navigation hints", () => {
    const { lastFrame } = render(<Footer />);
    const frame = lastFrame();
    expect(frame).toContain("navigate");
    expect(frame).toContain("select");
    expect(frame).toContain("back");
    expect(frame).toContain("quit");
    expect(frame).toContain("↑↓");
  });

  it("renders MCP server details with borders", () => {
    const { lastFrame } = render(
      <Box flexDirection="column" padding={1}>
        <Header title="⚙️ Manage MCP Servers" />
        <Box marginLeft={2} flexDirection="column">
          <Box gap={1}><Text bold color="cyan">context7</Text><Text color="green">✓</Text></Box>
          <Box gap={2}><Text dimColor bold>Type:</Text><Text>http</Text></Box>
          <Box gap={2}><Text dimColor bold>URL:</Text><Text>https://api.context7.com</Text></Box>
        </Box>
      </Box>,
    );

    const frame = lastFrame();
    expect(frame).toContain("context7");
    expect(frame).toContain("✓");
    expect(frame).toMatch(/[╭╮╰╯│─]/);
  });

  it("renders empty state", () => {
    const { lastFrame } = render(
      <Box flexDirection="column" padding={1}>
        <Header title="📋 All Instances" />
        <Text color="yellow">No instances found.</Text>
      </Box>,
    );
    expect(lastFrame()).toContain("No instances found");
  });

  it("renders goodbye", () => {
    const { lastFrame } = render(<Box padding={1}><Text dimColor>👋 Goodbye!</Text></Box>);
    expect(lastFrame()).toContain("Goodbye!");
  });
});
