import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "ink-testing-library";
import React from "react";
import { StatusBar } from "@/ink/components/StatusBar";

describe("StatusBar", () => {
  afterEach(() => cleanup());

  it("renders success message", () => {
    const { lastFrame } = render(<StatusBar message="Done!" type="success" />);
    expect(lastFrame()).toContain("Done!");
    expect(lastFrame()).toContain("✓");
  });

  it("renders error message", () => {
    const { lastFrame } = render(<StatusBar message="Failed" type="error" />);
    expect(lastFrame()).toContain("Failed");
    expect(lastFrame()).toContain("✗");
  });

  it("renders warning message", () => {
    const { lastFrame } = render(<StatusBar message="Careful" type="warning" />);
    expect(lastFrame()).toContain("Careful");
    expect(lastFrame()).toContain("⚠");
  });

  it("defaults to info type", () => {
    const { lastFrame } = render(<StatusBar message="Note" />);
    expect(lastFrame()).toContain("Note");
    expect(lastFrame()).toContain("ℹ");
  });
});
