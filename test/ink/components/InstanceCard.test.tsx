import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "ink-testing-library";
import React from "react";
import { InstanceCard } from "@/ink/components/InstanceCard";

describe("InstanceCard", () => {
  afterEach(() => cleanup());

  const baseInstance = {
    name: "test-instance",
    configDir: "/home/.claude-test",
    binaryPath: "/home/.local/bin/claude-test",
    createdAt: new Date().toISOString(),
    autoSync: true,
    syncMode: "auto" as const,
    createdWithVersion: "0.8.1",
  };

  it("renders instance name", () => {
    const { lastFrame } = render(<InstanceCard instance={baseInstance} />);
    expect(lastFrame()).toContain("test-instance");
  });

  it("shows auto-sync mode", () => {
    const { lastFrame } = render(<InstanceCard instance={baseInstance} />);
    expect(lastFrame()).toContain("auto");
  });

  it("shows half-manual mode", () => {
    const inst = { ...baseInstance, autoSync: false, syncMode: "half-manual" as const };
    const { lastFrame } = render(<InstanceCard instance={inst} />);
    expect(lastFrame()).toContain("half-manual");
  });

  it("shows full-manual mode", () => {
    const inst = { ...baseInstance, autoSync: false, syncMode: "full-manual" as const };
    const { lastFrame } = render(<InstanceCard instance={inst} />);
    expect(lastFrame()).toContain("full-manual");
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
