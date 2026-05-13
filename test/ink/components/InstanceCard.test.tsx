import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "ink-testing-library";
import React from "react";
import { InstanceCard } from "../../../src/ink/components/InstanceCard.js";

describe("InstanceCard", () => {
  afterEach(() => cleanup());

  const baseInstance = {
    name: "test-instance",
    configDir: "/home/.claude-test",
    binaryPath: "/home/.local/bin/claude-test",
    createdAt: new Date().toISOString(),
    autoSync: true,
  };

  it("renders instance name", () => {
    const { lastFrame } = render(<InstanceCard instance={baseInstance} />);
    expect(lastFrame()).toContain("test-instance");
  });

  it("shows auto-sync enabled", () => {
    const { lastFrame } = render(<InstanceCard instance={baseInstance} />);
    expect(lastFrame()).toContain("synced");
  });

  it("shows auto-sync disabled", () => {
    const inst = { ...baseInstance, autoSync: false };
    const { lastFrame } = render(<InstanceCard instance={inst} />);
    expect(lastFrame()).toContain("manual");
  });

  it("renders binary path", () => {
    const { lastFrame } = render(<InstanceCard instance={baseInstance} />);
    expect(lastFrame()).toContain("/home/.local/bin/claude-test");
  });

  it("renders config dir", () => {
    const { lastFrame } = render(<InstanceCard instance={baseInstance} />);
    expect(lastFrame()).toContain("/home/.claude-test");
  });
});
