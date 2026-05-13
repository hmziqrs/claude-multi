import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "ink-testing-library";
import React from "react";
import { StepIndicator } from "../../../src/ink/components/StepIndicator.js";

describe("StepIndicator", () => {
  afterEach(() => cleanup());

  it("renders step info", () => {
    const { lastFrame } = render(
      <StepIndicator current={2} total={4} label="Provider" />,
    );
    expect(lastFrame()).toContain("Step 2/4");
    expect(lastFrame()).toContain("Provider");
  });

  it("renders first step", () => {
    const { lastFrame } = render(
      <StepIndicator current={1} total={3} label="Name" />,
    );
    expect(lastFrame()).toContain("Step 1/3");
  });
});
