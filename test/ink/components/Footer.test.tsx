import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "ink-testing-library";
import React from "react";
import { Footer } from "../../../src/ink/components/Footer.js";

describe("Footer", () => {
  afterEach(() => cleanup());

  it("renders navigation hints", () => {
    const { lastFrame } = render(<Footer />);
    expect(lastFrame()).toContain("navigate");
    expect(lastFrame()).toContain("select");
    expect(lastFrame()).toContain("quit");
  });
});
