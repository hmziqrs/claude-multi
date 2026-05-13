import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "ink-testing-library";
import React from "react";
import { Header } from "../../../src/ink/components/Header.js";

describe("Header", () => {
  afterEach(() => cleanup());

  it("renders title", () => {
    const { lastFrame } = render(<Header title="Claude Multi" />);
    expect(lastFrame()).toContain("Claude Multi");
  });

  it("renders subtitle when provided", () => {
    const { lastFrame } = render(<Header title="Test" subtitle="v1" />);
    expect(lastFrame()).toContain("Test");
    expect(lastFrame()).toContain("v1");
  });

  it("renders without subtitle", () => {
    const { lastFrame } = render(<Header title="Solo" />);
    expect(lastFrame()).toContain("Solo");
  });
});
